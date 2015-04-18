/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/scenes/scene', 'app/graphics', 'app/state-machine', 'app/piece'], 
		function(Util, Scene, Graphics, StateMachine, Piece) {


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
	
	return new Scene({
		 background: null,

		 drawFrame: function(delta) {
		 	Graphics.circle(Graphics.width() / 2, Graphics.height() / 2, Graphics.width() / 2, 'background');
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
		 			_activePiece = new Piece(coords, 1);	
		 		} else {
		 			_activePiece.move(coords)
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
		 		_activePiece.move(coords);
		 		_stateMachine.go('MOVE');
		 	}
		 }
	});
});