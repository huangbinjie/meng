declare module "shallowequal" {
  type equal = (o1: Object, o2: Object) => boolean
  const shallowequal: equal
  export default shallowequal
}