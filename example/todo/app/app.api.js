"use strict";
exports.getByCache = function () { return new Promise(function (resolve, reject) { return resolve(JSON.parse(localStorage.getItem("meng-todo"))); }); };
