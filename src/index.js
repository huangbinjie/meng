"use strict";
const rxjs_1 = require("rxjs");
const react_1 = require("react");
const shallowequal_1 = require("./utils/shallowequal");
class ImplStore {
    constructor(initialState = {}) {
        this.state$ = new rxjs_1.ReplaySubject(1)
            .scan((currentState, nextState) => Object.assign(currentState, nextState), {});
        this.children = {};
        this.setState = (nextState, callback = () => { }) => {
            this.state$.next(Object.assign(nextState, { setState: this.setState, callback }));
        };
        this.subscribe = (success, error, complete) => {
            return this.store$.subscribe(success, error, complete);
        };
        this.state$.next(Object.assign({ setState: this.setState, callback: () => { } }, initialState));
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
            }
            componentWillReceiveProps(nextProps) {
                rootStore[displayName].setState(nextProps);
            }
            componentWillMount() {
                const currentStore = new ImplStore(initialState);
                rootStore.children[displayName] = currentStore;
                currentStore.store$ = currentStore.state$.combineLatest(rxjs_1.Observable.of(this.props), combineLatestSelector);
                LiftedComponent.resource.forEach(source => currentStore.store$ = fork(currentStore.store$, source));
                this.subscription = currentStore.store$
                    .subscribe(state => {
                    if (!shallowequal_1.default(state, this.state)) {
                        this.hasStoreStateChanged = true;
                        this.setState(state, state.callback);
                    }
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
function fork(store$, { source$, success }) {
    if (source$ instanceof rxjs_1.Observable) {
        return store$.combineLatest(source$.map(state => Object.assign(state, { callback: () => { } })).map(state => typeof success === "string" ? ({ [success]: state }) : success(state)), combineLatestSelector);
    }
    else if (source$ instanceof Promise) {
        return store$.combineLatest(rxjs_1.Observable.fromPromise(source$).map(state => Object.assign(state, { callback: () => { } })).map(state => typeof success === "string" ? ({ [success]: state }) : success(state)), combineLatestSelector);
    }
    else if (source$ instanceof ImplStore) {
        return store$.combineLatest(source$.state$.map(state => Object.assign(state, { callback: () => { } })).map(state => typeof success === "string" ? ({ [success]: state }) : success(state)), combineLatestSelector);
    }
    else if (source$ instanceof Function) {
        return store$.switchMap(store => fork(store$, { source$: source$(store), success: typeof success === "string" ? success : success.bind(null, store) }));
    }
    else
        return store$.map(store => Object.assign(store, typeof success === "string" ? ({ [success]: source$ }) : success(store, source$)));
}
const combineLatestSelector = (acc, x) => Object.assign(acc, x);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootStore;
