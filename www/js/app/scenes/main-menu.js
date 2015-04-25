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
		width: 360,
		height: 100,
		onTrigger: _startGame
	},{
		x: 0,
		y: 440,
		width: 360,
		height: 100,
		onTrigger: _showRules
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
			Graphics.text('play', Graphics.width() / 2, Graphics.height() / 2 + 20, 50);
			Graphics.text('rules', Graphics.width() / 2, Graphics.height() / 2 + 170, 50);

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