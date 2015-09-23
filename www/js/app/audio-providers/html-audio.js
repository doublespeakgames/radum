define(['app/promise'], function(Promise) {
    
    var _context = null
    ,   _audioBuffers = {}
    ,   _music
    ;
    
    function _createSoundSource(fileName, isMusic) {
        var source = _context.createBufferSource();
        source.buffer = _audioBuffers[fileName];
        source.connect(_context.destination);
        if(isMusic) {
            // Loop
            source.loop = true;
            _music = source;
        }
        
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
                    // TODO: Pause music
                } else {
                    // TODO: Resume music
                }
            }

            document.addEventListener(visibilityChange, handleVisibilityChange, false);
        },
        
        load: function(fileName, isMusic) {
            if (isMusic) {
                // TODO: Use an Audio element to efficiently stream music
                return _loadSound(fileName);
            } else {
                // Use the Web Audio API so we can layer sound effects
                return _loadSound(fileName);
            }
        },

        play: function(fileName, isMusic) {
            if(!_isSoundReady(fileName)) {
                throw "Attempting to play unloaded file " + fileName;
            }

            if (isMusic) {
                music = fileName;
            }

            _createSoundSource(fileName, isMusic).start();
        }
    };
    return HtmlAudioProvider;
});