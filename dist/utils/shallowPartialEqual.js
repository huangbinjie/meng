"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shallowPartialEqual(source, target) {
    var targetKeys = Object.keys(target).filter(function (key) { return key !== "_callback"; });
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var _i = 0, targetKeys_1 = targetKeys; _i < targetKeys_1.length; _i++) {
        var targeKey = targetKeys_1[_i];
        if (!hasOwn.call(source, targeKey) ||
            source[targeKey] !== target[targeKey]) {
            return false;
        }
    }
    return true;
}
exports.default = shallowPartialEqual;
//# sourceMappingURL=shallowPartialEqual.js.map