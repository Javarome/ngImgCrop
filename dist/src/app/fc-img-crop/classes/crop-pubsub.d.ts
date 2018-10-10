export declare class CropPubSub {
    private events;
    on(names: string, handler: Function): this;
    trigger(name: string, args: any[]): this;
}
