import * as React from 'react'
import { render } from 'react-dom'
import Scroll from 'react-iscroller'

import { lift, inject } from '../../../src/'
import { fetchData } from './api'

@inject(fetchData, (state: any) => {
    return ({ lis: state })
})
@lift({ lis: [], page: 1 })
class App extends React.Component<any, any> {
    render() {
        console.log(this.props)
        const lis = this.props.lis.map((n: string, i: number) => <li key={i} style={{ height: "20px", lineHeight: "20px" }}>{n}</li>)
        return (
            <div>
                <Scroll onEnd={this.onend}>{lis}</Scroll>
            </div>
        )
    }
    private onend = () => {
        this.props.setState({})
    }
}

render(<App />, document.getElementById("root"))