"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = (source$, success) => (component) => {
    component.resource.push({ source$, success });
    return component;
};
//# sourceMappingURL=inject.js.map