/**
 *	Main Menu
 *	scene for the main menu
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics', 'app/event-manager', 
		'app/audio'], 
		function(Scene, Graphics, E, Audio) {
	
	var DEBUG = false;

	var _hitBoxes = [{
		x: 0,
		y: 240,
		width: 480,
		height: 80,
		onTrigger: _startGame
	},{
		x: 0,
		y: 320,
		width: 480,
		height: 80,
		onTrigger: function() { require('app/engine').setBot(true); _startGame(true); }
	},{
		x: 0,
		y: 400,
		width: 480,
		height: 80,
		onTrigger: _startTournament
	},{
		x: 0,
		y: 480,
		width: 480,
		height: 80,
		onTrigger: _startTutorial
	}];

	function _startTournament() {
		E.fire('startTournament', {
			fromTitle: true
		});
		require('app/engine').changeScene('tournament-lobby', null, true);
	}

	function _startGame(singlePlayer) {
		E.fire('startGame', { 
			fromTitle: true, 
			singlePlayer: singlePlayer 
		});
		require('app/engine').changeScene('stage-screen', null, true);
	}

	function _startTutorial() {
		E.fire('startTutorial', { 
			fromTitle: true 
		});
		require('app/engine').changeScene('game-board').startTutorial();
	}

	return new Scene({
		background: 'menu',

		drawFrame: function(delta) {
			Graphics.text('Radüm', Graphics.width() / 2, 120, 100, 'negative');
			Graphics.text('vs. human', Graphics.width() / 2, 280, 40, 'negative');
			Graphics.text('vs. cpu', Graphics.width() / 2, 360, 40, 'negative');
			Graphics.text('tournament', Graphics.width() / 2, 440, 40, 'negative')
			Graphics.text('tutorial', Graphics.width() / 2, 520, 40, 'negative');

			if (DEBUG) {
				_hitBoxes.forEach(function(box) {
					Graphics.rect(box.x, box.y, box.width, box.height, 'negative');
				});
			}
		},

		onInputStart: function(coords) {
			_hitBoxes.forEach(function(box) {
				if (coords.x > box.x && coords.x < box.x + box.width &&
					coords.y > box.y && coords.y < box.y + box.height) {
					Audio.play('SELECT');
					box.onTrigger();
				}
			});
		}
	});
});