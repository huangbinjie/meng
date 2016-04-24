"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require('rxjs');
var react_1 = require('react');
var subject = new rxjs_1.Subject();
var Store = {};
Store.setState = function (state) { return subject.next(state); };
var ConnectComponent;
exports.lift = function (initialState) { return function (component) {
    var currentState = initialState || {};
    var currentStore = {};
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
            subject.subscribe(function (sub) {
                var storeState = Object.assign(currentState, sub.state);
                _this.setState(storeState, sub.callback);
            });
            currentStore.state = currentState;
            currentStore.setState = function (state, callback) {
                if (callback === void 0) { callback = function () { }; }
                return currentSubject.next({ state: state, callback: callback });
            };
            Store[displayName] = currentStore;
            var keys = Object.keys(ConnectComponent.resource);
            keys.map(function (key) {
                if (ConnectComponent.resource[key]._isScalar)
                    ConnectComponent.resource[key].subscribe(function (x) { return currentStore.setState((_a = {}, _a[key] = x, _a)); var _a; }, function (y) { return currentStore.setState((_a = {}, _a[key] = y, _a)); var _a; });
                else
                    currentStore.setState((_a = {}, _a[key] = ConnectComponent.resource[key], _a));
                var _a;
            });
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