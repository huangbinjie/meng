export default function shallowEqual(objA: any, objB: any) {
  if (objA === objB) {
    return true
  }

  if (objA == void 0 || objB == void 0) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB).filter(key => key !== "_callback")

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty
  for (let keyA of keysA) {
    if (!hasOwn.call(objB, keyA) ||
      objA[keyA] !== objB[keyA]) {
      return false
    }
  }

  return true
}
