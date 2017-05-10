import * as React from "react"
import { TTodo } from "../todo"
import Store from "../../../../../src"

export class List extends React.Component<{ todos: TTodo[] }, void> {
	public render() {
		const items = this.props.todos.map((todo, index) => (
			<li className={todo.status} key={index}>
				<div className="view">
					<input className="toggle" type="checkbox" onChange={this.toggle(index)} checked={todo.status === "completed" ? true : false} />
					<label>{todo.value}</label>
					<button className="destroy" onClick={this.destroy(index)}></button>
				</div>
			</li>
		))
		return (
			<section className="main">
				<input className="toggle-all" type="checkbox" />
				<label htmlFor="toggle-all">Mark all as complete</label>
				<ul className="todo-list">
					{items}
				</ul>
			</section>
		)
	}

	private toggle = (index: number) => () => {
		const todos = [...this.props.todos]
		const item = todos[index]
		const toggledState = item.status === "active" ? "completed" : "active"
		item.status = toggledState
		Store.children.Todo.setState({ todos }, () => localStorage.setItem("meng-todo", JSON.stringify(this.props)))
	}

	private destroy = index => () => {
		const items = [...this.props.todos]
		items.splice(index, 1)
		Store.children.Todo.setState({ todos: items }, () => localStorage.setItem("meng-todo", JSON.stringify(this.props)))
	}
}
