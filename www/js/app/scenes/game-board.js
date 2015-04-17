/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/scenes/scene', 'app/graphics'], 
		function(Util, Scene, Graphics) {
	
	return new Scene({
		 background: null,

		 drawFrame: function(delta) {
		 	Graphics.circle(Graphics.width() / 2, Graphics.height() / 2, Graphics.width() / 2, 'background');
		 }
	});
});