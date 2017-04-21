import { ObservableInput } from "rxjs/Observable"
import { ComponentClass } from "react"

export type Inject = ObservableInput<Object> | (() => any) | Object

export type Listen<S> = (currentStore: Partial<S>, nextStore: Partial<S>) => Inject

export type Success = string | ((state: object) => object)

export type AsyncResource = { source$: Inject, success: Success }

export type ListenResource<S> = { source$: Listen<S>, success: Success }

export const inject = <S>(source$: Inject, success: Success) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).asyncResource.push({ source$, success })
    return component
  }

export const listen = <S>(source$: Listen<S>, success: Success) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).listenResource.push({ source$, success })
    return component
  }
