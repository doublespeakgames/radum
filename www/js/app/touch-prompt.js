/**
 *	Touch Prompt
 *	little pulsing animation prompting a touch/click
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/util', 'app/tween'], 
	function(Graphics, Util, Tween) {
	
	var RADIUS = 20
	, DURATION = 700
	;

	function TouchPrompt(coords, colour, fromBottom) {
		this._coords = coords;
		this._aPos = 0
		this._colour = colour;
		this._fromBottom = fromBottom;
		this._tween = new Tween({
			target: this,
			property: '_aPos',
			start: 0,
			end: 1,
			duration: DURATION,
			stepping: Tween.BezierStepping(0, 0.1, 0.5, 1),
			loop: true
		}).start();
	}

	TouchPrompt.prototype = {
		do: function(delta) {
			this._tween.run(delta);
		},
		draw: function() {
			Graphics.circle(
				this._coords.x, 
				this._coords.y, 
				RADIUS / 2, 
				this._colour, 
				null,
				0,
				1 - this._aPos,
				null,
				null,
				this._fromBottom,
				this._fromBottom && require('app/engine').CANVAS_MODE
			);
			Graphics.circle(
				this._coords.x, 
				this._coords.y, 
				(RADIUS / 2) + (RADIUS / 2) * this._aPos, 
				null,
				this._colour,
				2,
				1 - this._aPos,
				null,
				null,
				this._fromBottom,
				this._fromBottom && require('app/engine').CANVAS_MODE
			);
		}
	};

	return TouchPrompt;
});