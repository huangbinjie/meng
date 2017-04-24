import { Observable, ReplaySubject } from "rxjs"
import { AsyncResource, ListenResource, Success } from "./inject"
import { ImplStore } from "./"

/**
 * 打开异步数据源:inject
 */
export function forkAsync<S extends object>({ source$, success }: AsyncResource): Observable<S> {
    // 函数数据源有可能返回undefined
    if (source$ == void 0)
        return Observable.never()

    // observable
    else if (source$ instanceof Observable)
        return source$.map(implSelector.call(this, success))

    // Promise
    else if (source$ instanceof Promise)
        return Observable.fromPromise(source$).map(implSelector.call(this, success))

    // Store
    else if (source$ instanceof ImplStore)
        return source$.store$.map(implSelector.call(this, success))

    // 不需要状态的函数继续执行
    else if (source$ instanceof Function && source$.length === 0)
        return forkAsync({ source$: source$(), success })

    else
        return Observable.of(source$).map(implSelector.call(this, success))
}

/** 打开监听数据源 listen */
export function forkListen<S extends object>({ source$, success }: ListenResource<S>, store$: Observable<[Partial<S>, Partial<S>]>): Observable<S> {
    return store$.flatMap(pairstore => forkAsync({ source$: source$(pairstore[0], pairstore[1]), success }))
}

export function implSelector<S>(success: Success<S>) {
    return (state: object) => typeof success === "string" ? ({ [success]: state }) : success(this.state, state)
}
