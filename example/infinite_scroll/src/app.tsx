import * as React from 'react'
import { render } from 'react-dom'
import Scroll from 'react-iscroller'

import Store, { lift, inject, listen } from '../../../src/'
import { fetchData } from './api'

type Props = {
    lis: number[]
    page: number
}

@listen<Props>((currentStore, nextStore) => fetchData, (currentState, state: Props["lis"]) => ({ lis: [...currentState.lis, ...state] }))
@lift({ lis: [], page: 1 })
class App extends React.Component<any, any> {
    render() {
        // console.log(this.props)
        const lis = this.props.lis.map((n: string, i: number) => <li key={i} style={{ height: "20px", lineHeight: "20px" }}>{n}</li>)
        return (
            <div>
                <Scroll onEnd={this.onend}>{lis}</Scroll>
            </div>
        )
    }
    private onend = () => {
        const page = this.props.page
        Store.children.App.setState({ page: page + 1 })
    }
}

render(<App />, document.getElementById("root"))