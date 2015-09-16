/**
 *  Debug Provider
 *  audio provider that just logs stuff
 *  (c) doublespeak games 2015  
 **/
define(function() {
    
    return {
        play: function(fn) { console.log('[Audio] playing ' + fn); },
        load: function(fn) { console.log('[Audio] loading ' + fn); },
        init: function()   { console.log('[Audio] initializing'); }
    };
    
});