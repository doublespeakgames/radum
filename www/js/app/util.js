/**
 *	Utils
 *	common useful utilities
 *	(c) doublespeak games 2015	
 **/
define([], function() {
	
	/* Merges an object into another, overwriting properties if necessary */
	function _merge(mergeInto, mergeFrom) {
		for (var prop in mergeFrom) {
			if (mergeFrom.hasOwnProperty(prop)) {
				mergeInto[prop] = mergeFrom[prop];
			}
		}
		return mergeInto;
	}

	/* Gets time at as high a resolution as possible */
	function _time() {
		return typeof performance === 'object' ? performance.now() : Date.now();
	}

	/* Prevents a function from being called more than once every [delay] milliseconds */
	function _timeGate(func, delay) {
		var lastCall = null;
		return function() {
			if (lastCall !== null && _time() - lastCall < delay) {
				return;
			}
			lastCall =_time();
			return func.apply(this, arguments);
		}
	}

	/* Calculates the distance between two points */
	function _distance(p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	}

	return {
		merge: _merge,
		time: _time,
		timeGate: _timeGate,
		requestFrame: window.requestAnimationFrame ?
			window.requestAnimationFrame.bind(window) : 
			function(callback) { return setTimeout(callback, 30); },
		distance: _distance
	};
});