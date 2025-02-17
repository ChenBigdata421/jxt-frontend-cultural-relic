<template>
  <!--使用 Element UI 库的 el-breadcrumb 和 el-breadcrumb-item 组件来创建一个面包屑导航条。
    面包屑导航条是一种显示用户当前位置在网站或应用中的路径的导航工具。
    设置面包屑项之间的分隔符为斜杠 (/)
    使用了 Vue 的 <transition-group> 组件，它为列表的每一项（在这里是 el-breadcrumb-item）提供过渡效果。-->
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import { compile } from 'path-to-regexp'

export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      /* route 对象表示当前激活的路由的状态信息。它是一个包含了当前 URL 解析得到的信息的对象，
      如 path、params、query、hash 等。 */
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      // 将当前激活的路由与首页路由串联起来，作为面包屑导航
      if (!this.isDashboard(first)) {
        matched = [{ path: '/index', meta: { title: '首页' }}].concat(matched)
      }
      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
      //假设当前路由是：path: "/admin/sys-api"，则levelList包含三项路由信息：/index，/admin,/admin/sys-api
    },
    isDashboard(route) { // 是否为仪表板
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim() === '首页'
    },
    /* 该函数作用是：比如path是：/admin/sys_role,则 pathCompile(path) 将返回父路由：/admin*/
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route
      var toPath = compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
