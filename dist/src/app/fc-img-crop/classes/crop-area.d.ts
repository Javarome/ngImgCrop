import { CropCanvas } from "./crop-canvas";
export declare enum CropAreaType {
    Square = "square",
    Circle = "circle"
}
export declare abstract class CropArea {
    protected _ctx: any;
    protected _events: any;
    protected _minSize: number;
    protected _cropCanvas: CropCanvas;
    protected _image: HTMLImageElement;
    protected _x: number;
    protected _y: number;
    protected _size: number;
    constructor(_ctx: any, _events: any);
    getImage(): HTMLImageElement;
    setImage(image: any): void;
    getX(): number;
    setX(x: any): void;
    getY(): number;
    setY(y: any): void;
    getSize(): number;
    setSize(size: any): void;
    getMinSize(): number;
    setMinSize(size: any): void;
    _dontDragOutside(): void;
    abstract _drawArea(ctx: any, centerCoords: any, size: any): any;
    draw(): void;
    abstract processMouseMove(mouseCurX: number, mouseCurY: number): any;
    abstract processMouseDown(mouseDownX: number, mouseDownY: number): any;
    abstract processMouseUp(mouseDownX: number, mouseDownY: number): any;
}
