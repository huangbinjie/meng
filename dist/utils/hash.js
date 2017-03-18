"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringHash(str) {
    let value = 5381;
    let i = str.length;
    while (i) {
        value = (value * 33) ^ str.charCodeAt(--i);
    }
    return (value >>> 0).toString(36);
}
exports.default = stringHash;
//# sourceMappingURL=hash.js.map