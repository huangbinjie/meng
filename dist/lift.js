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
var shallowEqualValue_1 = require("./utils/shallowEqualValue");
exports.lift = function (initialState, initialName) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent(props) {
                    var _this = _super.call(this, props) || this;
                    _this.hasStoreStateChanged = true;
                    _this.state = Object.assign({ callback: function () { } }, initialState);
                    _this.state = Object.assign({ callback: function () { } }, initialState, props);
                    var currentStore = new _1.ImplStore(initialState);
                    _1.default.children[displayName] = currentStore;
                    var props$ = rxjs_1.Observable.of(props);
                    var fork$ = LiftedComponent.resource.map(function (source) { return fork_1.fork.call(_this, currentStore.state$, source); });
                    var merge$ = rxjs_1.Observable.from(fork$).mergeAll();
                    currentStore.store$ =
                        rxjs_1.Observable
                            .merge(currentStore.state$, props$, merge$)
                            .filter(function (nextState) { return !shallowEqualValue_1.default(_this.state, nextState); })
                            .map(function (nextState) { return Object.assign({}, _this.state, nextState); });
                    _this.state.setState = currentStore.setState;
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    _1.default.children[displayName] = null;
                    this.hasStoreStateChanged = false;
                    this.subscription.unsubscribe();
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    _1.default.children[displayName].setState(nextProps);
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    var _this = this;
                    this.subscription =
                        _1.default.children[displayName].store$
                            .subscribe(function (state) {
                            _this.hasStoreStateChanged = true;
                            _this.setState(state, state.callback);
                            delete state.callback;
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
            _a.resource = [],
            _a;
        var _a;
    };
};
//# sourceMappingURL=lift.js.map