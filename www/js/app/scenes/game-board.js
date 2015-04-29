/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/scenes/scene', 'app/graphics', 'app/state-machine', 
		'app/piece', 'app/touch-prompt', 'app/score-horizon', 'app/ai/test'], 
		function(Util, Scene, Graphics, StateMachine, Piece, TouchPrompt, 
			ScoreHorizon, TestAI) {


	var BOARD_CENTER = {x: Graphics.width() / 2, y: Graphics.height() / 2}
	, BOARD_RADIUS = 200
	, SUBMIT_DELAY = 400
	, MOVES = 6
	, MOVE_TRANSITION_DURATION = 200
	, MAX_COLLISION_TRIES = 10
	, SCORE_DEADZONE = 5
	, DEBUG_AI = true
	;

	var _stateMachine = new StateMachine({
		IDLE: {
			PLAYPIECE: 'MOVED',
			CLICKPIECE: 'PRIMED'
		},
		MOVED: {
			STOP: 'IDLE',
			MOVE: 'MOVED'
		},
		PRIMED: {
			MOVE: 'MOVED',
			SUBMIT: 'SUBMITTED'
		},
		SUBMITTED: {
			NEXTPLAYER: 'IDLE',
			SCORE: 'SCORING'
		},
		SCORING: {
			DONESCORING: 'PAUSED'
		},
		PAUSED: {
			UNPAUSE: 'UPKEEP',
			GAMEOVER: 'ENDGAME'
		},
		UPKEEP: {
			NEXTTURN: 'IDLE'
		},
		ENDGAME: {
			NEWGAME: 'IDLE'
		}
	}, 'IDLE');

	var _activePiece = null
	, _playedPieces = []
	, _moveTransition = 0
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: Graphics.height() - 60}, 'background')
	, _activePlayer = 1
	, _scoreHorizons = []
	, _target
	, _scores = [0, 0]
	, _movesLeft = [MOVES, MOVES]
	, _ai = new TestAI(BOARD_RADIUS, BOARD_CENTER, 10)
	;

	function _getBoundaryVector(coords) {
		var distance = Util.distance(coords, BOARD_CENTER)
		, scale = 1
		;
		
		// Make sure the piece is on the board
		if (distance > BOARD_RADIUS) {
			scale = BOARD_RADIUS / distance;

			return {
				x: (scale * coords.x) + (1 - scale) * BOARD_CENTER.x - coords.x,
				y: (scale * coords.y) + (1 - scale) * BOARD_CENTER.y - coords.y
			};
		}

		return {x: 0, y: 0};
	}

	function _doCollisions(coords, tries) {
		var totalRebound = _getBoundaryVector(coords);

		tries = tries || 0;

		_playedPieces.forEach(function(staticPiece) {
			if (!staticPiece.isReal()) {
				// Spoooooky ghost piece
				return;
			}
			var rebound = staticPiece.getReboundVector(coords);
			totalRebound.x += rebound.x;
			totalRebound.y += rebound.y;
		});

		coords.x += totalRebound.x;
		coords.y += totalRebound.y;

		if (totalRebound.x != 0 || totalRebound.y != 0) {
			// Make sure there are no collisions caused by this adjustment
			if (tries >= MAX_COLLISION_TRIES) {
				// Give up if we've tried too much
				return false;
			}
			return _doCollisions(coords, tries + 1);
		}

		return true;
	}

	function _doFootprintCollisions(footprint1, footprint2, tries) {
		var total1 = _getBoundaryVector(footprint1.getCoords())
		, total2 = _getBoundaryVector(footprint2.getCoords())
		;

		tries = tries || 0;

		_playedPieces.forEach(function(staticPiece) {
			var rebound1
			, rebound2
			;

			if (!staticPiece.isReal()) {
				// Spoooooky ghost piece
				return;
			}

			if (staticPiece !== footprint1) {
				rebound1 = staticPiece.getReboundVector(footprint1.getCoords());
				if (staticPiece === footprint2) {
					// Halve the rebound vector, because footprints repel each other
					rebound1.x /= 2;
					rebound1.y /= 2;
				}
				total1.x += rebound1.x;
				total1.y += rebound1.y;
			}

			if (staticPiece !== footprint2) {
				rebound2 = staticPiece.getReboundVector(footprint2.getCoords());
				if (staticPiece === footprint1) {
					// Halve the rebound vector, because footprints repel each other
					rebound2.x /= 2;
					rebound2.y /= 2;
				}
				total2.x += rebound2.x;
				total2.y += rebound2.y;
			}

		});

		footprint1.applyVector(total1);
		footprint2.applyVector(total2);

		if (total1.x !== 0 || total1.y !== 0 || total2.x !== 0 || total2.y !== 0) {
			// Make sure there are no collisions caused by this adjustment
			if (tries >= MAX_COLLISION_TRIES) {
				// Give up if we've tried too much
				return false;
			}
			return _doFootprintCollisions(footprint1, footprint2, tries + 1);
		}

		return true;
	}

	function _getSliceHeight(x) {
		return 2 * Math.sqrt(Math.pow(BOARD_RADIUS, 2) - Math.pow(x, 2));
	}

	function _generateSpot() {
		var pos = {
			x: Math.floor(Math.random() * BOARD_RADIUS * 2)
		}
		, translatedX = pos.x - BOARD_RADIUS
		, ySpace = _getSliceHeight(translatedX)
		;

		pos.y = Math.floor((Math.random() * ySpace) + (BOARD_RADIUS - ySpace / 2));

		// translate to canvas coords
		pos.x += Graphics.width() / 2 - BOARD_RADIUS;
		pos.y += Graphics.height() / 2 - BOARD_RADIUS;

		return pos;
	}

	function _generateGoodSpot() {
		var spot = null
		, counter = 0
		;

		while(spot === null && counter++ < 100) {
			spot = _generateSpot();
			spot = _goodSpot(spot) ? spot : null;
		}

		return spot;
	}

	function _getNewTarget() {
		var spot = _generateGoodSpot();

		if (!spot) {
			// Couldn't find a spot. No target for you.
			console.debug("Couldn't find a free space for the target. Write better code.");
			return null;
		}

		return new Piece(
			spot,
			Piece.Type.TARGET_FORECAST,
			0
		);
	}

	function _goodSpot(coords) {
		var good = true;
		_playedPieces.forEach(function(piece) {
			if (Util.distance(piece.getCoords(), coords) < Piece.RADIUS * 2) {
				good = false;
			}
		});

		return good;
	}

	function _score() {
		var players = []
		, scoring
		, targetBlocked = false
		, newSpot
		;

		_stateMachine.go('SCORE');

		// Make the footprints real
		_playedPieces.forEach(function(piece) {
			if (piece.isa(Piece.Type.FOOTPRINT)) {			
				piece.setReal(true);
				piece.setActive(false);
				players.push(piece);
			}
		});

		// Handle footprint collision
		if (players[0].collidesWith(players[1])) {
			players[0].savePos();
			players[1].savePos();
			_doFootprintCollisions(players[0], players[1]);
		}

		if (_target) {

			// Did a player block the target?
			players.forEach(function(piece) {
				if (_target.collidesWith(piece)) {
					targetBlocked = true;
				}
			});

			// If someone has played on the forecast, move it
			if (targetBlocked) {
				newSpot = _generateGoodSpot();
				if (newSpot) {
					_target.move(newSpot);
				} else {
					// No legal place found
					_target = null;
				}
			}

			// Solidify the target forecast
			if (_target) {
				_target.setType(Piece.Type.TARGET);
				_target.appear();
			}
		}

		// Score the board
		scoring = _getRoundScores(players);
		if (scoring.length == 0) {
			_stateMachine.go('DONESCORING');
			return;
		} else {
			players.forEach(function(p) {
				_scoreHorizons.push(new ScoreHorizon(p.ownerNumber(), p.getCoords()));
			});
		}

		setTimeout(function scorePiece() {
			var score = scoring.shift()
			, points = 0
			, scoringPlayer
			;

			if (score.player) {
				score.piece.pulse();
			}

			if (score.player && score.piece.ownerNumber() !== score.player) {

				if (score.piece.ownerNumber() === 0) {
					scoringPlayer = score.player;
					points = -2;
				} else {
					scoringPlayer = score.player === 1 ? 2 : 1;
					points = score.piece.pointValue();
				}

				_scores[scoringPlayer - 1] += points;

				score.piece.setLabel({
					text: points,
					colour: 'secondary' + scoringPlayer
				});
				score.piece.resetLevel();
			} else if(score.player) {
				score.piece.levelUp();
			}

			if (scoring.length > 0) {
				setTimeout(scorePiece, (scoring[0].distance - score.distance) * ScoreHorizon.RATE);
			} else {
				_scoreHorizons.forEach(function(horizon) {
					horizon.stop();
				});
				_stateMachine.go('DONESCORING');
			}
		}, (scoring[0].distance) * ScoreHorizon.RATE);
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

		if (_target) {
			scorePiece(_target);
		}
		_playedPieces.forEach(scorePiece);

		return pieceScores.sort(function(a, b) {
			return a.distance - b.distance;
		});
	}

	function _drawMoveCounter(player, x, delta) {
		for (var i = 0; i < _movesLeft[player - 1]; i++) {
			if (_stateMachine.is(['IDLE', 'MOVED', 'PRIMED']) && _activePlayer === player && i + 1 === _movesLeft[player - 1]) {
				Graphics.circle(x, 30 + (i * 18), 8, null, 'primary' + player);
			} else {
				Graphics.circle(x, 30 + (i * 18), 8, 'primary' + player);
			}
		}

		if (_moveTransition > 0 && player === _activePlayer)
		{
			_moveTransition -= delta / MOVE_TRANSITION_DURATION;
			_moveTransition = _moveTransition < 0 ? 0 : _moveTransition;
			Graphics.circle(x, 30 + (_movesLeft[player - 1] * 18), 8 * (_moveTransition), null, 'primary' + player);
		}
	}

	function _getNextPlayer() {
		return _activePlayer === 1 ? 2 : 1;
	}

	function _resetGame() {
		_movesLeft = [MOVES, MOVES];
		_scores = [0, 0];
		_playedPieces.length = 0;
		_scoreHorizons.length = 0;
		_target = null;
	}
	
	return new Scene({
		 background: null,
		 
		 getCenter: function() {
		 	return BOARD_CENTER;
		 },

		 getRadius: function() {
		 	return BOARD_RADIUS;
		 },

		 drawFrame: function(delta) {
		 	Graphics.circle(BOARD_CENTER.x, BOARD_CENTER.y, BOARD_RADIUS, 'background');

		 	// DEBUG: Draw AI scores
		 	if (_ai && DEBUG_AI) {
		 		_ai.getScores().forEach(function(score) {
		 			var s = Math.round(score.score * 10) / 10;
		 			Graphics.text(s, score.coords.x, score.coords.y, 4, 'debug');
		 		});
		 	}

			// draw the score horizons
			if (_scoreHorizons.length > 0) {
				Graphics.save();
				Graphics.clipToBoard();
				_scoreHorizons.forEach(function(horizon) { 
					horizon.draw(delta);
				});
				Graphics.restore();
			}

			// Draw the target
			if (_target) {
				_target.draw(delta);
			}

			// Draw all the pieces
		 	_playedPieces.forEach(function(piece) {
		 		piece.draw(delta);
		 	});

		 	// Draw the current footprint
		 	if (_activePiece) {
		 		_activePiece.draw(delta);
		 	}

		 	// Draw the scores
	 		Graphics.text(_scores[0], 50, 38, 40, 'primary1', null, 'left');
	 		Graphics.text(_scores[1], 430, 38, 40, 'primary2', null, 'right');

	 		// Draw the move counters
	 		_drawMoveCounter(1, 30, delta);
	 		_drawMoveCounter(2, 450, delta);

		 	// Draw the touch prompt
		 	if (_stateMachine.is('PAUSED')) {
			 	_prompt.draw(delta);
			}
		 },

		 onActivate: function() {
		 	if (_stateMachine.can('NEWGAME')) {
		 		_resetGame();
		 		_stateMachine.go('NEWGAME');
		 	}
		 	else if (_activePlayer === 1 && _stateMachine.can('NEXTPLAYER')) {
		 		_activePlayer = 2;
		 		_stateMachine.go('NEXTPLAYER');
		 	} else if (_activePlayer === 2 && _stateMachine.can('SCORE')) {
		 		_activePlayer = 1;
	 			_score()
		 	} else if (_stateMachine.can('NEXTTURN')) {
		 		// Remove score horizons
		 		_scoreHorizons.length = 0;
		 		// Reset pieces for the next turn
		 		_playedPieces.forEach(function(piece) {
		 			if (piece.isa(Piece.Type.FOOTPRINT)) {
		 				piece.setType(Piece.Type.SENTRY);
		 			}
		 			piece.setLabel(null);
		 		});

		 		_stateMachine.go('NEXTTURN');
		 	}

	 		// Calculate AI scores
	 		if (_ai) {
	 			_ai.think(2, _playedPieces);
	 		}
		 },

		 onInputStart: function(coords) {
		 	if (_movesLeft[_getNextPlayer() - 1] === 0 && _stateMachine.can('GAMEOVER')) {
	 			require('app/engine').changeScene('game-over', _scores);
	 			_stateMachine.go('GAMEOVER')
		 	}
		 	else if (_stateMachine.can('UNPAUSE')) {
		 		require('app/engine').changeScene('stage-screen');
		 		_stateMachine.go('UNPAUSE');
		 	}
		 	else if (_stateMachine.can('CLICKPIECE') && _activePiece && _activePiece.contains(coords)) {
		 		_stateMachine.go('CLICKPIECE');
		 	}
		 	else if (_stateMachine.can('PLAYPIECE')) {
		 		if (!_doCollisions(coords)) {
		 			// Couldn't find a valid place
		 			return;
		 		}
		 		if (!_activePiece) {
		 			_activePiece = new Piece(coords, Piece.Type.FOOTPRINT, _activePlayer);
		 		} else {
		 			_activePiece.move(coords);
		 		}
		 		_stateMachine.go('PLAYPIECE');
		 	}
		 },

		 onInputStop: function()  {
		 	if (_stateMachine.can('SUBMIT')) {
		 		// Submit the active piece
		 		_activePiece.setReal(false);
		 		_moveTransition = 1;

		 		setTimeout(function() {
		 			require('app/engine').changeScene('stage-screen');
		 		}, SUBMIT_DELAY);

		 		_playedPieces.push(_activePiece);
		 		_activePiece = null;
		 		_movesLeft[_activePlayer - 1]--;
		 		_stateMachine.go('SUBMIT');
		 	}
		 	else if (_stateMachine.can('STOP')) {
		 		_stateMachine.go('STOP');
		 	}
		 },

		 onInputMove: function(coords) {
		 	if (_stateMachine.can('MOVE') && _activePiece) {
		 		if (!_doCollisions(coords)) {
		 			// Couldn't find a valid place
		 			return;
		 		}
		 		_activePiece.move(coords);
		 		_stateMachine.go('MOVE');
		 	}
		 }
	});
});