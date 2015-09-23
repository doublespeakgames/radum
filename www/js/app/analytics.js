/**
 *	Analytics
 *	simple interface for Google Analytics
 *	(c) doublespeak games 2015	
 **/
define(['google-analytics', 'app/event-manager', 'app/promise'], 
	function(ga, E, Promise) {

	var _initialized = false;

	function _trackEvent(type, desc, val) {
		if (_initialized) {
			ga('send', 'event', type, desc, val);
		}
	}

	function _init() {
		if (!_initialized) {
			try {
				ga('create', 'UA-41314886-4', 'doublespeakgames.com');
				ga('send', 'pageview');
				_initialized = true;
			} catch (e) {
				console.error('Failed to initialize analytics: ' + e.message);
			}
		}

		if (!_initialized) {
			return;
		}

		// Hook to game events
		E.on('startGame', function(e) {
			_trackEvent('Game', 'Start', e.singlePlayer);
		});
		E.on('startTutorial', _trackEvent.bind(this, 'Tutorial', 'Start'));
		E.on('gameOver', function(e) {
			_trackEvent('Game', 'End', e.singlePlayer);
		});
		E.on('toggleMenu', function(e) {
			_trackEvent('Menu', 'Toggle', e.opening);
		});
		E.on('quitToMain', _trackEvent.bind(null, 'Menu', 'Quit'));
		E.on('changeTheme', _trackEvent.bind(null, 'Menu', 'ChangeTheme'));
		E.on('playPiece', _trackEvent.bind(null, 'Game', 'PiecePlayed'));
		E.on('logoPressed', _trackEvent.bind(null, 'Menu', 'logoPressed'));

		return Promise.resolve(true);
	}

	return {
		init: _init,
		track: _trackEvent
	};
});