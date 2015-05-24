/**
 *	Spawning Pool
 *  simulated game environment intended 
 *	to breed the ultimate Radum AI
 *	(c) doublespeak games 2015	
 **/
 define(['app/spawning-pool/game', 'app/ai/weighted'], function(Game, Bot) {

 	var STARTING_BOTS = 200
 	, GENERATIONS = 1000
 	, MUTATION_CHANCE = 0.001
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
 			initialRadius = Math.random() < 0.5 ? mum._initialRadius : dad._initialRadius;
 		}

 		return new Bot(0, require('app/engine').BOARD_RADIUS, require('app/engine').BOARD_CENTER, weights, initialRadius);
 	}

 	function _randomWeightsRow() {
 		var row = [];

 		for (var i = 0; i < 7; i++) {
 			row.push((Math.random() * 2) - 1);
 		}

 		return row;
 	}

 	function _doItAllNightLong(mum, dad) {
 		var bebe = [];

 		// Mum and dad should have the same number of weights
 		for (var turn = 0; turn < mum._weights.length; turn++) {
			bebe.push([]);
 			for (var weight = 0; weight < mum._weights[turn].length; weight++) {
 				bebe[turn].push(Math.random() < 0.5 ? mum._weights[turn][weight] : dad._weights[turn][weight]);
 				if (Math.random() < MUTATION_CHANCE) {
 					// Totally mutated, bro
 					bebe[turn][weight] *= -1; 
 				}
 			}
 		}

 		return bebe;
 	}

 	function _popRandom(array) {
 		return array.splice(Math.floor(Math.random() * array.length), 1)[0];
 	}

 	function _runGeneration() {
 		var gamePool = _genePool.slice()
 		, winners = []
 		, losers = []
 		, bebes = []
 		, mum
 		, dad
 		;

 		// Make a bunch of games
 		_games.length = 0;
 		while(gamePool.length > 1) {
 			_games.push(new Game(_popRandom(gamePool), _popRandom(gamePool)));
 		}

 		// Games should all complete at once
 		while (!_games[0].isComplete()) {
 			_games.forEach(function(game, idx) {
 				var winner, loser;
 				game.playTurn();
 				if (game.isComplete()) {
 					winner = game.getWinner();
 					loser = game.getLoser();
 					if (winner) {
 						winners.push(game.getWinner());
 						losers.push(game.getLoser());
 					} else {
 						// Game was a tie
 						winners.push(game.player1, game.player2);
 					}
 				}
 			});
 		}

 		_genePool.length = 0;

 		// Breed the winners
 		while(winners.length > 1) {
 			mum = _popRandom(winners);
 			dad = _popRandom(winners);
 			bebes.push(_newBot(mum, dad));
	 		_genePool.push(_newBot(mum, dad), mum, dad);
	 	}

	 	// Some losers survive too
	 	while (_genePool.length < STARTING_BOTS && losers.length > 0) {
	 		_genePool.push(losers.pop());
	 	}

	 	return bebes;
 	}

 	function _run() {
 		// Introduce genetic variation
 		for (var i = 0; i < STARTING_BOTS; i++) {
 			_genePool.push(_newBot());
 		}

 		// Run generations until we get bored
 		// TODO: Use generational variation as a termination condition
 		var youngestGeneration;
 		for (var i = 0; i < GENERATIONS; i++) {
 			youngestGeneration = _runGeneration();
 			console.log("Generation " + i, youngestGeneration);
 		}

 		console.log(_bestBot(youngestGeneration));
 	}

 	function _bestWeight(fittest, turn, idx) {
		var counts = {}
		, best = false
		;

		fittest.forEach(function(ai) { 
			var val = Math.round(ai._weights[turn][idx] * 100) / 100;
			counts[val] = (counts[val] || 0) + 1;
		});
		
		for (var weight in counts) {
			if (!best || counts[weight] > best.count) {
				best = {
					weight: weight,
					count: counts[weight]
				};
			}
		}
		return best.weight;
 	}

 	function _bestOpener(fittest) {
 		var best = false
 		, counts = {}
 		;

 		fittest.forEach(function(ai) {
 			var val = Math.round(ai._initialRadius * 100) / 100;
 			counts[val] = (counts[val] || 0) + 1;
 		});

 		for (var opener in counts) {
 			if (!best || counts[opener] > best.count) {
 				best = {
 					opener: opener,
 					count: counts[opener]
 				};
 			}
 		}
 		return best.opener;
 	}

 	function _bestBot(fittest) {
 		var weights = []
 		, turn
 		;

 		for (var turnNum = 0, turns = fittest[0]._weights.length; turnNum < turns; turnNum++) {
 			turn = [];
 			for (var idx = 0, len = fittest[0]._weights[0].length; idx < len; idx++) {
 				turn.push(_bestWeight(fittest, turnNum, idx));
 			}
 			weights.push(turn);
 		}

 		return {
 			weights: weights,
 			opener: _bestOpener(fittest)
 		};
 	}

 	return {
 		run: _run
 	};
 });