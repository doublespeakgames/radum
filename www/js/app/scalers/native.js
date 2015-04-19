/**
 *	Native Scaler
 *  no scaling at all!
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
			// Translate origin to top-left corner of canvas
			var G = require('app/graphics');
			coords.x -= (G.realWidth() - G.width()) / 2;
			coords.y -= (G.realHeight() - G.height()) / 2;
		},

		scaleCanvas: function(canvas) {
			if (!_scaleSheet) {
				var G = require('app/graphics');
				
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

			}
		}
	});
});