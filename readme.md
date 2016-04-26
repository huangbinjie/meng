meng
=====
用过各种数据流库之后，是不是感觉有点烦，但是说不出为什么。其实就是他们的约束和规范太多了,加上各种各样的依赖,很容易产生`javascript fatigue`, 这时候反而很想直接使用react了。
数据就存在state里面好了，那么剩下一个问题就是组件之间怎么通讯，react原生的通讯方式(父级传回调)确实太恶心人了，不仅要传，还要层层传。那么meng就是为了解决这个问题的。

# 安装
    npm i meng --save

# Usage
```js
  import Store, { lift, resource } from 'meng'
  import { ajax } from 'rxjs/observable/dom/ajax'
  
  //建议组件使用class写法，组件名字开头大写
  @resource(ajax.get("/test"), "field2")
  @resource("test", "field1")
  @lift({todos: []})
  class App extends React.Component {
    render() {
      const { setState, field1, field2, todos } from this.props
      return <div></div>
    }
  }
```

# Api
## lift(initialState)
把普通组件提升为meng组件的方法，只有一个参数，表示初始化组件状态

## resource(any|Observable, string|Function, [string|Function])
第一个参数可以接收任意值，也可以是rxjs的Observable, 推荐使用rxjs的ajax方法处理接口。
第二个参数是当第一个参数成功注入的时候的回调，如果是字符串则表示作为变量注入到组件对应的Store里，如果是函数，则调用这个函数
第三个参数是第一个参数注入失败之后的回调，如果是字符串则表示作为变量注入到组件对应的Store里，如果是函数，则调用这个函数

# Store
相当于ng的rootScope，那么你可能要问scope呢，对的，这里的每个使用lift提升过的组件都有自己的store，或者叫scope都行。
你可以直接使用`Store.组件名`来访问mounted的组件的状态。组件之间的通讯也是这么实现的，你可以`Store.组件名.setState()`直接修改另一个组件的状态！
每个store，包括根store都是StoreConstructor的实例，它包含以下属性:
+ `state` 每个store的状态都存在这个容器里面
+ `@@subject` 每个store的事件触发器，它是rxjs的Subject，不懂的可以忽略
+ `setState` 改变当前store的方法，它和react的setState方法一样，甚至包括回调。

# 设计思路
参考我的博客[关于react的数据流新思路](https://github.com/huangbinjie/coral/issues/2)