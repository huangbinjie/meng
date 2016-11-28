"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require("rxjs");
var react_1 = require("react");
var shallowequal_1 = require("./utils/shallowequal");
var ImplStore = (function () {
    function ImplStore(initialState) {
        if (initialState === void 0) { initialState = {}; }
        var _this = this;
        this.state = new rxjs_1.ReplaySubject(1)
            .distinctUntilChanged(shallowequal_1.default)
            .scan(function (currentState, nextState) { return Object.assign(currentState, nextState); }, {});
        this.children = {};
        this.setState = function (nextState, callback) {
            if (callback === void 0) { callback = function () { }; }
            console.log(nextState);
            _this.state.next(nextState);
            callback();
        };
        this.getState = function () { return _this.state.toPromise(); };
        this.subscribe = function (success, error, complete) {
            return _this.state.subscribe(success, error, complete);
        };
        this.state.next(initialState);
    }
    return ImplStore;
}());
exports.ImplStore = ImplStore;
function createProxy(target) {
    return new Proxy(target, {
        get: function (target, name) {
            if (name in target)
                return target[name];
            else
                return target.children[name];
        }
    });
}
var rootStore = createProxy(new ImplStore());
var inject = function (source$, success) {
    return function (component) {
        component.resource.push({ source$: source$, success: success });
        return component;
    };
};
exports.inject = inject;
var lift = function (initialState) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent() {
                    var _this = _super.apply(this, arguments) || this;
                    _this._isMounted = false;
                    _this.subscriptions = [];
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    rootStore[displayName] = null;
                    this._isMounted = false;
                    this.haveOwnPropsChanged = false;
                    this.hasStoreStateChanged = false;
                    this.subscriptions.map(function (subscription) {
                        subscription.unsubscribe();
                        subscription.remove(subscription);
                    });
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    if (!shallowequal_1.default(nextProps, this.props)) {
                        this.haveOwnPropsChanged = true;
                    }
                };
                LiftedComponent.prototype.componentWillMount = function () {
                    var _this = this;
                    var currentStore = new ImplStore(initialState);
                    component.prototype["setState"] = currentStore.setState.bind(currentStore);
                    rootStore.children[displayName] = currentStore;
                    var observer = currentStore.subscribe(function (state) {
                        _this.hasStoreStateChanged = true;
                        _this.setState(state);
                        LiftedComponent.resource
                            .filter(function (source) { return source.source$ instanceof Function && source.source$.length > 0; })
                            .forEach(function (source) { return fork.call(_this, rootStore[displayName], source); });
                    });
                    this.subscriptions.push(observer);
                    LiftedComponent.resource.forEach(function (source) { return fork.call(_this, currentStore, source); });
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    this._isMounted = true;
                };
                LiftedComponent.prototype.shouldComponentUpdate = function () {
                    return this.haveOwnPropsChanged || this.hasStoreStateChanged;
                };
                LiftedComponent.prototype.render = function () {
                    this.haveOwnPropsChanged = false;
                    this.hasStoreStateChanged = false;
                    var props = Object.assign({}, this.state, this.props);
                    return react_1.createElement(component, props);
                };
                return LiftedComponent;
            }(react_1.Component)),
            _a.displayName = "Meng(" + displayName + ")",
            _a.resource = [],
            _a;
        var _a;
    };
};
exports.lift = lift;
function fork(currentStore, _a) {
    var source$ = _a.source$, success = _a.success;
    if (source$ instanceof rxjs_1.Observable) {
        var observer = source$.subscribe(successHandle(currentStore, success));
        this.observers.push(observer);
    }
    else if (source$ instanceof Promise)
        source$.then(successHandle(currentStore, success));
    else if (source$ instanceof ImplStore) {
        var observer = source$.subscribe(successHandle(currentStore, success));
        this.observers.push(observer);
    }
    else if (source$ instanceof Function)
        fork.call(this, currentStore, { source$: source$(currentStore.getState()), success: success });
    else
        successHandle(currentStore, success)(source$);
}
var successHandle = function (store, success) { return function (primitiveValue) {
    return typeof success === "string" ? store.setState((_a = {}, _a[success] = primitiveValue, _a)) : success(store, primitiveValue);
    var _a;
}; };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootStore;
