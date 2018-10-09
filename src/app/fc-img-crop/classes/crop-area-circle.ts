import {CropArea} from "./crop-area";

export class CropAreaCircle extends CropArea {
  _boxResizeBaseSize = 20;
  _boxResizeNormalRatio = 0.9;
  _boxResizeHoverRatio = 1.2;
  _iconMoveNormalRatio = 0.9;
  _iconMoveHoverRatio = 1.2;

  _posDragStartX = 0;
  _posDragStartY = 0;
  _posResizeStartX = 0;
  _posResizeStartY = 0;
  _posResizeStartSize = 0;

  _boxResizeIsHover = false;
  _areaIsHover = false;
  _boxResizeIsDragging = false;
  _areaIsDragging = false;

  private _boxResizeNormalSize: number;
  private _boxResizeHoverSize: number;

  constructor(ctx, events) {
    super(ctx, events);

    this._boxResizeNormalSize = this._boxResizeBaseSize * this._boxResizeNormalRatio;
    this._boxResizeHoverSize = this._boxResizeBaseSize * this._boxResizeHoverRatio;
  }

  _calcCirclePerimeterCoords(angleDegrees) {
    var hSize = this._size / 2;
    var angleRadians = angleDegrees * (Math.PI / 180),
      circlePerimeterX = this._x + hSize * Math.cos(angleRadians),
      circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
    return [circlePerimeterX, circlePerimeterY];
  }

  _calcResizeIconCenterCoords() {
    return this._calcCirclePerimeterCoords(-45);
  }

  _isCoordWithinArea(coord) {
    return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
  };

  _isCoordWithinBoxResize(coord) {
    var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
    var hSize = this._boxResizeHoverSize / 2;
    return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
      coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
  };

  _drawArea(ctx, centerCoords, size) {
    ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
  };

  draw() {
    CropArea.prototype.draw.apply(this, arguments);

    // draw move icon
    this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);

    // draw resize cubes
    this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
  };

  processMouseMove(mouseCurX, mouseCurY) {
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
    } else if (this._boxResizeIsDragging) {
      cursor = 'nesw-resize';
      var iFR, iFX, iFY;
      iFX = mouseCurX - this._posResizeStartX;
      iFY = this._posResizeStartY - mouseCurY;
      if (iFX > iFY) {
        iFR = this._posResizeStartSize + iFY * 2;
      } else {
        iFR = this._posResizeStartSize + iFX * 2;
      }

      this._size = Math.max(this._minSize, iFR);
      this._boxResizeIsHover = true;
      res = true;
      this._events.trigger('area-resize');
    } else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
      cursor = 'nesw-resize';
      this._areaIsHover = false;
      this._boxResizeIsHover = true;
      res = true;
    } else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
      cursor = 'move';
      this._areaIsHover = true;
      res = true;
    }

    this._dontDragOutside();
    this._ctx.canvas.style.cursor = cursor;

    return res;
  };

  processMouseDown(mouseDownX: number, mouseDownY: number) {
    if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
      this._areaIsDragging = false;
      this._areaIsHover = false;
      this._boxResizeIsDragging = true;
      this._boxResizeIsHover = true;
      this._posResizeStartX = mouseDownX;
      this._posResizeStartY = mouseDownY;
      this._posResizeStartSize = this._size;
      this._events.trigger('area-resize-start');
    } else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
      this._areaIsDragging = true;
      this._areaIsHover = true;
      this._boxResizeIsDragging = false;
      this._boxResizeIsHover = false;
      this._posDragStartX = mouseDownX - this._x;
      this._posDragStartY = mouseDownY - this._y;
      this._events.trigger('area-move-start');
    }
  };

  processMouseUp(/*mouseUpX, mouseUpY*/) {
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

}