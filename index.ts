import { Subject, Observable } from 'rxjs'
import { createElement, Component, ComponentClass, StatelessComponent } from 'react'

const subject = new Subject()
const Store = <any>{
  state: {},
  subject: subject,
  setState: (state: Object, callback = () => { }) => {
    Object.assign(this.state, state)
    callback()
    subject.next(state)
  }
}
type store = {
  state: Object,
  setState: Function,
  subject: any
}
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

      currentStore.state = currentState
      currentStore.subject = currentSubject
      currentStore.setState = (state: Object, callback = () => { }) => currentSubject.next({ state, callback })

      Store[displayName] = currentStore
      
      for(let i in ConnectComponent.resource) {
        if (ConnectComponent.resource[i] instanceof Observable) ConnectComponent.resource[i].subscribe(x => currentStore.setState({ [i]: x }), y => currentStore.setState({ [i]: y }))
        else currentStore.setState({ [i]: ConnectComponent.resource[i] })
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