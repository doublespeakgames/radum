/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/state-machine', 'app/touch-prompt'], function(Scene, Graphics, StateMachine, TouchPrompt) {

	var _stateMachine = new StateMachine({
		PLAYER1: {
			NEXT: 'PLAYER2'
		},
		PLAYER2: {
			NEXT: 'SCORE'
		},
		SCORE: {
			NEXT: 'PLAYER1'
		}
	}, 'SCORE');

	var _frameText
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: Graphics.height() - 60}, 'negative');

	return new Scene({

		onActivate: function() {
			var background;
			_stateMachine.go('NEXT');
			_stateMachine.choose({
				PLAYER1: function() {
					background = 'primary1';
					_frameText = 'Player 1';
				},
				PLAYER2: function() {
					background = 'primary2';
					_frameText = 'Player 2';
				},
				SCORE: function() {
					background = 'background';
					_frameText = 'Score';
				}
			});
			this.background = background;
		},

		drawFrame: function(delta) {
			Graphics.text(_frameText, Graphics.width() / 2, Graphics.height() / 3 - 30, 80);
			_prompt.draw(delta);
		},

		onInputStart: function(coords) {
			require('app/engine').changeScene('game-board');
		}
	});
});