"use strict";
var React = require('react');
var ReactDOM = require('react-dom');
var body_1 = require('./body');
var footer_1 = require('./footer');
var App = function () {
    return React.createElement("div", null, 
        React.createElement(body_1.default, {data: 123}), 
        React.createElement(footer_1.default, null));
};
ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
//# sourceMappingURL=app.js.map