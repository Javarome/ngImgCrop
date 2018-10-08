import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {CropPubSub} from "./classes/crop-pubsub";

@Component({
    selector: 'fc-img-crop',
    template: '<canvas></canvas>',
    styleUrls: ['./fc-img-crop.component.scss']
})
export class FcImgCropComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

    @Input() image;
    @Input() resultImage;

    @Input() changeOnFly;
    @Input() areaType: string;
    @Input() areaMinSize;
    @Input() areaDetails;
    @Input() resultImageSize;
    @Input() resultImageFormat: string;
    @Input() resultImageQuality;

    @Output() onChange = new EventEmitter();
    @Output() onLoadBegin = new EventEmitter();
    @Output() onLoadDone = new EventEmitter();
    @Output() onLoadError = new EventEmitter();
    @Output() onImageReady = new EventEmitter();

    private events = new CropPubSub();
    private cropHost: any;
    private observer: MutationObserver;

    constructor(private CropHost, private el: ElementRef) {
    }

    ngOnInit() {
        const events = this.events;

        // Init Crop Host
        let el = this.el.nativeElement.querySelector('canvas');
        this.cropHost = new this.CropHost(el, {}, events);

        // Wrapper to safely exec functions within $apply on a running $digest cycle
        var fnSafeApply = function (fn) {
            return function () {
                fn(this);
                this.ref.detectChanges()
            };
        };

        // Setup CropHost Event Handlers
        events
            .on('load-start', fnSafeApply(() => {
                this.onLoadBegin.emit({});
            }))
            .on('load-done', fnSafeApply(() => {
                this.onLoadDone.emit({});
            }))
            .on('image-ready', fnSafeApply(() => {
                if (this.onImageReady.emit({})) {
                    this.cropHost.redraw();
                }
            }))
            .on('load-error', fnSafeApply(() => {
                this.onLoadError.emit({});
            }))
            .on('area-move area-resize', fnSafeApply(() => {
                if (!!this.changeOnFly) {
                    this.updateResultImage();
                }
            }))
            .on('area-move-end area-resize-end image-updated', fnSafeApply(function (this) {
                this.updateResultImage();
                this.areaDetails = this.cropHost.getAreaDetails();
            }));

    }

    updateResultImage() {
        // Store Result Image to check if it's changed
        var storedResultImage;

        var resultImage = this.cropHost.getResultImageDataURI();
        if (storedResultImage !== resultImage) {
            storedResultImage = resultImage;
            if (this.resultImage) {
                this.resultImage = resultImage;
            }
            if (this.onChange.observers.length > 0) {
                this.onChange.emit({$dataURI: this.resultImage});
            }
        }
    }

    // Destroy CropHost Instance when the directive is destroying
    ngOnDestroy(): void {
        this.cropHost.destroy();
    }

    // Sync CropHost with Directive's options
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.image) {
            this.cropHost.setNewImageSource(this.image);
        }
        if (changes.areaType) {
            this.cropHost.setAreaType(this.areaType);
            this.updateResultImage();
        }
        if (changes.areaMinSize) {
            this.cropHost.setAreaMinSize(this.areaMinSize);
            this.updateResultImage();
        }
        if (changes.resultImageSize) {
            this.cropHost.setResultImageSize(this.resultImageSize);
            this.updateResultImage();
        }
        if (changes.resultImageFormat) {
            this.cropHost.setResultImageFormat(this.resultImageFormat);
            this.updateResultImage();
        }
        if (changes.resultImageQuality) {
            this.cropHost.setResultImageQuality(this.resultImageQuality);
            this.updateResultImage();
        }
    }

    ngAfterViewInit(): void {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach((mutation: MutationRecord) => {
                if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                    this.cropHost.setMaxDimensions(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
                    this.updateResultImage();
                }
            });
        });
        var config = {attributes: true, childList: true, characterData: true};

        this.observer.observe(this.el.nativeElement, config);
    }
}