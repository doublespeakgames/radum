/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/theme-store', 'app/scaler-store', 'app/tween', 'app/promise'], 
		function(Util, ThemeStore, ScalerStore, Tween, Promise) {
	
	var COLOR_TRANSITION_REGEX = /(.+)->(.+);(\d+)/;

	var _canvas
	, 	_canvasEl
	, 	_options = {
			width: 480,
			height: 640,
			scalingMode: 'javascript'
		}
	, 	_scaler = null
	, 	_theme = ThemeStore.getTheme()
	, 	_globalAlpha = 1
	, 	_suppressResize = false
	,	_scaleDisabled = false
	;

	function _init(options) {
		_options = Util.merge(_options, options);
		_scaler = ScalerStore.get(_options.scalingMode || 'native');
		_suppressResize = false;
		_initCanvas();
		window.addEventListener('resize', _initCanvas);

		return Promise.resolve(true);
	}

	function _newCanvas(width, height, className) {
		var canvasEl = document.createElement('canvas');
		canvasEl.width = width;
		canvasEl.height = height;
		canvasEl.className = className;

		return canvasEl;
	}

	function _initCanvas() {

		var widthScale = window.innerWidth / _options.width
		,	heightScale = window.innerHeight / _options.height
		,	devicePixelRatio
		,	canvasPixelRatio
		;

		if (_suppressResize) {
			return;
		}

		if (!_canvas) {
			// Create the context to draw the game
			_canvasEl = _newCanvas(_options.width, _options.height, 'radum-canvas');
			document.body.insertBefore(_canvasEl, document.body.firstChild);
			_canvas = _canvasEl.getContext('2d');

			_canvas.save();
		}

		devicePixelRatio = window.devicePixelRatio || 1,
        canvasPixelRatio = _canvas.webkitBackingStorePixelRatio ||
			               _canvas.mozBackingStorePixelRatio ||
			               _canvas.msBackingStorePixelRatio ||
			               _canvas.oBackingStorePixelRatio ||
			               _canvas.backingStorePixelRatio || 1;
        _pixelRatio = devicePixelRatio / canvasPixelRatio;

		// Apply proper scale
		_scaler.setScale(
			widthScale < heightScale ? widthScale : heightScale, 
			_pixelRatio
		);
		_scaler.scaleCanvas(_canvasEl);
	}

	function _getScaler() {
		return _scaler;
	}

	function _clear(colour) {
		var p = _scaler.getCorner();
		if (colour) {
			_canvas.fillStyle = _colour(colour);
			_canvas.fillRect(0, 0, p.x, p.y);
		} else {
			_canvas.clearRect(0, 0, p.x, p.y);
		}
	}

	function _getWindowWidth() {
		return window.innerWidth;
	}

	function _getWindowHeight() {
		return window.innerHeight;
	}

	function _getWidth() {
		return _options.width;
	}

	function _getHeight() {
		return _options.height;
	}

	function _blendColours(start, end, progress) {

		if (progress === 0) {
			return start;
		}

		if (progress === 100) {
			return end;
		}

		start = _hexToRgb(start);
		end = _hexToRgb(end);
		progress /= 100;

		return _rgbToHex(
			start.r + Math.round((end.r - start.r) * progress),
			start.g + Math.round((end.g - start.g) * progress),
			start.b + Math.round((end.b - start.b) * progress)
		);
	}

	function _hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function _componentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	function _rgbToHex(r, g, b) {
	    return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
	}

	function _colour(cName) {
		var colourInfo = cName.split(':')
		,	colour = colourInfo[0]
		,	themeIndex = colourInfo[1]
		,	theme = themeIndex != null ? ThemeStore.getTheme(themeIndex) : _theme
		,	transitionMatch = COLOR_TRANSITION_REGEX.exec(colour)
		;

		if (transitionMatch) {
			return _blendColours(
				theme[transitionMatch[1]], 
				theme[transitionMatch[2]],
				parseInt(transitionMatch[3], 10)
			);
		}

		return theme[colour];
	}

	function _textWidth(text, fontSize) {
		_canvas.font = fontSize + 'px montserratregular';
		return _canvas.measureText(text).width;
	}

	function _drawText(text, x, y, fontSize, colour, borderColour, align, fromBottom, alpha) {
		var point = _scaleDisabled ? {x: x, y: y} : _scaler.scalePoint({x: x, y: y}, fromBottom)
		,	bPoint = _scaleDisabled ? {x: x + 2, y: y + 2} : _scaler.scalePoint({x: x + 2, y: y + 2}, fromBottom)
		,	fontSize = _scaleDisabled ? fontSize : _scaler.scaleValue(fontSize)
		;

		alpha = alpha == null ? 1 : alpha;

		_canvas.globalAlpha = alpha * this._globalAlpha;
		colour = colour || 'negative';
		// General text rules
		_canvas.textAlign = align || 'center';
		_canvas.textBaseline = 'middle';		
		_canvas.font = fontSize + 'px montserratregular';
		if (borderColour) {
			_canvas.fillStyle = _colour(borderColour);
			_canvas.fillText(text, bPoint.x, bPoint.y);
		}
		_canvas.fillStyle = _colour(colour);
		_canvas.fillText(text, point.x, point.y);

		_canvas.globalAlpha = this._globalAlpha;
	}

	function _setBackground(colour) {
		document.body.style.background = colour ? _colour(colour) : 'transparent';
	}

	function _drawStretchedCircle(x, y, radius, stretchWidth, colour, alpha) {
		var point = _scaleDisabled ? {x: x, y: y} :  _scaler.scalePoint({x: x, y: y})
		,	radius = _scaleDisabled ? radius : _scaler.scaleValue(radius)
		,	stretchWidth = _scaleDisabled ? stretchWidth / 2 : _scaler.scaleValue(stretchWidth / 2)
		,   oY = radius * 0.1
		,	oX = radius * 4.0 / 3.0
		;

		alpha = alpha == null ? 1 : alpha;

		_canvas.globalAlpha = alpha * this._globalAlpha;

		_canvas.beginPath();
		_canvas.moveTo(point.x - stretchWidth, point.y + radius);
		_canvas.bezierCurveTo(
			point.x - stretchWidth - oX,
			point.y + radius - oY,
			point.x - stretchWidth - oX,
			point.y - radius + oY,
			point.x - stretchWidth, 
			point.y - radius
		);
		_canvas.lineTo(point.x + stretchWidth, point.y - radius);
		_canvas.bezierCurveTo(
			point.x + stretchWidth + oX, 
			point.y - radius + oY,
			point.x + stretchWidth + oX,
			point.y + radius - oY,
			point.x + stretchWidth, 
			point.y + radius
		);
		_canvas.lineTo(point.x - stretchWidth, point.y + radius);
		_canvas.closePath();

		_canvas.fillStyle = _colour(colour);
		_canvas.fill();

		_canvas.globalAlpha = this._globalAlpha;
	}

	function _drawCircle(x, y, radius, colour, borderColour, borderWidth, alpha, specialBorder, clipToBoard, fromBottom, fixedPos) {
		var point = _scaler.scalePoint({x: x, y: y}, fromBottom, fixedPos);

		alpha = alpha == null ? 1 : alpha;
		borderWidth = borderWidth == null ? 4 : borderWidth;

		var borderRadius = radius - borderWidth / 2;
		circleWidth = radius - (borderColour ? 1 : 0);
		circleWidth = circleWidth < 0 ? 0 : circleWidth;

		_canvas.globalAlpha = alpha * this._globalAlpha;
		if (colour) {
			if (clipToBoard) {
				_canvas.globalCompositeOperation = 'source-atop';
			}
			_canvas.beginPath();
			_canvas.arc(point.x, point.y, _scaler.scaleValue(circleWidth), 0, 2 * Math.PI, false);
			_canvas.fillStyle = _colour(colour);
			_canvas.fill();
			if (clipToBoard) {
				_canvas.globalCompositeOperation = 'source-over';
			}
		}

		if (borderColour) {
			if (specialBorder) {
				_canvas.globalCompositeOperation = 'destination-over';
				borderRadius += borderWidth - 1;
			}
			borderRadius = borderRadius < 0 ? 0 : borderRadius;
			_canvas.beginPath();
			_canvas.arc(point.x, point.y, _scaler.scaleValue(borderRadius), 0, 2 * Math.PI, false);
			_canvas.lineWidth = _scaler.scaleValue(borderWidth);
			_canvas.strokeStyle = _colour(borderColour);
			_canvas.stroke();
			if (specialBorder) {
				_canvas.globalCompositeOperation = 'source-over';
			}
		}
		_canvas.globalAlpha = this._globalAlpha;
	}

	function _drawRect(x, y, width, height, colour, fillColour, borderWidth, opacity, fromBottom) {
		var point = _scaleDisabled ? {x: x, y: y} : _scaler.scalePoint({x: x, y: y}, fromBottom);

		width = _scaleDisabled ? width : _scaler.scaleValue(width);
		height = _scaleDisabled ? height : _scaler.scaleValue(height);
		borderWidth = borderWidth || 2;
		borderWidth = _scaleDisabled ? borderWidth : _scaler.scaleValue(borderWidth);

		colour = colour || 'negative';
		opacity = opacity == null ? 1 : opacity;
		_canvas.globalAlpha = this._globalAlpha * opacity;

		if (fillColour) {
			_canvas.beginPath();
			_canvas.fillStyle = _colour(fillColour);
			_canvas.fillRect(point.x, point.y, width, height);
		}

		_canvas.globalAlpha = this._globalAlpha;

		if (colour !== 'transparent') {
			_canvas.beginPath();
			_canvas.strokeStyle = _colour(colour);
			_canvas.lineWidth = borderWidth;
			_canvas.rect(point.x, point.y, width, height);
			_canvas.stroke();
		}
	}

	function _drawSvg(svg, x, y, size, colour) {
        var img = new Image()
        ,	point = _scaler.scalePoint({x: x, y: y})
        ;

        size = _scaler.scaleValue(size);
        img.height = size;
        img.width = size;
        img.src = 'data:image/svg+xml,' + 
                escape(svg.replace(/{fill}/g, _colour(colour))
                   .replace(/{size}/g, size));
        
		_canvas.drawImage(img, point.x - (img.width / 2), point.y - (img.height / 2));
	}

	function _setAlpha(alpha) {
		this._globalAlpha = alpha;
		_canvas.globalAlpha = alpha;
	}

	function _clipToBoard() {
		var boardCenter = require('app/engine').BOARD_CENTER
		, boardRadius = require('app/engine').BOARD_RADIUS
		;

		boardCenter = _scaler.scalePoint(boardCenter);

		_canvas.beginPath();
		_canvas.arc(
			boardCenter.x, 
			boardCenter.y,
			_scaler.scaleValue(boardRadius),
			0, 2 * Math.PI, false
		);
		_canvas.clip();
	}

	function _save() {
		_canvas.save();
	}

	function _restore() {
		_canvas.restore();
	}

	function _toggleMenu(show) {
		document.body.className = show ? "show-menu" : "";
	}

	function _changeTheme() {
		_theme = ThemeStore.next(_theme);
	}

	function _doSuppressResize(suppress) {
		_suppressResize = suppress;
	}

	return {
		init: _init,
		setAlpha: _setAlpha,
		getScaler: _getScaler,
		clear: _clear,
		save: _save,
		restore: _restore,
		width: _getWidth,
		height: _getHeight,
		realWidth: _getWindowWidth,
		realHeight: _getWindowHeight,
		setBackground: _setBackground,
		clipToBoard: _clipToBoard,
		text: _drawText,
		textWidth: _textWidth,
		circle: _drawCircle,
		rect: _drawRect,
		svg: _drawSvg,
		toggleMenu: _toggleMenu,
		colour: _colour,
		stretchedCircle: _drawStretchedCircle,
		changeTheme: _changeTheme,
		suppressResize: _doSuppressResize,
		disableScaling: function(disabled) { _scaleDisabled = disabled; }
	};
});