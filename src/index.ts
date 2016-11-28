/// <reference path="/usr/local/lib/node_modules/typescript/lib/lib.es6.d.ts" />
import { ReplaySubject, Observable, Subscription } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent, ComponentLifecycle } from 'react'
import shallowEqual from './utils/shallowequal'

export interface Store<S> {
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

export type Inject = Observable<any> | Promise<any> | Function | Object

export type Success = (<S>(store: Store<S>, nextState: Object) => void) | string

export type Fail = (<S>(store: Store<S>, nextState: Object) => void) | string

export type Resource = { source$: Inject, success: Success }

/**
 * ImplStore
 * all store should instanceof this class
 */
export class ImplStore<S> implements Store<S> {
    constructor(initialState = <S>{}) {
        this.state.next(initialState)
    }

    private state = new ReplaySubject(1)
        .distinctUntilChanged(shallowEqual)
        .scan((currentState, nextState) => Object.assign(currentState, nextState), {}) as ReplaySubject<S>

    public children = {}

    public setState = (nextState: S, callback = () => { }) => {
        this.state.next(nextState)
        callback()
    }

    public subscribe = (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => {
        return this.state.subscribe(success, error, complete)
    }

}

function createProxy<T>(target: Store<T>): Store<T> & { [key: string]: Store<Object> } {
    return new Proxy<any>(target, {
        get(target, name) {
            if (name in target)
                return target[name]
            else
                return target.children[name]
        }
    })
}

const rootStore = createProxy(new ImplStore())

const inject = (source$: Inject, success: Success) =>
    <P, S>(component: Meng.Component<P> | Meng.Stateless<P>): any => {
        component.resource.push({ source$, success })
        return component
    }

const lift = <P, S>(initialState = <S>{}) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
    const displayName = component.displayName || component.name || Math.random().toString(32).substr(2)
    return class LiftedComponent extends Component<P, S> {
        static displayName = `Meng(${displayName})`
        static resource: Resource[] = []
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
            component.prototype["setState"] = currentStore.setState.bind(currentStore)
            rootStore.children[displayName] = currentStore
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

            const props = Object.assign({}, this.state, this.props)
            return createElement(component as ComponentClass<P>, props)
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
        const observer = source$.subscribe(successHandle(currentStore, success))
        this.observers.push(observer)
    }

    else if (source$ instanceof Function)
        fork.call(this, currentStore, { source$: source$(currentStore.getState()), success })

    else
        successHandle(currentStore, success)(source$)
}

const successHandle = <S>(store: Store<S>, success: Success) => (primitiveValue: Object) =>
    typeof success === "string" ? store.setState({ [success]: primitiveValue }) : success(store, primitiveValue)


export { lift, inject }

export default rootStore
