import { ObservableInput } from 'rxjs/Observable'
import { ComponentClass } from 'react'

export type Inject = ObservableInput<any>

export type Success = string | ((state: Object) => Object)

export type Resource = { source$: Inject, success: Success }

export const inject = (source$: Inject, success: Success) =>
  <P, S>(component: ComponentClass<P>): any => {
    (component as any).resource.push({ source$, success })
    return component
  }