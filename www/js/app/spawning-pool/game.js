/**
 *	Game
 *  single simulated game
 *  for use in the spawning pools
 *	(c) doublespeak games 2015	
 **/
 define(['app/util', 'app/physics', 'app/piece'], function(Util, Physics, Piece) {

 	var TURNS = 6 // Matches what's in game-board
 	, SCORE_DEADZONE = 5 // Matches what's in game-board
 	, DEBUG = false
 	;

 	function Game(player1, player2) {
 		this.name = name;
 		this.player1 = player1;
 		this.player2 = player2;
 		this.playedPieces = [];
 		this.scores = [0, 0];
 		this.turnsRemaining = TURNS;
 	}

 	function _score() {
		var players = []
		, scoring
		, targetBlocked = false
		, newSpot
		;

		// Make the footprints real
		this.playedPieces.forEach(function(piece) {
			if (piece.isa(Piece.Type.FOOTPRINT)) {			
				piece.setReal(true);
				piece.setActive(false);
				players.push(piece);
			}
		});

		// Handle footprint collision
		if (players[0].collidesWith(players[1])) {
			Physics.doFootprintCollisions(players[0], players[1], this.playedPieces);
		}

		// Score the board
		_getRoundScores.call(this, players).forEach(function(score) {
			var scoringPlayer;

			if (score.player && score.piece.ownerNumber() !== score.player) {
				scoringPlayer = score.player === 1 ? 1 : 0;
				this.scores[scoringPlayer] += score.piece.pointValue();
				score.piece.resetLevel();
			} else if(score.player) {
				score.piece.levelUp();
			}
		}.bind(this));
	}

	function _getRoundScores(players) {
		var pieceScores = [];

		function scorePiece(piece) {
			if (!piece.isa(Piece.Type.SENTRY) && !piece.isa(Piece.Type.TARGET)) {
				return;
			}
			var distances = [
				Util.distance(piece.getCoords(), players[0].getCoords()) - Piece.RADIUS,
				Util.distance(piece.getCoords(), players[1].getCoords()) - Piece.RADIUS
			]
			, closest = Math.min.apply(Math, distances)
			, winner = distances[0] === closest ? distances[1] === closest ? null : 1 : 2
			;

			if (Math.abs(distances[0] - distances[1]) <= SCORE_DEADZONE) {
				// Too close to call a winner
				winner = null;
			}

			pieceScores.push({
				distance: closest,
				player: winner,
				piece: piece
			});
		}

		this.playedPieces.forEach(scorePiece);

		return pieceScores.sort(function(a, b) {
			return a.distance - b.distance;
		});
	}

 	Game.prototype = {
 		playTurn: function() {
 			if (this.turnsRemaining === 0) {
 				console.error('Tried to play a turn in a completed game');
 				return;
 			}

	 		this.playedPieces.push(this.player1.play(this.playedPieces, TURNS - this.turnsRemaining));
	 		this.playedPieces.push(this.player2.play(this.playedPieces, TURNS - this.turnsRemaining));

	 		_score.call(this);

	 		// Reset pieces for the next turn
 			this.playedPieces.forEach(function(piece) {
	 			if (piece.isa(Piece.Type.FOOTPRINT)) {
	 				piece.makeSentry();
	 			}
 			});

	 		this.turnsRemaining--;
 		},
 		isComplete: function() {
 			return this.turnsRemaining === 0;
 		},
 		getWinner: function() {
 			if (this.turnsRemaining > 0) {
 				console.error('Tried to get the winner of a game in progress');
 				return;
 			}

 			return this.scores[0] > this.scores[1] ? this.player1 : this.scores[1] > this.scores[0] ? this.player2 : null;
 		},
 		getLoser: function() {
 			if (this.turnsRemaining > 0) {
 				console.error('Tried to get the loser of a game in progress');
 				return;
 			}

 			return this.scores[0] > this.scores[1] ? this.player2 : this.scores[1] > this.scores[0] ? this.player1 : null;
 		}
 	};

 	return Game;
 });