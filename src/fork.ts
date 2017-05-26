import { Component } from "react"
import { Observable, ReplaySubject } from "rxjs"
import { AsyncResource, ListenResource, Success } from "./inject"
import toObservable from "./utils/toObservable"

/** 打开异步数据源:inject
 * 
 * 对于null和undefined，forkAsync不再返回Observable.never()。而是返回null，交给其他步骤进行过滤。
 * never也是一种Observable，会导致forkListen的switch切换到never，从而把不该取消的上一个数据源给释放掉了。
 */
export function forkAsync<S extends object, C extends Component<Partial<S>, S>>(this: C, { source$, success }: AsyncResource<S>): Observable<S> | null {
    if (source$ instanceof Function) return forkAsync.call(this, { source$: source$(), success })
    else {
        const state$ = toObservable(source$)
        return state$ ? state$.map(state => implSelector.call(this, state, success)) : null
    }
}

/** 打开监听数据源 listen
 * 
 * 下一个inner Observable 有可能是null，则不应该dispose上一个Observable。
 * 比如已经发出去的请求，如果之后触发的条件不匹配，则不应该取消掉已发出去的请求。
 * 
 * 下一个inner Observable 如果非空, 则应该dispose上一个Observable。
 * 比如上一个请求在当前请求之后返回，会影响最后输出的值，还会render两次。所以要取消掉前者(switch)。
 */
export function forkListen<S extends object, C extends Component<Partial<S>, S>>(this: C, { source$, success }: ListenResource<S>, store$: Observable<[Partial<S>, Partial<S>]>): Observable<S> {
    return store$.map(pairstore => forkAsync.call(this, { source$: source$(pairstore[0], pairstore[1]), success })).filter(state => state !== null).switch<Observable<S>>()
}

export function implSelector<S, C extends Component<Partial<S>, S>, K extends keyof S>(this: C, state: S[K], success: Success<S>) {
    return typeof success === "string" ? ({ [success]: state }) : success(this.state, state)
}
