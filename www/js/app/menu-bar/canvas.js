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
    , MENU_TOP = 80
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
            x: Graphics.getScaler().scaleValue(Graphics.width()) - CLOSED_HEIGHT,
            y: 0,
            width: CLOSED_HEIGHT,
            height: CLOSED_HEIGHT
        };
    };

    function _coordsInMenu(coords) {
        var scale = Graphics.getScaler()._scale;

        coords = { x: coords.x, y: coords.y };
        coords.y -= Graphics.getScaler().logicalBottom();
        coords.y += (_open ? OPEN_HEIGHT : CLOSED_HEIGHT) / scale;
        coords.y *= scale;

        return {
            x: coords.x * scale,
            y: coords.y
        };
    }

    function _drawBurger(offset) {
        var burger = _burger();

        for (var i = 0; i < 3; i++) {
            Graphics.stretchedCircle(
                burger.x + 20, 
                offset.y + burger.y + 12 + (8 * i), 
                2, 
                20, 
                _open ? 'negative' : 'menu', 
                1
            );
        }

        if (DEBUG) {
            Graphics.rect(
                burger.x,
                burger.y + offset.y, 
                burger.width, 
                burger.height, 
                _open ? 'negative' : 'menu'
            );
        }
    }

    function _draw() {

        var scaler = Graphics.getScaler()
        ,   offset = scaler.scalePoint({ 
                x: 0, 
                y: 0
        }, true);

        offset.y -= _open ? OPEN_HEIGHT : CLOSED_HEIGHT;

        Graphics.disableScaling(true);

        Graphics.rect(
            offset.x - BORDER_WIDTH,
            offset.y,
            scaler.scaleValue(Graphics.width()) + (BORDER_WIDTH * 2),
            (_open ? OPEN_HEIGHT : CLOSED_HEIGHT) + BORDER_WIDTH,
            _open ? 'negative' : 'menu',
            _open ? 'menu' : 'negative',
            BORDER_WIDTH
        );

        _drawBurger(offset);

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            Graphics.text(
                box.text, 
                scaler.scaleValue(box.width) / 2,
                box.y + offset.y + 20,
                MENU_FONTSIZE, 
                'negative',
                null, 
                'center', 
                false, 
                1
            );

            if (DEBUG) {
                Graphics.rect(
                    box.x + offset.x, 
                    box.y + offset.y, 
                    scaler.scaleValue(box.width), 
                    box.height, 
                    _open ? 'negative' : 'menu'
                );
            }
        });

        Graphics.disableScaling(false);
    };

    function _handleEvent(coords, e) {
        var handled = false;

        coords = _coordsInMenu(coords);
        console.log(coords);
        console.log(_burger());

        if (_inBox(coords, _burger())){
            _toggleMenu();
            return true;
        }

        Object.keys(MENU_ITEMS).forEach(function(key) {
            var box = MENU_ITEMS[key];
            if (_inBox(coords, box)) {
                handled = true;
                box.action();
            }
        });

        return handled || (_open && coords.y > 0);
    }

    function _inBox(coords, box) {
        return coords.x > box.x && coords.x < box.x + box.width &&
               coords.y > box.y && coords.y < box.y + box.height;
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