"use strict";
exports.inject = function (source$, success) {
    return function (component) {
        component.resource.push({ source$: source$, success: success });
        return component;
    };
};
//# sourceMappingURL=inject.js.map