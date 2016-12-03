"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var react_1 = require("react");
var _1 = require("./");
var rxjs_1 = require("rxjs");
var fork_1 = require("./fork");
var shallowEqual_1 = require("./utils/shallowEqual");
exports.lift = function (initialState, initialName) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent() {
                    var _this = _super.apply(this, arguments) || this;
                    _this._isMounted = false;
                    _this.state = Object.assign({}, initialState);
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    _1.default.children[displayName] = null;
                    this._isMounted = false;
                    this.hasStoreStateChanged = false;
                    this.subscription.unsubscribe();
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    _1.default.children[displayName].setState(nextProps);
                };
                LiftedComponent.prototype.componentWillMount = function () {
                    var _this = this;
                    var currentStore = new _1.ImplStore(initialState);
                    _1.default.children[displayName] = currentStore;
                    var props$ = rxjs_1.Observable.of(this.props);
                    var fork$ = LiftedComponent.resource.map(function (source) { return fork_1.fork.call(_this, currentStore.state$, source); });
                    var merge$ = rxjs_1.Observable.from(fork$).mergeAll();
                    currentStore.store$ = rxjs_1.Observable.merge(currentStore.state$, props$, merge$);
                    this.subscription = currentStore.store$
                        .map(function (nextState) { return Object.assign({}, _this.state, nextState); })
                        .subscribe(function (state) {
                        if (!shallowEqual_1.default(_this.state, state)) {
                            _this.hasStoreStateChanged = true;
                            _this.setState(state);
                        }
                    });
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    this._isMounted = true;
                };
                LiftedComponent.prototype.shouldComponentUpdate = function () {
                    return this.hasStoreStateChanged;
                };
                LiftedComponent.prototype.render = function () {
                    this.hasStoreStateChanged = false;
                    var props = Object.assign({ setState: _1.default.children[displayName].setState }, this.state);
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
