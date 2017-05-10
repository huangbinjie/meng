//接口文件

export const getByCache = () => new Promise((resolve, reject) => resolve(JSON.parse(localStorage.getItem("meng-todo"))))