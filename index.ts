import { Subject, Observable } from 'rxjs'
import { AjaxResponse, AjaxObservable } from 'rxjs/observable/dom/AjaxObservable'
import { createElement, Component, ComponentClass, StatelessComponent } from 'react'

const subject = new Subject()

export interface Store {
  "state": Object,
  setState: Function
  "@@subject": any
}

/**
 * StoreConstructor
 * all store must instanceof this class
 */
export class StoreConstructor implements Store {
  public "@@subject": any
  constructor(public state: Object, subject, public setState: Function) {
    this["@@subject"] = subject
  }
}

const Store = new StoreConstructor({}, subject, function (state: Object, callback = () => { }) {
  Object.assign(this.state, state)
  callback()
  subject.next(state)
})

export interface component<P, S> extends ComponentClass<P> {
  displayName?: string
  name?: string
  resource?: Object
}
export interface Stateless<P> extends StatelessComponent<P> {
  name?: string
}

type Action = {
  state: {}
  callback: () => any
}

declare var LiftedComponent: ComponentClass<any>

export const lift = (initialState?: Object) => <P, S>(component: component<P, S> | Stateless<P>): any => {
  const currentState = initialState || {}
  const currentSubject = new Subject()
  const displayName = component.displayName || component.name
  return class LiftedComponent extends Component<any, Object> {
    static displayName = `Lifted(${displayName})`
    static resource = []
    _isMounted = false
    componentWillUnmount() {
      Store[displayName] = null
      this._isMounted = false
    }
    componentWillMount() {
      const currentStore = new StoreConstructor(currentState, currentSubject, function (state: Object, callback = () => { }) { this["@@subject"].next({ state, callback }) })
      Store[displayName] = currentStore
      component.prototype.setState = currentStore.setState.bind(currentStore)

      currentStore["@@subject"].subscribe((sub: Action) => {
        const storeState = Object.assign(currentState, sub.state)
        this._isMounted ? this.setState(storeState, sub.callback) : currentStore.state = storeState
      })

      LiftedComponent.resource.map(obj => {
        const source = obj.source
        const success = obj.success
        const fail = obj.fail
        if (source instanceof Observable) source.subscribe(x => {
          if (x instanceof AjaxObservable) typeof success === "string" ? currentStore.setState({ [success]: x.response }) : success(x.response)
          else typeof success === "string" ? currentStore.setState({ [success]: x }) : success(x)
        }, y => {
          if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y)
        })
        else if (source instanceof Promise) source.then(
          x => typeof success === "string" ? currentStore.setState({ [success]: x }) : success(x),
          y => { if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y) }
        )
        else if (source instanceof StoreConstructor) {
          typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(source.state)
          source["@@subject"].subscribe(
            x => typeof success === "string" ? currentStore.setState({ [success]: source.state }) : success(source.state),
            y => {
              if (fail) typeof fail === "string" ? currentStore.setState({ [fail]: y }) : fail(y)
            })
        }
        else typeof success === "string" ? currentStore.setState({ [success]: source }) : success(source)
      })

    }
    componentDidMount() {
      this._isMounted = true
    }
    render() {
      const props = Object.assign({}, this.props, currentState)
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