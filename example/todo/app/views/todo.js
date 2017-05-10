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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var src_1 = require("../../../../src");
var header_1 = require("./header/header");
var list_1 = require("./list/list");
var control_1 = require("./control/control");
var app_api_1 = require("../api/app.api");
var Todo = (function (_super) {
    __extends(Todo, _super);
    function Todo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Todo.prototype.render = function () {
        return (React.createElement("section", { className: "todoapp" },
            header_1.Header(this.props.todos),
            React.createElement(list_1.List, { todos: this.props.todos }),
            React.createElement(control_1.Control, { display: this.props.display, todos: this.props.todos })));
    };
    return Todo;
}(React.Component));
Todo = __decorate([
    src_1.inject(app_api_1.getByCache, function (currentState, cache) { return cache === null ? {} : cache; }),
    src_1.lift({ todos: [], display: "all" })
], Todo);
exports.default = Todo;
