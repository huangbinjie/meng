/// <reference types="react" />
import { ObservableInput } from "rxjs/Observable";
import { ComponentClass } from "react";
export declare type Inject = ObservableInput<Object> | (() => any) | Object;
export declare type Listen<S> = (currentStore: Partial<S>, nextStore: Partial<S>) => Inject;
export declare type Success<S> = string | ((currentState: S, state: Partial<S>) => object);
export declare type AsyncResource<S> = {
    source$: Inject;
    success: Success<S>;
};
export declare type ListenResource<S> = {
    source$: Listen<S>;
    success: Success<S>;
};
export declare const inject: <S>(source$: Inject, success: Success<S>) => <S>(component: ComponentClass<S>) => any;
export declare const listen: <S>(source$: Listen<S>, success: Success<S>) => <S>(component: ComponentClass<S>) => any;
