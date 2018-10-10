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
  trigger(name: string, args: any[]) {
    const listeners = this.events[name];
    if (listeners) {
      listeners.forEach(handler => {
        handler.call(null, args);
      });
    }
    return this;
  };
}