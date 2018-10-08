export class CropHost {
  constructor(CropAreaCircle, CropAreaSquare, cropEXIF) {
    return function (elCanvas, opts, events) {
      /* PRIVATE VARIABLES */

      // Object Pointers
      var ctx = null,
        image = null,
        element = elCanvas.parent(),
        theArea = null;

      // Dimensions
      var minCanvasDims = [100, 100],
        maxCanvasDims = [300, 300];

      // Result Image size
      var resImgSize = 200;

      // Result Image type
      var resImgFormat = 'image/png';

      // Result Image quality
      var resImgQuality = null;

      /* PRIVATE FUNCTIONS */

      // Draw Scene
      function drawScene() {
        // clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (image !== null) {
          // draw source image
          ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

          ctx.save();

          // and make it darker
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          ctx.restore();

          // draw Area
          theArea.draw();
        }
      }

      var resetCropHost = function (cw?, ch?) {
        if (image !== null) {
          theArea.setImage(image);
          var imageWidth = image.width || cw;
          var imageHeight = image.height || ch;
          var imageDims = [imageWidth, imageHeight];
          var imageRatio = imageWidth / imageHeight;
          var canvasDims = imageDims;

          if (canvasDims[0] > maxCanvasDims[0]) {
            canvasDims[0] = maxCanvasDims[0];
            canvasDims[1] = canvasDims[0] / imageRatio;
          } else if (canvasDims[0] < minCanvasDims[0]) {
            canvasDims[0] = minCanvasDims[0];
            canvasDims[1] = canvasDims[0] / imageRatio;
          }
          if (canvasDims[1] > maxCanvasDims[1]) {
            canvasDims[1] = maxCanvasDims[1];
            canvasDims[0] = canvasDims[1] * imageRatio;
          } else if (canvasDims[1] < minCanvasDims[1]) {
            canvasDims[1] = minCanvasDims[1];
            canvasDims[0] = canvasDims[1] * imageRatio;
          }
          var w = Math.floor(canvasDims[0]);
          var h = Math.floor(canvasDims[1]);
          canvasDims[0] = w;
          canvasDims[1] = h;
          console.log('canvas reset =' + w + 'x' + h);
          elCanvas.prop('width', w).prop('height', h).css({
            'margin-left': -w / 2 + 'px',
            'margin-top': -h / 2 + 'px'
          });
          theArea.setX(ctx.canvas.width / 2);
          theArea.setY(ctx.canvas.height / 2);
          theArea.setSize(Math.min(200, ctx.canvas.width / 2, ctx.canvas.height / 2));
        } else {
          elCanvas.prop('width', 0).prop('height', 0).css({'margin-top': 0});
        }

        drawScene();

        return canvasDims;
      };

      /**
       * Returns event.changedTouches directly if event is a TouchEvent.
       * If event is a jQuery event, return changedTouches of event.originalEvent
       */
      var getChangedTouches = function (event) {
        if (event.changedTouches) {
          return event.changedTouches;
        } else {
          return event.originalEvent.changedTouches;
        }
      };

      var onMouseMove = function (e) {
        if (image !== null) {
          var offset = CropHost.getElementOffset(ctx.canvas),
            pageX, pageY;
          if (e.type === 'touchmove') {
            pageX = getChangedTouches(e)[0].pageX;
            pageY = getChangedTouches(e)[0].pageY;
          } else {
            pageX = e.pageX;
            pageY = e.pageY;
          }
          theArea.processMouseMove(pageX - offset.left, pageY - offset.top);
          drawScene();
        }
      };

      var onMouseDown = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (image !== null) {
          var offset = CropHost.getElementOffset(ctx.canvas),
            pageX, pageY;
          if (e.type === 'touchstart') {
            pageX = getChangedTouches(e)[0].pageX;
            pageY = getChangedTouches(e)[0].pageY;
          } else {
            pageX = e.pageX;
            pageY = e.pageY;
          }
          theArea.processMouseDown(pageX - offset.left, pageY - offset.top);
          drawScene();
        }
      };

      var onMouseUp = function (e) {
        if (image !== null) {
          var offset = CropHost.getElementOffset(ctx.canvas),
            pageX, pageY;
          if (e.type === 'touchend') {
            pageX = getChangedTouches(e)[0].pageX;
            pageY = getChangedTouches(e)[0].pageY;
          } else {
            pageX = e.pageX;
            pageY = e.pageY;
          }
          theArea.processMouseUp(pageX - offset.left, pageY - offset.top);
          drawScene();
        }
      };

      this.getResultImageDataURI = function () {
        var temp_canvas = this.el.nativeElement.querySelector('<canvas></canvas>');
        var temp_ctx = temp_canvas.getContext('2d');
        temp_canvas.width = resImgSize;
        temp_canvas.height = resImgSize;
        if (image !== null) {
          temp_ctx.drawImage(image,
            (theArea.getX() - theArea.getSize() / 2) * (image.width / ctx.canvas.width),
            (theArea.getY() - theArea.getSize() / 2) * (image.height / ctx.canvas.height),
            theArea.getSize() * (image.width / ctx.canvas.width),
            theArea.getSize() * (image.height / ctx.canvas.height),
            0, 0, resImgSize, resImgSize);
        }
        if (resImgQuality !== null) {
          return temp_canvas.toDataURL(resImgFormat, resImgQuality);
        }
        return temp_canvas.toDataURL(resImgFormat);
      };

      this.redraw = function () {
        drawScene();
      };

      var self = this;
      this.setNewImageSource = function (imageSource) {
        image = null;
        resetCropHost();
        events.trigger('image-updated');
        if (!!imageSource) {
          var newImage = new Image();
          if (imageSource.substring(0, 4).toLowerCase() === 'http') {
            newImage.crossOrigin = 'anonymous';
          }
          newImage.onload = function () {
            events.trigger('load-done');

            cropEXIF.getData(newImage, function () {
              var orientation = cropEXIF.getTag(newImage, 'Orientation');

              function imageDone() {
                console.debug('dims=' + cw + 'x' + ch);
                var canvasDims = resetCropHost(cw, ch);
                self.setMaxDimensions(canvasDims[0], canvasDims[1]);
                events.trigger('image-updated');
                events.trigger('image-ready');
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
                ctx.rotate(deg * Math.PI / 180);
                ctx.drawImage(newImage, cx, cy);

                image = new Image();
                image.onload = function () {
                  imageDone();
                };
                image.src = canvas.toDataURL("image/png");
              } else {
                image = newImage;
                imageDone();
              }
            });
          };
          newImage.onerror = function (error) {
            events.trigger('load-error', [error]);
          };
          events.trigger('load-start');
          newImage.src = imageSource;
        }
      };

      /* Life Cycle begins */

      // Init Context var
      ctx = elCanvas[0].getContext('2d');

      // Init CropArea
      theArea = new CropAreaCircle(ctx, events);

      // Init Mouse Event Listeners
      document.addEventListener('mousemove', onMouseMove);
      elCanvas.on('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);

      // Init Touch Event Listeners
      document.addEventListener('touchmove', onMouseMove);
      elCanvas.on('touchstart', onMouseDown);
      document.addEventListener('touchend', onMouseUp);

      // CropHost Destructor
      this.destroy = function () {
        document.removeEventListener('mousemove', onMouseMove);
        elCanvas.off('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseMove);

        document.removeEventListener('touchmove', onMouseMove);
        elCanvas.off('touchstart', onMouseDown);
        document.removeEventListener('touchend', onMouseMove);

        elCanvas.remove();
      };
    };
  }

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