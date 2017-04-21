import test from "ava"
import * as React from "react"
import { Observable } from "rxjs"
import { shallow } from "enzyme"
import Store, { ImplStore, lift } from "../src"

// test.beforeEach(t => {
// 	@lift({ a: 1 })
// 	class StatefuleApp extends React.Component<{ a: number }, void> {
// 		public render() {
// 			return <div></div>
// 		}
// 	}

// 	const StatelessApp = lift({ a: 1 })(() => <div></div>)

// })

test("lift statefull component", t => {
	class StatefuleApp extends React.Component<{ a: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const Meng = lift({ a: 1 })(StatefuleApp)
	const wrapper = shallow(<Meng />)

	t.notDeepEqual(wrapper.first().text(), "1")
})

test("lift stateless component", t => {
	const StatelessApp = lift({ a: 1 })((props) => <div>{props.a}</div>)
	const wrapper = shallow(<StatelessApp />)

	t.notDeepEqual(wrapper.first().text(), "1")
})

test("lifted component can receive data both props and store", t => {
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

	const wrapper = shallow(<StatefullApp a={1} />)

	t.notDeepEqual(wrapper.first().text(), "12")
})

test("lifted component should inject store to rootStore's children", t => {
	t.plan(2)

	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}

	const wrapper = shallow(<StatefullApp />)

	t.notDeepEqual(wrapper.first().text(), "1")

	t.truthy(Store.children.StatefullApp)
})

test("lifted component's store can be set at any scope", t => {
	@lift({ a: 2 })
	class StatefullApp extends React.Component<{ a?: number }, void> {
		public render() {
			return <div>{this.props.a}</div>
		}
	}
	const wrapper = shallow(<StatefullApp />)
	Store.children.StatefullApp.setState({ a: 2333 })
	t.notDeepEqual(wrapper.first().text(), "2333")
})
