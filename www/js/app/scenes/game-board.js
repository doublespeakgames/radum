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

	var _activePiece = null;

	function _distance(p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	}

	function _getValidCoords(coords) {
		var distance = _distance(coords, BOARD_CENTER)
		, scale = 1
		;
		
		// Make sure the piece is on the board
		if (distance > BOARD_RADIUS) {
			scale = BOARD_RADIUS / distance;
			coords.x = (scale * coords.x) + (1 - scale) * BOARD_CENTER.x;
			coords.y = (scale * coords.y) + (1 - scale) * BOARD_CENTER.y;
		}
		return coords;
	}
	
	return new Scene({
		 background: null,

		 drawFrame: function(delta) {
		 	Graphics.circle(BOARD_CENTER.x, BOARD_CENTER.y, BOARD_RADIUS, 'background');
		 	if (_activePiece) {
		 		_activePiece.draw();
		 	}
		 },

		 onInputStart: function(coords) {
		 	if (_stateMachine.can('CLICKPIECE') && _activePiece && _activePiece.contains(coords)) {
		 		_stateMachine.go('CLICKPIECE');
		 	}
		 	else if (_stateMachine.can('PLAYPIECE')) {
		 		if (!_activePiece) {
		 			_activePiece = new Piece(_getValidCoords(coords), 1);	
		 		} else {
		 			_activePiece.move(_getValidCoords(coords));
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
		 		_activePiece.move(_getValidCoords(coords));
		 		_stateMachine.go('MOVE');
		 	}
		 }
	});
});