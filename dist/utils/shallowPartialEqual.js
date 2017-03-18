"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shallowPartialEqual(source, target) {
    const targetKeys = Object.keys(target);
    const hasOwn = Object.prototype.hasOwnProperty;
    for (let i = 0; i < targetKeys.length; i++) {
        if (!hasOwn.call(source, targetKeys[i]) ||
            source[targetKeys[i]] !== target[targetKeys[i]]) {
            return false;
        }
    }
    return true;
}
exports.default = shallowPartialEqual;
//# sourceMappingURL=shallowPartialEqual.js.map