import * as React from "react"
import { render } from "react-dom"
import Store, { lift, inject } from "../../../../src"
import { Header } from "./header/header"
import { List } from "./list/list"
import { Control } from "./control/control"

import { getByCache } from "../api/app.api"

export type TTodo = {
	status: string
	value: string
}

type Props = {
	todos?: TTodo[]
	display?: string
}


@inject<Props>(getByCache, (currentState, cache) => cache === null ? {} : cache)
@lift({ todos: [], display: "all" })
export default class Todo extends React.Component<Props, void> {
	public render() {
		return (
			<section className="todoapp">
				{Header(this.props.todos)}
				<List todos={this.props.todos} />
				<Control display={this.props.display} todos={this.props.todos} />
			</section>
		)
	}
}
