/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropEXIF } from "./crop-exif";
import { CropAreaCircle } from "./crop-area-circle";
import { CropAreaSquare } from "./crop-area-square";
import { CropAreaType } from "./crop-area";
var CropHost = /** @class */ (function () {
    function CropHost(elCanvas, opts, events) {
        this.elCanvas = elCanvas;
        this.opts = opts;
        this.events = events;
        this.ctx = null;
        this.image = null;
        // Dimensions
        this.minCanvasDims = [100, 100];
        this.maxCanvasDims = [300, 300];
        this.resultImageSize = 200;
        this.resultImageFormat = 'image/png';
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
    /**
     * @return {?}
     */
    CropHost.prototype.destroy = /**
     * @return {?}
     */
    function () {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseMove);
        document.removeEventListener('touchmove', this.onMouseMove);
        this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
        document.removeEventListener('touchend', this.onMouseMove);
        this.elCanvas.remove();
    };
    /**
     * @return {?}
     */
    CropHost.prototype.drawScene = /**
     * @return {?}
     */
    function () {
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
    };
    /**
     * @param {?=} cw
     * @param {?=} ch
     * @return {?}
     */
    CropHost.prototype.resetCropHost = /**
     * @param {?=} cw
     * @param {?=} ch
     * @return {?}
     */
    function (cw, ch) {
        if (this.image !== null) {
            this.cropArea.setImage(this.image);
            /** @type {?} */
            var imageWidth = this.image.width || cw;
            /** @type {?} */
            var imageHeight = this.image.height || ch;
            /** @type {?} */
            var imageDims = [imageWidth, imageHeight];
            /** @type {?} */
            var imageRatio = imageWidth / imageHeight;
            /** @type {?} */
            var canvasDims = imageDims;
            if (canvasDims[0] > this.maxCanvasDims[0]) {
                canvasDims[0] = this.maxCanvasDims[0];
                canvasDims[1] = canvasDims[0] / imageRatio;
            }
            else if (canvasDims[0] < this.minCanvasDims[0]) {
                canvasDims[0] = this.minCanvasDims[0];
                canvasDims[1] = canvasDims[0] / imageRatio;
            }
            if (canvasDims[1] > this.maxCanvasDims[1]) {
                canvasDims[1] = this.maxCanvasDims[1];
                canvasDims[0] = canvasDims[1] * imageRatio;
            }
            else if (canvasDims[1] < this.minCanvasDims[1]) {
                canvasDims[1] = this.minCanvasDims[1];
                canvasDims[0] = canvasDims[1] * imageRatio;
            }
            /** @type {?} */
            var w = Math.floor(canvasDims[0]);
            /** @type {?} */
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
        }
        else {
            this.elCanvas.width = 0;
            this.elCanvas.height = 0;
            this.elCanvas.style.marginLeft = 0;
            this.elCanvas.style.marginTop = 0;
        }
        this.drawScene();
        return canvasDims;
    };
    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     */
    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     * @param {?} event
     * @return {?}
     */
    CropHost.getChangedTouches = /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     * @param {?} event
     * @return {?}
     */
    function (event) {
        return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
    };
    /**
     * @param {?} e
     * @return {?}
     */
    CropHost.prototype.onMouseMove = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchmove') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseMove(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    CropHost.prototype.onMouseDown = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchstart') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseDown(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    };
    /**
     * @param {?} e
     * @return {?}
     */
    CropHost.prototype.onMouseUp = /**
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchend') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseUp(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    };
    /**
     * @return {?}
     */
    CropHost.prototype.getResultImageDataURI = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var temp_canvas = /** @type {?} */ (document.createElement('CANVAS'));
        /** @type {?} */
        var temp_ctx = temp_canvas.getContext('2d');
        temp_canvas.width = this.resultImageSize;
        temp_canvas.height = this.resultImageSize;
        if (this.image !== null) {
            temp_ctx.drawImage(this.image, (this.cropArea.getX() - this.cropArea.getSize() / 2) * (this.image.width / this.ctx.canvas.width), (this.cropArea.getY() - this.cropArea.getSize() / 2) * (this.image.height / this.ctx.canvas.height), this.cropArea.getSize() * (this.image.width / this.ctx.canvas.width), this.cropArea.getSize() * (this.image.height / this.ctx.canvas.height), 0, 0, this.resultImageSize, this.resultImageSize);
        }
        if (this.resultImageQuality !== null) {
            return temp_canvas.toDataURL(this.resultImageFormat, this.resultImageQuality);
        }
        return temp_canvas.toDataURL(this.resultImageFormat);
    };
    /**
     * @return {?}
     */
    CropHost.prototype.redraw = /**
     * @return {?}
     */
    function () {
        this.drawScene();
    };
    /**
     * @param {?} imageSource
     * @return {?}
     */
    CropHost.prototype.setNewImageSource = /**
     * @param {?} imageSource
     * @return {?}
     */
    function (imageSource) {
        var _this = this;
        this.image = null;
        this.resetCropHost();
        this.events.trigger('image-updated');
        if (!!imageSource) {
            /** @type {?} */
            var newImage = new Image();
            if (imageSource.substring(0, 4).toLowerCase() === 'http') {
                newImage.crossOrigin = 'anonymous';
            }
            /** @type {?} */
            var self_1 = this;
            newImage.onload = function () {
                self_1.events.trigger('load-done');
                CropEXIF.getData(newImage, function () {
                    /** @type {?} */
                    var orientation = CropEXIF.getTag(newImage, 'Orientation');
                    /** @type {?} */
                    var cw = newImage.width;
                    /** @type {?} */
                    var ch = newImage.height;
                    /** @type {?} */
                    var cx = 0;
                    /** @type {?} */
                    var cy = 0;
                    /** @type {?} */
                    var deg = 0;
                    /**
                     * @return {?}
                     */
                    function imageDone() {
                        console.debug('dims=' + cw + 'x' + ch);
                        /** @type {?} */
                        var canvasDims = self_1.resetCropHost(cw, ch);
                        self_1.setMaxDimensions(canvasDims[0], canvasDims[1]);
                        self_1.events.trigger('image-updated');
                        self_1.events.trigger('image-ready');
                    }
                    if ([3, 6, 8].indexOf(orientation) >= 0) {
                        /** @type {?} */
                        var canvas = document.createElement("canvas");
                        /** @type {?} */
                        var ctx = canvas.getContext("2d");
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
                        self_1.ctx.rotate(deg * Math.PI / 180);
                        self_1.ctx.drawImage(newImage, cx, cy);
                        self_1.image = new Image();
                        self_1.image.onload = function () {
                            imageDone();
                        };
                        self_1.image.src = canvas.toDataURL("image/png");
                    }
                    else {
                        self_1.image = newImage;
                        imageDone();
                    }
                });
            };
            newImage.onerror = function (error) {
                _this.events.trigger('load-error', [error]);
            };
            this.events.trigger('load-start');
            newImage.src = imageSource;
        }
    };
    /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    CropHost.prototype.setMaxDimensions = /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    function (width, height) {
        console.debug('setMaxDimensions(' + width + ', ' + height + ')');
        if (this.image !== null) {
            /** @type {?} */
            var curWidth = this.ctx.canvas.width;
            /** @type {?} */
            var curHeight = this.ctx.canvas.height;
            /** @type {?} */
            var ratioNewCurWidth = this.ctx.canvas.width / curWidth;
            /** @type {?} */
            var ratioNewCurHeight = this.ctx.canvas.height / curHeight;
            /** @type {?} */
            var ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);
        }
        this.maxCanvasDims = [width, height];
        return this.resetCropHost(width, height);
    };
    /**
     * @param {?} size
     * @return {?}
     */
    CropHost.prototype.setAreaMinSize = /**
     * @param {?} size
     * @return {?}
     */
    function (size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.cropArea.setMinSize(size);
            this.drawScene();
        }
    };
    /**
     * @param {?} size
     * @return {?}
     */
    CropHost.prototype.setResultImageSize = /**
     * @param {?} size
     * @return {?}
     */
    function (size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.resultImageSize = size;
        }
    };
    /**
     * @param {?} format
     * @return {?}
     */
    CropHost.prototype.setResultImageFormat = /**
     * @param {?} format
     * @return {?}
     */
    function (format) {
        this.resultImageFormat = format;
    };
    /**
     * @param {?} quality
     * @return {?}
     */
    CropHost.prototype.setResultImageQuality = /**
     * @param {?} quality
     * @return {?}
     */
    function (quality) {
        quality = parseFloat(quality);
        if (!isNaN(quality) && quality >= 0 && quality <= 1) {
            this.resultImageQuality = quality;
        }
    };
    /**
     * @param {?} type
     * @return {?}
     */
    CropHost.prototype.setAreaType = /**
     * @param {?} type
     * @return {?}
     */
    function (type) {
        /** @type {?} */
        var curSize = this.cropArea.getSize();
        /** @type {?} */
        var curMinSize = this.cropArea.getMinSize();
        /** @type {?} */
        var curX = this.cropArea.getX();
        /** @type {?} */
        var curY = this.cropArea.getY();
        if (type === CropAreaType.Square) {
            this.cropArea = new CropAreaSquare(this.ctx, this.events);
        }
        else {
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
    };
    /**
     * @return {?}
     */
    CropHost.prototype.getAreaDetails = /**
     * @return {?}
     */
    function () {
        return {
            x: this.cropArea.getX(),
            y: this.cropArea.getY(),
            size: this.cropArea.getSize(),
            image: { width: this.cropArea.getImage().width, height: this.cropArea.getImage().height },
            canvas: { width: this.ctx.canvas.width, height: this.ctx.canvas.height }
        };
    };
    /**
     * @param {?} elem
     * @return {?}
     */
    CropHost.getElementOffset = /**
     * @param {?} elem
     * @return {?}
     */
    function (elem) {
        /** @type {?} */
        var box = elem.getBoundingClientRect();
        /** @type {?} */
        var body = document.body;
        /** @type {?} */
        var docElem = document.documentElement;
        /** @type {?} */
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        /** @type {?} */
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        /** @type {?} */
        var clientTop = docElem.clientTop || body.clientTop || 0;
        /** @type {?} */
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        /** @type {?} */
        var top = box.top + scrollTop - clientTop;
        /** @type {?} */
        var left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    };
    return CropHost;
}());
export { CropHost };
if (false) {
    /** @type {?} */
    CropHost.prototype.ctx;
    /** @type {?} */
    CropHost.prototype.image;
    /** @type {?} */
    CropHost.prototype.cropArea;
    /** @type {?} */
    CropHost.prototype.minCanvasDims;
    /** @type {?} */
    CropHost.prototype.maxCanvasDims;
    /** @type {?} */
    CropHost.prototype.resultImageSize;
    /** @type {?} */
    CropHost.prototype.resultImageFormat;
    /** @type {?} */
    CropHost.prototype.resultImageQuality;
    /** @type {?} */
    CropHost.prototype.element;
    /** @type {?} */
    CropHost.prototype.elCanvas;
    /** @type {?} */
    CropHost.prototype.opts;
    /** @type {?} */
    CropHost.prototype.events;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1ob3N0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3JDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLFlBQVksRUFBVyxNQUFNLGFBQWEsQ0FBQztBQUduRCxJQUFBO0lBa0JFLGtCQUFvQixRQUFRLEVBQVUsSUFBSSxFQUFVLE1BQU07UUFBdEMsYUFBUSxHQUFSLFFBQVEsQ0FBQTtRQUFVLFNBQUksR0FBSixJQUFJLENBQUE7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFBO21CQWhCcEQsSUFBSTtxQkFDRixJQUFJOzs2QkFLSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7NkJBQ1YsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOytCQUVSLEdBQUc7aUNBQ0QsV0FBVztRQU83QixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7UUFFdEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVyRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMs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RyxNQUFNLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQzs7UUFDMUUsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7O1FBRTdFLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7O1FBQ3pELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7O1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7UUFDMUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTlDLE9BQU8sRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO0tBQ3ZEO21CQTdXSDtJQThXQyxDQUFBO0FBeFdELG9CQXdXQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3JvcEVYSUZ9IGZyb20gXCIuL2Nyb3AtZXhpZlwiO1xuaW1wb3J0IHtDcm9wQXJlYUNpcmNsZX0gZnJvbSBcIi4vY3JvcC1hcmVhLWNpcmNsZVwiO1xuaW1wb3J0IHtDcm9wQXJlYVNxdWFyZX0gZnJvbSBcIi4vY3JvcC1hcmVhLXNxdWFyZVwiO1xuaW1wb3J0IHtDcm9wQXJlYVR5cGUsIENyb3BBcmVhfSBmcm9tIFwiLi9jcm9wLWFyZWFcIjtcbmltcG9ydCB7Q3JvcEFyZWFEZXRhaWxzfSBmcm9tIFwiLi4vZmMtaW1nLWNyb3AuY29tcG9uZW50XCI7XG5cbmV4cG9ydCBjbGFzcyBDcm9wSG9zdCB7XG5cbiAgY3R4ID0gbnVsbDtcbiAgaW1hZ2UgPSBudWxsO1xuXG4gIGNyb3BBcmVhOiBDcm9wQXJlYTtcblxuICAvLyBEaW1lbnNpb25zXG4gIG1pbkNhbnZhc0RpbXMgPSBbMTAwLCAxMDBdO1xuICBtYXhDYW52YXNEaW1zID0gWzMwMCwgMzAwXTtcblxuICByZXN1bHRJbWFnZVNpemUgPSAyMDA7XG4gIHJlc3VsdEltYWdlRm9ybWF0ID0gJ2ltYWdlL3BuZyc7XG5cbiAgcmVzdWx0SW1hZ2VRdWFsaXR5O1xuXG4gIHByaXZhdGUgZWxlbWVudDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxDYW52YXMsIHByaXZhdGUgb3B0cywgcHJpdmF0ZSBldmVudHMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbENhbnZhcy5wYXJlbnRFbGVtZW50O1xuXG4gICAgdGhpcy5jdHggPSBlbENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgdGhpcy5jcm9wQXJlYSA9IG5ldyBDcm9wQXJlYUNpcmNsZSh0aGlzLmN0eCwgZXZlbnRzKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bik7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZU1vdmUpO1xuXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgdGhpcy5lbENhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbk1vdXNlRG93bik7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblxuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlKCk7XG4gIH1cblxuICBkcmF3U2NlbmUoKSB7XG4gICAgLy8gY2xlYXIgY2FudmFzXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgLy8gZHJhdyBzb3VyY2UgdGhpcy5pbWFnZVxuICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG4gICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgIC8vIGFuZCBtYWtlIGl0IGRhcmtlclxuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgMC42NSknO1xuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jdHguY2FudmFzLndpZHRoLCB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuXG4gICAgICB0aGlzLmNyb3BBcmVhLmRyYXcoKTtcbiAgICB9XG4gIH1cblxuICByZXNldENyb3BIb3N0KGN3PywgY2g/KSB7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0SW1hZ2UodGhpcy5pbWFnZSk7XG4gICAgICB2YXIgaW1hZ2VXaWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGggfHwgY3c7XG4gICAgICB2YXIgaW1hZ2VIZWlnaHQgPSB0aGlzLmltYWdlLmhlaWdodCB8fCBjaDtcbiAgICAgIHZhciBpbWFnZURpbXMgPSBbaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHRdO1xuXG4gICAgICAvLyBDb21wdXRlIGNhbnZhcyBkaW1lbnNpb25zIHRvIGZpdCBmdWxsIGRpc3BsYXkgaW50byBob3N0XG4gICAgICB2YXIgaW1hZ2VSYXRpbyA9IGltYWdlV2lkdGggLyBpbWFnZUhlaWdodDtcbiAgICAgIHZhciBjYW52YXNEaW1zID0gaW1hZ2VEaW1zO1xuICAgICAgaWYgKGNhbnZhc0RpbXNbMF0gPiB0aGlzLm1heENhbnZhc0RpbXNbMF0pIHtcbiAgICAgICAgY2FudmFzRGltc1swXSA9IHRoaXMubWF4Q2FudmFzRGltc1swXTtcbiAgICAgICAgY2FudmFzRGltc1sxXSA9IGNhbnZhc0RpbXNbMF0gLyBpbWFnZVJhdGlvO1xuICAgICAgfSBlbHNlIGlmIChjYW52YXNEaW1zWzBdIDwgdGhpcy5taW5DYW52YXNEaW1zWzBdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSB0aGlzLm1pbkNhbnZhc0RpbXNbMF07XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSBjYW52YXNEaW1zWzBdIC8gaW1hZ2VSYXRpbztcbiAgICAgIH1cbiAgICAgIGlmIChjYW52YXNEaW1zWzFdID4gdGhpcy5tYXhDYW52YXNEaW1zWzFdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSB0aGlzLm1heENhbnZhc0RpbXNbMV07XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSBjYW52YXNEaW1zWzFdICogaW1hZ2VSYXRpbztcbiAgICAgIH0gZWxzZSBpZiAoY2FudmFzRGltc1sxXSA8IHRoaXMubWluQ2FudmFzRGltc1sxXSkge1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gdGhpcy5taW5DYW52YXNEaW1zWzFdO1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gY2FudmFzRGltc1sxXSAqIGltYWdlUmF0aW87XG4gICAgICB9XG4gICAgICB2YXIgdyA9IE1hdGguZmxvb3IoY2FudmFzRGltc1swXSk7XG4gICAgICB2YXIgaCA9IE1hdGguZmxvb3IoY2FudmFzRGltc1sxXSk7XG4gICAgICBjYW52YXNEaW1zWzBdID0gdztcbiAgICAgIGNhbnZhc0RpbXNbMV0gPSBoO1xuICAgICAgY29uc29sZS5kZWJ1ZygnY2FudmFzIHJlc2V0ID0nICsgdyArICd4JyArIGgpO1xuICAgICAgdGhpcy5lbENhbnZhcy53aWR0aCA9IHc7XG4gICAgICB0aGlzLmVsQ2FudmFzLmhlaWdodCA9IGg7XG5cbiAgICAgIC8vIENvbXBlbnNhdGUgQ1NTIDUwJSBjZW50ZXJpbmcgb2YgY2FudmFzIGluc2lkZSBob3N0XG4gICAgICB0aGlzLmVsQ2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSAtdyAvIDIgKyAncHgnO1xuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSAtaCAvIDIgKyAncHgnO1xuXG4gICAgICAvLyBDZW50ZXIgY3JvcCBhcmVhIGJ5IGRlZmF1bHRcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0WCh0aGlzLmN0eC5jYW52YXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0WSh0aGlzLmN0eC5jYW52YXMuaGVpZ2h0IC8gMik7XG5cbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0U2l6ZShNYXRoLm1pbigyMDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgLyAyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWxDYW52YXMud2lkdGggPSAwO1xuICAgICAgdGhpcy5lbENhbnZhcy5oZWlnaHQgPSAwO1xuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luVG9wID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdTY2VuZSgpO1xuXG4gICAgcmV0dXJuIGNhbnZhc0RpbXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBldmVudC5jaGFuZ2VkVG91Y2hlcyBkaXJlY3RseSBpZiBldmVudCBpcyBhIFRvdWNoRXZlbnQuXG4gICAqIElmIGV2ZW50IGlzIGEgalF1ZXJ5IGV2ZW50LCByZXR1cm4gY2hhbmdlZFRvdWNoZXMgb2YgZXZlbnQub3JpZ2luYWxFdmVudFxuICAgKi9cbiAgc3RhdGljIGdldENoYW5nZWRUb3VjaGVzKGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LmNoYW5nZWRUb3VjaGVzID8gZXZlbnQuY2hhbmdlZFRvdWNoZXMgOiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICB9XG5cbiAgb25Nb3VzZU1vdmUoZSkge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICBwYWdlWCA9IENyb3BIb3N0LmdldENoYW5nZWRUb3VjaGVzKGUpWzBdLnBhZ2VYO1xuICAgICAgICBwYWdlWSA9IENyb3BIb3N0LmdldENoYW5nZWRUb3VjaGVzKGUpWzBdLnBhZ2VZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZVggPSBlLnBhZ2VYO1xuICAgICAgICBwYWdlWSA9IGUucGFnZVk7XG4gICAgICB9XG4gICAgICB0aGlzLmNyb3BBcmVhLnByb2Nlc3NNb3VzZU1vdmUocGFnZVggLSBvZmZzZXQubGVmdCwgcGFnZVkgLSBvZmZzZXQudG9wKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgb25Nb3VzZURvd24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VEb3duKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIHBhZ2VZIC0gb2Zmc2V0LnRvcCk7XG4gICAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uTW91c2VVcChlKSB7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHZhciBvZmZzZXQgPSBDcm9wSG9zdC5nZXRFbGVtZW50T2Zmc2V0KHRoaXMuY3R4LmNhbnZhcyksXG4gICAgICAgIHBhZ2VYLCBwYWdlWTtcbiAgICAgIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VVcChwYWdlWCAtIG9mZnNldC5sZWZ0LCBwYWdlWSAtIG9mZnNldC50b3ApO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBnZXRSZXN1bHRJbWFnZURhdGFVUkkoKSB7XG4gICAgdmFyIHRlbXBfY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0NBTlZBUycpO1xuICAgIHZhciB0ZW1wX2N0eCA9IHRlbXBfY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGVtcF9jYW52YXMud2lkdGggPSB0aGlzLnJlc3VsdEltYWdlU2l6ZTtcbiAgICB0ZW1wX2NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlc3VsdEltYWdlU2l6ZTtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdGVtcF9jdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsXG4gICAgICAgICh0aGlzLmNyb3BBcmVhLmdldFgoKSAtIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpIC8gMikgKiAodGhpcy5pbWFnZS53aWR0aCAvIHRoaXMuY3R4LmNhbnZhcy53aWR0aCksXG4gICAgICAgICh0aGlzLmNyb3BBcmVhLmdldFkoKSAtIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpIC8gMikgKiAodGhpcy5pbWFnZS5oZWlnaHQgLyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KSxcbiAgICAgICAgdGhpcy5jcm9wQXJlYS5nZXRTaXplKCkgKiAodGhpcy5pbWFnZS53aWR0aCAvIHRoaXMuY3R4LmNhbnZhcy53aWR0aCksXG4gICAgICAgIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpICogKHRoaXMuaW1hZ2UuaGVpZ2h0IC8gdGhpcy5jdHguY2FudmFzLmhlaWdodCksXG4gICAgICAgIDAsIDAsIHRoaXMucmVzdWx0SW1hZ2VTaXplLCB0aGlzLnJlc3VsdEltYWdlU2l6ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3VsdEltYWdlUXVhbGl0eSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlbXBfY2FudmFzLnRvRGF0YVVSTCh0aGlzLnJlc3VsdEltYWdlRm9ybWF0LCB0aGlzLnJlc3VsdEltYWdlUXVhbGl0eSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wX2NhbnZhcy50b0RhdGFVUkwodGhpcy5yZXN1bHRJbWFnZUZvcm1hdCk7XG4gIH1cblxuICByZWRyYXcoKSB7XG4gICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgfVxuXG4gIHNldE5ld0ltYWdlU291cmNlKGltYWdlU291cmNlKSB7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldENyb3BIb3N0KCk7XG4gICAgdGhpcy5ldmVudHMudHJpZ2dlcignaW1hZ2UtdXBkYXRlZCcpO1xuICAgIGlmICghIWltYWdlU291cmNlKSB7XG4gICAgICB2YXIgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGlmIChpbWFnZVNvdXJjZS5zdWJzdHJpbmcoMCwgNCkudG9Mb3dlckNhc2UoKSA9PT0gJ2h0dHAnKSB7XG4gICAgICAgIG5ld0ltYWdlLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIG5ld0ltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5ldmVudHMudHJpZ2dlcignbG9hZC1kb25lJyk7XG5cbiAgICAgICAgQ3JvcEVYSUYuZ2V0RGF0YShuZXdJbWFnZSwgKCkgPT4ge1xuICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IENyb3BFWElGLmdldFRhZyhuZXdJbWFnZSwgJ09yaWVudGF0aW9uJyk7XG4gICAgICAgICAgbGV0IGN3ID0gbmV3SW1hZ2Uud2lkdGgsIGNoID0gbmV3SW1hZ2UuaGVpZ2h0LCBjeCA9IDAsIGN5ID0gMCwgZGVnID0gMDtcblxuICAgICAgICAgIGZ1bmN0aW9uIGltYWdlRG9uZSgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2RpbXM9JyArIGN3ICsgJ3gnICsgY2gpO1xuICAgICAgICAgICAgdmFyIGNhbnZhc0RpbXMgPSBzZWxmLnJlc2V0Q3JvcEhvc3QoY3csIGNoKTtcbiAgICAgICAgICAgIHNlbGYuc2V0TWF4RGltZW5zaW9ucyhjYW52YXNEaW1zWzBdLCBjYW52YXNEaW1zWzFdKTtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXVwZGF0ZWQnKTtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXJlYWR5Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFszLCA2LCA4XS5pbmRleE9mKG9yaWVudGF0aW9uKSA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICAgIHN3aXRjaCAob3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGN4ID0gLW5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN5ID0gLW5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBkZWcgPSAxODA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICBjdyA9IG5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBjaCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN5ID0gLW5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBkZWcgPSA5MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIGN3ID0gbmV3SW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGNoID0gbmV3SW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgY3ggPSAtbmV3SW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgZGVnID0gMjcwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gY3c7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2g7XG4gICAgICAgICAgICBzZWxmLmN0eC5yb3RhdGUoZGVnICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgICAgICBzZWxmLmN0eC5kcmF3SW1hZ2UobmV3SW1hZ2UsIGN4LCBjeSk7XG5cbiAgICAgICAgICAgIHNlbGYuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpbWFnZURvbmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuaW1hZ2UgPSBuZXdJbWFnZTtcbiAgICAgICAgICAgIGltYWdlRG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbmV3SW1hZ2Uub25lcnJvciA9IGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5ldmVudHMudHJpZ2dlcignbG9hZC1lcnJvcicsIFtlcnJvcl0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtc3RhcnQnKTtcbiAgICAgIG5ld0ltYWdlLnNyYyA9IGltYWdlU291cmNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1heERpbWVuc2lvbnMod2lkdGgsIGhlaWdodCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NldE1heERpbWVuc2lvbnMoJyArIHdpZHRoICsgJywgJyArIGhlaWdodCArICcpJyk7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGN1cldpZHRoID0gdGhpcy5jdHguY2FudmFzLndpZHRoLFxuICAgICAgICBjdXJIZWlnaHQgPSB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0O1xuXG4gICAgICBjb25zdCByYXRpb05ld0N1cldpZHRoID0gdGhpcy5jdHguY2FudmFzLndpZHRoIC8gY3VyV2lkdGgsXG4gICAgICAgIHJhdGlvTmV3Q3VySGVpZ2h0ID0gdGhpcy5jdHguY2FudmFzLmhlaWdodCAvIGN1ckhlaWdodCxcbiAgICAgICAgcmF0aW9NaW4gPSBNYXRoLm1pbihyYXRpb05ld0N1cldpZHRoLCByYXRpb05ld0N1ckhlaWdodCk7XG4gICAgfVxuICAgIHRoaXMubWF4Q2FudmFzRGltcyA9IFt3aWR0aCwgaGVpZ2h0XTtcbiAgICByZXR1cm4gdGhpcy5yZXNldENyb3BIb3N0KHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0QXJlYU1pblNpemUoc2l6ZSkge1xuICAgIHNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gICAgaWYgKCFpc05hTihzaXplKSkge1xuICAgICAgdGhpcy5jcm9wQXJlYS5zZXRNaW5TaXplKHNpemUpO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZVNpemUoc2l6ZSkge1xuICAgIHNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gICAgaWYgKCFpc05hTihzaXplKSkge1xuICAgICAgdGhpcy5yZXN1bHRJbWFnZVNpemUgPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIHNldFJlc3VsdEltYWdlRm9ybWF0KGZvcm1hdCkge1xuICAgIHRoaXMucmVzdWx0SW1hZ2VGb3JtYXQgPSBmb3JtYXQ7XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZVF1YWxpdHkocXVhbGl0eSkge1xuICAgIHF1YWxpdHkgPSBwYXJzZUZsb2F0KHF1YWxpdHkpO1xuICAgIGlmICghaXNOYU4ocXVhbGl0eSkgJiYgcXVhbGl0eSA+PSAwICYmIHF1YWxpdHkgPD0gMSkge1xuICAgICAgdGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkgPSBxdWFsaXR5O1xuICAgIH1cbiAgfVxuXG4gIHNldEFyZWFUeXBlKHR5cGU6IENyb3BBcmVhVHlwZSkge1xuICAgIGNvbnN0IGN1clNpemUgPSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSxcbiAgICAgIGN1ck1pblNpemUgPSB0aGlzLmNyb3BBcmVhLmdldE1pblNpemUoKSxcbiAgICAgIGN1clggPSB0aGlzLmNyb3BBcmVhLmdldFgoKSxcbiAgICAgIGN1clkgPSB0aGlzLmNyb3BBcmVhLmdldFkoKTtcblxuICAgIGlmICh0eXBlID09PSBDcm9wQXJlYVR5cGUuU3F1YXJlKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhID0gbmV3IENyb3BBcmVhU3F1YXJlKHRoaXMuY3R4LCB0aGlzLmV2ZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEgPSBuZXcgQ3JvcEFyZWFDaXJjbGUodGhpcy5jdHgsIHRoaXMuZXZlbnRzKTtcbiAgICB9XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRNaW5TaXplKGN1ck1pblNpemUpO1xuICAgIHRoaXMuY3JvcEFyZWEuc2V0U2l6ZShjdXJTaXplKTtcbiAgICB0aGlzLmNyb3BBcmVhLnNldFgoY3VyWCk7XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRZKGN1clkpO1xuXG4gICAgLy8gdGhpcy5yZXNldENyb3BIb3N0KCk7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0SW1hZ2UodGhpcy5pbWFnZSk7XG4gICAgfVxuICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gIH1cblxuICBnZXRBcmVhRGV0YWlscygpIDogQ3JvcEFyZWFEZXRhaWxzIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogdGhpcy5jcm9wQXJlYS5nZXRYKCksXG4gICAgICB5OiB0aGlzLmNyb3BBcmVhLmdldFkoKSxcbiAgICAgIHNpemU6IHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpLFxuICAgICAgaW1hZ2U6IHt3aWR0aDogdGhpcy5jcm9wQXJlYS5nZXRJbWFnZSgpLndpZHRoLCBoZWlnaHQ6IHRoaXMuY3JvcEFyZWEuZ2V0SW1hZ2UoKS5oZWlnaHR9LFxuICAgICAgY2FudmFzOiB7d2lkdGg6IHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0fVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0RWxlbWVudE9mZnNldChlbGVtKSB7XG4gICAgdmFyIGJveCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICB2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQ7XG5cbiAgICB2YXIgY2xpZW50VG9wID0gZG9jRWxlbS5jbGllbnRUb3AgfHwgYm9keS5jbGllbnRUb3AgfHwgMDtcbiAgICB2YXIgY2xpZW50TGVmdCA9IGRvY0VsZW0uY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMDtcblxuICAgIHZhciB0b3AgPSBib3gudG9wICsgc2Nyb2xsVG9wIC0gY2xpZW50VG9wO1xuICAgIHZhciBsZWZ0ID0gYm94LmxlZnQgKyBzY3JvbGxMZWZ0IC0gY2xpZW50TGVmdDtcblxuICAgIHJldHVybiB7dG9wOiBNYXRoLnJvdW5kKHRvcCksIGxlZnQ6IE1hdGgucm91bmQobGVmdCl9O1xuICB9XG59Il19