/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropCanvas } from "./crop-canvas";
/** @enum {string} */
const CropAreaType = {
    Square: 'square',
    Circle: 'circle',
};
export { CropAreaType };
/**
 * @abstract
 */
export class CropArea {
    /**
     * @param {?} _ctx
     * @param {?} _events
     */
    constructor(_ctx, _events) {
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
    getImage() {
        return this._image;
    }
    /**
     * @param {?} image
     * @return {?}
     */
    setImage(image) {
        this._image = image;
    }
    ;
    /**
     * @return {?}
     */
    getX() {
        return this._x;
    }
    ;
    /**
     * @param {?} x
     * @return {?}
     */
    setX(x) {
        this._x = x;
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getY() {
        return this._y;
    }
    ;
    /**
     * @param {?} y
     * @return {?}
     */
    setY(y) {
        this._y = y;
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getSize() {
        return this._size;
    }
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    setSize(size) {
        this._size = Math.max(this._minSize, size);
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getMinSize() {
        return this._minSize;
    }
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    setMinSize(size) {
        this._minSize = size;
        this._size = Math.max(this._minSize, this._size);
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    _dontDragOutside() {
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
    }
    ;
    /**
     * @return {?}
     */
    draw() {
        this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
    }
    ;
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1hcmVhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7SUFHdkMsUUFBUyxRQUFRO0lBQ2pCLFFBQVMsUUFBUTs7Ozs7O0FBR25CLE1BQU07Ozs7O0lBUUosWUFBc0IsSUFBSSxFQUFZLE9BQU87UUFBdkIsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUFZLFlBQU8sR0FBUCxPQUFPLENBQUE7d0JBUHhCLEVBQUU7c0JBRUosSUFBSSxLQUFLLEVBQUU7a0JBQ2YsQ0FBQztrQkFDRCxDQUFDO3FCQUNFLEdBQUc7UUFHbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6Qzs7OztJQUVELFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDcEI7Ozs7O0lBRUQsUUFBUSxDQUFDLEtBQUs7UUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztLQUNyQjtJQUFBLENBQUM7Ozs7SUFFRixJQUFJO1FBQ0YsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0tBQ2hCO0lBQUEsQ0FBQzs7Ozs7SUFFRixJQUFJLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztLQUNoQjtJQUFBLENBQUM7Ozs7O0lBRUYsSUFBSSxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCO0lBQUEsQ0FBQzs7OztJQUVGLE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDbkI7SUFBQSxDQUFDOzs7OztJQUVGLE9BQU8sQ0FBQyxJQUFJO1FBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0QjtJQUFBLENBQUM7Ozs7O0lBRUYsVUFBVSxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDekI7SUFBQSxDQUFDOzs7O0lBRUYsZ0JBQWdCOztRQUNkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FDRjs7UUFEN0IsSUFDRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzdCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDaEI7UUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQzlCO0tBQ0Y7SUFBQSxDQUFDOzs7O0lBSUYsSUFBSTtRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM1RjtJQUFBLENBQUM7Q0FPSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JvcENhbnZhc30gZnJvbSBcIi4vY3JvcC1jYW52YXNcIjtcblxuZXhwb3J0IGVudW0gQ3JvcEFyZWFUeXBlIHtcbiAgU3F1YXJlID0gJ3NxdWFyZScsXG4gIENpcmNsZSA9ICdjaXJjbGUnXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcm9wQXJlYSB7XG4gIHByb3RlY3RlZCBfbWluU2l6ZSA9IDgwO1xuICBwcm90ZWN0ZWQgX2Nyb3BDYW52YXM6IENyb3BDYW52YXM7XG4gIHByb3RlY3RlZCBfaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgcHJvdGVjdGVkIF94ID0gMDtcbiAgcHJvdGVjdGVkIF95ID0gMDtcbiAgcHJvdGVjdGVkIF9zaXplID0gMjAwO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfY3R4LCBwcm90ZWN0ZWQgX2V2ZW50cykge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMgPSBuZXcgQ3JvcENhbnZhcyhfY3R4KTtcbiAgfVxuXG4gIGdldEltYWdlKCkge1xuICAgIHJldHVybiB0aGlzLl9pbWFnZTtcbiAgfVxuXG4gIHNldEltYWdlKGltYWdlKSB7XG4gICAgdGhpcy5faW1hZ2UgPSBpbWFnZTtcbiAgfTtcblxuICBnZXRYKCkge1xuICAgIHJldHVybiB0aGlzLl94O1xuICB9O1xuXG4gIHNldFgoeCkge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIGdldFkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH07XG5cbiAgc2V0WSh5KSB7XG4gICAgdGhpcy5feSA9IHk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0U2l6ZSgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgfTtcblxuICBzZXRTaXplKHNpemUpIHtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0TWluU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWluU2l6ZTtcbiAgfTtcblxuICBzZXRNaW5TaXplKHNpemUpIHtcbiAgICB0aGlzLl9taW5TaXplID0gc2l6ZTtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgdGhpcy5fc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgX2RvbnREcmFnT3V0c2lkZSgpIHtcbiAgICB2YXIgaCA9IHRoaXMuX2N0eC5jYW52YXMuaGVpZ2h0LFxuICAgICAgdyA9IHRoaXMuX2N0eC5jYW52YXMud2lkdGg7XG4gICAgaWYgKHRoaXMuX3NpemUgPiB3KSB7XG4gICAgICB0aGlzLl9zaXplID0gdztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NpemUgPiBoKSB7XG4gICAgICB0aGlzLl9zaXplID0gaDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ggPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feCA+IHcgLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHcgLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3kgPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feSA+IGggLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IGggLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gIH07XG5cbiAgYWJzdHJhY3QgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKTtcblxuICBkcmF3KCkge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0Nyb3BBcmVhKHRoaXMuX2ltYWdlLCBbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX3NpemUsIHRoaXMuX2RyYXdBcmVhKTtcbiAgfTtcblxuICBhYnN0cmFjdCBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWDogbnVtYmVyLCBtb3VzZUN1clk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YOiBudW1iZXIsIG1vdXNlRG93blk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlVXAobW91c2VEb3duWDogbnVtYmVyLCBtb3VzZURvd25ZOiBudW1iZXIpO1xufSJdfQ==