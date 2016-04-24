import { Subject } from 'rxjs'
import { createElement, Component, ComponentClass } from 'react'

const subject = new Subject()
const Store = {
  state: {},
  setState: (state: Object, callback = () => { }) => {
    Object.assign(this.state, state)
    callback()
    subject.next(state)
  }
}

// Store.setState = (state: Object, callback = () => {}) => {
//   Object.assign(Store.state)
//   subject.next({state,callback})
// }

type store = {
  state: Object,
  setState: Function
}
export interface component<P, S> extends ComponentClass<P> {
  displayName?: string
  name?: string
  resource?: Object
}

type Action = {
  state: {}
  callback: () => any
}

var ConnectComponent

export const lift = (initialState?: Object) => <P, S>(component: component<P, S>): any => {
  const currentState = initialState || {}
  const currentStore = <store>{}
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

      subject.subscribe(state => this.forceUpdate())

      currentStore.state = currentState
      currentStore.setState = (state: Object, callback = () => { }) => currentSubject.next({ state, callback })

      Store[displayName] = currentStore

      const keys = Object.keys(ConnectComponent.resource)

      keys.map((key: any) => {
        if (ConnectComponent.resource[key]._isScalar) ConnectComponent.resource[key].subscribe(x => currentStore.setState({ [key]: x }), y => currentStore.setState({ [key]: y }))
        else currentStore.setState({ [key]: ConnectComponent.resource[key] })
      })

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