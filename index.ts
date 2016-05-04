import { Subject, Observable, Subscription } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent } from 'react'

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
  callback()
  subject.next(state)
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
  const currentSubject = new Subject()
  const displayName = component.displayName || component.name
  return class LiftedComponent extends Component<any, Object> {
    static displayName = `Lifted(${displayName})`
    static resource = []
    _isMounted = false
    observers: Subscription[] = [] //存放disposable
    componentWillUnmount() {
      Store[displayName] = null
      this._isMounted = false
      this.observers.map(observer => {
        observer.unsubscribe()
        observer.remove(observer)
      })
    }
    componnetRecieveProps() {

    }
    componentWillMount() {
      const currentStore = new StoreConstructor(initialState, currentSubject, function (state: Object, callback = () => { }) { this["@@subject"].next({ state, callback }) })
      component.prototype.setState = currentStore.setState.bind(currentStore)
      Store[displayName] = currentStore
      const observer = currentStore["@@subject"].subscribe((sub: Action) => {
        const storeState = Object.assign(initialState, Store[displayName].state, sub.state)
        this._isMounted ? this.setState(storeState, sub.callback) : currentStore.state = storeState
      })

      this.observers.push(observer)

      LiftedComponent.resource.map(obj => {
        const source = obj.source
        const success = obj.success
        const fail = obj.fail
        if (source instanceof Observable) {
          const observer = source.subscribe(x => {
            if (x instanceof AjaxObservable) typeof success === "string" ? currentStore.setState({ [success]: x.response }) : success(x.response)
            else typeof success === "string" ? currentStore.setState({ [success]: x }) : success(x)
          }, y => {
            if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y)
          })
          this.observers.push(observer)
        }
        else if (source instanceof Promise) source.then(
          x => typeof success === "string" ? currentStore.setState({ [success]: x }) : success(x),
          y => { if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y) }
        )
        else if (source instanceof StoreConstructor) {
          typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(source.state)
          const observer = source["@@subject"].subscribe(
            x => typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(source.state),
            y => {
              if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y)
            })
          this.observers.push(observer)
        }
        else typeof success === "string" ? currentStore.setState({ [success]: source }) : success(source)
      })

    }
    componentDidMount() {
      this._isMounted = true
    }
    render() {
      const props = Object.assign({ setState: Store[displayName].setState.bind(Store[displayName]) }, this.props, Store[displayName].state)
      return createElement(component, props)
    }
  }
  // return ConnectComponent
}

export const resource = (source: any, success: string | Function, fail?: string | Function) =>
  <T>(Component: any) => {
    Component.resource.push({ source, success, fail })
    return Component
  }

export const getStore = () => Store

export default Store