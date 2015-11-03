/**
 *  Canvas Menu Bar
 *  in-game options menu, built in canvas
 *  (c) doublespeak games 2015  
 **/
define(['app/event-manager', 'app/util', 'app/graphics'], function(E, Util, Graphics) {

    var CLOSED_HEIGHT = 40
    , OPEN_HEIGHT = 400
    , BORDER_WIDTH = 4
    , DEBUG = false
    , MENU_TOP = 120
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

    var _open = false;

    function _toggleMenu() {
        E.fire('toggleMenu', {
            opening: !_open
        });
        
        _open = !_open;
    };

    function _burger() {
        return {
            x: Graphics.width() - CLOSED_HEIGHT,
            y: _open ? OPEN_HEIGHT : CLOSED_HEIGHT,
            width: CLOSED_HEIGHT,
            height: CLOSED_HEIGHT
        };
    };

    function _coordsInMenu(coords) {
        return Graphics.getScaler().scalePoint(coords);
    }

    function _drawBurger() {
        var burger = _burger();

        for (var i = 0; i < 3; i++) {
            Graphics.stretchedCircle(
                burger.x + 20, 
                burger.y - 12 - (8 * i), 
                2, 
                20, 
                _open ? 'negative' : 'menu', 
                1,
                true
            );
        }

        if (DEBUG) {
            Graphics.rect(
                burger.x,
                burger.y, 
                burger.width, 
                burger.height, 
                _open ? 'negative' : 'menu',
                null,
                null,
                1,
                true
            );
        }
    }

    function _draw() {

        var scaler = Graphics.getScaler()
        ,   offset = scaler.scalePoint({ 
                x: 0, 
                y: _open ? OPEN_HEIGHT : CLOSED_HEIGHT
        }, true);

        Graphics.rect(
            -BORDER_WIDTH,
            _open ? OPEN_HEIGHT : CLOSED_HEIGHT,
            Graphics.width() + (BORDER_WIDTH * 2),
            (_open ? OPEN_HEIGHT : CLOSED_HEIGHT) + BORDER_WIDTH,
            _open ? 'negative' : 'menu',
            _open ? 'menu' : 'negative',
            BORDER_WIDTH,
            1,
            true
        );

        _drawBurger();

        if (!_open) { return; }

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            Graphics.text(
                box.text, 
                box.width / 2,
                box.y - 20,
                MENU_FONTSIZE, 
                'negative',
                null, 
                'center', 
                true, 
                1
            );

            if (DEBUG) {
                Graphics.rect(
                    box.x, 
                    box.y, 
                    box.width, 
                    box.height, 
                    _open ? 'negative' : 'menu',
                    null,
                    null,
                    1,
                    true
                );
            }
        });
    };

    function _handleEvent(coords, e) {

        coords = _coordsInMenu(coords);

        if (_inBox(coords, _burger())){
            _toggleMenu();
            return true;
        }

        if (!_open) { return false; }

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            if (_inBox(coords, box)) {
                box.action();
            }
        });

        return true;
    }

    function _inBox(coords, box) {
        var scaler = Graphics.getScaler()
        ,   boxCorner = scaler.scalePoint(box, true)
        ,   boxWidth = scaler.scaleValue(box.width)
        ,   boxHeight = scaler.scaleValue(box.height)
        ;

        return coords.x > boxCorner.x && coords.x < boxCorner.x + boxWidth &&
               coords.y > boxCorner.y && coords.y < boxCorner.y + boxHeight;
    }

    return {
        do: function(delta) { /* TODO */ },
        draw: _draw,
        init: function() { /* Nothing */ },
        isLoaded: function() { return true; },
        toggle: function() { /* Nothing */ },
        handleEvent: _handleEvent
    };
});