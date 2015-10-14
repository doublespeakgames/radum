/**
 *	Piece
 *	game-piece that can be played to the board
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/util', 'app/touch-prompt', 'app/tween', 
		'app/tween-manager'], 
	function(Graphics, Util, TouchPrompt, Tween, TweenManager) {

	var RADIUS = 25
	, CREATE_TIME = 200
	, MOVE_TIME = 400
	, PULSE_TIME = 200
	, PULSE_MAX = 1.5
	, BORDER_WIDTH = 4
	, FONT_SIZE = 36
	, MAX_LEVEL = 3
	, HOT_ZONE = 1
	;

	function Piece(coords, type, player) {
		this._coords = coords;
		this._type = type;
		this._player = player;
		this._real = true;
		this._scale = 0.4;
		this._prompt = new TouchPrompt(coords, 'primary' + player);
		this._active = type === Piece.Type.FOOTPRINT;
		this._label = null;
		this._drawPos = null;
		this._level = 1;
		this._colourTransition = 100;
		this._tweenManager = new TweenManager();

		this._tweenManager.add(new Tween({
			target: this,
			property: '_scale',
			start: 0.4,
			end: 1,
			duration: CREATE_TIME
		}).start());
	}

	Piece.Type = {
		FOOTPRINT: 0,
		SENTRY: 1
	};

	Piece.RADIUS = RADIUS;

	Piece.prototype = {
		do: function(delta) {

			if (this._real && this._type === Piece.Type.FOOTPRINT && this._active) {
				this._prompt.do(delta);
			}

			this._tweenManager.run(delta);
		},
		draw: function() {
			if (this._real || (!this._real && this._scale > 0)) {
				var colour, border, alpha = 1, radius = RADIUS, drawX, drawY;
				switch(this._type) {
					case Piece.Type.FOOTPRINT:
						colour = null;
						border = 'primary' + this._player;
						alpha = 0.8;
						break;
					case Piece.Type.SENTRY:
						colour = 'primary' + this._player;
						border = 'primary' + this._player + 
							'->secondary' + this._player +
							';' + this._colourTransition;
						break;
				}

				if (this._drawPos) {
					drawX = this._drawPos.x;
					drawY = this._drawPos.y;
				} else {
					drawX = this._coords.x;
					drawY = this._coords.y;
				}

				Graphics.circle(
					drawX, 
					drawY, 
					(radius - 1) * this._scale, 
					colour, 
					null,
					null,
					this._colourTransition / 100,
					this._type === Piece.Type.TARGET,
					this._type === Piece.Type.TARGET_FORECAST);

				Graphics.circle(
					drawX, 
					drawY, 
					radius * this._scale, 
					null, 
					border,
					BORDER_WIDTH * this._scale,
					alpha,
					this._type === Piece.Type.TARGET,
					this._type === Piece.Type.TARGET_FORECAST);

				if (this._label) {
					Graphics.text(
						this._label.text, 
						this._coords.x - 1, 
						this._coords.y - 1, 
						FONT_SIZE * this._scale, 
						this._label.colour,
						'negative',
						'center',
						false,
						this._labelOpacity
					);
				}

				if (this._level > 1) {
					Graphics.circle(
						drawX,
						drawY,
						radius * 0.7 * this._scale,
						null,
						'secondary' + this._player,
						3
					);
				}

				if (this._level > 2) {
					Graphics.circle(
						drawX,
						drawY,
						radius * 0.4 * this._scale,
						null,
						'secondary' + this._player,
						3
					);
				}
			}

			if (this._real && this._type === Piece.Type.FOOTPRINT && this._active) {
				this._prompt.draw();
			}
		},
		move: function(coords) {
			this._coords = coords;
			this._prompt._coords = coords;
		},
		applyVector: function(vector) {
			this._coords.x += vector.x;
			this._coords.y += vector.y;
		},
		collidesWith: function(piece) {
			return Util.distance(this._coords, piece.getCoords()) < RADIUS * 2;
		},
		contains: function(coords, pieceCollision) {
			return Math.sqrt(Math.pow(this._coords.x - coords.x, 2) + 
				Math.pow(this._coords.y - coords.y, 2)) <= (pieceCollision ? RADIUS * 2 : RADIUS * HOT_ZONE);
		},
		getReboundVector: function(coords) {
			var distance = Util.distance(this._coords, coords)
			, delta = RADIUS * 2 - distance
			, dx = coords.x - this._coords.x
			, dy = coords.y - this._coords.y
			;

			if (delta > 0) {

				// If we're perfectly aligned (how unlikely!), fudge just a little
				if (dx === 0 && dy === 0) {
					dx += (Math.random() * 0.2) - 0.1;
					dy += (Math.random() * 0.2) - 0.1;

					distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				}

				return {
					x: delta * (dx / distance),
					y: delta * (dy / distance)
				};
			}
			return {x: 0, y: 0};
		},
		getCoords: function(clone) {
			if (clone) {
				return {
					x: this._coords.x,
					y: this._coords.y
				};
			}

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
		makeSentry: function() {
			this._type = Piece.Type.SENTRY;
			this._tweenManager.add(new Tween({
				target: this,
				property: '_colourTransition',
				start: 0,
				end: 100,
				duration: CREATE_TIME,
				mapping: Tween.IntegerMapping
			}).start());
		},
		submit: function(noAnimation) {
			this._real = false;
			if (noAnimation) {
				this._tweenManager.clear();
			} else {
				this._tweenManager.add(new Tween({
					target: this,
					property: '_scale',
					duration: CREATE_TIME,
					start: 1,
					end: 0				
				}).start());
			}
		},
		reveal: function() {
			this._real = true;
			this._active = false;
			this._tweenManager.add(new Tween({
				target: this,
				property: '_scale',
				duration: CREATE_TIME,
				start: 0,
				end: 1				
			}).start());
		},
		setLabel: function(label) {
			this._label = label;
			this._labelOpacity = 1;
		},
		removeLabel: function() {
			this._tweenManager.add(new Tween({
				target: this,
				property: '_labelOpacity',
				start: 1,
				end: 0,
				duration: CREATE_TIME
			}).on('complete', function() {
				this._label = null;
			}.bind(this)).start());
		},
		setReal: function(real) {
			this._real = real;
		},
		pulse: function() {
			this._tweenManager.add(new Tween({
				// Bigger
				target: this,
				property: '_scale',
				start: 1,
				end: PULSE_MAX,
				duration: PULSE_TIME
			}).on('complete', function() {
				this._tweenManager.add(new Tween({
					// Smaller
					target: this,
					property: '_scale',
					start: PULSE_MAX,
					end: 1,
					duration: PULSE_TIME
				}).start());
			}.bind(this)).start());
		},
		animateMove: function(from) {
			this._drawPos = from;
			this._tweenManager.add(new Tween({
				target: this,
				property: '_drawPos',
				start: this._drawPos,
				end: this._coords,
				duration: MOVE_TIME,
				mapping: Tween.PointMapping
			}).on('complete', function() {
				this._drawPos = null;
			}.bind(this)).start());
		},
		levelUp: function() {
			this._level++;
			this._level = this._level > MAX_LEVEL ? MAX_LEVEL : this._level;
		},
		resetLevel: function() {
			this._level = 1;
		},
		getLevel: function() {
			return this._level;
		},
		pointValue: function() {
			return Math.pow(2, this._level - 1);
		}
	};

	return Piece;
});