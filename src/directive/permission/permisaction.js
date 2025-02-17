import store from '@/store'
/* 自定义指令具有几个可选的钩子函数，包括 bind、inserted、update
bind当指令第一次绑定到元素上时调用。此时，元素尚未被插入到父元素中。
可以在这个钩子中执行一些初始化操作，比如设置初始值或添加事件监听器。
inserted当被绑定的元素插入到父元素中时调用（这仅保证父元素存在，但不一定已被插入到文档中）。
如果你需要在 DOM 插入后立即执行操作，这个钩子非常有用。
update当指令的绑定值更新时调用，但可能发生在其子元素还未更新之前。
这个钩子对于需要响应数据变化并执行相应操作的指令非常有用。update 钩子
会在每次绑定值变化时触发，而不仅仅是第一次。如果指令的值没有变化，
update 钩子将不会被调用 */
export default {
  inserted(el, binding, vnode) {
    const { value } = binding
    const all_permission = '*:*:*'
    const permissions = store.getters && store.getters.permisaction
    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
