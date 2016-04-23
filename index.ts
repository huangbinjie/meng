import { Subject } from 'rxjs'
import { createElement, Component, ComponentClass } from 'react'

const subject = new Subject()
const Store = <any>{}

Store.setState = (state: Object) => subject.next(state)

type store = {
  state: Object,
  setState: Function
}
export interface component<P, S> extends ComponentClass<P> {
  displayName?: string
  name?: string
  resource?: Object
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
        currentSubject.subscribe(state => {
          const storeState = Object.assign(currentState, state)
          this.setState(storeState)
        })

        subject.subscribe(state => {
          const storeState = Object.assign(currentState, state)
          this.setState(storeState)
        })

        currentStore.state = currentState
        currentStore.setState = (state: Object) => currentSubject.next(state)

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