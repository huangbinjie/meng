import test from "ava"
import { Observable } from "rxjs"
import { mount } from "enzyme"
import { ImplStore } from "../src"

test("should have an empty object", t => {
	const Store = new ImplStore()
	Store.subscribe(state => t.deepEqual(state, {}))
})

test("should kep last initial state", t => {
	t.plan(2)
	const Store = new ImplStore<{ a: number }>({ a: 0 })
	Store.setState({ a: 1 })
	Store.setState({ a: 2 })
	Store.setState({ a: 3 })
	Store.subscribe(state => {
		t.pass()
		t.deepEqual(state, { a: 3 })
	})
})

test("subscribed store should merge new state", t => {
	type TStore = {
		a: number
		b?: number
		c?: number[]
	}
	const Store = new ImplStore<TStore>({ a: 0 })
	let num = 0
	Store.subscribe(state => {
		if (++num === 4) t.deepEqual(state, { a: 1, b: 2, c: [1, 2] })
	})
	Store.setState({ a: 1 })
	Store.setState({ b: 2 })
	Store.setState({ c: [1, 2] })
})

test("subscribed store should not update if state is shallow equal with previous state", t => {
	t.plan(3)
	const Store = new ImplStore({ a: 1, b: { c: 2 } })
	Store.subscribe(state => {
		t.pass()
	})
	// should not update store's state, because a: 1 is equal with a: 1
	Store.setState({ a: 1 })
	Store.setState({ a: 2 })
	// should update, because store just shallow equal state
	Store.setState({ b: { c: 2 } })
})


test("setState callback should work", t => {
	t.plan(1)
	const Store = new ImplStore<{ a: number }>({ a: 1 })
	Store.setState({ a: 2 }, () => {
		t.pass()
	})

	Store.subscribe((state) => {
		if (state._callback) state._callback()
	})
})

test("shallow equal should exclude _callback", t => {
	t.plan(2)
	const Store = new ImplStore<{ a: number }>({ a: 1 })
	Store.setState({ a: 2 }, () => {
		t.pass()
	})

	Store.subscribe(() => { t.pass() })
	Store.setState({ a: 2 }, t.pass)
	Store.setState({ a: 2 })
})
