define({
	/* Merges an object into another, overwriting properties if necessary */
	merge: function(mergeInto, mergeFrom) {
		for (var prop in mergeFrom) {
			if (mergeFrom.hasOwnProperty(prop)) {
				mergeInto[prop] = mergeFrom[prop];
			}
		}
		return mergeInto;
	}
});