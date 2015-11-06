/**
 *	Radum
 *	(c) doublespeak games 2015	
 **/
require(['app/analytics', 'app/engine', 'app/graphics', 'app/audio', 'app/event-manager', 'app/promise'], 
		function(Analytics, Engine, Graphics, Audio, E, Promise) {
           
   Promise.all([ 
    	Analytics.init(),
        Graphics.init(),
        Engine.init(),
        Audio.init({
            silent: window.location.search.indexOf('silent') >= 0
        })
    ]).then(E.fire.bind(null, 'loading-complete'));
});