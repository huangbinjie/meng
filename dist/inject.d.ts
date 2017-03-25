import { ObservableInput } from 'rxjs/Observable';
import { Meng } from './';
export declare type Inject = ObservableInput<any>;
export declare type Success = string | ((state: Object) => Object);
export declare type Resource = {
    source$: Inject;
    success: Success;
};
export declare const inject: (source$: ObservableInput<any>, success: Success) => <P, S>(component: Meng.Component<P> | Meng.Stateless<P>) => any;
