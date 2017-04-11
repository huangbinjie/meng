/// <reference types="react" />
import { StatelessComponent, ComponentClass } from 'react';
export declare type State = {
    setState: (nextState: Object, callback?: () => void) => void;
    callback?: () => void;
};
export declare const lift: <P, S, T extends S & State>(initialState?: P, initialName?: string | undefined) => (component: ComponentClass<P> | StatelessComponent<P>) => any;
