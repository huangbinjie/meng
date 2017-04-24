import "jsdom-global/register"
import test from "ava"
import * as React from "react"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import Store, { ImplStore, lift } from "../src"


test("lift statefull component", t => {
	class StatefullApp extends React.Component<{ a: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const Meng = lift({ a: 1 })(StatefullApp)
	const wrapper = mount(<Meng />)
	t.is(wrapper.first().text(), "1")
})

test("lift stateless component", t => {
	const StatelessApp = lift({ a: 1 })((props) => <div>{props.a}</div>)
	const wrapper = mount(<StatelessApp />)

	t.is(wrapper.first().text(), "1")
})

test.cb("lift state should be synchronous", t => {
	t.plan(2)
	type Props = {
		b?: number
	}

	@lift({ a: 2, b: 1 })
	class StatefullApp extends React.Component<Props, void> {
		public componentDidMount() {
			t.is(this.props.b, 1)
		}
		public render() {
			return <div>{this.props.b}</div>
		}
	}

	const wrapper = mount(<StatefullApp />)

	setTimeout(() => {
		t.is(wrapper.first().text(), "1")
		t.end()
	}, 0)
})

test.cb("lifted component can receive data both props and store", t => {
	type Props = {
		a: number
		b?: number
	}

	@lift({ a: 2, b: 1 })
	class StatefullApp extends React.Component<Props, void> {
		public render() {
			return <div>{this.props.a}{this.props.b}</div>
		}
	}

	const wrapper = mount(<StatefullApp a={1} />)

	setTimeout(() => {
		t.is(wrapper.first().text(), "21")
		t.end()
	}, 500)
})

test("lifted component should inject store to rootStore's children", t => {
	t.plan(2)

	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}

	const wrapper = mount(<StatefullApp />)

	t.is(wrapper.first().text(), "2")

	t.truthy(Store.children.StatefullApp)
})

test.cb("lifted component's store can be set at any scope", t => {
	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const wrapper = mount(<StatefullApp />)
	Store.children.StatefullApp.setState({ a: 2333 }, () => {
		t.is(wrapper.first().text(), "2333")
		t.end()
	})
})

test.cb("setState's callback should work", t => {
	@lift({ a: 2 })
	class StatefullApp1 extends React.Component<{ a?: number, setState?: (state: object, cb?: () => void) => {} }, void> {
		public componentDidMount() {
			setTimeout(() => {
				Store.children.StatefullApp1.setState({ a: 3 }, () => {
					Store.children.StatefullApp1.setState({ a: 4 })
				})
			}, 500)
		}
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const wrapper = mount(<StatefullApp1 />)
	setTimeout(() => {
		t.is(wrapper.first().text(), "4")
		t.end()
	}, 1000)
})

test.cb("lifted store's subscribe should work", t => {
	t.plan(3)
	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const wrapper = mount(<StatefullApp />)
	Store.children.StatefullApp.subscribe((store: { a?: number }) => {
		t.deepEqual(store, { a: 2 })
		t.pass()
		t.end()
	})
	t.is(wrapper.first().text(), "2")
})

test("callback should not affect shallowEqual", t => {
	t.plan(2)
	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const wrapper = mount(<StatefullApp />)
	Store.children.StatefullApp.setState({ a: 2 }, () => {
		t.pass()
	})
	Store.children.StatefullApp.setState({ a: 2 }, () => {
		t.pass()
	})
	Store.children.StatefullApp.setState({ a: 3 }, () => {
		t.pass()
	})
	t.is(wrapper.first().text(), "3")
})
