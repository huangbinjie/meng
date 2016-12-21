import { Meng } from './';
export declare const lift: <P, S extends {
    setState: any;
    callback: () => void;
}>(initialState?: S, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>) => any;
