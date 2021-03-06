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
		showMenu: false,
		reset: function() {},
		onActivate: function() {},
		onDeactivate: function() {},
		activate: function(param) {
			var newScene = this.onActivate(param);
			if (newScene) {
				return newScene;
			}
			Graphics.setBackground(this.background);
		},
		doFrame: function(delta) {},
		drawFrame: function() {},

		onInputStart: function(coords) {},
		onInputStop: function() {},
		onInputMove: function(coords) {}
	};

	return Scene;
});