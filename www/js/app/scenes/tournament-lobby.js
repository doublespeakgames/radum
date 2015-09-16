/**
 *  Tournament Lobby
 *  scene for setting up a tournament
 *  (c) doublespeak games 2015  
 **/
define([], function() {

    var DEBUG = false;

    var _hitBoxes = [{
        x: 0,
        y: 0,
        width: Graphics.width() / 2,
        height: 80,
        onTrigger: function() { console.log('back'); }
    },{
        x: Graphics.width / 2,
        y: 0,
        width: Graphics.width / 2,
        height: 80,
        onTrigger: function() { console.log('play'); }
    }];
   
    return new Scene({
        background: 'background',

        drawFrame: function(delta) {
            Graphics.text('back', 20, 10, 40, 'negative', null, 'left');
            Graphics.text('play', Graphics.width() - 20, 10, 40, 'negative', 'right');
        }
    }); 
});