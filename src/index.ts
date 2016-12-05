import { ReplaySubject, Observable, Subscription } from 'rxjs'
import { StatelessComponent, ComponentLifecycle } from 'react'
import { Resource } from './inject'

export interface Store<S> {
    state$: ReplaySubject<S>
    store$: Observable<S>
    children: { [key: string]: Store<Object> }
    setState: Function,
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription
}

export namespace Meng {
    export interface Component<P> extends ComponentLifecycle<P, void> {
        displayName?: string
        name?: string
        resource?: [Resource],
        prototype: {}
    }

    export interface Stateless<P> extends StatelessComponent<P> {
        displayName?: string
        name?: string
        resource?: [Resource]
    }
}

/**
 * ImplStore
 * all store should instanceof this class
 */
export class ImplStore<S> implements Store<S> {
    constructor(initialState = <S>{}) {
        this.state$.next(initialState)
    }

    public store$ = Observable.of({})

    public state$ = new ReplaySubject(1)

    public children: { [key: string]: Store<Object> } = {}

    public setState = (nextState: S) => {
        this.state$.next(nextState)
    }

    public subscribe = (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => {
        return this.store$.subscribe(success, error, complete)
    }

}

const rootStore = new ImplStore()

export { lift } from './lift'
export { inject } from './inject'

export default rootStore
