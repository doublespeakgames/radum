/**
 *  Audio
 *  abstraction for playing platform-agnostic audio
 *  (c) doublespeak games 2015  
 **/
define(['app/audio-providers/html-audio', 'app/promise'], function(AudioProvider, Promise) {
    
    var _silent = false;
    var _theme = 'theme';
    var _sfx = {
        CHOICE1: 'choice1',
        CHOICE2: 'choice2',
        CHOICE3: 'choice3',
        CHOICE4: 'choice4',
        CONFIRM1: 'confirm1',
        CONFIRM2: 'confirm2',
        CONFIRM3: 'confirm3',
        CONFIRM4: 'confirm4',
        SCORE1: 'score1',
        SCORE2: 'score2',
        SCORE3: 'score3',
        SCORE4: 'score4',
        SCORE5: 'score5',
        SCORE6: 'score6',
        FINAL: 'final',
        READY: 'ready',
        SELECT: 'select'
    };

    function _play(file) {
        if (_silent) { return; }
        AudioProvider.play(_getPath(_sfx[file], _format));
    }

    function _getFormat() {
        var a = new Audio();
        if (!!(a.canPlayType && a.canPlayType('audio/ogg;').replace(/no/, ''))) {
            return "ogg";
        }
        if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))) {
            return "mp3";
        }
        // Shouldn't need more formats
        return null;
    }

    function _getPath(file, format) {
        return 'audio/' + file + '.' + format;
    }

    function _init(options) {

        _format = _getFormat();

        _silent = options.silent || !_format || !AudioProvider.init();
        if (_silent) {
            return Promise.resolve(true);
        }

        var loadPromises = Object.keys(_sfx).map(function(sfxKey) {
            return AudioProvider.load(_getPath(_sfx[sfxKey], _format));
        });
        loadPromises.push(AudioProvider.load(_getPath(_theme, _format), true));

        return Promise.all(loadPromises).then(function() {
            AudioProvider.startMusic();
        });
    }

    return {
        init: _init,
        play: _play,
        startMusic: function() { if (!_silent) AudioProvider.startMusic(); }
    };
});