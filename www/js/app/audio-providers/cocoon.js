/**
 *  Cocoon Audio Provider
 *  interface for playing audio using
 *  Cocoon-compatible HTML audio
 *  (c) doublespeak games 2015  
 **/
define(['app/promise'], function(Promise) {

    var _music
    ,   _musicFile
    ;

    var CocoonAudioProvider = {
        init: function() {

            // Set the name of the hidden property and the change event for visibility
            var hidden, visibilityChange; 
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            function handleVisibilityChange() {
                if (!_music) { return; }

                if (document[hidden]) {
                    _music.pause();
                    _music.playing = false;
                } else {
                    _music.play();
                    _music.playing = true;
                }
            }

            document.addEventListener(visibilityChange, handleVisibilityChange, false);

            // document.body.addEventListener('touchend', _makeItWorkOnIPhone);

            return true;
        },
        
        load: function(fileName, isMusic) {
            if (isMusic) {
                _musicFile = fileName;
            }
            return Promise.resolve(true);
        },

        play: function(fileName) {
            var snd = new Audio(fileName);
            snd.addEventListener('ended', function() {
                // snd.dispose();
                snd.src = '';
            });
            snd.playing = true;
            snd.play();
        },

        startMusic: function() {
            _music = new Audio(_musicFile);
            _music.loop = true;
            _music.playing = true;
            _music.play();
        }
    };
    return CocoonAudioProvider;
});