/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/theme-store'], function(Util, ThemeStore) {
	
	var _viewScale = 1
	, _scaleSheet
	, _canvas
	, _canvasEl
	, _options = {
		width: 720,
		height: 1280,
		scaling: true
	}
	, _theme = ThemeStore.getTheme()
	;

	function _init(options) {
		_options = Util.merge(_options, options);
		_initCanvas();
		window.addEventListener('resize', _initCanvas);
	}

	function _addStyleRule(sheet, selector, rules) {
		if (sheet.addRule) {
			// Non-standard IE
			sheet.addRule(selector, rules);
		} else {
			// Everyone else
			sheet.insertRule(selector + '{' + rules + '}', sheet.cssRules.length);
		}
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

			// General text rules
			_canvas.textAlign = 'center';
			_canvas.textBaseline = 'middle';

			_canvas.save();
		}
		if (!_scaleSheet) {

			// Create stylesheet
			_scaleSheet = document.createElement('style');
			_scaleSheet.id = 'radum-scalesheet';
			_scaleSheet.appendChild(document.createTextNode('')); // Stupid Webkit
			document.head.appendChild(_scaleSheet);
			_scaleSheet = _scaleSheet.sheet;

			// Add canvas size to sheet
			_addStyleRule(_scaleSheet, '.radum-canvas', 
				'width:' + _options.width + 'px;' + 
				'height:' + _options.height + 'px;' +
				'position: absolute;' +
				'top: 50%;' +
				'left: 50%;' +
				'margin-top: -' + _options.height / 2 + 'px;' +
				'margin-left: -' + _options.width / 2 + 'px;');

		} else {
			// Delete old scale
			_scaleSheet.deleteRule(1);
		}

		if (!_options.scaling) {
			_viewScale = 1;
		} else {
			_viewScale = widthScale < heightScale ? widthScale : heightScale;
		}
		_addStyleRule(_scaleSheet, '.radum-canvas',
			'transform-origin: 50% 50% 0;' +
			'-webkit-transform-origin: 50% 50% 0;' +
			'-moz-transform-origin: 50% 50% 0;' +
			'-ms-transform-origin: 50% 50% 0;' +
			'-o-transform-origin: 50% 50% 0;' +
			'transform: scale(' + _viewScale +');' +
			'-webkit-transform: scale(' + _viewScale +');' +
			'-moz-transform: scale(' + _viewScale +');' +
			'-ms-transform: scale(' + _viewScale +');' +
			'-o-transform: scale(' + _viewScale +');'
		);
	}

	function _scaleCoords(x, y) {
		// Translate origin to horizontal-middle
		x -= window.innerWidth / 2;

		// Scale
		x /= _viewScale;
		y /= _viewScale;

		// Translate origin to top-left of canvas
		x += _options.width / 2;

		return {x: x, y: y};
	}

	function _clear() {
		_canvas.clearRect(0, 0, _options.width, _options.height);
	}

	function _getWidth() {
		return _options.width;
	}

	function _getHeight() {
		return _options.height;
	}

	function _drawText(text, x, y, fontSize, colour) {
		colour = colour || '#FFFFFF';
		_canvas.font = fontSize + 'px Arial, Helvetica, sans-serif';
		_canvas.fillStyle = colour;
		_canvas.fillText(text, x, y);
	}

	function _setBackground(colour) {
		document.body.style.background = colour ? _theme[colour] : 'transparent';
	}

	function _drawCircle(x, y, radius, colour, borderColour) {		
		_canvas.arc(x, y, radius, 0, 2 * Math.PI, false);
		_canvas.fillStyle = _theme[colour];
		_canvas.fill();
		if (borderColour) {
			_canvas.lineWidth = 5;
			_canvas.strokeStyle = _theme[borderColour];
			_canvas.stroke();
		}
	}

	function _drawRect(x, y, width, height, colour) {
		_canvas.beginPath();
		_canvas.fillStyle = null;
		_canvas.strokeStyle = colour ? _theme[colour] : '#FFFFFF';
		_canvas.lineWidth = 2;
		_canvas.rect(x, y, width, height);
		_canvas.stroke();
	}

	return {
		init: _init,
		scaleCoords: _scaleCoords,
		clear: _clear,
		width: _getWidth,
		height: _getHeight,
		setBackground: _setBackground,
		text: _drawText,
		circle: _drawCircle,
		rect: _drawRect
	};
});