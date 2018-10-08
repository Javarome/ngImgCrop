export class CropCanvas {
    // Shape = Array of [x,y]; [0, 0] - center
    shapeArrowNW = [[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
    shapeArrowNE = [[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
    shapeArrowSW = [[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
    shapeArrowSE = [[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
    shapeArrowN = [[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
    shapeArrowW = [[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
    shapeArrowS = [[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
    shapeArrowE = [[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];

    // Colors
    colors = {
        areaOutline: '#fff',
        resizeBoxStroke: '#fff',
        resizeBoxFill: '#444',
        resizeBoxArrowFill: '#fff',
        resizeCircleStroke: '#fff',
        resizeCircleFill: '#444',
        moveIconFill: '#fff'
    };

    constructor(private ctx) {}

    // Calculate Point
    calcPoint(point, offset, scale) {
        return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
    };

    // Draw Filled Polygon
    private drawFilledPolygon(shape, fillStyle, centerCoords, scale) {
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        var pc, pc0 = this.calcPoint(shape[0], centerCoords, scale);
        this.ctx.moveTo(pc0[0], pc0[1]);

        for (var p in shape) {
            let pNum = parseInt(p, 10);
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

    /* Icons */

    drawIconMove(centerCoords, scale) {
        this.drawFilledPolygon(this.shapeArrowN, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowW, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowS, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowE, this.colors.moveIconFill, centerCoords, scale);
    }

    drawIconResizeCircle(centerCoords, circleRadius, scale) {
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
    }

    drawIconResizeBoxBase (centerCoords, boxSize, scale) {
        var scaledBoxSize = boxSize * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeBoxStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeBoxFill;
        this.ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.restore();
    }
    drawIconResizeBoxNESW(centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNE, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSW, this.colors.resizeBoxArrowFill, centerCoords, scale);
    }
    drawIconResizeBoxNWSE(centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNW, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSE, this.colors.resizeBoxArrowFill, centerCoords, scale);
    }

    /* Crop Area */

    drawCropArea(image, centerCoords, size, fnDrawClipPath) {
        var xRatio = image.width / this.ctx.canvas.width,
            yRatio = image.height / this.ctx.canvas.height,
            xLeft = centerCoords[0] - size / 2,
            yTop = centerCoords[1] - size / 2;

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
}