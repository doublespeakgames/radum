/**
 *	Scaler Store
 *  gets you a scaler, dude
 *	(c) doublespeak games 2015	
 **/
define(['app/scalers/native', 'app/scalers/css', 'app/scalers/javascript', 'app/scalers/cocoon'], 
    function(NativeScaler, CssScaler, JsScaler, CocoonScaler) {
	return {
		get: function(scaler) {
			return require('app/scalers/' + scaler);
		}
	};
});