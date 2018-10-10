/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropArea } from "./crop-area";
export class CropAreaCircle extends CropArea {
    /**
     * @param {?} ctx
     * @param {?} events
     */
    constructor(ctx, events) {
        super(ctx, events);
        this._boxResizeBaseSize = 20;
        this._boxResizeNormalRatio = 0.9;
        this._boxResizeHoverRatio = 1.2;
        this._iconMoveNormalRatio = 0.9;
        this._iconMoveHoverRatio = 1.2;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
        this._posResizeStartX = 0;
        this._posResizeStartY = 0;
        this._posResizeStartSize = 0;
        this._boxResizeIsHover = false;
        this._areaIsHover = false;
        this._boxResizeIsDragging = false;
        this._areaIsDragging = false;
        this._boxResizeNormalSize = this._boxResizeBaseSize * this._boxResizeNormalRatio;
        this._boxResizeHoverSize = this._boxResizeBaseSize * this._boxResizeHoverRatio;
    }
    /**
     * @param {?} angleDegrees
     * @return {?}
     */
    _calcCirclePerimeterCoords(angleDegrees) {
        /** @type {?} */
        var hSize = this._size / 2;
        /** @type {?} */
        var angleRadians = angleDegrees * (Math.PI / 180);
        /** @type {?} */
        var circlePerimeterX = this._x + hSize * Math.cos(angleRadians);
        /** @type {?} */
        var circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
        return [circlePerimeterX, circlePerimeterY];
    }
    /**
     * @return {?}
     */
    _calcResizeIconCenterCoords() {
        return this._calcCirclePerimeterCoords(-45);
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinArea(coord) {
        return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
    }
    ;
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinBoxResize(coord) {
        /** @type {?} */
        var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
        /** @type {?} */
        var hSize = this._boxResizeHoverSize / 2;
        return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
            coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
    }
    ;
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    _drawArea(ctx, centerCoords, size) {
        ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
    }
    ;
    /**
     * @return {?}
     */
    draw() {
        CropArea.prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        // draw resize cubes
        this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
    }
    ;
    /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    processMouseMove(mouseCurX, mouseCurY) {
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
    }
    ;
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    processMouseDown(mouseDownX, mouseDownY) {
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
    }
    ;
    /**
     * @return {?}
     */
    processMouseUp() {
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
    }
    ;
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLWNpcmNsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWltZy1jcm9wLyIsInNvdXJjZXMiOlsic3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtYXJlYS1jaXJjbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFckMsTUFBTSxxQkFBc0IsU0FBUSxRQUFROzs7OztJQXFCMUMsWUFBWSxHQUFHLEVBQUUsTUFBTTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2tDQXJCQSxFQUFFO3FDQUNDLEdBQUc7b0NBQ0osR0FBRztvQ0FDSCxHQUFHO21DQUNKLEdBQUc7OEJBRVIsQ0FBQzs4QkFDRCxDQUFDO2dDQUNDLENBQUM7Z0NBQ0QsQ0FBQzttQ0FDRSxDQUFDO2lDQUVILEtBQUs7NEJBQ1YsS0FBSztvQ0FDRyxLQUFLOytCQUNWLEtBQUs7UUFRckIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDakYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7S0FDaEY7Ozs7O0lBRUQsMEJBQTBCLENBQUMsWUFBWTs7UUFDckMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7O1FBQzNCLElBQUksWUFBWSxHQUFHLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBRWE7O1FBRjlELElBQ0UsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FDQzs7UUFGOUQsSUFFRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssR0FB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QUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDekM7S0FDRjtJQUFBLENBQUM7Ozs7SUFFRixjQUFjO1FBQ1osSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDN0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUUvQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztLQUN6QjtJQUFBLENBQUM7Q0FFSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JvcEFyZWF9IGZyb20gXCIuL2Nyb3AtYXJlYVwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEFyZWFDaXJjbGUgZXh0ZW5kcyBDcm9wQXJlYSB7XG4gIF9ib3hSZXNpemVCYXNlU2l6ZSA9IDIwO1xuICBfYm94UmVzaXplTm9ybWFsUmF0aW8gPSAwLjk7XG4gIF9ib3hSZXNpemVIb3ZlclJhdGlvID0gMS4yO1xuICBfaWNvbk1vdmVOb3JtYWxSYXRpbyA9IDAuOTtcbiAgX2ljb25Nb3ZlSG92ZXJSYXRpbyA9IDEuMjtcblxuICBfcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gIF9wb3NEcmFnU3RhcnRZID0gMDtcbiAgX3Bvc1Jlc2l6ZVN0YXJ0WCA9IDA7XG4gIF9wb3NSZXNpemVTdGFydFkgPSAwO1xuICBfcG9zUmVzaXplU3RhcnRTaXplID0gMDtcblxuICBfYm94UmVzaXplSXNIb3ZlciA9IGZhbHNlO1xuICBfYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgX2JveFJlc2l6ZUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfYm94UmVzaXplTm9ybWFsU2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIF9ib3hSZXNpemVIb3ZlclNpemU6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihjdHgsIGV2ZW50cykge1xuICAgIHN1cGVyKGN0eCwgZXZlbnRzKTtcblxuICAgIHRoaXMuX2JveFJlc2l6ZU5vcm1hbFNpemUgPSB0aGlzLl9ib3hSZXNpemVCYXNlU2l6ZSAqIHRoaXMuX2JveFJlc2l6ZU5vcm1hbFJhdGlvO1xuICAgIHRoaXMuX2JveFJlc2l6ZUhvdmVyU2l6ZSA9IHRoaXMuX2JveFJlc2l6ZUJhc2VTaXplICogdGhpcy5fYm94UmVzaXplSG92ZXJSYXRpbztcbiAgfVxuXG4gIF9jYWxjQ2lyY2xlUGVyaW1ldGVyQ29vcmRzKGFuZ2xlRGVncmVlcykge1xuICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgIHZhciBhbmdsZVJhZGlhbnMgPSBhbmdsZURlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICBjaXJjbGVQZXJpbWV0ZXJYID0gdGhpcy5feCArIGhTaXplICogTWF0aC5jb3MoYW5nbGVSYWRpYW5zKSxcbiAgICAgIGNpcmNsZVBlcmltZXRlclkgPSB0aGlzLl95ICsgaFNpemUgKiBNYXRoLnNpbihhbmdsZVJhZGlhbnMpO1xuICAgIHJldHVybiBbY2lyY2xlUGVyaW1ldGVyWCwgY2lyY2xlUGVyaW1ldGVyWV07XG4gIH1cblxuICBfY2FsY1Jlc2l6ZUljb25DZW50ZXJDb29yZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbGNDaXJjbGVQZXJpbWV0ZXJDb29yZHMoLTQ1KTtcbiAgfVxuXG4gIF9pc0Nvb3JkV2l0aGluQXJlYShjb29yZCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoKGNvb3JkWzBdIC0gdGhpcy5feCkgKiAoY29vcmRbMF0gLSB0aGlzLl94KSArIChjb29yZFsxXSAtIHRoaXMuX3kpICogKGNvb3JkWzFdIC0gdGhpcy5feSkpIDwgdGhpcy5fc2l6ZSAvIDI7XG4gIH07XG5cbiAgX2lzQ29vcmRXaXRoaW5Cb3hSZXNpemUoY29vcmQpIHtcbiAgICB2YXIgcmVzaXplSWNvbkNlbnRlckNvb3JkcyA9IHRoaXMuX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCk7XG4gICAgdmFyIGhTaXplID0gdGhpcy5fYm94UmVzaXplSG92ZXJTaXplIC8gMjtcbiAgICByZXR1cm4gKGNvb3JkWzBdID4gcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSAtIGhTaXplICYmIGNvb3JkWzBdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSArIGhTaXplICYmXG4gICAgICBjb29yZFsxXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gLSBoU2l6ZSAmJiBjb29yZFsxXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gKyBoU2l6ZSk7XG4gIH07XG5cbiAgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKSB7XG4gICAgY3R4LmFyYyhjZW50ZXJDb29yZHNbMF0sIGNlbnRlckNvb3Jkc1sxXSwgc2l6ZSAvIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgfTtcblxuICBkcmF3KCkge1xuICAgIENyb3BBcmVhLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBkcmF3IG1vdmUgaWNvblxuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25Nb3ZlKFt0aGlzLl94LCB0aGlzLl95XSwgdGhpcy5fYXJlYUlzSG92ZXIgPyB0aGlzLl9pY29uTW92ZUhvdmVyUmF0aW8gOiB0aGlzLl9pY29uTW92ZU5vcm1hbFJhdGlvKTtcblxuICAgIC8vIGRyYXcgcmVzaXplIGN1YmVzXG4gICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvblJlc2l6ZUJveE5FU1codGhpcy5fY2FsY1Jlc2l6ZUljb25DZW50ZXJDb29yZHMoKSwgdGhpcy5fYm94UmVzaXplQmFzZVNpemUsIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPyB0aGlzLl9ib3hSZXNpemVIb3ZlclJhdGlvIDogdGhpcy5fYm94UmVzaXplTm9ybWFsUmF0aW8pO1xuICB9O1xuXG4gIHByb2Nlc3NNb3VzZU1vdmUobW91c2VDdXJYLCBtb3VzZUN1clkpIHtcbiAgICB2YXIgY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHZhciByZXMgPSBmYWxzZTtcblxuICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2FyZWFJc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLl94ID0gbW91c2VDdXJYIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WDtcbiAgICAgIHRoaXMuX3kgPSBtb3VzZUN1clkgLSB0aGlzLl9wb3NEcmFnU3RhcnRZO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLW1vdmUnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcpIHtcbiAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICB2YXIgaUZSLCBpRlgsIGlGWTtcbiAgICAgIGlGWCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WDtcbiAgICAgIGlGWSA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSAtIG1vdXNlQ3VyWTtcbiAgICAgIGlmIChpRlggPiBpRlkpIHtcbiAgICAgICAgaUZSID0gdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplICsgaUZZICogMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWCAqIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpemUgPSBNYXRoLm1heCh0aGlzLl9taW5TaXplLCBpRlIpO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNIb3ZlciA9IHRydWU7XG4gICAgICByZXMgPSB0cnVlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQm94UmVzaXplKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICByZXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICAgIHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gY3Vyc29yO1xuXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcblxuICBwcm9jZXNzTW91c2VEb3duKG1vdXNlRG93blg6IG51bWJlciwgbW91c2VEb3duWTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5Cb3hSZXNpemUoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRYID0gbW91c2VEb3duWDtcbiAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSA9IG1vdXNlRG93blk7XG4gICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgPSB0aGlzLl9zaXplO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLXN0YXJ0Jyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQXJlYShbbW91c2VEb3duWCwgbW91c2VEb3duWV0pKSB7XG4gICAgICB0aGlzLl9hcmVhSXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gbW91c2VEb3duWCAtIHRoaXMuX3g7XG4gICAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gbW91c2VEb3duWSAtIHRoaXMuX3k7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLXN0YXJ0Jyk7XG4gICAgfVxuICB9O1xuXG4gIHByb2Nlc3NNb3VzZVVwKC8qbW91c2VVcFgsIG1vdXNlVXBZKi8pIHtcbiAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLWVuZCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLWVuZCcpO1xuICAgIH1cbiAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcblxuICAgIHRoaXMuX3Bvc0RyYWdTdGFydFggPSAwO1xuICAgIHRoaXMuX3Bvc0RyYWdTdGFydFkgPSAwO1xuICB9O1xuXG59Il19