/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/scenes/scene', 'app/graphics', 'app/state-machine', 'app/piece'], 
		function(Util, Scene, Graphics, StateMachine, Piece) {


	var BOARD_CENTER = {x: Math.round(Graphics.width() / 2), y: Math.round(Graphics.height() / 2)}
	, BOARD_RADIUS = Math.floor(Graphics.width() / 2) - 30;
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
			SUBMIT: 'IDLE' // TODO
		}
	}, 'IDLE');

	var _activePiece = null,
	_playedPieces = [new Piece({x: 180, y: 320}, 2), new Piece({x: 130, y: 320}, 2), new Piece({x: 250, y: 320}, 2), new Piece({x: 30, y: 320}, 2)]
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
			var rebound = staticPiece.getReboundVector(coords);
			totalRebound.x += rebound.x;
			totalRebound.y += rebound.y;
		});

		totalRebound.x = totalRebound.x < 0 ? Math.floor(totalRebound.x) : Math.ceil(totalRebound.x);
		totalRebound.y = totalRebound.y < 0 ? Math.floor(totalRebound.y) : Math.ceil(totalRebound.y);

		coords.x += totalRebound.x;
		coords.y += totalRebound.y;

		if (totalRebound.x != 0 || totalRebound.y != 0) {
			// Make sure there are no collisions caused by this adjustment
			console.log(tries);
			if (tries >= 5) {
				// Give up if we've tried too much
				return false;
			}
			return _doCollisions(coords, tries + 1);
		}

		return true;
	}
	
	return new Scene({
		 background: null,

		 drawFrame: function(delta) {
		 	Graphics.circle(BOARD_CENTER.x, BOARD_CENTER.y, BOARD_RADIUS, 'background');
		 	_playedPieces.forEach(function(piece) {
		 		piece.draw();
		 	});
		 	if (_activePiece) {
		 		_activePiece.draw();
		 	}
		 },

		 onInputStart: function(coords) {
		 	if (_stateMachine.can('CLICKPIECE') && _activePiece && _activePiece.contains(coords)) {
		 		_stateMachine.go('CLICKPIECE');
		 	}
		 	else if (_stateMachine.can('PLAYPIECE')) {
		 		if (!_doCollisions(coords)) {
		 			// Couldn't find a valid place
		 			return;
		 		}
		 		if (!_activePiece) {
		 			_activePiece = new Piece(coords, 1);
		 		} else {
		 			_activePiece.move(coords);
		 		}
		 		_stateMachine.go('PLAYPIECE');
		 	}
		 },

		 onInputStop: function()  {
		 	if (_stateMachine.can('SUBMIT')) {
		 		// TODO
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