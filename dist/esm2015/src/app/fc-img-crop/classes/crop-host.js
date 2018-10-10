/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
import { CropEXIF } from "./crop-exif";
import { CropAreaCircle } from "./crop-area-circle";
import { CropAreaSquare } from "./crop-area-square";
import { CropAreaType } from "./crop-area";
export class CropHost {
    /**
     * @param {?} elCanvas
     * @param {?} opts
     * @param {?} events
     */
    constructor(elCanvas, opts, events) {
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
    destroy() {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseMove);
        document.removeEventListener('touchmove', this.onMouseMove);
        this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
        document.removeEventListener('touchend', this.onMouseMove);
        this.elCanvas.remove();
    }
    /**
     * @return {?}
     */
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
    /**
     * @param {?=} cw
     * @param {?=} ch
     * @return {?}
     */
    resetCropHost(cw, ch) {
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
    }
    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     * @param {?} event
     * @return {?}
     */
    static getChangedTouches(event) {
        return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseMove(e) {
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseDown(e) {
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
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseUp(e) {
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
    }
    /**
     * @return {?}
     */
    getResultImageDataURI() {
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
    }
    /**
     * @return {?}
     */
    redraw() {
        this.drawScene();
    }
    /**
     * @param {?} imageSource
     * @return {?}
     */
    setNewImageSource(imageSource) {
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
            const self = this;
            newImage.onload = function () {
                self.events.trigger('load-done');
                CropEXIF.getData(newImage, () => {
                    /** @type {?} */
                    var orientation = CropEXIF.getTag(newImage, 'Orientation');
                    /** @type {?} */
                    let cw = newImage.width;
                    /** @type {?} */
                    let ch = newImage.height;
                    /** @type {?} */
                    let cx = 0;
                    /** @type {?} */
                    let cy = 0;
                    /** @type {?} */
                    let deg = 0;
                    /**
                     * @return {?}
                     */
                    function imageDone() {
                        console.debug('dims=' + cw + 'x' + ch);
                        /** @type {?} */
                        var canvasDims = self.resetCropHost(cw, ch);
                        self.setMaxDimensions(canvasDims[0], canvasDims[1]);
                        self.events.trigger('image-updated');
                        self.events.trigger('image-ready');
                    }
                    if ([3, 6, 8].indexOf(orientation) >= 0) {
                        /** @type {?} */
                        const canvas = document.createElement("canvas");
                        /** @type {?} */
                        const ctx = canvas.getContext("2d");
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
                    }
                    else {
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
    /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    setMaxDimensions(width, height) {
        console.debug('setMaxDimensions(' + width + ', ' + height + ')');
        if (this.image !== null) {
            /** @type {?} */
            const curWidth = this.ctx.canvas.width;
            /** @type {?} */
            const curHeight = this.ctx.canvas.height;
            /** @type {?} */
            const ratioNewCurWidth = this.ctx.canvas.width / curWidth;
            /** @type {?} */
            const ratioNewCurHeight = this.ctx.canvas.height / curHeight;
            /** @type {?} */
            const ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);
        }
        this.maxCanvasDims = [width, height];
        return this.resetCropHost(width, height);
    }
    /**
     * @param {?} size
     * @return {?}
     */
    setAreaMinSize(size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.cropArea.setMinSize(size);
            this.drawScene();
        }
    }
    /**
     * @param {?} size
     * @return {?}
     */
    setResultImageSize(size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.resultImageSize = size;
        }
    }
    /**
     * @param {?} format
     * @return {?}
     */
    setResultImageFormat(format) {
        this.resultImageFormat = format;
    }
    /**
     * @param {?} quality
     * @return {?}
     */
    setResultImageQuality(quality) {
        quality = parseFloat(quality);
        if (!isNaN(quality) && quality >= 0 && quality <= 1) {
            this.resultImageQuality = quality;
        }
    }
    /**
     * @param {?} type
     * @return {?}
     */
    setAreaType(type) {
        /** @type {?} */
        const curSize = this.cropArea.getSize();
        /** @type {?} */
        const curMinSize = this.cropArea.getMinSize();
        /** @type {?} */
        const curX = this.cropArea.getX();
        /** @type {?} */
        const curY = this.cropArea.getY();
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
    }
    /**
     * @return {?}
     */
    getAreaDetails() {
        return {
            x: this.cropArea.getX(),
            y: this.cropArea.getY(),
            size: this.cropArea.getSize(),
            image: { width: this.cropArea.getImage().width, height: this.cropArea.getImage().height },
            canvas: { width: this.ctx.canvas.width, height: this.ctx.canvas.height }
        };
    }
    /**
     * @param {?} elem
     * @return {?}
     */
    static getElementOffset(elem) {
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
    }
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1ob3N0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3JDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLFlBQVksRUFBVyxNQUFNLGFBQWEsQ0FBQztBQUduRCxNQUFNOzs7Ozs7SUFrQkosWUFBb0IsUUFBUSxFQUFVLElBQUksRUFBVSxNQUFNO1FBQXRDLGFBQVEsR0FBUixRQUFRLENBQUE7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFBO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBQTttQkFoQnBELElBQUk7cUJBQ0YsSUFBSTs7NkJBS0ksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDOzZCQUNWLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzsrQkFFUixHQUFHO2lDQUNELFdBQVc7UUFPN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO1FBRXRDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFckQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFaEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbEU7Ozs7SUFFRCxPQUFPO1FBQ0wsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTFELFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUzRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3hCOzs7O0lBRUQsU0FBUzs7UUFFUCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV4RSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUV2QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7O1lBR2hCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN0QjtLQUNGOzs7Ozs7SUFFRCxhQUFhLENBQUMsRUFBRyxFQUFFLEVBQUc7UUFDcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O1lBQ25DLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQzs7WUFDeEMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDOztZQUMxQyxJQUFJLFNBQVMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQzs7WUFHMUMsSUFBSSxVQUFVLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQzs7WUFDMUMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQzthQUM1QztpQkFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDNUM7WUFDRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN6QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDNUM7aUJBQU0sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEQsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQzVDOztZQUNELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O1lBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQixVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztZQUd6QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQzs7WUFHOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzdGO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztTQUNuQztRQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVqQixPQUFPLFVBQVUsQ0FBQztLQUNuQjs7Ozs7OztJQU1ELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLO1FBQzVCLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUM7S0FDekY7Ozs7O0lBRUQsV0FBVyxDQUFDLENBQUM7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUN2QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDeEM7O1lBRGYsSUFDRSxLQUFLLENBQVE7O1lBRGYsSUFDUyxLQUFLLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO2dCQUMxQixLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDL0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNsQjtLQUNGOzs7OztJQUVELFdBQVcsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUN2QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDeEM7O1lBRGYsSUFDRSxLQUFLLENBQVE7O1lBRGYsSUFDUyxLQUFLLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO2dCQUMzQixLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDL0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNsQjtLQUNGOzs7OztJQUVELFNBQVMsQ0FBQyxDQUFDO1FBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTs7WUFDdkIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQ3hDOztZQURmLElBQ0UsS0FBSyxDQUFROztZQURmLElBQ1MsS0FBSyxDQUFDO1lBQ2YsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtnQkFDekIsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQy9DLEtBQUssR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNMLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2xCO0tBQ0Y7Ozs7SUFFRCxxQkFBcUI7O1FBQ25CLElBQUksV0FBVyxxQkFBc0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBQzs7UUFDdEUsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxXQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDekMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUMzQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUNqRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUNuRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQ3BFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDdEUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNyRDtRQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtZQUNwQyxPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQy9FO1FBQ0QsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3REOzs7O0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNsQjs7Ozs7SUFFRCxpQkFBaUIsQ0FBQyxXQUFXO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7O1lBQ2pCLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDM0IsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLEVBQUU7Z0JBQ3hELFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2FBQ3BDOztZQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixRQUFRLENBQUMsTUFBTSxHQUFHO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFakMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFOztvQkFDOUIsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7O29CQUMzRCxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFnRDs7b0JBQXZFLElBQXlCLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUEwQjs7b0JBQXZFLElBQStDLEVBQUUsR0FBRyxDQUFDLENBQWtCOztvQkFBdkUsSUFBdUQsRUFBRSxHQUFHLENBQUMsQ0FBVTs7b0JBQXZFLElBQStELEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7b0JBRXZFO3dCQUNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7O3dCQUN2QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUNwQztvQkFFRCxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFOzt3QkFDdkMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7d0JBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BDLFFBQVEsV0FBVyxFQUFFOzRCQUNuQixLQUFLLENBQUM7Z0NBQ0osRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQ0FDckIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQ0FDdEIsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQ0FDVixNQUFNOzRCQUNSLEtBQUssQ0FBQztnQ0FDSixFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQ0FDckIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0NBQ3BCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0NBQ3RCLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0NBQ1QsTUFBTTs0QkFDUixLQUFLLENBQUM7Z0NBQ0osRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0NBQ3JCLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO2dDQUNwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dDQUNyQixHQUFHLEdBQUcsR0FBRyxDQUFDO2dDQUNWLE1BQU07eUJBQ1Q7d0JBQ0QsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ2xCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO3dCQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFFckMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRzs0QkFDbEIsU0FBUyxFQUFFLENBQUM7eUJBQ2IsQ0FBQzt3QkFDRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUNoRDt5QkFBTTt3QkFDTCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQzt3QkFDdEIsU0FBUyxFQUFFLENBQUM7cUJBQ2I7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0osQ0FBQztZQUNGLFFBQVEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUMsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDO1NBQzVCO0tBQ0Y7Ozs7OztJQUVELGdCQUFnQixDQUFDLEtBQUssRUFBRSxNQUFNO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDakUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTs7WUFDdkIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNEOztZQURyQyxNQUNFLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7O1lBRXJDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FFRTs7WUFGM0QsTUFDRSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUNHOztZQUYzRCxNQUVFLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDNUQ7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUM7Ozs7O0lBRUQsY0FBYyxDQUFDLElBQUk7UUFDakIsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7S0FDRjs7Ozs7SUFFRCxrQkFBa0IsQ0FBQyxJQUFJO1FBQ3JCLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDN0I7S0FDRjs7Ozs7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7S0FDakM7Ozs7O0lBRUQscUJBQXFCLENBQUMsT0FBTztRQUMzQixPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUM7U0FDbkM7S0FDRjs7Ozs7SUFFRCxXQUFXLENBQUMsSUFBa0I7O1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBR1Q7O1FBSDlCLE1BQ0UsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBRVg7O1FBSDlCLE1BRUUsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQ0M7O1FBSDlCLE1BR0UsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFOUIsSUFBSSxJQUFJLEtBQUssWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNEO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O1FBR3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ2xCOzs7O0lBRUQsY0FBYztRQUNaLE9BQU87WUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDdkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUM3QixLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFDO1lBQ3ZGLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQztTQUN2RSxDQUFDO0tBQ0g7Ozs7O0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUk7O1FBQzFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztRQUV2QyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDOztRQUN6QixJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDOztRQUV2QyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQzs7UUFDMUUsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7O1FBRTdFLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7O1FBQ3pELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7O1FBRTVELElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7UUFDMUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBRTlDLE9BQU8sRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDO0tBQ3ZEO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Nyb3BFWElGfSBmcm9tIFwiLi9jcm9wLWV4aWZcIjtcbmltcG9ydCB7Q3JvcEFyZWFDaXJjbGV9IGZyb20gXCIuL2Nyb3AtYXJlYS1jaXJjbGVcIjtcbmltcG9ydCB7Q3JvcEFyZWFTcXVhcmV9IGZyb20gXCIuL2Nyb3AtYXJlYS1zcXVhcmVcIjtcbmltcG9ydCB7Q3JvcEFyZWFUeXBlLCBDcm9wQXJlYX0gZnJvbSBcIi4vY3JvcC1hcmVhXCI7XG5pbXBvcnQge0Nyb3BBcmVhRGV0YWlsc30gZnJvbSBcIi4uL2ZjLWltZy1jcm9wLmNvbXBvbmVudFwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEhvc3Qge1xuXG4gIGN0eCA9IG51bGw7XG4gIGltYWdlID0gbnVsbDtcblxuICBjcm9wQXJlYTogQ3JvcEFyZWE7XG5cbiAgLy8gRGltZW5zaW9uc1xuICBtaW5DYW52YXNEaW1zID0gWzEwMCwgMTAwXTtcbiAgbWF4Q2FudmFzRGltcyA9IFszMDAsIDMwMF07XG5cbiAgcmVzdWx0SW1hZ2VTaXplID0gMjAwO1xuICByZXN1bHRJbWFnZUZvcm1hdCA9ICdpbWFnZS9wbmcnO1xuXG4gIHJlc3VsdEltYWdlUXVhbGl0eTtcblxuICBwcml2YXRlIGVsZW1lbnQ6IGFueTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsQ2FudmFzLCBwcml2YXRlIG9wdHMsIHByaXZhdGUgZXZlbnRzKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxDYW52YXMucGFyZW50RWxlbWVudDtcblxuICAgIHRoaXMuY3R4ID0gZWxDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIHRoaXMuY3JvcEFyZWEgPSBuZXcgQ3JvcEFyZWFDaXJjbGUodGhpcy5jdHgsIGV2ZW50cyk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbENhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcbiAgICB0aGlzLmVsQ2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24pO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Nb3VzZURvd24pO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vbk1vdXNlTW92ZSk7XG5cbiAgICB0aGlzLmVsQ2FudmFzLnJlbW92ZSgpO1xuICB9XG5cbiAgZHJhd1NjZW5lKCkge1xuICAgIC8vIGNsZWFyIGNhbnZhc1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGgsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIC8vIGRyYXcgc291cmNlIHRoaXMuaW1hZ2VcbiAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLCAwLCAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGgsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAvLyBhbmQgbWFrZSBpdCBkYXJrZXJcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuNjUpJztcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcblxuICAgICAgdGhpcy5jcm9wQXJlYS5kcmF3KCk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRDcm9wSG9zdChjdz8sIGNoPykge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldEltYWdlKHRoaXMuaW1hZ2UpO1xuICAgICAgdmFyIGltYWdlV2lkdGggPSB0aGlzLmltYWdlLndpZHRoIHx8IGN3O1xuICAgICAgdmFyIGltYWdlSGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQgfHwgY2g7XG4gICAgICB2YXIgaW1hZ2VEaW1zID0gW2ltYWdlV2lkdGgsIGltYWdlSGVpZ2h0XTtcblxuICAgICAgLy8gQ29tcHV0ZSBjYW52YXMgZGltZW5zaW9ucyB0byBmaXQgZnVsbCBkaXNwbGF5IGludG8gaG9zdFxuICAgICAgdmFyIGltYWdlUmF0aW8gPSBpbWFnZVdpZHRoIC8gaW1hZ2VIZWlnaHQ7XG4gICAgICB2YXIgY2FudmFzRGltcyA9IGltYWdlRGltcztcbiAgICAgIGlmIChjYW52YXNEaW1zWzBdID4gdGhpcy5tYXhDYW52YXNEaW1zWzBdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSB0aGlzLm1heENhbnZhc0RpbXNbMF07XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSBjYW52YXNEaW1zWzBdIC8gaW1hZ2VSYXRpbztcbiAgICAgIH0gZWxzZSBpZiAoY2FudmFzRGltc1swXSA8IHRoaXMubWluQ2FudmFzRGltc1swXSkge1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gdGhpcy5taW5DYW52YXNEaW1zWzBdO1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gY2FudmFzRGltc1swXSAvIGltYWdlUmF0aW87XG4gICAgICB9XG4gICAgICBpZiAoY2FudmFzRGltc1sxXSA+IHRoaXMubWF4Q2FudmFzRGltc1sxXSkge1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gdGhpcy5tYXhDYW52YXNEaW1zWzFdO1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gY2FudmFzRGltc1sxXSAqIGltYWdlUmF0aW87XG4gICAgICB9IGVsc2UgaWYgKGNhbnZhc0RpbXNbMV0gPCB0aGlzLm1pbkNhbnZhc0RpbXNbMV0pIHtcbiAgICAgICAgY2FudmFzRGltc1sxXSA9IHRoaXMubWluQ2FudmFzRGltc1sxXTtcbiAgICAgICAgY2FudmFzRGltc1swXSA9IGNhbnZhc0RpbXNbMV0gKiBpbWFnZVJhdGlvO1xuICAgICAgfVxuICAgICAgdmFyIHcgPSBNYXRoLmZsb29yKGNhbnZhc0RpbXNbMF0pO1xuICAgICAgdmFyIGggPSBNYXRoLmZsb29yKGNhbnZhc0RpbXNbMV0pO1xuICAgICAgY2FudmFzRGltc1swXSA9IHc7XG4gICAgICBjYW52YXNEaW1zWzFdID0gaDtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2NhbnZhcyByZXNldCA9JyArIHcgKyAneCcgKyBoKTtcbiAgICAgIHRoaXMuZWxDYW52YXMud2lkdGggPSB3O1xuICAgICAgdGhpcy5lbENhbnZhcy5oZWlnaHQgPSBoO1xuXG4gICAgICAvLyBDb21wZW5zYXRlIENTUyA1MCUgY2VudGVyaW5nIG9mIGNhbnZhcyBpbnNpZGUgaG9zdFxuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gLXcgLyAyICsgJ3B4JztcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luVG9wID0gLWggLyAyICsgJ3B4JztcblxuICAgICAgLy8gQ2VudGVyIGNyb3AgYXJlYSBieSBkZWZhdWx0XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFgodGhpcy5jdHguY2FudmFzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFkodGhpcy5jdHguY2FudmFzLmhlaWdodCAvIDIpO1xuXG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFNpemUoTWF0aC5taW4oMjAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGggLyAyLCB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0IC8gMikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsQ2FudmFzLndpZHRoID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuaGVpZ2h0ID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IDA7XG4gICAgICB0aGlzLmVsQ2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3U2NlbmUoKTtcblxuICAgIHJldHVybiBjYW52YXNEaW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZXZlbnQuY2hhbmdlZFRvdWNoZXMgZGlyZWN0bHkgaWYgZXZlbnQgaXMgYSBUb3VjaEV2ZW50LlxuICAgKiBJZiBldmVudCBpcyBhIGpRdWVyeSBldmVudCwgcmV0dXJuIGNoYW5nZWRUb3VjaGVzIG9mIGV2ZW50Lm9yaWdpbmFsRXZlbnRcbiAgICovXG4gIHN0YXRpYyBnZXRDaGFuZ2VkVG91Y2hlcyhldmVudCkge1xuICAgIHJldHVybiBldmVudC5jaGFuZ2VkVG91Y2hlcyA/IGV2ZW50LmNoYW5nZWRUb3VjaGVzIDogZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgfVxuXG4gIG9uTW91c2VNb3ZlKGUpIHtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdmFyIG9mZnNldCA9IENyb3BIb3N0LmdldEVsZW1lbnRPZmZzZXQodGhpcy5jdHguY2FudmFzKSxcbiAgICAgICAgcGFnZVgsIHBhZ2VZO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VNb3ZlKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIHBhZ2VZIC0gb2Zmc2V0LnRvcCk7XG4gICAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uTW91c2VEb3duKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdmFyIG9mZnNldCA9IENyb3BIb3N0LmdldEVsZW1lbnRPZmZzZXQodGhpcy5jdHguY2FudmFzKSxcbiAgICAgICAgcGFnZVgsIHBhZ2VZO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG4gICAgICAgIHBhZ2VYID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlWCA9IGUucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gZS5wYWdlWTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JvcEFyZWEucHJvY2Vzc01vdXNlRG93bihwYWdlWCAtIG9mZnNldC5sZWZ0LCBwYWdlWSAtIG9mZnNldC50b3ApO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBvbk1vdXNlVXAoZSkge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnKSB7XG4gICAgICAgIHBhZ2VYID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlWCA9IGUucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gZS5wYWdlWTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JvcEFyZWEucHJvY2Vzc01vdXNlVXAocGFnZVggLSBvZmZzZXQubGVmdCwgcGFnZVkgLSBvZmZzZXQudG9wKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UmVzdWx0SW1hZ2VEYXRhVVJJKCkge1xuICAgIHZhciB0ZW1wX2NhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdDQU5WQVMnKTtcbiAgICB2YXIgdGVtcF9jdHggPSB0ZW1wX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRlbXBfY2FudmFzLndpZHRoID0gdGhpcy5yZXN1bHRJbWFnZVNpemU7XG4gICAgdGVtcF9jYW52YXMuaGVpZ2h0ID0gdGhpcy5yZXN1bHRJbWFnZVNpemU7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRlbXBfY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLFxuICAgICAgICAodGhpcy5jcm9wQXJlYS5nZXRYKCkgLSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAvIDIpICogKHRoaXMuaW1hZ2Uud2lkdGggLyB0aGlzLmN0eC5jYW52YXMud2lkdGgpLFxuICAgICAgICAodGhpcy5jcm9wQXJlYS5nZXRZKCkgLSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAvIDIpICogKHRoaXMuaW1hZ2UuaGVpZ2h0IC8gdGhpcy5jdHguY2FudmFzLmhlaWdodCksXG4gICAgICAgIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpICogKHRoaXMuaW1hZ2Uud2lkdGggLyB0aGlzLmN0eC5jYW52YXMud2lkdGgpLFxuICAgICAgICB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAqICh0aGlzLmltYWdlLmhlaWdodCAvIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpLFxuICAgICAgICAwLCAwLCB0aGlzLnJlc3VsdEltYWdlU2l6ZSwgdGhpcy5yZXN1bHRJbWFnZVNpemUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZW1wX2NhbnZhcy50b0RhdGFVUkwodGhpcy5yZXN1bHRJbWFnZUZvcm1hdCwgdGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcF9jYW52YXMudG9EYXRhVVJMKHRoaXMucmVzdWx0SW1hZ2VGb3JtYXQpO1xuICB9XG5cbiAgcmVkcmF3KCkge1xuICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gIH1cblxuICBzZXROZXdJbWFnZVNvdXJjZShpbWFnZVNvdXJjZSkge1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucmVzZXRDcm9wSG9zdCgpO1xuICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXVwZGF0ZWQnKTtcbiAgICBpZiAoISFpbWFnZVNvdXJjZSkge1xuICAgICAgdmFyIG5ld0ltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpZiAoaW1hZ2VTb3VyY2Uuc3Vic3RyaW5nKDAsIDQpLnRvTG93ZXJDYXNlKCkgPT09ICdodHRwJykge1xuICAgICAgICBuZXdJbWFnZS5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBuZXdJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtZG9uZScpO1xuXG4gICAgICAgIENyb3BFWElGLmdldERhdGEobmV3SW1hZ2UsICgpID0+IHtcbiAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSBDcm9wRVhJRi5nZXRUYWcobmV3SW1hZ2UsICdPcmllbnRhdGlvbicpO1xuICAgICAgICAgIGxldCBjdyA9IG5ld0ltYWdlLndpZHRoLCBjaCA9IG5ld0ltYWdlLmhlaWdodCwgY3ggPSAwLCBjeSA9IDAsIGRlZyA9IDA7XG5cbiAgICAgICAgICBmdW5jdGlvbiBpbWFnZURvbmUoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdkaW1zPScgKyBjdyArICd4JyArIGNoKTtcbiAgICAgICAgICAgIHZhciBjYW52YXNEaW1zID0gc2VsZi5yZXNldENyb3BIb3N0KGN3LCBjaCk7XG4gICAgICAgICAgICBzZWxmLnNldE1heERpbWVuc2lvbnMoY2FudmFzRGltc1swXSwgY2FudmFzRGltc1sxXSk7XG4gICAgICAgICAgICBzZWxmLmV2ZW50cy50cmlnZ2VyKCdpbWFnZS11cGRhdGVkJyk7XG4gICAgICAgICAgICBzZWxmLmV2ZW50cy50cmlnZ2VyKCdpbWFnZS1yZWFkeScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChbMywgNiwgOF0uaW5kZXhPZihvcmllbnRhdGlvbikgPj0gMCkge1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjeCA9IC1uZXdJbWFnZS53aWR0aDtcbiAgICAgICAgICAgICAgICBjeSA9IC1uZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZGVnID0gMTgwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgY3cgPSBuZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgY2ggPSBuZXdJbWFnZS53aWR0aDtcbiAgICAgICAgICAgICAgICBjeSA9IC1uZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZGVnID0gOTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICBjdyA9IG5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBjaCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN4ID0gLW5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGRlZyA9IDI3MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGN3O1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGNoO1xuICAgICAgICAgICAgc2VsZi5jdHgucm90YXRlKGRlZyAqIE1hdGguUEkgLyAxODApO1xuICAgICAgICAgICAgc2VsZi5jdHguZHJhd0ltYWdlKG5ld0ltYWdlLCBjeCwgY3kpO1xuXG4gICAgICAgICAgICBzZWxmLmltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBzZWxmLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaW1hZ2VEb25lKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5pbWFnZS5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmltYWdlID0gbmV3SW1hZ2U7XG4gICAgICAgICAgICBpbWFnZURvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIG5ld0ltYWdlLm9uZXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtZXJyb3InLCBbZXJyb3JdKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmV2ZW50cy50cmlnZ2VyKCdsb2FkLXN0YXJ0Jyk7XG4gICAgICBuZXdJbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcbiAgICB9XG4gIH1cblxuICBzZXRNYXhEaW1lbnNpb25zKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdzZXRNYXhEaW1lbnNpb25zKCcgKyB3aWR0aCArICcsICcgKyBoZWlnaHQgKyAnKScpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBjdXJXaWR0aCA9IHRoaXMuY3R4LmNhbnZhcy53aWR0aCxcbiAgICAgICAgY3VySGVpZ2h0ID0gdGhpcy5jdHguY2FudmFzLmhlaWdodDtcblxuICAgICAgY29uc3QgcmF0aW9OZXdDdXJXaWR0aCA9IHRoaXMuY3R4LmNhbnZhcy53aWR0aCAvIGN1cldpZHRoLFxuICAgICAgICByYXRpb05ld0N1ckhlaWdodCA9IHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgLyBjdXJIZWlnaHQsXG4gICAgICAgIHJhdGlvTWluID0gTWF0aC5taW4ocmF0aW9OZXdDdXJXaWR0aCwgcmF0aW9OZXdDdXJIZWlnaHQpO1xuICAgIH1cbiAgICB0aGlzLm1heENhbnZhc0RpbXMgPSBbd2lkdGgsIGhlaWdodF07XG4gICAgcmV0dXJuIHRoaXMucmVzZXRDcm9wSG9zdCh3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHNldEFyZWFNaW5TaXplKHNpemUpIHtcbiAgICBzaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICAgIGlmICghaXNOYU4oc2l6ZSkpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0TWluU2l6ZShzaXplKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgc2V0UmVzdWx0SW1hZ2VTaXplKHNpemUpIHtcbiAgICBzaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICAgIGlmICghaXNOYU4oc2l6ZSkpIHtcbiAgICAgIHRoaXMucmVzdWx0SW1hZ2VTaXplID0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZUZvcm1hdChmb3JtYXQpIHtcbiAgICB0aGlzLnJlc3VsdEltYWdlRm9ybWF0ID0gZm9ybWF0O1xuICB9XG5cbiAgc2V0UmVzdWx0SW1hZ2VRdWFsaXR5KHF1YWxpdHkpIHtcbiAgICBxdWFsaXR5ID0gcGFyc2VGbG9hdChxdWFsaXR5KTtcbiAgICBpZiAoIWlzTmFOKHF1YWxpdHkpICYmIHF1YWxpdHkgPj0gMCAmJiBxdWFsaXR5IDw9IDEpIHtcbiAgICAgIHRoaXMucmVzdWx0SW1hZ2VRdWFsaXR5ID0gcXVhbGl0eTtcbiAgICB9XG4gIH1cblxuICBzZXRBcmVhVHlwZSh0eXBlOiBDcm9wQXJlYVR5cGUpIHtcbiAgICBjb25zdCBjdXJTaXplID0gdGhpcy5jcm9wQXJlYS5nZXRTaXplKCksXG4gICAgICBjdXJNaW5TaXplID0gdGhpcy5jcm9wQXJlYS5nZXRNaW5TaXplKCksXG4gICAgICBjdXJYID0gdGhpcy5jcm9wQXJlYS5nZXRYKCksXG4gICAgICBjdXJZID0gdGhpcy5jcm9wQXJlYS5nZXRZKCk7XG5cbiAgICBpZiAodHlwZSA9PT0gQ3JvcEFyZWFUeXBlLlNxdWFyZSkge1xuICAgICAgdGhpcy5jcm9wQXJlYSA9IG5ldyBDcm9wQXJlYVNxdWFyZSh0aGlzLmN0eCwgdGhpcy5ldmVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyb3BBcmVhID0gbmV3IENyb3BBcmVhQ2lyY2xlKHRoaXMuY3R4LCB0aGlzLmV2ZW50cyk7XG4gICAgfVxuICAgIHRoaXMuY3JvcEFyZWEuc2V0TWluU2l6ZShjdXJNaW5TaXplKTtcbiAgICB0aGlzLmNyb3BBcmVhLnNldFNpemUoY3VyU2l6ZSk7XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRYKGN1clgpO1xuICAgIHRoaXMuY3JvcEFyZWEuc2V0WShjdXJZKTtcblxuICAgIC8vIHRoaXMucmVzZXRDcm9wSG9zdCgpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldEltYWdlKHRoaXMuaW1hZ2UpO1xuICAgIH1cbiAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICB9XG5cbiAgZ2V0QXJlYURldGFpbHMoKSA6IENyb3BBcmVhRGV0YWlscyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMuY3JvcEFyZWEuZ2V0WCgpLFxuICAgICAgeTogdGhpcy5jcm9wQXJlYS5nZXRZKCksXG4gICAgICBzaXplOiB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSxcbiAgICAgIGltYWdlOiB7d2lkdGg6IHRoaXMuY3JvcEFyZWEuZ2V0SW1hZ2UoKS53aWR0aCwgaGVpZ2h0OiB0aGlzLmNyb3BBcmVhLmdldEltYWdlKCkuaGVpZ2h0fSxcbiAgICAgIGNhbnZhczoge3dpZHRoOiB0aGlzLmN0eC5jYW52YXMud2lkdGgsIGhlaWdodDogdGhpcy5jdHguY2FudmFzLmhlaWdodH1cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldEVsZW1lbnRPZmZzZXQoZWxlbSkge1xuICAgIHZhciBib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgdmFyIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcDtcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbExlZnQgfHwgYm9keS5zY3JvbGxMZWZ0O1xuXG4gICAgdmFyIGNsaWVudFRvcCA9IGRvY0VsZW0uY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDA7XG4gICAgdmFyIGNsaWVudExlZnQgPSBkb2NFbGVtLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDA7XG5cbiAgICB2YXIgdG9wID0gYm94LnRvcCArIHNjcm9sbFRvcCAtIGNsaWVudFRvcDtcbiAgICB2YXIgbGVmdCA9IGJveC5sZWZ0ICsgc2Nyb2xsTGVmdCAtIGNsaWVudExlZnQ7XG5cbiAgICByZXR1cm4ge3RvcDogTWF0aC5yb3VuZCh0b3ApLCBsZWZ0OiBNYXRoLnJvdW5kKGxlZnQpfTtcbiAgfVxufSJdfQ==