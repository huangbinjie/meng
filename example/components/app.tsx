/// <reference path="../../typings/tsd.d.ts" />
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Body from './body'
import Footer from './footer'

const App = () =>
  <div>
    <Body data={123}/>
    <Footer />
  </div>
  
ReactDOM.render(<App />, document.getElementById('root'))