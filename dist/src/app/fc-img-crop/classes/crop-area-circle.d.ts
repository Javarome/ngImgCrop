import { CropArea } from "./crop-area";
export declare class CropAreaCircle extends CropArea {
    _boxResizeBaseSize: number;
    _boxResizeNormalRatio: number;
    _boxResizeHoverRatio: number;
    _iconMoveNormalRatio: number;
    _iconMoveHoverRatio: number;
    _posDragStartX: number;
    _posDragStartY: number;
    _posResizeStartX: number;
    _posResizeStartY: number;
    _posResizeStartSize: number;
    _boxResizeIsHover: boolean;
    _areaIsHover: boolean;
    _boxResizeIsDragging: boolean;
    _areaIsDragging: boolean;
    private _boxResizeNormalSize;
    private _boxResizeHoverSize;
    constructor(ctx: any, events: any);
    _calcCirclePerimeterCoords(angleDegrees: any): number[];
    _calcResizeIconCenterCoords(): number[];
    _isCoordWithinArea(coord: any): boolean;
    _isCoordWithinBoxResize(coord: any): boolean;
    _drawArea(ctx: any, centerCoords: any, size: any): void;
    draw(): void;
    processMouseMove(mouseCurX: any, mouseCurY: any): boolean;
    processMouseDown(mouseDownX: number, mouseDownY: number): void;
    processMouseUp(): void;
}
