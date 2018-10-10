export declare class CropCanvas {
    private ctx;
    shapeArrowNW: number[][];
    shapeArrowNE: number[][];
    shapeArrowSW: number[][];
    shapeArrowSE: number[][];
    shapeArrowN: number[][];
    shapeArrowW: number[][];
    shapeArrowS: number[][];
    shapeArrowE: number[][];
    colors: {
        areaOutline: string;
        resizeBoxStroke: string;
        resizeBoxFill: string;
        resizeBoxArrowFill: string;
        resizeCircleStroke: string;
        resizeCircleFill: string;
        moveIconFill: string;
    };
    constructor(ctx: any);
    calcPoint(point: any, offset: any, scale: any): any[];
    private drawFilledPolygon;
    drawIconMove(centerCoords: any, scale: any): void;
    drawIconResizeCircle(centerCoords: any, circleRadius: any, scale: any): void;
    drawIconResizeBoxBase(centerCoords: any, boxSize: any, scale: any): void;
    drawIconResizeBoxNESW(centerCoords: any, boxSize: any, scale: any): void;
    drawIconResizeBoxNWSE(centerCoords: any, boxSize: any, scale: any): void;
    drawCropArea(image: any, centerCoords: any, size: any, fnDrawClipPath: any): void;
}
