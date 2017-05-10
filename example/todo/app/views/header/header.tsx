import * as React from "react"
import Store from "../../../../../src"
import { TTodo } from "../todo"

export const Header = (todos: TTodo[]) =>
	<header className="header">
		<h1>todos</h1>
		<input className="new-todo" onKeyDown={onkeydown(todos)} placeholder="What needs to be done?" autoFocus={true} />
	</header>

const onkeydown = (todos: TTodo[]) => (event: React.KeyboardEvent<HTMLInputElement>) => {
	const value = event.currentTarget.value
	if (value === "") return
	if (event.keyCode === 13) {
		const newtodos = [...todos]
		newtodos.push({ status: "active", value })
		event.currentTarget.value = ""
		Store.children.Todo.setState({ todos: newtodos }, () => localStorage.setItem("meng-todo", JSON.stringify(this.props)))
	}
}