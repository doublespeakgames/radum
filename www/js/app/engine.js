/**
 *	Engine
 *	handles game loop and input
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/event-manager', 'app/graphics', 'app/scene-store'], 
		function(Util, EM, Graphics, SceneStore) {
	
	var CROSSFADE_TIME = 300;

	var _activeScene
	, _lastFrame = Util.time()
	, _sceneCrossfade = 1
	, _lastScene
	, _lastMove 
	;	

	function _changeScene(sceneName, param) {

		if (_activeScene) {
			_lastScene = _activeScene;
		}

		_sceneCrossfade = 0;
		_activeScene = SceneStore.get(sceneName);
		_activeScene.activate(param);
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
		_activeScene.onInputStart(Graphics.getScaler().scaleCoords({x: e.pageX, y: e.pageY}));
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
		// Start everything
		Graphics.init();
		document.body.addEventListener('touchstart', _handleInputStart);
		document.body.addEventListener('mousedown', _handleInputStart);
		document.body.addEventListener('touchend', _handleInputStop);
		document.body.addEventListener('mouseup', _handleInputStop);
		document.body.addEventListener('touchmove', _handleInputMove);
		document.body.addEventListener('mousemove', _handleInputMove);

		// Start the main menu
		// _changeScene('main-menu');
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
				_lastScene.drawFrame(delta);
			}
			Graphics.setAlpha(_sceneCrossfade);
			_activeScene.drawFrame(delta);

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
		changeScene: _changeScene
	};
});