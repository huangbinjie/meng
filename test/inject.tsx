import "jsdom-global/register"
import test from "ava"
import * as React from "react"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import Store, { ImplStore, lift, inject, listen } from "../src"

test.cb("inject promise", t => {
	const api = new Promise((v, r) => setTimeout(() => v(1), 500))
	@inject(api, "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 1000)
})

test.cb("inject observable", t => {
	const api = Observable.of(1)
	@inject(api, "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 1000)
})

test.cb("inject store", t => {
	Store.setState({ userinfo: { name: "corol" } })

	@inject(Store, (currentState, store: any) => ({ name: store.userinfo.name }))
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.name}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "2corol")
		t.end()
	}, 1000)
})

test.cb("inject function", t => {
	@inject(() => 1, "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 1000)
})

test.cb("inject curry func", t => {
	const api = Observable.of(1)
	@inject(() => () => () => api, "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 1000)
})

test.cb("inject an valid async factor should rerender component", t => {
	let count = 0
	const api = new Promise((v, r) => setTimeout(() => v(1), 1000))
	@inject(() => api, "c")
	@inject(() => 1, "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			++count
			return <div>{this.props.a}{this.props.b}{this.props.c}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "211")
		t.is(count, 3)
		t.end()
	}, 2000)
})

test.cb("inject null or undefined should do nothing", t => {
	let count = 0
	@inject(() => null, "c")
	@inject(() => Observable.of(1), "b")
	@lift({ a: 2 })
	class App extends React.Component<any, any>{
		public render() {
			count++
			return <div>{this.props.a}{this.props.b}{this.props.c}</div>
		}
	}

	const wrapper = mount(<App />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.is(count, 2)
		t.end()
	}, 1000)
})

test.cb("listen resource should listen lift", t => {
	const api = new Promise((v, r) => setTimeout(() => v(1), 500))
	type Props = {
		a?: number
		b: number
		c?: string
	}
	@listen((currentStore: Props, nextStore: Props) => nextStore.a === 2 ? api : null, (currentState, state: number) => ({ b: state }))
	@lift({ a: 2 })
	class App extends React.Component<Props, null>{
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}
	const wrapper = mount(<App b={2} />)
	t.is(wrapper.first().text(), "22")
	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 1000)
})

test.cb("listen resource can listen other async resource", t => {
	let count = 0
	const api2 = new Promise((v, r) => setTimeout(() => v(2), 1000))
	const api4 = new Promise((v, r) => setTimeout(() => v(4), 1000))
	type Props = {
		a?: number
		b?: number
		c?: number
	}
	@listen((currentStore: Props, nextStore: Props) => {
		// console.log(currentStore, nextStore)
		return nextStore.b === 2 ? api4 : null
	}, "c")
	@inject(api2, "b")
	@lift({ a: 2, b: 1 })
	class App extends React.Component<Props, null>{
		public render() {
			++count
			return <div>{this.props.a}{this.props.b}{this.props.c}</div>
		}
	}
	const wrapper = mount(<App />)
	t.is(wrapper.first().text(), "21")
	setTimeout(() => {
		t.is(count, 3)
		t.is(wrapper.first().text(), "224")
		t.end()
	}, 3000)
})

test.cb("test with router", t => {
	class Parent extends React.Component<any, any> {
		public state = { path: "/product/1" }
		public componentDidMount() {
			// simulate a route changed action
			setTimeout(() => this.setState({ path: "/product/2" }), 1000)
		}
		public render() {
			// console.log("state", this.state)
			const productId = this.state.path.match(/\/.+\/(\d)/)[1]
			return <Child productionId={productId} />
		}
	}

	type ChildProps = { productionId: string, production?: { id: number, name: string } }
	@listen((currentStore: ChildProps, nextStore: ChildProps) => {
		console.log("currentStore", currentStore)
		console.log("nextStore", nextStore)
		return currentStore.productionId !== nextStore.productionId ? fetch(nextStore.productionId) : null
	}, "production")
	@lift({ production: {} })
	class Child extends React.Component<ChildProps, any> {
		public render() {
			// console.log(this.props)
			return <div>
				{this.props.production.name}
			</div>
		}
	}

	const fetch = (pid: string) => {
		return new Promise((resolve, reject) => resolve([
			{ id: 1, name: "xxx" },
			{ id: 2, name: "yyy" }
		].find(arr => arr.id === +pid)))
	}

	const wrapper = mount(<Parent />)

	t.is(wrapper.first().text(), "")
	setTimeout(() => {
		t.is(wrapper.first().text(), "xxx")
	}, 1000)
	setTimeout(() => {
		t.is(wrapper.first().text(), "yyy")
		t.end()
	}, 2000)
})
