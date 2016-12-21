import { Resource } from './inject'
import { Component, ComponentClass, createElement } from 'react'
import rootStore, { Meng, ImplStore } from './'
import { Observable, Subscription } from 'rxjs'
import { fork, combineLatestSelector } from './fork'
import shallowEqualValue from './utils/shallowEqualValue'

export const lift = <P, S extends { setState: any, callback: () => void }>(initialState = <S>{}, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
  const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<P, S> {
    static displayName = `Meng(${displayName})`
    static resource: Resource[] = []
    private hasStoreStateChanged: boolean
    private _isMounted = false
    private subscription: Subscription

    public state = Object.assign({ callback: () => { } }, initialState)

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

      currentStore.store$ =
        Observable
          .merge(currentStore.state$, props$, merge$)
          .filter(nextState => !shallowEqualValue(this.state, nextState))
          .map(nextState => Object.assign({}, this.state, nextState))

      this.subscription =
        currentStore.store$
          .subscribe((state: S) => {
            this.hasStoreStateChanged = true
            this.setState(state, state.callback)
            delete state.callback
          })

      this.setState(<S>{ setState: currentStore.setState })
    }

    public componentDidMount() {
      this._isMounted = true
    }

    public shouldComponentUpdate() {
      return this.hasStoreStateChanged
    }

    public render() {
      this.hasStoreStateChanged = false

      return createElement(component as ComponentClass<P>, <S & P>this.state)
    }

  }
  // return ConnectComponent
}