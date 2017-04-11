"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByCache = function () { return new Promise(function (resolve, reject) { return resolve(JSON.parse(localStorage.getItem("meng-todo"))); }); };
