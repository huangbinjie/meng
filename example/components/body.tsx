import * as React from 'react'
import { createElement, createClass, Component, ComponentClass, ComponentLifecycle } from 'react'
import Store, { lift, resource, getStore } from '../../'

@resource(props => {
  console.log(props);
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(11111), 3000)
  })
}, "lazyProps")
@resource(Store, "userInfo")
@lift()
export default class Body extends React.Component<any, any> {
  state = Store["Body"].state
  render() {
    const {num = 0, text, data, setState, userInfo, lazyProps} = this.props
    console.log(lazyProps)
    return (
      <div>
        <button onClick = { add(num, setState) }>+</button>
        <p>数字: {num}</p>
        <button onClick = { reduction(num, setState) }>-</button>
        <p>props-data: {data}</p>
        <button onClick = { timeoutHandle(setState) }>异步</button>
        <p>{text}</p>
        <p>Store: {JSON.stringify(userInfo) }</p>
      </div>
    )
  }
}
const add = (num: number, setState) => (e: Event) => {
  Store["Footer"].setState({ num: ++Store["Footer"].state.num })
}

const reduction = (num: number, setState) => (e: Event) => Store["Footer"].setState({ num: --Store["Footer"].state.num })

const timeoutHandle = setState => e => new Promise((resolve, reject) => {
  setTimeout(() => resolve("服务器返回了一段测试数据"), 1000)
}).then(response => setState({ text: response }))
