import { Observable, ReplaySubject, Subscription } from "rxjs"
import { ObservableInput, Subscribable } from "rxjs/Observable"
import { StatelessComponent, ComponentLifecycle } from "react"
import shallowPartialEqual from "./utils/shallowPartialEqual"
import toObservable from "./utils/toObservable"

export interface IStore<S> {
    state$: ReplaySubject<Observable<Partial<S>>>
    store$: Observable<S>
    children: { [key: string]: IStore<S> }
    setState: (nextState: Partial<S> | ObservableInput<Partial<S>>, callback?: () => void) => void,
    subscribe: (success: (state: S) => void, error?: (error: Error) => void, complete?: () => void) => Subscription
}

/**
 * ImplStore
 * all store is this class's instantiation
 */
export class ImplStore<S> implements IStore<S> {
    public store$: Observable<S & { _callback?: () => void }>
    public state$ = new ReplaySubject<Observable<Partial<S>>>(1)
    public children: { [key: string]: IStore<S> } = {}
    constructor(initialState = {} as S) {
        const observableState = toObservable(initialState)
        if (observableState) this.state$.next(observableState)
        this.store$ = this.state$.mergeAll().distinctUntilChanged(shallowPartialEqual).scan((acc: S, x: Partial<S>) => Object.assign(acc, x)) as Observable<S>
    }
    // 如果 callback 不存在则继续往下抛，最终会被主分支的 catch 捕获到
    public setState = (nextState: Partial<S> | ObservableInput<Partial<S>>, callback?: (error?: any) => void) => {
        const state$ = toObservable<S>(nextState)
        // .map(state => Object.assign(state, ...))会导致componentWillReceiveProps的setstate不工作
        if (state$) {
            const nextState$ = state$
                .map(state => Object.assign({}, state, { _callback: callback }))
                .catch((error, caught) => {
                    if (callback) {
                        callback(error)
                    }
                    return Observable.throw(error)
                })
            this.state$.next(nextState$)
        }
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
export { error } from "./error"

export default rootStore
