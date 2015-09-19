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
        add: function(tween) {
            this.tweens.push(tween);
            return tween;
        },
        run: function(delta) {
            this.tweens.forEach(function(tween) {
                tween.run(delta);
            });
            this.tweens = this.tweens.filter(function(tween) {
                return !tween.isComplete();
            });
        }
    };

    return TweenManager;
});