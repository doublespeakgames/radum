/**
 *	Engine
 *	handles game loop and input
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/event-manager', 'app/graphics', 'app/scene-store', 
		'app/ai/weighted', 'app/tutorial'], 
		function(Util, EM, Graphics, SceneStore, Bot, Tutorial) {
	
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
	, _keyTarget
	, _keyboardOpen
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
			_activeScene.onInputStart(Graphics.getScaler().scaleCoords({x: e.pageX, y: e.pageY}), e);
		}
	}, 200);

	var _handleInputStop = Util.timeGate(function(e) {
		if (_inputLocked()) {
			return;
		}
		_activeScene.onInputStop(e);
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
		_activeScene.onInputMove(Graphics.getScaler().scaleCoords({x: e.clientX, y: e.clientY}), e);
	}, 10);

	function _handleKeyDown(e) {
		e = e || window.event;
		e.preventDefault();

		_activeScene.onKeyDown && _activeScene.onKeyDown(e.keyCode);

		if (DEBUG) {
			console.log('KEYDOWN: ' + e.keyCode);
		}

		return false;
	}

	function _toggleKeyboard(open) {

		_keyboardOpen = open;

		if (!_keyTarget) {
			_keyTarget = document.createElement('input');
			_keyTarget.className = 'keyboard_target';
			_keyTarget.addEventListener('blur', function() { _keyboardOpen && _keyTarget.focus(); });
		}	

		if (open && !_keyboardOpen) {
			document.body.appendChild(_keyTarget);
			_keyTarget.focus();
		} else if(!open && _keyboardOpen) {
			document.body.removeChild(_keyTarget);
			_keyTarget.blur();
		}
	}

	function _init() {
		if (DEBUG && window.location.search.indexOf('spawn') >= 0) {
			// Divert to the spawning pools!
			require(['app/spawning-pool/engine'], function(SpawningPool) {
				SpawningPool.run();
			});
			return;
		}

		_changeScene('loading');

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

		return Promise.resolve(true);
	}

	function _start() {

		// Start everything
		document.body.addEventListener('touchstart', _handleInputStart);
		document.body.addEventListener('mousedown', _handleInputStart);
		document.body.addEventListener('touchend', _handleInputStop);
		document.body.addEventListener('mouseup', _handleInputStop);
		document.body.addEventListener('touchmove', _handleInputMove);
		document.body.addEventListener('mousemove', _handleInputMove);
		document.body.addEventListener('keydown', _handleKeyDown);

		// Start the main menu
		_changeScene('main-menu');
	}

	return {
		init: _init,
		start: _start,
		reset: _reset,
		changeScene: _changeScene,
		toggleKeyboard: _toggleKeyboard,
		setBot: _setBot,
		getAI: _getAI,
		BOARD_CENTER: BOARD_CENTER,
		BOARD_RADIUS: BOARD_RADIUS
	};
});