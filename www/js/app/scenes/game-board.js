/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/scenes/scene', 'app/graphics', 'app/state-machine', 
		'app/piece', 'app/touch-prompt', 'app/score-horizon'], 
		function(Util, Scene, Graphics, StateMachine, Piece, TouchPrompt, ScoreHorizon) {


	var BOARD_CENTER = {x: Math.round(Graphics.width() / 2), y: Math.round(Graphics.height() / 2)}
	, BOARD_RADIUS = Math.floor(Graphics.width() / 2) - 30
	, SUBMIT_DELAY = 400
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
			UNPAUSE: 'UPKEEP'
		},
		UPKEEP: {
			NEXTTURN: 'IDLE'
		}
	}, 'IDLE');

	var _activePiece = null
	, _playedPieces = []
	, _prompt = new TouchPrompt({x: 180, y: 550}, 'background')
	, _activePlayer = 1
	, _scoreHorizons = []
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
			if (tries >= 5) {
				// Give up if we've tried too much
				return false;
			}
			return _doCollisions(coords, tries + 1);
		}

		return true;
	}

	function _score() {
		var players = []
		, scoring
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
			var score = scoring.shift();
			score.piece.pulse();
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
		_playedPieces.forEach(function(piece) {
			if (!piece.isa(Piece.Type.SENTRY)) {
				// Only score Sentries, for now
				return;
			}
			var distances = [
				Util.distance(piece.getCoords(), players[0].getCoords()) - Piece.RADIUS,
				Util.distance(piece.getCoords(), players[1].getCoords()) - Piece.RADIUS
			]
			, closest = Math.min.apply(Math, distances)
			, winner = distances[0] === closest ? distances[1] === closest ? null : 1 : 2
			;

			pieceScores.push({
				distance: closest,
				player: winner,
				piece: piece
			});
		});

		return pieceScores.sort(function(a, b) {
			return a.distance - b.distance;
		});
	}
	
	return new Scene({
		 background: null,

		 drawFrame: function(delta) {
		 	Graphics.circle(BOARD_CENTER.x, BOARD_CENTER.y, BOARD_RADIUS, 'background');
		 	_playedPieces.forEach(function(piece) {
		 		piece.draw(delta);
		 	});
		 	if (_activePiece) {
		 		_activePiece.draw(delta);
		 	}
		 	if (_stateMachine.is('PAUSED')) {
			 	_prompt.draw(delta);
			}

			// draw the score horizons
			_scoreHorizons.forEach(function(horizon) { 
				horizon.draw(delta);
			});
		 },

		 onActivate: function() {
		 	if (_activePlayer === 1 && _stateMachine.can('NEXTPLAYER')) {
		 		_activePlayer = 2;
		 		_stateMachine.go('NEXTPLAYER');
		 	} else if (_activePlayer === 2 && _stateMachine.can('SCORE')) {
		 		_activePlayer = 1;
	 			_score()
		 	} else if (_stateMachine.can('NEXTTURN')) {
		 		// Remove score horizons
		 		_scoreHorizons.length = 0;
		 		// Make any old footprints into sentreis
		 		_playedPieces.forEach(function(piece) {
		 			if (piece.isa(Piece.Type.FOOTPRINT)) {
		 				piece.setType(Piece.Type.SENTRY);
		 			}
		 		});
		 		_stateMachine.go('NEXTTURN');
		 	}
		 },

		 onInputStart: function(coords) {
		 	if (_stateMachine.can('UNPAUSE')) {
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

		 		setTimeout(function() {
		 			require('app/engine').changeScene('stage-screen');
		 		}, SUBMIT_DELAY);

		 		_playedPieces.push(_activePiece);
		 		_activePiece = null;
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