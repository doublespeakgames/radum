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

	function _getPieceWeight(piece) {
		if (this._playerNum === piece.ownerNumber()) {
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

	function _calculateScore(pos, pieces, radius) {
		var score = 0;

		pieces.forEach(function(piece) {
			if (score === null || !piece.isReal()) { return; }
			var d = 1 - (Util.distance(piece.getCoords(), pos) - Piece.RADIUS * 2) / (radius * 2 - Piece.RADIUS * 2);
			if (piece.contains(pos, true)) {
				score = null;
			} else {
				score += Math.log10(d * 100) * _getPieceWeight(piece);
			}
		});

		return score || 0;
	}

	function _getScores(pieces) {
		var yPos
		, xPos
		, yBound
		, coords
		, score
		;

		this._scores.length = 0;
		this._best = null;
		for (xPos = 0; xPos <= this._boardRadius * 2; xPos += this._chunkSize) {
			yBound = _getSliceHeight(xPos, this._boardRadius) / 2;
			for (yPos = Math.ceil(this._boardRadius - yBound); yPos < this._boardRadius + yBound; yPos += this._chunkSize) {
				coords = {
					x: this._boardCenter.x - this._boardRadius + xPos,
					y: this._boardCenter.y - this._boardRadius + yPos
				};
				score = {
					coords: coords,
					score: _calculateScore(coords, pieces, this._boardRadius)		
				};
				if (this._best === null || score.score > this._best.score) {
					this._best = score;
				}
				this._scores.push(score);
			}
		}
	}

	function _playPiece(pieces) {
		_getScores(pieces);
		return new Piece(this._best.coords, Piece.Type.FOOTPRINT, this._playerNum);
	}
	
	function TestAI(playerNum, boardRadius, boardCenter, chunkSize) {
		this._playerNum = playerNum;
		this._chunkSize = chunkSize || 10;
		this._boardRadius = boardRadius;
		this._boardCenter = boardCenter;
		this._scores = [];
		this._best = null;
	}

	TestAI.prototype = {
		getScores: function() { return this._scores; },
		think: _getScores,
		play: _playPiece
	};

	return TestAI;
});