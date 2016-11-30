"use strict";
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
exports.fetchData = () => new Promise((resolve, reject) => {
    console.log("this is a request");
    resolve(gen.next().value);
});
