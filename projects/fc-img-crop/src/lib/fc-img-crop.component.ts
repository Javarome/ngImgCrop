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
import {CropAreaType} from "./classes/crop-area";

export interface CropAreaDetails {
  x: number;
  y: number;
  size: number;
  image: { width: number, height: number };
  canvas: { width: number, height: number };
}

@Component({
  selector: 'fc-img-crop',
  template: '<canvas></canvas>',
  styleUrls: ['fc-img-crop.component.scss']
})
export class FcImgCropComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() image;

  @Input() resultImage;
  @Output() resultImageChange = new EventEmitter();

  @Input() changeOnFly : boolean;
  @Input() areaType: CropAreaType;
  @Input() areaMinSize;

  @Input() areaDetails: CropAreaDetails;
  @Output() areaDetailsChange = new EventEmitter<CropAreaDetails>();

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
  private elementObserver: MutationObserver;
  private containerObserver: MutationObserver;

  constructor(private el: ElementRef, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    const events = this.events;

    // Init Crop Host
    let el = this.el.nativeElement.querySelector('canvas');
    this.cropHost = new CropHost(el, {}, events);

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
        if (Boolean(self.changeOnFly)) {
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

  // Store Result Image to check if it's changed
  storedResultImage;

  updateResultImage() {
    const resultImage = this.cropHost.getResultImageDataURI();
    if (this.storedResultImage !== resultImage) {
      this.storedResultImage = resultImage;
      this.resultImage = resultImage;
      if (this.resultImageChange.observers.length) {
        this.resultImageChange.emit(this.resultImage);
      }
      if (this.onChange.observers.length > 0) {
        this.onChange.emit({$dataURI: this.resultImage});
      }
    }
  }

  ngOnDestroy(): void {
    this.cropHost.destroy();
    this.elementObserver.disconnect();
    this.containerObserver.disconnect();
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
    const element = this.el.nativeElement;
    const observerConfig = {attributes: true, childList: true, characterData: true};
    this.elementObserver = new MutationObserver(mutations => {
      mutations.forEach((mutation: MutationRecord) => {
        if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
          this.sizeChanged();
        }
      });
    });
    this.elementObserver.observe(element, observerConfig);

    // We need to observe container size if element is set as 100% for instance
    this.containerObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (element.clientWidth != this.cropHost.maxCanvasDims[0] || element.clientHeight != this.cropHost.maxCanvasDims[1]) {
          this.sizeChanged();
        }
      });
    });
    this.containerObserver.observe(element.parentElement, observerConfig);
  }

  private sizeChanged() {
    const element = this.el.nativeElement;
    this.cropHost.setMaxDimensions(element.clientWidth, element.clientHeight);
    this.updateResultImage();
  }
}