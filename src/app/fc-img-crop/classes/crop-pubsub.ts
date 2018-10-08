export class CropPubSub {
    events = {};

    on(names, handler) {
        names.split(' ').forEach(name => {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(handler);
        });
        return this;
    };

    // Publish
    trigger(name, args) {
        this.events[name].forEach(handler => {
            handler.call(null, args);
        });
        return this;
    };
}