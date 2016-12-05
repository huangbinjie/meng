export default function shallowEqualValue(source: any, target: any) {
  const targetKeys = Object.keys(target)

  if (targetKeys.length === 0) return true

  const hasOwn = Object.prototype.hasOwnProperty
  for (let i = 0; i < targetKeys.length; i++) {
    if (!hasOwn.call(source, targetKeys[i]) ||
      source[targetKeys[i]] !== target[targetKeys[i]]) {
      return false
    }
  }

  return true

}