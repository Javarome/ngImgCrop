/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropArea } from "./crop-area";
export class CropAreaSquare extends CropArea {
    /**
     * @param {?} ctx
     * @param {?} events
     */
    constructor(ctx, events) {
        super(ctx, events);
        this._resizeCtrlBaseRadius = 10;
        this._resizeCtrlNormalRatio = 0.75;
        this._resizeCtrlHoverRatio = 1;
        this._iconMoveNormalRatio = 0.9;
        this._iconMoveHoverRatio = 1.2;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
        this._posResizeStartX = 0;
        this._posResizeStartY = 0;
        this._posResizeStartSize = 0;
        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        this._resizeCtrlIsDragging = -1;
        this._areaIsDragging = false;
        this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
        this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;
    }
    ;
    /**
     * @return {?}
     */
    _calcSquareCorners() {
        /** @type {?} */
        var hSize = this._size / 2;
        return [
            [this._x - hSize, this._y - hSize],
            [this._x + hSize, this._y - hSize],
            [this._x - hSize, this._y + hSize],
            [this._x + hSize, this._y + hSize]
        ];
    }
    /**
     * @return {?}
     */
    _calcSquareDimensions() {
        /** @type {?} */
        var hSize = this._size / 2;
        return {
            left: this._x - hSize,
            top: this._y - hSize,
            right: this._x + hSize,
            bottom: this._y + hSize
        };
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinArea(coord) {
        /** @type {?} */
        var squareDimensions = this._calcSquareDimensions();
        return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinResizeCtrl(coord) {
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
    }
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    _drawArea(ctx, centerCoords, size) {
        /** @type {?} */
        var hSize = size / 2;
        ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
    }
    /**
     * @return {?}
     */
    draw() {
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
    }
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
    }
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    processMouseDown(mouseDownX, mouseDownY) {
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
    }
    /**
     * @return {?}
     */
    processMouseUp() {
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
    }
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1hcmVhLXNxdWFyZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nLWltZy1jcm9wLyIsInNvdXJjZXMiOlsic3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtYXJlYS1zcXVhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFckMsTUFBTSxxQkFBc0IsU0FBUSxRQUFROzs7OztJQXFCeEMsWUFBWSxHQUFHLEVBQUUsTUFBTTtRQUNuQixLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3FDQXJCQyxFQUFFO3NDQUNELElBQUk7cUNBQ0wsQ0FBQztvQ0FDRixHQUFHO21DQUNKLEdBQUc7OEJBRVIsQ0FBQzs4QkFDRCxDQUFDO2dDQUNDLENBQUM7Z0NBQ0QsQ0FBQzttQ0FDRSxDQUFDO2tDQUVGLENBQUMsQ0FBQzs0QkFDUixLQUFLO3FDQUNJLENBQUMsQ0FBQzsrQkFDUixLQUFLO1FBUW5CLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1FBQ3hGLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0tBQ3pGO0lBQUEsQ0FBQzs7OztJQUVGLGtCQUFrQjs7UUFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUMzQixPQUFPO1lBQ0gsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUNsQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVB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QUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNDO0tBQ0o7Ozs7SUFFRCxjQUFjO1FBQ1YsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxJQUFJLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDM0M7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7S0FDM0I7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JvcEFyZWF9IGZyb20gXCIuL2Nyb3AtYXJlYVwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEFyZWFTcXVhcmUgZXh0ZW5kcyBDcm9wQXJlYSB7XG4gICAgX3Jlc2l6ZUN0cmxCYXNlUmFkaXVzID0gMTA7XG4gICAgX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbyA9IDAuNzU7XG4gICAgX3Jlc2l6ZUN0cmxIb3ZlclJhdGlvID0gMTtcbiAgICBfaWNvbk1vdmVOb3JtYWxSYXRpbyA9IDAuOTtcbiAgICBfaWNvbk1vdmVIb3ZlclJhdGlvID0gMS4yO1xuXG4gICAgX3Bvc0RyYWdTdGFydFggPSAwO1xuICAgIF9wb3NEcmFnU3RhcnRZID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRYID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRZID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRTaXplID0gMDtcblxuICAgIF9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgIF9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgIF9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IC0xO1xuICAgIF9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfcmVzaXplQ3RybE5vcm1hbFJhZGl1czogbnVtYmVyO1xuICAgIHByaXZhdGUgX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1czogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoY3R4LCBldmVudHMpIHtcbiAgICAgICAgc3VwZXIoY3R4LCBldmVudHMpO1xuXG4gICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYWRpdXMgPSB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cyAqIHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbztcbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzID0gdGhpcy5fcmVzaXplQ3RybEJhc2VSYWRpdXMgKiB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYXRpbztcbiAgICB9O1xuXG4gICAgX2NhbGNTcXVhcmVDb3JuZXJzKCkge1xuICAgICAgICB2YXIgaFNpemUgPSB0aGlzLl9zaXplIC8gMjtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFt0aGlzLl94IC0gaFNpemUsIHRoaXMuX3kgLSBoU2l6ZV0sXG4gICAgICAgICAgICBbdGhpcy5feCArIGhTaXplLCB0aGlzLl95IC0gaFNpemVdLFxuICAgICAgICAgICAgW3RoaXMuX3ggLSBoU2l6ZSwgdGhpcy5feSArIGhTaXplXSxcbiAgICAgICAgICAgIFt0aGlzLl94ICsgaFNpemUsIHRoaXMuX3kgKyBoU2l6ZV1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBfY2FsY1NxdWFyZURpbWVuc2lvbnMoKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogdGhpcy5feCAtIGhTaXplLFxuICAgICAgICAgICAgdG9wOiB0aGlzLl95IC0gaFNpemUsXG4gICAgICAgICAgICByaWdodDogdGhpcy5feCArIGhTaXplLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLl95ICsgaFNpemVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfaXNDb29yZFdpdGhpbkFyZWEoY29vcmQpIHtcbiAgICAgICAgdmFyIHNxdWFyZURpbWVuc2lvbnMgPSB0aGlzLl9jYWxjU3F1YXJlRGltZW5zaW9ucygpO1xuICAgICAgICByZXR1cm4gKGNvb3JkWzBdID49IHNxdWFyZURpbWVuc2lvbnMubGVmdCAmJiBjb29yZFswXSA8PSBzcXVhcmVEaW1lbnNpb25zLnJpZ2h0ICYmIGNvb3JkWzFdID49IHNxdWFyZURpbWVuc2lvbnMudG9wICYmIGNvb3JkWzFdIDw9IHNxdWFyZURpbWVuc2lvbnMuYm90dG9tKTtcbiAgICB9XG5cbiAgICBfaXNDb29yZFdpdGhpblJlc2l6ZUN0cmwoY29vcmQpIHtcbiAgICAgICAgdmFyIHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzID0gdGhpcy5fY2FsY1NxdWFyZUNvcm5lcnMoKTtcbiAgICAgICAgdmFyIHJlcyA9IC0xO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcmVzaXplSWNvbnNDZW50ZXJDb29yZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByZXNpemVJY29uQ2VudGVyQ29vcmRzID0gcmVzaXplSWNvbnNDZW50ZXJDb29yZHNbaV07XG4gICAgICAgICAgICBpZiAoY29vcmRbMF0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzBdIC0gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmIGNvb3JkWzBdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSArIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cyAmJlxuICAgICAgICAgICAgICAgIGNvb3JkWzFdID4gcmVzaXplSWNvbkNlbnRlckNvb3Jkc1sxXSAtIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cyAmJiBjb29yZFsxXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gKyB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZXMgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHNpemUgLyAyO1xuICAgICAgICBjdHgucmVjdChjZW50ZXJDb29yZHNbMF0gLSBoU2l6ZSwgY2VudGVyQ29vcmRzWzFdIC0gaFNpemUsIHNpemUsIHNpemUpO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIENyb3BBcmVhLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgLy8gZHJhdyBtb3ZlIGljb25cbiAgICAgICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvbk1vdmUoW3RoaXMuX3gsIHRoaXMuX3ldLCB0aGlzLl9hcmVhSXNIb3ZlciA/IHRoaXMuX2ljb25Nb3ZlSG92ZXJSYXRpbyA6IHRoaXMuX2ljb25Nb3ZlTm9ybWFsUmF0aW8pO1xuXG4gICAgICAgIC8vIGRyYXcgcmVzaXplIGN1YmVzXG4gICAgICAgIHZhciByZXNpemVJY29uc0NlbnRlckNvb3JkcyA9IHRoaXMuX2NhbGNTcXVhcmVDb3JuZXJzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXNpemVJY29uc0NlbnRlckNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSByZXNpemVJY29uc0NlbnRlckNvb3Jkc1tpXTtcbiAgICAgICAgICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25SZXNpemVDaXJjbGUocmVzaXplSWNvbkNlbnRlckNvb3JkcywgdGhpcy5fcmVzaXplQ3RybEJhc2VSYWRpdXMsIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID09PSBpID8gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmF0aW8gOiB0aGlzLl9yZXNpemVDdHJsTm9ybWFsUmF0aW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlTW92ZShtb3VzZUN1clgsIG1vdXNlQ3VyWSkge1xuICAgICAgICB2YXIgY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICB2YXIgcmVzID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSAtMTtcbiAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3ggPSBtb3VzZUN1clggLSB0aGlzLl9wb3NEcmFnU3RhcnRYO1xuICAgICAgICAgICAgdGhpcy5feSA9IG1vdXNlQ3VyWSAtIHRoaXMuX3Bvc0RyYWdTdGFydFk7XG4gICAgICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICAgICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID4gLTEpIHtcbiAgICAgICAgICAgIHZhciB4TXVsdGksIHlNdWx0aTtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vIFRvcCBMZWZ0XG4gICAgICAgICAgICAgICAgICAgIHhNdWx0aSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB5TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ253c2UtcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvLyBUb3AgUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogLy8gQm90dG9tIExlZnRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogLy8gQm90dG9tIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHhNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlGWCA9IChtb3VzZUN1clggLSB0aGlzLl9wb3NSZXNpemVTdGFydFgpICogeE11bHRpO1xuICAgICAgICAgICAgdmFyIGlGWSA9IChtb3VzZUN1clkgLSB0aGlzLl9wb3NSZXNpemVTdGFydFkpICogeU11bHRpO1xuICAgICAgICAgICAgdmFyIGlGUjtcbiAgICAgICAgICAgIGlmIChpRlggPiBpRlkpIHtcbiAgICAgICAgICAgICAgICBpRlIgPSB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgKyBpRlk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB3YXNTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3NpemUgPSBNYXRoLm1heCh0aGlzLl9taW5TaXplLCBpRlIpO1xuICAgICAgICAgICAgdmFyIHBvc01vZGlmaWVyID0gKHRoaXMuX3NpemUgLSB3YXNTaXplKSAvIDI7XG4gICAgICAgICAgICB0aGlzLl94ICs9IHBvc01vZGlmaWVyICogeE11bHRpO1xuICAgICAgICAgICAgdGhpcy5feSArPSBwb3NNb2RpZmllciAqIHlNdWx0aTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmc7XG4gICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaG92ZXJlZFJlc2l6ZUJveCA9IHRoaXMuX2lzQ29vcmRXaXRoaW5SZXNpemVDdHJsKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pO1xuICAgICAgICAgICAgaWYgKGhvdmVyZWRSZXNpemVCb3ggPiAtMSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoaG92ZXJlZFJlc2l6ZUJveCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSBob3ZlcmVkUmVzaXplQm94O1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICAgICAgICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gICAgICAgIHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gY3Vyc29yO1xuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YLCBtb3VzZURvd25ZKSB7XG4gICAgICAgIHZhciBpc1dpdGhpblJlc2l6ZUN0cmwgPSB0aGlzLl9pc0Nvb3JkV2l0aGluUmVzaXplQ3RybChbbW91c2VEb3duWCwgbW91c2VEb3duWV0pO1xuICAgICAgICBpZiAoaXNXaXRoaW5SZXNpemVDdHJsID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPSBpc1dpdGhpblJlc2l6ZUN0cmw7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IGlzV2l0aGluUmVzaXplQ3RybDtcbiAgICAgICAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCA9IG1vdXNlRG93blg7XG4gICAgICAgICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFkgPSBtb3VzZURvd25ZO1xuICAgICAgICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1zdGFydCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgICAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IG1vdXNlRG93blggLSB0aGlzLl94O1xuICAgICAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IG1vdXNlRG93blkgLSB0aGlzLl95O1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1zdGFydCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlVXAoLyptb3VzZVVwWCwgbW91c2VVcFkqLykge1xuICAgICAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IC0xO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG5cbiAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gICAgICAgIHRoaXMuX3Bvc0RyYWdTdGFydFkgPSAwO1xuICAgIH1cbn0iXX0=