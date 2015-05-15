/**
 *  Weighted AI
 *  decides where to go by weighting
 *	all potential locations by their
 *  distances to sentries
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/piece'], function(Util, Piece) {

	var CHUNK_SIZE = 5

	// Shitty default weights that Michael guessed
	// Rows are turns (1-6), and columns are weights as follows:
	// friendly 1, 2, 3, enemy 1, 2, 3, "gravity"
	// , DEFAULT_WEIGHTS = [
	// 	[1,    1, -0.5,    1,  0.5, -0.5,  0.1],
	// 	[1,    1, -0.5,    1,  0.5, -0.5,  0.1],
	// 	[1,    1, -0.5,    1,  0.5, -0.5,  0.1],
	// 	[0,    1,   -5,    0,  0.5,   -5,  0.1],
	// 	[0,    1,   -5,    0,  0.5,   -5,  0.1],
	// 	[0,    1,   -5,    0,  0.5,   -5,  0.1]
	// ]

	// Weights evolved from the spawning pool
	, DEFAULT_WEIGHTS = [
		[ 0.66,  0.68,  0.52, -0.76,  0.52,  0.84,  0.38],
		[-0.81,  0.30, -0.46,  0.67, -0.55, -0.37, -0.74],
		[-0.47, -0.80, -0.45,  0.50,  0.79, -0.74,  0.09],
		[-0.31, -0.98, -0.24, -0.57,  0.98, -0.14,  0.01],
		[-0.60,  0.07,  0.68,  0.73,  0.80,  0.47,  0.14],
		[-0.87, -0.08,  0.65,  0.03,  0.19,  0.18,  0.30]
	]

	// Distance from the center where the initial piece may fall (scale of radius)
	, DEFAULT_INITIAL_RADIUS = 0.5
	;

	function _getSliceHeight(x, radius) {
		return 2 * Math.sqrt(Math.pow(radius, 2) - Math.pow(x - radius, 2));
	}

	function _getTurnWeights(turn) {
		return this._weights[turn < this._weights.length ? turn : this._weights.length -1];
	}

	function _getPieceWeight(piece, turn) {
		if (this._playerNum === piece.ownerNumber()) {
			return _getTurnWeights.call(this, turn)[piece.getLevel() - 1];
		} else {
			return _getTurnWeights.call(this, turn)[piece.getLevel() + 2];
		}
	}

	function _calculateScore(pos, pieces, radius, turn) {
		var score = Math.log10((1 - (Util.distance(pos, this._boardCenter) / radius)) * 100) *  _getTurnWeights.call(this, turn)[6];
		score = score < 0 ? 0 : score;

		pieces.forEach(function(piece) {
			if (score === null || !piece.isReal()) { return; }
			var d = 1 - (Util.distance(piece.getCoords(), pos) - Piece.RADIUS * 2) / (radius * 2 - Piece.RADIUS * 2);
			if (piece.contains(pos, true)) {
				score = null;
			} else {
				score += Math.log10(d * 100) * _getPieceWeight.call(this, piece, turn);
			}
		}.bind(this));

		return score;
	}

	function _getScores(pieces, turn) {
		var yPos
		, xPos
		, yBound
		, coords
		, score
		;

		this._scores.length = 0;
		this._best = null;
		for (xPos = 0; xPos <= this._boardRadius * 2; xPos += CHUNK_SIZE) {
			yBound = _getSliceHeight(xPos, this._boardRadius) / 2;
			for (yPos = Math.ceil(this._boardRadius - yBound); yPos < this._boardRadius + yBound; yPos += CHUNK_SIZE) {
				coords = {
					x: this._boardCenter.x - this._boardRadius + xPos,
					y: this._boardCenter.y - this._boardRadius + yPos
				};
				score = {
					coords: coords,
					score: _calculateScore.call(this, coords, pieces, this._boardRadius, turn)		
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
		, r = Math.random() * this._boardRadius * this._initialRadius
		, x = Math.cos(theta) * r
		, y = Math.sin(theta) * r
		;

		return {
			x: this._boardCenter.x + x,
			y: this._boardCenter.y + y
		};
	}

	function _playPiece(pieces, turn) {
		var piece;
		if (pieces.length <= 1) {
			// First piece
			piece = new Piece(_getInitial.call(this), Piece.Type.FOOTPRINT, this._playerNum);
		} else {
			_getScores.call(this, pieces, turn);
			piece = new Piece(this._best.coords, Piece.Type.FOOTPRINT, this._playerNum);
		}

		piece.setReal(false);
		return piece;
	}
	
	function WeightedAI(playerNum, boardRadius, boardCenter, weights, initialRadius) {
		this._playerNum = playerNum;
		this._boardRadius = boardRadius;
		this._boardCenter = boardCenter;
		this._weights = weights || DEFAULT_WEIGHTS;
		this._initialRadius = initialRadius || DEFAULT_INITIAL_RADIUS;
		this._scores = [];
		this._best = null;
	}

	WeightedAI.prototype = {
		getScores: function() { return this._scores; },
		think: _getScores,
		play: _playPiece
	};

	return WeightedAI;
});