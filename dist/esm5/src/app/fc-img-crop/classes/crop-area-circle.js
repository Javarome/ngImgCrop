/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { CropArea } from "./crop-area";
var CropAreaCircle = /** @class */ (function (_super) {
    tslib_1.__extends(CropAreaCircle, _super);
    function CropAreaCircle(ctx, events) {
        var _this = _super.call(this, ctx, events) || this;
        _this._boxResizeBaseSize = 20;
        _this._boxResizeNormalRatio = 0.9;
        _this._boxResizeHoverRatio = 1.2;
        _this._iconMoveNormalRatio = 0.9;
        _this._iconMoveHoverRatio = 1.2;
        _this._posDragStartX = 0;
        _this._posDragStartY = 0;
        _this._posResizeStartX = 0;
        _this._posResizeStartY = 0;
        _this._posResizeStartSize = 0;
        _this._boxResizeIsHover = false;
        _this._areaIsHover = false;
        _this._boxResizeIsDragging = false;
        _this._areaIsDragging = false;
        _this._boxResizeNormalSize = _this._boxResizeBaseSize * _this._boxResizeNormalRatio;
        _this._boxResizeHoverSize = _this._boxResizeBaseSize * _this._boxResizeHoverRatio;
        return _this;
    }
    /**
     * @param {?} angleDegrees
     * @return {?}
     */
    CropAreaCircle.prototype._calcCirclePerimeterCoords = /**
     * @param {?} angleDegrees
     * @return {?}
     */
    function (angleDegrees) {
        /** @type {?} */
        var hSize = this._size / 2;
        /** @type {?} */
        var angleRadians = angleDegrees * (Math.PI / 180);
        /** @type {?} */
        var circlePerimeterX = this._x + hSize * Math.cos(angleRadians);
        /** @type {?} */
        var circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
        return [circlePerimeterX, circlePerimeterY];
    };
    /**
     * @return {?}
     */
    CropAreaCircle.prototype._calcResizeIconCenterCoords = /**
     * @return {?}
     */
    function () {
        return this._calcCirclePerimeterCoords(-45);
    };
    /**
     * @param {?} coord
     * @return {?}
     */
    CropAreaCircle.prototype._isCoordWithinArea = /**
     * @param {?} coord
     * @return {?}
     */
    function (coord) {
        return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
    };
    ;
    /**
     * @param {?} coord
     * @return {?}
     */
    CropAreaCircle.prototype._isCoordWithinBoxResize = /**
     * @param {?} coord
     * @return {?}
     */
    function (coord) {
        /** @type {?} */
        var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
        /** @type {?} */
        var hSize = this._boxResizeHoverSize / 2;
        return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
            coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
    };
    ;
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    CropAreaCircle.prototype._drawArea = /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    function (ctx, centerCoords, size) {
        ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
    };
    ;
    /**
     * @return {?}
     */
    CropAreaCircle.prototype.draw = /**
     * @return {?}
     */
    function () {
        CropArea.prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        // draw resize cubes
        this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
    };
    ;
    /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    CropAreaCircle.prototype.processMouseMove = /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    function (mouseCurX, mouseCurY) {
        /** @type {?} */
        var cursor = 'default';
        /** @type {?} */
        var res = false;
        this._boxResizeIsHover = false;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._boxResizeIsDragging) {
            cursor = 'nesw-resize';
            /** @type {?} */
            var iFR;
            /** @type {?} */
            var iFX;
            /** @type {?} */
            var iFY;
            iFX = mouseCurX - this._posResizeStartX;
            iFY = this._posResizeStartY - mouseCurY;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY * 2;
            }
            else {
                iFR = this._posResizeStartSize + iFX * 2;
            }
            this._size = Math.max(this._minSize, iFR);
            this._boxResizeIsHover = true;
            res = true;
            this._events.trigger('area-resize');
        }
        else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
            cursor = 'nesw-resize';
            this._areaIsHover = false;
            this._boxResizeIsHover = true;
            res = true;
        }
        else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
            cursor = 'move';
            this._areaIsHover = true;
            res = true;
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    };
    ;
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    CropAreaCircle.prototype.processMouseDown = /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    function (mouseDownX, mouseDownY) {
        if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._boxResizeIsDragging = true;
            this._boxResizeIsHover = true;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._boxResizeIsDragging = false;
            this._boxResizeIsHover = false;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    };
    ;
    /**
     * @return {?}
     */
    CropAreaCircle.prototype.processMouseUp = /**
     * @return {?}
     */
    function () {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._boxResizeIsDragging) {
            this._boxResizeIsDragging = false;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._boxResizeIsHover = false;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    };
    ;
    return CropAreaCircle;
}(CropArea));
export { CropAreaCircle };
if (false) {
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeBaseSize;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeNormalRatio;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeHoverRatio;
    /** @type {?} */
    CropAreaCircle.prototype._iconMoveNormalRatio;
    /** @type {?} */
    CropAreaCircle.prototype._iconMoveHoverRatio;
    /** @type {?} */
    CropAreaCircle.prototype._posDragStartX;
    /** @type {?} */
    CropAreaCircle.prototype._posDragStartY;
    /** @type {?} */
    CropAreaCircle.prototype._posResizeStartX;
    /** @type {?} */
    CropAreaCircle.prototype._posResizeStartY;
    /** @type {?} */
    CropAreaCircle.prototype._posResizeStartSize;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeIsHover;
    /** @type {?} */
    CropAreaCircle.prototype._areaIsHover;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeIsDragging;
    /** @type {?} */
    CropAreaCircle.prototype._areaIsDragging;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeNormalSize;
    /** @type {?} */
    CropAreaCircle.prototype._boxResizeHoverSize;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLWNpcmNsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWltZy1jcm9wLyIsInNvdXJjZXMiOlsic3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtYXJlYS1jaXJjbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXJDLElBQUE7SUFBb0MsMENBQVE7SUFxQjFDLHdCQUFZLEdBQUcsRUFBRSxNQUFNO1FBQXZCLFlBQ0Usa0JBQU0sR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUluQjttQ0F6Qm9CLEVBQUU7c0NBQ0MsR0FBRztxQ0FDSixHQUFHO3FDQUNILEdBQUc7b0NBQ0osR0FBRzsrQkFFUixDQUFDOytCQUNELENBQUM7aUNBQ0MsQ0FBQztpQ0FDRCxDQUFDO29DQUNFLENBQUM7a0NBRUgsS0FBSzs2QkFDVixLQUFLO3FDQUNHLEtBQUs7Z0NBQ1YsS0FBSztRQVFyQixLQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUNqRixLQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQzs7S0FDaEY7Ozs7O0lBRUQsbURBQTBCOzs7O0lBQTFCLFVBQTJCLFlBQVk7O1FBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOztRQUMzQixJQUFJLFlBQVksR0FBRyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUVhOztRQUY5RCxJQUNFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQ0M7O1FBRjlELElBRUUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxL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Y2VzQ29udGVudCI6WyJpbXBvcnQge0Nyb3BBcmVhfSBmcm9tIFwiLi9jcm9wLWFyZWFcIjtcblxuZXhwb3J0IGNsYXNzIENyb3BBcmVhQ2lyY2xlIGV4dGVuZHMgQ3JvcEFyZWEge1xuICBfYm94UmVzaXplQmFzZVNpemUgPSAyMDtcbiAgX2JveFJlc2l6ZU5vcm1hbFJhdGlvID0gMC45O1xuICBfYm94UmVzaXplSG92ZXJSYXRpbyA9IDEuMjtcbiAgX2ljb25Nb3ZlTm9ybWFsUmF0aW8gPSAwLjk7XG4gIF9pY29uTW92ZUhvdmVyUmF0aW8gPSAxLjI7XG5cbiAgX3Bvc0RyYWdTdGFydFggPSAwO1xuICBfcG9zRHJhZ1N0YXJ0WSA9IDA7XG4gIF9wb3NSZXNpemVTdGFydFggPSAwO1xuICBfcG9zUmVzaXplU3RhcnRZID0gMDtcbiAgX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSA9IDA7XG5cbiAgX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcbiAgX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gIF9ib3hSZXNpemVJc0RyYWdnaW5nID0gZmFsc2U7XG4gIF9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2JveFJlc2l6ZU5vcm1hbFNpemU6IG51bWJlcjtcbiAgcHJpdmF0ZSBfYm94UmVzaXplSG92ZXJTaXplOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoY3R4LCBldmVudHMpIHtcbiAgICBzdXBlcihjdHgsIGV2ZW50cyk7XG5cbiAgICB0aGlzLl9ib3hSZXNpemVOb3JtYWxTaXplID0gdGhpcy5fYm94UmVzaXplQmFzZVNpemUgKiB0aGlzLl9ib3hSZXNpemVOb3JtYWxSYXRpbztcbiAgICB0aGlzLl9ib3hSZXNpemVIb3ZlclNpemUgPSB0aGlzLl9ib3hSZXNpemVCYXNlU2l6ZSAqIHRoaXMuX2JveFJlc2l6ZUhvdmVyUmF0aW87XG4gIH1cblxuICBfY2FsY0NpcmNsZVBlcmltZXRlckNvb3JkcyhhbmdsZURlZ3JlZXMpIHtcbiAgICB2YXIgaFNpemUgPSB0aGlzLl9zaXplIC8gMjtcbiAgICB2YXIgYW5nbGVSYWRpYW5zID0gYW5nbGVEZWdyZWVzICogKE1hdGguUEkgLyAxODApLFxuICAgICAgY2lyY2xlUGVyaW1ldGVyWCA9IHRoaXMuX3ggKyBoU2l6ZSAqIE1hdGguY29zKGFuZ2xlUmFkaWFucyksXG4gICAgICBjaXJjbGVQZXJpbWV0ZXJZID0gdGhpcy5feSArIGhTaXplICogTWF0aC5zaW4oYW5nbGVSYWRpYW5zKTtcbiAgICByZXR1cm4gW2NpcmNsZVBlcmltZXRlclgsIGNpcmNsZVBlcmltZXRlclldO1xuICB9XG5cbiAgX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9jYWxjQ2lyY2xlUGVyaW1ldGVyQ29vcmRzKC00NSk7XG4gIH1cblxuICBfaXNDb29yZFdpdGhpbkFyZWEoY29vcmQpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KChjb29yZFswXSAtIHRoaXMuX3gpICogKGNvb3JkWzBdIC0gdGhpcy5feCkgKyAoY29vcmRbMV0gLSB0aGlzLl95KSAqIChjb29yZFsxXSAtIHRoaXMuX3kpKSA8IHRoaXMuX3NpemUgLyAyO1xuICB9O1xuXG4gIF9pc0Nvb3JkV2l0aGluQm94UmVzaXplKGNvb3JkKSB7XG4gICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSB0aGlzLl9jYWxjUmVzaXplSWNvbkNlbnRlckNvb3JkcygpO1xuICAgIHZhciBoU2l6ZSA9IHRoaXMuX2JveFJlc2l6ZUhvdmVyU2l6ZSAvIDI7XG4gICAgcmV0dXJuIChjb29yZFswXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gLSBoU2l6ZSAmJiBjb29yZFswXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gKyBoU2l6ZSAmJlxuICAgICAgY29vcmRbMV0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdIC0gaFNpemUgJiYgY29vcmRbMV0gPCByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdICsgaFNpemUpO1xuICB9O1xuXG4gIF9kcmF3QXJlYShjdHgsIGNlbnRlckNvb3Jkcywgc2l6ZSkge1xuICAgIGN0eC5hcmMoY2VudGVyQ29vcmRzWzBdLCBjZW50ZXJDb29yZHNbMV0sIHNpemUgLyAyLCAwLCAyICogTWF0aC5QSSk7XG4gIH07XG5cbiAgZHJhdygpIHtcbiAgICBDcm9wQXJlYS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgLy8gZHJhdyBtb3ZlIGljb25cbiAgICB0aGlzLl9jcm9wQ2FudmFzLmRyYXdJY29uTW92ZShbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX2FyZWFJc0hvdmVyID8gdGhpcy5faWNvbk1vdmVIb3ZlclJhdGlvIDogdGhpcy5faWNvbk1vdmVOb3JtYWxSYXRpbyk7XG5cbiAgICAvLyBkcmF3IHJlc2l6ZSBjdWJlc1xuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25SZXNpemVCb3hORVNXKHRoaXMuX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCksIHRoaXMuX2JveFJlc2l6ZUJhc2VTaXplLCB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID8gdGhpcy5fYm94UmVzaXplSG92ZXJSYXRpbyA6IHRoaXMuX2JveFJlc2l6ZU5vcm1hbFJhdGlvKTtcbiAgfTtcblxuICBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWCwgbW91c2VDdXJZKSB7XG4gICAgdmFyIGN1cnNvciA9ICdkZWZhdWx0JztcbiAgICB2YXIgcmVzID0gZmFsc2U7XG5cbiAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG4gICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5feCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc0RyYWdTdGFydFg7XG4gICAgICB0aGlzLl95ID0gbW91c2VDdXJZIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WTtcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIGN1cnNvciA9ICdtb3ZlJztcbiAgICAgIHJlcyA9IHRydWU7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nKSB7XG4gICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgdmFyIGlGUiwgaUZYLCBpRlk7XG4gICAgICBpRlggPSBtb3VzZUN1clggLSB0aGlzLl9wb3NSZXNpemVTdGFydFg7XG4gICAgICBpRlkgPSB0aGlzLl9wb3NSZXNpemVTdGFydFkgLSBtb3VzZUN1clk7XG4gICAgICBpZiAoaUZYID4gaUZZKSB7XG4gICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWSAqIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpRlIgPSB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgKyBpRlggKiAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgaUZSKTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkJveFJlc2l6ZShbbW91c2VDdXJYLCBtb3VzZUN1clldKSkge1xuICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIHJlcyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQXJlYShbbW91c2VDdXJYLCBtb3VzZUN1clldKSkge1xuICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9kb250RHJhZ091dHNpZGUoKTtcbiAgICB0aGlzLl9jdHguY2FudmFzLnN0eWxlLmN1cnNvciA9IGN1cnNvcjtcblxuICAgIHJldHVybiByZXM7XG4gIH07XG5cbiAgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YOiBudW1iZXIsIG1vdXNlRG93blk6IG51bWJlcikge1xuICAgIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQm94UmVzaXplKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSkpIHtcbiAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCA9IG1vdXNlRG93blg7XG4gICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFkgPSBtb3VzZURvd25ZO1xuICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1zdGFydCcpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IG1vdXNlRG93blggLSB0aGlzLl94O1xuICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IG1vdXNlRG93blkgLSB0aGlzLl95O1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1zdGFydCcpO1xuICAgIH1cbiAgfTtcblxuICBwcm9jZXNzTW91c2VVcCgvKm1vdXNlVXBYLCBtb3VzZVVwWSovKSB7XG4gICAgaWYgKHRoaXMuX2FyZWFJc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLl9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1lbmQnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1lbmQnKTtcbiAgICB9XG4gICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG5cbiAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gMDtcbiAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gMDtcbiAgfTtcblxufSJdfQ==