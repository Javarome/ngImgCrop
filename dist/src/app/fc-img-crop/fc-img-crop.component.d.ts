import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CropAreaType } from "./classes/crop-area";
export interface CropAreaDetails {
    x: number;
    y: number;
    size: number;
    image: {
        width: number;
        height: number;
    };
    canvas: {
        width: number;
        height: number;
    };
}
export declare class FcImgCropComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    private el;
    private ref;
    image: any;
    resultImage: any;
    resultImageChange: EventEmitter<{}>;
    changeOnFly: any;
    areaType: CropAreaType;
    areaMinSize: any;
    areaDetails: CropAreaDetails;
    areaDetailsChange: EventEmitter<CropAreaDetails>;
    resultImageSize: any;
    resultImageFormat: string;
    resultImageQuality: any;
    onChange: EventEmitter<{}>;
    onLoadBegin: EventEmitter<{}>;
    onLoadDone: EventEmitter<{}>;
    onLoadError: EventEmitter<{}>;
    onImageReady: EventEmitter<{}>;
    private events;
    private cropHost;
    private observer;
    constructor(el: ElementRef, ref: ChangeDetectorRef);
    ngOnInit(): void;
    storedResultImage: any;
    updateResultImage(): void;
    ngOnDestroy(): void;
    /**
     * Sync CropHost with Directive's options
     */
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
}
