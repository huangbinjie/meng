"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const shallowPartialEqual_1 = require("./utils/shallowPartialEqual");
class ImplStore {
    constructor(initialState = {}) {
        this.state$ = new rxjs_1.ReplaySubject(1);
        this.children = {};
        this.setState = (nextState, callback = () => { }) => this.state$.next(Object.assign({}, nextState, { callback }));
        this.subscribe = (success, error, complete) => {
            return this.store$.subscribe(success, error, complete);
        };
        this.state$.next(initialState);
        this.store$ = this.state$.distinctUntilChanged(shallowPartialEqual_1.default).scan((acc, x) => (Object.assign({}, acc, x)));
    }
}
exports.ImplStore = ImplStore;
const rootStore = new ImplStore();
var lift_1 = require("./lift");
exports.lift = lift_1.lift;
var inject_1 = require("./inject");
exports.inject = inject_1.inject;
exports.default = rootStore;
//# sourceMappingURL=index.js.map