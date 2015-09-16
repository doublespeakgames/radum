/**
 *  Tween
 *  lightweight system for animating properties
 *  (c) doublespeak games 2015  
 **/
define(['app/util', 'app/bezier-easing'], function(Util, BezierEasing) {
    
    /**
     * Options must contain:
     * target       The object to modify
     * property     Name of the property to modify
     * duration     the duration of the tween, in millis
     * start        Initial value
     * end          Final value
     * 
     * Options may contain:
     * stepping     Function that maps time [0, 1] to progress [0, 1]. 
     *              Defaults to linear.
     * mapping      Function that maps progress [0, 1] to output.
     *              Defaults to Integer
     * loop         Whether to loop the tween. Defaults to false.
     */
    var Tween = function(options) {
        this._options = Util.merge({
            stepping: Tween.LinearStepping(),
            mapping: Tween.IntegerMapping,
            loop: false
        }, options);
        this.time = 0;
        this.running = false;
        this.handlers = {};
    };

    /* Public class methods */
    Tween.prototype = {
        // Starts the tween
        start: function() { 
            this.running = true; 
            return this;
        }

        // Stops the tween
        , stop: function() { 
            this.running = false; 
            return this;
        }

        // boolean Whether the tween is completed 
        , isComplete: function() { 
            return !this._options.loop && this.time === 1; 
        }

        // Runs the tween forward a certain number of millis
        , run: function(delta) {
            if (!this.running) { return; }
            this.time += delta / this._options.duration;
            if (this.time >= 1 && this._options.loop) {
                this.time %= 1;
            } else if (this.time >= 1) { 
                this.time = 1;
                this.running = false;
                _runHandlers(this, 'complete');
            }
            this._options.target[this._options.property] = 
                this._options.mapping(
                    this._options.start, 
                    this._options.end, 
                    this._options.stepping(this.time)
                );

            return this;
        }

        // Attaches an event handler 
        , on: function(event, handler) {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push(handler);
            return this;
        }
    };

    /* Steppings */
    Tween.LinearStepping = function() {
        return function(t) {
            return t;
        };
    };
    Tween.BezierStepping = function(a, b, c, d) {
        var easing = BezierEasing(a, b, c, d);
        return function(t) {
            return easing.get(t);
        };
    };

    /* Mappings */
    Tween.IntegerMapping = function(start, end, progress) {
        return (end - start) * progress;
    };

    /* Private functions */
    function _runHandlers(tween, event) {
        var handlers = tween.handlers[event] || [];
        handlers.forEach(function(handler) {
            handler();
        });
    }

    return Tween;
});