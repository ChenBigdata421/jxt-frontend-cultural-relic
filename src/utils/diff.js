// utils/diff.js
// Returns the changed portion of newObj relative to oldObj (added/modified).
// Optional includeRemoved=true marks deleted fields with removedValue.

export function diff(oldObj, newObj, options = {}) {
  const { includeRemoved = false, removedValue = null, comparator } = options

  function isObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)
  }
  function isDate(v) {
    return v instanceof Date
  }

  function equal(a, b) {
    if (typeof comparator === 'function') return comparator(a, b)
    if (isDate(a) && isDate(b)) return a.getTime() === b.getTime()
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) if (!equal(a[i], b[i])) return false
      return true
    }
    if (isObject(a) && isObject(b)) {
      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)
      if (aKeys.length !== bKeys.length) return false
      for (const k of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, k) || !equal(a[k], b[k])) return false
      }
      return true
    }
    return a === b
  }

  function inner(o, n) {
    const oIsObj = isObject(o)
    const nIsObj = isObject(n)

    if (equal(o, n)) return undefined

    if (oIsObj && nIsObj) {
      const result = {}
      const keys = new Set([...Object.keys(o || {}), ...Object.keys(n || {})])
      for (const k of keys) {
        const hasO = Object.prototype.hasOwnProperty.call(o || {}, k)
        const hasN = Object.prototype.hasOwnProperty.call(n || {}, k)

        if (hasN) {
          const sub = inner(hasO ? o[k] : undefined, n[k])
          if (sub !== undefined) result[k] = sub
        } else if (hasO && includeRemoved) {
          result[k] = removedValue
        }
      }
      return Object.keys(result).length ? result : undefined
    }

    if (Array.isArray(o) && Array.isArray(n)) {
      return equal(o, n) ? undefined : n
    }

    if (isDate(n)) return n

    return n
  }

  const res = inner(oldObj ?? {}, newObj ?? {})
  return res === undefined ? {} : res
}

export default diff
