/**
 *	Scaler Store
 *  gets you a scaler, dude
 *	(c) doublespeak games 2015	
 **/
define(['app/scalers/native', 'app/scalers/css'], function(NativeScaler, CssScaler) {
	return {
		get: function(scaler) {
			return require('app/scalers/' + scaler);
		}
	};
});