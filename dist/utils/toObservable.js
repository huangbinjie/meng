"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var _1 = require("../");
function toObservable(source) {
    if (source == void 0)
        return rxjs_1.Observable.never();
    else if (source instanceof rxjs_1.Observable)
        return source;
    else if (source instanceof Promise)
        return rxjs_1.Observable.fromPromise(source);
    else if (source instanceof _1.ImplStore)
        return source.store$;
    else
        return rxjs_1.Observable.of(source);
}
exports.default = toObservable;
//# sourceMappingURL=toObservable.js.map