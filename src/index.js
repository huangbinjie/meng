"use strict";
var rxjs_1 = require("rxjs");
var ImplStore = (function () {
    function ImplStore(initialState) {
        if (initialState === void 0) { initialState = {}; }
        var _this = this;
        this.store$ = rxjs_1.Observable.of({});
        this.state$ = new rxjs_1.ReplaySubject(1);
        this.children = {};
        this.setState = function (nextState) {
            _this.state$.next(nextState);
        };
        this.subscribe = function (success, error, complete) {
            return _this.store$.subscribe(success, error, complete);
        };
        this.state$.next(initialState);
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
