<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  /* 该组件称为函数式组件。这种方式允许开发者以声明式的方式动态构建组件的结构，
  同时保持了代码的简洁性和可读性。函数式组件由于其无状态和无实例的特性，通常会带来更好
  的性能和较少的内存消耗。函数最后返回 vnodes 数组，这个数组包含了所有创建的虚拟节点。
  在 Vue.js 中，虚拟节点是渲染函数的基本返回单位，它们最终会被转换成实际的 DOM 元素。*/
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      vnodes.push(<svg-icon icon-class={icon}/>)
    }

    if (title) {
      vnodes.push(<span slot='title'>{(title)}</span>)
    }
    return vnodes
  }
}
</script>
