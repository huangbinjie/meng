# mengbi

an arbitrary magic react state management.

## 安装

```js
npm i meng --save
```

## 灵感

众所周知，react是一个侧重同步数据到dom的库，也就是`(data) => dom`. 这里的data包含了`props`和`state`，但是其他的数据源不好管理，比如说api。
而现有的方案用起来都太复杂了，本来`(data) => dom`一个函数能解决的问题，用了flux架构比如redux之后，需要的模块*3。所以能不能用一种简单的方式把所有数据源都抽象成`data`，
并且能用react的方式解决问题呢，答案是肯定的，我们可以这么设计`({props, state, api}) => dom`。于是就有了meng--一个把所有数据源都抽象合并成一种数据类型的库。
由于只有rxjs能帮我们实现流的特性，所以meng@3.x是强依赖rxjs的。

## api

### Store

每一个meng组件都有自己的store，store的结构是这样的：

```js
interface Store<S> {
    state$: ReplaySubject<S> // store的触发器
    store$: Observable<S> // store的状态容器
    children: { [key: string]: Store<Object> } //存放子store，因为是扁平结构，所以只有根store的children才有子节点
    setState: Function, // 设置store$的状态
    subscribe: (success: (state: Object) => void, error?: (error: Error) => void, complete?: () => void) => Subscription // 订阅store$
}
```

所有的meng组件的状态又都会放在根节点的children里面，所以meng支持直接修改和订阅另一个组件的状态。也可以把store想象成ng的rootScope，
而children里面的store相当于ng里controller对应的scope。下面是一段demo:

```js
import Store from 'meng'

Store.children.App.setState({user: {}})
```

### lift: (initialState, initialName) => React.Component

lift函数可以把react组件提升为meng组件，他只有两个参数：

+ `initialState` 初始化meng组件的状态
+ `initialName` 设置store的名字，如果不显式的设置，则默认使用displayName、函数名称、随机一个名字，按优先级排序。

### inject: (Resource, selector) => React.Component

+ `Resource` 给组件注入数据源，可以是promise，也可以是其他组件的store，也可以是函数
+ `selector` 注入到react组件的props的变量的名称，可以是stirng也可以是返回一个对象(会覆盖store里的其他状态)

### listen: ((currentStore, nextStore) => Resource, selector) => React.Component

可以监听lift里面的状态和其他injected数据源，但是没办法监听listen数据源.

## Example

展示一段我用meng写的博客里的代码吧:

```js
const injectedList = (currentStore: Props, nextStore: Props) => {
  return currentStore.latest !== nextStore.latest
    ? list("C0PKC07FB", nextStore.latest)
      .do(newPost => newPost.messages = nextStore.post.messages.concat(newPost.messages))
    : null
}

@inject(connect, "newmsg")
@listen(injectedList, "post")
@inject(user, "user")
@inject(() => list("C0PKC07FB", "0"), "post")
@lift({ latest: "0", newmsg: [] as ISlackMessage[] }, "Slack")
export default class Slack extends React.Component<Props, void> {
  public render() {
    return (
      <div className={Style.SLACK}>
        <Title />
        <TextInput />
        <Flex flexGrow={1} flexDirection={"row"}>
          <Messages newmsg={this.props.newmsg} post={this.props.post} user={this.props.user} latest={this.props.latest} />
          <Users user={this.props.user} />
        </Flex>
        </div>
    )
  }
}
```

详细信息请移步我的[博客](https://github.com/huangbinjie/blog/tree/master/web/static/app)

## 高阶用法

因为inject可以接受并订阅你的任意类型数据，所以你可以随意组合你的数据源，也可以组合成高阶数据源(依赖其他数据源的数据源)，并把他们作为你视图的数据层。

```js
//组合数据源
didmount() {
  fetch("xxx")
    .then(x => fetch("yyy"))
    .then(yyy => this.setState({yyy}))
}

//数据源订阅数据源
didmount() {
  fetch("xxx")
    .then(xxx => {
      this.setState({xxx})
      return fetch("yyy")
    })
    .then(yyy => this.setState({yyy}))
}

//商品详情 url: xxx/:pid
componentReceiveProps(nextProps) {
  if (this.props.pid !== nextProps.pid) getById(pid).then(data => this.setState({data}))
}

componentDidMount() {
  getById(pid).then(data => this.setState({data}))
}

//websocket
didmount() {
  this.ws = new Websocket(url)

  ws.onmessage = (message) => {
    this.setState(message)
  }
}

willUnmount() {
  ws.close()
}
```

mengbi.jsÏ

```js
//组合数据源
@inject(() => fetch(xxx).then(xxx => fetch(yyy)), "yyy")
@lift({yyy: null})

//数据源订阅数据源
@inject((currentStore, nextStore) => currentStore.xxx !== nextStore.xxx ? fetch(yyy) : null, "yyy")
@inject(() => fetch(xxx), "xxx")
@lift({xxx: null, yyy: null})

//商品详情 url: xxx/:pid
@inject((currentStore, nextStore) => currentStore.pid !== nextStore.pid ? getById(nextStore.pid) : null, "data")

//websocket(rxjs)
@inject(() => Observable.webSocket(url), "message")Ï
```

## 为什么要使用mengbi

+ 帮你去掉了组件生命周期，组件可以写更纯粹的业务(render, handle)
+ 声明式的注入数据源，而不是命令式的dispatch或者手动setState
+ 可订阅state和props和，而react只能订阅props: componentWillReceiveProps
+ 响应式设计，只需要考虑怎么写数据源，组合数据源和触发数据源
+ 跨组件通讯, 比如你有个Dialog组件被lift了，只需要`Store.children.Dialog.setState({display: "open"})`就能打开这个对话框了

## 使用上的建议

因为meng是管理数据源为主，夸组件通讯为辅的。你可以像redux那样直接注入数据源，但是应该尽量避免让组件从其他地方获取数据，原则上组件获取数据的方式只有一个，就是父组件，
所有的数据源都应该从视图开始注入，然后传到下面的子组件，这是符合依赖倒置原则的。上面的示例就是一个正确的用法。

## 其他

不需要初始化，不需要配置，不需要`import redux-xxx * N`，赶快试试吧。如果有好的建议，请发我邮箱: `akira.binjie@gmail.com`或者加我扣扣`501711499`