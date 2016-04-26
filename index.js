"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require('rxjs');
var AjaxObservable_1 = require('rxjs/observable/dom/AjaxObservable');
var react_1 = require('react');
var subject = new rxjs_1.Subject();
var StoreConstructor = (function () {
    function StoreConstructor(state, subject, setState) {
        this.state = state;
        this.setState = setState;
        this["@@subject"] = subject;
    }
    return StoreConstructor;
}());
exports.StoreConstructor = StoreConstructor;
var Store = new StoreConstructor({}, subject, function (state, callback) {
    if (callback === void 0) { callback = function () { }; }
    Object.assign(this.state, state);
    callback();
    subject.next(state);
});
var LiftedComponent;
exports.lift = function (initialState) { return function (component) {
    var currentState = initialState || {};
    var currentSubject = new rxjs_1.Subject();
    var displayName = component.displayName || component.name;
    return (function (_super) {
        __extends(LiftedComponent, _super);
        function LiftedComponent() {
            _super.apply(this, arguments);
        }
        LiftedComponent.prototype.componentWillUnmount = function () {
            Store[displayName] = null;
        };
        LiftedComponent.prototype.componentWillMount = function () {
            var _this = this;
            currentSubject.subscribe(function (sub) {
                var storeState = Object.assign(currentState, sub.state);
                _this.setState(storeState, sub.callback);
            });
            var currentStore = new StoreConstructor(currentState, currentSubject, function (state, callback) {
                if (callback === void 0) { callback = function () { }; }
                this["@@subject"].next({ state: state, callback: callback });
            });
            Store[displayName] = currentStore;
            LiftedComponent.resource.map(function (obj) {
                var source = obj.source;
                var success = obj.success;
                var fail = obj.fail;
                if (source instanceof rxjs_1.Observable)
                    source.subscribe(function (x) {
                        if (x instanceof AjaxObservable_1.AjaxObservable)
                            typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = x.response, _a)) : success(x.response);
                        else
                            typeof success === "string" ? currentStore.setState((_b = {}, _b[success] = x, _b)) : success(x);
                        var _a, _b;
                    }, function (y) {
                        if (fail)
                            typeof fail === "string" ? currentStore.setState((_a = {}, _a[fail] = y, _a)) : fail(y);
                        var _a;
                    });
                else if (source instanceof StoreConstructor) {
                    typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = source.state, _a)) : success(source.state);
                    source["@@subject"].subscribe(function (x) { return typeof success === "string" ? currentStore.setState((_a = {}, _a[success] = source.state, _a)) : success(source.state); var _a; }, function (y) {
                        if (fail)
                            typeof fail === "string" ? currentStore.setState((_a = {}, _a[fail] = y, _a)) : fail(y);
                        var _a;
                    });
                }
                else
                    typeof success === "string" ? currentStore.setState((_b = {}, _b[success] = source, _b)) : success(source);
                var _a, _b;
            });
        };
        LiftedComponent.prototype.render = function () {
            var props = Object.assign({ setState: Store[displayName].setState.bind(Store[displayName]) }, this.props, currentState);
            return react_1.createElement(component, props);
        };
        LiftedComponent.displayName = "Lifted(" + displayName + ")";
        LiftedComponent.resource = [];
        return LiftedComponent;
    }(react_1.Component));
}; };
exports.resource = function (source, success, fail) {
    return function (Component) {
        Component.resource.push({ source: source, success: success, fail: fail });
        return Component;
    };
};
exports.getStore = function () { return Store; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
//# sourceMappingURL=index.js.map