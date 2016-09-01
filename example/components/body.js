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
var React = require('react');
var _1 = require('../../');
// @resource(props => {
//   console.log(props);
//   return new Promise((resolve, reject) => {
//     setTimeout(() => resolve(11111), 3000)
//   })
// }, "lazyProps")
var Body = (function (_super) {
    __extends(Body, _super);
    function Body() {
        _super.apply(this, arguments);
        this.state = _1["default"]["Body"].state;
    }
    Body.prototype.render = function () {
        var _a = this.props, _b = _a.num, num = _b === void 0 ? 0 : _b, text = _a.text, data = _a.data, setState = _a.setState, userInfo = _a.userInfo, lazyProps = _a.lazyProps;
        // console.log(lazyProps)
        return (React.createElement("div", null, 
            React.createElement("button", {onClick: add(num, setState)}, "+"), 
            React.createElement("p", null, 
                "数字: ", 
                num), 
            React.createElement("button", {onClick: reduction(num, setState)}, "-"), 
            React.createElement("p", null, 
                "props-data: ", 
                data), 
            React.createElement("button", {onClick: timeoutHandle(setState)}, "异步"), 
            React.createElement("p", null, text), 
            React.createElement("p", null, 
                "Store: ", 
                JSON.stringify(userInfo))));
    };
    Body = __decorate([
        _1.resource(_1["default"], "userInfo"),
        _1.lift()
    ], Body);
    return Body;
}(React.Component));
exports.__esModule = true;
exports["default"] = Body;
var add = function (num, setState) { return function (e) {
    _1["default"]["Footer"].setState({ num: ++_1["default"]["Footer"].state.num });
}; };
var reduction = function (num, setState) { return function (e) { return _1["default"]["Footer"].setState({ num: --_1["default"]["Footer"].state.num }); }; };
var timeoutHandle = function (setState) { return function (e) { return new Promise(function (resolve, reject) {
    setTimeout(function () { return resolve("服务器返回了一段测试数据"); }, 1000);
}).then(function (response) { return setState({ text: response }); }); }; };
