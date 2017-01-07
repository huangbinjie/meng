import { Observable, ReplaySubject } from 'rxjs'
import { Resource, Success } from './inject'
import { ImplStore } from './'

/**
 * 合并数据源
 */
export function fork<S>({source$, success}: Resource, store$?: Observable<[S, S]>): Observable<S> {

    // stream
    if (source$ instanceof Observable)
        return source$.map(implSelector(success))

    // Promise
    else if (source$ instanceof Promise)
        return Observable.fromPromise(source$).map(implSelector(success))

    // Store
    else if (source$ instanceof ImplStore)
        return source$.store$.map(implSelector(success))

    //function，需要状态的函数换需要监听store$
    else if (source$ instanceof Function && source$.length > 0)
        return store$.flatMap(pairstore => fork({ source$: source$(pairstore[0], pairstore[1]), success }, store$))

    //不需要状态的函数继续执行
    else if (source$ instanceof Function && source$.length === 0)
        return fork({ source$: source$(), success }, store$)

    //函数数据源有可能返回undefined
    else if (source$ == void 0)
        return Observable.never()

    else
        return Observable.of(source$).map(implSelector(success))
}

export const combineLatestSelector = (acc: Object, x: Object) => Object.assign(acc, x)

export const resetCallback = (state: Object) => Object.assign(state, { callback: () => { } })

export const implSelector = (success: Success) => (state: Object) => typeof success === "string" ? ({ [success]: state }) : success(state)

export const nullCheck = (state: Object) => state != void 0