import { AsyncResource, ListenResource } from "./inject"
import { Component, StatelessComponent, ComponentClass, createElement } from "react"
import rootStore, { ImplStore } from "./"
import { Observable, Subscription } from "rxjs"
import { forkAsync, forkListen } from "./fork"
import shallowPartialEqual from "./utils/shallowPartialEqual"

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
        private static asyncResource: Array<AsyncResource<S>> = []
        private static listenResource: Array<ListenResource<S>> = []
        private static onError?: (err: any) => void
        private hasStoreStateChanged: boolean
        private subscription: Subscription
        private listenSubscription: Subscription

        public constructor(props: P) {
          super(props)
          // initialState 会覆盖props的值
          this.state = Object.assign({}, props, initialState) as M

          const currentStore = new ImplStore(this.state)

          rootStore.children[displayName] = currentStore

          const asyncResource$ = Observable.from(LiftedComponent.asyncResource).map(source => forkAsync.call(this, source) as Observable<M>).filter(state => state !== null).mergeAll()

          currentStore.store$ = Observable.merge(currentStore.state$.mergeAll(), asyncResource$).publishReplay(1).refCount() as Observable<M>

        }

        public componentWillUnmount() {
          delete rootStore.children[displayName]
          this.hasStoreStateChanged = false
          this.subscription.unsubscribe()
          this.listenSubscription.unsubscribe()
        }

        public componentWillReceiveProps(nextProps: P) {
          rootStore.children[displayName].setState(nextProps)
        }

        /**
         * 因为一方面willMount在Fiber出来之后会有优化，不断的调用和暂停，不适合在willMount写副作用，
         * 另一方面willMount是ssr中唯一调用的生命周期函数，而willunmount和didmount不会调用，会导致内存泄漏，
         * 所以在didmount监听和订阅
         * 
         * 监听有2个。
         * 第一个是监听 Store: Observable<M>， 生成内部 state 的主分支。
         * 第二个是监听 Store，生产 listenObservable: Observable<Observable<Partical<M>>> 的次要分支，他是一个高阶容器。
         * 第二个分支生成 state，又刷新 state， 又监听 state。这是一个无限循环的操作，循环边界是 return void 0.
         */
        public componentDidMount() {
          const currentStore = rootStore.children[displayName]

          const listenStore$ = currentStore.state$.merge(currentStore.store$).scan((store, nextState) => Object.assign({}, store, nextState)).pairwise()

          const listenResource$ = Observable.from(LiftedComponent.listenResource).map(source => forkListen.call(this, source, listenStore$) as Observable<M>)

          this.subscription =
            currentStore.store$
              .skip(1)
              .catch((err, caught) => {
                const error = LiftedComponent.onError
                if (error) {
                  error(err)
                } else {
                  throw err
                }
                return Observable.empty()
              })
              .filter(nextState => !shallowPartialEqual(this.state as {}, nextState))
              .subscribe((state: M & Extral<M>) => {
                this.hasStoreStateChanged = true
                const callback = state._callback || (() => { })
                delete state._callback
                this.setState(state, callback)
              })

          this.listenSubscription = listenResource$.subscribe(listenState$ => currentStore.state$.next(listenState$))

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
