import { Resource } from './inject'
import { Component, StatelessComponent, ComponentClass, createElement } from 'react'
import rootStore, { ImplStore } from './'
import { Observable, Subscription } from 'rxjs'
import { fork, combineLatestSelector } from './fork'
import shallowEqual from './utils/shallowEqual'

export type State = {
  setState: (nextState: Object, callback?: () => void) => void
  callback?: () => void
}

export const lift = <P, S, T extends S & State>(initialState = <P>{}, initialName?: string) => (component: ComponentClass<P> | StatelessComponent<P>): any => {
  const _displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
  return class LiftedComponent extends Component<P, T> {
    static displayName = `Meng(${_displayName})`
    static resource: Resource[] = []
    private hasStoreStateChanged: Boolean
    private subscription: Subscription

    public constructor(props: P) {
      super(props)

      const mergedState = Object.assign({}, initialState, props)

      const currentStore = new ImplStore(mergedState)

      this.state = Object.assign(<T>{ setState: currentStore.setState }, mergedState)

      rootStore.children[_displayName] = currentStore

      const resource$ = Observable.from(LiftedComponent.resource)

      const parts = resource$.partition(resource => resource.source$ instanceof Function && resource.source$.length > 0)

      const asyncResource$ = parts[1].map(source => fork(source)).mergeAll()

      const store$ =
        currentStore.state$
          .merge(asyncResource$)
          .scan((currentStore, nextState) => Object.assign({}, currentStore, nextState))
          // buffer数据源，至少有2个state才继续往下走，那么它和share的区别是什么？
          // publishReplay(2) = multicast(() => new ReplaySubject(2))
          // 在refCount之后，所有的observer都是订阅的这个ReplaySubject，直到最后一个订阅被释放这个时候
          // 这个hotObservable，也就是这段注释之前的数据源才会被释放掉。
          // 而share不一样，share是在数据源是同步的时候会在subscriber close之后释放掉subscription，如果
          // 第一次subscribe没被释放(eg. interval)，之后的subscribe发现subscription还在就会共用这个subscription(fromPromise好像有bug)
          // ，这个时候share()才表现得和multicast().refCount()差不多。而这里的数据源是ReplaySubject(initialState)，
          // 是个同步的任务，所以被释放掉了，之后watch的就再也订阅不了了。注意share !== publish().refCount()
          .publishReplay(2)
          .refCount()
          .pairwise()

      const listenResource$ = parts[0].map(source => fork.call(this, source, store$)).mergeAll()

      currentStore.store$ = store$.map(pairstore => pairstore[1]).merge(listenResource$)

    }

    public componentWillUnmount() {
      delete rootStore.children[_displayName]
      this.hasStoreStateChanged = false
      this.subscription.unsubscribe()
    }

    public componentWillReceiveProps(nextProps: P) {
      rootStore.children[_displayName].setState(nextProps)
    }

    /**
     * 因为一方面willMount在Fiber出来之后会有优化，不断的调用和暂停，不适合在willMount写副作用，
     * 另一方面willMount是ssr中唯一调用的生命周期函数，而willunmount和didmount不会调用，会导致内存泄漏，
     * 所以在didmount监听和订阅
     */
    public componentDidMount() {
      const currentStore = rootStore.children[_displayName]
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
      return createElement(component as any, <T & P>this.state)
    }

  }
  // return ConnectComponent
}