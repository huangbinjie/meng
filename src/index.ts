/// <reference path="/usr/local/lib/node_modules/typescript/lib/lib.es6.d.ts" />
import { ReplaySubject, Observable, Subscription } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent, ComponentLifecycle } from 'react'
import shallowEqual from './utils/shallowequal'

export interface Store<S> {
  state$: ReplaySubject<S>
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

export type Resource = { source$: Inject, success?: string }

/**
 * ImplStore
 * all store should instanceof this class
 */
export class ImplStore<S> implements Store<S> {
  constructor(initialState = <S>{}) {
    this.state$.next(initialState)
  }

  public state$ = new ReplaySubject(1)
    .distinctUntilChanged(shallowEqual)
    .scan((currentState, nextState) => Object.assign(currentState, nextState), {}) as ReplaySubject<S>

  public main$: ReplaySubject<[S & { children: React.ReactNode }, any]>

  public children = {}

  public setState = (nextState: S, callback = () => { }) => {
    (this.state$.do(callback) as ReplaySubject<S>).next(nextState)
  }

  public subscribe = (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => {
    return this.state$.subscribe(success, error, complete)
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

const inject = (source$: Inject, success?: string) =>
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
    private subscription: Subscription //存放disposable

    componentWillUnmount() {
      rootStore[displayName] = null
      this._isMounted = false
      this.haveOwnPropsChanged = false
      this.hasStoreStateChanged = false
      this.subscription.unsubscribe()
    }

    componentWillReceiveProps(nextProps: P) {
      rootStore[displayName].setState(nextProps)
    }

    componentWillMount() {
      //创建自己的store
      const currentStore = new ImplStore(initialState)
      //修改原生的setState，改成meng的setstate
      component.prototype["setState"] = currentStore.setState.bind(currentStore)
      //把自己的store挂在全局store里面
      rootStore.children[displayName] = currentStore
      //合并props到main$
      currentStore.main$ = <any>currentStore.state$.combineLatest(Observable.of(this.props))
      //合并各路数据源到main$
      LiftedComponent.resource.forEach(source => currentStore.main$ = fork.call(this, currentStore.main$, source))
      //监听合并完之后的自己的状态源
      this.subscription = currentStore.main$
        .map(states => (<any>states).reduce((acc: Object, nextState: Object) => Object.assign(acc, nextState), {}))
        .subscribe((state: S) => {
          this.hasStoreStateChanged = true
          this.setState(state)
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

      const props = Object.assign({}, <S & P>this.state)
      return createElement(component as ComponentClass<P>, props)
    }
  }
  // return ConnectComponent
}

function fork<P, S>(main$: ReplaySubject<S>, {source$, success}: Resource): Observable<[S, any]> {

  // stream
  if (source$ instanceof Observable)
    return main$.combineLatest(source$.map(source => success ? ({ [success]: source }) : source))


  // Promise
  else if (source$ instanceof Promise)
    return main$.combineLatest(Observable.fromPromise(source$).map(source => success ? ({ [success]: source }) : source))

  // Store
  else if (source$ instanceof ImplStore)
    return main$.combineLatest(source$.state$.map(source => success ? ({ [success]: source }) : source))

  //需要状态的函数需要被lift
  else if (source$ instanceof Function && source$.length > 0)
    return main$.concatMap(state => fork(main$, { source$: source$(state), success }))

  //不需要状态的函数一次性执行
  else if (source$ instanceof Function && source$.length === 0)
    return fork(main$, { source$: source$(), success })

  else
    return main$.combineLatest(Observable.of(success ? ({ [success]: source$ }) : source$))
}


export { lift, inject }

export default rootStore
