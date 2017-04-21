export default function shallowPartialEqual(source: any, target: any) {
  // 防止可能有callback导致都通过
  const targetKeys = Object.keys(target).filter(key => key !== "_callback")

  const hasOwn = Object.prototype.hasOwnProperty
  for (let targeKey of targetKeys) {
    if (!hasOwn.call(source, targeKey) ||
      source[targeKey] !== target[targeKey]) {
      return false
    }
  }

  return true

}
