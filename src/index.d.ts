import { Subject } from 'rxjs';
import { ComponentClass, StatelessComponent } from 'react';
export interface Store {
    state: Object;
    setState: Function;
    "@@subject": Subject<Object>;
    subscribe(success: (state) => void, error?: (error: Error) => void, complete?: () => void): any;
}
export declare class StoreConstructor implements Store {
    state: any;
    setState: any;
    "@@subject": Subject<Object>;
    constructor(state: any, subject: Subject<Object>, setState: any);
    subscribe: (success: any, error: any, complete: any) => void;
}
declare const Store: StoreConstructor;
export interface component<P, S> extends ComponentClass<P> {
    displayName?: string;
    name?: string;
    resource?: Object;
}
export interface Stateless<P> extends StatelessComponent<P> {
    name?: string;
}
export declare const lift: (initialState?: {}) => <P, S>(component: component<P, S> | Stateless<P>) => any;
export declare type ResourceCB = (store: Store, any) => any;
export declare const resource: (source: any, success: string | ResourceCB, fail?: string | ResourceCB) => <T>(Component: any) => any;
export declare const getStore: () => StoreConstructor;
export default Store;
