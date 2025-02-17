const storage = {
  set(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    localStorage.setItem(key, value)
  }, // 当浏览器关闭后，localStorage 中的数据并没有“移动”到另一个物理位置，而是仍然保留在用户的浏览器环境中，具体来说，是保留在浏览器的存储系统中。这个存储系统通常是浏览器自身的一部分，用于在用户的计算机上持久化存储各种类型的数据
  get(key) {
    let value = localStorage.getItem(key)
    if (value && value.indexOf('{') !== -1) {
      value = JSON.parse(value)
    }
    return value
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

export default storage
