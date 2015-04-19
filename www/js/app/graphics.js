/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/theme-store', 'app/scaler-store'], function(Util, ThemeStore, ScalerStore) {
	
	var _viewScale = 1
	, _scaleSheet
	, _canvas
	, _canvasEl
	, _options = {
		width: 360,
		height: 640,
		scalingMode: 'css'
	}
	, _scaler = null
	, _theme = ThemeStore.getTheme()
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

			// General text rules
			_canvas.textAlign = 'center';
			_canvas.textBaseline = 'middle';

			_canvas.save();
		}

		// Apply proper scale
		_scaler.setScale(widthScale < heightScale ? widthScale : heightScale);
		_scaler.scaleCanvas(_canvas);
	}

	function _scaleCoords(coords) {
		_scaler.scaleCoords(coords);
		console.log(coords);
		return coords;
	}

	function _clear() {
		_canvas.clearRect(0, 0, _options.width, _options.height);
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
		_canvas.beginPath();
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
		realWidth: _getWindowWidth,
		realHeight: _getWindowHeight,
		setBackground: _setBackground,
		text: _drawText,
		circle: _drawCircle,
		rect: _drawRect
	};
});