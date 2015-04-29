define(['app/util', 'app/piece'], function(Util, Piece) {

	var FRIENDLY_LEVEL1 = 1
	, FRIENDLY_LEVEL2 = 1
	, FRIENDLY_LEVEL3 = -0.5
	, ENEMY_LEVEL1 = 1
	, ENEMY_LEVEL2 = 0.5
	, ENEMY_LEVEL3 = -0.5
	;

	function _getSliceHeight(x, radius) {
		return 2 * Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2));
	}

	function _getPieceWeight(piece, playerNum) {
		if (playerNum === piece.ownerNumber()) {
			switch(piece.getLevel()) {
				case 1:
					return FRIENDLY_LEVEL1;
				case 2:
					return FRIENDLY_LEVEL2;
				case 3:
					return FRIENDLY_LEVEL3;
			}
		} else {
			switch(piece.getLevel()) {
				case 1:
					return ENEMY_LEVEL1;
				case 2:
					return ENEMY_LEVEL2;
				case 3:
					return ENEMY_LEVEL3;
			}
		}
	}

	function _calculateScore(pos, playerNum, pieces, radius) {
		var score = 0;

		pieces.forEach(function(piece) {
			if (score === null) { return; }
			var d = 1 - (Util.distance(piece.getCoords(), pos) - Piece.RADIUS * 2) / (radius);
			if (piece.contains(pos, true)) {
				score = null;
			} else {
				score += Math.log10(d * 100) * _getPieceWeight(piece, playerNum);
			}
		});

		return score || 0;
	}

	function _getScores(playerNum, pieces) {
		var yPos
		, xPos
		, yBound
		, coords
		;

		this._scores.length = 0;
		for (xPos = 0; xPos <= this._boardRadius * 2; xPos += this._chunkSize) {
			yBound = _getSliceHeight(xPos, this._boardRadius) / 2;
			for (yPos = Math.ceil(this._boardRadius - yBound); yPos < this._boardRadius + yBound; yPos += this._chunkSize) {
				coords = {
					x: this._boardCenter.x - this._boardRadius + xPos,
					y: this._boardCenter.y - this._boardRadius + yPos
				};
				this._scores.push({
					coords: coords,
					score: _calculateScore(coords, playerNum, pieces, this._boardRadius)
				});
			}
		}
	}

	
	function TestAI(boardRadius, boardCenter, chunkSize) {
		this._chunkSize = chunkSize || 10;
		this._boardRadius = boardRadius;
		this._boardCenter = boardCenter;
		this._scores = [];
	}

	TestAI.prototype = {
		getScores: function() { return this._scores; },
		think: _getScores
	};

	return TestAI;
});