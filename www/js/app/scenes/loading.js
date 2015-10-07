/**
 *  Loading Screen
 *  scene for loading stuff
 *  (c) doublespeak games 2015  
 **/
define(['app/scenes/scene', 'app/graphics', 'app/event-manager', 
        'app/audio', 'app/tween', 'app/tween-manager', 'app/theme-store'], 
        function(Scene, Graphics, E, Audio, Tween, TweenManager, ThemeStore) {

    var RADIUS_MIN = 0
    ,   RADIUS_MAX = 50
    ,   CIRCLE_DELAY = 600
    ,   CIRCLE_DURATION = 3000
    ;

    var _circles = []
    ,   _tweenManager = new TweenManager()
    ,   _lastCircle
    ,   _themeNum = 0
    ,   _active
    ;

    function _newCircle(final) {
        _themeNum = _themeNum > ThemeStore.numThemes() - 1 ? 0 : _themeNum;
        return {
            radius: RADIUS_MIN,
            opacity: 1,
            colour: final ? 'menu' : 'menu:' + _themeNum++
        };
    }

    function _removeCircle(circle) {
        _circles.splice(_circles.indexOf(circle), 1);
    }

    function _endScene() {
        var circle = _newCircle(true);
        _active = false;

        _circles.push(circle);
        _tweenManager.add(new Tween({
            target: circle,
            property: 'radius',
            start: 0,
            end: Graphics.width(),
            duration: 1000,
            stepping: Tween.BezierStepping(0.42, 0, 1, 1)
        }).start());
        setTimeout(function() {
            require('app/engine').start();
        }, 400);
    }

    return new Scene({
        drawFrame: function() {
            Graphics.setAlpha(1);
            _circles.forEach(function(circle) {
                Graphics.circle(
                    Graphics.width() / 2,
                    Graphics.height() / 2,
                    circle.radius,
                    circle.colour,
                    null,
                    null,
                    circle.opacity
                );
            });
        },

        doFrame: function(delta) {
            _tweenManager.run(delta);

            if (!_active) { return; }

            if (_lastCircle == null || Date.now() - _lastCircle >= CIRCLE_DELAY) {
                var circle = _newCircle();
                _circles.push(circle);
                _tweenManager.add(new Tween({
                    target: circle,
                    property: 'radius',
                    start: RADIUS_MIN,
                    end: RADIUS_MAX,
                    duration: CIRCLE_DURATION,
                    stepping: Tween.BezierStepping(0, 0, 0.25, 1)
                }).on('complete', function() {
                    _removeCircle(circle);
                }).start(), new Tween({
                    target: circle,
                    property: 'opacity',
                    start: 1,
                    end: 0,
                    duration: CIRCLE_DURATION
                }).start());
                _lastCircle = Date.now();
            }
        },

        onActivate: function() {
            _active = true;
            E.on('loading-complete', _endScene);
        },
    });
});