"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var rxjs_1 = require("rxjs");
var shallowEqualValue_1 = require("./utils/shallowEqualValue");
var ImplStore = (function () {
    function ImplStore(initialState) {
        if (initialState === void 0) { initialState = {}; }
        var _this = this;
        this.state$ = new rxjs_1.ReplaySubject(1);
        this.children = {};
        this.setState = function (nextState) {
            _this.state$.next(nextState);
        };
        this.subscribe = function (success, error, complete) {
            return _this.store$.subscribe(success, error, complete);
        };
        this.state$.next(initialState);
        this.store$ = this.state$.distinctUntilChanged(shallowEqualValue_1.default).scan(function (acc, x) { return (__assign({}, acc, x)); });
    }
    return ImplStore;
}());
exports.ImplStore = ImplStore;
var rootStore = new ImplStore();
var lift_1 = require("./lift");
exports.lift = lift_1.lift;
var inject_1 = require("./inject");
exports.inject = inject_1.inject;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootStore;
//# sourceMappingURL=index.js.map