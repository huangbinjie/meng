import { ComponentClass } from 'react';
declare const Store: any;
export interface component<P> extends ComponentClass<P> {
    displayName?: string;
    name?: string;
    resource?: Object;
}
export declare const lift: (initialState?: Object) => <P>(component: component<P>) => component<any>;
export declare const resource: (source: any, name: string) => <T>(Component: component<T>) => component<T>;
export declare const getStore: () => any;
export default Store;
