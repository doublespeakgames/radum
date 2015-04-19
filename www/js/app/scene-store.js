/**
 *	Scene Store
 *	retrieve scenes by name
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/game-board', 'app/scenes/main-menu'], function(GameBoard, MainMenu) {

	return {
		get: function(sceneName) {
			return require('app/scenes/' + sceneName);
		}
	};
});