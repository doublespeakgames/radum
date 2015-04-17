/**
 *	Scene
 *	base class for representing game scenes
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/graphics'], 
		function(Util, Graphics) {
	
	function Scene(options) {
		Util.merge(this, options);
	}
	Scene.prototype = {
		background: null,
		onActivate: function() {},
		activate: function() {
			Graphics.setBackground(this.background);
			this.onActivate();
		},
		drawFrame: function(delta) {},

		onInputStart: function(coords) {}
	};

	return Scene;
});