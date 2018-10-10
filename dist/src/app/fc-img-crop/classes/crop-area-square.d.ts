import { CropArea } from "./crop-area";
export declare class CropAreaSquare extends CropArea {
    _resizeCtrlBaseRadius: number;
    _resizeCtrlNormalRatio: number;
    _resizeCtrlHoverRatio: number;
    _iconMoveNormalRatio: number;
    _iconMoveHoverRatio: number;
    _posDragStartX: number;
    _posDragStartY: number;
    _posResizeStartX: number;
    _posResizeStartY: number;
    _posResizeStartSize: number;
    _resizeCtrlIsHover: number;
    _areaIsHover: boolean;
    _resizeCtrlIsDragging: number;
    _areaIsDragging: boolean;
    private _resizeCtrlNormalRadius;
    private _resizeCtrlHoverRadius;
    constructor(ctx: any, events: any);
    _calcSquareCorners(): number[][];
    _calcSquareDimensions(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    _isCoordWithinArea(coord: any): boolean;
    _isCoordWithinResizeCtrl(coord: any): number;
    _drawArea(ctx: any, centerCoords: any, size: any): void;
    draw(): void;
    processMouseMove(mouseCurX: any, mouseCurY: any): boolean;
    processMouseDown(mouseDownX: any, mouseDownY: any): void;
    processMouseUp(): void;
}
