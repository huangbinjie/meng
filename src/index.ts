import { ReplaySubject, Observable, Subscription } from "rxjs"
import { StatelessComponent, ComponentLifecycle } from "react"
import shallowPartialEqual from "./utils/shallowPartialEqual"

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
export class ImplStore<S> implements IStore<S> {
    public store$: Observable<S & { _callback?: () => void }>
    public state$ = new ReplaySubject(1)
    public children: { [key: string]: IStore<S> } = {}
    constructor(initialState = {} as S) {
        this.state$.next(initialState)
        this.store$ = this.state$.distinctUntilChanged(shallowPartialEqual).scan((acc, x) => ({ ...acc, ...x }))
    }
    public setState = (nextState: Partial<S>, callback?: () => void) => {
        this.state$.next(Object.assign({ _callback: callback }, nextState))
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
