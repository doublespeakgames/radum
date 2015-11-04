/**
 *  Canvas Menu Bar
 *  in-game options menu, built in canvas
 *  (c) doublespeak games 2015  
 **/
define(['app/event-manager', 'app/util', 'app/graphics', 'app/tween-manager', 'app/tween'], 
    function(E, Util, Graphics, TweenManager, Tween) {

    var CLOSED_HEIGHT = 40
    , OPEN_HEIGHT = 400
    , TOGGLE_DURATION = 300
    , BORDER_WIDTH = 4
    , DEBUG = false
    , MENU_TOP = 110
    , MENU_LINEHEIGHT = 90
    , MENU_FONTSIZE = 30
    , MENU_ITEMS = {
        mainMenu: {
            x: 0,
            y: MENU_TOP,
            width: Graphics.width(),
            height: 40,
            text: 'main menu',
            action: function() { E.fire('quitToMain'); require('app/engine').reset(); _toggleMenu(); }
        },
        changeTheme: {
            x: 0,
            y: MENU_TOP + MENU_LINEHEIGHT,
            width: Graphics.width(),
            height: 40,
            text: 'change theme',
            action: function() { E.fire('changeTheme'); Graphics.changeTheme(); Graphics.setBackground('negative'); }
        },
        getApp: {
            x: 0,
            y: MENU_TOP + (2 * MENU_LINEHEIGHT),
            width: Graphics.width(),
            height: 40,
            text: 'get the app',
            action: function() {  
                var e = require('app/engine'); 
                _toggleMenu(); 
                e.changeScene('nag', {
                    callback: e.changeScene.bind(null, 'main-menu'),
                    manual: true
                }); 
            }
        }
    };

    var _state = { open: false, openDegree: 0 }
    ,   _tweens = new TweenManager()
    ;

    function _toggleMenu() {
        E.fire('toggleMenu', {
            opening: !_state.open
        });

        _tweens.add(new Tween({
            target: _state,
            property: 'openDegree',
            duration: TOGGLE_DURATION,
            start: _state.open ? 1 : 0,
            end: _state.open ? 0 : 1,
            stepping: Tween.EaseOut()
        }).start());
        
        _state.open = !_state.open;
    };

    function _burger() {
        return {
            x: Graphics.width() - CLOSED_HEIGHT,
            y: _verticalOffset(),
            width: CLOSED_HEIGHT,
            height: CLOSED_HEIGHT
        };
    };

    function _coordsInMenu(coords) {
        return Graphics.getScaler().scalePoint(coords);
    }

    function _verticalOffset() {
        return CLOSED_HEIGHT + ((OPEN_HEIGHT - CLOSED_HEIGHT) * _state.openDegree);
    }

    function _drawBurger() {
        var burger = _burger()
        ,   cTransition = Math.round(_state.openDegree * 100)
        ;

        for (var i = 0; i < 3; i++) {
            Graphics.stretchedCircle(
                burger.x + 20, 
                burger.y - 12 - (8 * i), 
                2, 
                20, 
                'menu->negative;' + cTransition, 
                1,
                true
            );
        }

        if (DEBUG) {
            var hitbox = _hitBox(burger)
            ,   oldScale = Graphics.getScaler()._scale
            ;
            Graphics.suppressScaling(true);
            Graphics.rect(
                hitbox.x,
                hitbox.y, 
                hitbox.width, 
                hitbox.height, 
                'menu->negative;' + cTransition,
                null,
                null,
                _state.openDegree
            );
            Graphics.suppressScaling(false);
        }
    }

    function _draw() {

        var offset = _verticalOffset()
        ,   cTransition = Math.round(_state.openDegree * 100)
        ;

        Graphics.rect(
            -BORDER_WIDTH,
            offset,
            Graphics.width() + (BORDER_WIDTH * 2),
            offset + BORDER_WIDTH,
            'menu->negative;' + cTransition,
            'negative->menu;' + cTransition,
            BORDER_WIDTH,
            1,
            true
        );

        _drawBurger();

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            Graphics.text(
                box.text, 
                box.width / 2,
                offset - box.y,
                MENU_FONTSIZE, 
                'negative',
                null, 
                'center', 
                true, 
                _state.openDegree
            );

            if (DEBUG) {
                var hitbox = _hitBox({
                    x: box.x,
                    y: offset - box.y + 20,
                    width: box.width,
                    height: box.height
                });

                Graphics.suppressScaling(true);
                Graphics.rect(
                    hitbox.x, 
                    hitbox.y, 
                    hitbox.width, 
                    hitbox.height, 
                    'negative'
                );
                Graphics.suppressScaling(false);
            }
        });
    };

    function _handleEvent(coords, e) {

        coords = _coordsInMenu(coords);

        if (_inBox(coords, _burger())){
            _toggleMenu();
            return true;
        }

        if (!_state.open) { return false; }

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            if (_inBox(coords, { 
                    x: box.x, 
                    y: _verticalOffset() - box.y + 20,
                    width: box.width,
                    height: box.height
                 })) {

                box.action();
            }
        });

        return true;
    }

    function _hitBox(box) {
        var scaler = Graphics.getScaler()
        ,   boxCorner = scaler.scalePoint(box, true)
        ,   boxWidth = scaler.scaleValue(box.width)
        ,   boxHeight = scaler.scaleValue(box.height)
        ;

        return Object.assign({ width: boxWidth, height: boxHeight }, boxCorner);
    }

    function _inBox(coords, box) {
        var hitbox = _hitBox(box);

        return coords.x > hitbox.x && coords.x < hitbox.x + hitbox.width &&
               coords.y > hitbox.y && coords.y < hitbox.y + hitbox.height;
    }

    return {
        do: function(delta) { _tweens.run(delta); },
        draw: _draw,
        init: function() { /* Nothing */ },
        isLoaded: function() { return true; },
        toggle: function() { /* Nothing */ },
        handleEvent: _handleEvent
    };
});