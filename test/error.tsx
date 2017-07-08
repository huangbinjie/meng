import "jsdom-global/register"
import test from "ava"
import * as React from "react"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import { ImplStore, lift, inject } from "../src"
import { error } from "../src/error"

test.cb("catch error", t => {
	@error(err => t.is(1, err))
	@inject(Promise.reject(1), "e")
	@lift()
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}
	mount(<App />)
	setTimeout(() => t.end(), 1000)
})