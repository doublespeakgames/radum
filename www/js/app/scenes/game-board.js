/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/event-manager', 'app/util', 'app/scenes/scene', 'app/graphics',  
		'app/state-machine', 'app/piece', 'app/touch-prompt', 'app/score-horizon', 
		'app/tutorial', 'app/physics', 'app/menu-bar', 'app/audio'], 
		function(E, Util, Scene, Graphics, StateMachine, Piece, TouchPrompt, 
			ScoreHorizon, Tutorial, Physics, MenuBar, Audio) {


	var SUBMIT_DELAY = 400
	, MOVES = 6
	, MOVE_TRANSITION_DURATION = 200
	, SCORE_DEADZONE = 5
	, DEBUG_AI = false
	, TOUCH = 'ontouchstart' in document.documentElement
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
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'menu', true)
	, _activePlayer = 1
	, _scoreHorizons = []
	, _scores = [0, 0]
	, _movesLeft = [MOVES, MOVES]
	, _paused = false
	, _soundScheme = 1;
	;

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
				piece.reveal();
				players.push(piece);
			}
		});

		// Handle footprint collision
		if (players[0].collidesWith(players[1])) {
			var oldPos = [
				players[0].getCoords(true),
				players[1].getCoords(true)
			];
			Physics.doFootprintCollisions(players[0], players[1], _playedPieces);

			players[0].animateMove(oldPos[0]);
			players[1].animateMove(oldPos[1]);
		}

		// Score the board
		scoring = _getRoundScores(players);
		if (scoring.length == 0) {
			setTimeout(function() {
				_stateMachine.go('DONESCORING');
			}, SUBMIT_DELAY);
			return;
		} else {
			function scorePiece(distance) {
				var score = scoring[0]
				, points = 0
				, scoringPlayer
				;

				if (!score || score.distance > distance) {
					// Not yet
					return;
				}

				if (Tutorial.isActive()) {
					Tutorial.advance();
				}

				scoring.shift()

				if (score.player) {
					if (score.piece.pointValue() > 0) {
						Audio.play('SCORE' + Math.ceil(Math.random() * 3));
					} else {
						Audio.play('SCORE' + Math.ceil(Math.random() * 3) + 3);
					}
					score.piece.pulse();
				}

				if (score.player && score.piece.ownerNumber() !== score.player) {

					scoringPlayer = score.player === 1 ? 2 : 1;
					points = score.piece.pointValue();

					_scores[scoringPlayer - 1] += points;

					score.piece.setLabel({
						text: points,
						colour: 'secondary' + scoringPlayer
					});
					score.piece.resetLevel();
				} else if(score.player) {
					score.piece.levelUp();
				}

				if (scoring.length === 0) {
					_scoreHorizons.forEach(function(horizon) {
						horizon.stop();
					});
					_stateMachine.go('DONESCORING');
				}
			}
			players.forEach(function(p) {
				_scoreHorizons.push(new ScoreHorizon(p.ownerNumber(), p.getCoords(), scorePiece));
			});
		}
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

		_playedPieces.forEach(scorePiece);

		return pieceScores.sort(function(a, b) {
			return a.distance - b.distance;
		});
	}

	function _doMoveCounter(delta) {
		if (_moveTransition > 0)
		{
			_moveTransition -= delta / MOVE_TRANSITION_DURATION;
			_moveTransition = _moveTransition < 0 ? 0 : _moveTransition;
		}
	}

	function _drawMoveCounter(player, x) {
		for (var i = 0; i < _movesLeft[player - 1]; i++) {
			if (_stateMachine.is(['IDLE', 'MOVED', 'PRIMED']) && _activePlayer === player && i + 1 === _movesLeft[player - 1]) {
				Graphics.circle(x, 30 + (i * 18), 8, null, 'primary' + player);
			} else {
				Graphics.circle(x, 30 + (i * 18), 8, 'primary' + player);
			}
		}

		if (_moveTransition > 0 && player === _activePlayer)
		{
			Graphics.circle(x, 30 + (_movesLeft[player - 1] * 18), 8 * (_moveTransition), null, 'primary' + player);
		}
	}

	function _getNextPlayer() {
		return _activePlayer === 1 ? 2 : 1;
	}

	function _resetTurn() {
		// Remove score horizons
 		_scoreHorizons.length = 0;
 		// Reset pieces for the next turn
 		_playedPieces.forEach(function(piece) {
 			if (piece.isa(Piece.Type.FOOTPRINT)) {
 				piece.setType(Piece.Type.SENTRY);
 			}
 			piece.setLabel(null);
 		});

 		// Get the sound scheme for each player
 		_soundScheme = Math.ceil(Math.random() * 4);

 		_stateMachine.go('NEXTTURN');
	}

	function _resetGame() {
		_activePiece = null;
		_activePlayer = 1;
		_movesLeft = [MOVES, MOVES];
		_scores = [0, 0];
		_playedPieces.length = 0;
		_scoreHorizons.length = 0;
		_stateMachine.reset();
	}

	function _toggleMenu(active) {
		if (!MenuBar.isLoaded()) {
			MenuBar.init();
		}
		Graphics.toggleMenu(active);
	}

	function _getSoundNumber(playerNum) {
		if (playerNum == null) playerNum = _activePlayer;

		return ((playerNum + _soundScheme) % 4) + 1;
	}

	function _startTutorial() {
		Tutorial.init([{
			message: ['Radüm is a game about', 'distance']
		}, {
			message: ['Players secretly play', 'pieces and score points', 'based on their positions']
		}, {
			message: [(TOUCH ? 'Touch' : 'Click') + ' the board to place', 'a piece'],
			advanceTest: function() { return !!_activePiece; }
		}, {
			message: ['Drag the piece to the', 'highlighted zone'],
			advanceTest: function () { return Util.distance(_activePiece.getCoords(), {x:150,y:220}) < 15; },
			onDraw: function() {
				Graphics.circle(150, 220, 40, 'primary1', null, null, 0.3);
			}
		}, {
			message: [(TOUCH ? 'Tap' : 'Click') + ' the piece', 'to confirm'],
			advanceTest: function () { return !_activePiece && _moveTransition <= 0; },
			reverseTest: function() { return _activePiece && Util.distance(_activePiece.getCoords(), {x:150,y:220}) >= 15; },
			onDraw: function() {
				Graphics.circle(150, 220, 40, 'primary1', null, null, 0.3);
			},
			canSubmit: true
		}, {
			message: ['Let\'s see where your', 'opponent played'],
			onAdvance: function() {
		 		// Force opponent's move
		 		_playedPieces.push(new Piece({ x: 250, y: 180 }, Piece.Type.FOOTPRINT, 2));
		 		_movesLeft[1]--;
		 		_activePlayer = 1;
		 		_score();
			}
		}, {
			advanceTest: function() { 
				return _stateMachine.is('PAUSED');
			}
		}, {
			message: ['The pieces you play', 'become sentries'],
			onAdvance: function() {
				_resetTurn();
				_stateMachine.go('UNPAUSE');
				_stateMachine.go('NEXTTURN');
			}
		}, {
			message: ['Put a piece in', 'the highlighted area'],
			advanceTest: function () { return _activePiece != null && Util.distance(_activePiece.getCoords(), {x:120,y:300}) < 15; },
			onDraw: function() {
				Graphics.circle(120, 300, 40, 'primary1', null, null, 0.3);
			}
		}, {
			message: ['Confirm the move'],
			advanceTest: function() { return !_activePiece && _moveTransition <= 0; },
			reverseTest: function() { return _activePiece && Util.distance(_activePiece.getCoords(), {x:120,y:300}) >= 15; },
			onDraw: function() {
				Graphics.circle(120, 300, 40, 'primary1', null, null, 0.3);
			},
			canSubmit: true
		}, {
			message: ['Sentries are triggered', 'by whomever plays', 'closer to them'],
			onAdvance: function() {
		 		// Force opponent's move
		 		_playedPieces.push(new Piece({ x: 330, y: 480 }, Piece.Type.FOOTPRINT, 2));
		 		_movesLeft[1]--;
		 		_activePlayer = 1;
		 		_score();
			}
		}, {
			advanceTest: function() {
				return false; // The scoring horizons will advance me
			}
		}, {
			message: ['You triggered', 'your own sentry']
		}, {
			message: ['When you trigger your', 'own sentry, it', 'levels up']
		}, {
			advanceTest: function() {
				return false; // Same as before
			}
		}, {
			message: ['You also triggered', 'your opponent\'s', 'sentry']
		}, {
			message: ['Your opponent gains', 'points based on', 'its level']
		}, {
			advanceTest: function() { 
				return _stateMachine.is('PAUSED');
			}
		}, {
			message: ['Now there are', 'more sentries'],
			onAdvance: function() {
				_resetTurn();
				_stateMachine.go('UNPAUSE');
				_stateMachine.go('NEXTTURN');
			}
		}, {
			message: ['Put a piece in', 'the highlighted area'],
			advanceTest: function () { return _activePiece != null && Util.distance(_activePiece.getCoords(), {x:360,y:290}) < 15; },
			onDraw: function() {
				Graphics.circle(360, 290, 40, 'primary1', null, null, 0.3);
			}
		}, {
			message: ['Confirm the move'],
			advanceTest: function() { return !_activePiece && _moveTransition <= 0; },
			reverseTest: function() { return _activePiece && Util.distance(_activePiece.getCoords(), {x:360,y:290}) >= 15; },
			onDraw: function() {
				Graphics.circle(360, 290, 40, 'primary1', null, null, 0.3);
			},
			canSubmit: true
		}, {
			message: ['Watch what happens', 'this time'],
			onAdvance: function() {
		 		// Force opponent's move
		 		_playedPieces.push(new Piece({ x: 240, y: 230 }, Piece.Type.FOOTPRINT, 2));
		 		_movesLeft[1]--;
		 		_activePlayer = 1;
		 		_score();
			}
		}, {
			advanceTest: function() {
				return false; // The scoring horizons will advance me
			}
		}, {
			message: ['Your opponent levels', 'up a sentry']
		}, {
			advanceTest: function() {
				return false; // The scoring horizons will advance me
			}
		}, {
			message: ['But then gives you', '2 points']
		}, {
			advanceTest: function() {
				return false; // The scoring horizons will advance me
			}
		}, {
			message: ['Then gives you', 'another point']
		}, {
			advanceTest: function() {
				return false; // The scoring horizons will advance me
			}
		}, {
			message: ['Finally, you give your', 'opponent a point']
		}, {
			message: ['The game ends after', '6 turns'],
		}, {
			message: ['The player with the most', 'points is the winner'],
			onAdvance: function() {
				require('app/engine').changeScene('main-menu');
				Tutorial.deactivate();
				_resetGame();
				_stateMachine.reset();
			}
		}]);
	}
	
	return new Scene({
		 background: 'negative',
		 showMenu: true,

		 reset: _resetGame,
		 
		 doFrame: function(delta) {

		 	if (_paused) {
		 		// Nothing moves when paused
		 		return;
		 	}

		 	// Advance horizons
			if (_scoreHorizons.length > 0) {
				_scoreHorizons.forEach(function(horizon) { 
					horizon.do(delta);
				});
			}

			// Advance the pieces
		 	_playedPieces.forEach(function(piece) {
		 		piece.do(delta);
		 	});

		 	// Advance the current footprint
		 	if (_activePiece) {
		 		_activePiece.do(delta);
		 	}

	 		// Advance the move counters
	 		_doMoveCounter(delta);

		 	// Advances the touch prompt
		 	if (_stateMachine.is('PAUSED')) {
			 	_prompt.do(delta);
			}
		 },

		 drawFrame: function() {

		 	Graphics.circle(require('app/engine').BOARD_CENTER.x, require('app/engine').BOARD_CENTER.y, require('app/engine').BOARD_RADIUS, 'background');

		 	// DEBUG: Draw AI scores
		 	if (require('app/engine').getAI() && DEBUG_AI) {
		 		require('app/engine').getAI().getScores().forEach(function(score) {
		 			var s = Math.round(score.score * 100) / 100;
		 			Graphics.text(s, score.coords.x, score.coords.y, 4, 'debug');
		 		});
		 	}

			// draw the score horizons
			if (_scoreHorizons.length > 0) {
				Graphics.save();
				Graphics.clipToBoard();
				_scoreHorizons.forEach(function(horizon) { 
					horizon.draw();
				});
				Graphics.restore();
			}

			// Draw all the pieces
		 	_playedPieces.forEach(function(piece) {
		 		piece.draw();
		 	});

		 	// Draw the current footprint
		 	if (_activePiece) {
		 		_activePiece.draw();
		 	}

		 	// Draw the scores
	 		Graphics.text(_scores[0], 50, 38, 40, 'primary1', null, 'left');
	 		Graphics.text(_scores[1], 430, 38, 40, 'primary2', null, 'right');

	 		// Draw the move counters
	 		_drawMoveCounter(1, 30);
	 		_drawMoveCounter(2, 450);

		 	// Draw the touch prompt
		 	if (_stateMachine.is('PAUSED') && !Tutorial.isActive()) {
			 	_prompt.draw();
			}
		 },

		 onActivate: function() {
		 	_toggleMenu(true);

		 	if (_stateMachine.can('NEWGAME')) {
		 		_resetGame();
		 		_stateMachine.go('NEWGAME');
		 	}
		 	else if (_activePlayer === 1 && require('app/engine').getAI() && _stateMachine.can('SCORE')) {
		 		// Get the bot to place a piece
		 		_playedPieces.push(require('app/engine').getAI().play(_playedPieces, MOVES - _movesLeft[1]));
		 		_movesLeft[1]--;
		 		_activePlayer = 1;
		 		_score();
		 	}
		 	else if (_activePlayer === 1 && _stateMachine.can('NEXTPLAYER')) {
		 		_activePlayer = 2;
		 		_stateMachine.go('NEXTPLAYER');
		 	} else if (_activePlayer === 2 && _stateMachine.can('SCORE')) {
		 		_activePlayer = 1;
	 			_score()
		 	} else if (_stateMachine.can('NEXTTURN')) {
		 		_resetTurn();
		 	}

	 		// Calculate AI scores
	 		if (DEBUG_AI && require('app/engine').getAI()) {
	 			require('app/engine').getAI().think(_playedPieces, MOVES - _movesLeft[1]);
	 		}
		 },

		 onDeactivate: function() {
		 	_toggleMenu(false);
		 },

		 onInputStart: function(coords, e) {

		 	// Pass the event on to the menu bar, if necessary
		 	if (e && MenuBar.handleEvent(e)) { return; }

		 	if (_movesLeft[_getNextPlayer() - 1] === 0 && _stateMachine.can('GAMEOVER')) {
	 			require('app/engine').changeScene('game-over', _scores);
	 			_stateMachine.go('GAMEOVER')
		 	}
		 	else if (_stateMachine.can('UNPAUSE')) {
		 		require('app/engine').changeScene('stage-screen');
		 		_stateMachine.go('UNPAUSE');
		 	}
		 	else if ((!Tutorial.isActive() || Tutorial.canSubmit()) && _stateMachine.can('CLICKPIECE') && 
		 			_activePiece && _activePiece.contains(coords)) {
		 		_stateMachine.go('CLICKPIECE');
		 	}
		 	else if (_stateMachine.can('PLAYPIECE')) {
		 		if (!Physics.doCollisions(coords, _playedPieces)) {
		 			// Couldn't find a valid place
		 			return;
		 		}
		 		if (!_activePiece) {
		 			_activePiece = new Piece(coords, Piece.Type.FOOTPRINT, _activePlayer);
		 			Audio.play('CHOICE' + _getSoundNumber());
		 		} else {
		 			_activePiece.move(coords);
		 		}
		 		_stateMachine.go('PLAYPIECE');
		 	}
		 },

		 onInputStop: function()  {
		 	if (_stateMachine.can('SUBMIT')) {
		 		// Submit the active piece
		 		_activePiece.submit();
		 		_moveTransition = 1;

		 		_playedPieces.push(_activePiece);
		 		_activePiece = null;
		 		_movesLeft[_activePlayer - 1]--;
		 		_stateMachine.go('SUBMIT');
		 		Audio.play('CONFIRM' + _getSoundNumber());

		 		if (!Tutorial.isActive()) {
			 		E.fire('playPiece', {
		 				playerNumber: _activePlayer		 			
		 			});
			 		setTimeout(function() {
			 			require('app/engine').changeScene('stage-screen');
			 		}, SUBMIT_DELAY);
			 	}
		 	}
		 	else if (_stateMachine.can('STOP')) {
		 		_stateMachine.go('STOP');
		 	}
		 },

		 onInputMove: function(coords) {
		 	if (_stateMachine.can('MOVE') && _activePiece) {
		 		if (!Physics.doCollisions(coords, _playedPieces)) {
		 			// Couldn't find a valid place
		 			return;
		 		}
		 		_activePiece.move(coords);
		 		_stateMachine.go('MOVE');
		 	}
		 },

		 startTutorial: _startTutorial
	});
});