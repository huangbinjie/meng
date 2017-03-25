import { Observable, ReplaySubject } from 'rxjs'
import { ObservableInput } from 'rxjs/Observable'
import symbolObservable from 'symbol-observable'
import { Resource, Success } from './inject'
import { ImplStore } from './'

/**
 * 打开数据源
 */
export function fork<S>({ source$, success }: Resource, store$?: Observable<[S, S]>): Observable<S> {
    //函数数据源有可能返回undefined
    if (source$ == void 0)
        return Observable.never()

    // observable
    else if (Boolean((source$ as any)[symbolObservable]))
        return (source$ as Observable<S>).map(implSelector(success))

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

    else
        return Observable.of(source$).map(implSelector(success))
}

export const combineLatestSelector = (acc: Object, x: Object) => Object.assign(acc, x)

export const resetCallback = (state: Object) => Object.assign(state, { callback: () => { } })

export const implSelector = (success: Success) => (state: Object) => typeof success === "string" ? ({ [success]: state }) : success(state)

export const nullCheck = (state: Object) => state != void 0