"use strict";
function stringHash(str) {
    var value = 5381;
    var i = str.length;
    while (i) {
        value = (value * 33) ^ str.charCodeAt(--i);
    }
    return (value >>> 0).toString(36);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = stringHash;
//# sourceMappingURL=hash.js.map