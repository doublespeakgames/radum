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
		setScale: function(scale) {
			this._scale = scale;
		},
		scaleValue: function(value) { return value; },
		scaleCoords: function(coords) { return coords; },
		scaleCanvas: function(canvas) {},
		scalePoint: function(point) { return point; }
	};

	return Scaler;
});