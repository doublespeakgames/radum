/**
 *	Spawning Pool
 *  simulated game environment intended 
 *	to breed the ultimate Radum AI
 *	(c) doublespeak games 2015	
 **/
 define(['app/spawning-pool/game', 'app/ai/test'], function(Game, TestAI) {

 	var NUM_GAMES = 1;

 	var _games = [];

 	function _startGame() {
 		return new Game(
 			new TestAI(1, require('app/engine').BOARD_RADIUS, require('app/engine').BOARD_CENTER),
 			new TestAI(2, require('app/engine').BOARD_RADIUS, require('app/engine').BOARD_CENTER)
		);
 	}

 	function _runGeneration() {
 		_games.length = 0;
 		for (var i = 0; i < NUM_GAMES; i++) {
 			_games.push(_startGame());
 		}

 		// Games should all complete at once
 		while (!_games[0].isComplete()) {
 			_games.forEach(function(game, idx) {
 				game.playTurn();
 				if (game.isComplete()) {
 					console.info('Game ' + idx + ' final score: ' + game.scores[0] + ' - ' + game.scores[1]);
 				}
 			});
 		}
 	}

 	return {
 		run: _runGeneration
 	};
 });