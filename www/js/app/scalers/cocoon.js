/**
 *  CocoonJS Scaler
 *  scales programmatically, in a manner compatible with CocoonJS
 *  (c) doublespeak games 2015  
 **/
define(['app/scalers/scaler'], function(Scaler){

    var _verticalPad = 0
    ,   _horizontalPad = 0
    ; 

    return new Scaler({
        scaleCoords: function(coords) {
            var G = require('app/graphics');

            // Translate origin to horizontal-middle
            coords.x -= G.realWidth() / 2;
            coords.y -= G.realHeight() / 2;

            // Scale
            coords.x /= this._scale;
            coords.y /= this._scale;

            // Translate origin to top-left of canvas
            coords.x += G.width() / 2;
            coords.y += G.height() / 2;

            return coords;
        },

        scaleCanvas: function(canvas) {
            var G = require('app/graphics')
            , scaledHeight = Math.round(G.height() * this._scale)
            , scaledWidth = Math.round(G.width() * this._scale)
            ;

            // Pad the vertical to the bottom
            if (G.realHeight() > scaledHeight) {
                _verticalPad = scaledHeight;
                scaledHeight += (G.realHeight() - scaledHeight) / 2;
                _verticalPad = scaledHeight - _verticalPad;
            }

            // Gotta fill the whole screen. Canvas+ doesn't do DOM.
            if (G.realWidth() > scaledWidth) {
                _horizontalPad = (G.realWidth() - scaledWidth) / 2;
            }

            // Size and position the canvas
            canvas.width = G.realWidth() * 2;
            canvas.height = G.realHeight() * 2;
            canvas.getContext("2d").setTransform(2, 0, 0, 2, 0, 0);

            canvas.style.width = G.realWidth()  + 'px';
            canvas.style.height = G.realHeight() + 'px';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
        },

        scaleValue: function(value) { 
            return Math.round(value * this._scale); 
        },

        scalePoint: function(point, fromBottom) {

            var newPoint = {
                x: this.scaleValue(point.x) + _horizontalPad,
                y: this.scaleValue(point.y) + _verticalPad
            };

            // Support positioning from bottom
            if (fromBottom) {
                newPoint.y = require('app/graphics').realHeight() - this.scaleValue(point.y);
            }

            return newPoint;
        },

        getCorner: function() {
            var G = require('app/graphics');

            return { 
                x: G.realWidth(),
                y: G.realHeight()
            };
        }
    });
});