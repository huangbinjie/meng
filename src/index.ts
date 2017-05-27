import { ReplaySubject, Observable, Subscription } from "rxjs"
import { StatelessComponent, ComponentLifecycle } from "react"
import shallowPartialEqual from "./utils/shallowPartialEqual"
import toObservable from "./utils/toObservable"

export interface IStore<S> {
    state$: ReplaySubject<S>
    store$: Observable<S>
    children: { [key: string]: IStore<S> }
    setState: (nextState: Partial<S>, callback?: () => void) => void,
    subscribe: (success: (state: S) => void, error?: (error: Error) => void, complete?: () => void) => Subscription
}

/**
 * ImplStore
 * all store should instanceof this class
 */
export class ImplStore<S extends object> implements IStore<S> {
    public store$: Observable<S & { _callback?: () => void }>
    public state$ = new ReplaySubject(1)
    public children: { [key: string]: IStore<S> } = {}
    constructor(initialState = {} as S) {
        this.state$.next(toObservable(initialState) || {})
        this.store$ = this.state$.mergeAll<Observable<S>>().distinctUntilChanged(shallowPartialEqual).scan((acc: S, x: Partial<S>) => Object.assign(acc, x))
    }
    public setState = (nextState: Partial<S>, callback = (error?: Error) => { }) => {
        const state$ = toObservable(nextState)
        // .map(state => Object.assign(state, ...))会导致componentWillReceiveProps的setstate不工作
        const nextState$ = state$ ?
            state$
                .map(state => Object.assign({}, state, { _callback: callback }))
                .catch(error => {
                    callback(error)
                    return Observable.never()
                }) :
            {}
        this.state$.next(nextState$)
    }
    public subscribe = (success: (state: S & { _callback?: () => void }) => void, error?: (error: Error) => void, complete?: () => void) => {
        return this.store$.subscribe(store => {
            const callback = store._callback || (() => { })
            delete store._callback
            success(store)
            callback()
        }, error, complete)
    }

}

const rootStore = new ImplStore()

export { lift } from "./lift"
export { inject, listen } from "./inject"

export default rootStore
