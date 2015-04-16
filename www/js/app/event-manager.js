/**
 *	Event Manager
 *	handles basic non-DOM eventing
 *	(c) doublespeak games 2015	
 **/
define(function() {
	var _listeners = {};
	
	function _addListener(type, callback) {
		var list = _listeners[type];
		if (!list) {
			list = _listeners[type] = [];
		}

		list.push(callback);
	}

	function _removeListener(type, func) {
		var list = _listeners[type];

		if (!func) {
			delete _listeners[type];
			return;
		}

		if (list) {
			_listeners[type] = list.filter(function(val) {
				return val !== func;
			});
		}
	}

	function _callListeners(type) {
		var args = Array.prototype.slice.call(arguments, 1)
		, list = _listeners[type]
		;

		if (list) {
			list.forEach(function(callback) {
				callback.apply(this, args);
			});
		}
	}

	return {
		fire: _callListeners,
		on: _addListener,
		off: _removeListener
	};
});