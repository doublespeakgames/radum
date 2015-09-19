/**
 *  Tournament Lobby
 *  scene for setting up a tournament
 *  (c) doublespeak games 2015  
 **/
define(['app/scenes/scene', 'app/graphics', 'app/audio', 'app/tween'], 
        function(Scene, Graphics, Audio, Tween) {

    var DEBUG = false
    ,   TOP_MENU = 20
    ,   PADDING = 30
    ,   MENU_SIZE = 30
    ,   PLAYERS_TOP = 100
    ,   ANIM_DURATION = 150
    ,   ENTRY_WIDTH = 400
    ,   BUTTON_WIDTH = 40
    ;

    var _hitBoxes = [{
        x: 0,
        y: 0,
        width: Graphics.width() / 2,
        height: 80,
        onTrigger: function() {
            require('app/engine').changeScene('main-menu');
        }
    },{
        x: Graphics.width() / 2,
        y: 0,
        width: Graphics.width() / 2,
        height: 80,
        enabled: _canStart,
        onTrigger: function() { console.log('play'); }
    },{
        x: Graphics.width() / 2 - 20,
        y: PLAYERS_TOP + 40,
        width: 40,
        height: 40,
        enabled: function() {
            return _canAdd() && _addButton.expansion === 0;
        },
        onTrigger: _newPlayer
    },{
        x: (Graphics.width() + ENTRY_WIDTH - BUTTON_WIDTH) / 2,
        y: PLAYERS_TOP + BUTTON_WIDTH,
        width: BUTTON_WIDTH,
        height: BUTTON_WIDTH,
        enabled: function() {
            return _addButton.expansion === 1;
        },
        onTrigger: _confirmPlayer
    }];

    var _players = []
    ,   _tweens = []
    ,   _addButton = { expansion: 0 }
    ,   _currentInput = "";
    ;

    function _newPlayer() {
        _tweens.push(new Tween({
            target: _addButton,
            property: 'expansion',
            start: 0,
            end: 1,
            duration: ANIM_DURATION,
            stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
        }).start());

        require('app/engine').toggleKeyboard(true);
    }

    function _confirmPlayer() {
        if (_currentInput.length === 0) {
            return;
        }

        _tweens.push(new Tween({
            target: _addButton,
            property: 'expansion',
            start: 1,
            end: 0,
            duration: ANIM_DURATION,
            stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
        }).on('complete', function() {
            _currentInput = '';
        }).start());
        _players.splice(0, 0, _currentInput);
        require('app/engine').toggleKeyboard(false);
    }

    function _drawAddButton() {

        Graphics.stretchedCircle(
            Graphics.width() / 2, 
            PLAYERS_TOP + BUTTON_WIDTH + 20, 
            BUTTON_WIDTH / 2,
            ENTRY_WIDTH * _addButton.expansion,
            'negative'
        );

        Graphics.setAlpha(1 - _addButton.expansion);
        Graphics.text('+', Graphics.width() / 2 + (ENTRY_WIDTH / 2) * _addButton.expansion, PLAYERS_TOP + 60, 20, 'menu');

        Graphics.setAlpha(_addButton.expansion);
        Graphics.text('✓', Graphics.width() / 2 + (ENTRY_WIDTH / 2) * _addButton.expansion, PLAYERS_TOP + 60, 20, 'menu');

        if (_currentInput) {
            Graphics.text(_currentInput, Graphics.width() / 2, PLAYERS_TOP + 60, 20, 'menu');
        }

        Graphics.setAlpha(1);
    }

    function _drawPlayers() {
        _players.forEach(function(player, idx) {
            Graphics.text(player, Graphics.width() / 2, PLAYERS_TOP + 60 + ((idx + _canAdd()) * 60), 20, 'negative');
        });
    }

    function _canAdd() {
        return _players.length < 8;
    }

    function _canStart() {
        return _players.length > 2;
    }
   
    return new Scene({
        background: 'menu',

        doFrame: function(delta) {
            Object.keys(_tweens).forEach(function(key) {
                var tween = _tweens[key];
                if (tween.run(delta).isComplete()) {
                    delete _tweens[key];
                }
            });
        },

        drawFrame: function(delta) {
            Graphics.text('back', PADDING, TOP_MENU, MENU_SIZE, 'negative', null, 'left');

            if (_canStart()) {
                Graphics.text('play', Graphics.width() - PADDING, TOP_MENU, MENU_SIZE, 'negative', null, 'right');
            }

            Graphics.text('Players', Graphics.width() / 2, PLAYERS_TOP, 30, 'negative')
            _canAdd() && _drawAddButton();
            _drawPlayers();

            if (DEBUG) {
                _hitBoxes.forEach(function(box) {
                    if (!box.enabled || box.enabled()) {
                        Graphics.rect(box.x, box.y, box.width, box.height);
                    }
                });
            }
        },

        onDeactivate: function() {
            _currentInput = '';
            _addButton.expansion = 0;
        },

        onInputStart: function(coords) {
            _hitBoxes.forEach(function(box) {
                if (coords.x > box.x && coords.x < box.x + box.width &&
                    coords.y > box.y && coords.y < box.y + box.height) {

                    if (!box.enabled || box.enabled()) {
                        Audio.play('SELECT');
                        box.onTrigger();
                    }
                }
            });
        },

        onKeyDown: function(keyCode) {
            var c = String.fromCharCode(keyCode).trim();

            if (!_canAdd()) {
                return;
            }

            if (c.length && _addButton.expansion === 0) {
                _newPlayer();
            }

            if (c) {
                _currentInput += c;
            }

            if (keyCode === 8) {
                // Backspace
                _currentInput = _currentInput.substring(0, _currentInput.length - 2);
            } else if (keyCode === 13) {
                _confirmPlayer();
            }

        }
    }); 
});