"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = function (source$, success) {
    return function (component) {
        component.asyncResource.push({ source$: source$, success: success });
        return component;
    };
};
exports.listen = function (source$, success) {
    return function (component) {
        component.listenResource.push({ source$: source$, success: success });
        return component;
    };
};
//# sourceMappingURL=inject.js.map