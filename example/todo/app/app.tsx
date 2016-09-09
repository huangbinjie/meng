/// <reference path="../../../typings/tsd.d.ts"/>

import * as React from 'react'
import { render } from 'react-dom'
import Store, { lift, resource } from '../../../src'

import { getByCache } from './app.api'

window["store"] = Store

@resource(getByCache, (store, cache) => store.setState(cache))
@lift({ list: [], display: "all" })
class App extends React.Component<any, any> {
  componentDidMount() {
    this["subscribe"](state => {
      localStorage.setItem("meng-todo", JSON.stringify(Store["App"].state))
    })
  }
  render() {
    const display = this.props.display

    const lis = this.props.list.filter(filter(display)).map((li, index) => {
      if (li.status === "active") return <ActiveItem key={index} index={index} data={li} toggle={this.toggle} destroy={this.destroy} />
      if (li.status === "completed") return <CompletedItem key={index} index={index} data={li} toggle={this.toggle} destroy={this.destroy} />
    })

    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <input className="new-todo" onKeyDown={this.onkeydown} placeholder="What needs to be done?" autoFocus={true} />
        </header>
        <section className="main">
          <input className="toggle-all" type="checkbox" />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {lis}
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count"><strong>{this.props.list.filter(item => item.status === "active").length}</strong> item left</span>
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
      </section>
    )
  }
  onkeydown = event => {
    if (event.value === "") return

    if (event.keyCode === 13) {
      const list = this.props.list
      list.push({ status: "active", value: event.target.value })
      event.target.value = ""
      this.setState({ list: list })
    }
  }
  toggle = (data, index) => event => {
    const items = this.props.list.map((item, _index) => {
      if (_index === index && item.status === "active") return { status: "completed", value: item.value }
      if (_index === index && item.status === "completed") return { status: "active", value: item.value }
      return item
    })

    this.setState({ list: items })
  }
  destroy = index => () => {
    const items = this.props.list
    items.splice(index, 1)
    this.setState({ list: items })
  }
  clearCompleted = () => {
    const items = this.props.list.filter(item => item.status !== "completed")
    this.setState({ list: items })
  }
  show = display => () => this.setState({ display: display })
}

const filter = display => li => {
  if (display === "all") return true
  if (li.status === display) return true
}

const ActiveItem = ({index, data, toggle, destroy}) =>
  <li>
    <div className="view">
      <input className="toggle" type="checkbox" onChange={toggle(data, index)} />
      <label>{data.value}</label>
      <button className="destroy" onClick={destroy(index)}></button>
    </div>
    <input className="edit" defaultValue="Rule the web" />
  </li>

const CompletedItem = ({index, data, toggle, destroy}) =>
  <li className="completed">
    <div className="view">
      <input className="toggle" type="checkbox" onChange={toggle(data, index)} checked />
      <label>{data.value}</label>
      <button className="destroy" onClick={destroy(index)}></button>
    </div>
    <input className="edit" defaultValue="Create a TodoMVC template" />
  </li>

render(<App />, document.getElementById("app"))