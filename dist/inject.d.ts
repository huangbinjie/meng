/// <reference types="react" />
import { ObservableInput } from 'rxjs/Observable';
import { ComponentClass } from 'react';
export declare type Inject = ObservableInput<any>;
export declare type Success = string | ((state: Object) => Object);
export declare type Resource = {
    source$: Inject;
    success: Success;
};
export declare const inject: (source$: ObservableInput<any>, success: Success) => <P, S>(component: ComponentClass<P>) => any;
