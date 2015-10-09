define(['app/promise'], function(Promise) {
    
    var _context = null
    ,   _audioBuffers = {}
    ,   _music
    ;
    
    function _createSoundSource(fileName) {
        var source = _context.createBufferSource();
        source.buffer = _audioBuffers[fileName];
        source.connect(_context.destination);
        
        return source;
    }
    
    function _isSoundReady(fileName) {
        return !!_audioBuffers[fileName];
    }
    
    function _loadSound(fileName) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("GET", fileName, true);
            request.responseType = "arraybuffer";
            request.onload = function() {
                _context.decodeAudioData(request.response, function(buffer) {
                    _audioBuffers[fileName] = buffer;
                    resolve(true);
                });
            };
            request.send();
        });
    }

    function _loadMusic(fileName) {
        return new Promise(function(resolve, reject) {
            _music = document.createElement('audio');
            _music.addEventListener('canplay', function() { 
                resolve(true); 
            });
            _music.setAttribute('src', fileName);
            _music.setAttribute('loop', true);
            _music.setAttribute('preload', 'auto');
            _music.load();
        });
    }
    
    var HtmlAudioProvider = {
        init: function() {
            if(typeof AudioContext !== 'undefined') {
                _context = new AudioContext();
            } else if(typeof webkitAudioContext !== 'undefined') {
                _context = new webkitAudioContext();
            } else {
                return null;
            }

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
                if (document[hidden]) {
                    _music.pause();
                } else {
                    _music.play();
                }
            }

            document.addEventListener(visibilityChange, handleVisibilityChange, false);
        },
        
        load: function(fileName, isMusic) {
            if (isMusic) {
                // Use an HTML audio because it loads fast and can be paused
                return _loadMusic(fileName);
            } else {
                // Use the Web Audio API so we can layer sound effects
                return _loadSound(fileName);
            }
        },

        play: function(fileName) {
            if(!_isSoundReady(fileName)) {
                throw "Attempting to play unloaded file " + fileName;
            }

            _createSoundSource(fileName).start();
        },

        startMusic: function() {
            if (!_music) {
                throw "Attempting to play unloaded music.";
            }

            _music.play();
        }
    };
    return HtmlAudioProvider;
});