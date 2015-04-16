/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/
define(['app/util'], function(Util) {
	
	var _viewScale = 1
	, _scaleSheet
	, _canvas
	, _canvasEl
	, _options = {
		width: 720,
		height: 1280,
		scaling: true
	}
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

	return {
		init: _init
	};
});