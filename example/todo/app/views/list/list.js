"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var src_1 = require("../../../../../src");
var List = (function (_super) {
    __extends(List, _super);
    function List() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.toggle = function (index) { return function () {
            var todos = _this.props.todos.slice();
            var item = todos[index];
            var toggledState = item.status === "active" ? "completed" : "active";
            item.status = toggledState;
            src_1.default.children.Todo.setState({ todos: todos }, function () { return localStorage.setItem("meng-todo", JSON.stringify(_this.props)); });
        }; };
        _this.destroy = function (index) { return function () {
            var items = _this.props.todos.slice();
            items.splice(index, 1);
            src_1.default.children.Todo.setState({ todos: items }, function () { return localStorage.setItem("meng-todo", JSON.stringify(_this.props)); });
        }; };
        return _this;
    }
    List.prototype.render = function () {
        var _this = this;
        var items = this.props.todos.map(function (todo, index) { return (React.createElement("li", { className: todo.status, key: index },
            React.createElement("div", { className: "view" },
                React.createElement("input", { className: "toggle", type: "checkbox", onChange: _this.toggle(index), checked: todo.status === "completed" ? true : false }),
                React.createElement("label", null, todo.value),
                React.createElement("button", { className: "destroy", onClick: _this.destroy(index) })))); });
        return (React.createElement("section", { className: "main" },
            React.createElement("input", { className: "toggle-all", type: "checkbox" }),
            React.createElement("label", { htmlFor: "toggle-all" }, "Mark all as complete"),
            React.createElement("ul", { className: "todo-list" }, items)));
    };
    return List;
}(React.Component));
exports.List = List;
