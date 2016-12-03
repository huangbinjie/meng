import { Resource } from './inject'
import { Component, ComponentClass, createElement } from 'react'
import rootStore, { Meng, ImplStore } from './'
import { Observable, Subscription } from 'rxjs'
import { fork, combineLatestSelector } from './fork'
import shallowEqualValue from './utils/shallowEqualValue'

export const lift = <P, S>(initialState = <S>{}, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
  const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<P, S> {
    static displayName = `Meng(${displayName})`
    static resource: Resource[] = []
    private hasStoreStateChanged: boolean
    private _isMounted = false
    private subscription: Subscription

    public state = Object.assign({}, initialState)

    public componentWillUnmount() {
      rootStore.children[displayName] = null
      this._isMounted = false
      this.hasStoreStateChanged = false
      this.subscription.unsubscribe()
    }

    public componentWillReceiveProps(nextProps: P) {
      rootStore.children[displayName].setState(nextProps)
    }

    public componentWillMount() {
      //创建自己的store
      const currentStore = new ImplStore(initialState)
      //把自己的store挂在全局store里面
      rootStore.children[displayName] = currentStore

      const props$ = Observable.of(this.props)

      const fork$ = LiftedComponent.resource.map(source => fork.call(this, currentStore.state$, source))

      const merge$ = Observable.from(fork$).mergeAll()

      currentStore.store$ = Observable.merge(currentStore.state$, props$, merge$)

      this.subscription = currentStore.store$
        .map(nextState => Object.assign({}, this.state, nextState))
        .subscribe((state: any) => {
          if (!shallowEqualValue(this.state, state)) {
            this.hasStoreStateChanged = true
            this.setState(state)
          }
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

      const props = Object.assign({ setState: rootStore.children[displayName].setState }, <S & P>this.state)
      return createElement(component as ComponentClass<P>, props)
    }
  }
  // return ConnectComponent
}