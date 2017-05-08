import { Observable } from "rxjs"

export default function toObservable(source: any) {
	if (source == void 0)
		return Observable.never()

	else if (source instanceof Observable)
		return source

	else if (source instanceof Promise)
		return Observable.fromPromise(source)

	else
		return Observable.of(source)
}
