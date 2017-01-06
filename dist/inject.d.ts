/// <reference types="core-js" />
import { Observable } from 'rxjs';
import { Meng } from './';
export declare type Inject = Observable<any> | Promise<any> | (<S>(currentStore: S, nextStore: S) => Inject) | Object;
export declare type Success = string | ((state: Object) => Object);
export declare type Resource = {
    source$: Inject;
    success: Success;
};
export declare const inject: (source$: Inject, success: Success) => <P, S>(component: Meng.Component<P> | Meng.Stateless<P>) => any;
