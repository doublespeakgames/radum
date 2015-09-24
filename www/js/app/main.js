/**
 *	Radum
 *	(c) doublespeak games 2015	
 **/
require(['app/analytics', 'app/engine', 'app/graphics', 'app/audio'], 
		function(Analytics, Engine, Graphics, Audio) {
           
   Promise.all([ 
    	Analytics.init(),
        Graphics.init(),
        Engine.init(),
        Audio.init({
            silent: window.location.search.indexOf('silent') >= 0
        })
    ]).then(Engine.start);
});