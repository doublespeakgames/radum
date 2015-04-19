/**
 *	Javascript Scaler
 *  scales programmatically
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

			// Scale
			coords.x /= this._scale;
			coords.y /= this._scale;

			// Translate origin to top-left of canvas
			coords.x += G.width() / 2;
		},

		scaleCanvas: function(canvas) {
			var G = require('app/graphics')
			, scaledHeight = Math.round(G.height() * this._scale)
			, scaledWidth = Math.round(G.width() * this._scale)
			;

			if (!_scaleSheet) {
				// Create stylesheet
				_scaleSheet = document.createElement('style');
				_scaleSheet.id = 'radum-scalesheet';
				_scaleSheet.appendChild(document.createTextNode('')); // Stupid Webkit
				document.head.appendChild(_scaleSheet);
				_scaleSheet = _scaleSheet.sheet;
			} else {
				// Delete old scale
				_scaleSheet.deleteRule(0);
			}

			// Size and center the canvas
			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			_addStyleRule(_scaleSheet, '.radum-canvas', 
				'width:' + scaledWidth + 'px;' + 
				'height:' + scaledHeight + 'px;' +
				'position: absolute;' +
				'top: 50%;' +
				'left: 50%;' +
				'margin-top: -' + Math.round(scaledHeight / 2) + 'px;' +
				'margin-left: -' + Math.round(scaledWidth / 2) + 'px;'
			);
		},

		scaleValue: function(value) { 
			return Math.round(value * this._scale); 
		}
	});
});