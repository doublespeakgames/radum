/**
 *	Piece
 *	game-piece that can be played to the board
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/util'], function(Graphics, Util) {

	var RADIUS = 25
	, CREATE_SPEED = 0.2;
	;

	function Piece(coords, player) {
		this._coords = coords;
		this._player = player;
		this._transitionScale = 0.4;
	}

	Piece.prototype = {
		draw: function() {
			Graphics.circle(
				this._coords.x, 
				this._coords.y, 
				RADIUS * this._transitionScale, 
				'primary' + this._player, 
				'secondary' + this._player);
			if (this._transitionScale < 1) {
				this._transitionScale += CREATE_SPEED;
			}
		},
		move: function(coords) {
			this._coords = coords;
		},
		contains: function(coords) {
			return Math.sqrt(Math.pow(this._coords.x - coords.x, 2) + 
				Math.pow(this._coords.y - coords.y, 2)) <= RADIUS;
		},
		getReboundVector: function(coords) {
			var distance = Util.distance(this._coords, coords)
			, delta = RADIUS * 2 - distance
			;

			if (delta > 0) {
				return {
					x: delta * ((coords.x - this._coords.x) / distance),
					y: delta * ((coords.y - this._coords.y) / distance)
				};
			}

			return {x: 0, y: 0};
		},
		getCoords: function() {
			return this._coords;
		}
	};

	return Piece;
});