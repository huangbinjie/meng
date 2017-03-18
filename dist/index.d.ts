/// <reference types="react" />
import { ReplaySubject, Observable, Subscription } from 'rxjs';
import { StatelessComponent, ComponentLifecycle } from 'react';
import { Resource } from './inject';
export interface Store<S> {
    state$: ReplaySubject<S>;
    store$: Observable<S>;
    children: {
        [key: string]: Store<Object>;
    };
    setState: (nextState: S, callback?: () => void) => void;
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription;
}
export declare namespace Meng {
    interface Component<P> extends ComponentLifecycle<P, void> {
        displayName?: string;
        name?: string;
        resource?: [Resource];
        prototype: {};
    }
    interface Stateless<P> extends StatelessComponent<P> {
        displayName?: string;
        name?: string;
        resource?: [Resource];
    }
}
export declare class ImplStore<S> implements Store<S> {
    constructor(initialState?: S);
    store$: Observable<S>;
    state$: ReplaySubject<{}>;
    children: {
        [key: string]: Store<Object>;
    };
    setState: (nextState: Object, callback?: () => void) => void;
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription;
}
declare const rootStore: ImplStore<{}>;
export { lift } from './lift';
export { inject } from './inject';
export default rootStore;
