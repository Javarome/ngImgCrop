/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CropPubSub } from "./classes/crop-pubsub";
import { CropHost } from "./classes/crop-host";
import { CropAreaType } from "./classes/crop-area";
/**
 * @record
 */
export function CropAreaDetails() { }
/** @type {?} */
CropAreaDetails.prototype.x;
/** @type {?} */
CropAreaDetails.prototype.y;
/** @type {?} */
CropAreaDetails.prototype.size;
/** @type {?} */
CropAreaDetails.prototype.image;
/** @type {?} */
CropAreaDetails.prototype.canvas;
export class FcImgCropComponent {
    /**
     * @param {?} el
     * @param {?} ref
     */
    constructor(el, ref) {
        this.el = el;
        this.ref = ref;
        this.resultImageChange = new EventEmitter();
        this.areaDetailsChange = new EventEmitter();
        this.onChange = new EventEmitter();
        this.onLoadBegin = new EventEmitter();
        this.onLoadDone = new EventEmitter();
        this.onLoadError = new EventEmitter();
        this.onImageReady = new EventEmitter();
        this.events = new CropPubSub();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        const events = this.events;
        /** @type {?} */
        let el = this.el.nativeElement.querySelector('canvas');
        this.cropHost = new CropHost(el, {}, events);
        /** @type {?} */
        const self = this;
        events
            .on('load-start', () => {
            self.onLoadBegin.emit({});
            self.ref.detectChanges();
        })
            .on('load-done', () => {
            self.onLoadDone.emit({});
            self.ref.detectChanges();
        })
            .on('image-ready', () => {
            if (self.onImageReady.emit({})) {
                self.cropHost.redraw();
                self.ref.detectChanges();
            }
        })
            .on('load-error', () => {
            self.onLoadError.emit({});
            self.ref.detectChanges();
        })
            .on('area-move area-resize', () => {
            if (!!self.changeOnFly) {
                self.updateResultImage();
                self.ref.detectChanges();
            }
        })
            .on('area-move-end area-resize-end image-updated', () => {
            self.updateResultImage();
            self.areaDetails = self.cropHost.getAreaDetails();
            self.areaDetailsChange.emit(self.areaDetails);
        });
    }
    /**
     * @return {?}
     */
    updateResultImage() {
        /** @type {?} */
        const resultImage = this.cropHost.getResultImageDataURI();
        if (this.storedResultImage !== resultImage) {
            this.storedResultImage = resultImage;
            this.resultImage = resultImage;
            if (this.resultImageChange.observers.length) {
                this.resultImageChange.emit(this.resultImage);
            }
            if (this.onChange.observers.length > 0) {
                this.onChange.emit({ $dataURI: this.resultImage });
            }
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.cropHost.destroy();
    }
    /**
     * Sync CropHost with Directive's options
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this.cropHost) {
            if (changes["image"]) {
                this.cropHost.setNewImageSource(this.image);
            }
            if (changes["areaType"]) {
                this.cropHost.setAreaType(this.areaType);
                this.updateResultImage();
            }
            if (changes["areaMinSize"]) {
                this.cropHost.setAreaMinSize(this.areaMinSize);
                this.updateResultImage();
            }
            if (changes["resultImageSize"]) {
                this.cropHost.setResultImageSize(this.resultImageSize);
                this.updateResultImage();
            }
            if (changes["resultImageFormat"]) {
                this.cropHost.setResultImageFormat(this.resultImageFormat);
                this.updateResultImage();
            }
            if (changes["resultImageQuality"]) {
                this.cropHost.setResultImageQuality(this.resultImageQuality);
                this.updateResultImage();
            }
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                    this.cropHost.setMaxDimensions(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
                    this.updateResultImage();
                }
            });
        });
        /** @type {?} */
        const config = { attributes: true, childList: true, characterData: true };
        this.observer.observe(this.el.nativeElement, config);
    }
}
FcImgCropComponent.decorators = [
    { type: Component, args: [{
                selector: 'fc-img-crop',
                template: '<canvas></canvas>',
                styles: [":host{width:100%;height:100%;display:block;position:relative;overflow:hidden}:host canvas{display:block;position:absolute;top:50%;left:50%;-webkit-tap-highlight-color:rgba(255,255,255,0)}"]
            }] }
];
/** @nocollapse */
FcImgCropComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
FcImgCropComponent.propDecorators = {
    image: [{ type: Input }],
    resultImage: [{ type: Input }],
    resultImageChange: [{ type: Output }],
    changeOnFly: [{ type: Input }],
    areaType: [{ type: Input }],
    areaMinSize: [{ type: Input }],
    areaDetails: [{ type: Input }],
    areaDetailsChange: [{ type: Output }],
    resultImageSize: [{ type: Input }],
    resultImageFormat: [{ type: Input }],
    resultImageQuality: [{ type: Input }],
    onChange: [{ type: Output }],
    onLoadBegin: [{ type: Output }],
    onLoadDone: [{ type: Output }],
    onLoadError: [{ type: Output }],
    onImageReady: [{ type: Output }]
};
if (false) {
    /** @type {?} */
    FcImgCropComponent.prototype.image;
    /** @type {?} */
    FcImgCropComponent.prototype.resultImage;
    /** @type {?} */
    FcImgCropComponent.prototype.resultImageChange;
    /** @type {?} */
    FcImgCropComponent.prototype.changeOnFly;
    /** @type {?} */
    FcImgCropComponent.prototype.areaType;
    /** @type {?} */
    FcImgCropComponent.prototype.areaMinSize;
    /** @type {?} */
    FcImgCropComponent.prototype.areaDetails;
    /** @type {?} */
    FcImgCropComponent.prototype.areaDetailsChange;
    /** @type {?} */
    FcImgCropComponent.prototype.resultImageSize;
    /** @type {?} */
    FcImgCropComponent.prototype.resultImageFormat;
    /** @type {?} */
    FcImgCropComponent.prototype.resultImageQuality;
    /** @type {?} */
    FcImgCropComponent.prototype.onChange;
    /** @type {?} */
    FcImgCropComponent.prototype.onLoadBegin;
    /** @type {?} */
    FcImgCropComponent.prototype.onLoadDone;
    /** @type {?} */
    FcImgCropComponent.prototype.onLoadError;
    /** @type {?} */
    FcImgCropComponent.prototype.onImageReady;
    /** @type {?} */
    FcImgCropComponent.prototype.events;
    /** @type {?} */
    FcImgCropComponent.prototype.cropHost;
    /** @type {?} */
    FcImgCropComponent.prototype.observer;
    /** @type {?} */
    FcImgCropComponent.prototype.storedResultImage;
    /** @type {?} */
    FcImgCropComponent.prototype.el;
    /** @type {?} */
    FcImgCropComponent.prototype.ref;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmMtaW1nLWNyb3AuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2ZjLWltZy1jcm9wLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNVLGlCQUFpQixFQUNoQyxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBSUwsTUFBTSxFQUVQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFlakQsTUFBTTs7Ozs7SUE0QkosWUFBb0IsRUFBYyxFQUFVLEdBQXNCO1FBQTlDLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFtQjtpQ0F2QnBDLElBQUksWUFBWSxFQUFFO2lDQU9sQixJQUFJLFlBQVksRUFBbUI7d0JBTTVDLElBQUksWUFBWSxFQUFFOzJCQUNmLElBQUksWUFBWSxFQUFFOzBCQUNuQixJQUFJLFlBQVksRUFBRTsyQkFDakIsSUFBSSxZQUFZLEVBQUU7NEJBQ2pCLElBQUksWUFBWSxFQUFFO3NCQUUxQixJQUFJLFVBQVUsRUFBRTtLQUtoQzs7OztJQUVELFFBQVE7O1FBQ04sTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7UUFHM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQzs7UUFHN0MsTUFBTSxJ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QUFDO1NBQ0osQ0FBQyxDQUFDOztRQUNILE1BQU0sTUFBTSxHQUFHLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN0RDs7O1lBNUlGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsUUFBUSxFQUFFLG1CQUFtQjs7YUFFOUI7Ozs7WUF6QkMsVUFBVTtZQUZLLGlCQUFpQjs7O29CQThCL0IsS0FBSzswQkFFTCxLQUFLO2dDQUNMLE1BQU07MEJBRU4sS0FBSzt1QkFDTCxLQUFLOzBCQUNMLEtBQUs7MEJBRUwsS0FBSztnQ0FDTCxNQUFNOzhCQUVOLEtBQUs7Z0NBQ0wsS0FBSztpQ0FDTCxLQUFLO3VCQUVMLE1BQU07MEJBQ04sTUFBTTt5QkFDTixNQUFNOzBCQUNOLE1BQU07MkJBQ04sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcywgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nyb3BQdWJTdWJ9IGZyb20gXCIuL2NsYXNzZXMvY3JvcC1wdWJzdWJcIjtcbmltcG9ydCB7Q3JvcEhvc3R9IGZyb20gXCIuL2NsYXNzZXMvY3JvcC1ob3N0XCI7XG5pbXBvcnQge0Nyb3BBcmVhVHlwZX0gZnJvbSBcIi4vY2xhc3Nlcy9jcm9wLWFyZWFcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDcm9wQXJlYURldGFpbHMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICBpbWFnZTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9O1xuICBjYW52YXM6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZmMtaW1nLWNyb3AnLFxuICB0ZW1wbGF0ZTogJzxjYW52YXM+PC9jYW52YXM+JyxcbiAgc3R5bGVVcmxzOiBbJ2ZjLWltZy1jcm9wLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgRmNJbWdDcm9wQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgQElucHV0KCkgaW1hZ2U7XG5cbiAgQElucHV0KCkgcmVzdWx0SW1hZ2U7XG4gIEBPdXRwdXQoKSByZXN1bHRJbWFnZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBASW5wdXQoKSBjaGFuZ2VPbkZseTtcbiAgQElucHV0KCkgYXJlYVR5cGU6IENyb3BBcmVhVHlwZTtcbiAgQElucHV0KCkgYXJlYU1pblNpemU7XG5cbiAgQElucHV0KCkgYXJlYURldGFpbHM6IENyb3BBcmVhRGV0YWlscztcbiAgQE91dHB1dCgpIGFyZWFEZXRhaWxzQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDcm9wQXJlYURldGFpbHM+KCk7XG5cbiAgQElucHV0KCkgcmVzdWx0SW1hZ2VTaXplO1xuICBASW5wdXQoKSByZXN1bHRJbWFnZUZvcm1hdDogc3RyaW5nO1xuICBASW5wdXQoKSByZXN1bHRJbWFnZVF1YWxpdHk7XG5cbiAgQE91dHB1dCgpIG9uQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Mb2FkQmVnaW4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkxvYWREb25lID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Mb2FkRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkltYWdlUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgcHJpdmF0ZSBldmVudHMgPSBuZXcgQ3JvcFB1YlN1YigpO1xuICBwcml2YXRlIGNyb3BIb3N0OiBDcm9wSG9zdDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuXG4gICAgLy8gSW5pdCBDcm9wIEhvc3RcbiAgICBsZXQgZWwgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG4gICAgdGhpcy5jcm9wSG9zdCA9IG5ldyBDcm9wSG9zdChlbCwge30sIGV2ZW50cyk7XG5cbiAgICAvLyBTZXR1cCBDcm9wSG9zdCBFdmVudCBIYW5kbGVyc1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGV2ZW50c1xuICAgICAgLm9uKCdsb2FkLXN0YXJ0JywgKCkgPT4ge1xuICAgICAgICBzZWxmLm9uTG9hZEJlZ2luLmVtaXQoe30pO1xuICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdsb2FkLWRvbmUnLCAoKSA9PiB7XG4gICAgICAgIHNlbGYub25Mb2FkRG9uZS5lbWl0KHt9KTtcbiAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfSlcbiAgICAgIC5vbignaW1hZ2UtcmVhZHknLCAoKSA9PiB7XG4gICAgICAgIGlmIChzZWxmLm9uSW1hZ2VSZWFkeS5lbWl0KHt9KSkge1xuICAgICAgICAgIHNlbGYuY3JvcEhvc3QucmVkcmF3KCk7XG4gICAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKCdsb2FkLWVycm9yJywgKCkgPT4ge1xuICAgICAgICBzZWxmLm9uTG9hZEVycm9yLmVtaXQoe30pO1xuICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdhcmVhLW1vdmUgYXJlYS1yZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIGlmICghIXNlbGYuY2hhbmdlT25GbHkpIHtcbiAgICAgICAgICBzZWxmLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKCdhcmVhLW1vdmUtZW5kIGFyZWEtcmVzaXplLWVuZCBpbWFnZS11cGRhdGVkJywgKCkgPT4ge1xuICAgICAgICBzZWxmLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgIHNlbGYuYXJlYURldGFpbHMgPSBzZWxmLmNyb3BIb3N0LmdldEFyZWFEZXRhaWxzKCk7XG4gICAgICAgIHNlbGYuYXJlYURldGFpbHNDaGFuZ2UuZW1pdChzZWxmLmFyZWFEZXRhaWxzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gU3RvcmUgUmVzdWx0IEltYWdlIHRvIGNoZWNrIGlmIGl0J3MgY2hhbmdlZFxuICBzdG9yZWRSZXN1bHRJbWFnZTtcblxuICB1cGRhdGVSZXN1bHRJbWFnZSgpIHtcbiAgICBjb25zdCByZXN1bHRJbWFnZSA9IHRoaXMuY3JvcEhvc3QuZ2V0UmVzdWx0SW1hZ2VEYXRhVVJJKCk7XG4gICAgaWYgKHRoaXMuc3RvcmVkUmVzdWx0SW1hZ2UgIT09IHJlc3VsdEltYWdlKSB7XG4gICAgICB0aGlzLnN0b3JlZFJlc3VsdEltYWdlID0gcmVzdWx0SW1hZ2U7XG4gICAgICB0aGlzLnJlc3VsdEltYWdlID0gcmVzdWx0SW1hZ2U7XG4gICAgICBpZiAodGhpcy5yZXN1bHRJbWFnZUNoYW5nZS5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVzdWx0SW1hZ2VDaGFuZ2UuZW1pdCh0aGlzLnJlc3VsdEltYWdlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uQ2hhbmdlLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh7JGRhdGFVUkk6IHRoaXMucmVzdWx0SW1hZ2V9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNyb3BIb3N0LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5jIENyb3BIb3N0IHdpdGggRGlyZWN0aXZlJ3Mgb3B0aW9uc1xuICAgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNyb3BIb3N0KSB7XG4gICAgICBpZiAoY2hhbmdlcy5pbWFnZSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldE5ld0ltYWdlU291cmNlKHRoaXMuaW1hZ2UpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMuYXJlYVR5cGUpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRBcmVhVHlwZSh0aGlzLmFyZWFUeXBlKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMuYXJlYU1pblNpemUpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRBcmVhTWluU2l6ZSh0aGlzLmFyZWFNaW5TaXplKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VTaXplKSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0UmVzdWx0SW1hZ2VTaXplKHRoaXMucmVzdWx0SW1hZ2VTaXplKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VGb3JtYXQpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRSZXN1bHRJbWFnZUZvcm1hdCh0aGlzLnJlc3VsdEltYWdlRm9ybWF0KTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VRdWFsaXR5KSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0UmVzdWx0SW1hZ2VRdWFsaXR5KHRoaXMucmVzdWx0SW1hZ2VRdWFsaXR5KTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgIG11dGF0aW9ucy5mb3JFYWNoKChtdXRhdGlvbjogTXV0YXRpb25SZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKG11dGF0aW9uLmF0dHJpYnV0ZU5hbWUgPT09ICdjbGllbnRXaWR0aCcgfHwgbXV0YXRpb24uYXR0cmlidXRlTmFtZSA9PT0gJ2NsaWVudEhlaWdodCcpIHtcbiAgICAgICAgICB0aGlzLmNyb3BIb3N0LnNldE1heERpbWVuc2lvbnModGhpcy5lbC5uYXRpdmVFbGVtZW50LmNsaWVudFdpZHRoLCB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnN0IGNvbmZpZyA9IHthdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWV9O1xuICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsIGNvbmZpZyk7XG4gIH1cbn0iXX0=