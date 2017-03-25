"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const _1 = require("./");
function fork({ source$, success }, store$) {
    if (source$ == void 0)
        return rxjs_1.Observable.never();
    else if (source$ instanceof rxjs_1.Observable)
        return source$.map(exports.implSelector(success));
    else if (source$ instanceof Promise)
        return rxjs_1.Observable.fromPromise(source$).map(exports.implSelector(success));
    else if (source$ instanceof _1.ImplStore)
        return source$.store$.map(exports.implSelector(success));
    else if (source$ instanceof Function && source$.length > 0)
        return store$.flatMap(pairstore => fork({ source$: source$(pairstore[0], pairstore[1]), success }, store$));
    else if (source$ instanceof Function && source$.length === 0)
        return fork({ source$: source$(), success }, store$);
    else
        return rxjs_1.Observable.of(source$).map(exports.implSelector(success));
}
exports.fork = fork;
exports.combineLatestSelector = (acc, x) => Object.assign(acc, x);
exports.resetCallback = (state) => Object.assign(state, { callback: () => { } });
exports.implSelector = (success) => (state) => typeof success === "string" ? ({ [success]: state }) : success(state);
exports.nullCheck = (state) => state != void 0;
//# sourceMappingURL=fork.js.map