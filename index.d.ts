import { ComponentClass } from 'react';
declare const Store: any;
export declare const connect: <T, S>(mapState: <T>(state: Object) => T, initialState?: Object) => (component: any) => ComponentClass<any>;
export declare const resource: <T>(source: any, name: string) => (Component: any) => any;
export declare const getStore: () => any;
export default Store;
