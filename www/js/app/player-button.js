/**
 *  PlayerButton
 *  manages the add/delete button and text entry for players
 *  in the tournament lobby
 *  (c) doublespeak games 2015  
 **/
define(['app/util', 'app/graphics', 'app/tween', 'app/tween-manager'], 
    function(Util, Graphics, Tween, TweenManager) {

    var ANIM_DURATION = 150
    ,   ENTRY_WIDTH = 400
    ,   BUTTON_WIDTH = 40
    ,   DEBUG = false
    ;
    
    var PlayerButton = function(options) {
        this.tweenManager = new TweenManager();
        this.x = options.x;
        this.y = options.y;
        this.state = PlayerButton.State.ADD;
        this.width = 0;
        this.text = '';
    };

    function _getHitbox(button) {
        switch(button.state) {
            case PlayerButton.State.ADD:
                return {
                    x: button.x - BUTTON_WIDTH / 2,
                    y: button.y - BUTTON_WIDTH / 2,
                    width: BUTTON_WIDTH,
                    height: BUTTON_WIDTH
                };
            case PlayerButton.State.TEXT_ENTRY:
                return {
                    x: button.x + (button.width - BUTTON_WIDTH) / 2,
                    y: button.y - BUTTON_WIDTH / 2,
                    width: BUTTON_WIDTH,
                    height: BUTTON_WIDTH
                };
            case PlayerButton.State.DELETE:
                return {
                    x: button.x + button.width,
                    y: button.y - BUTTON_WIDTH / 2,
                    width: BUTTON_WIDTH,
                    height: BUTTON_WIDTH
                };
            }
    }

    PlayerButton.prototype = {
        
        do: function(delta) {
            this.tweenManager.run(delta);
        },

        draw: function() {

            if (this.width === 0) {
                Graphics.circle(
                    this.x, 
                    this.y, 
                    BUTTON_WIDTH / 2,
                    'negative'
                );
            } else {
                Graphics.stretchedCircle(
                    this.x, 
                    this.y, 
                    BUTTON_WIDTH / 2,
                    this.width,
                    'negative'
                );
            }

            Graphics.setAlpha(1 - this.width / ENTRY_WIDTH);
            Graphics.text('+', this.x + this.width / 2, this.y, 20, 'menu');

            Graphics.setAlpha(this.width / ENTRY_WIDTH);
            Graphics.text('✓', this.x + this.width / 2, this.y, 20, 'menu');

            if (this.text) {
                Graphics.text(this.text, this.x, this.y, 20, 'menu');
            }

            Graphics.setAlpha(1);

            if (DEBUG) {
                var box = _getHitbox(this);
                Graphics.rect(box.x, box.y, box.width, box.height);
            }
        },

        addChar: function(c) {
            this.text += c;
        },

        deleteChar: function() {
            this.text = this.text.substring(0, this.text.length - 2);
        },

        isClicked: function(coords) {
            
            var box = _getHitbox(this);

            return (coords.x > box.x && coords.x < box.x + box.width &&
                coords.y > box.y && coords.y < box.y + box.height);
        },

        expand: function() {
            if (this.state !== PlayerButton.State.ADD) {
                return;
            }

            this.tweenManager.add(new Tween({
                target: this,
                property: 'width',
                start: 0,
                end: ENTRY_WIDTH,
                duration: ANIM_DURATION,
                stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
            }).start());

            this.state = PlayerButton.State.TEXT_ENTRY;
        },

        collapse: function() {
            if (this.state !== PlayerButton.State.TEXT_ENTRY) {
                return;
            }

            this.tweenManager.add(new Tween({
                target: this,
                property: 'width',
                start: ENTRY_WIDTH,
                end: 0,
                duration: ANIM_DURATION,
                stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
            }).start());

            this.state = PlayerButton.State.ADD;
        }
    };

    PlayerButton.State = {
        ADD: 1,
        TEXT_ENTRY: 2,
        DELETE: 3      
    };

    return PlayerButton;
});