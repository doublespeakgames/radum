/**
 *	Engine
 *	handles game loop and input
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/event-manager', 'app/graphics', 'app/scene-store', 'app/ai/weighted', 'app/tutorial', 'app/menu-bar'], 
		function(Util, EM, Graphics, SceneStore, Bot, Tutorial, MenuBar) {
	
	var CROSSFADE_TIME = 300
	, BOARD_CENTER = {x: Graphics.width() / 2, y: Graphics.height() / 2}
	, BOARD_RADIUS = 200
	, DEBUG = true // TODO: SET THIS TO FALSE BEFORE DEPLOYING

	var _activeScene
	, _lastFrame = Util.time()
	, _sceneCrossfade = 1
	, _lastScene
	, _lastMove 
	, _ai
	;

	function _setBot(bot) {
		_ai = bot ? new Bot(2, BOARD_RADIUS, BOARD_CENTER) : null;
	}

	function _getAI() {
		return _ai;
	}

	function _reset() {
		if (_activeScene) {
			_activeScene.reset();
		}

		_changeScene('main-menu');
	}

	function _changeScene(sceneName, param, resetFirst) {

		if (_activeScene) {
			_lastScene = _activeScene;
			_lastScene.onDeactivate();
		}

		_sceneCrossfade = 0;
		_activeScene = SceneStore.get(sceneName);
		if (resetFirst) {
			_activeScene.reset();
		}
		_activeScene.activate(param);
		Graphics.toggleMenu(_activeScene.showMenu && !Tutorial.isActive());
		return _activeScene;
	}

	function _inputLocked() {
		return _sceneCrossfade < 1;
	}
	
	var _handleInputStart = Util.timeGate(function(e) {
		e = e || window.event;
		e.stopPropagation(); 
		e.preventDefault();
		// Handle wacky touch event objects
		if(e.changedTouches) {
			e = e.changedTouches[0];
		}
		if (_inputLocked()) {
			return;
		}
		_lastMove = { x: e.clientX, y: e.clientY };

		if (Tutorial.isActive() && Tutorial.isBlocking()) {
			Tutorial.advance();
		} else {
			_activeScene.onInputStart(Graphics.getScaler().scaleCoords({x: e.pageX, y: e.pageY}));
		}
	}, 200);

	var _handleInputStop = Util.timeGate(function(e) {
		if (_inputLocked()) {
			return;
		}
		_activeScene.onInputStop();
	}, 10);

	var _handleInputMove = Util.timeGate(function(e) {
		e = e || window.event;
		e.preventDefault();
		// Handle touch events
		if(e.changedTouches) {
			e = e.changedTouches[0];
		}
		if (_inputLocked()) {
			return;
		}
		if (_lastMove && e.clientX === _lastMove.x && e.clientY === _lastMove.y) {
			// Didn't actually move. Stupid Chrome.
			return;
		}
		_lastMove = { x: e.clientX, y: e.clientY };
		_activeScene.onInputMove(Graphics.getScaler().scaleCoords({x: e.clientX, y: e.clientY}));
	}, 10);

	function _init() {

		if (DEBUG && window.location.search.indexOf('spawn') >= 0) {
			// Divert to the spawning pools!
			require(['app/spawning-pool/engine'], function(SpawningPool) {
				SpawningPool.run();
			});
			return;
		}

		// Start everything
		Graphics.init();
		MenuBar.init();
		document.body.addEventListener('touchstart', _handleInputStart);
		document.body.addEventListener('mousedown', _handleInputStart);
		document.body.addEventListener('touchend', _handleInputStop);
		document.body.addEventListener('mouseup', _handleInputStop);
		document.body.addEventListener('touchmove', _handleInputMove);
		document.body.addEventListener('mousemove', _handleInputMove);

		// Start the main menu
		_changeScene('main-menu');

		// Start the gameloop
		(function gameLoop() {
			var time = Util.time()
			, delta = time - _lastFrame;
			;

			Util.requestFrame(gameLoop);
			Graphics.clear();
			if (_lastScene) {
				Graphics.setAlpha(1 - _sceneCrossfade);
				_lastScene.doFrame(delta);
				_lastScene.drawFrame();
			}
			Graphics.setAlpha(_sceneCrossfade);

			if (!Tutorial.isActive() || !Tutorial.isBlocking()) {
				_activeScene.doFrame(delta);
			}
			_activeScene.drawFrame();

			if (Tutorial.isActive()) {
				Tutorial.do(delta);
				Tutorial.draw();
			}

			if (_sceneCrossfade < 1) {
				_sceneCrossfade += delta / CROSSFADE_TIME;
				if (_sceneCrossfade >= 1) {
					_sceneCrossfade = 1;
					_lastScene = null;
				}
			}

			_lastFrame = time;
		})();
	}

	return {
		init: _init,
		reset: _reset,
		changeScene: _changeScene,
		setBot: _setBot,
		getAI: _getAI,
		BOARD_CENTER: BOARD_CENTER,
		BOARD_RADIUS: BOARD_RADIUS
	};
});