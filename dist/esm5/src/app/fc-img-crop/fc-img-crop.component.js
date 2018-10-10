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
var FcImgCropComponent = /** @class */ (function () {
    function FcImgCropComponent(el, ref) {
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
    FcImgCropComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var events = this.events;
        /** @type {?} */
        var el = this.el.nativeElement.querySelector('canvas');
        this.cropHost = new CropHost(el, {}, events);
        /** @type {?} */
        var self = this;
        events
            .on('load-start', function () {
            self.onLoadBegin.emit({});
            self.ref.detectChanges();
        })
            .on('load-done', function () {
            self.onLoadDone.emit({});
            self.ref.detectChanges();
        })
            .on('image-ready', function () {
            if (self.onImageReady.emit({})) {
                self.cropHost.redraw();
                self.ref.detectChanges();
            }
        })
            .on('load-error', function () {
            self.onLoadError.emit({});
            self.ref.detectChanges();
        })
            .on('area-move area-resize', function () {
            if (!!self.changeOnFly) {
                self.updateResultImage();
                self.ref.detectChanges();
            }
        })
            .on('area-move-end area-resize-end image-updated', function () {
            self.updateResultImage();
            self.areaDetails = self.cropHost.getAreaDetails();
            self.areaDetailsChange.emit(self.areaDetails);
        });
    };
    /**
     * @return {?}
     */
    FcImgCropComponent.prototype.updateResultImage = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var resultImage = this.cropHost.getResultImageDataURI();
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
    };
    /**
     * @return {?}
     */
    FcImgCropComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this.cropHost.destroy();
    };
    /**
     * Sync CropHost with Directive's options
     */
    /**
     * Sync CropHost with Directive's options
     * @param {?} changes
     * @return {?}
     */
    FcImgCropComponent.prototype.ngOnChanges = /**
     * Sync CropHost with Directive's options
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
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
    };
    /**
     * @return {?}
     */
    FcImgCropComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                    _this.cropHost.setMaxDimensions(_this.el.nativeElement.clientWidth, _this.el.nativeElement.clientHeight);
                    _this.updateResultImage();
                }
            });
        });
        /** @type {?} */
        var config = { attributes: true, childList: true, characterData: true };
        this.observer.observe(this.el.nativeElement, config);
    };
    FcImgCropComponent.decorators = [
        { type: Component, args: [{
                    selector: 'fc-img-crop',
                    template: '<canvas></canvas>',
                    styles: [":host{width:100%;height:100%;display:block;position:relative;overflow:hidden}:host canvas{display:block;position:absolute;top:50%;left:50%;-webkit-tap-highlight-color:rgba(255,255,255,0)}"]
                }] }
    ];
    /** @nocollapse */
    FcImgCropComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ChangeDetectorRef }
    ]; };
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
    return FcImgCropComponent;
}());
export { FcImgCropComponent };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmMtaW1nLWNyb3AuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2ZjLWltZy1jcm9wLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUNVLGlCQUFpQixFQUNoQyxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBSUwsTUFBTSxFQUVQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0lBMkMvQyw0QkFBb0IsRUFBYyxFQUFVLEdBQXNCO1FBQTlDLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFtQjtpQ0F2QnBDLElBQUksWUFBWSxFQUFFO2lDQU9sQixJQUFJLFlBQVksRUFBbUI7d0JBTTVDLElBQUksWUFBWSxFQUFFOzJCQUNmLElBQUksWUFBWSxFQUFFOzBCQUNuQixJQUFJLFlBQVksRUFBRTsyQkFDakIsSUFBSSxZQUFZLEVBQUU7NEJBQ2pCLElBQUksWUFBWSxFQUFFO3NCQUUxQixJQUFJLFVBQVUsRUFBRTtLQUtoQzs7OztJQUVELHFDQUFROzs7SUFBUjs7UUFDRSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztRQUczQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDOztRQUc3QyxJQUFNLElBQUks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LElBQU0sTUFBTSxHQUFHLEVBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN0RDs7Z0JBNUlGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFLG1CQUFtQjs7aUJBRTlCOzs7O2dCQXpCQyxVQUFVO2dCQUZLLGlCQUFpQjs7O3dCQThCL0IsS0FBSzs4QkFFTCxLQUFLO29DQUNMLE1BQU07OEJBRU4sS0FBSzsyQkFDTCxLQUFLOzhCQUNMLEtBQUs7OEJBRUwsS0FBSztvQ0FDTCxNQUFNO2tDQUVOLEtBQUs7b0NBQ0wsS0FBSztxQ0FDTCxLQUFLOzJCQUVMLE1BQU07OEJBQ04sTUFBTTs2QkFDTixNQUFNOzhCQUNOLE1BQU07K0JBQ04sTUFBTTs7NkJBbkRUOztTQTZCYSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LCBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDcm9wUHViU3VifSBmcm9tIFwiLi9jbGFzc2VzL2Nyb3AtcHVic3ViXCI7XG5pbXBvcnQge0Nyb3BIb3N0fSBmcm9tIFwiLi9jbGFzc2VzL2Nyb3AtaG9zdFwiO1xuaW1wb3J0IHtDcm9wQXJlYVR5cGV9IGZyb20gXCIuL2NsYXNzZXMvY3JvcC1hcmVhXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JvcEFyZWFEZXRhaWxzIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgaW1hZ2U6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfTtcbiAgY2FudmFzOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH07XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2ZjLWltZy1jcm9wJyxcbiAgdGVtcGxhdGU6ICc8Y2FudmFzPjwvY2FudmFzPicsXG4gIHN0eWxlVXJsczogWydmYy1pbWctY3JvcC5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIEZjSW1nQ3JvcENvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuXG4gIEBJbnB1dCgpIGltYWdlO1xuXG4gIEBJbnB1dCgpIHJlc3VsdEltYWdlO1xuICBAT3V0cHV0KCkgcmVzdWx0SW1hZ2VDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQElucHV0KCkgY2hhbmdlT25GbHk7XG4gIEBJbnB1dCgpIGFyZWFUeXBlOiBDcm9wQXJlYVR5cGU7XG4gIEBJbnB1dCgpIGFyZWFNaW5TaXplO1xuXG4gIEBJbnB1dCgpIGFyZWFEZXRhaWxzOiBDcm9wQXJlYURldGFpbHM7XG4gIEBPdXRwdXQoKSBhcmVhRGV0YWlsc0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q3JvcEFyZWFEZXRhaWxzPigpO1xuXG4gIEBJbnB1dCgpIHJlc3VsdEltYWdlU2l6ZTtcbiAgQElucHV0KCkgcmVzdWx0SW1hZ2VGb3JtYXQ6IHN0cmluZztcbiAgQElucHV0KCkgcmVzdWx0SW1hZ2VRdWFsaXR5O1xuXG4gIEBPdXRwdXQoKSBvbkNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uTG9hZEJlZ2luID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Mb2FkRG9uZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uTG9hZEVycm9yID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25JbWFnZVJlYWR5ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHByaXZhdGUgZXZlbnRzID0gbmV3IENyb3BQdWJTdWIoKTtcbiAgcHJpdmF0ZSBjcm9wSG9zdDogQ3JvcEhvc3Q7XG4gIHByaXZhdGUgb2JzZXJ2ZXI6IE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZiwgcHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBjb25zdCBldmVudHMgPSB0aGlzLmV2ZW50cztcblxuICAgIC8vIEluaXQgQ3JvcCBIb3N0XG4gICAgbGV0IGVsID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xuICAgIHRoaXMuY3JvcEhvc3QgPSBuZXcgQ3JvcEhvc3QoZWwsIHt9LCBldmVudHMpO1xuXG4gICAgLy8gU2V0dXAgQ3JvcEhvc3QgRXZlbnQgSGFuZGxlcnNcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBldmVudHNcbiAgICAgIC5vbignbG9hZC1zdGFydCcsICgpID0+IHtcbiAgICAgICAgc2VsZi5vbkxvYWRCZWdpbi5lbWl0KHt9KTtcbiAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfSlcbiAgICAgIC5vbignbG9hZC1kb25lJywgKCkgPT4ge1xuICAgICAgICBzZWxmLm9uTG9hZERvbmUuZW1pdCh7fSk7XG4gICAgICAgIHNlbGYucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2ltYWdlLXJlYWR5JywgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZi5vbkltYWdlUmVhZHkuZW1pdCh7fSkpIHtcbiAgICAgICAgICBzZWxmLmNyb3BIb3N0LnJlZHJhdygpO1xuICAgICAgICAgIHNlbGYucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5vbignbG9hZC1lcnJvcicsICgpID0+IHtcbiAgICAgICAgc2VsZi5vbkxvYWRFcnJvci5lbWl0KHt9KTtcbiAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfSlcbiAgICAgIC5vbignYXJlYS1tb3ZlIGFyZWEtcmVzaXplJywgKCkgPT4ge1xuICAgICAgICBpZiAoISFzZWxmLmNoYW5nZU9uRmx5KSB7XG4gICAgICAgICAgc2VsZi51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgICAgIHNlbGYucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5vbignYXJlYS1tb3ZlLWVuZCBhcmVhLXJlc2l6ZS1lbmQgaW1hZ2UtdXBkYXRlZCcsICgpID0+IHtcbiAgICAgICAgc2VsZi51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgICBzZWxmLmFyZWFEZXRhaWxzID0gc2VsZi5jcm9wSG9zdC5nZXRBcmVhRGV0YWlscygpO1xuICAgICAgICBzZWxmLmFyZWFEZXRhaWxzQ2hhbmdlLmVtaXQoc2VsZi5hcmVhRGV0YWlscyk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vIFN0b3JlIFJlc3VsdCBJbWFnZSB0byBjaGVjayBpZiBpdCdzIGNoYW5nZWRcbiAgc3RvcmVkUmVzdWx0SW1hZ2U7XG5cbiAgdXBkYXRlUmVzdWx0SW1hZ2UoKSB7XG4gICAgY29uc3QgcmVzdWx0SW1hZ2UgPSB0aGlzLmNyb3BIb3N0LmdldFJlc3VsdEltYWdlRGF0YVVSSSgpO1xuICAgIGlmICh0aGlzLnN0b3JlZFJlc3VsdEltYWdlICE9PSByZXN1bHRJbWFnZSkge1xuICAgICAgdGhpcy5zdG9yZWRSZXN1bHRJbWFnZSA9IHJlc3VsdEltYWdlO1xuICAgICAgdGhpcy5yZXN1bHRJbWFnZSA9IHJlc3VsdEltYWdlO1xuICAgICAgaWYgKHRoaXMucmVzdWx0SW1hZ2VDaGFuZ2Uub2JzZXJ2ZXJzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlc3VsdEltYWdlQ2hhbmdlLmVtaXQodGhpcy5yZXN1bHRJbWFnZSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vbkNoYW5nZS5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQoeyRkYXRhVVJJOiB0aGlzLnJlc3VsdEltYWdlfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5jcm9wSG9zdC5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogU3luYyBDcm9wSG9zdCB3aXRoIERpcmVjdGl2ZSdzIG9wdGlvbnNcbiAgICovXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5jcm9wSG9zdCkge1xuICAgICAgaWYgKGNoYW5nZXMuaW1hZ2UpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXROZXdJbWFnZVNvdXJjZSh0aGlzLmltYWdlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VzLmFyZWFUeXBlKSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0QXJlYVR5cGUodGhpcy5hcmVhVHlwZSk7XG4gICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VzLmFyZWFNaW5TaXplKSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0QXJlYU1pblNpemUodGhpcy5hcmVhTWluU2l6ZSk7XG4gICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VzLnJlc3VsdEltYWdlU2l6ZSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldFJlc3VsdEltYWdlU2l6ZSh0aGlzLnJlc3VsdEltYWdlU2l6ZSk7XG4gICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VzLnJlc3VsdEltYWdlRm9ybWF0KSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0UmVzdWx0SW1hZ2VGb3JtYXQodGhpcy5yZXN1bHRJbWFnZUZvcm1hdCk7XG4gICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaGFuZ2VzLnJlc3VsdEltYWdlUXVhbGl0eSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldFJlc3VsdEltYWdlUXVhbGl0eSh0aGlzLnJlc3VsdEltYWdlUXVhbGl0eSk7XG4gICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgICBtdXRhdGlvbnMuZm9yRWFjaCgobXV0YXRpb246IE11dGF0aW9uUmVjb3JkKSA9PiB7XG4gICAgICAgIGlmIChtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lID09PSAnY2xpZW50V2lkdGgnIHx8IG11dGF0aW9uLmF0dHJpYnV0ZU5hbWUgPT09ICdjbGllbnRIZWlnaHQnKSB7XG4gICAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRNYXhEaW1lbnNpb25zKHRoaXMuZWwubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aCwgdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBjb25zdCBjb25maWcgPSB7YXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlfTtcbiAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5lbC5uYXRpdmVFbGVtZW50LCBjb25maWcpO1xuICB9XG59Il19