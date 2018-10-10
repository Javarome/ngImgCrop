/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var CropPubSub = /** @class */ (function () {
    function CropPubSub() {
        this.events = {};
    }
    /**
     * @param {?} names
     * @param {?} handler
     * @return {?}
     */
    CropPubSub.prototype.on = /**
     * @param {?} names
     * @param {?} handler
     * @return {?}
     */
    function (names, handler) {
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
    /**
     * @param {?} name
     * @param {?} args
     * @return {?}
     */
    CropPubSub.prototype.trigger = /**
     * @param {?} name
     * @param {?} args
     * @return {?}
     */
    function (name, args) {
        /** @type {?} */
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
export { CropPubSub };
if (false) {
    /** @type {?} */
    CropPubSub.prototype.events;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1wdWJzdWIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9uZy1pbWctY3JvcC8iLCJzb3VyY2VzIjpbInNyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLXB1YnN1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBQTs7c0JBQ21CLEVBQUU7Ozs7Ozs7SUFFbkIsdUJBQUU7Ozs7O0lBQUYsVUFBRyxLQUFhLEVBQUUsT0FBaUI7UUFBbkMsaUJBUUM7UUFQQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7WUFDM0IsSUFBSSxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3hCO1lBQ0QsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUFBLENBQUM7SUFFRixVQUFVOzs7Ozs7SUFDViw0QkFBTzs7Ozs7SUFBUCxVQUFRLElBQVksRUFBRSxJQUFXOztRQUMvQixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksU0FBUyxFQUFFO1lBQ2IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87Z0JBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzFCLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUFBLENBQUM7cUJBdEJKO0lBdUJDLENBQUE7QUF2QkQsc0JBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIENyb3BQdWJTdWIge1xuICBwcml2YXRlIGV2ZW50cyA9IHt9O1xuXG4gIG9uKG5hbWVzOiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG4gICAgbmFtZXMuc3BsaXQoJyAnKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgaWYgKCF0aGlzLmV2ZW50c1tuYW1lXSkge1xuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5ldmVudHNbbmFtZV0ucHVzaChoYW5kbGVyKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBQdWJsaXNoXG4gIHRyaWdnZXIobmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSkge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuZXZlbnRzW25hbWVdO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGhhbmRsZXIgPT4ge1xuICAgICAgICBoYW5kbGVyLmNhbGwobnVsbCwgYXJncyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59Il19