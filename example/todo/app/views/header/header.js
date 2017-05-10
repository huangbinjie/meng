"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var src_1 = require("../../../../../src");
exports.Header = function (todos) {
    return React.createElement("header", { className: "header" },
        React.createElement("h1", null, "todos"),
        React.createElement("input", { className: "new-todo", onKeyDown: onkeydown(todos), placeholder: "What needs to be done?", autoFocus: true }));
};
var onkeydown = function (todos) { return function (event) {
    var value = event.currentTarget.value;
    if (value === "")
        return;
    if (event.keyCode === 13) {
        var newtodos = todos.slice();
        newtodos.push({ status: "active", value: value });
        event.currentTarget.value = "";
        src_1.default.children.Todo.setState({ todos: newtodos }, function () { return localStorage.setItem("meng-todo", JSON.stringify(_this.props)); });
    }
}; };
