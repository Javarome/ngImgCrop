import {CropEXIF} from "./crop-exif";
import {CropAreaCircle} from "./crop-area-circle";
import {CropAreaSquare} from "./crop-area-square";
import {FcImgCropAreaType, CropArea} from "./crop-area";
import {FcImgCropAreaDetails} from "../fc-img-crop.component";
import {CropPubSub, FcImgCropEvent} from "./crop-pubsub";

export class CropHost {

  ctx = null;
  image = null;

  cropArea: CropArea;

  // Dimensions
  minCanvasDims = [100, 100];
  maxCanvasDims = [300, 300];

  resultImageSize = 200;
  resultImageFormat = 'image/png';

  resultImageQuality;

  private element: any;

  constructor(private elCanvas: HTMLCanvasElement, private opts, private events: CropPubSub) {
    this.element = elCanvas.parentElement;

    this.ctx = elCanvas.getContext('2d');

    this.cropArea = new CropAreaCircle(this.ctx, events);

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    elCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    document.addEventListener('touchmove', this.onMouseMove.bind(this));
    elCanvas.addEventListener('touchstart', this.onMouseDown.bind(this));
    document.addEventListener('touchend', this.onMouseUp.bind(this));
  }

  destroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseMove);

    document.removeEventListener('touchmove', this.onMouseMove);
    this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
    document.removeEventListener('touchend', this.onMouseMove);

    this.elCanvas.remove();
  }

  drawScene() {
    // clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.image !== null) {
      // draw source this.image
      this.ctx.drawImage(this.image, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.save();

      // and make it darker
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      this.ctx.restore();

      this.cropArea.draw();
    }
  }

  resetCropHost(cw?, ch?) {
    if (this.image !== null) {
      this.cropArea.setImage(this.image);
      var imageWidth = this.image.width || cw;
      var imageHeight = this.image.height || ch;
      var imageDims = [imageWidth, imageHeight];

      // Compute canvas dimensions to fit full display into host
      var imageRatio = imageWidth / imageHeight;
      var canvasDims = imageDims;
      if (canvasDims[0] > this.maxCanvasDims[0]) {
        canvasDims[0] = this.maxCanvasDims[0];
        canvasDims[1] = canvasDims[0] / imageRatio;
      } else if (canvasDims[0] < this.minCanvasDims[0]) {
        canvasDims[0] = this.minCanvasDims[0];
        canvasDims[1] = canvasDims[0] / imageRatio;
      }
      if (canvasDims[1] > this.maxCanvasDims[1]) {
        canvasDims[1] = this.maxCanvasDims[1];
        canvasDims[0] = canvasDims[1] * imageRatio;
      } else if (canvasDims[1] < this.minCanvasDims[1]) {
        canvasDims[1] = this.minCanvasDims[1];
        canvasDims[0] = canvasDims[1] * imageRatio;
      }
      var w = Math.floor(canvasDims[0]);
      var h = Math.floor(canvasDims[1]);
      canvasDims[0] = w;
      canvasDims[1] = h;
      console.debug('canvas reset =' + w + 'x' + h);
      this.elCanvas.width = w;
      this.elCanvas.height = h;

      // Compensate CSS 50% centering of canvas inside host
      this.elCanvas.style.marginLeft = -w / 2 + 'px';
      this.elCanvas.style.marginTop = -h / 2 + 'px';

      // Center crop area by default
      this.cropArea.setX(this.ctx.canvas.width / 2);
      this.cropArea.setY(this.ctx.canvas.height / 2);

      this.cropArea.setSize(Math.min(200, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2));
    } else {
      this.elCanvas.width = 0;
      this.elCanvas.height = 0;
      this.elCanvas.style.marginLeft = '0';
      this.elCanvas.style.marginTop = '0';
    }

    this.drawScene();

    return canvasDims;
  }

  /**
   * Returns event.changedTouches directly if event is a TouchEvent.
   * If event is a jQuery event, return changedTouches of event.originalEvent
   */
  static getChangedTouches(event) {
    return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
  }

  onMouseMove(e) {
    if (this.image !== null) {
      var offset = CropHost.getElementOffset(this.ctx.canvas),
        pageX, pageY;
      if (e.type === 'touchmove') {
        pageX = CropHost.getChangedTouches(e)[0].pageX;
        pageY = CropHost.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.cropArea.processMouseMove(pageX - offset.left, pageY - offset.top);
      this.drawScene();
    }
  }

  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.image !== null) {
      var offset = CropHost.getElementOffset(this.ctx.canvas),
        pageX, pageY;
      if (e.type === 'touchstart') {
        pageX = CropHost.getChangedTouches(e)[0].pageX;
        pageY = CropHost.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.cropArea.processMouseDown(pageX - offset.left, pageY - offset.top);
      this.drawScene();
    }
  }

  onMouseUp(e) {
    if (this.image !== null) {
      var offset = CropHost.getElementOffset(this.ctx.canvas),
        pageX, pageY;
      if (e.type === 'touchend') {
        pageX = CropHost.getChangedTouches(e)[0].pageX;
        pageY = CropHost.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.cropArea.processMouseUp(pageX - offset.left, pageY - offset.top);
      this.drawScene();
    }
  }

  getResultImageDataURI() {
    var temp_canvas = <HTMLCanvasElement>document.createElement('CANVAS');
    var temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = this.resultImageSize;
    temp_canvas.height = this.resultImageSize;
    if (this.image !== null) {
      temp_ctx.drawImage(this.image,
        (this.cropArea.getX() - this.cropArea.getSize() / 2) * (this.image.width / this.ctx.canvas.width),
        (this.cropArea.getY() - this.cropArea.getSize() / 2) * (this.image.height / this.ctx.canvas.height),
        this.cropArea.getSize() * (this.image.width / this.ctx.canvas.width),
        this.cropArea.getSize() * (this.image.height / this.ctx.canvas.height),
        0, 0, this.resultImageSize, this.resultImageSize);
    }
    if (this.resultImageQuality !== null) {
      return temp_canvas.toDataURL(this.resultImageFormat, this.resultImageQuality);
    }
    return temp_canvas.toDataURL(this.resultImageFormat);
  }

  redraw() {
    this.drawScene();
  }

  setNewImageSource(imageSource) {
    this.image = null;
    this.resetCropHost();
    this.events.trigger(FcImgCropEvent.ImageUpdated);
    if (!!imageSource) {
      var newImage = new Image();
      if (imageSource.substring(0, 4).toLowerCase() === 'http') {
        newImage.crossOrigin = 'anonymous';
      }
      const self = this;
      newImage.onload = function () {
        self.events.trigger(FcImgCropEvent.LoadDone);

        CropEXIF.getData(newImage, () => {
          var orientation = CropEXIF.getTag(newImage, 'Orientation');
          let cw = newImage.width, ch = newImage.height, cx = 0, cy = 0, deg = 0;

          function imageDone() {
            console.debug(`dims=${cw}x${ch}`);
            var canvasDims = self.resetCropHost(cw, ch);
            let width = canvasDims[0];
            let height = canvasDims[1];
            self.setMaxDimensions(width, height);
            self.events.trigger(FcImgCropEvent.ImageUpdated);
            self.events.trigger(FcImgCropEvent.ImageReady);
          }

          if ([3, 6, 8].indexOf(orientation) >= 0) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            switch (orientation) {
              case 3:
                cx = -newImage.width;
                cy = -newImage.height;
                deg = 180;
                break;
              case 6:
                cw = newImage.height;
                ch = newImage.width;
                cy = -newImage.height;
                deg = 90;
                break;
              case 8:
                cw = newImage.height;
                ch = newImage.width;
                cx = -newImage.width;
                deg = 270;
                break;
            }
            canvas.width = cw;
            canvas.height = ch;
            self.ctx.rotate(deg * Math.PI / 180);
            self.ctx.drawImage(newImage, cx, cy);

            self.image = new Image();
            self.image.onload = function () {
              imageDone();
            };
            self.image.src = canvas.toDataURL("image/png");
          } else {
            self.image = newImage;
            imageDone();
          }
        });
      };
      newImage.onerror = error => {
        this.events.trigger(FcImgCropEvent.LoadError, [error]);
      };
      this.events.trigger(FcImgCropEvent.LoadStart);
      newImage.src = imageSource;
    }
  }

  setMaxDimensions(width: number, height: number) {
    console.debug(`setMaxDimensions(${width}, ${height})`);
    if (this.image !== null) {
      const curWidth = this.ctx.canvas.width,
        curHeight = this.ctx.canvas.height;

      const ratioNewCurWidth = this.ctx.canvas.width / curWidth,
        ratioNewCurHeight = this.ctx.canvas.height / curHeight,
        ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);
    }
    this.maxCanvasDims = [width, height];
    return this.resetCropHost(width, height);
  }

  setAreaMinSize(s) {
    const size = parseInt(s, 10);
    if (!isNaN(size)) {
      this.cropArea.setMinSize(size);
      this.drawScene();
    }
  }

  setResultImageSize(size) {
    size = parseInt(size, 10);
    if (!isNaN(size)) {
      this.resultImageSize = size;
    }
  }

  setResultImageFormat(format) {
    this.resultImageFormat = format;
  }

  setResultImageQuality(quality) {
    quality = parseFloat(quality);
    if (!isNaN(quality) && quality >= 0 && quality <= 1) {
      this.resultImageQuality = quality;
    }
  }

  setAreaType(type: FcImgCropAreaType) {
    const curSize = this.cropArea.getSize(),
      curMinSize = this.cropArea.getMinSize(),
      curX = this.cropArea.getX(),
      curY = this.cropArea.getY();

    if (type === FcImgCropAreaType.Square) {
      this.cropArea = new CropAreaSquare(this.ctx, this.events);
    } else {
      this.cropArea = new CropAreaCircle(this.ctx, this.events);
    }
    this.cropArea.setMinSize(curMinSize);
    this.cropArea.setSize(curSize);
    this.cropArea.setX(curX);
    this.cropArea.setY(curY);

    // this.resetCropHost();
    if (this.image !== null) {
      this.cropArea.setImage(this.image);
    }
    this.drawScene();
  }

  getAreaDetails() : FcImgCropAreaDetails {
    return {
      x: this.cropArea.getX(),
      y: this.cropArea.getY(),
      size: this.cropArea.getSize(),
      image: {width: this.cropArea.getImage().width, height: this.cropArea.getImage().height},
      canvas: {width: this.ctx.canvas.width, height: this.ctx.canvas.height}
    };
  }

  static getElementOffset(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {top: Math.round(top), left: Math.round(left)};
  }
}