import { Observable } from "rxjs"
import { ImplStore } from "../"

export default function toObservable(source: any) {
	if (source == void 0)
		return Observable.never()

	else if (source instanceof Observable)
		return source

	else if (source instanceof Promise)
		return Observable.fromPromise(source)

	else if (source instanceof ImplStore)
		return source.store$
	else
		return Observable.of(source)
}
