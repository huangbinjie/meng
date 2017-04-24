"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function* dataGenerator() {
    let index = 0;
    while (true) {
        const arr = [];
        for (let i = 100; i--;) {
            arr.push(index++);
        }
        yield arr;
    }
}
const gen = dataGenerator();
exports.fetchData = (lis) => new Promise((resolve, reject) => {
    console.log("this is a request");
    resolve(gen.next().value);
});
