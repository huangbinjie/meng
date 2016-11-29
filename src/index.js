"use strict";
const rxjs_1 = require("rxjs");
const react_1 = require("react");
const shallowequal_1 = require("./utils/shallowequal");
class ImplStore {
    constructor(initialState = {}) {
        this.state$ = new rxjs_1.ReplaySubject(1)
            .distinctUntilChanged(shallowequal_1.default)
            .scan((currentState, nextState) => Object.assign(currentState, nextState), {});
        this.children = {};
        this.setState = (nextState, callback) => {
            this.state$.next(nextState);
            if (callback)
                this.state$.subscribe(callback).unsubscribe();
        };
        this.subscribe = (success, error, complete) => {
            return this.state$.subscribe(success, error, complete);
        };
        this.state$.next(initialState);
    }
}
exports.ImplStore = ImplStore;
function createProxy(target) {
    return new Proxy(target, {
        get(target, name) {
            if (name in target)
                return target[name];
            else
                return target.children[name];
        }
    });
}
const rootStore = createProxy(new ImplStore());
const inject = (source$, success) => (component) => {
    component.resource.push({ source$, success });
    return component;
};
exports.inject = inject;
const lift = (initialState = {}, initialName) => (component) => {
    const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
    return _a = class LiftedComponent extends react_1.Component {
            constructor() {
                super(...arguments);
                this._isMounted = false;
            }
            componentWillUnmount() {
                rootStore[displayName] = null;
                this._isMounted = false;
                this.hasStoreStateChanged = false;
                this.subscription.unsubscribe();
                rootStore[displayName].subscription.unsubscribe();
            }
            componentWillReceiveProps(nextProps) {
                rootStore[displayName].setState(nextProps);
            }
            componentWillMount() {
                const currentStore = new ImplStore(initialState);
                component.prototype["setState"] = currentStore.setState.bind(currentStore);
                rootStore.children[displayName] = currentStore;
                this.main$ = currentStore.state$.combineLatest(rxjs_1.Observable.of(this.props), combineLatestSelector);
                LiftedComponent.resource.forEach(source => this.main$ = fork.call(this, this.main$, source));
                this.subscription = this.main$
                    .subscribe(currentStore.setState);
                currentStore.subscription = currentStore.state$.subscribe(state => {
                    this.hasStoreStateChanged = true;
                    this.setState(state);
                });
            }
            componentDidMount() {
                this._isMounted = true;
            }
            shouldComponentUpdate() {
                return this.hasStoreStateChanged;
            }
            render() {
                this.hasStoreStateChanged = false;
                const props = Object.assign({}, initialState, this.state);
                return react_1.createElement(component, props);
            }
        },
        _a.displayName = `Meng(${displayName})`,
        _a.resource = [],
        _a;
    var _a;
};
exports.lift = lift;
function fork(main$, { source$, success }) {
    if (source$ instanceof rxjs_1.Observable)
        return main$.combineLatest(source$.map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector);
    else if (source$ instanceof Promise)
        return main$.combineLatest(rxjs_1.Observable.fromPromise(source$).map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector);
    else if (source$ instanceof ImplStore)
        return main$.combineLatest(source$.state$.map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector);
    else if (source$ instanceof Function && source$.length > 0)
        return main$.flatMap(state => fork(main$, { source$: source$(state), success }).map(api => Object.assign(state, api)));
    else if (source$ instanceof Function && source$.length === 0)
        return fork(main$, { source$: source$(), success });
    else
        return main$.combineLatest(rxjs_1.Observable.of(typeof success === "string" ? ({ [success]: source$ }) : success(source$)), combineLatestSelector);
}
const combineLatestSelector = (acc, x) => Object.assign(acc, x);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootStore;
