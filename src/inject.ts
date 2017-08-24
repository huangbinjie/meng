import { ObservableInput } from "rxjs/Observable"
import { ComponentClass } from "react"

export type Inject<S> = ObservableInput<Object> | ((store: Partial<S>) => any)

export type Listen<S> = (currentStore: Partial<S>, nextStore: Partial<S>) => Inject<S>

export type Success<S> = string | ((value: S[keyof S], currentState: S) => Partial<S>)

export type AsyncResource<S> = { source$: Inject<S>, success: Success<S> }

export type ListenResource<S> = { source$: Listen<S>, success: Success<S> }

export const inject = <S>(source$: Inject<S>, success: Success<S>) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).asyncResource.push({ source$, success })
    return component
  }

export const listen = <S>(source$: Listen<S>, success: Success<S>) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).listenResource.push({ source$, success })
    return component
  }
