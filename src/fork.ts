import { Component } from "react"
import { Observable, ReplaySubject } from "rxjs"
import { AsyncResource, ListenResource, Success } from "./inject"
import toObservable from "./utils/toObservable"

/**
 * 打开异步数据源:inject
 */
export function forkAsync<S extends object, C extends Component<Partial<S>, S>>(this: C, { source$, success }: AsyncResource<S>): Observable<S> {
    return source$ instanceof Function ? forkAsync.call(this, { source$: source$(), success }) : toObservable(source$).map(state => implSelector.call(this, state, success))
}

/** 打开监听数据源 listen */
export function forkListen<S extends object, C extends Component<Partial<S>, S>>(this: C, { source$, success }: ListenResource<S>, store$: Observable<[Partial<S>, Partial<S>]>): Observable<S> {
    return store$.switchMap(pairstore => forkAsync.call(this, { source$: source$(pairstore[0], pairstore[1]), success }))
}

export function implSelector<S, C extends Component<Partial<S>, S>, K extends keyof S>(this: C, state: S[K], success: Success<S>) {
    return typeof success === "string" ? ({ [success]: state }) : success(this.state, state)
}
