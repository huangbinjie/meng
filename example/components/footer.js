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
var React = require('react');
var _1 = require('../../');
var fetchData = function () { return new Promise(function (resolve, reject) {
    setTimeout(function () { return resolve("服务器返回了一段测试数据"); }, 1000);
}); };
var Footer = (function (_super) {
    __extends(Footer, _super);
    function Footer() {
        var _this = this;
        _super.apply(this, arguments);
        this.state = _1.default["Footer"].state;
        this.add = function (num) { return function (e) {
            _this.setState({ num: ++num });
        }; };
        this.reduction = function (num) { return function (e) { return _this.setState({ num: --num }); }; };
        this.timeoutHandle = function (e) { return new Promise(function (resolve, reject) {
            setTimeout(function () { return resolve("服务器返回了一段测试数据"); }, 1000);
        }).then(function (response) {
            _this.setState({ text: response });
        }); };
    }
    Footer.prototype.render = function () {
        var _a = this.state, num = _a.num, testResponse = _a.testResponse, _b = _a.text, text = _b === void 0 ? "test" : _b;
        return (React.createElement("div", null, 
            React.createElement("button", {onClick: this.add(num)}, "+"), 
            React.createElement("p", null, 
                "数字: ", 
                num), 
            React.createElement("button", {onClick: this.reduction(num)}, "-"), 
            React.createElement("button", {onClick: this.timeoutHandle}, "异步"), 
            React.createElement("p", null, text), 
            React.createElement("p", null, JSON.stringify(testResponse))));
    };
    Footer = __decorate([
        _1.resource(fetchData(), "testResponse", function (store, err) { return console.log(err); }),
        _1.lift({ num: 0 }), 
        __metadata('design:paramtypes', [])
    ], Footer);
    return Footer;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Footer;
//# sourceMappingURL=footer.js.map