/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/theme-store', 'app/scaler-store'], function(Util, ThemeStore, ScalerStore) {
	
	var _canvas
	, _canvasEl
	, _options = {
		width: 480,
		height: 640,
		scalingMode: 'javascript'
	}
	, _scaler = null
	, _theme = ThemeStore.getTheme()
	, _globalAlpha = 1
	;

	function _init(options) {
		_options = Util.merge(_options, options);
		_scaler = ScalerStore.get(_options.scalingMode || 'native');
		_initCanvas();
		window.addEventListener('resize', _initCanvas);
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
		, heightScale = window.innerHeight / _options.height		
		;

		if (!_canvas) {
			// Create the context to draw the game
			_canvasEl = _newCanvas(_options.width, _options.height, 'radum-canvas');
			document.body.appendChild(_canvasEl);
			_canvas = _canvasEl.getContext('2d');

			_canvas.save();
		}

		// Apply proper scale
		_scaler.setScale(widthScale < heightScale ? widthScale : heightScale);
		_scaler.scaleCanvas(_canvasEl);
	}

	function _getScaler() {
		return _scaler;
	}

	function _clear() {
		_canvas.clearRect(0, 0, _scaler.scaleValue(_options.width), _scaler.scaleValue(_options.height));
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

	function _drawText(text, x, y, fontSize, colour, borderColour, align) {
		_canvas.globalAlpha = this._globalAlpha;
		colour = colour || 'negative';
		// General text rules
		_canvas.textAlign = align || 'center';
		_canvas.textBaseline = 'middle';
		// _canvas.font = _scaler.scaleValue(fontSize) + 'px Arial, Helvetica, sans-serif';
		_canvas.font = _scaler.scaleValue(fontSize) + 'px montserratregular';
		if (borderColour) {
			_canvas.fillStyle = _theme[borderColour];
			_canvas.fillText(text, _scaler.scaleValue(x + 2), _scaler.scaleValue(y + 2));
		}
		_canvas.fillStyle = _theme[colour];
		_canvas.fillText(text, _scaler.scaleValue(x), _scaler.scaleValue(y));
	}

	function _setBackground(colour) {
		document.body.style.background = colour ? _theme[colour] : 'transparent';
	}

	function _drawCircle(x, y, radius, colour, borderColour, borderWidth, alpha, specialBorder, clipToBoard) {
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
			_canvas.arc(_scaler.scaleValue(x), _scaler.scaleValue(y), _scaler.scaleValue(circleWidth), 0, 2 * Math.PI, false);
			_canvas.fillStyle = _theme[colour];
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
			_canvas.arc(_scaler.scaleValue(x), _scaler.scaleValue(y), _scaler.scaleValue(borderRadius), 0, 2 * Math.PI, false);
			_canvas.lineWidth = _scaler.scaleValue(borderWidth);
			_canvas.strokeStyle = _theme[borderColour];
			_canvas.stroke();
			if (specialBorder) {
				_canvas.globalCompositeOperation = 'source-over';
			}
		}
		_canvas.globalAlpha = this._globalAlpha;
	}

	function _drawRect(x, y, width, height, colour) {
		colour = colour || 'negative';
		_canvas.globalAlpha = this._globalAlpha;
		_canvas.beginPath();
		_canvas.fillStyle = null;
		_canvas.strokeStyle = _theme[colour];
		_canvas.lineWidth = _scaler.scaleValue(2);
		_canvas.rect(_scaler.scaleValue(x), _scaler.scaleValue(y), _scaler.scaleValue(width), _scaler.scaleValue(height));
		_canvas.stroke();
	}

	function _setAlpha(alpha) {
		this._globalAlpha = alpha;
		_canvas.globalAlpha = alpha;
	}

	function _clipToBoard() {
		var boardCenter = require('app/engine').BOARD_CENTER
		, boardRadius = require('app/engine').BOARD_RADIUS
		;

		_canvas.beginPath();
		_canvas.arc(
			_scaler.scaleValue(boardCenter.x), 
			_scaler.scaleValue(boardCenter.y),
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
		circle: _drawCircle,
		rect: _drawRect
	};
});