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
const react_iscroller_1 = require("react-iscroller");
const _1 = require("../../../src/");
const api_1 = require("./api");
let App = class App extends React.Component {
    constructor() {
        super(...arguments);
        this.onend = () => {
            const page = this.props.page;
            _1.default.children.App.setState({ page: page + 1 });
        };
    }
    render() {
        const lis = this.props.lis.map((n, i) => React.createElement("li", { key: i, style: { height: "20px", lineHeight: "20px" } }, n));
        return (React.createElement("div", null,
            React.createElement(react_iscroller_1.default, { onEnd: this.onend }, lis)));
    }
};
App = __decorate([
    _1.listen((currentStore, nextStore) => api_1.fetchData, (currentState, state) => ({ lis: [...currentState.lis, ...state] })),
    _1.lift({ lis: [], page: 1 })
], App);
react_dom_1.render(React.createElement(App, null), document.getElementById("root"));
