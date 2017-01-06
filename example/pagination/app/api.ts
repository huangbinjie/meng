const page1 = Array.apply(null, { length: 10 }).map((acc: any, x: number) => (1 - 1) * 10 + x + 1)

const page2 = Array.apply(null, { length: 10 }).map((acc: any, x: number) => (2 - 1) * 10 + x + 1)

const page3 = Array.apply(null, { length: 10 }).map((acc: any, x: number) => (3 - 1) * 10 + x + 1)

const page4 = Array.apply(null, { length: 10 }).map((acc: any, x: number) => (4 - 1) * 10 + x + 1)

const page5 = Array.apply(null, { length: 10 }).map((acc: any, x: number) => (5 - 1) * 10 + x + 1)


export const fetchData = (currentStore: Object, nextStore: any): Promise<[number]> => new Promise((resolve, reject) => {
  // console.log("currentState")
  // console.log(currentState)
  switch (nextStore.page) {
    case 1: resolve(page1)
    case 2: resolve(page2)
    case 3: resolve(page3)
    case 4: resolve(page4)
    case 5: resolve(page5)
  }
})