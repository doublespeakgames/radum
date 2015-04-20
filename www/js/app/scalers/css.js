/**
 *	CSS Scaler
 *  scale the viewport with CSS transforms
 *	(c) doublespeak games 2015	
 **/
define(['app/scalers/scaler'], function(Scaler){

	var _scaleSheet = null;

	function _addStyleRule(sheet, selector, rules) {
		if (sheet.addRule) {
			// Non-standard IE
			sheet.addRule(selector, rules);
		} else {
			// Everyone else
			sheet.insertRule(selector + '{' + rules + '}', sheet.cssRules.length);
		}
	}

	return new Scaler({
		scaleCoords: function(coords) {
			var G = require('app/graphics');

			// Translate origin to horizontal-middle
			coords.x -= G.realWidth() / 2;
			coords.y -= G.realHeight() / 2;

			// Scale
			coords.x /= this._scale;
			coords.y /= this._scale;

			// Translate origin to top-left of canvas
			coords.x += G.width() / 2;
			coords.y += G.height() / 2;

			return coords;
		},
		scaleCanvas: function(canvas) {
			var G = require('app/graphics');

			if (!_scaleSheet) {

				// Create stylesheet
				_scaleSheet = document.createElement('style');
				_scaleSheet.id = 'radum-scalesheet';
				_scaleSheet.appendChild(document.createTextNode('')); // Stupid Webkit
				document.head.appendChild(_scaleSheet);
				_scaleSheet = _scaleSheet.sheet;

				// Size and center the canvas
				_addStyleRule(_scaleSheet, '.radum-canvas', 
					'width:' + G.width() + 'px;' + 
					'height:' + G.height() + 'px;' +
					'position: absolute;' +
					'top: 50%;' +
					'left: 50%;' +
					'margin-top: -' + G.height() / 2 + 'px;' +
					'margin-left: -' + G.width() / 2 + 'px;');

			} else {
				// Delete old scale
				_scaleSheet.deleteRule(1);
			}

			// Scale the canvas
			_addStyleRule(_scaleSheet, '.radum-canvas',
				'transform-origin: 50% 50% 0;' +
				'-webkit-transform-origin: 50% 50% 0;' +
				'-moz-transform-origin: 50% 50% 0;' +
				'-ms-transform-origin: 50% 50% 0;' +
				'-o-transform-origin: 50% 50% 0;' +
				'transform: scale(' + this._scale +');' +
				'-webkit-transform: scale(' + this._scale +');' +
				'-moz-transform: scale(' + this._scale +');' +
				'-ms-transform: scale(' + this._scale +');' +
				'-o-transform: scale(' + this._scale +');'
			);
		}
	});
});