/**
 *  CocoonJS Scaler
 *  scales programmatically, in a manner compatible with CocoonJS
 *  (c) doublespeak games 2015  
 **/
define(['app/scalers/scaler'], function(Scaler){

    var _verticalPad = 0
    ,   _horizontalPad = 0
    ,   _scaledHeight
    ,   _scaledWidth
    ,   _visualScale = 1
    ; 

    return new Scaler({
        scaleCoords: function(coords) {
            var G = require('app/graphics');

            // Scale
            coords.x /= _visualScale;
            coords.y /= _visualScale;

            coords.y -= _verticalPad / 2;

            coords.x /= this._scale;
            coords.y /= this._scale;

            return coords;
        },

        scaleCanvas: function(canvas) {
            var G = require('app/graphics')
            ,   rWidth = G.realWidth()
            ,   rHeight = G.realHeight()
            ,   aspectRatio = rHeight / rWidth
            ;

            _scaledHeight = Math.round(G.height() * this._scale);
            _scaledWidth = Math.round(G.width() * this._scale);

            var targetHeight = _scaledWidth * aspectRatio;
            if (targetHeight > _scaledHeight) {
                _verticalPad = targetHeight - _scaledHeight;
                _scaledHeight += _verticalPad;
            }

            _visualScale = rWidth / _scaledWidth;

            // Size and position the canvas
            canvas.width = _scaledWidth;
            canvas.height = _scaledHeight;
            canvas.style.width = rWidth + 'px';
        },

        scaleValue: function(value) { 
            return Math.round(value * this._scale); 
        },

        scalePoint: function(point, fromBottom, fixed) {

            if (fixed) {
                return {
                    x: this.scaleValue(point.x),
                    y: _scaledHeight - this.scaleValue(point.y)
                };
            } else if (fromBottom) {
                return {
                    x: this.scaleValue(point.x),
                    y: _scaledHeight - this.scaleValue(point.y) 
                };
            } else {
                return {
                    x: this.scaleValue(point.x),
                    y: this.scaleValue(point.y) + (_verticalPad / 2)
                };
            }
        },

        getCorner: function() {
            var G = require('app/graphics');
            return this.scalePoint({ x: G.width(), y: 0 }, true);
        },

        setScale: function(scale, pixelRatio) {
            this._scale = pixelRatio * (pixelRatio <= 2 ? 2 : 1);
        },

        logicalBottom: function() {
            return require('app/graphics').height() + (_verticalPad / this._scale);
        }
    });
});