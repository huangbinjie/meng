"use strict";
var rxjs_1 = require("rxjs");
var _1 = require("./");
function fork(state$, _a) {
    var _this = this;
    var source$ = _a.source$, success = _a.success;
    if (source$ instanceof rxjs_1.Observable) {
        return source$.map(exports.implSelector(success));
    }
    else if (source$ instanceof Promise) {
        return rxjs_1.Observable.fromPromise(source$).map(exports.implSelector(success));
    }
    else if (source$ instanceof _1.ImplStore)
        return source$.store$.map(exports.implSelector(success));
    else if (source$ instanceof Function && source$.length > 0)
        return state$.flatMap(function (state) { return fork(state$, { source$: source$(_this.state, state), success: success }); });
    else if (source$ instanceof Function && source$.length === 0)
        return fork(state$, { source$: source$(this.state, this.state), success: success });
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
//# sourceMappingURL=fork.js.map