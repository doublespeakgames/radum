/**
 *	Radum
 *	(c) doublespeak games 2015	
 **/
require(['app/analytics', 'app/engine', 'app/audio'], 
		function(Analytics, Engine, Audio) {
            
	Analytics.init();
    Audio.init();
	Engine.init();
});