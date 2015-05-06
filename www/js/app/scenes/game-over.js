/**
 *	Game Over Screen
 *	scene for the final score display
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/touch-prompt'], function(Scene, Graphics, TouchPrompt) {

	var _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 550}, 'negative')
	_scores = [0, 0]
	;

	return new Scene({
		background: 'background',

		onActivate: function(scores) {
			_scores = scores;
		},

		doFrame: function(delta) {
			_prompt.do(delta);
		},

		drawFrame: function() {
			Graphics.text(_scores[0], Graphics.width() / 2 - 80, Graphics.height() / 3, 80, 'primary1');
			Graphics.text(_scores[1], Graphics.width() / 2 + 80, Graphics.height() / 3, 80, 'primary2');

			_prompt.draw();
		},

		onInputStart: function(coords) {
			require('app/engine').changeScene('stage-screen');
		}
	});
});