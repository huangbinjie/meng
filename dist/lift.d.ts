import { Meng } from './';
export declare type State = {
    setState: (nextState: Object, callback?: () => void) => void;
    callback?: () => void;
};
export declare const lift: <P, S, T extends S & State>(initialState?: S, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>) => any;
