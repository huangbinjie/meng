"use strict";
const page1 = Array.apply(null, { length: 10 }).map((acc, x) => (1 - 1) * 10 + x + 1);
const page2 = Array.apply(null, { length: 10 }).map((acc, x) => (2 - 1) * 10 + x + 1);
const page3 = Array.apply(null, { length: 10 }).map((acc, x) => (3 - 1) * 10 + x + 1);
const page4 = Array.apply(null, { length: 10 }).map((acc, x) => (4 - 1) * 10 + x + 1);
const page5 = Array.apply(null, { length: 10 }).map((acc, x) => (5 - 1) * 10 + x + 1);
exports.fetchData = (currentStore, nextStore) => new Promise((resolve, reject) => {
    switch (nextStore.page) {
        case 1: resolve(page1);
        case 2: resolve(page2);
        case 3: resolve(page3);
        case 4: resolve(page4);
        case 5: resolve(page5);
    }
});
