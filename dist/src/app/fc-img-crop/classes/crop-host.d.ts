import { CropAreaType, CropArea } from "./crop-area";
import { CropAreaDetails } from "../fc-img-crop.component";
export declare class CropHost {
    private elCanvas;
    private opts;
    private events;
    ctx: any;
    image: any;
    cropArea: CropArea;
    minCanvasDims: number[];
    maxCanvasDims: number[];
    resultImageSize: number;
    resultImageFormat: string;
    resultImageQuality: any;
    private element;
    constructor(elCanvas: any, opts: any, events: any);
    destroy(): void;
    drawScene(): void;
    resetCropHost(cw?: any, ch?: any): any[];
    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     */
    static getChangedTouches(event: any): any;
    onMouseMove(e: any): void;
    onMouseDown(e: any): void;
    onMouseUp(e: any): void;
    getResultImageDataURI(): string;
    redraw(): void;
    setNewImageSource(imageSource: any): void;
    setMaxDimensions(width: any, height: any): any[];
    setAreaMinSize(size: any): void;
    setResultImageSize(size: any): void;
    setResultImageFormat(format: any): void;
    setResultImageQuality(quality: any): void;
    setAreaType(type: CropAreaType): void;
    getAreaDetails(): CropAreaDetails;
    static getElementOffset(elem: any): {
        top: number;
        left: number;
    };
}
