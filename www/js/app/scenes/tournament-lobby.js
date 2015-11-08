/**
 *  Tournament Lobby
 *  scene for setting up a tournament
 *  (c) doublespeak games 2015  
 **/
define(['app/scenes/scene', 'app/graphics', 'app/audio', 'app/tween', 
        'app/player-button', 'app/tournament'], 
        function(Scene, Graphics, Audio, Tween, PlayerButton, Tournament) {

    var DEBUG = false
    ,   TOP_MENU = 20
    ,   PADDING = 30
    ,   MENU_SIZE = 30
    ,   PLAYERS_TOP = 100
    ,   MAX_PLAYERS = 8
    ;

    var _hitBoxes = [{
        x: 0,
        y: 0,
        width: Graphics.width() / 2,
        height: 80,
        onTrigger: function() {
            Audio.play('READY');
            require('app/engine').changeScene('main-menu');
        }
    },{
        x: Graphics.width() / 2,
        y: 0,
        width: Graphics.width() / 2,
        height: 80,
        enabled: _canStart,
        onTrigger: _startTournament
    }];

    var _buttons = [new PlayerButton({
            x: Graphics.width() / 2,
            y: PLAYERS_TOP + 60
        })]
    ,   _currentInput = "";
    ;

    function _getInputButton() {
        var button = _buttons[0];
        return button.state === PlayerButton.State.DELETE ? null : button;
    }

    function _newPlayer() {
        _playSound();
        _getInputButton().expand();
        require('app/engine').toggleKeyboard(true);
    }

    function _confirmPlayer() {
        if (_getInputButton().text.length === 0) {
            return;
        }

        require('app/engine').toggleKeyboard(false);

        _playSound(true);
        _getInputButton().collapse();

        if (_canAdd()) {
            setTimeout(function() {
                _buttons.forEach(function(button) {
                    button.moveVertical(60);
                });
                _buttons.splice(0, 0, new PlayerButton({
                    x: Graphics.width() / 2,
                    y: PLAYERS_TOP + 60
                }));
            }, 0);
        }
    }

    function _deletePlayer(player) {
        _playSound(true);
        var idx = _buttons.indexOf(player);
        _buttons.splice(idx, 1);
        if (_numPlayers() === MAX_PLAYERS - 1) {
            for(idx--; idx >= 0; idx--) {
                _buttons[idx].moveVertical(60);
            }
            _buttons.splice(0, 0, new PlayerButton({
                x: Graphics.width() / 2,
                y: PLAYERS_TOP + 60
            }));
        } else {
            for(; idx < _buttons.length; idx++) {
                _buttons[idx].moveVertical(-60);
            }
        }
    }

    function _numPlayers() {
        var length = _buttons.length;
        if (_getInputButton()) { length--; }
        return length;
    }

    function _canAdd() {
        return _numPlayers() < MAX_PLAYERS;
    }

    function _canStart() {
        return _numPlayers() > 2;
    }

    function _startTournament() {
        Audio.play('SELECT');
        Tournament.start(_buttons.filter(function(button) {
            return button.state === PlayerButton.State.DELETE;
        }).map(function(button) {
            return button.text;
        }));
        require('app/engine').changeScene('stage-screen', 'MATCH');
    }

    function _playSound(confirm) {
        Audio.play((confirm ? 'CONFIRM' : 'CHOICE') + (Math.floor(Math.random() * 4) + 1));
    }
   
    return new Scene({
        background: 'menu',

        doFrame: function(delta) {
            _buttons.forEach(function(button) {
                button.do(delta);
            });
        },

        drawFrame: function(delta) {
            Graphics.text('back', PADDING, TOP_MENU, MENU_SIZE, 'negative', null, 'left');

            if (_canStart()) {
                Graphics.text('play', Graphics.width() - PADDING, TOP_MENU, MENU_SIZE, 'negative', null, 'right');
            }

            Graphics.text('Players', Graphics.width() / 2, PLAYERS_TOP, 30, 'negative')
            _buttons.forEach(function(button) {
                button.draw();
            });

            if (DEBUG) {
                _hitBoxes.forEach(function(box) {
                    if (!box.enabled || box.enabled()) {
                        Graphics.rect(box.x, box.y, box.width, box.height);
                    }
                });
            }
        },

        onDeactivate: function() {
            _getInputButton() && _getInputButton().clear();
        },

        onInputStart: function(coords) {

            _hitBoxes.forEach(function(box) {
                if (box.enabled && !box.enabled()) {
                    return;
                }
                if (coords.x > box.x && coords.x < box.x + box.width &&
                    coords.y > box.y && coords.y < box.y + box.height) {
                    box.onTrigger();
                }
            });

            _buttons.forEach(function(button) {
                switch (button.click(coords)) {
                    case 'ADD':
                        _newPlayer();
                        break;
                    case 'CONFIRM':
                        if (button.text.length > 0)
                        _confirmPlayer();
                        break;
                    case 'DELETE':
                        _deletePlayer(button);
                        break;
                    case 'FOCUS':
                        require('app/engine').toggleKeyboard(true);
                        break;    
                }
            });
        },

        onKeyDown: function(keyCode) {
            var c = String.fromCharCode(keyCode).trim().toUpperCase();

            if (!_getInputButton() || !_canAdd()) {
                return;
            }

            if (c.length && _getInputButton().state === PlayerButton.State.ADD) {
                _newPlayer();
            }

            if (c) {
                _getInputButton().addChar(c);
            }

            if (keyCode === 8) {
                _getInputButton().deleteChar();
            } else if (keyCode === 13) {
                _confirmPlayer();
            }
        }
    }); 
});