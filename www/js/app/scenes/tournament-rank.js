/**
 *  Tournament Rank Screen
 *  scene for the final score display
 *  (c) doublespeak games 2015  
 **/
define(['app/event-manager', 'app/scenes/scene', 'app/graphics', 
        'app/touch-prompt', 'app/audio'], 
    function(E, Scene, Graphics, TouchPrompt, Audio) {

    var _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'negative', true)
    ,   _scores = [0, 0]
    ;

    return new Scene({
        background: 'background',

        onActivate: function(scores) {
            E.fire('tournamentOver');
            Audio.play('FINAL');
        },

        doFrame: function(delta) {
            _prompt.do(delta);
        },

        drawFrame: function() {
            // TODO
            Graphics.text('RANKS', Graphics.width() / 2, Graphics.height() / 3, 80);

            _prompt.draw();
        },

        onInputStart: function(coords) {
            Tournament.destroyTournament();
            require('app/engine').changeScene('main-menu');
        }
    });
});