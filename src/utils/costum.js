
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  if (time.indexOf('01-01-01') > -1) {
    return '-'
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params
  search.beginTime = ''
  search.endTime = ''
  if (dateRange != null && dateRange !== '') {
    search.beginTime = this.dateRange[0]
    search.endTime = this.dateRange[1]
  }
  return search
}

// 回显数据字典
/* Object.keys(datas) 是 JavaScript 中的一个内置方法，用于获取 datas 的所有
可枚举属性的键名（如果datas是数组，则键名就是元素序号：0，1，2...），并将它们作为一个新的数组返回。 */
export function selectDictLabel(datas, value) {
  // 防护检查：确保datas是有效的数组或对象
  if (!datas || (typeof datas !== 'object') || (Array.isArray(datas) && datas.length === 0)) {
    return '-'
  }

  // 防护检查：确保value不是null或undefined
  if (value === null || value === undefined) {
    return '-'
  }

  var actions = []
  try {
    Object.keys(datas).map((key) => {
      // 确保datas[key]存在且有value属性
      if (datas[key] && datas[key].value !== undefined && datas[key].value === ('' + value)) {
        actions.push(datas[key].label || '')
        return false
      }
    })
  } catch (error) {
    console.warn('selectDictLabel error:', error, 'datas:', datas, 'value:', value)
    return '-'
  }

  return actions.length > 0 ? actions.join('') : '-'
}

export function selectItemsLabel(datas, value) {
  var actions = []
  Object.keys(datas).map((key) => {
    if (datas[key].key === ('' + value)) {
      actions.push(datas[key].value)
      return false
    }
  })
  return actions.join('')
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments; var flag = true; var i = 1
  str = str.replace(/%s/g, function() {
    var arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str === 'undefined' || str === 'null') {
    return ''
  }
  return str
}
