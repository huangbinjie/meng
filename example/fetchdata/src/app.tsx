import * as React from 'react'
import { render } from 'react-dom'
import Scroll from 'react-iscroller'

import { lift, inject } from '../../../src/'
import { fetchData } from './api'

@inject(fetchData, "lis")
@lift({ lis: [] })
class App extends React.Component<any, any> {
    componentDidMount() {
        fetchData().then(list => this.setState({ lis: list }))
    }
    render() {
        const lis = this.props.lis.map((n: string, i: number) => <li key={i} style={{ height: "20px", lineHeight: "20px" }}>{n}</li>)
        return (
            <div>
                <Scroll onEnd={this.onend}>{lis}</Scroll>
            </div>
        )
    }
    private onend = () => {
        fetchData().then(list => this.setState({ lis: this.state.lis.concat(list) }))
    }
}

render(<App />, document.getElementById("root"))