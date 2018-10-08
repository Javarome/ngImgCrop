import {CropEXIF} from "./crop-exif";
import {CropAreaCircle} from "./crop-area-circle";
import {ElementRef} from "@angular/core";
import {CropAreaSquare} from "./crop-area-square";
import {CropArea} from "./crop-area";

export class CropHost {

  /* PRIVATE VARIABLES */

  // Object Pointers
  ctx = null;
  image = null;
  theArea = null;

  // Dimensions
  minCanvasDims = [100, 100];
  maxCanvasDims = [300, 300];

  // Result Image size
  resImgSize = 200;

  // Result Image type
  resImgFormat = 'image/png';

  // Result Image quality
  resImgQuality = null;
  private element: any;

  constructor(private elCanvas, private opts, private events) {
    this.element = elCanvas.parentElement;

    // Init Context var
    this.ctx = elCanvas.getContext('2d');

    // Init CropArea
    this.theArea = new CropAreaCircle(this.ctx, events);

    // Init Mouse Event Listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    elCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Init Touch Event Listeners
    document.addEventListener('touchmove', this.onMouseMove.bind(this));
    elCanvas.addEventListener('touchstart', this.onMouseDown.bind(this));
    document.addEventListener('touchend', this.onMouseUp.bind(this));

  }

  // CropHost Destructor
  destroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    this.elCanvas.off('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseMove);

    document.removeEventListener('touchmove', this.onMouseMove);
    this.elCanvas.off('touchstart', this.onMouseDown);
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

      this.theArea.draw();
    }
  }

  resetCropHost(cw?, ch?) {
    if (this.image !== null) {
      this.theArea.setImage(this.image);
      var imageWidth = this.image.width || cw;
      var imageHeight = this.image.height || ch;
      var imageDims = [imageWidth, imageHeight];
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
      console.log('canvas reset =' + w + 'x' + h);
      this.elCanvas.width = w;
      this.elCanvas.height = h;
      this.elCanvas.style.marginLeft = -w / 2 + 'px';
      this.elCanvas.style.marginTop = -h / 2 + 'px';
      this.theArea.setX(this.ctx.canvas.width / 2);
      this.theArea.setY(this.ctx.canvas.height / 2);
      this.theArea.setSize(Math.min(200, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2));
    } else {
      this.elCanvas.width = 0;
      this.elCanvas.height = 0;
      this.elCanvas.style.marginTop = 0;
    }

    this.drawScene();

    return canvasDims;
  };

  /**
   * Returns event.changedTouches directly if event is a TouchEvent.
   * If event is a jQuery event, return changedTouches of event.originalEvent
   */
  getChangedTouches(event) {
    if (event.changedTouches) {
      return event.changedTouches;
    } else {
      return event.originalEvent.changedTouches;
    }
  }

  onMouseMove(e) {
    if (this.image !== null) {
      var offset = CropHost.getElementOffset(this.ctx.canvas),
        pageX, pageY;
      if (e.type === 'touchmove') {
        pageX = this.getChangedTouches(e)[0].pageX;
        pageY = this.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.theArea.processMouseMove(pageX - offset.left, pageY - offset.top);
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
        pageX = this.getChangedTouches(e)[0].pageX;
        pageY = this.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.theArea.processMouseDown(pageX - offset.left, pageY - offset.top);
      this.drawScene();
    }
  };

  onMouseUp(e) {
    if (this.image !== null) {
      var offset = CropHost.getElementOffset(this.ctx.canvas),
        pageX, pageY;
      if (e.type === 'touchend') {
        pageX = this.getChangedTouches(e)[0].pageX;
        pageY = this.getChangedTouches(e)[0].pageY;
      } else {
        pageX = e.pageX;
        pageY = e.pageY;
      }
      this.theArea.processMouseUp(pageX - offset.left, pageY - offset.top);
      this.drawScene();
    }
  };

  getResultImageDataURI() {
    var temp_canvas = this.elCanvas;
    var temp_ctx = temp_canvas.getContext('2d');
    temp_canvas.width = this.resImgSize;
    temp_canvas.height = this.resImgSize;
    if (this.image !== null) {
      temp_ctx.drawImage(this.image,
        (this.theArea.getX() - this.theArea.getSize() / 2) * (this.image.width / this.ctx.canvas.width),
        (this.theArea.getY() - this.theArea.getSize() / 2) * (this.image.height / this.ctx.canvas.height),
        this.theArea.getSize() * (this.image.width / this.ctx.canvas.width),
        this.theArea.getSize() * (this.image.height / this.ctx.canvas.height),
        0, 0, this.resImgSize, this.resImgSize);
    }
    if (this.resImgQuality !== null) {
      return temp_canvas.toDataURL(this.resImgFormat, this.resImgQuality);
    }
    return temp_canvas.toDataURL(this.resImgFormat);
  }

  redraw() {
    this.drawScene();
  }

  setNewImageSource(imageSource) {
    this.image = null;
    this.resetCropHost();
    this.events.trigger('image-updated');
    if (!!imageSource) {
      var newImage = new Image();
      if (imageSource.substring(0, 4).toLowerCase() === 'http') {
        newImage.crossOrigin = 'anonymous';
      }
      const self = this;
      newImage.onload = function () {
        self.events.trigger('load-done');

        CropEXIF.getData(newImage, () => {
          var orientation = CropEXIF.getTag(newImage, 'Orientation');

          function imageDone() {
            console.debug('dims=' + cw + 'x' + ch);
            var canvasDims = self.resetCropHost(cw, ch);
            self.setMaxDimensions(canvasDims[0], canvasDims[1]);
            self.events.trigger('image-updated');
            self.events.trigger('image-ready');
          }

          if ([3, 6, 8].indexOf(orientation) > -1) {
            var canvas = document.createElement("canvas"),
              ctx = canvas.getContext("2d"),
              cw = newImage.width, ch = newImage.height, cx = 0, cy = 0, deg = 0;
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
        this.events.trigger('load-error', [error]);
      };
      this.events.trigger('load-start');
      newImage.src = imageSource;
    }
  }

  setMaxDimensions(width, height) {
    console.debug('setMaxDimensions(' + width + ', ' + height + ')');

    if (this.image !== null) {
      var curWidth = this.ctx.canvas.width,
        curHeight = this.ctx.canvas.height;

      var ratioNewCurWidth = this.ctx.canvas.width / curWidth,
        ratioNewCurHeight = this.ctx.canvas.height / curHeight,
        ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);
    }
    this.maxCanvasDims = [width, height];
    return this.resetCropHost(width, height);
  }

  setAreaMinSize(size) {
    size = parseInt(size, 10);
    if (!isNaN(size)) {
      this.theArea.setMinSize(size);
      this.drawScene();
    }
  }

  setResultImageSize(size) {
    size = parseInt(size, 10);
    if (!isNaN(size)) {
      this.resImgSize = size;
    }
  }

  setResultImageFormat(format) {
    this.resImgFormat = format;
  }

  setResultImageQuality(quality) {
    quality = parseFloat(quality);
    if (!isNaN(quality) && quality >= 0 && quality <= 1) {
      this.resImgQuality = quality;
    }
  }

  setAreaType(type) {
    var curSize = this.theArea.getSize(),
      curMinSize = this.theArea.getMinSize(),
      curX = this.theArea.getX(),
      curY = this.theArea.getY();

    if (type === 'square') {
      this.theArea = new CropAreaSquare(this.ctx, this.events);
    } else {
      this.theArea = new CropAreaCircle(this.ctx, this.events);
    }
    this.theArea.setMinSize(curMinSize);
    this.theArea.setSize(curSize);
    this.theArea.setX(curX);
    this.theArea.setY(curY);

    // this.resetCropHost();
    if (this.image !== null) {
      this.theArea.setImage(this.image);
    }
    this.drawScene();
  }

  getAreaDetails() {
    return {
      x: this.theArea.getX(),
      y: this.theArea.getY(),
      size: this.theArea.getSize(),
      image: {width: this.theArea.getImage().width, height: this.theArea.getImage().height},
      canvas: {width: this.ctx.canvas.width, height: this.ctx.canvas.height}
    };
  };

  /* Life Cycle begins */

  // Get Element's Offset
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