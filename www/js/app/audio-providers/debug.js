/**
 *  Debug Provider
 *  audio provider that just logs stuff
 *  (c) doublespeak games 2015  
 **/
define(['app/promise'], function(Promise) {
    
    return {
        play: function(fn) { console.log('[Audio] playing ' + fn); },
        load: function(fn) { console.log('[Audio] loading ' + fn); },
        init: function()   { console.log('[Audio] initializing'); return Promise.resolve(true); },
        startMusic: function() { console.log('[Audio] starting music'); }
    };
    
});