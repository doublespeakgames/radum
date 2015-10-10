/**
 *  TweenManager
 *  manages groups of tweens
 *  (c) doublespeak games 2015  
 **/
define(function() {
    
    var TweenManager = function() {
        this.tweens = [];
    };

    TweenManager.prototype = {
        add: function() {
            this.tweens.push.apply(this.tweens, arguments);
        },
        run: function(delta) {
            this.tweens.forEach(function(tween) {
                tween.run(delta);
            });
            this.tweens = this.tweens.filter(function(tween) {
                return !tween.isComplete();
            });
        },
        clear: function() {
            this.tweens.length = 0;
        },
        empty: function() {
            return this.tweens.length === 0;
        }
    };

    return TweenManager;
});