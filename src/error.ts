import { ComponentClass } from "react"

export type ErrorHandler = (err: any) => void

export const error = <S>(eh: ErrorHandler) => (component: ComponentClass<S>): any => {
	(component as any).onError = eh
	return component
}
