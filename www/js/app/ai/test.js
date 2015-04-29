define(['app/util', 'app/piece'], function(Util, Piece) {

	// Early-game weights
	var FRIENDLY_LEVEL1 = 1
	, FRIENDLY_LEVEL2 = 1
	, FRIENDLY_LEVEL3 = -0.5
	, ENEMY_LEVEL1 = 1
	, ENEMY_LEVEL2 = 0.5
	, ENEMY_LEVEL3 = -0.5

	// Late-game weights
	, LATE_FRIENDLY_LEVEL1 = 0
	, LATE_FRIENDLY_LEVEL2 = 1
	, LATE_FRIENDLY_LEVEL3 = -5
	, LATE_ENEMY_LEVEL1 = 0
	, LATE_ENEMY_LEVEL2 = 0.5
	, LATE_ENEMY_LEVEL3 = -5

	// Distance from the center where the initial piece may fall (scale of radius)
	, INITIAL_RADIUS = 0.5
	;

	function _getSliceHeight(x, radius) {
		return 2 * Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2));
	}

	function _getPieceWeight(piece, movesLeft) {
		if (this._playerNum === piece.ownerNumber()) {
			switch(piece.getLevel()) {
				case 1:
					return movesLeft > 2 ? FRIENDLY_LEVEL1 : LATE_FRIENDLY_LEVEL1;
				case 2:
					return movesLeft > 2 ? FRIENDLY_LEVEL2 : LATE_FRIENDLY_LEVEL2;
				case 3:
					return movesLeft > 2 ? FRIENDLY_LEVEL3 : LATE_FRIENDLY_LEVEL3;
			}
		} else {
			switch(piece.getLevel()) {
				case 1:
					return movesLeft > 2 ? ENEMY_LEVEL1 : LATE_ENEMY_LEVEL1;
				case 2:
					return movesLeft > 2 ? ENEMY_LEVEL2 : LATE_ENEMY_LEVEL2;
				case 3:
					return movesLeft > 2 ? ENEMY_LEVEL3 : LATE_ENEMY_LEVEL3;
			}
		}
	}

	function _calculateScore(pos, pieces, radius, movesLeft) {
		var score = 0;

		pieces.forEach(function(piece) {
			if (score === null || !piece.isReal()) { return; }
			var d = 1 - (Util.distance(piece.getCoords(), pos) - Piece.RADIUS * 2) / (radius * 2 - Piece.RADIUS * 2);
			if (piece.contains(pos, true)) {
				score = null;
			} else {
				score += Math.log10(d * 100) * _getPieceWeight(piece, movesLeft);
			}
		});

		return score;
	}

	function _getScores(pieces, movesLeft) {
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
					score: _calculateScore(coords, pieces, this._boardRadius, movesLeft)		
				};
				if (score.score !== null && (this._best === null || score.score > this._best.score)) {
					this._best = score;
				}
				this._scores.push(score);
			}
		}
	}

	function _getInitial() {
		var theta = Math.random() * Math.PI * 2
		, r = Math.random() * this._boardRadius * INITIAL_RADIUS
		, x = Math.cos(theta) * r
		, y = Math.sin(theta) * r
		;

		return {
			x: this._boardCenter.x + x,
			y: this._boardCenter.y + y
		};
	}

	function _playPiece(pieces, movesLeft) {
		if (pieces.length <= 1) {
			// First piece
			return new Piece(_getInitial.call(this), Piece.Type.FOOTPRINT, this._playerNum);
		} else {
			_getScores.call(this, pieces, movesLeft);
			return new Piece(this._best.coords, Piece.Type.FOOTPRINT, this._playerNum);
		}
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