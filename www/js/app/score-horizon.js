/**
 *	Score Horizon
 *	horizon animation that scores the board
 *	(c) doublespeak games 2015	
 **/

define(['app/util', 'app/graphics', 'app/tween', 'app/promise'], 
		function(Util, Graphics, Tween, Promise) {

	var DURATION = 5000
	, 	MAX_RADIUS = 400
	, 	OPACITY = 0.3
	,	FADEOUT_DURATION = 200
	;

	var _fadeoutTween = null;

	function ScoreHorizon(player, coords, stepCallback) {
		this._scale = 0;
		this._coords = coords;
		this._player = player;
		this._stopped = false;
		this._stepCallback = stepCallback;
		this._opacity = OPACITY;
	}
	ScoreHorizon.prototype = {
		do: function(delta) {
			if (!this._stopped && this._scale < 1) {
				this._scale += delta / DURATION;
				this._scale = this._scale >= 1 ? 1 : this._scale;
			}
			this._stepCallback && this._stepCallback(MAX_RADIUS * this._scale);
			this._fadeoutTween && this._fadeoutTween.run(delta);
		},
		draw: function() {
			Graphics.circle(
				this._coords.x 
				, this._coords.y
				, MAX_RADIUS * this._scale 
				, 'primary' + this._player
				, null 
				, 0
				, this._opacity
			);
		},
		stop: function() {
			this._stopped = true;
		},
		fadeout: function() {
			var _target = this;
			return new Promise(function(accept, reject) {
				_target._fadeoutTween = new Tween({
					target: _target,
					property: '_opacity',
					start: OPACITY,
					end: 0,
					duration: FADEOUT_DURATION
				}).on('complete', accept).start();
			});
		}
	}

	ScoreHorizon.DURATION = DURATION;
	ScoreHorizon.RATE = DURATION / MAX_RADIUS; // milliseconds per pixel

	return ScoreHorizon;
});