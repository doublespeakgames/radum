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
		return performance ? performance.now() : Date.now();
	}

	/* Prevents a function from being called more than once every [delay] milliseconds */
	function _timeGate(func, delay) {
		var lastCall = null;
		return function() {
			if (lastCall !== null && _time() - lastCall < delay) {
				return;
			}
			lastCall =_time();
			func.apply(this, arguments);
		}
	}

	return {
		merge: _merge,
		time: _time,
		timeGate: _timeGate,
		requestFrame: window.requestAnimationFrame ?
			window.requestAnimationFrame.bind(window) : 
			function(callback) { return setTimeout(callback, 30); }
	};
});