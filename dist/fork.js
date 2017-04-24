"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var _1 = require("./");
function forkAsync(_a) {
    var _this = this;
    var source$ = _a.source$, success = _a.success;
    if (source$ == void 0)
        return rxjs_1.Observable.never();
    else if (source$ instanceof rxjs_1.Observable)
        return source$.map(function (state) { return implSelector.call(_this, state, success); });
    else if (source$ instanceof Promise)
        return rxjs_1.Observable.fromPromise(source$).map(function (state) { return implSelector.call(_this, state, success); });
    else if (source$ instanceof _1.ImplStore)
        return source$.store$.map(function (state) { return implSelector.call(_this, state, success); });
    else if (source$ instanceof Function && source$.length === 0)
        return forkAsync.call(this, { source$: source$(), success: success });
    else
        return rxjs_1.Observable.of(source$).map(function (state) { return implSelector.call(_this, state, success); });
}
exports.forkAsync = forkAsync;
function forkListen(_a, store$) {
    var _this = this;
    var source$ = _a.source$, success = _a.success;
    return store$.flatMap(function (pairstore) { return forkAsync.call(_this, { source$: source$(pairstore[0], pairstore[1]), success: success }); });
}
exports.forkListen = forkListen;
function implSelector(state, success) {
    return typeof success === "string" ? (_a = {}, _a[success] = state, _a) : success(this.state, state);
    var _a;
}
exports.implSelector = implSelector;
//# sourceMappingURL=fork.js.map