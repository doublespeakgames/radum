/**
 *	Physics
 *  handles the interactions of pieces and stuff
 *	(c) doublespeak games 2015	
 **/
 define(['app/util'], function(Util) {

 	var MAX_COLLISION_TRIES = 10;

 	function _getBoundaryVector(coords) {
		var distance = Util.distance(coords, require('app/engine').BOARD_CENTER)
		, scale = 1
		;
		
		// Make sure the piece is on the board
		if (distance > require('app/engine').BOARD_RADIUS) {
			scale = require('app/engine').BOARD_RADIUS / distance;

			return {
				x: (scale * coords.x) + (1 - scale) * require('app/engine').BOARD_CENTER.x - coords.x,
				y: (scale * coords.y) + (1 - scale) * require('app/engine').BOARD_CENTER.y - coords.y
			};
		}

		return {x: 0, y: 0};
	}

	function _doCollisions(coords, playedPieces, tries) {
		var totalRebound = _getBoundaryVector(coords);

		tries = tries || 0;

		playedPieces.forEach(function(staticPiece) {
			if (!staticPiece.isReal()) {
				// Spoooooky ghost piece
				return;
			}
			var rebound = staticPiece.getReboundVector(coords);
			totalRebound.x += rebound.x;
			totalRebound.y += rebound.y;
		});

		coords.x += totalRebound.x;
		coords.y += totalRebound.y;

		if (totalRebound.x != 0 || totalRebound.y != 0) {
			// Make sure there are no collisions caused by this adjustment
			if (tries >= MAX_COLLISION_TRIES) {
				// Give up if we've tried too much
				return false;
			}
			return _doCollisions(coords, playedPieces, tries + 1);
		}

		return true;
	}

	function _doFootprintCollisions(footprint1, footprint2, playedPieces, tries) {
		var total1 = _getBoundaryVector(footprint1.getCoords())
		, total2 = _getBoundaryVector(footprint2.getCoords())
		;

		tries = tries || 0;

		playedPieces.forEach(function(staticPiece) {
			var rebound1
			, rebound2
			;

			if (!staticPiece.isReal()) {
				// Spoooooky ghost piece
				return;
			}

			if (staticPiece !== footprint1) {
				rebound1 = staticPiece.getReboundVector(footprint1.getCoords());
				if (staticPiece === footprint2) {
					// Halve the rebound vector, because footprints repel each other
					rebound1.x /= 2;
					rebound1.y /= 2;
				}
				total1.x += rebound1.x;
				total1.y += rebound1.y;
			}

			if (staticPiece !== footprint2) {
				rebound2 = staticPiece.getReboundVector(footprint2.getCoords());
				if (staticPiece === footprint1) {
					// Halve the rebound vector, because footprints repel each other
					rebound2.x /= 2;
					rebound2.y /= 2;
				}
				total2.x += rebound2.x;
				total2.y += rebound2.y;
			}

		});

		footprint1.applyVector(total1);
		footprint2.applyVector(total2);

		if (total1.x !== 0 || total1.y !== 0 || total2.x !== 0 || total2.y !== 0) {
			// Make sure there are no collisions caused by this adjustment
			if (tries >= MAX_COLLISION_TRIES) {
				// Give up if we've tried too much
				return false;
			}
			return _doFootprintCollisions(footprint1, footprint2, playedPieces, tries + 1);
		}

		return true;
	}

 	return {
 		doCollisions: _doCollisions,
 		doFootprintCollisions: _doFootprintCollisions
 	};
 });