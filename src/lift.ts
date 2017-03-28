import { Resource } from './inject'
import { Component, ComponentClass, createElement } from 'react'
import rootStore, { Meng, ImplStore } from './'
import { Observable, Subscription } from 'rxjs'
import { fork, combineLatestSelector } from './fork'
import shallowEqual from './utils/shallowEqual'

export type State = {
  setState: (nextState: Object, callback?: () => void) => void
  callback?: () => void
}

export const lift = <P, S, T extends S & State>(initialState = <S>{}, initialName?: string) => (component: Meng.Component<P> | Meng.Stateless<P>): any => {
  const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<P, T> {
    static displayName = `Meng(${displayName})`
    static resource: Resource[] = []
    private hasStoreStateChanged: Boolean
    private subscription: Subscription

    public constructor(props: P) {
      super(props)

      const mergedState = Object.assign({}, initialState, props)

      const currentStore = new ImplStore(mergedState)

      this.state = Object.assign(<T>{ setState: currentStore.setState }, mergedState)

      rootStore.children[displayName] = currentStore

      const resource$ = Observable.from(LiftedComponent.resource)

      const parts = resource$.partition(resource => resource.source$ instanceof Function && resource.source$.length > 0)

      const asyncResource = parts[1].map(source => fork(source))

      const asyncResource$ = Observable.from(asyncResource).mergeAll()

      const store$ =
        currentStore.state$
          .merge(asyncResource$)
          .scan((currentStore, nextState) => Object.assign({}, currentStore, nextState))
          .publishReplay(2)
          .refCount()
          .pairwise()

      const listenResource = parts[0].map(source => fork.call(this, source, store$))

      //如果是from([]).mergeAll(),这条流会自动关闭，不用担心会emit一个空数组
      const listenResource$ = Observable.from(listenResource).mergeAll()

      currentStore.store$ = store$.map(pairstore => pairstore[1]).merge(listenResource$).scan((nextStore, nextStoreOrState) => Object.assign(nextStore, nextStoreOrState))

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
      const currentStore = rootStore.children[displayName]
      this.subscription =
        currentStore.store$
          .filter(store => !shallowEqual(this.state, store))
          .subscribe((state: T) => {
            this.hasStoreStateChanged = true
            const callback = state.callback || (() => { })
            delete state.callback
            this.setState(state, callback)
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