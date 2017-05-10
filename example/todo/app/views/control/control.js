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
var Control = (function (_super) {
    __extends(Control, _super);
    function Control() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.clearCompleted = function () {
            var items = _this.props.todos.filter(function (item) { return item.status !== "completed"; });
            src_1.default.children.Todo.setState({ todos: items }, function () { return localStorage.setItem("meng-todo", JSON.stringify(_this.props)); });
        };
        _this.show = function (display) { return function () { return src_1.default.children.Todo.setState({ display: display }, function () { return localStorage.setItem("meng-todo", JSON.stringify(_this.props)); }); }; };
        return _this;
    }
    Control.prototype.render = function () {
        var _a = this.props, display = _a.display, todos = _a.todos;
        return (React.createElement("footer", { className: "footer" },
            React.createElement("span", { className: "todo-count" },
                React.createElement("strong", null, todos.filter(function (item) { return item.status === "active"; }).length),
                " item left"),
            React.createElement("ul", { className: "filters" },
                React.createElement("li", null,
                    React.createElement("a", { className: display === "all" ? "selected" : "", href: "#/", onClick: this.show("all") }, "All")),
                React.createElement("li", null,
                    React.createElement("a", { className: display === "active" ? "selected" : "", href: "#/active", onClick: this.show("active") }, "Active")),
                React.createElement("li", null,
                    React.createElement("a", { className: display === "completed" ? "selected" : "", href: "#/completed", onClick: this.show("completed") }, "Completed"))),
            React.createElement("button", { className: "clear-completed", onClick: this.clearCompleted }, "Clear completed")));
    };
    return Control;
}(React.Component));
exports.Control = Control;
