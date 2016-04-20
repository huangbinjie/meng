import { Subject } from 'rxjs'
import { createElement, Component, ComponentClass } from 'react'

const subject = new Subject()
const Store = <any>{}

Store.setState = (state: Object) => subject.next(state)

type mapState = <T>(state: Object) => T
type store = {
  state: Object,
  setState: Function
}

export const connect = <T, S>(mapState: mapState, initialState?: Object) =>
  (component: ComponentClass<T> | any): ComponentClass<any> => {
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
          this.setState({ storeState })
        })

        subject.subscribe(state => {
          const storeState = Object.assign(currentState, state)
          this.setState({ storeState })
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
        const props = Object.assign({ setState: Store[displayName].setState }, this.props, mapState(currentState))
        return createElement(component, props)
      }
    }
  }

export const resource = <T>(source: any, name: string) =>
  (Component: __React.ComponentClass<T> | any) => {
    Component.resource[name] = source
    return Component
  }

export const getStore = () => Store

export default Store
