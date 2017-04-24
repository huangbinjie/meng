/// <reference types="react" />
import { Component } from "react";
import { Observable } from "rxjs";
import { AsyncResource, ListenResource, Success } from "./inject";
export declare function forkAsync<S extends object, C extends Component<Partial<S>, S>>(this: C, {source$, success}: AsyncResource<S>): Observable<S>;
export declare function forkListen<S extends object, C extends Component<Partial<S>, S>>(this: C, {source$, success}: ListenResource<S>, store$: Observable<[Partial<S>, Partial<S>]>): Observable<S>;
export declare function implSelector<S, C extends Component<Partial<S>, S>>(this: C, state: Partial<S>, success: Success<S>): object;
