/**
 *	Javascript Scaler
 *  scales programmatically
 *	(c) doublespeak games 2015	
 **/
define(['app/scalers/scaler'], function(Scaler){

	var _scaleSheet = null
	, _verticalPad = 0
	; 

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

			// Pad the vertical to the bottom
			if (G.realHeight() > scaledHeight) {
				_verticalPad = scaledHeight;
				scaledHeight += (G.realHeight() - scaledHeight) / 2;
				_verticalPad = scaledHeight - _verticalPad;
			}

			// Size and position the canvas
			canvas.width = scaledWidth * this._pixelRatio;
			canvas.height = scaledHeight * this._pixelRatio;
			canvas.getContext("2d").setTransform(this._pixelRatio, 0, 0, this._pixelRatio, 0, 0);
			_addStyleRule(_scaleSheet, '.radum-canvas', 
				'width:' + scaledWidth + 'px;' + 
				'height:' + scaledHeight + 'px;' +
				'position: absolute;' +
				'top: ' + (G.realHeight() - scaledHeight) + 'px;' +
				'left: 50%;' +
				'margin-left: -' + Math.round(scaledWidth / 2) + 'px;'
			);
		},

		scaleValue: function(value) { 
			return Math.round(value * this._scale); 
		},

		scalePoint: function(point, fromBottom) {

			point = {
				x: this.scaleValue(point.x),
				y: this.scaleValue(point.y)
			};

			// Support positioning from bottom
			if (fromBottom) {
				point.y = require('app/graphics').realHeight() - _verticalPad - point.y;
			}

			return point;
		},

		getCorner: function() {
			return this.scalePoint({ x: require('app/graphics').width(), y: 0 }, true);
		}
	});
});