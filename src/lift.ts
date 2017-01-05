import { Resource } from './inject'
import { Component, ComponentClass, createElement } from 'react'
import rootStore, { Meng, ImplStore } from './'
import { Observable, Subscription } from 'rxjs'
import { fork, combineLatestSelector } from './fork'
import shallowEqualValue from './utils/shallowEqualValue'

export type State = {
  setState: (nextState: Object, callback?: () => void) => void
  callback: () => void
}

export const lift = <P, S, T extends S & State>(initialState = <S>{}, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
  const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<P, T> {
    static displayName = `Meng(${displayName})`
    static resource: Resource[] = []
    private hasStoreStateChanged = true
    private subscription: Subscription

    public state = Object.assign(<T>{ callback: () => { } }, initialState)

    public constructor(props: P) {
      super(props)
      // 初始化state，并且和并props到state
      this.state = Object.assign(<T>{ callback: () => { } }, initialState, props)
      //创建自己的store
      const currentStore = new ImplStore(initialState)
      //把自己的store挂在全局store里面
      rootStore.children[displayName] = currentStore

      const props$ = Observable.of(props)

      const fork$ = LiftedComponent.resource.map(source => fork.call(this, currentStore.state$, source))

      const merge$ = Observable.from(fork$).mergeAll()

      currentStore.store$ =
        Observable
          .merge(currentStore.state$, props$, merge$)
          .filter(nextState => !shallowEqualValue(this.state, nextState))
          .map(nextState => Object.assign({}, this.state, nextState))

      //等currentStore生成之后才能给state的setState赋值
      this.state.setState = currentStore.setState
    }

    public componentWillUnmount() {
      rootStore.children[displayName] = null
      this.hasStoreStateChanged = false
      this.subscription.unsubscribe()
    }

    public componentWillReceiveProps(nextProps: P) {
      rootStore.children[displayName].setState(nextProps)
    }

    /**
     * 因为一方面willMount在Fiber出来之后会有优化，不断的调用和暂停，不适合在willMount写副作用，
     * 另一方面willMount是ssr中唯一调用的生命周期函数，而willunmount和didmount不会调用，会导致内存泄漏，
     * 所以在didmount监听和订阅
     */
    public componentDidMount() {
      this.subscription =
        rootStore.children[displayName].store$
          .subscribe((state: T) => {
            this.hasStoreStateChanged = true
            this.setState(state, state.callback)
            delete state.callback
          })
    }

    public shouldComponentUpdate() {
      return this.hasStoreStateChanged
    }

    public render() {
      this.hasStoreStateChanged = false

      return createElement(component as ComponentClass<P>, <T & P>this.state)
    }

  }
  // return ConnectComponent
}