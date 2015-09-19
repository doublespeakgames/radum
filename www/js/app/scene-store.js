/**
 *	Scene Store
 *	retrieve scenes by name
 *	(c) doublespeak games 2015	
 **/
define(['app/scenes/game-board', 'app/scenes/main-menu', 'app/scenes/stage-screen', 
    'app/scenes/game-over'], 
	function(GameBoard, MainMenu, StageScreen, GameOver) {

	return {
		get: function(sceneName) {
			return require('app/scenes/' + sceneName);
		}
	};
});