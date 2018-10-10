/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { CropArea } from "./crop-area";
var CropAreaSquare = /** @class */ (function (_super) {
    tslib_1.__extends(CropAreaSquare, _super);
    function CropAreaSquare(ctx, events) {
        var _this = _super.call(this, ctx, events) || this;
        _this._resizeCtrlBaseRadius = 10;
        _this._resizeCtrlNormalRatio = 0.75;
        _this._resizeCtrlHoverRatio = 1;
        _this._iconMoveNormalRatio = 0.9;
        _this._iconMoveHoverRatio = 1.2;
        _this._posDragStartX = 0;
        _this._posDragStartY = 0;
        _this._posResizeStartX = 0;
        _this._posResizeStartY = 0;
        _this._posResizeStartSize = 0;
        _this._resizeCtrlIsHover = -1;
        _this._areaIsHover = false;
        _this._resizeCtrlIsDragging = -1;
        _this._areaIsDragging = false;
        _this._resizeCtrlNormalRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlNormalRatio;
        _this._resizeCtrlHoverRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlHoverRatio;
        return _this;
    }
    ;
    /**
     * @return {?}
     */
    CropAreaSquare.prototype._calcSquareCorners = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var hSize = this._size / 2;
        return [
            [this._x - hSize, this._y - hSize],
            [this._x + hSize, this._y - hSize],
            [this._x - hSize, this._y + hSize],
            [this._x + hSize, this._y + hSize]
        ];
    };
    /**
     * @return {?}
     */
    CropAreaSquare.prototype._calcSquareDimensions = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var hSize = this._size / 2;
        return {
            left: this._x - hSize,
            top: this._y - hSize,
            right: this._x + hSize,
            bottom: this._y + hSize
        };
    };
    /**
     * @param {?} coord
     * @return {?}
     */
    CropAreaSquare.prototype._isCoordWithinArea = /**
     * @param {?} coord
     * @return {?}
     */
    function (coord) {
        /** @type {?} */
        var squareDimensions = this._calcSquareDimensions();
        return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
    };
    /**
     * @param {?} coord
     * @return {?}
     */
    CropAreaSquare.prototype._isCoordWithinResizeCtrl = /**
     * @param {?} coord
     * @return {?}
     */
    function (coord) {
        /** @type {?} */
        var resizeIconsCenterCoords = this._calcSquareCorners();
        /** @type {?} */
        var res = -1;
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            /** @type {?} */
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                res = i;
                break;
            }
        }
        return res;
    };
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    CropAreaSquare.prototype._drawArea = /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    function (ctx, centerCoords, size) {
        /** @type {?} */
        var hSize = size / 2;
        ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
    };
    /**
     * @return {?}
     */
    CropAreaSquare.prototype.draw = /**
     * @return {?}
     */
    function () {
        CropArea.prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        /** @type {?} */
        var resizeIconsCenterCoords = this._calcSquareCorners();
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            /** @type {?} */
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
        }
    };
    /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    CropAreaSquare.prototype.processMouseMove = /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    function (mouseCurX, mouseCurY) {
        /** @type {?} */
        var cursor = 'default';
        /** @type {?} */
        var res = false;
        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._resizeCtrlIsDragging > -1) {
            /** @type {?} */
            var xMulti;
            /** @type {?} */
            var yMulti;
            switch (this._resizeCtrlIsDragging) {
                case 0: // Top Left
                    // Top Left
                    xMulti = -1;
                    yMulti = -1;
                    cursor = 'nwse-resize';
                    break;
                case 1: // Top Right
                    // Top Right
                    xMulti = 1;
                    yMulti = -1;
                    cursor = 'nesw-resize';
                    break;
                case 2: // Bottom Left
                    // Bottom Left
                    xMulti = -1;
                    yMulti = 1;
                    cursor = 'nesw-resize';
                    break;
                case 3: // Bottom Right
                    // Bottom Right
                    xMulti = 1;
                    yMulti = 1;
                    cursor = 'nwse-resize';
                    break;
            }
            /** @type {?} */
            var iFX = (mouseCurX - this._posResizeStartX) * xMulti;
            /** @type {?} */
            var iFY = (mouseCurY - this._posResizeStartY) * yMulti;
            /** @type {?} */
            var iFR;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY;
            }
            else {
                iFR = this._posResizeStartSize + iFX;
            }
            /** @type {?} */
            var wasSize = this._size;
            this._size = Math.max(this._minSize, iFR);
            /** @type {?} */
            var posModifier = (this._size - wasSize) / 2;
            this._x += posModifier * xMulti;
            this._y += posModifier * yMulti;
            this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
            res = true;
            this._events.trigger('area-resize');
        }
        else {
            /** @type {?} */
            var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
            if (hoveredResizeBox > -1) {
                switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                }
                this._areaIsHover = false;
                this._resizeCtrlIsHover = hoveredResizeBox;
                res = true;
            }
            else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    };
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    CropAreaSquare.prototype.processMouseDown = /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    function (mouseDownX, mouseDownY) {
        /** @type {?} */
        var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
        if (isWithinResizeCtrl > -1) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = isWithinResizeCtrl;
            this._resizeCtrlIsHover = isWithinResizeCtrl;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._resizeCtrlIsDragging = -1;
            this._resizeCtrlIsHover = -1;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    };
    /**
     * @return {?}
     */
    CropAreaSquare.prototype.processMouseUp = /**
     * @return {?}
     */
    function () {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._resizeCtrlIsDragging > -1) {
            this._resizeCtrlIsDragging = -1;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = -1;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    };
    return CropAreaSquare;
}(CropArea));
export { CropAreaSquare };
if (false) {
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlBaseRadius;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlNormalRatio;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlHoverRatio;
    /** @type {?} */
    CropAreaSquare.prototype._iconMoveNormalRatio;
    /** @type {?} */
    CropAreaSquare.prototype._iconMoveHoverRatio;
    /** @type {?} */
    CropAreaSquare.prototype._posDragStartX;
    /** @type {?} */
    CropAreaSquare.prototype._posDragStartY;
    /** @type {?} */
    CropAreaSquare.prototype._posResizeStartX;
    /** @type {?} */
    CropAreaSquare.prototype._posResizeStartY;
    /** @type {?} */
    CropAreaSquare.prototype._posResizeStartSize;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlIsHover;
    /** @type {?} */
    CropAreaSquare.prototype._areaIsHover;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlIsDragging;
    /** @type {?} */
    CropAreaSquare.prototype._areaIsDragging;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlNormalRadius;
    /** @type {?} */
    CropAreaSquare.prototype._resizeCtrlHoverRadius;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLXNxdWFyZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWltZy1jcm9wLyIsInNvdXJjZXMiOlsic3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtYXJlYS1zcXVhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXJDLElBQUE7SUFBb0MsMENBQVE7SUFxQnhDLHdCQUFZLEdBQUcsRUFBRSxNQUFNO1FBQXZCLFlBQ0ksa0JBQU0sR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUlyQjtzQ0F6QnVCLEVBQUU7dUNBQ0QsSUFBSTtzQ0FDTCxDQUFDO3FDQUNGLEdBQUc7b0NBQ0osR0FBRzsrQkFFUixDQUFDOytCQUNELENBQUM7aUNBQ0MsQ0FBQztpQ0FDRCxDQUFDO29DQUNFLENBQUM7bUNBRUYsQ0FBQyxDQUFDOzZCQUNSLEtBQUs7c0NBQ0ksQ0FBQyxDQUFDO2dDQUNSLEtBQUs7UUFRbkIsS0FBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFJLENBQUMsc0JBQXNCLENBQUM7UUFDeEYsS0FBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFJLENBQUMscUJBQXFCLENBQUM7O0tBQ3pGO0lBQUEsQ0FBQzs7OztJQUVGLDJDQUFrQjs7O0lBQWxCOztRQUNJLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLE9BQU87WUFDSCxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDbEMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENB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QUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMzQztLQUNKOzs7O0lBRUQsdUNBQWM7OztJQUFkO1FBQ0ksSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDM0M7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7S0FDM0I7eUJBbk5MO0VBRW9DLFFBQVEsRUFrTjNDLENBQUE7QUFsTkQsMEJBa05DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDcm9wQXJlYX0gZnJvbSBcIi4vY3JvcC1hcmVhXCI7XG5cbmV4cG9ydCBjbGFzcyBDcm9wQXJlYVNxdWFyZSBleHRlbmRzIENyb3BBcmVhIHtcbiAgICBfcmVzaXplQ3RybEJhc2VSYWRpdXMgPSAxMDtcbiAgICBfcmVzaXplQ3RybE5vcm1hbFJhdGlvID0gMC43NTtcbiAgICBfcmVzaXplQ3RybEhvdmVyUmF0aW8gPSAxO1xuICAgIF9pY29uTW92ZU5vcm1hbFJhdGlvID0gMC45O1xuICAgIF9pY29uTW92ZUhvdmVyUmF0aW8gPSAxLjI7XG5cbiAgICBfcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gICAgX3Bvc0RyYWdTdGFydFkgPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFggPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFkgPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFNpemUgPSAwO1xuXG4gICAgX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG4gICAgX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9yZXNpemVDdHJsTm9ybWFsUmFkaXVzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfcmVzaXplQ3RybEhvdmVyUmFkaXVzOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihjdHgsIGV2ZW50cykge1xuICAgICAgICBzdXBlcihjdHgsIGV2ZW50cyk7XG5cbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybE5vcm1hbFJhZGl1cyA9IHRoaXMuX3Jlc2l6ZUN0cmxCYXNlUmFkaXVzICogdGhpcy5fcmVzaXplQ3RybE5vcm1hbFJhdGlvO1xuICAgICAgICB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMgPSB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cyAqIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhdGlvO1xuICAgIH07XG5cbiAgICBfY2FsY1NxdWFyZUNvcm5lcnMoKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW3RoaXMuX3ggLSBoU2l6ZSwgdGhpcy5feSAtIGhTaXplXSxcbiAgICAgICAgICAgIFt0aGlzLl94ICsgaFNpemUsIHRoaXMuX3kgLSBoU2l6ZV0sXG4gICAgICAgICAgICBbdGhpcy5feCAtIGhTaXplLCB0aGlzLl95ICsgaFNpemVdLFxuICAgICAgICAgICAgW3RoaXMuX3ggKyBoU2l6ZSwgdGhpcy5feSArIGhTaXplXVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIF9jYWxjU3F1YXJlRGltZW5zaW9ucygpIHtcbiAgICAgICAgdmFyIGhTaXplID0gdGhpcy5fc2l6ZSAvIDI7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiB0aGlzLl94IC0gaFNpemUsXG4gICAgICAgICAgICB0b3A6IHRoaXMuX3kgLSBoU2l6ZSxcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLl94ICsgaFNpemUsXG4gICAgICAgICAgICBib3R0b206IHRoaXMuX3kgKyBoU2l6ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9pc0Nvb3JkV2l0aGluQXJlYShjb29yZCkge1xuICAgICAgICB2YXIgc3F1YXJlRGltZW5zaW9ucyA9IHRoaXMuX2NhbGNTcXVhcmVEaW1lbnNpb25zKCk7XG4gICAgICAgIHJldHVybiAoY29vcmRbMF0gPj0gc3F1YXJlRGltZW5zaW9ucy5sZWZ0ICYmIGNvb3JkWzBdIDw9IHNxdWFyZURpbWVuc2lvbnMucmlnaHQgJiYgY29vcmRbMV0gPj0gc3F1YXJlRGltZW5zaW9ucy50b3AgJiYgY29vcmRbMV0gPD0gc3F1YXJlRGltZW5zaW9ucy5ib3R0b20pO1xuICAgIH1cblxuICAgIF9pc0Nvb3JkV2l0aGluUmVzaXplQ3RybChjb29yZCkge1xuICAgICAgICB2YXIgcmVzaXplSWNvbnNDZW50ZXJDb29yZHMgPSB0aGlzLl9jYWxjU3F1YXJlQ29ybmVycygpO1xuICAgICAgICB2YXIgcmVzID0gLTE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXNpemVJY29uc0NlbnRlckNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSByZXNpemVJY29uc0NlbnRlckNvb3Jkc1tpXTtcbiAgICAgICAgICAgIGlmIChjb29yZFswXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gLSB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMgJiYgY29vcmRbMF0gPCByZXNpemVJY29uQ2VudGVyQ29vcmRzWzBdICsgdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmXG4gICAgICAgICAgICAgICAgY29vcmRbMV0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdIC0gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmIGNvb3JkWzFdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1sxXSArIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cykge1xuICAgICAgICAgICAgICAgIHJlcyA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBfZHJhd0FyZWEoY3R4LCBjZW50ZXJDb29yZHMsIHNpemUpIHtcbiAgICAgICAgdmFyIGhTaXplID0gc2l6ZSAvIDI7XG4gICAgICAgIGN0eC5yZWN0KGNlbnRlckNvb3Jkc1swXSAtIGhTaXplLCBjZW50ZXJDb29yZHNbMV0gLSBoU2l6ZSwgc2l6ZSwgc2l6ZSk7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgQ3JvcEFyZWEucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBkcmF3IG1vdmUgaWNvblxuICAgICAgICB0aGlzLl9jcm9wQ2FudmFzLmRyYXdJY29uTW92ZShbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX2FyZWFJc0hvdmVyID8gdGhpcy5faWNvbk1vdmVIb3ZlclJhdGlvIDogdGhpcy5faWNvbk1vdmVOb3JtYWxSYXRpbyk7XG5cbiAgICAgICAgLy8gZHJhdyByZXNpemUgY3ViZXNcbiAgICAgICAgdmFyIHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzID0gdGhpcy5fY2FsY1NxdWFyZUNvcm5lcnMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmVzaXplSWNvbkNlbnRlckNvb3JkcyA9IHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzW2ldO1xuICAgICAgICAgICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvblJlc2l6ZUNpcmNsZShyZXNpemVJY29uQ2VudGVyQ29vcmRzLCB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cywgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPT09IGkgPyB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYXRpbyA6IHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWCwgbW91c2VDdXJZKSB7XG4gICAgICAgIHZhciBjdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIHZhciByZXMgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy5feCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc0RyYWdTdGFydFg7XG4gICAgICAgICAgICB0aGlzLl95ID0gbW91c2VDdXJZIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnNvciA9ICdtb3ZlJztcbiAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPiAtMSkge1xuICAgICAgICAgICAgdmFyIHhNdWx0aSwgeU11bHRpO1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy8gVG9wIExlZnRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vIFRvcCBSaWdodFxuICAgICAgICAgICAgICAgICAgICB4TXVsdGkgPSAxO1xuICAgICAgICAgICAgICAgICAgICB5TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvLyBCb3R0b20gTGVmdFxuICAgICAgICAgICAgICAgICAgICB4TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOiAvLyBCb3R0b20gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ253c2UtcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaUZYID0gKG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCkgKiB4TXVsdGk7XG4gICAgICAgICAgICB2YXIgaUZZID0gKG1vdXNlQ3VyWSAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSkgKiB5TXVsdGk7XG4gICAgICAgICAgICB2YXIgaUZSO1xuICAgICAgICAgICAgaWYgKGlGWCA+IGlGWSkge1xuICAgICAgICAgICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaUZSID0gdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplICsgaUZYO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHdhc1NpemUgPSB0aGlzLl9zaXplO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IE1hdGgubWF4KHRoaXMuX21pblNpemUsIGlGUik7XG4gICAgICAgICAgICB2YXIgcG9zTW9kaWZpZXIgPSAodGhpcy5fc2l6ZSAtIHdhc1NpemUpIC8gMjtcbiAgICAgICAgICAgIHRoaXMuX3ggKz0gcG9zTW9kaWZpZXIgKiB4TXVsdGk7XG4gICAgICAgICAgICB0aGlzLl95ICs9IHBvc01vZGlmaWVyICogeU11bHRpO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZztcbiAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1yZXNpemUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBob3ZlcmVkUmVzaXplQm94ID0gdGhpcy5faXNDb29yZFdpdGhpblJlc2l6ZUN0cmwoW21vdXNlQ3VyWCwgbW91c2VDdXJZXSk7XG4gICAgICAgICAgICBpZiAoaG92ZXJlZFJlc2l6ZUJveCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChob3ZlcmVkUmVzaXplQm94KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IGhvdmVyZWRSZXNpemVCb3g7XG4gICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlQ3VyWCwgbW91c2VDdXJZXSkpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kb250RHJhZ091dHNpZGUoKTtcbiAgICAgICAgdGhpcy5fY3R4LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VEb3duKG1vdXNlRG93blgsIG1vdXNlRG93blkpIHtcbiAgICAgICAgdmFyIGlzV2l0aGluUmVzaXplQ3RybCA9IHRoaXMuX2lzQ29vcmRXaXRoaW5SZXNpemVDdHJsKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSk7XG4gICAgICAgIGlmIChpc1dpdGhpblJlc2l6ZUN0cmwgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IGlzV2l0aGluUmVzaXplQ3RybDtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gaXNXaXRoaW5SZXNpemVDdHJsO1xuICAgICAgICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRYID0gbW91c2VEb3duWDtcbiAgICAgICAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSA9IG1vdXNlRG93blk7XG4gICAgICAgICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgPSB0aGlzLl9zaXplO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLXN0YXJ0Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPSAtMTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gbW91c2VEb3duWCAtIHRoaXMuX3g7XG4gICAgICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gbW91c2VEb3duWSAtIHRoaXMuX3k7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLXN0YXJ0Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VVcCgvKm1vdXNlVXBYLCBtb3VzZVVwWSovKSB7XG4gICAgICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLW1vdmUtZW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1yZXNpemUtZW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSAtMTtcblxuICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gMDtcbiAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IDA7XG4gICAgfVxufSJdfQ==