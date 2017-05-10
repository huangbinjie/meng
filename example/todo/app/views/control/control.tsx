import * as React from "react"
import Store from "../../../../../src"
import { TTodo } from "../todo"

type Props = {
	display: string
	todos: TTodo[]
}

export class Control extends React.Component<Props, void> {
	public render() {
		const { display, todos } = this.props
		return (
			<footer className="footer">
				<span className="todo-count"><strong>{todos.filter(item => item.status === "active").length}</strong> item left</span>
				<ul className="filters">
					<li>
						<a className={display === "all" ? "selected" : ""} href="#/" onClick={this.show("all")}>All</a>
					</li>
					<li>
						<a className={display === "active" ? "selected" : ""} href="#/active" onClick={this.show("active")}>Active</a>
					</li>
					<li>
						<a className={display === "completed" ? "selected" : ""} href="#/completed" onClick={this.show("completed")}>Completed</a>
					</li>
				</ul>
				<button className="clear-completed" onClick={this.clearCompleted}>Clear completed</button>
			</footer>
		)
	}

	private clearCompleted = () => {
		const items = this.props.todos.filter(item => item.status !== "completed")
		Store.children.Todo.setState({ todos: items }, () => localStorage.setItem("meng-todo", JSON.stringify(this.props)))
	}
	private show = display => () => Store.children.Todo.setState({ display }, () => localStorage.setItem("meng-todo", JSON.stringify(this.props)))
}