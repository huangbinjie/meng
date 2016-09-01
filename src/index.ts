import { Subject, Observable, Subscription } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent } from 'react'
import shallowEqual from './utils/shallowEqual'
import hashString from './utils/hash'

const subject = new Subject()

export interface Store {
  "state": Object,
  setState: Function
  "@@subject": Subject<Object>
}

/**
 * StoreConstructor
 * all store must instanceof this class
 */
export class StoreConstructor implements Store {
  public "@@subject": Subject<Object>
  constructor(public state: Object, subject: Subject<Object>, public setState: Function) {
    this["@@subject"] = subject
  }
}

const Store = new StoreConstructor({}, subject, function (state: Object, callback = () => { }) {
  Object.assign(this.state, state)
  subject.next(state)
  callback()
})

/** dumb组件类型1 */
export interface component<P, S> extends ComponentClass<P> {
  displayName?: string
  name?: string
  resource?: Object
}
/** dumb组件类型2 */
export interface Stateless<P> extends StatelessComponent<P> {
  name?: string
}

/** subject.next接收的类型 */
type Action = {
  state: {}
  callback: () => any
}

declare var LiftedComponent: ComponentClass<any>

export const lift = (initialState = {}) => <P, S>(component: component<P, S> | Stateless<P>): any => {
  const displayName = component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<any, Object> {
    static displayName = `Lifted(${displayName})`
    static resource = []
    haveOwnPropsChanged: boolean
    hasStoreStateChanged: boolean
    _isMounted = false
    observers: Subscription[] = [] //存放disposable

    componentWillUnmount() {
      Store[displayName] = null
      this._isMounted = false
      this.haveOwnPropsChanged = false
      this.hasStoreStateChanged = false
      this.observers.map(observer => {
        observer.unsubscribe()
        observer.remove(observer)
      })
    }
    componentWillReceiveProps(nextProps) {
      if (!shallowEqual(nextProps, this.props)) {
        this.haveOwnPropsChanged = true
        //当参数更改了，这个特殊的数据源需要再次被调用
        for (let obj of LiftedComponent.resource) {
          if (obj.source instanceof Function || obj.source.length > 0) {
            fork.call(this, Store[displayName], nextProps, obj)
          }
        }
      }
    }
    componentWillMount() {
      const currentStore = new StoreConstructor(Object.assign({}, initialState), new Subject(), function (state: Object, callback = () => { }) { this["@@subject"].next({ state, callback }) })
      component.prototype.setState = currentStore.setState.bind(currentStore)
      Store[displayName] = currentStore
      const observer = currentStore["@@subject"].subscribe((sub: Action) => {
        const storeState = Object.assign(currentStore.state, sub.state)
        this.hasStoreStateChanged = true
        this.setState(storeState, sub.callback)
      })

      this.observers.push(observer)

      LiftedComponent.resource.map(obj => fork.call(this, currentStore, this.props, obj))

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

      const props = Object.assign({ setState: Store[displayName].setState.bind(Store[displayName]) }, Store[displayName].state, this.props)
      return createElement(component, props)
    }
  }
  // return ConnectComponent
}

function fork(currentStore, props, {source, success, fail = () => { } }) {
  if (source instanceof Observable) {
    const observer = source.subscribe(x => {
      if (x instanceof AjaxObservable) typeof success === "string" ? currentStore.setState({ [success]: x.response }) : success(currentStore, x.response)
      else typeof success === "string" ? currentStore.setState({ [success]: x }) : success(currentStore, x)
    }, y => errorHandle(currentStore, fail, y)
    )
    return this.observers.push(observer)
  }
  if (window["Promise"] && source instanceof Promise) return source.then(
    x => typeof success === "string" ? currentStore.setState({ [success]: x }) : success(currentStore, x),
    y => errorHandle(currentStore, fail, y)
  )
  if (source instanceof StoreConstructor) {
    typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(currentStore, source.state)
    const observer = source["@@subject"].subscribe(
      x => typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(currentStore, x),
      y => errorHandle(currentStore, fail, y)
    )
    return this.observers.push(observer)
  }
  if (source instanceof Function) {
    return fork.call(this, currentStore, props, { source: source(props), success, fail })
  }

  typeof success === "string" ? currentStore.setState({ [success]: source }) : success(currentStore, source)
}

const errorHandle = (currentStore, fail, y) => typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(currentStore, y)

export type ResourceCB = (store: Store, any) => any
export const resource = (source: any, success: string | ResourceCB, fail?: string | ResourceCB) =>
  <T>(Component: any) => {
    Component.resource.push({ source, success, fail })
    return Component
  }

export const getStore = () => Store

export default Store
