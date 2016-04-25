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
var ConnectComponent;
exports.lift = function (initialState) { return function (component) {
    var currentState = initialState || {};
    var currentSubject = new rxjs_1.Subject();
    var displayName = component.displayName || component.name;
    return (function (_super) {
        __extends(ConnectComponent, _super);
        function ConnectComponent() {
            _super.apply(this, arguments);
        }
        ConnectComponent.prototype.componentWillUnmount = function () {
            Store[displayName] = null;
        };
        ConnectComponent.prototype.componentWillMount = function () {
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
            var _loop_1 = function(i) {
                var value = ConnectComponent.resource[i];
                if (value instanceof rxjs_1.Observable)
                    value.subscribe(function (x) { return x instanceof AjaxObservable_1.AjaxObservable ? currentStore.setState((_a = {}, _a[i] = x.response, _a)) : currentStore.setState((_b = {}, _b[i] = x, _b)); var _a, _b; }, function (y) { return currentStore.setState((_a = {}, _a[i] = y, _a)); var _a; });
                else if (value instanceof StoreConstructor) {
                    currentStore.setState((_a = {}, _a[i] = value.state, _a));
                    value["@@subject"].subscribe(function (x) { return currentStore.setState((_a = {}, _a[i] = value.state, _a)); var _a; });
                }
                else
                    currentStore.setState((_b = {}, _b[i] = value, _b));
            };
            for (var i in ConnectComponent.resource) {
                _loop_1(i);
            }
            var _a, _b;
        };
        ConnectComponent.prototype.render = function () {
            var props = Object.assign({ setState: Store[displayName].setState }, this.props, currentState);
            return react_1.createElement(component, props);
        };
        ConnectComponent.displayName = "Connect(" + displayName + ")";
        ConnectComponent.resource = {};
        return ConnectComponent;
    }(react_1.Component));
}; };
exports.resource = function (source, name) {
    return function (Component) {
        Component.resource[name] = source;
        return Component;
    };
};
exports.getStore = function () { return Store; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
//# sourceMappingURL=index.js.map