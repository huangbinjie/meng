import { ComponentClass, StatelessComponent } from 'react';
export interface Store {
    "state": Object;
    setState: Function;
    "@@subject": any;
}
export declare class StoreConstructor implements Store {
    state: Object;
    setState: Function;
    "@@subject": any;
    constructor(state: Object, subject: any, setState: Function);
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
export declare const resource: (source: any, success: string | Function, fail?: string | Function) => <T>(Component: any) => any;
export declare const getStore: () => StoreConstructor;
export default Store;
