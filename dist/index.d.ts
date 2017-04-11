import { ReplaySubject, Observable, Subscription } from 'rxjs';
export interface Store<S> {
    state$: ReplaySubject<S>;
    store$: Observable<S>;
    children: {
        [key: string]: Store<Object>;
    };
    setState: (nextState: S, callback?: () => void) => void;
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription;
}
export declare class ImplStore<S> implements Store<S> {
    constructor(initialState?: S);
    store$: Observable<S>;
    state$: ReplaySubject<{}>;
    children: {
        [key: string]: Store<Object>;
    };
    setState: (nextState: Object, callback?: () => void) => void;
    subscribe: (success: (state: Object) => void, error?: ((error: Error) => void) | undefined, complete?: (() => void) | undefined) => Subscription;
}
declare const rootStore: ImplStore<{}>;
export { lift } from './lift';
export { inject } from './inject';
export default rootStore;
