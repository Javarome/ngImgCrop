import {
  AfterViewInit, ChangeDetectorRef,
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
import {CropHost} from "./classes/crop-host";
import {AreaType} from "./classes/crop-area";

@Component({
  selector: 'fc-img-crop',
  template: '<canvas></canvas>',
  styleUrls: ['./fc-img-crop.component.scss']
})
export class FcImgCropComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() image;
  @Input() resultImage;

  @Input() changeOnFly;
  @Input() areaType: AreaType;
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
  private cropHost: CropHost;
  private observer: MutationObserver;

  constructor(private el: ElementRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    const events = this.events;

    // Init Crop Host
    let el = this.el.nativeElement.querySelector('canvas');
    this.cropHost = new CropHost(el, {}, events);

    // Wrapper to safely exec functions within $apply on a running $digest cycle
    var fnSafeApply = (fn) => {
      return () => {
        fn(this);
      };
    };

    // Setup CropHost Event Handlers
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
        self.ref.detectChanges();
      });

  }

  // Store Result Image to check if it's changed
  storedResultImage;

  updateResultImage() {
    var resultImage = this.cropHost.getResultImageDataURI();
    if (this.storedResultImage !== resultImage) {
      this.storedResultImage = resultImage;
      if (this.resultImage) {
        this.resultImage = resultImage;
      }
      if (this.onChange.observers.length > 0) {
        this.onChange.emit({$dataURI: this.resultImage});
      }
    }
  }

  ngOnDestroy(): void {
    this.cropHost.destroy();
  }

  /**
   * Sync CropHost with Directive's options
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.cropHost) {
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