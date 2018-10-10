/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var CropCanvas = /** @class */ (function () {
    function CropCanvas(ctx) {
        this.ctx = ctx;
        // Shape = Array of [x,y]; [0, 0] - center
        this.shapeArrowNW = [[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
        this.shapeArrowNE = [[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
        this.shapeArrowSW = [[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
        this.shapeArrowSE = [[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
        this.shapeArrowN = [[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
        this.shapeArrowW = [[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
        this.shapeArrowS = [[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
        this.shapeArrowE = [[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];
        // Colors
        this.colors = {
            areaOutline: '#fff',
            resizeBoxStroke: '#fff',
            resizeBoxFill: '#444',
            resizeBoxArrowFill: '#fff',
            resizeCircleStroke: '#fff',
            resizeCircleFill: '#444',
            moveIconFill: '#fff'
        };
    }
    // Calculate Point
    /**
     * @param {?} point
     * @param {?} offset
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.calcPoint = /**
     * @param {?} point
     * @param {?} offset
     * @param {?} scale
     * @return {?}
     */
    function (point, offset, scale) {
        return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
    };
    ;
    /**
     * @param {?} shape
     * @param {?} fillStyle
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawFilledPolygon = /**
     * @param {?} shape
     * @param {?} fillStyle
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    function (shape, fillStyle, centerCoords, scale) {
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        /** @type {?} */
        var pc;
        /** @type {?} */
        var pc0 = this.calcPoint(shape[0], centerCoords, scale);
        this.ctx.moveTo(pc0[0], pc0[1]);
        for (var p in shape) {
            /** @type {?} */
            var pNum = parseInt(p, 10);
            if (pNum > 0) {
                pc = this.calcPoint(shape[pNum], centerCoords, scale);
                this.ctx.lineTo(pc[0], pc[1]);
            }
        }
        this.ctx.lineTo(pc0[0], pc0[1]);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    };
    ;
    /* Icons */
    /**
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawIconMove = /**
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    function (centerCoords, scale) {
        this.drawFilledPolygon(this.shapeArrowN, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowW, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowS, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowE, this.colors.moveIconFill, centerCoords, scale);
    };
    /**
     * @param {?} centerCoords
     * @param {?} circleRadius
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawIconResizeCircle = /**
     * @param {?} centerCoords
     * @param {?} circleRadius
     * @param {?} scale
     * @return {?}
     */
    function (centerCoords, circleRadius, scale) {
        /** @type {?} */
        var scaledCircleRadius = circleRadius * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeCircleStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeCircleFill;
        this.ctx.beginPath();
        this.ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    };
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawIconResizeBoxBase = /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    function (centerCoords, boxSize, scale) {
        /** @type {?} */
        var scaledBoxSize = boxSize * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeBoxStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeBoxFill;
        this.ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.restore();
    };
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawIconResizeBoxNESW = /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    function (centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNE, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSW, this.colors.resizeBoxArrowFill, centerCoords, scale);
    };
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    CropCanvas.prototype.drawIconResizeBoxNWSE = /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    function (centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNW, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSE, this.colors.resizeBoxArrowFill, centerCoords, scale);
    };
    /* Crop Area */
    /**
     * @param {?} image
     * @param {?} centerCoords
     * @param {?} size
     * @param {?} fnDrawClipPath
     * @return {?}
     */
    CropCanvas.prototype.drawCropArea = /**
     * @param {?} image
     * @param {?} centerCoords
     * @param {?} size
     * @param {?} fnDrawClipPath
     * @return {?}
     */
    function (image, centerCoords, size, fnDrawClipPath) {
        /** @type {?} */
        var xRatio = image.width / this.ctx.canvas.width;
        /** @type {?} */
        var yRatio = image.height / this.ctx.canvas.height;
        /** @type {?} */
        var xLeft = centerCoords[0] - size / 2;
        /** @type {?} */
        var yTop = centerCoords[1] - size / 2;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.areaOutline;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        // draw part of original image
        if (size > 0) {
            this.ctx.drawImage(image, xLeft * xRatio, yTop * yRatio, size * xRatio, size * yRatio, xLeft, yTop, size, size);
        }
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.restore();
    };
    ;
    return CropCanvas;
}());
export { CropCanvas };
if (false) {
    /** @type {?} */
    CropCanvas.prototype.shapeArrowNW;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowNE;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowSW;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowSE;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowN;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowW;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowS;
    /** @type {?} */
    CropCanvas.prototype.shapeArrowE;
    /** @type {?} */
    CropCanvas.prototype.colors;
    /** @type {?} */
    CropCanvas.prototype.ctx;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1jYW52YXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1pbWctY3JvcC8iLCJzb3VyY2VzIjpbInNyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLWNhbnZhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBQTtJQXNCSSxvQkFBb0IsR0FBRztRQUFILFFBQUcsR0FBSCxHQUFHLENBQUE7OzRCQXBCUixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDbEYsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUMzRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQzNFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7MkJBQ3JFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzsyQkFDL0UsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzJCQUMvRSxDQUFDLENBQUMsQ0FB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RWhCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEI7SUFBQSxDQUFDO3FCQTFITjtJQTJIQyxDQUFBO0FBM0hELHNCQTJIQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBDcm9wQ2FudmFzIHtcbiAgICAvLyBTaGFwZSA9IEFycmF5IG9mIFt4LHldOyBbMCwgMF0gLSBjZW50ZXJcbiAgICBzaGFwZUFycm93TlcgPSBbWy0wLjUsIC0yXSwgWy0zLCAtNC41XSwgWy0wLjUsIC03XSwgWy03LCAtN10sIFstNywgLTAuNV0sIFstNC41LCAtM10sIFstMiwgLTAuNV1dO1xuICAgIHNoYXBlQXJyb3dORSA9IFtbMC41LCAtMl0sIFszLCAtNC41XSwgWzAuNSwgLTddLCBbNywgLTddLCBbNywgLTAuNV0sIFs0LjUsIC0zXSwgWzIsIC0wLjVdXTtcbiAgICBzaGFwZUFycm93U1cgPSBbWy0wLjUsIDJdLCBbLTMsIDQuNV0sIFstMC41LCA3XSwgWy03LCA3XSwgWy03LCAwLjVdLCBbLTQuNSwgM10sIFstMiwgMC41XV07XG4gICAgc2hhcGVBcnJvd1NFID0gW1swLjUsIDJdLCBbMywgNC41XSwgWzAuNSwgN10sIFs3LCA3XSwgWzcsIDAuNV0sIFs0LjUsIDNdLCBbMiwgMC41XV07XG4gICAgc2hhcGVBcnJvd04gPSBbWy0xLjUsIC0yLjVdLCBbLTEuNSwgLTZdLCBbLTUsIC02XSwgWzAsIC0xMV0sIFs1LCAtNl0sIFsxLjUsIC02XSwgWzEuNSwgLTIuNV1dO1xuICAgIHNoYXBlQXJyb3dXID0gW1stMi41LCAtMS41XSwgWy02LCAtMS41XSwgWy02LCAtNV0sIFstMTEsIDBdLCBbLTYsIDVdLCBbLTYsIDEuNV0sIFstMi41LCAxLjVdXTtcbiAgICBzaGFwZUFycm93UyA9IFtbLTEuNSwgMi41XSwgWy0xLjUsIDZdLCBbLTUsIDZdLCBbMCwgMTFdLCBbNSwgNl0sIFsxLjUsIDZdLCBbMS41LCAyLjVdXTtcbiAgICBzaGFwZUFycm93RSA9IFtbMi41LCAtMS41XSwgWzYsIC0xLjVdLCBbNiwgLTVdLCBbMTEsIDBdLCBbNiwgNV0sIFs2LCAxLjVdLCBbMi41LCAxLjVdXTtcblxuICAgIC8vIENvbG9yc1xuICAgIGNvbG9ycyA9IHtcbiAgICAgICAgYXJlYU91dGxpbmU6ICcjZmZmJyxcbiAgICAgICAgcmVzaXplQm94U3Ryb2tlOiAnI2ZmZicsXG4gICAgICAgIHJlc2l6ZUJveEZpbGw6ICcjNDQ0JyxcbiAgICAgICAgcmVzaXplQm94QXJyb3dGaWxsOiAnI2ZmZicsXG4gICAgICAgIHJlc2l6ZUNpcmNsZVN0cm9rZTogJyNmZmYnLFxuICAgICAgICByZXNpemVDaXJjbGVGaWxsOiAnIzQ0NCcsXG4gICAgICAgIG1vdmVJY29uRmlsbDogJyNmZmYnXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY3R4KSB7fVxuXG4gICAgLy8gQ2FsY3VsYXRlIFBvaW50XG4gICAgY2FsY1BvaW50KHBvaW50LCBvZmZzZXQsIHNjYWxlKSB7XG4gICAgICAgIHJldHVybiBbc2NhbGUgKiBwb2ludFswXSArIG9mZnNldFswXSwgc2NhbGUgKiBwb2ludFsxXSArIG9mZnNldFsxXV07XG4gICAgfTtcblxuICAgIC8vIERyYXcgRmlsbGVkIFBvbHlnb25cbiAgICBwcml2YXRlIGRyYXdGaWxsZWRQb2x5Z29uKHNoYXBlLCBmaWxsU3R5bGUsIGNlbnRlckNvb3Jkcywgc2NhbGUpIHtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB2YXIgcGMsIHBjMCA9IHRoaXMuY2FsY1BvaW50KHNoYXBlWzBdLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKHBjMFswXSwgcGMwWzFdKTtcblxuICAgICAgICBmb3IgKHZhciBwIGluIHNoYXBlKSB7XG4gICAgICAgICAgICBsZXQgcE51bSA9IHBhcnNlSW50KHAsIDEwKTtcbiAgICAgICAgICAgIGlmIChwTnVtID4gMCkge1xuICAgICAgICAgICAgICAgIHBjID0gdGhpcy5jYWxjUG9pbnQoc2hhcGVbcE51bV0sIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwY1swXSwgcGNbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHgubGluZVRvKHBjMFswXSwgcGMwWzFdKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH07XG5cbiAgICAvKiBJY29ucyAqL1xuXG4gICAgZHJhd0ljb25Nb3ZlKGNlbnRlckNvb3Jkcywgc2NhbGUpIHtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dOLCB0aGlzLmNvbG9ycy5tb3ZlSWNvbkZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd1csIHRoaXMuY29sb3JzLm1vdmVJY29uRmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93UywgdGhpcy5jb2xvcnMubW92ZUljb25GaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dFLCB0aGlzLmNvbG9ycy5tb3ZlSWNvbkZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgIH1cblxuICAgIGRyYXdJY29uUmVzaXplQ2lyY2xlKGNlbnRlckNvb3JkcywgY2lyY2xlUmFkaXVzLCBzY2FsZSkge1xuICAgICAgICB2YXIgc2NhbGVkQ2lyY2xlUmFkaXVzID0gY2lyY2xlUmFkaXVzICogc2NhbGU7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9ycy5yZXNpemVDaXJjbGVTdHJva2U7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3JzLnJlc2l6ZUNpcmNsZUZpbGw7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5hcmMoY2VudGVyQ29vcmRzWzBdLCBjZW50ZXJDb29yZHNbMV0sIHNjYWxlZENpcmNsZVJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIGRyYXdJY29uUmVzaXplQm94QmFzZSAoY2VudGVyQ29vcmRzLCBib3hTaXplLCBzY2FsZSkge1xuICAgICAgICB2YXIgc2NhbGVkQm94U2l6ZSA9IGJveFNpemUgKiBzY2FsZTtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3JzLnJlc2l6ZUJveFN0cm9rZTtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcnMucmVzaXplQm94RmlsbDtcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoY2VudGVyQ29vcmRzWzBdIC0gc2NhbGVkQm94U2l6ZSAvIDIsIGNlbnRlckNvb3Jkc1sxXSAtIHNjYWxlZEJveFNpemUgLyAyLCBzY2FsZWRCb3hTaXplLCBzY2FsZWRCb3hTaXplKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdChjZW50ZXJDb29yZHNbMF0gLSBzY2FsZWRCb3hTaXplIC8gMiwgY2VudGVyQ29vcmRzWzFdIC0gc2NhbGVkQm94U2l6ZSAvIDIsIHNjYWxlZEJveFNpemUsIHNjYWxlZEJveFNpemUpO1xuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICAgIGRyYXdJY29uUmVzaXplQm94TkVTVyhjZW50ZXJDb29yZHMsIGJveFNpemUsIHNjYWxlKSB7XG4gICAgICAgIHRoaXMuZHJhd0ljb25SZXNpemVCb3hCYXNlKGNlbnRlckNvb3JkcywgYm94U2l6ZSwgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd05FLCB0aGlzLmNvbG9ycy5yZXNpemVCb3hBcnJvd0ZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd1NXLCB0aGlzLmNvbG9ycy5yZXNpemVCb3hBcnJvd0ZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgIH1cbiAgICBkcmF3SWNvblJlc2l6ZUJveE5XU0UoY2VudGVyQ29vcmRzLCBib3hTaXplLCBzY2FsZSkge1xuICAgICAgICB0aGlzLmRyYXdJY29uUmVzaXplQm94QmFzZShjZW50ZXJDb29yZHMsIGJveFNpemUsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dOVywgdGhpcy5jb2xvcnMucmVzaXplQm94QXJyb3dGaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dTRSwgdGhpcy5jb2xvcnMucmVzaXplQm94QXJyb3dGaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICB9XG5cbiAgICAvKiBDcm9wIEFyZWEgKi9cblxuICAgIGRyYXdDcm9wQXJlYShpbWFnZSwgY2VudGVyQ29vcmRzLCBzaXplLCBmbkRyYXdDbGlwUGF0aCkge1xuICAgICAgICB2YXIgeFJhdGlvID0gaW1hZ2Uud2lkdGggLyB0aGlzLmN0eC5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICB5UmF0aW8gPSBpbWFnZS5oZWlnaHQgLyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0LFxuICAgICAgICAgICAgeExlZnQgPSBjZW50ZXJDb29yZHNbMF0gLSBzaXplIC8gMixcbiAgICAgICAgICAgIHlUb3AgPSBjZW50ZXJDb29yZHNbMV0gLSBzaXplIC8gMjtcblxuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvcnMuYXJlYU91dGxpbmU7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBmbkRyYXdDbGlwUGF0aCh0aGlzLmN0eCwgY2VudGVyQ29vcmRzLCBzaXplKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIHRoaXMuY3R4LmNsaXAoKTtcblxuICAgICAgICAvLyBkcmF3IHBhcnQgb2Ygb3JpZ2luYWwgaW1hZ2VcbiAgICAgICAgaWYgKHNpemUgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHhMZWZ0ICogeFJhdGlvLCB5VG9wICogeVJhdGlvLCBzaXplICogeFJhdGlvLCBzaXplICogeVJhdGlvLCB4TGVmdCwgeVRvcCwgc2l6ZSwgc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgZm5EcmF3Q2xpcFBhdGgodGhpcy5jdHgsIGNlbnRlckNvb3Jkcywgc2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5jbGlwKCk7XG5cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH07XG59Il19