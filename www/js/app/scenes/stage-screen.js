/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/state-machine', 
		'app/touch-prompt', 'app/audio', 'app/tournament'], 
		function(Scene, Graphics, StateMachine, TouchPrompt, Audio, Tournament) {

	var _stateMachine = new StateMachine({
		START: {
			BEGIN: 'PLAYER1',
			TOURNAMENT: 'MATCH'
		},
		MATCH: {
			NEXT: 'PLAYER1'
		},
		PLAYER1: {
			NEXT: 'PLAYER2',
			NEXTVSCPU: 'SCORE'
		},
		PLAYER2: {
			NEXT: 'SCORE'
		},
		SCORE: {
			NEXT: 'PLAYER1',
			NEXTTOURNAMENT: 'MATCH'
		}
	}, 'START');

	var _frameText
	, _frameFont
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'negative', true);

	function _setColours() {
		var background;
		_frameFont = 80;
		_stateMachine.choose({
			PLAYER1: function() {
				background = 'primary1';
				if (Tournament.isActive()) {
					_frameText = Tournament.get().currentMatch().players[0].name;
					while (Graphics.textWidth(_frameText, _frameFont) > Graphics.width()) {
						_frameFont /= 2;
					}
				} else {
					_frameText = 'Player 1';
				}
			},
			PLAYER2: function() {
				background = 'primary2';
				if (Tournament.isActive()) {
					_frameText = Tournament.get().currentMatch().players[1].name;
					while (Graphics.textWidth(_frameText, _frameFont) > Graphics.width()) {
						_frameFont /= 2;
					}
				} else {
					_frameText = 'Player 2';
				}
			},
			SCORE: function() {
				background = 'background';

				_frameText = 'Score';
			},
			MATCH: function() {
				var players = Tournament.get().currentMatch().players;
				_frameFont = 40;
				background = 'background';
				_frameText = players[0].name + '\nvs.\n' + players[1].name;
			},
		});
		this.background = background;
	}

	return new Scene({

		reset: function() {
			_stateMachine.reset();
			_setColours.call(this);
		},

		onActivate: function() {
			if (Tournament.isActive() && _stateMachine.can('TOURNAMENT')) {
				_stateMachine.go('TOURNAMENT');
			} else if (_stateMachine.can('BEGIN')) {
				_stateMachine.go('BEGIN');
			}
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
			if (_frameText) {
				_frameText.split('\n').forEach(function(text, idx) {
					Graphics.text(text, Graphics.width() / 2, Graphics.height() / 3 - 30 + (idx * (_frameFont + 20)), _frameFont);
				});
			}
			_prompt.draw();
		},

		onInputStart: function(coords) {
			Audio.play('READY');
			if (_stateMachine.is('MATCH')) {
				require('app/engine').changeScene('stage-screen');
			} else {
				require('app/engine').changeScene('game-board');
			}
		}
	});
});