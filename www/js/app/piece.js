/**
 *	Piece
 *	game-piece that can be played to the board
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics'], function(Graphics) {

	var RADIUS = 25;

	function Piece(coords, player) {
		this._coords = coords;
		this._player = player;
	}

	Piece.prototype = {
		draw: function() {
			Graphics.circle(this._coords.x, this._coords.y, RADIUS, 'primary' + this._player, 'secondary' + this._player);
		},
		move: function(coords) {
			this._coords = coords;
		},
		contains: function(coords) {
			return Math.sqrt(Math.pow(this._coords.x - coords.x, 2) + Math.pow(this._coords.y - coords.y, 2)) <= RADIUS;
		}
	};

	return Piece;
});