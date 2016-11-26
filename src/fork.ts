import { Observable } from 'rxjs'

export function fork<P, S>(currentStore: Store<S>, {source$, success}: Resource) {
  if (source$ instanceof Observable) {
    const observer = source$.subscribe(successHandle(currentStore, success))
    this.observers.push(observer)
  }

  else if (source$ instanceof Promise)
    source$.then(successHandle(currentStore, success))

  else if (source$ instanceof ImplStore) {
    const observer = source$.state.subscribe(successHandle(currentStore, success))
    this.observers.push(observer)
  }

  else if (source$ instanceof Function)
    fork.call(this, currentStore, { source$: source$(this.props), success })

  else
    successHandle(currentStore, success)(source$)
}

const successHandle = <S>(store: Store<S>, success: Success) => (primitiveValue: Object) =>
  typeof success === "string" ? store.setState({ [success]: primitiveValue }) : success(store, primitiveValue)