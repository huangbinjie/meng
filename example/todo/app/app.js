"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var React = require("react");
var react_dom_1 = require("react-dom");
var src_1 = require("../../../src");
window["Store"] = src_1.default;
var app_api_1 = require("./app.api");
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.apply(this, arguments) || this;
        _this.onkeydown = function (event) {
            if (event.value === "")
                return;
            if (event.keyCode === 13) {
                var lls = _this.props.list.slice();
                lls.push({ status: "active", value: event.target.value });
                event.target.value = "";
                _this.props.setState({ list: lls });
            }
        };
        _this.toggle = function (data, index) { return function (event) {
            var items = _this.props.list.map(function (item, _index) {
                if (_index === index && item.status === "active")
                    return { status: "completed", value: item.value };
                if (_index === index && item.status === "completed")
                    return { status: "active", value: item.value };
                return item;
            });
            _this.props.setState({ list: items });
        }; };
        _this.destroy = function (index) { return function () {
            var items = _this.props.list.slice();
            items.splice(index, 1);
            _this.props.setState({ list: items });
        }; };
        _this.clearCompleted = function () {
            var items = _this.props.list.filter(function (item) { return item.status !== "completed"; });
            _this.props.setState({ list: items });
        };
        _this.show = function (display) { return function () { return _this.props.setState({ display: display }); }; };
        return _this;
    }
    App.prototype.componentDidMount = function () {
        src_1.default.children["App"].subscribe(function (store) {
            localStorage.setItem("meng-todo", JSON.stringify(store));
        });
    };
    App.prototype.render = function () {
        var _this = this;
        var display = this.props.display;
        console.log(this.props);
        var lis = this.props.list.filter(filter(display)).map(function (li, index) {
            if (li.status === "active")
                return React.createElement(ActiveItem, { key: index, index: index, data: li, toggle: _this.toggle, destroy: _this.destroy });
            if (li.status === "completed")
                return React.createElement(CompletedItem, { key: index, index: index, data: li, toggle: _this.toggle, destroy: _this.destroy });
        });
        return (React.createElement("section", { className: "todoapp" },
            React.createElement("header", { className: "header" },
                React.createElement("h1", null, "todos"),
                React.createElement("input", { className: "new-todo", onKeyDown: this.onkeydown, placeholder: "What needs to be done?", autoFocus: true })),
            React.createElement("section", { className: "main" },
                React.createElement("input", { className: "toggle-all", type: "checkbox" }),
                React.createElement("label", { htmlFor: "toggle-all" }, "Mark all as complete"),
                React.createElement("ul", { className: "todo-list" }, lis)),
            React.createElement("footer", { className: "footer" },
                React.createElement("span", { className: "todo-count" },
                    React.createElement("strong", null, this.props.list.filter(function (item) { return item.status === "active"; }).length),
                    " item left"),
                React.createElement("ul", { className: "filters" },
                    React.createElement("li", null,
                        React.createElement("a", { className: display === "all" ? "selected" : "", href: "#/", onClick: this.show("all") }, "All")),
                    React.createElement("li", null,
                        React.createElement("a", { className: display === "active" ? "selected" : "", href: "#/active", onClick: this.show("active") }, "Active")),
                    React.createElement("li", null,
                        React.createElement("a", { className: display === "completed" ? "selected" : "", href: "#/completed", onClick: this.show("completed") }, "Completed"))),
                React.createElement("button", { className: "clear-completed", onClick: this.clearCompleted }, "Clear completed"))));
    };
    return App;
}(React.Component));
App = __decorate([
    src_1.inject(function (currentStore, nextStore) {
        if (nextStore.p1 && nextStore.p1 !== currentStore.p1)
            return Promise.resolve(nextStore.p1 + 2);
    }, "p2"),
    src_1.inject(function () { return Promise.resolve(1); }, "p1"),
    src_1.inject(app_api_1.getByCache, function (cache) { return cache === null ? {} : cache; }),
    src_1.lift({ list: [], display: "all" }),
    __metadata("design:paramtypes", [])
], App);
var filter = function (display) { return function (li) {
    if (display === "all")
        return true;
    if (li.status === display)
        return true;
}; };
var ActiveItem = function (_a) {
    var index = _a.index, data = _a.data, toggle = _a.toggle, destroy = _a.destroy;
    return React.createElement("li", null,
        React.createElement("div", { className: "view" },
            React.createElement("input", { className: "toggle", type: "checkbox", onChange: toggle(data, index) }),
            React.createElement("label", null, data.value),
            React.createElement("button", { className: "destroy", onClick: destroy(index) })),
        React.createElement("input", { className: "edit", defaultValue: "Rule the web" }));
};
var CompletedItem = function (_a) {
    var index = _a.index, data = _a.data, toggle = _a.toggle, destroy = _a.destroy;
    return React.createElement("li", { className: "completed" },
        React.createElement("div", { className: "view" },
            React.createElement("input", { className: "toggle", type: "checkbox", onChange: toggle(data, index), checked: true }),
            React.createElement("label", null, data.value),
            React.createElement("button", { className: "destroy", onClick: destroy(index) })),
        React.createElement("input", { className: "edit", defaultValue: "Create a TodoMVC template" }));
};
react_dom_1.render(React.createElement(App, null), document.getElementById("app"));
