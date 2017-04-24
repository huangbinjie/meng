/// <reference types="react" />
import { StatelessComponent, ComponentClass } from "react";
export declare type Extral<S> = {
    setState: (nextState: Partial<S>, callback?: () => void) => void;
    _callback?: () => void;
};
export declare const lift: <P, S, M extends S & P & Extral<S & P>>(initialState?: S, initialName?: string | undefined) => (component: ComponentClass<Partial<M>> | StatelessComponent<Partial<M>>) => any;
