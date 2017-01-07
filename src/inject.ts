import { Observable } from 'rxjs'
import { Meng } from './'

export type Inject = Observable<any> | Promise<any> | (<S>(currentStore?: S, nextStore?: S) => Inject) | Object

export type Success = string | ((state: Object) => Object)

export type Resource = { source$: Inject, success: Success }

export const inject = (source$: Inject, success: Success) =>
  <P, S>(component: Meng.Component<P> | Meng.Stateless<P>): any => {
    component.resource.push({ source$, success })
    return component
  }