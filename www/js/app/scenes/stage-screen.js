/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/touch-prompt', 
		'app/audio', 'app/tournament', 'app/event-manager'], 
		function(Scene, Graphics, TouchPrompt, Audio, Tournament, E) {

	var _frameText
	, _frameFont
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'negative', true)
	, _mode
	;

	function _setMode(mode) {
		_mode = mode;
		_frameFont = 80;

		switch(mode) {
			case 'PLAYER1':
				this.background = 'primary1';
				if (Tournament.isActive()) {
					_frameText = Tournament.get().currentMatch().players[0].name;
					while (Graphics.textWidth(_frameText, _frameFont) > Graphics.width()) {
						_frameFont /= 2;
					}
				} else {
					_frameText = 'Player 1';
				}
				break;
			case 'PLAYER2':
				background = 'primary2';
				if (Tournament.isActive()) {
					_frameText = Tournament.get().currentMatch().players[1].name;
					while (Graphics.textWidth(_frameText, _frameFont) > Graphics.width()) {
						_frameFont /= 2;
					}
				} else {
					_frameText = 'Player 2';
				}
				break;
			case 'SCORE':
				this.background = 'background';
				_frameText = 'Score';
				break;
			case 'MATCH':
				var players = Tournament.get().currentMatch().players;
				_frameFont = 40;
				this.background = 'background';
				_frameText = players[0].name + '\nvs.\n' + players[1].name;
				break;
		}
	}

	return new Scene({

		onActivate: _setMode,

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
			require('app/engine').changeScene('game-board');
		}
	});
});