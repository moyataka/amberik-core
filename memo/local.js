module.exports = () => {
  const data = []

  return {
    set: (key, x) => {
      return new Promise((resolve) => {
        data[key] = x
        resolve(true)
      })
    },
    get: (key) => {
      return new Promise((resolve) => {
        resolve(data[key])
      })
    },
    delete: (key) => {
      return new Promise((resolve) => {
        delete data[key]
        return resolve(true)
      })
    },
  }
}
