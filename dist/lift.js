"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var _1 = require("./");
var rxjs_1 = require("rxjs");
var fork_1 = require("./fork");
var shallowPartialEqual_1 = require("./utils/shallowPartialEqual");
exports.lift = function (initialState, initialName) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent(props) {
                    var _this = _super.call(this, props) || this;
                    _this.state = Object.assign({}, props, initialState);
                    var currentStore = new _1.ImplStore(_this.state);
                    _1.default.children[displayName] = currentStore;
                    var state$ = rxjs_1.Observable.of({});
                    var asyncResource$ = rxjs_1.Observable.from(LiftedComponent.asyncResource).map(function (source) { return fork_1.forkAsync.call(_this, source); }).mergeAll();
                    var store$ = rxjs_1.Observable.merge(currentStore.state$.mergeAll(), asyncResource$).publishReplay(1).refCount();
                    var listenStore$ = state$.merge(store$).scan(function (store, nextState) { return (__assign({}, store, nextState)); }).pairwise();
                    var listenResource$ = rxjs_1.Observable.from(LiftedComponent.listenResource).map(function (source) { return fork_1.forkListen.call(_this, source, listenStore$); }).mergeAll();
                    currentStore.store$ = store$.skipUntil(currentStore.state$).merge(listenResource$);
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    delete _1.default.children[displayName];
                    this.hasStoreStateChanged = false;
                    this.subscription.unsubscribe();
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    _1.default.children[displayName].setState(nextProps);
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    var _this = this;
                    var currentStore = _1.default.children[displayName];
                    this.subscription =
                        currentStore.store$
                            .filter(function (nextState) { return !shallowPartialEqual_1.default(_this.state, nextState); })
                            .subscribe(function (state) {
                            _this.hasStoreStateChanged = true;
                            var callback = state._callback || (function () { });
                            delete state._callback;
                            _this.setState(state, callback);
                        });
                };
                LiftedComponent.prototype.shouldComponentUpdate = function () {
                    return this.hasStoreStateChanged;
                };
                LiftedComponent.prototype.render = function () {
                    this.hasStoreStateChanged = false;
                    return react_1.createElement(component, this.state);
                };
                return LiftedComponent;
            }(react_1.Component)),
            _a.displayName = "Meng(" + displayName + ")",
            _a.asyncResource = [],
            _a.listenResource = [],
            _a;
        var _a;
    };
};
//# sourceMappingURL=lift.js.map