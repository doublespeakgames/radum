/**
 *	Game Over Screen
 *	scene for the final score display
 *	(c) doublespeak games 2015	
 **/
define(['app/event-manager', 'app/scenes/scene', 'app/graphics', 
		'app/touch-prompt', 'app/audio'], 
	function(E, Scene, Graphics, TouchPrompt, Audio) {

	var _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 70}, 'negative', true)
	_scores = [0, 0]
	;

	return new Scene({
		background: 'background',

		onActivate: function(scores) {
			E.fire('gameOver', {
				scores: scores,
				singlePlayer: !!require('app/engine').getAI()
			});
			Audio.play('FINAL');
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
			E.fire('gameStart', { 
				fromTitle: false,
				singlePlayer: !!require('app/engine').getAI()
			});
			require('app/engine').changeScene('stage-screen');
		}
	});
});