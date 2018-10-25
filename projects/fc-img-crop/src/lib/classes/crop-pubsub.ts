export enum FcImgCropEvent {
  LoadStart = 'load-start',
  LoadError = 'load-error',
  LoadDone = 'load-done',
  ImageReady = 'image-ready',
  ImageUpdated = 'image-updated',
  AreaResizeStart = 'area-resize-start',
  AreaResize = 'area-resize',
  AreaResizeEnd = 'area-resize-end',
  AreaMoveStart = 'area-move-start',
  AreaMove = 'area-move',
  AreaMoveEnd = 'area-move-end',
}

export class CropPubSub {
  private events = {};

  on(names: string, handler: Function) {
    names.split(' ').forEach(name => {
      if (!this.events[name]) {
        this.events[name] = [];
      }
      this.events[name].push(handler);
    });
    return this;
  };

  // Publish
  trigger(event: FcImgCropEvent, args?: any[]) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach(handler => {
        handler.call(null, args);
      });
    }
    return this;
  };
}