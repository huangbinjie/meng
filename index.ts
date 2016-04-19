import { Subject } from 'rxjs'
import { createElement, Component, ComponentClass } from 'react'

const subject = new Subject()
const Store = <any>{}

Store.dispatch = (state: Object) => subject.next(state)

type mapState = <T>(state: Object) => T
type store = {
  state: Object,
  dispatch: Function
}

export const connect = <T, S>(mapState: mapState, initialState?: Object) =>
  (component: ComponentClass<T> | any): ComponentClass <any> => {
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
        currentStore.dispatch = (state: Object) => currentSubject.next(state)

        Store[displayName] = currentStore

        const keys = Object.keys(ConnectComponent.resource)

        keys.map(key => {
          ConnectComponent.resource[key].subscribe(x => currentStore.dispatch({ [key]: x }), y => currentStore.dispatch({ [key]: y }))
        })

      }
      render() {
        const props = Object.assign({ dispatch: Store[displayName].dispatch }, this.props, mapState(currentState))
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
