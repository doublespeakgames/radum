/**
 *	Touch Prompt
 *	little pulsing animation prompting a touch/click
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/util'], function(Graphics, Util) {
	
	var RADIUS = 20
	, DURATION = 800
	;

	function TouchPrompt(coords, colour) {
		this._coords = coords;
		this._aPos = 0;
		this._colour = colour;
	}

	TouchPrompt.prototype.draw = function(delta) {
		this._aPos += delta / DURATION;
		if (this._aPos > 1) {
			this._aPos %= 1;
		}
		Graphics.circle(
			this._coords.x, 
			this._coords.y, 
			RADIUS / 2, 
			this._colour, 
			null,
			0,
			1 - this._aPos
		);
		Graphics.circle(
			this._coords.x, 
			this._coords.y, 
			(RADIUS / 2) + (RADIUS / 2) * this._aPos, 
			null,
			this._colour,
			2,
			1 - this._aPos
		);
	};

	return TouchPrompt;
});