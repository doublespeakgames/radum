/**
 *	Main Menu
 *	scene for the main menu
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/scene', 'app/graphics'], function(Scene, Graphics) {
	
	var DEBUG = false;

	var _hitBoxes = [{
		x: 0,
		y: 295,
		width: 480,
		height: 100,
		onTrigger: _startGame
	},{
		x: 0,
		y: 420,
		width: 480,
		height: 100,
		onTrigger: function() { require('app/engine').setBot(true); _startGame(); }
	}];

	function _startGame() {
		require('app/engine').changeScene('stage-screen');
	}

	function _showRules() {
		// TODO
		console.log('show rules');
	}

	return new Scene({
		background: 'background',

		drawFrame: function(delta) {
			Graphics.text('Radüm', Graphics.width() / 2, Graphics.height() / 3 - 30, 100);
			Graphics.text('vs human', Graphics.width() / 2, Graphics.height() / 2 + 20, 40);
			Graphics.text('vs cpu', Graphics.width() / 2, Graphics.height() / 2 + 140, 40);

			if (DEBUG) {
				_hitBoxes.forEach(function(box) {
					Graphics.rect(box.x, box.y, box.width, box.height);
				});
			}
		},

		onInputStart: function(coords) {
			_hitBoxes.forEach(function(box) {
				if (coords.x > box.x && coords.x < box.x + box.width &&
					coords.y > box.y && coords.y < box.y + box.height) {

					box.onTrigger();
				}
			});
		}
	});
});