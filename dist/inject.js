"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = function (source$, success) {
    return function (component) {
        component.resource.push({ source$: source$, success: success });
        return component;
    };
};
//# sourceMappingURL=inject.js.map