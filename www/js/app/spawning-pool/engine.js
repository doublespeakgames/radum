/**
 *	Spawning Pool
 *  simulated game environment intended 
 *	to breed the ultimate Radum AI
 *	(c) doublespeak games 2015	
 **/
 define(['app/spawning-pool/game', 'app/ai/weighted'], function(Game, Bot) {

 	var STARTING_BOTS = 100000
 	, NUM_GAMES = 1
 	;

 	var _games = []
 	, _genePool = []
 	;

 	function _newBot(mum, dad) {
 		var weights = []
 		, intialRadius
 		;

 		if (!mum || !dad) {
 			// Breathe life into dust
 			for (var day = 0; day < 6; day++) {
	 			weights.push(_randomWeightsRow());
	 		}
	 		initialRadius = Math.random();
 		} else {
 			// Mum and dad get bi-zay
 			weights = _doItAllNightLong(mum, dad);
 			initialRadius = Math.random() < 0.5 ? mum.initialRadius : dad.initialRadius;
 		}

 		return new Bot(0, require('app/engine').BOARD_RADIUS, require('app/engine').BOARD_CENTER, weights, initialRadius);
 	}

 	function _randomWeightsRow() {
 		var row = [];

 		for (var i = 0; i < 7; i++) {
 			row.push((Math.random() * 10) - 5);
 		}

 		return row;
 	}

 	function _doItAllNightLong(mum, dad) {
 		var bebe = [];

 		// Mum and dad should have the same number of weights
 		for (var turn = 0; turn < mum.weights.length; turn++) {
			bebe.push([]);
 			for (var weight = 0; weight < mum.weights[turn].length; weight++) {
 				bebe[turn].push(Math.random < 0.5 ? mum.weights[turn][weight] : dad.weights[turn][weight]);
 			}
 		}

 		console.log(mum, dad, bebe);

 		return bebe;
 	}

 	function _startGame() {
 		return new Game(
 			_newBot(1),
 			_newBot(2)
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

 	function _run() {
 		for (var i = 0; i < STARTING_BOTS; i++) {
 			_genePool.push(_newBot());
 		}
 	}

 	return {
 		run: _runGeneration
 	};
 });