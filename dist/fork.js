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
var _1 = require("./");
function fork(_a, store$) {
    var _this = this;
    var source$ = _a.source$, success = _a.success;
    if (source$ instanceof rxjs_1.Observable)
        return source$.map(exports.implSelector(success));
    else if (source$ instanceof Promise)
        return rxjs_1.Observable.fromPromise(source$).map(exports.implSelector(success));
    else if (source$ instanceof _1.ImplStore)
        return source$.store$.map(exports.implSelector(success));
    else if (source$ instanceof Function && source$.length > 0)
        return store$
            .flatMap(function (pairstore) { return fork({ source$: source$(pairstore[0], pairstore[1]), success: success }, store$); })
            .map(function (nextState) { return (__assign({}, _this.state, nextState)); });
    else if (source$ instanceof Function && source$.length === 0)
        return fork({ source$: source$(this.state, this.state), success: success }, store$);
    else if (source$ == void 0)
        return rxjs_1.Observable.never();
    else
        return rxjs_1.Observable.of(source$).map(exports.implSelector(success));
}
exports.fork = fork;
exports.combineLatestSelector = function (acc, x) { return Object.assign(acc, x); };
exports.resetCallback = function (state) { return Object.assign(state, { callback: function () { } }); };
exports.implSelector = function (success) { return function (state) {
    return typeof success === "string" ? (_a = {}, _a[success] = state, _a) : success(state);
    var _a;
}; };
exports.nullCheck = function (state) { return state != void 0; };
//# sourceMappingURL=fork.js.map