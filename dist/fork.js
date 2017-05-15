"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toObservable_1 = require("./utils/toObservable");
function forkAsync(_a) {
    var _this = this;
    var source$ = _a.source$, success = _a.success;
    return source$ instanceof Function ? forkAsync.call(this, { source$: source$(), success: success }) : toObservable_1.default(source$).map(function (state) { return implSelector.call(_this, state, success); });
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