/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/state-machine', 
		'app/touch-prompt', 'app/audio'], 
		function(Scene, Graphics, StateMachine, TouchPrompt, Audio) {

	var _stateMachine = new StateMachine({
		PLAYER1: {
			NEXT: 'PLAYER2',
			NEXTVSCPU: 'SCORE'
		},
		PLAYER2: {
			NEXT: 'SCORE'
		},
		SCORE: {
			NEXT: 'PLAYER1'
		}
	}, 'PLAYER1');

	var _frameText
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: Graphics.height() - 70}, 'negative');

	function _setColours() {
		var background;
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
	}

	return new Scene({

		reset: function() {
			_stateMachine.reset();
			_setColours.call(this);
		},

		onActivate: function() {
			_setColours.call(this);
		},

		onDeactivate: function() {
			if (require('app/engine').getAI() && _stateMachine.can('NEXTVSCPU')) {
				_stateMachine.go('NEXTVSCPU');
			} else {
				_stateMachine.go('NEXT');
			}
		},

		doFrame: function(delta) {
			_prompt.do(delta);
		},

		drawFrame: function() {
			Graphics.text(_frameText, Graphics.width() / 2, Graphics.height() / 3 - 30, 80);
			_prompt.draw();
		},

		onInputStart: function(coords) {
			Audio.play('READY');
			require('app/engine').changeScene('game-board');
		}
	});
});