<script>
export default {
  created() {
    const { params, query } = this.$route
    const { path } = params
    this.$router.replace({ path: '/' + path, query })
    /* router 是 Vue Router 的实例，它包含了整个应用的路由配置和相关的功能方法。
    允许你编程式地导航到不同的路由，*/
  },
  render: function(h) {
    return h() // avoid warning message
  }
  /* 它允许你使用JavaScript直接编写组件的模板。虽然大多数情况下，我们使用模板语法（
  HTML-based syntax）来定义Vue组件的结构，但在某些复杂或性能关键的场景中，使用render
  函数可能更为合适。render函数的调用时机是在组件的挂载过程中，具体是在beforeMount生命周期钩子之后，
  但在实际的DOM更新之前。这个阶段，Vue已经完成了组件的初始化工作，并准备生成组件的虚拟DOM树
  来进行后续的渲染和更新操作。*/
}
</script>
