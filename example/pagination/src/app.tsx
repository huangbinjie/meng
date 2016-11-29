import * as React from 'react'
import { render } from 'react-dom'

import { lift, inject } from '../../../src/'
import { fetchData } from './api'

type State = {
    lis: any[],
    page: number
}

@inject(fetchData, "lis")
@lift({ lis: [], page: 1 })
class App extends React.Component<any, any> {
    render() {
        console.log(this.props)
        const lis = this.props.lis.map((n: string, i: number) => <li key={i} style={{ height: "20px", lineHeight: "20px" }}>{n}</li>)
        return (
            <div>
                <button onClick={this.previousPage}>上一页</button>
                <button onClick={this.nextPage}>下一页</button>
                <ul>
                    {lis}
                </ul>
            </div>
        )
    }
    private previousPage = () => {
        if (this.props.page === 1) return
        this.setState({ page: this.props.page - 1 })
    }

    private nextPage = () => {
        if (this.props.page === 5) return
        this.setState({ page: this.props.page + 1 })
    }
}

render(<App />, document.getElementById("root"))