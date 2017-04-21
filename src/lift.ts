import { AsyncResource, ListenResource } from "./inject"
import { Component, StatelessComponent, ComponentClass, createElement } from "react"
import rootStore, { ImplStore } from "./"
import { Observable, Subscription } from "rxjs"
import { forkAsync, forkListen } from "./fork"
import shallowEqual from "./utils/shallowEqual"

export type Extral<S> = {
  setState: (nextState: Partial<S>, callback?: () => void) => void
  _callback?: () => void
}

/* 
 * P: props--父级传下来的
 * S: state-- state$的数据类型
 * M: store-- store$的数据类型，也就是最终类型 M 继承了P和S和meng需要用到的的Extral<M>
 */
/** store type extends initialState's type and props type. */
export const lift =
  <P, S, M extends S & P & Extral<S & P>>(initialState = {} as S, initialName?: string) =>
    (component: ComponentClass<Partial<M>> | StatelessComponent<Partial<M>>): any => {
      const displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2)
      return class LiftedComponent extends Component<P, M> {
        private static displayName = `Meng(${displayName})`
        private static asyncResource: AsyncResource[] = []
        private static listenResource: Array<ListenResource<M>> = []
        private hasStoreStateChanged: Boolean
        private subscription: Subscription

        public constructor(props: P) {
          super(props)

          const currentStore = new ImplStore()

          this.state = Object.assign({ setState: currentStore.setState }, props) as M

          rootStore.children[displayName] = currentStore

          const state$ = Observable.of(Object.assign({}, props, initialState))

          const asyncResource$ = Observable.from(LiftedComponent.asyncResource).map(source => forkAsync(source)).mergeAll()

          const store$ =
            currentStore.state$
              .merge(state$, asyncResource$)
              .scan((currentState, nextState) => Object.assign({}, currentState, nextState))
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

          const listenResource$ = Observable.from(LiftedComponent.listenResource).map(source => forkListen(source, store$)).mergeAll()

          currentStore.store$ = store$.map(pairstore => pairstore[1]).merge(listenResource$)

        }

        public componentWillUnmount() {
          delete rootStore.children[displayName]
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
              .subscribe((state: M & Extral<M>) => {
                this.hasStoreStateChanged = true
                const callback = state._callback || (() => { })
                delete state._callback
                this.setState(state, callback)
              })
        }

        public shouldComponentUpdate() {
          return this.hasStoreStateChanged
        }

        public render() {
          this.hasStoreStateChanged = false
          return createElement(component as ComponentClass<M>, this.state as M)
        }

      }
      // return ConnectComponent
    }