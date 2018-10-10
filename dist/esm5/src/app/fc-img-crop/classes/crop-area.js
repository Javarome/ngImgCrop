/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropCanvas } from "./crop-canvas";
/** @enum {string} */
var CropAreaType = {
    Square: 'square',
    Circle: 'circle',
};
export { CropAreaType };
/**
 * @abstract
 */
var /**
 * @abstract
 */
CropArea = /** @class */ (function () {
    function CropArea(_ctx, _events) {
        this._ctx = _ctx;
        this._events = _events;
        this._minSize = 80;
        this._image = new Image();
        this._x = 0;
        this._y = 0;
        this._size = 200;
        this._cropCanvas = new CropCanvas(_ctx);
    }
    /**
     * @return {?}
     */
    CropArea.prototype.getImage = /**
     * @return {?}
     */
    function () {
        return this._image;
    };
    /**
     * @param {?} image
     * @return {?}
     */
    CropArea.prototype.setImage = /**
     * @param {?} image
     * @return {?}
     */
    function (image) {
        this._image = image;
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype.getX = /**
     * @return {?}
     */
    function () {
        return this._x;
    };
    ;
    /**
     * @param {?} x
     * @return {?}
     */
    CropArea.prototype.setX = /**
     * @param {?} x
     * @return {?}
     */
    function (x) {
        this._x = x;
        this._dontDragOutside();
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype.getY = /**
     * @return {?}
     */
    function () {
        return this._y;
    };
    ;
    /**
     * @param {?} y
     * @return {?}
     */
    CropArea.prototype.setY = /**
     * @param {?} y
     * @return {?}
     */
    function (y) {
        this._y = y;
        this._dontDragOutside();
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype.getSize = /**
     * @return {?}
     */
    function () {
        return this._size;
    };
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    CropArea.prototype.setSize = /**
     * @param {?} size
     * @return {?}
     */
    function (size) {
        this._size = Math.max(this._minSize, size);
        this._dontDragOutside();
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype.getMinSize = /**
     * @return {?}
     */
    function () {
        return this._minSize;
    };
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    CropArea.prototype.setMinSize = /**
     * @param {?} size
     * @return {?}
     */
    function (size) {
        this._minSize = size;
        this._size = Math.max(this._minSize, this._size);
        this._dontDragOutside();
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype._dontDragOutside = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var h = this._ctx.canvas.height;
        /** @type {?} */
        var w = this._ctx.canvas.width;
        if (this._size > w) {
            this._size = w;
        }
        if (this._size > h) {
            this._size = h;
        }
        if (this._x < this._size / 2) {
            this._x = this._size / 2;
        }
        if (this._x > w - this._size / 2) {
            this._x = w - this._size / 2;
        }
        if (this._y < this._size / 2) {
            this._y = this._size / 2;
        }
        if (this._y > h - this._size / 2) {
            this._y = h - this._size / 2;
        }
    };
    ;
    /**
     * @return {?}
     */
    CropArea.prototype.draw = /**
     * @return {?}
     */
    function () {
        this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
    };
    ;
    return CropArea;
}());
/**
 * @abstract
 */
export { CropArea };
if (false) {
    /** @type {?} */
    CropArea.prototype._minSize;
    /** @type {?} */
    CropArea.prototype._cropCanvas;
    /** @type {?} */
    CropArea.prototype._image;
    /** @type {?} */
    CropArea.prototype._x;
    /** @type {?} */
    CropArea.prototype._y;
    /** @type {?} */
    CropArea.prototype._size;
    /** @type {?} */
    CropArea.prototype._ctx;
    /** @type {?} */
    CropArea.prototype._events;
    /**
     * @abstract
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    CropArea.prototype._drawArea = function (ctx, centerCoords, size) { };
    /**
     * @abstract
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    CropArea.prototype.processMouseMove = function (mouseCurX, mouseCurY) { };
    /**
     * @abstract
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    CropArea.prototype.processMouseDown = function (mouseDownX, mouseDownY) { };
    /**
     * @abstract
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    CropArea.prototype.processMouseUp = function (mouseDownX, mouseDownY) { };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1hcmVhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7SUFHdkMsUUFBUyxRQUFRO0lBQ2pCLFFBQVMsUUFBUTs7Ozs7O0FBR25COzs7QUFBQTtJQVFFLGtCQUFzQixJQUFJLEVBQVksT0FBTztRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFBO1FBQVksWUFBTyxHQUFQLE9BQU8sQ0FBQTt3QkFQeEIsRUFBRTtzQkFFSixJQUFJLEtBQUssRUFBRTtrQkFDZixDQUFDO2tCQUNELENBQUM7cUJBQ0UsR0FBRztRQUduQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3pDOzs7O0lBRUQsMkJBQVE7OztJQUFSO1FBQ0UsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7OztJQUVELDJCQUFROzs7O0lBQVIsVUFBUyxLQUFLO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7S0FDckI7SUFBQSxDQUFDOzs7O0lBRUYsdUJBQUk7OztJQUFKO1FBQ0UsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQ2hCO0lBQUEsQ0FBQzs7Ozs7SUFFRix1QkFBSTs7OztJQUFKLFVBQUssQ0FBQztRQUNKLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsdUJBQUk7OztJQUFKO1FBQ0UsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQ2hCO0lBQUEsQ0FBQzs7Ozs7SUFFRix1QkFBSTs7OztJQUFKLFVBQUssQ0FBQztRQUNKLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsMEJBQU87OztJQUFQO1FBQ0UsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25CO0lBQUEsQ0FBQzs7Ozs7SUFFRiwwQkFBTzs7OztJQUFQLFVBQVEsSUFBSTtRQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCO0lBQUEsQ0FBQzs7OztJQUVGLDZCQUFVOzs7SUFBVjtRQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0QjtJQUFBLENBQUM7Ozs7O0lBRUYsNkJBQVU7Ozs7SUFBVixVQUFXLElBQUk7UUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsbUNBQWdCOzs7SUFBaEI7O1FBQ0UsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUNGOztRQUQ3QixJQUNFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDN0IsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNoQjtRQUNELElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDaEI7UUFDRCxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDOUI7UUFDRCxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDOUI7S0FDRjtJQUFBLENBQUM7Ozs7SUFJRix1QkFBSTs7O0lBQUo7UUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDNUY7SUFBQSxDQUFDO21CQTNGSjtJQWtHQyxDQUFBOzs7O0FBM0ZELG9CQTJGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JvcENhbnZhc30gZnJvbSBcIi4vY3JvcC1jYW52YXNcIjtcblxuZXhwb3J0IGVudW0gQ3JvcEFyZWFUeXBlIHtcbiAgU3F1YXJlID0gJ3NxdWFyZScsXG4gIENpcmNsZSA9ICdjaXJjbGUnXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcm9wQXJlYSB7XG4gIHByb3RlY3RlZCBfbWluU2l6ZSA9IDgwO1xuICBwcm90ZWN0ZWQgX2Nyb3BDYW52YXM6IENyb3BDYW52YXM7XG4gIHByb3RlY3RlZCBfaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgcHJvdGVjdGVkIF94ID0gMDtcbiAgcHJvdGVjdGVkIF95ID0gMDtcbiAgcHJvdGVjdGVkIF9zaXplID0gMjAwO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfY3R4LCBwcm90ZWN0ZWQgX2V2ZW50cykge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMgPSBuZXcgQ3JvcENhbnZhcyhfY3R4KTtcbiAgfVxuXG4gIGdldEltYWdlKCkge1xuICAgIHJldHVybiB0aGlzLl9pbWFnZTtcbiAgfVxuXG4gIHNldEltYWdlKGltYWdlKSB7XG4gICAgdGhpcy5faW1hZ2UgPSBpbWFnZTtcbiAgfTtcblxuICBnZXRYKCkge1xuICAgIHJldHVybiB0aGlzLl94O1xuICB9O1xuXG4gIHNldFgoeCkge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIGdldFkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH07XG5cbiAgc2V0WSh5KSB7XG4gICAgdGhpcy5feSA9IHk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0U2l6ZSgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgfTtcblxuICBzZXRTaXplKHNpemUpIHtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0TWluU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWluU2l6ZTtcbiAgfTtcblxuICBzZXRNaW5TaXplKHNpemUpIHtcbiAgICB0aGlzLl9taW5TaXplID0gc2l6ZTtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgdGhpcy5fc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgX2RvbnREcmFnT3V0c2lkZSgpIHtcbiAgICB2YXIgaCA9IHRoaXMuX2N0eC5jYW52YXMuaGVpZ2h0LFxuICAgICAgdyA9IHRoaXMuX2N0eC5jYW52YXMud2lkdGg7XG4gICAgaWYgKHRoaXMuX3NpemUgPiB3KSB7XG4gICAgICB0aGlzLl9zaXplID0gdztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NpemUgPiBoKSB7XG4gICAgICB0aGlzLl9zaXplID0gaDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ggPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feCA+IHcgLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHcgLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3kgPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feSA+IGggLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IGggLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gIH07XG5cbiAgYWJzdHJhY3QgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKTtcblxuICBkcmF3KCkge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0Nyb3BBcmVhKHRoaXMuX2ltYWdlLCBbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX3NpemUsIHRoaXMuX2RyYXdBcmVhKTtcbiAgfTtcblxuICBhYnN0cmFjdCBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWDogbnVtYmVyLCBtb3VzZUN1clk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YOiBudW1iZXIsIG1vdXNlRG93blk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlVXAobW91c2VEb3duWDogbnVtYmVyLCBtb3VzZURvd25ZOiBudW1iZXIpO1xufSJdfQ==