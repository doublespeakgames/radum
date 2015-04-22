/**
 *	Piece
 *	game-piece that can be played to the board
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/util', 'app/touch-prompt'], function(Graphics, Util, TouchPrompt) {

	var RADIUS = 25
	, CREATE_TIME = 200
	, BORDER_WIDTH = 4
	;

	function Piece(coords, type, player) {
		this._coords = coords;
		this._type = type;
		this._player = player;
		this._real = true;
		this._transitionScale = 0.4;
		this._prompt = new TouchPrompt(coords, 'primary' + player);
		this._active = type === Piece.Type.FOOTPRINT;
	}

	Piece.Type = {
		FOOTPRINT: 0,
		TARGET: 1,
		TARGET_FORECAST: 2,
		SENTRY: 3
	};

	Piece.prototype = {
		draw: function(delta) {
			if (this._real || (!this._real && this._transitionScale > 0)) {
				var colour, border, alpha = 1;
				switch(this._type) {
					case Piece.Type.FOOTPRINT:
						colour = null;
						border = 'primary' + this._player;
						alpha = 0.8;
						break;
					case Piece.Type.SENTRY:
						colour = 'primary' + this._player;
						border = 'secondary' + this._player;
						break;
					case Piece.Type.TARGET:
						colour = 'negative';
						break;
					case Piece.Type.TARGET_FORCAST:
						colour = 'negative';
						alpha = 0.5;
						break
				}
				Graphics.circle(
					this._coords.x, 
					this._coords.y, 
					RADIUS * this._transitionScale, 
					colour, 
					border,
					BORDER_WIDTH * this._transitionScale,
					alpha);
			}
			if (this._transitionScale < 1 && this._real) {
				this._transitionScale += delta / CREATE_TIME;
				this._transitionScale = this._transitionScale > 1 ? 1 : this._transitionScale;
				if (this._transitionScale === 1 && this._realCallback) {
					this._realCallback();
					this._realCallback = null;
				}
			} else if (this._transitionScale > 0 && !this._real) {
				this._transitionScale -= delta / CREATE_TIME;
				this._transitionScale = this._transitionScale < 0 ? 0 : this._transitionScale;
				if (this._transitionScale === 0 && this._realCallback) {
					this._realCallback();
					this._realCallback = null;
				}
			} else if (this._real && this._type === Piece.Type.FOOTPRINT && this._active) {
				this._prompt.draw(delta);
			}
		},
		move: function(coords) {
			this._coords = coords;
			this._prompt._coords = coords;
		},
		contains: function(coords) {
			return Math.sqrt(Math.pow(this._coords.x - coords.x, 2) + 
				Math.pow(this._coords.y - coords.y, 2)) <= RADIUS / 2;
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
		},
		isReal: function() {
			return this._real;
		},
		isa: function(type) {
			return this._type === type;
		},
		ownerNumber: function() {
			return this._player;
		},
		setType: function(type) {
			this._type = type;
		},
		setReal: function(real, callback) {
			this._real = real;
			if (this._realCallback) {
				this._realCallback(true);
			}
			this._realCallback = callback
		},
		setActive: function(active) {
			this._active = this._type === Piece.Type.FOOTPRINT && active;
		}
	};

	return Piece;
});