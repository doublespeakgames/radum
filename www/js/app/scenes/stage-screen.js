/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 
		'app/touch-prompt', 'app/audio'], 
		function(Scene, Graphics, TouchPrompt, Audio) {

	var _frameText
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 120}, 'negative', true);

	function _setMode(mode) {
		var background;
		switch(mode) {
			case 'PLAYER1':
				this.background = 'primary1';
				_frameText = 'Player 1';
				break;
			case 'PLAYER2':
				this.background = 'primary2';
				_frameText = 'Player 2';
				break;
			case 'SCORE':
				this.background = 'background';
				_frameText = 'Score';
				break;
		}
	}

	return new Scene({

		onActivate: _setMode,

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