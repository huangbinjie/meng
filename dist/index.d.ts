import { ReplaySubject, Observable, Subscription } from "rxjs";
export interface IStore<S> {
    state$: ReplaySubject<S>;
    store$: Observable<S>;
    children: {
        [key: string]: IStore<S>;
    };
    setState: (nextState: Partial<S>, callback?: () => void) => void;
    subscribe: (success: (state: S) => void, error?: (error: Error) => void, complete?: () => void) => Subscription;
}
export declare class ImplStore<S extends {
    [key: string]: any;
}> implements IStore<S> {
    store$: Observable<S & {
        _callback?: () => void;
    }>;
    state$: ReplaySubject<{}>;
    children: {
        [key: string]: IStore<S>;
    };
    constructor(initialState?: S);
    setState: (nextState: Partial<S>, callback?: ((error?: Error | undefined) => void) | undefined) => void;
    subscribe: (success: (state: S & {
        _callback?: (() => void) | undefined;
    }) => void, error?: ((error: Error) => void) | undefined, complete?: (() => void) | undefined) => Subscription;
}
declare const rootStore: ImplStore<{}>;
export { lift } from "./lift";
export { inject, listen } from "./inject";
export default rootStore;
