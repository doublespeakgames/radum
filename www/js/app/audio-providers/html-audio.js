define(['app/promise'], function(Promise) {
    
    var _context = null
    ,   _audioBuffers = {}
    ,   _music
    ,   _musicSource
    ,   _musicStarted
    ,   _musicPaused
    ;
    
    function _createSoundSource(buffer) {
        var source = _context.createBufferSource();
        source.buffer = buffer;
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
        return _loadSound(fileName).then(function(){
            _music = fileName;
        });
    }

    // Screw you, Apple.
    function _makeItWorkOnIPhone() {

        // create empty buffer
        var buffer = _context.createBuffer(1, 1, 22050);
        var source = _context.createBufferSource();
        source.buffer = buffer;

        // connect to output (your speakers)
        source.connect(_context.destination);

        // play the file
        source.start();

        document.body.removeEventListener('touchend', _makeItWorkOnIPhone);
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
                if (!_music) { return; }

                if (document[hidden]) {
                    // Pause by recording our position in the music buffer
                    // then destroying it.
                    _musicPaused = (Date.now() - _musicStarted) / 1000;
                    _musicPaused %= _audioBuffers[_music].duration;
                    _musicSource.stop();
                    _musicSource = null;
                } else {
                    // Resume by starting a new music buffer, offset by the
                    // pause position.
                    HtmlAudioProvider.startMusic(_musicPaused);
                    _musicPaused = null;
                }
            }

            document.addEventListener(visibilityChange, handleVisibilityChange, false);

            document.body.addEventListener('touchend', _makeItWorkOnIPhone);

            return true;
        },
        
        load: function(fileName, isMusic) {
            if (isMusic) {
                // Use an HTML audio because it loads fast and can be paused
                // ... or maybe not, 'cause it sucks.
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

            _createSoundSource(_audioBuffers[fileName]).start();
        },

        startMusic: function(offset) {
            if (!_music) {
                throw "Attempting to play unloaded music.";
            }
            offset = offset || 0;
            if (_musicSource) { _musicSource.stop(); }
            _musicSource = _createSoundSource(_audioBuffers[_music]);
            _musicSource.loop = true;
            _musicSource.start(0, offset);
            _musicStarted = Date.now() - (offset * 1000);
        }
    };
    return HtmlAudioProvider;
});