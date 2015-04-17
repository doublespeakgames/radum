/**
 *	Utils
 *	common useful utilities
 *	(c) doublespeak games 2015	
 **/
define({
	/* Merges an object into another, overwriting properties if necessary */
	merge: function(mergeInto, mergeFrom) {
		for (var prop in mergeFrom) {
			if (mergeFrom.hasOwnProperty(prop)) {
				mergeInto[prop] = mergeFrom[prop];
			}
		}
		return mergeInto;
	},
	time: function() {
		return performance ? performance.now : Date.now();
	},
	requestFrame: window.requestAnimationFrame ?
		window.requestAnimationFrame.bind(window) : 
		function(callback) { return setTimeout(callback, 30); }
});