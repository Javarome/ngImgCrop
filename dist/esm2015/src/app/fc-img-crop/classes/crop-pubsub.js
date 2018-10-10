/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
export class CropPubSub {
    constructor() {
        this.events = {};
    }
    /**
     * @param {?} names
     * @param {?} handler
     * @return {?}
     */
    on(names, handler) {
        names.split(' ').forEach(name => {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(handler);
        });
        return this;
    }
    ;
    /**
     * @param {?} name
     * @param {?} args
     * @return {?}
     */
    trigger(name, args) {
        /** @type {?} */
        const listeners = this.events[name];
        if (listeners) {
            listeners.forEach(handler => {
                handler.call(null, args);
            });
        }
        return this;
    }
    ;
}
if (false) {
    /** @type {?} */
    CropPubSub.prototype.events;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1wdWJzdWIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1pbWctY3JvcC8iLCJzb3VyY2VzIjpbInNyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLXB1YnN1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsTUFBTTs7c0JBQ2EsRUFBRTs7Ozs7OztJQUVuQixFQUFFLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUN4QjtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFBQSxDQUFDOzs7Ozs7SUFHRixPQUFPLENBQUMsSUFBWSxFQUFFLElBQVc7O1FBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxTQUFTLEVBQUU7WUFDYixTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUMxQixDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFBQSxDQUFDO0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQ3JvcFB1YlN1YiB7XG4gIHByaXZhdGUgZXZlbnRzID0ge307XG5cbiAgb24obmFtZXM6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICBuYW1lcy5zcGxpdCgnICcpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKGhhbmRsZXIpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFB1Ymxpc2hcbiAgdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5ldmVudHNbbmFtZV07XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XG4gICAgICAgIGhhbmRsZXIuY2FsbChudWxsLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn0iXX0=