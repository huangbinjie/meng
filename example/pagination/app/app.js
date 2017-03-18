"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_dom_1 = require("react-dom");
const _1 = require("../../../src/");
const api_1 = require("./api");
let App = class App extends React.Component {
    constructor() {
        super(...arguments);
        this.previousPage = () => {
            if (this.props.page === 1)
                return;
            this.props.setState({ page: this.props.page - 1 }, () => console.log("上一页"));
        };
        this.nextPage = () => {
            if (this.props.page === 5)
                return;
            const page = this.props.page + 1;
            this.props.setState({ page: page });
        };
    }
    render() {
        console.log(this.props);
        const lis = this.props.lis.map((n, i) => React.createElement("li", { key: i, style: { height: "20px", lineHeight: "20px" } }, n));
        return (React.createElement("div", null,
            React.createElement("button", { onClick: this.previousPage }, "\u4E0A\u4E00\u9875"),
            React.createElement("button", { onClick: this.nextPage }, "\u4E0B\u4E00\u9875"),
            React.createElement("ul", null, lis)));
    }
};
App = __decorate([
    _1.inject(api_1.fetchData, "lis"),
    _1.lift({ lis: [], page: 1 })
], App);
react_dom_1.render(React.createElement(App, null), document.getElementById("root"));
