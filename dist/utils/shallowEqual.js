"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true;
    }
    if (objA == void 0 || objB == void 0) {
        return false;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB).filter(function (key) { return key !== "_callback"; });
    if (keysA.length !== keysB.length) {
        return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var _i = 0, keysA_1 = keysA; _i < keysA_1.length; _i++) {
        var keyA = keysA_1[_i];
        if (!hasOwn.call(objB, keyA) ||
            objA[keyA] !== objB[keyA]) {
            return false;
        }
    }
    return true;
}
exports.default = shallowEqual;
//# sourceMappingURL=shallowEqual.js.map