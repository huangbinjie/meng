"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const _1 = require("./");
const rxjs_1 = require("rxjs");
const fork_1 = require("./fork");
const shallowEqual_1 = require("./utils/shallowEqual");
exports.lift = (initialState = {}, initialName) => (component) => {
    const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
    return _a = class LiftedComponent extends react_1.Component {
            constructor(props) {
                super(props);
                const mergedState = Object.assign({}, initialState, props);
                const currentStore = new _1.ImplStore(mergedState);
                this.state = Object.assign({ setState: currentStore.setState }, mergedState);
                _1.default.children[displayName] = currentStore;
                const resource$ = rxjs_1.Observable.from(LiftedComponent.resource);
                const parts = resource$.partition(resource => resource.source$ instanceof Function && resource.source$.length > 0);
                const asyncResource = parts[1].map(source => fork_1.fork(source));
                const asyncResource$ = rxjs_1.Observable.from(asyncResource).mergeAll();
                const store$ = currentStore.state$
                    .merge(asyncResource$)
                    .scan((currentStore, nextState) => Object.assign({}, currentStore, nextState))
                    .publishReplay(2)
                    .refCount()
                    .pairwise();
                const listenResource = parts[0].map(source => fork_1.fork.call(this, source, store$));
                const listenResource$ = rxjs_1.Observable.from(listenResource).mergeAll();
                currentStore.store$ = store$.map(pairstore => pairstore[1]).merge(listenResource$).scan((nextStore, nextStoreOrState) => Object.assign(nextStore, nextStoreOrState));
            }
            componentWillUnmount() {
                _1.default.children[displayName] = null;
                this.hasStoreStateChanged = false;
                this.subscription.unsubscribe();
            }
            componentWillReceiveProps(nextProps) {
                _1.default.children[displayName].setState(nextProps);
            }
            componentDidMount() {
                const currentStore = _1.default.children[displayName];
                this.subscription =
                    currentStore.store$
                        .filter(store => !shallowEqual_1.default(this.state, store))
                        .subscribe((state) => {
                        this.hasStoreStateChanged = true;
                        const callback = state.callback || (() => { });
                        delete state.callback;
                        this.setState(state, callback);
                    });
            }
            shouldComponentUpdate() {
                return this.hasStoreStateChanged;
            }
            render() {
                this.hasStoreStateChanged = false;
                return react_1.createElement(component, this.state);
            }
        },
        _a.displayName = `Meng(${displayName})`,
        _a.resource = [],
        _a;
    var _a;
};
//# sourceMappingURL=lift.js.map