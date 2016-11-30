/// <reference path="/usr/local/lib/node_modules/typescript/lib/lib.es6.d.ts" />
import { ReplaySubject, Observable, Subscription } from 'rxjs'
import { createElement, Component, ComponentClass, StatelessComponent, ComponentLifecycle } from 'react'
import shallowEqual from './utils/shallowequal'

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

export type Inject = Observable<any> | Promise<any> | (<S>(state?: S) => Inject) | Object

export type Success = string | ((state: Object) => Object)

export type Resource = { source$: Inject, success: Success }

/**
 * ImplStore
 * all store should instanceof this class
 */
export class ImplStore<S> implements Store<S> {
    constructor(initialState = <S>{}) {
        this.state$.next(Object.assign({ setState: this.setState, callback: () => { } }, initialState))
    }

    public store$: Observable<S & { setState: Function, callback: () => void }>

    public state$ = new ReplaySubject(1)
        .scan((currentState, nextState) => Object.assign(currentState, nextState), {}) as ReplaySubject<S & { setState: Function, callback: () => void }>

    public children = {}

    public setState = (nextState: S, callback = () => { }) => {
        this.state$.next(Object.assign(nextState, { setState: this.setState, callback }))
    }

    public subscribe = (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => {
        return this.store$.subscribe(success, error, complete)
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

const lift = <P, S>(initialState = <S>{}, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
    const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
    return class LiftedComponent extends Component<P, S> {
        static displayName = `Meng(${displayName})`
        static resource: Resource[] = []
        private hasStoreStateChanged: boolean
        private _isMounted = false
        private subscription: Subscription //存放disposable

        componentWillUnmount() {
            rootStore[displayName] = null
            this._isMounted = false
            this.hasStoreStateChanged = false
            this.subscription.unsubscribe()
        }

        componentWillReceiveProps(nextProps: P) {
            rootStore[displayName].setState(nextProps)
        }

        componentWillMount() {
            //创建自己的store
            const currentStore = new ImplStore(initialState)
            //把自己的store挂在全局store里面
            rootStore.children[displayName] = currentStore
            //合并props到main$
            currentStore.store$ = currentStore.state$.combineLatest(Observable.of(this.props), combineLatestSelector)
            //合并各路数据源到main$
            LiftedComponent.resource.forEach(source => currentStore.store$ = fork(currentStore.store$, source))
            //监听合并完之后的自己的状态源
            this.subscription = currentStore.store$
                .subscribe(state => {
                    if (!shallowEqual(state, this.state)) {
                        this.hasStoreStateChanged = true
                        this.setState(state, state.callback)
                    }
                })

        }
        componentDidMount() {
            this._isMounted = true
        }
        shouldComponentUpdate() {
            return this.hasStoreStateChanged
        }
        render() {
            this.hasStoreStateChanged = false

            const props = Object.assign({}, initialState, <S & P>this.state)
            return createElement(component as ComponentClass<P>, props)
        }
    }
    // return ConnectComponent
}

function fork<P, S>(store$: Observable<S>, {source$, success}: Resource): Observable<S> {

    // stream
    if (source$ instanceof Observable)
        return store$.combineLatest(source$.map(source => Object.assign(source, { callback: () => { } })).map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector)

    // Promise
    else if (source$ instanceof Promise)
        return store$.combineLatest(Observable.fromPromise(source$).map(source => Object.assign(source, { callback: () => { } })).map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector)

    // Store
    else if (source$ instanceof ImplStore)
        return store$.combineLatest(source$.state$.map(source => Object.assign(source, { callback: () => { } })).map(source => typeof success === "string" ? ({ [success]: source }) : success(source)), combineLatestSelector)

    //需要状态的函数需要被再次执行
    else if (source$ instanceof Function && source$.length > 0) {
        const merge$ = store$.flatMap(state => fork(store$, { source$: source$(state), success }).map(state => Object.assign(state, { callback: () => { } })))
        return store$.combineLatest(merge$, combineLatestSelector)
    }

    //不需要状态的函数一次性执行
    else if (source$ instanceof Function && source$.length === 0)
        return fork(store$, { source$: source$(), success })

    else
        return store$.map(state => Object.assign(state, typeof success === "string" ? ({ [success]: source$ }) : success(source$)))
}

const combineLatestSelector = (acc: Object, x: Object) => Object.assign(acc, x)

export { lift, inject }

export default rootStore
