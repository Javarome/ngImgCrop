(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div>\n  <label><input type=\"checkbox\" [(ngModel)]=\"enableCrop\"/> Add fcImgCrop to Page</label>\n</div>\n<div>\n  Container size: <label><input type=\"radio\" [(ngModel)]=\"size\" value=\"big\"/> Big</label> <label><input type=\"radio\"\n    [(ngModel)]=\"size\" value=\"medium\"/> Medium</label> <label><input type=\"radio\" [(ngModel)]=\"size\" value=\"small\"/>\n  Small</label>\n</div>\n<div>\n  Area type: <label><input type=\"radio\" [(ngModel)]=\"type\" value=\"circle\"/> Circle</label> <label><input type=\"radio\"\n    [(ngModel)]=\"type\" value=\"square\"/> Square</label>\n  <!--<label><input type=\"radio\" [(ngModel)]=\"type\" value=\"rectangle\" /> Rectangle</label>-->\n</div>\n<div>\n  <label><input type=\"checkbox\" [(ngModel)]=\"changeOnFly\"/> Change On Fly</label>\n</div>\n<!--\n<div>\n  <label>Aspect Ratio: <input type=\"text\" [(ngModel)]=\"aspectRatio\" /></label>\n</div>\n-->\n<div>\n  <label>Area Min Size (Size = Width = Height): <input type=\"text\" [(ngModel)]=\"selMinSize\"/></label>\n</div>\n<div>\n  <label>Result Image Size (Size = Width = Height): <input type=\"text\" [(ngModel)]=\"resImgSize\"/></label>\n</div>\n<div>\n  Result Image Format: <label><input type=\"radio\" [(ngModel)]=\"resultImageFormat\" value=\"image/jpeg\"/> image/jpeg</label>\n  <label><input type=\"radio\" [(ngModel)]=\"resultImageFormat\" value=\"image/png\"/> image/png</label> <label><input type=\"radio\"\n    [(ngModel)]=\"resultImageFormat\" value=\"image/webp\"/> image/webp</label>\n</div>\n<div>\n  <label>Result Image Quality (0<=X<=1): <input type=\"text\" [(ngModel)]=\"resultImgQuality\"/></label>\n</div>\n<form [hidden]=\"!enableCrop\">\n  <label for=\"fileInput\">Select Image:</label> <input type=\"file\" id=\"fileInput\"/>\n  <button type=\"reset\">Clear</button>\n  <button (click)=\"imageDataURI='test.jpg'\">Set Test Image</button>\n</form>\n<div>\n  <label>Image URL: <input type=\"text\" [(ngModel)]=\"edtImageURI\"/></label>\n  <button (click)=\"imageDataURI=edtImageURI\">Set Image</button>\n</div>\n<div>\n  <button (click)=\"imageDataURI=''\">Reset Image</button>\n</div>\n\n<div *ngIf=\"enableCrop\" class=\"cropArea\"\n    [ngClass]=\"{'big':size=='big', 'medium':size=='medium', 'small':size=='small'}\">\n  <fc-img-crop\n      [image]=\"imageDataURI\"\n      [(resultImage)]=\"resultImageDataURI\"\n      [(areaDetails)]=\"cropDetails\"\n      [changeOnFly]=\"changeOnFly\"\n      [areaType]=\"type\"\n      [areaMinSize]=\"selMinSize\"\n      [resultImageFormat]=\"resultImageFormat\"\n      [resultImageQuality]=\"resultImgQuality\"\n      [resultImageSize]=\"resImgSize\"\n      (onChange)=\"onChange($event)\"\n      (onLoadBegin)=\"onLoadBegin()\"\n      (onLoadDone)=\"onLoadDone()\"\n      (onLoadError)=\"onLoadError()\"\n  ></fc-img-crop>\n  <!--aspect-ratio=\"aspectRatio\"-->\n</div>\n\n<div style=\"text-align:center\">\n  <h3>Result</h3>\n  <div>\n    <img [src]=\"resultImageDataURI\"/>\n    <p>{{cropDetails | json}}</p>\n  </div>\n</div>\n"

/***/ }),

/***/ "./src/app/app.component.scss":
/*!************************************!*\
  !*** ./src/app/app.component.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".cropArea {\n  background: #E4E4E4;\n  margin: auto;\n  overflow: hidden; }\n  .cropArea.big {\n    width: 800px;\n    height: 600px; }\n  .cropArea.medium {\n    width: 500px;\n    height: 350px; }\n  .cropArea.small {\n    width: 300px;\n    height: 200px; }\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _fc_img_crop_classes_crop_area__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fc-img-crop/classes/crop-area */ "./src/app/fc-img-crop/classes/crop-area.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var Size;
(function (Size) {
    Size["Small"] = "small";
})(Size || (Size = {}));
var AppComponent = /** @class */ (function () {
    function AppComponent(ref) {
        this.ref = ref;
        this.enableCrop = true;
        this.size = Size.Small;
        this.type = _fc_img_crop_classes_crop_area__WEBPACK_IMPORTED_MODULE_1__["CropAreaType"].Circle;
        this.imageDataURI = '';
        this.resultImageDataURI = '';
        this.resultImageFormat = 'image/png';
        this.resultImgQuality = 1;
        this.selMinSize = 100;
        this.resImgSize = 200;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        //this.aspectRatio=1.2;
        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                _this.imageDataURI = evt.target.result;
                _this.ref.detectChanges();
            };
            reader.readAsDataURL(file);
        };
        document.querySelector('#fileInput').addEventListener('change', handleFileSelect);
    };
    AppComponent.prototype.onChange = function (change) {
        console.log('onChange fired', change);
    };
    AppComponent.prototype.onLoadBegin = function () {
        console.log('onLoadBegin fired');
    };
    AppComponent.prototype.onLoadDone = function () {
        console.log('onLoadDone fired');
    };
    AppComponent.prototype.onLoadError = function () {
        console.log('onLoadError fired');
    };
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.scss */ "./src/app/app.component.scss")]
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]])
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _fc_img_crop_fc_img_crop_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fc-img-crop/fc-img-crop.component */ "./src/app/fc-img-crop/fc-img-crop.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"],
                _fc_img_crop_fc_img_crop_component__WEBPACK_IMPORTED_MODULE_3__["FcImgCropComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormsModule"]
            ],
            providers: [],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-area-circle.ts":
/*!*********************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-area-circle.ts ***!
  \*********************************************************/
/*! exports provided: CropAreaCircle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropAreaCircle", function() { return CropAreaCircle; });
/* harmony import */ var _crop_area__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crop-area */ "./src/app/fc-img-crop/classes/crop-area.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var CropAreaCircle = /** @class */ (function (_super) {
    __extends(CropAreaCircle, _super);
    function CropAreaCircle(ctx, events) {
        var _this = _super.call(this, ctx, events) || this;
        _this._boxResizeBaseSize = 20;
        _this._boxResizeNormalRatio = 0.9;
        _this._boxResizeHoverRatio = 1.2;
        _this._iconMoveNormalRatio = 0.9;
        _this._iconMoveHoverRatio = 1.2;
        _this._posDragStartX = 0;
        _this._posDragStartY = 0;
        _this._posResizeStartX = 0;
        _this._posResizeStartY = 0;
        _this._posResizeStartSize = 0;
        _this._boxResizeIsHover = false;
        _this._areaIsHover = false;
        _this._boxResizeIsDragging = false;
        _this._areaIsDragging = false;
        _this._boxResizeNormalSize = _this._boxResizeBaseSize * _this._boxResizeNormalRatio;
        _this._boxResizeHoverSize = _this._boxResizeBaseSize * _this._boxResizeHoverRatio;
        return _this;
    }
    CropAreaCircle.prototype._calcCirclePerimeterCoords = function (angleDegrees) {
        var hSize = this._size / 2;
        var angleRadians = angleDegrees * (Math.PI / 180), circlePerimeterX = this._x + hSize * Math.cos(angleRadians), circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
        return [circlePerimeterX, circlePerimeterY];
    };
    CropAreaCircle.prototype._calcResizeIconCenterCoords = function () {
        return this._calcCirclePerimeterCoords(-45);
    };
    CropAreaCircle.prototype._isCoordWithinArea = function (coord) {
        return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
    };
    ;
    CropAreaCircle.prototype._isCoordWithinBoxResize = function (coord) {
        var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
        var hSize = this._boxResizeHoverSize / 2;
        return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
            coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
    };
    ;
    CropAreaCircle.prototype._drawArea = function (ctx, centerCoords, size) {
        ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
    };
    ;
    CropAreaCircle.prototype.draw = function () {
        _crop_area__WEBPACK_IMPORTED_MODULE_0__["CropArea"].prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        // draw resize cubes
        this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
    };
    ;
    CropAreaCircle.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
        var cursor = 'default';
        var res = false;
        this._boxResizeIsHover = false;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._boxResizeIsDragging) {
            cursor = 'nesw-resize';
            var iFR, iFX, iFY;
            iFX = mouseCurX - this._posResizeStartX;
            iFY = this._posResizeStartY - mouseCurY;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY * 2;
            }
            else {
                iFR = this._posResizeStartSize + iFX * 2;
            }
            this._size = Math.max(this._minSize, iFR);
            this._boxResizeIsHover = true;
            res = true;
            this._events.trigger('area-resize');
        }
        else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
            cursor = 'nesw-resize';
            this._areaIsHover = false;
            this._boxResizeIsHover = true;
            res = true;
        }
        else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
            cursor = 'move';
            this._areaIsHover = true;
            res = true;
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    };
    ;
    CropAreaCircle.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
        if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._boxResizeIsDragging = true;
            this._boxResizeIsHover = true;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._boxResizeIsDragging = false;
            this._boxResizeIsHover = false;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    };
    ;
    CropAreaCircle.prototype.processMouseUp = function ( /*mouseUpX, mouseUpY*/) {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._boxResizeIsDragging) {
            this._boxResizeIsDragging = false;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._boxResizeIsHover = false;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    };
    ;
    return CropAreaCircle;
}(_crop_area__WEBPACK_IMPORTED_MODULE_0__["CropArea"]));



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-area-square.ts":
/*!*********************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-area-square.ts ***!
  \*********************************************************/
/*! exports provided: CropAreaSquare */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropAreaSquare", function() { return CropAreaSquare; });
/* harmony import */ var _crop_area__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crop-area */ "./src/app/fc-img-crop/classes/crop-area.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var CropAreaSquare = /** @class */ (function (_super) {
    __extends(CropAreaSquare, _super);
    function CropAreaSquare(ctx, events) {
        var _this = _super.call(this, ctx, events) || this;
        _this._resizeCtrlBaseRadius = 10;
        _this._resizeCtrlNormalRatio = 0.75;
        _this._resizeCtrlHoverRatio = 1;
        _this._iconMoveNormalRatio = 0.9;
        _this._iconMoveHoverRatio = 1.2;
        _this._posDragStartX = 0;
        _this._posDragStartY = 0;
        _this._posResizeStartX = 0;
        _this._posResizeStartY = 0;
        _this._posResizeStartSize = 0;
        _this._resizeCtrlIsHover = -1;
        _this._areaIsHover = false;
        _this._resizeCtrlIsDragging = -1;
        _this._areaIsDragging = false;
        _this._resizeCtrlNormalRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlNormalRatio;
        _this._resizeCtrlHoverRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlHoverRatio;
        return _this;
    }
    ;
    CropAreaSquare.prototype._calcSquareCorners = function () {
        var hSize = this._size / 2;
        return [
            [this._x - hSize, this._y - hSize],
            [this._x + hSize, this._y - hSize],
            [this._x - hSize, this._y + hSize],
            [this._x + hSize, this._y + hSize]
        ];
    };
    CropAreaSquare.prototype._calcSquareDimensions = function () {
        var hSize = this._size / 2;
        return {
            left: this._x - hSize,
            top: this._y - hSize,
            right: this._x + hSize,
            bottom: this._y + hSize
        };
    };
    CropAreaSquare.prototype._isCoordWithinArea = function (coord) {
        var squareDimensions = this._calcSquareDimensions();
        return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
    };
    CropAreaSquare.prototype._isCoordWithinResizeCtrl = function (coord) {
        var resizeIconsCenterCoords = this._calcSquareCorners();
        var res = -1;
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                res = i;
                break;
            }
        }
        return res;
    };
    CropAreaSquare.prototype._drawArea = function (ctx, centerCoords, size) {
        var hSize = size / 2;
        ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
    };
    CropAreaSquare.prototype.draw = function () {
        _crop_area__WEBPACK_IMPORTED_MODULE_0__["CropArea"].prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        // draw resize cubes
        var resizeIconsCenterCoords = this._calcSquareCorners();
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
        }
    };
    CropAreaSquare.prototype.processMouseMove = function (mouseCurX, mouseCurY) {
        var cursor = 'default';
        var res = false;
        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._resizeCtrlIsDragging > -1) {
            var xMulti, yMulti;
            switch (this._resizeCtrlIsDragging) {
                case 0: // Top Left
                    xMulti = -1;
                    yMulti = -1;
                    cursor = 'nwse-resize';
                    break;
                case 1: // Top Right
                    xMulti = 1;
                    yMulti = -1;
                    cursor = 'nesw-resize';
                    break;
                case 2: // Bottom Left
                    xMulti = -1;
                    yMulti = 1;
                    cursor = 'nesw-resize';
                    break;
                case 3: // Bottom Right
                    xMulti = 1;
                    yMulti = 1;
                    cursor = 'nwse-resize';
                    break;
            }
            var iFX = (mouseCurX - this._posResizeStartX) * xMulti;
            var iFY = (mouseCurY - this._posResizeStartY) * yMulti;
            var iFR;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY;
            }
            else {
                iFR = this._posResizeStartSize + iFX;
            }
            var wasSize = this._size;
            this._size = Math.max(this._minSize, iFR);
            var posModifier = (this._size - wasSize) / 2;
            this._x += posModifier * xMulti;
            this._y += posModifier * yMulti;
            this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
            res = true;
            this._events.trigger('area-resize');
        }
        else {
            var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
            if (hoveredResizeBox > -1) {
                switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                }
                this._areaIsHover = false;
                this._resizeCtrlIsHover = hoveredResizeBox;
                res = true;
            }
            else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    };
    CropAreaSquare.prototype.processMouseDown = function (mouseDownX, mouseDownY) {
        var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
        if (isWithinResizeCtrl > -1) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = isWithinResizeCtrl;
            this._resizeCtrlIsHover = isWithinResizeCtrl;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._resizeCtrlIsDragging = -1;
            this._resizeCtrlIsHover = -1;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    };
    CropAreaSquare.prototype.processMouseUp = function ( /*mouseUpX, mouseUpY*/) {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._resizeCtrlIsDragging > -1) {
            this._resizeCtrlIsDragging = -1;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = -1;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    };
    return CropAreaSquare;
}(_crop_area__WEBPACK_IMPORTED_MODULE_0__["CropArea"]));



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-area.ts":
/*!**************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-area.ts ***!
  \**************************************************/
/*! exports provided: CropAreaType, CropArea */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropAreaType", function() { return CropAreaType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropArea", function() { return CropArea; });
/* harmony import */ var _crop_canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crop-canvas */ "./src/app/fc-img-crop/classes/crop-canvas.ts");

var CropAreaType;
(function (CropAreaType) {
    CropAreaType["Square"] = "square";
    CropAreaType["Circle"] = "circle";
})(CropAreaType || (CropAreaType = {}));
var CropArea = /** @class */ (function () {
    function CropArea(_ctx, _events) {
        this._ctx = _ctx;
        this._events = _events;
        this._minSize = 80;
        this._image = new Image();
        this._x = 0;
        this._y = 0;
        this._size = 200;
        this._cropCanvas = new _crop_canvas__WEBPACK_IMPORTED_MODULE_0__["CropCanvas"](_ctx);
    }
    CropArea.prototype.getImage = function () {
        return this._image;
    };
    CropArea.prototype.setImage = function (image) {
        this._image = image;
    };
    ;
    CropArea.prototype.getX = function () {
        return this._x;
    };
    ;
    CropArea.prototype.setX = function (x) {
        this._x = x;
        this._dontDragOutside();
    };
    ;
    CropArea.prototype.getY = function () {
        return this._y;
    };
    ;
    CropArea.prototype.setY = function (y) {
        this._y = y;
        this._dontDragOutside();
    };
    ;
    CropArea.prototype.getSize = function () {
        return this._size;
    };
    ;
    CropArea.prototype.setSize = function (size) {
        this._size = Math.max(this._minSize, size);
        this._dontDragOutside();
    };
    ;
    CropArea.prototype.getMinSize = function () {
        return this._minSize;
    };
    ;
    CropArea.prototype.setMinSize = function (size) {
        this._minSize = size;
        this._size = Math.max(this._minSize, this._size);
        this._dontDragOutside();
    };
    ;
    CropArea.prototype._dontDragOutside = function () {
        var h = this._ctx.canvas.height, w = this._ctx.canvas.width;
        if (this._size > w) {
            this._size = w;
        }
        if (this._size > h) {
            this._size = h;
        }
        if (this._x < this._size / 2) {
            this._x = this._size / 2;
        }
        if (this._x > w - this._size / 2) {
            this._x = w - this._size / 2;
        }
        if (this._y < this._size / 2) {
            this._y = this._size / 2;
        }
        if (this._y > h - this._size / 2) {
            this._y = h - this._size / 2;
        }
    };
    ;
    CropArea.prototype.draw = function () {
        this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
    };
    ;
    return CropArea;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-canvas.ts":
/*!****************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-canvas.ts ***!
  \****************************************************/
/*! exports provided: CropCanvas */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropCanvas", function() { return CropCanvas; });
var CropCanvas = /** @class */ (function () {
    function CropCanvas(ctx) {
        this.ctx = ctx;
        // Shape = Array of [x,y]; [0, 0] - center
        this.shapeArrowNW = [[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
        this.shapeArrowNE = [[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
        this.shapeArrowSW = [[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
        this.shapeArrowSE = [[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
        this.shapeArrowN = [[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
        this.shapeArrowW = [[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
        this.shapeArrowS = [[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
        this.shapeArrowE = [[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];
        // Colors
        this.colors = {
            areaOutline: '#fff',
            resizeBoxStroke: '#fff',
            resizeBoxFill: '#444',
            resizeBoxArrowFill: '#fff',
            resizeCircleStroke: '#fff',
            resizeCircleFill: '#444',
            moveIconFill: '#fff'
        };
    }
    // Calculate Point
    CropCanvas.prototype.calcPoint = function (point, offset, scale) {
        return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
    };
    ;
    // Draw Filled Polygon
    CropCanvas.prototype.drawFilledPolygon = function (shape, fillStyle, centerCoords, scale) {
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        var pc, pc0 = this.calcPoint(shape[0], centerCoords, scale);
        this.ctx.moveTo(pc0[0], pc0[1]);
        for (var p in shape) {
            var pNum = parseInt(p, 10);
            if (pNum > 0) {
                pc = this.calcPoint(shape[pNum], centerCoords, scale);
                this.ctx.lineTo(pc[0], pc[1]);
            }
        }
        this.ctx.lineTo(pc0[0], pc0[1]);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    };
    ;
    /* Icons */
    CropCanvas.prototype.drawIconMove = function (centerCoords, scale) {
        this.drawFilledPolygon(this.shapeArrowN, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowW, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowS, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowE, this.colors.moveIconFill, centerCoords, scale);
    };
    CropCanvas.prototype.drawIconResizeCircle = function (centerCoords, circleRadius, scale) {
        var scaledCircleRadius = circleRadius * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeCircleStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeCircleFill;
        this.ctx.beginPath();
        this.ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    };
    CropCanvas.prototype.drawIconResizeBoxBase = function (centerCoords, boxSize, scale) {
        var scaledBoxSize = boxSize * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeBoxStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeBoxFill;
        this.ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.restore();
    };
    CropCanvas.prototype.drawIconResizeBoxNESW = function (centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNE, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSW, this.colors.resizeBoxArrowFill, centerCoords, scale);
    };
    CropCanvas.prototype.drawIconResizeBoxNWSE = function (centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNW, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSE, this.colors.resizeBoxArrowFill, centerCoords, scale);
    };
    /* Crop Area */
    CropCanvas.prototype.drawCropArea = function (image, centerCoords, size, fnDrawClipPath) {
        var xRatio = image.width / this.ctx.canvas.width, yRatio = image.height / this.ctx.canvas.height, xLeft = centerCoords[0] - size / 2, yTop = centerCoords[1] - size / 2;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.areaOutline;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        // draw part of original image
        if (size > 0) {
            this.ctx.drawImage(image, xLeft * xRatio, yTop * yRatio, size * xRatio, size * yRatio, xLeft, yTop, size, size);
        }
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.restore();
    };
    ;
    return CropCanvas;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-exif.ts":
/*!**************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-exif.ts ***!
  \**************************************************/
/*! exports provided: CropEXIF */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropEXIF", function() { return CropEXIF; });
/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */
var CropEXIF = /** @class */ (function () {
    function CropEXIF() {
    }
    CropEXIF.readIPTCData = function (file, startOffset, sectionLength) {
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while (segmentStartPos < startOffset + sectionLength) {
            if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
                segmentType = dataView.getUint8(segmentStartPos + 2);
                if (segmentType in CropEXIF.IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos + 3);
                    segmentSize = dataSize + 5;
                    fieldName = CropEXIF.IptcFieldMap[segmentType];
                    fieldValue = CropEXIF.getStringFromDB(dataView, segmentStartPos + 5, dataSize);
                    // Check if we already stored a value with this name
                    if (data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if (data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }
            }
            segmentStartPos++;
        }
        return data;
    };
    CropEXIF.readTags = function (file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd), tags = {}, entryOffset, tag, i;
        for (i = 0; i < entries; i++) {
            entryOffset = dirStart + i * 12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (tag) {
                tags[tag] = CropEXIF.readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            else {
                console.warn('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd));
            }
        }
        return tags;
    };
    CropEXIF.readTagValue = function (file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset + 2, !bigEnd), numValues = file.getUint32(entryOffset + 4, !bigEnd), valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart, offset, vals, val, n, numerator, denominator;
        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                }
                else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }
            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return this.getStringFromDB(file, offset, numValues - 1);
            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                }
                else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                    }
                    return vals;
                }
            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }
            case 5: // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset + 4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
                        denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }
            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }
            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset + 4, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 8 * n, !bigEnd) / file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
                    }
                    return vals;
                }
        }
    };
    CropEXIF.addEvent = function (element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    };
    CropEXIF.objectURLToBlob = function (url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function (e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    };
    CropEXIF.handleBinaryFile = function (binFile, img, callback) {
        var data = CropEXIF.findEXIFinJPEG(binFile);
        var iptcdata = CropEXIF.findIPTCinJPEG(binFile);
        img.exifdata = data || {};
        img.iptcdata = iptcdata || {};
        if (callback) {
            callback.call(img);
        }
    };
    CropEXIF.getImageData = function (img, callback) {
        var _this = this;
        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = CropEXIF.base64ToArrayBuffer(img.src);
                this.handleBinaryFile(arrayBuffer, img, callback);
            }
            else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    _this.handleBinaryFile(e.target.result, img, callback);
                };
                CropEXIF.objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            }
            else {
                var http = new XMLHttpRequest();
                var self_1 = this;
                http.onload = function () {
                    if (this.status == 200 || this.status === 0) {
                        self_1.handleBinaryFile(http.response, img, callback);
                    }
                    else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        }
        else if (FileReader && (img instanceof window.Blob || img instanceof File)) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                console.debug('getImageData: Got file of length %o', e.target.result.byteLength);
                _this.handleBinaryFile(e.target.result, img, callback);
            };
            fileReader.readAsArrayBuffer(img);
        }
    };
    CropEXIF.getStringFromDB = function (buffer, start, length) {
        var outstr = "";
        for (var n = start; n < start + length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    };
    CropEXIF.readEXIFData = function (file, start) {
        if (this.getStringFromDB(file, start, 4) != "Exif") {
            console.error("Not valid EXIF data! " + this.getStringFromDB(file, start, 4));
            return false;
        }
        var bigEnd, tags, exifData, gpsData, tiffOffset = start + 6;
        var tag;
        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        }
        else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        }
        else {
            console.error("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }
        if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
            console.error("Not valid TIFF data! (no 0x002A)");
            return false;
        }
        var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);
        if (firstIFDOffset < 0x00000008) {
            console.error("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset + 4, !bigEnd));
            return false;
        }
        tags = CropEXIF.readTags(file, tiffOffset, tiffOffset + firstIFDOffset, this.TiffTags, bigEnd);
        if (tags.ExifIFDPointer) {
            exifData = CropEXIF.readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, this.ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource":
                    case "Flash":
                    case "MeteringMode":
                    case "ExposureProgram":
                    case "SensingMethod":
                    case "SceneCaptureType":
                    case "SceneType":
                    case "CustomRendered":
                    case "WhiteBalance":
                    case "GainControl":
                    case "Contrast":
                    case "Saturation":
                    case "Sharpness":
                    case "SubjectDistanceRange":
                    case "FileSource":
                        exifData[tag] = this.StringValues[tag][exifData[tag]];
                        break;
                    case "ExifVersion":
                    case "FlashpixVersion":
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;
                    case "ComponentsConfiguration":
                        exifData[tag] =
                            this.StringValues.Components[exifData[tag][0]] +
                                this.StringValues.Components[exifData[tag][1]] +
                                this.StringValues.Components[exifData[tag][2]] +
                                this.StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }
        if (tags.GPSInfoIFDPointer) {
            gpsData = this.readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, this.GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID":
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }
        return tags;
    };
    CropEXIF.getData = function (img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete)
            return false;
        if (!this.imageHasData(img)) {
            CropEXIF.getImageData(img, callback);
        }
        else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    };
    ;
    CropEXIF.getTag = function (img, tag) {
        if (!this.imageHasData(img))
            return;
        return img.exifdata[tag];
    };
    ;
    CropEXIF.getAllTags = function (img) {
        if (!this.imageHasData(img))
            return {};
        var a, data = img.exifdata, tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    };
    ;
    CropEXIF.pretty = function (img) {
        if (!this.imageHasData(img))
            return "";
        var a, data = img.exifdata, strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    }
                    else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                }
                else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    };
    CropEXIF.findEXIFinJPEG = function (file) {
        var dataView = new DataView(file);
        var maxOffset = dataView.byteLength - 4;
        console.debug('findEXIFinJPEG: Got file of length %o', file.byteLength);
        if (dataView.getUint16(0) !== 0xffd8) {
            console.warn('Not a valid JPEG');
            return false; // not a valid jpeg
        }
        var offset = 2;
        var marker;
        function readByte() {
            var someByte = dataView.getUint8(offset);
            offset++;
            return someByte;
        }
        function readWord() {
            var someWord = dataView.getUint16(offset);
            offset = offset + 2;
            return someWord;
        }
        while (offset < maxOffset) {
            var someByte = readByte();
            if (someByte != 0xFF) {
                console.error('Not a valid marker at offset ' + offset + ", found: " + someByte);
                return false; // not a valid marker, something is wrong
            }
            marker = readByte();
            console.debug('Marker=%o', marker);
            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data
            var segmentLength = readWord() - 2;
            switch (marker) {
                case 0xE1:
                    return this.readEXIFData(dataView, offset /*, segmentLength*/);
                case 0xE0: // JFIF
                default:
                    offset += segmentLength;
            }
        }
    };
    CropEXIF.findIPTCinJPEG = function (file) {
        var dataView = new DataView(file);
        console.debug('Got file of length ' + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            console.warn('Not a valid JPEG');
            return false; // not a valid jpeg
        }
        var offset = 2, length = file.byteLength;
        var isFieldSegmentStart = function (dataView, offset) {
            return (dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset + 1) === 0x42 &&
                dataView.getUint8(offset + 2) === 0x49 &&
                dataView.getUint8(offset + 3) === 0x4D &&
                dataView.getUint8(offset + 4) === 0x04 &&
                dataView.getUint8(offset + 5) === 0x04);
        };
        while (offset < length) {
            if (isFieldSegmentStart(dataView, offset)) {
                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset + 7);
                if (nameHeaderLength % 2 !== 0)
                    nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if (nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }
                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);
                return this.readIPTCData(file, startOffset, sectionLength);
            }
            // Not the marker, continue searching
            offset++;
        }
    };
    CropEXIF.readFromBinaryFile = function (file) {
        return this.findEXIFinJPEG(file);
    };
    CropEXIF.imageHasData = function (img) {
        return !!(img.exifdata);
    };
    CropEXIF.base64ToArrayBuffer = function (base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    };
    CropEXIF.ExifTags = {
        // version tags
        0x9000: "ExifVersion",
        0xA000: "FlashpixVersion",
        // colorspace tags
        0xA001: "ColorSpace",
        // image configuration
        0xA002: "PixelXDimension",
        0xA003: "PixelYDimension",
        0x9101: "ComponentsConfiguration",
        0x9102: "CompressedBitsPerPixel",
        // user information
        0x927C: "MakerNote",
        0x9286: "UserComment",
        // related file
        0xA004: "RelatedSoundFile",
        // date and time
        0x9003: "DateTimeOriginal",
        0x9004: "DateTimeDigitized",
        0x9290: "SubsecTime",
        0x9291: "SubsecTimeOriginal",
        0x9292: "SubsecTimeDigitized",
        // picture-taking conditions
        0x829A: "ExposureTime",
        0x829D: "FNumber",
        0x8822: "ExposureProgram",
        0x8824: "SpectralSensitivity",
        0x8827: "ISOSpeedRatings",
        0x8828: "OECF",
        0x9201: "ShutterSpeedValue",
        0x9202: "ApertureValue",
        0x9203: "BrightnessValue",
        0x9204: "ExposureBias",
        0x9205: "MaxApertureValue",
        0x9206: "SubjectDistance",
        0x9207: "MeteringMode",
        0x9208: "LightSource",
        0x9209: "Flash",
        0x9214: "SubjectArea",
        0x920A: "FocalLength",
        0xA20B: "FlashEnergy",
        0xA20C: "SpatialFrequencyResponse",
        0xA20E: "FocalPlaneXResolution",
        0xA20F: "FocalPlaneYResolution",
        0xA210: "FocalPlaneResolutionUnit",
        0xA214: "SubjectLocation",
        0xA215: "ExposureIndex",
        0xA217: "SensingMethod",
        0xA300: "FileSource",
        0xA301: "SceneType",
        0xA302: "CFAPattern",
        0xA401: "CustomRendered",
        0xA402: "ExposureMode",
        0xA403: "WhiteBalance",
        0xA404: "DigitalZoomRation",
        0xA405: "FocalLengthIn35mmFilm",
        0xA406: "SceneCaptureType",
        0xA407: "GainControl",
        0xA408: "Contrast",
        0xA409: "Saturation",
        0xA40A: "Sharpness",
        0xA40B: "DeviceSettingDescription",
        0xA40C: "SubjectDistanceRange",
        // other tags
        0xA005: "InteroperabilityIFDPointer",
        0xA420: "ImageUniqueID" // Identifier assigned uniquely to each image
    };
    CropEXIF.TiffTags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x8769: "ExifIFDPointer",
        0x8825: "GPSInfoIFDPointer",
        0xA005: "InteroperabilityIFDPointer",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        0x0106: "PhotometricInterpretation",
        0x0112: "Orientation",
        0x0115: "SamplesPerPixel",
        0x011C: "PlanarConfiguration",
        0x0212: "YCbCrSubSampling",
        0x0213: "YCbCrPositioning",
        0x011A: "XResolution",
        0x011B: "YResolution",
        0x0128: "ResolutionUnit",
        0x0111: "StripOffsets",
        0x0116: "RowsPerStrip",
        0x0117: "StripByteCounts",
        0x0201: "JPEGInterchangeFormat",
        0x0202: "JPEGInterchangeFormatLength",
        0x012D: "TransferFunction",
        0x013E: "WhitePoint",
        0x013F: "PrimaryChromaticities",
        0x0211: "YCbCrCoefficients",
        0x0214: "ReferenceBlackWhite",
        0x0132: "DateTime",
        0x010E: "ImageDescription",
        0x010F: "Make",
        0x0110: "Model",
        0x0131: "Software",
        0x013B: "Artist",
        0x8298: "Copyright"
    };
    CropEXIF.GPSTags = {
        0x0000: "GPSVersionID",
        0x0001: "GPSLatitudeRef",
        0x0002: "GPSLatitude",
        0x0003: "GPSLongitudeRef",
        0x0004: "GPSLongitude",
        0x0005: "GPSAltitudeRef",
        0x0006: "GPSAltitude",
        0x0007: "GPSTimeStamp",
        0x0008: "GPSSatellites",
        0x0009: "GPSStatus",
        0x000A: "GPSMeasureMode",
        0x000B: "GPSDOP",
        0x000C: "GPSSpeedRef",
        0x000D: "GPSSpeed",
        0x000E: "GPSTrackRef",
        0x000F: "GPSTrack",
        0x0010: "GPSImgDirectionRef",
        0x0011: "GPSImgDirection",
        0x0012: "GPSMapDatum",
        0x0013: "GPSDestLatitudeRef",
        0x0014: "GPSDestLatitude",
        0x0015: "GPSDestLongitudeRef",
        0x0016: "GPSDestLongitude",
        0x0017: "GPSDestBearingRef",
        0x0018: "GPSDestBearing",
        0x0019: "GPSDestDistanceRef",
        0x001A: "GPSDestDistance",
        0x001B: "GPSProcessingMethod",
        0x001C: "GPSAreaInformation",
        0x001D: "GPSDateStamp",
        0x001E: "GPSDifferential"
    };
    CropEXIF.StringValues = {
        ExposureProgram: {
            0: "Not defined",
            1: "Manual",
            2: "Normal program",
            3: "Aperture priority",
            4: "Shutter priority",
            5: "Creative program",
            6: "Action program",
            7: "Portrait mode",
            8: "Landscape mode"
        },
        MeteringMode: {
            0: "Unknown",
            1: "Average",
            2: "CenterWeightedAverage",
            3: "Spot",
            4: "MultiSpot",
            5: "Pattern",
            6: "Partial",
            255: "Other"
        },
        LightSource: {
            0: "Unknown",
            1: "Daylight",
            2: "Fluorescent",
            3: "Tungsten (incandescent light)",
            4: "Flash",
            9: "Fine weather",
            10: "Cloudy weather",
            11: "Shade",
            12: "Daylight fluorescent (D 5700 - 7100K)",
            13: "Day white fluorescent (N 4600 - 5400K)",
            14: "Cool white fluorescent (W 3900 - 4500K)",
            15: "White fluorescent (WW 3200 - 3700K)",
            17: "Standard light A",
            18: "Standard light B",
            19: "Standard light C",
            20: "D55",
            21: "D65",
            22: "D75",
            23: "D50",
            24: "ISO studio tungsten",
            255: "Other"
        },
        Flash: {
            0x0000: "Flash did not fire",
            0x0001: "Flash fired",
            0x0005: "Strobe return light not detected",
            0x0007: "Strobe return light detected",
            0x0009: "Flash fired, compulsory flash mode",
            0x000D: "Flash fired, compulsory flash mode, return light not detected",
            0x000F: "Flash fired, compulsory flash mode, return light detected",
            0x0010: "Flash did not fire, compulsory flash mode",
            0x0018: "Flash did not fire, auto mode",
            0x0019: "Flash fired, auto mode",
            0x001D: "Flash fired, auto mode, return light not detected",
            0x001F: "Flash fired, auto mode, return light detected",
            0x0020: "No flash function",
            0x0041: "Flash fired, red-eye reduction mode",
            0x0045: "Flash fired, red-eye reduction mode, return light not detected",
            0x0047: "Flash fired, red-eye reduction mode, return light detected",
            0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059: "Flash fired, auto mode, red-eye reduction mode",
            0x005D: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F: "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod: {
            1: "Not defined",
            2: "One-chip color area sensor",
            3: "Two-chip color area sensor",
            4: "Three-chip color area sensor",
            5: "Color sequential area sensor",
            7: "Trilinear sensor",
            8: "Color sequential linear sensor"
        },
        SceneCaptureType: {
            0: "Standard",
            1: "Landscape",
            2: "Portrait",
            3: "Night scene"
        },
        SceneType: {
            1: "Directly photographed"
        },
        CustomRendered: {
            0: "Normal process",
            1: "Custom process"
        },
        WhiteBalance: {
            0: "Auto white balance",
            1: "Manual white balance"
        },
        GainControl: {
            0: "None",
            1: "Low gain up",
            2: "High gain up",
            3: "Low gain down",
            4: "High gain down"
        },
        Contrast: {
            0: "Normal",
            1: "Soft",
            2: "Hard"
        },
        Saturation: {
            0: "Normal",
            1: "Low saturation",
            2: "High saturation"
        },
        Sharpness: {
            0: "Normal",
            1: "Soft",
            2: "Hard"
        },
        SubjectDistanceRange: {
            0: "Unknown",
            1: "Macro",
            2: "Close view",
            3: "Distant view"
        },
        FileSource: {
            3: "DSC"
        },
        Components: {
            0: "",
            1: "Y",
            2: "Cb",
            3: "Cr",
            4: "R",
            5: "G",
            6: "B"
        }
    };
    CropEXIF.IptcFieldMap = {
        0x78: 'caption',
        0x6E: 'credit',
        0x19: 'keywords',
        0x37: 'dateCreated',
        0x50: 'byline',
        0x55: 'bylineTitle',
        0x7A: 'captionWriter',
        0x69: 'headline',
        0x74: 'copyright',
        0x0F: 'category'
    };
    return CropEXIF;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-host.ts":
/*!**************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-host.ts ***!
  \**************************************************/
/*! exports provided: CropHost */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropHost", function() { return CropHost; });
/* harmony import */ var _crop_exif__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./crop-exif */ "./src/app/fc-img-crop/classes/crop-exif.ts");
/* harmony import */ var _crop_area_circle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./crop-area-circle */ "./src/app/fc-img-crop/classes/crop-area-circle.ts");
/* harmony import */ var _crop_area_square__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./crop-area-square */ "./src/app/fc-img-crop/classes/crop-area-square.ts");
/* harmony import */ var _crop_area__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./crop-area */ "./src/app/fc-img-crop/classes/crop-area.ts");




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
        this.cropArea = new _crop_area_circle__WEBPACK_IMPORTED_MODULE_1__["CropAreaCircle"](this.ctx, events);
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        elCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('touchmove', this.onMouseMove.bind(this));
        elCanvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        document.addEventListener('touchend', this.onMouseUp.bind(this));
    }
    CropHost.prototype.destroy = function () {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseMove);
        document.removeEventListener('touchmove', this.onMouseMove);
        this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
        document.removeEventListener('touchend', this.onMouseMove);
        this.elCanvas.remove();
    };
    CropHost.prototype.drawScene = function () {
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
    CropHost.prototype.resetCropHost = function (cw, ch) {
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
    CropHost.getChangedTouches = function (event) {
        return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
    };
    CropHost.prototype.onMouseMove = function (e) {
        if (this.image !== null) {
            var offset = CropHost.getElementOffset(this.ctx.canvas), pageX, pageY;
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
    CropHost.prototype.onMouseDown = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.image !== null) {
            var offset = CropHost.getElementOffset(this.ctx.canvas), pageX, pageY;
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
    CropHost.prototype.onMouseUp = function (e) {
        if (this.image !== null) {
            var offset = CropHost.getElementOffset(this.ctx.canvas), pageX, pageY;
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
    CropHost.prototype.getResultImageDataURI = function () {
        var temp_canvas = document.createElement('CANVAS');
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
    CropHost.prototype.redraw = function () {
        this.drawScene();
    };
    CropHost.prototype.setNewImageSource = function (imageSource) {
        var _this = this;
        this.image = null;
        this.resetCropHost();
        this.events.trigger('image-updated');
        if (!!imageSource) {
            var newImage = new Image();
            if (imageSource.substring(0, 4).toLowerCase() === 'http') {
                newImage.crossOrigin = 'anonymous';
            }
            var self_1 = this;
            newImage.onload = function () {
                self_1.events.trigger('load-done');
                _crop_exif__WEBPACK_IMPORTED_MODULE_0__["CropEXIF"].getData(newImage, function () {
                    var orientation = _crop_exif__WEBPACK_IMPORTED_MODULE_0__["CropEXIF"].getTag(newImage, 'Orientation');
                    var cw = newImage.width, ch = newImage.height, cx = 0, cy = 0, deg = 0;
                    function imageDone() {
                        console.debug('dims=' + cw + 'x' + ch);
                        var canvasDims = self_1.resetCropHost(cw, ch);
                        self_1.setMaxDimensions(canvasDims[0], canvasDims[1]);
                        self_1.events.trigger('image-updated');
                        self_1.events.trigger('image-ready');
                    }
                    if ([3, 6, 8].indexOf(orientation) >= 0) {
                        var canvas = document.createElement("canvas");
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
    CropHost.prototype.setMaxDimensions = function (width, height) {
        console.debug('setMaxDimensions(' + width + ', ' + height + ')');
        if (this.image !== null) {
            var curWidth = this.ctx.canvas.width, curHeight = this.ctx.canvas.height;
            var ratioNewCurWidth = this.ctx.canvas.width / curWidth, ratioNewCurHeight = this.ctx.canvas.height / curHeight, ratioMin = Math.min(ratioNewCurWidth, ratioNewCurHeight);
        }
        this.maxCanvasDims = [width, height];
        return this.resetCropHost(width, height);
    };
    CropHost.prototype.setAreaMinSize = function (size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.cropArea.setMinSize(size);
            this.drawScene();
        }
    };
    CropHost.prototype.setResultImageSize = function (size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.resultImageSize = size;
        }
    };
    CropHost.prototype.setResultImageFormat = function (format) {
        this.resultImageFormat = format;
    };
    CropHost.prototype.setResultImageQuality = function (quality) {
        quality = parseFloat(quality);
        if (!isNaN(quality) && quality >= 0 && quality <= 1) {
            this.resultImageQuality = quality;
        }
    };
    CropHost.prototype.setAreaType = function (type) {
        var curSize = this.cropArea.getSize(), curMinSize = this.cropArea.getMinSize(), curX = this.cropArea.getX(), curY = this.cropArea.getY();
        if (type === _crop_area__WEBPACK_IMPORTED_MODULE_3__["CropAreaType"].Square) {
            this.cropArea = new _crop_area_square__WEBPACK_IMPORTED_MODULE_2__["CropAreaSquare"](this.ctx, this.events);
        }
        else {
            this.cropArea = new _crop_area_circle__WEBPACK_IMPORTED_MODULE_1__["CropAreaCircle"](this.ctx, this.events);
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
    CropHost.prototype.getAreaDetails = function () {
        return {
            x: this.cropArea.getX(),
            y: this.cropArea.getY(),
            size: this.cropArea.getSize(),
            image: { width: this.cropArea.getImage().width, height: this.cropArea.getImage().height },
            canvas: { width: this.ctx.canvas.width, height: this.ctx.canvas.height }
        };
    };
    CropHost.getElementOffset = function (elem) {
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docElem = document.documentElement;
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    };
    return CropHost;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/classes/crop-pubsub.ts":
/*!****************************************************!*\
  !*** ./src/app/fc-img-crop/classes/crop-pubsub.ts ***!
  \****************************************************/
/*! exports provided: CropPubSub */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CropPubSub", function() { return CropPubSub; });
var CropPubSub = /** @class */ (function () {
    function CropPubSub() {
        this.events = {};
    }
    CropPubSub.prototype.on = function (names, handler) {
        var _this = this;
        names.split(' ').forEach(function (name) {
            if (!_this.events[name]) {
                _this.events[name] = [];
            }
            _this.events[name].push(handler);
        });
        return this;
    };
    ;
    // Publish
    CropPubSub.prototype.trigger = function (name, args) {
        var listeners = this.events[name];
        if (listeners) {
            listeners.forEach(function (handler) {
                handler.call(null, args);
            });
        }
        return this;
    };
    ;
    return CropPubSub;
}());



/***/ }),

/***/ "./src/app/fc-img-crop/fc-img-crop.component.scss":
/*!********************************************************!*\
  !*** ./src/app/fc-img-crop/fc-img-crop.component.scss ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ":host {\n  width: 100%;\n  height: 100%;\n  display: block;\n  position: relative;\n  overflow: hidden; }\n  :host canvas {\n    display: block;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-tap-highlight-color: rgba(255, 255, 255, 0);\n    /* mobile webkit */ }\n"

/***/ }),

/***/ "./src/app/fc-img-crop/fc-img-crop.component.ts":
/*!******************************************************!*\
  !*** ./src/app/fc-img-crop/fc-img-crop.component.ts ***!
  \******************************************************/
/*! exports provided: FcImgCropComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FcImgCropComponent", function() { return FcImgCropComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _classes_crop_pubsub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./classes/crop-pubsub */ "./src/app/fc-img-crop/classes/crop-pubsub.ts");
/* harmony import */ var _classes_crop_host__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./classes/crop-host */ "./src/app/fc-img-crop/classes/crop-host.ts");
/* harmony import */ var _classes_crop_area__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./classes/crop-area */ "./src/app/fc-img-crop/classes/crop-area.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var FcImgCropComponent = /** @class */ (function () {
    function FcImgCropComponent(el, ref) {
        this.el = el;
        this.ref = ref;
        this.resultImageChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.areaDetailsChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onChange = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onLoadBegin = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onLoadDone = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onLoadError = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onImageReady = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.events = new _classes_crop_pubsub__WEBPACK_IMPORTED_MODULE_1__["CropPubSub"]();
    }
    FcImgCropComponent.prototype.ngOnInit = function () {
        var events = this.events;
        // Init Crop Host
        var el = this.el.nativeElement.querySelector('canvas');
        this.cropHost = new _classes_crop_host__WEBPACK_IMPORTED_MODULE_2__["CropHost"](el, {}, events);
        // Setup CropHost Event Handlers
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
    FcImgCropComponent.prototype.updateResultImage = function () {
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
    FcImgCropComponent.prototype.ngOnDestroy = function () {
        this.cropHost.destroy();
    };
    /**
     * Sync CropHost with Directive's options
     */
    FcImgCropComponent.prototype.ngOnChanges = function (changes) {
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
    };
    FcImgCropComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                    _this.cropHost.setMaxDimensions(_this.el.nativeElement.clientWidth, _this.el.nativeElement.clientHeight);
                    _this.updateResultImage();
                }
            });
        });
        var config = { attributes: true, childList: true, characterData: true };
        this.observer.observe(this.el.nativeElement, config);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "image", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "resultImage", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "resultImageChange", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "changeOnFly", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", String)
    ], FcImgCropComponent.prototype, "areaType", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "areaMinSize", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "areaDetails", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "areaDetailsChange", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "resultImageSize", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", String)
    ], FcImgCropComponent.prototype, "resultImageFormat", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "resultImageQuality", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "onChange", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "onLoadBegin", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "onLoadDone", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "onLoadError", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], FcImgCropComponent.prototype, "onImageReady", void 0);
    FcImgCropComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'fc-img-crop',
            template: '<canvas></canvas>',
            styles: [__webpack_require__(/*! ./fc-img-crop.component.scss */ "./src/app/fc-img-crop/fc-img-crop.component.scss")]
        }),
        __metadata("design:paramtypes", [_angular_core__WEBPACK_IMPORTED_MODULE_0__["ElementRef"], _angular_core__WEBPACK_IMPORTED_MODULE_0__["ChangeDetectorRef"]])
    ], FcImgCropComponent);
    return FcImgCropComponent;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/javarome/Repository/ngImgCrop/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map