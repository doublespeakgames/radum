/**
 *  Audio
 *  abstraction for playing platform-agnostic audio
 *  (c) doublespeak games 2015  
 **/
define(['app/audio-providers/debug'], function(AudioProvider) {
    
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
        AudioProvider.play(_getPath(_sfx[file]));
    }

    function _getPath(file) {
        return 'audio/' + file + '.mp3'; // TODO: select Ogg or Mp3 (necessary?)
    }

    function _init() {
        AudioProvider.init();
        for (key in _sfx) {
            AudioProvider.load(_getPath(_sfx[key]));
        }
        AudioProvider.load(_getPath(_theme), true);
        AudioProvider.play(_getPath(_theme), true);
    }

    return {
        init: _init,
        play: _play
    };
});