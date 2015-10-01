/**
 *  Tournament Rank Screen
 *  scene for the final score display
 *  (c) doublespeak games 2015  
 **/
define(['app/event-manager', 'app/scenes/scene', 'app/graphics', 
        'app/touch-prompt', 'app/audio', 'app/tween-manager', 'app/tween',
        'app/tournament'], 
    function(E, Scene, Graphics, TouchPrompt, Audio, TweenManager, Tween,
             Tournament) {

    var DURATION = 300
    ,   LINE_HEIGHT = 40
    ;

    var _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'negative', true)
    ,   _tweenManager = new TweenManager()
    ,   _standings
    ,   _waiting
    ;

    function _showRank(index) {
        _tweenManager.add(new Tween({
            target: _standings[index],
            property: 'opacity',
            start: 0,
            end: 1,
            duration: DURATION
        }).on('complete', function() {
            setTimeout(function() {
                if (_standings.length > index + 1) {
                    _showRank(index + 1);
                }
            }, 500);
        }).start());

        _tweenManager.add(new Tween({
            target: _standings[index],
            property: 'y',
            start: _standings[index].y,
            end: _standings[index].y - (LINE_HEIGHT / 2 * index),
            duration: DURATION
        }).on('complete', function() {
            if (_standings.length > index + 1) {
                setTimeout(function() {
                    _showRank(index + 1);
                }, 500);
            } else {
                _waiting = true;
            }
        }).start());

        for(var i = index - 1; i >= 0; i--) {
            (function(target) {
                _tweenManager.add(new Tween({
                    target: target,
                    property: 'y',
                    start: target.y,
                    end: target.y + LINE_HEIGHT / 2,
                    duration: DURATION
                }).start());
            })(_standings[i]);
        }
    }

    // TODO: REmove me!
    window.test = function() {
        Tournament.start(['Three', 'Four', 'One', 'Two']);
        var p = Tournament.get().players;
        p[0].points = 3;
        p[1].points = 4;
        p[2].points = 1;
        p[3].points = 2;
        require('app/engine').changeScene('tournament-rank');
    }

    return new Scene({
        background: 'menu',

        onActivate: function(scores) {
            E.fire('tournamentOver');
            Audio.play('FINAL');

            _standings = Tournament.get().players.map(function(player) {
                return {
                    name: player.name,
                    points: player.points,
                    x: Graphics.width() / 2,
                    y: Graphics.height() / 2,
                    size: 30,
                    opacity: 0
                };
            }).sort(function(a, b) {
                return b.points - a.points;
            });

            _waiting = false;

            setTimeout(_showRank.bind(null, 0), 1000);
        },

        doFrame: function(delta) {
            _tweenManager.run(delta);
            _prompt.do(delta);
        },

        drawFrame: function() {
            
            _standings.forEach(function(standing) {
                Graphics.text(
                    standing.name + '  ' + standing.points, 
                    standing.x, 
                    standing.y, 
                    standing.size, 
                    'negative',
                    null, 
                    'center', 
                    false, 
                    standing.opacity
                );
            });

            if (_waiting) {
                _prompt.draw();
            }
        },

        onInputStart: function(coords) {
            if (!_waiting) {
                return;
            }

            Tournament.destroyTournament();
            require('app/engine').changeScene('main-menu');
        }
    });
});