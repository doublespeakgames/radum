/**
 *	Scene Store
 *	retrieve scenes by name
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/game-board', 'app/scenes/main-menu', 'app/scenes/stage-screen'], function(GameBoard, MainMenu, StageScreen) {

	return {
		get: function(sceneName) {
			return require('app/scenes/' + sceneName);
		}
	};
});