/**
 *	Scaler
 *	base scaler that does nothing at all
 *	(c) doublespeak games 2015	
 **/
define(['app/util'], function(Util) {
	
	function Scaler(options) {
		Util.merge(this, options);
		this._scale = 1;
	}

	Scaler.prototype = {
		setScale: function(scale, pixelRatio) {
			this._scale = scale;
			this._pixelRatio = pixelRatio || 1;
		},
		scaleValue: function(value) { return value; },
		scaleCoords: function(coords) { return coords; },
		scaleCanvas: function(canvas) {},
		scalePoint: function(point) { return point; },
		scaledWidth: function() {},
		scaledHeight: function() {},
		getCorner: function() { return { x: 0, y: 0 }; },
		suppressScaling: function(suppress) {
			if (suppress) {
				this._savedScale = this._scale;
				this._scale = 1;
			} else if (this._savedScale) {
				this._scale = this._savedScale;
				this._savedScale = null;
			}
		}
	};

	return Scaler;
});