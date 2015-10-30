/**
 *  CocoonJS Scaler
 *  scales programmatically, in a manner compatible with CocoonJS
 *  (c) doublespeak games 2015  
 **/
define(['app/scalers/scaler'], function(Scaler){

    var TARGET_SCALE = 2; // Bring us to 1280x960 native

    var _verticalPad = 0
    ,   _horizontalPad = 0
    ,   _scaledHeight
    ,   _scaledWidth
    ; 

    return new Scaler({
        scaleCoords: function(coords) {
            var G = require('app/graphics');

            // Scale
            coords.x /= this._scale;
            coords.y /= this._scale;

            return coords;
        },

        scaleCanvas: function(canvas) {
            var G = require('app/graphics');

            _scaledHeight = Math.round(G.height() * this._scale)
            _scaledWidth = Math.round(G.width() * this._scale)

            // Size and position the canvas
            canvas.width = _scaledWidth;
            canvas.height = _scaledHeight;

            console.log('CANVAS SIZE: ' + canvas.width + ', ' + canvas.height);
        },

        scaleValue: function(value) { 
            return Math.round(value * this._scale); 
        },

        scalePoint: function(point, fromBottom, fixed) {

            if (fixed) {
                console.log('FIXED ' + this.scaleValue(point.x) + ', ' + (_scaledHeight - point.y));
                return {
                    x: this.scaleValue(point.x),
                    y: _scaledHeight - point.y
                };
            }

            point = {
                x: this.scaleValue(point.x),
                y: this.scaleValue(point.y)
            };

            // Support positioning from bottom
            if (fromBottom) {
                point.y = _scaledHeight - _verticalPad - point.y;
            }

            return point;
        },

        getCorner: function() {
            var G = require('app/graphics');
            return this.scalePoint({ x: G.width(), y: 0 }, true);
        },

        setScale: function() {
            // Disregard everything and do what I want!
            this._scale = TARGET_SCALE;
        }
    });
});