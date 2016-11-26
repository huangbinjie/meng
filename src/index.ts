import { ReplaySubject, Observable, Subscription } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent } from 'react'
import shallowEqual from './utils/shallowequal'

export interface Store<S> {
    childrens: [Store]
    setState: Function,
    getState: () => S
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription
}

export namespace Meng {
    /** dumb组件类型1 */
    export interface Component<P> extends ComponentClass<P> | StatelessComponent < P > {
        displayName?: string
        name?: string
        resource?: [Resource],
        prototype: {}
    }
}

export type Inject = Observable<any> | Promise<any> | Function | Object

export type Success = (<S>(store: Store<S>, nextState: Object) => void) | string

export type Fail = (<S>(store: Store<S>, nextState: Object) => void) | string

export type Resource = { source$: Inject, success: Success }

/**
 * ImplStore
 * all store must instanceof this class
 */
export class ImplStore<S> implements Store<S> {
    constructor(initialState = <S>{}) {
        this.state.next(initialState)
    }

    private state = new ReplaySubject(1)
        .distinctUntilChanged(shallowEqual)
        .scan((currentState, nextState) => Object.assign(currentState, nextState), {}) as ReplaySubject<S>

    public childrens = []

    public setState = (nextState: S, callback = () => { }) => {
        this.state.next(nextState)
        callback()
    }

    public getState = () => this.state.toPromise()

    public subscribe = (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => {
        return this.state.subscribe(success, error, complete)
    }

}

function createProxy<T>(target: T): T & ProxyProps {
    // Implement proxy that provides foo and bar properties
}

const rootStore = new Proxy(new ImplStore(), {
    get(target, name) {
        if (!name in target)
            return target.childrens[name]
        else
            return target[name]
    }
})

const inject = (source$: Inject, success: Success) =>
    <P, S>(component: Meng.Component<P, S> | Meng.Stateless<P>): ComponentClass => {
        component.resource.push({ source$, success })
        return Component
    }

const lift = <P>(initialState = <S>{}) => (component: Meng.Component<P>): ComponentClass => {
    const displayName = component.displayName || component.name || Math.random().toString(32).substr(2)
    return class LiftedComponent extends Component<P, S> {
        static displayName = `Meng(${displayName})`
        static resource: [Resource]
        private haveOwnPropsChanged: boolean
        private hasStoreStateChanged: boolean
        private _isMounted = false
        private subscriptions: Subscription[] = [] //存放disposable

        componentWillUnmount() {
            rootStore[displayName] = null
            this._isMounted = false
            this.haveOwnPropsChanged = false
            this.hasStoreStateChanged = false
            this.subscriptions.map(subscription => {
                subscription.unsubscribe()
                subscription.remove(subscription)
            })
        }

        componentWillReceiveProps(nextProps: P) {
            if (!shallowEqual(nextProps, this.props)) {
                this.haveOwnPropsChanged = true
            }
        }

        componentWillMount() {
            const currentStore = new ImplStore(initialState)
            component.prototype.setState = currentStore.setState.bind(currentStore)
            rootStore[displayName] = currentStore
            const observer = currentStore.subscribe((state: S) => {
                this.hasStoreStateChanged = true
                this.setState(state)
                LiftedComponent.resource
                    .filter(source => source.source$ instanceof Function && source.source$.length > 0)
                    .forEach(source => fork.call(this, rootStore[displayName], source))
            })

            this.subscriptions.push(observer)

            LiftedComponent.resource.forEach(source => fork.call(this, currentStore, source))

        }
        componentDidMount() {
            this._isMounted = true
        }
        shouldComponentUpdate() {
            return this.haveOwnPropsChanged || this.hasStoreStateChanged
        }
        render() {
            this.haveOwnPropsChanged = false
            this.hasStoreStateChanged = false

            const props = Object.assign({}, (<Store<S>>rootStore[displayName]).getState(), this.props)
            return createElement(component, props)
        }
    }
    // return ConnectComponent
}

function fork<P, S>(currentStore: Store<S>, {source$, success}: Resource) {
    if (source$ instanceof Observable) {
        const observer = source$.subscribe(successHandle(currentStore, success))
        this.observers.push(observer)
    }

    else if (source$ instanceof Promise)
        source$.then(successHandle(currentStore, success))

    else if (source$ instanceof ImplStore) {
        const observer = source$.state.subscribe(successHandle(currentStore, success))
        this.observers.push(observer)
    }

    else if (source$ instanceof Function)
        fork.call(this, currentStore, { source$: source$(currentStore.getState()), success })

    else
        successHandle(currentStore, success)(source$)
}

const successHandle = <S>(store: Store<S>, success: Success) => (primitiveValue: Object) =>
    typeof success === "string" ? store.setState({ [success]: primitiveValue }) : success(store, primitiveValue)


export { lift, inject, foo }

export default rootStore
