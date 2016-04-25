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

var ConnectComponent

export const lift = (initialState?: Object) => <P, S>(component: component<P, S> | Stateless<P>): any => {
  const currentState = initialState || {}
  const currentSubject = new Subject()
  const displayName = component.displayName || component.name
  return class ConnectComponent extends Component<any, Object> {
    static displayName = `Connect(${displayName})`
    static resource = {}
    componentWillUnmount() {
      Store[displayName] = null
    }
    componentWillMount() {
      currentSubject.subscribe((sub: Action) => {
        const storeState = Object.assign(currentState, sub.state)
        this.setState(storeState, sub.callback)
      })

      const currentStore = new StoreConstructor(currentState, currentSubject, function (state: Object, callback = () => { }) { this["@@subject"].next({ state, callback }) })

      Store[displayName] = currentStore

      for (let i in ConnectComponent.resource) {
        const value = ConnectComponent.resource[i]
        if (value instanceof AjaxObservable) value.subscribe((x: AjaxResponse) => currentStore.setState({ [i]: x.response }), y => currentStore.setState({ [i]: y }))
        else if (value instanceof StoreConstructor) {
          currentStore.setState({ [i]: value.state })
          value["@@subject"].subscribe(x => currentStore.setState({ [i]: value.state }))
        }
        else currentStore.setState({ [i]: value })
      }

    }
    render() {
      const props = Object.assign({ setState: Store[displayName].setState }, this.props, currentState)
      return createElement(component, props)
    }
  }
  // return ConnectComponent
}

export const resource = (source: any, name: string) =>
  <T>(Component: any) => {
    Component.resource[name] = source
    return Component
  }

export const getStore = () => Store

export default Store