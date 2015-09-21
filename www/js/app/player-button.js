/**
 *  PlayerButton
 *  manages the add/delete button and text entry for players
 *  in the tournament lobby
 *  (c) doublespeak games 2015  
 **/
define(['app/util', 'app/graphics', 'app/tween', 'app/tween-manager'], 
    function(Util, Graphics, Tween, TweenManager) {

    var ANIM_DURATION = 150
    ,   ENTRY_WIDTH = 300
    ,   BUTTON_WIDTH = 40
    ,   DEBUG = false
    ,   CARAT_SPEED = 800
    ,   CARAT_WIDTH = 3
    ,   CARAT_HEIGHT = 20
    ,   MAX_TEXT = 10
    ;
    
    var PlayerButton = function(options) {
        this.tweenManager = new TweenManager();
        this.x = options.x;
        this.y = options.y;
        this.state = PlayerButton.State.ADD;
        this.width = 0;
        this.text = '';
        this.carat = 0;
        this.scale = 0;

        this.tweenManager.add(new Tween({
            target: this,
            property: 'scale',
            start: 0,
            end: 1,
            duration: ANIM_DURATION,
            stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
        }).start());
    };

    function _textFull(button) {
        return button.text.length >= MAX_TEXT;
    }

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
            case PlayerButton.State.DELETE:
                return {
                    x: button.x + (button.width - BUTTON_WIDTH) / 2,
                    y: button.y - BUTTON_WIDTH / 2,
                    width: BUTTON_WIDTH,
                    height: BUTTON_WIDTH
                };
            }
    }

    PlayerButton.prototype = {
        
        do: function(delta) {
            this.tweenManager.run(delta);
            if (this.state === PlayerButton.State.TEXT_ENTRY) {
                this.carat += delta;
                this.carat %= CARAT_SPEED;
            }
        },

        draw: function() {

            if (this.width === 0) {
                Graphics.circle(
                    this.x, 
                    this.y, 
                    (BUTTON_WIDTH / 2) * this.scale,
                    'negative'
                );
            } else {
                Graphics.stretchedCircle(
                    this.x, 
                    this.y, 
                    (BUTTON_WIDTH / 2) * this.scale,
                    this.width,
                    'negative'
                );
            }

            Graphics.text(
                this.state === PlayerButton.State.DELETE ? '-' : '+', 
                this.x + this.width / 2, 
                this.y, 20, 'menu', 
                null, 
                null, 
                null, 
                1 - this.width / ENTRY_WIDTH
            );

            Graphics.text(
                '✓', 
                this.x + this.width / 2, 
                this.y, 
                20, 
                'menu',
                null,
                null,
                null,
                this.width / ENTRY_WIDTH
            );

            if (this.text) {
                Graphics.text(
                    this.text, 
                    Graphics.width() / 2,
                    this.y, 
                    20, 
                    this.state === PlayerButton.State.DELETE ? 'negative' : 'menu'
                );
            }

            if (this.state === PlayerButton.State.TEXT_ENTRY && 
                    this.carat < CARAT_SPEED / 2 &&
                    !_textFull(this)) {
                Graphics.rect(
                    this.x + 1 + Graphics.textWidth(this.text, 20) / 2,
                    this.y - CARAT_HEIGHT / 2,
                    CARAT_WIDTH,
                    CARAT_HEIGHT,
                    null,
                    'menu'
                );
            }

            if (DEBUG) {
                var box = _getHitbox(this);
                Graphics.rect(box.x, box.y, box.width, box.height);
            }
        },

        addChar: function(c) {
            if (!_textFull(this)) {
                this.text += c;
            }
        },

        deleteChar: function() {
            this.text = this.text.substring(0, this.text.length - 2);
        },

        isClicked: function(coords) {
            
            var box = _getHitbox(this);

            return (coords.x > box.x && coords.x < box.x + box.width &&
                coords.y > box.y && coords.y < box.y + box.height);
        },

        clear: function() {
            if (this.state === PlayerButton.State.DELETE) {
                return;
            }

            this.text = '';
            this.state = PlayerButton.State.ADD;
            this.width = 0;
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

            this.tweenManager.add(new Tween({
                target: this,
                property: 'x',
                start: Graphics.width() / 2,
                end: (Graphics.width() + ENTRY_WIDTH) / 2,
                duration: ANIM_DURATION,
                stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
            }).start());

            this.state = PlayerButton.State.DELETE;
        },

        moveVertical: function(amount) {
            this.tweenManager.add(new Tween({
                target: this,
                property: 'y',
                start: this.y,
                end: this.y + amount,
                duration: ANIM_DURATION,
                stepping: Tween.BezierStepping(0.25, 0.1, 0.25, 0.1)
            }).start());
        }
    };

    PlayerButton.State = {
        ADD: 1,
        TEXT_ENTRY: 2,
        DELETE: 3      
    };

    return PlayerButton;
});