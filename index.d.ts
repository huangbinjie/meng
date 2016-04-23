import { ComponentClass } from 'react';
declare const Store: any;
export interface component<P, S> extends ComponentClass<P> {
    displayName?: string;
    name?: string;
    resource?: Object;
}
export declare const lift: (initialState?: Object) => <P, S>(component: component<P, S>) => any;
export declare const resource: (source: any, name: string) => <T>(Component: any) => any;
export declare const getStore: () => any;
export default Store;
