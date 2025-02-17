<template>
  <el-menu
    :default-active="activeMenu"
    mode="horizontal"
    @select="handleSelect"
  >
    <template v-for="(item, index) in topMenus">
      <el-menu-item
        v-if="index < visibleNumber"
        :key="index"
        :index="item.path"
      ><svg-icon :icon-class="item.meta.icon" />
        {{ item.meta.title }}</el-menu-item>
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <!--title插槽是el-submenu组件的插槽-->
    <el-submenu v-if="topMenus.length > visibleNumber" index="more">
      <template slot="title">更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item
          v-if="index >= visibleNumber"
          :key="index"
          :index="item.path"
        ><svg-icon :icon-class="item.meta.icon" />
          {{ item.meta.title }}</el-menu-item>
      </template>
    </el-submenu>
  </el-menu>
</template>

<script>
import { constantRoutes } from '@/router'

export default {
  data() {
    return {
      // 顶部栏初始数
      visibleNumber: 5,
      // 是否为首次加载
      isFrist: false
    }
  },
  computed: {
    // 顶部显示菜单
    /* 目的是为了创建一个仅包含顶级菜单项的数组，而不包含任何子菜单项。这在前端开发中是很常见的需求，
    尤其是在构建嵌套菜单时。有时你可能想要展示整个菜单结构，而有时你可能只想展示顶级菜单项。通过将 children
    属性设置为 undefined，你可以确保只显示顶级菜单项，而不会意外地展开任何子菜单。
    topMenus 方法返回的新数组中的每个对象都是 this.routers 数组中对应对象的浅拷贝，但它们的 children 属性
    都被设置为 undefined。
    map是数组类型的一个方法*/
    topMenus() {
      return this.routers.map((menu) => ({
        ...menu,
        children: undefined
      }))
    },
    // 所有的路由信息
    routers() {
      return this.$store.state.permission.topbarRouters// 只包含顶部的四个菜单：系统管理、定时任务、系统工具、开发工具，对应的path为：/admin,/schedule,/sys-tools,/dev-tools
    },
    /* 将每个顶级菜单的孩子菜单路由取出并独立存放在一个数组中，最后连同固定路由一起返回，注意每条子路由
    信息新增一个parentPath属性，因为独立存放，所以必须与父菜单关联起来*/
    childrenMenus() {
      var childrenMenus = []
      this.routers.map((router) => {
        for (var item in router.children) {
          if (router.children[item].parentPath === undefined) {
            router.children[item].parentPath = router.path
          }
          childrenMenus.push(router.children[item])
        }
      })
      return constantRoutes.concat(childrenMenus) // 注意这里并不是将childrenMenus放入constantRoutes路由中，而是将二者联合起来一起返回，constantRoutes路由并没有发生改变
    },
    // 默认激活的菜单
    activeMenu() {
      const path = this.$route.path// 重新登录后，当前路由不会发生变化，即仍是上次登录后的当前路由
      let activePath = this.routers[0].path // 如果当前路由为"/dashboard"，即当前活动页为首页，则顶部激活菜单的路径/admin
      if (path.lastIndexOf('/') > 0) { // 假设当前路由为："/sys-tools/monitor"
        const tmpPath = path.substring(1, path.length)// tmpPath = sys-tools/monitor
        activePath = '/' + tmpPath.substring(0, tmpPath.indexOf('/'))// activePath = /sys-tools，也就是说，如果当前路由为"/sys-tools/monitor"，那么这里需要将它的父路径提取出来
      } else if (path === '/index' || path === '') {
        if (!this.isFrist) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.isFrist = true
        } else {
          activePath = 'index'
        }
      }
      this.activeRoutes(activePath)
      return activePath
    }
  },
  mounted() {
    this.setVisibleNumber()
  },
  methods: {
    // 根据宽度计算设置显示栏数
    setVisibleNumber() {
      const width = document.body.getBoundingClientRect().width - 200
      const elWidth = this.$el.getBoundingClientRect().width
      const menuItemNodes = this.$el.children
      const menuWidth = Array.from(menuItemNodes).map(
        (i) => i.getBoundingClientRect().width
      )
      this.visibleNumber = (
        parseInt(width - elWidth) / parseInt(menuWidth)
      ).toFixed(0)
    },
    // 菜单选择事件，这里的key对应的就是<el-menu-item>的index属性
    handleSelect(key, keyPath) {
      if (key.indexOf('http://') !== -1 || key.indexOf('https://') !== -1) {
        // http(s):// 路径新窗口打开
        window.open(key, '_blank')
      } else {
        this.activeRoutes(key)
      }
    },
    // 将当前活动的顶级菜单所对应的所有孩子菜单路由放在sidebar路由中。
    activeRoutes(key) {
      var routes = []
      if (this.childrenMenus && this.childrenMenus.length > 0) {
        this.childrenMenus.map((item) => {
          if (key === item.parentPath || (key === 'index' && item.path === '')) {
            routes.push(item)
          }
        })
      }
      this.$store.commit('permission/SET_SIDEBAR_ROUTERS', routes)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-menu--horizontal > .el-menu-item {
  float: left;
  height: 50px;
  line-height: 50px;
  margin: 0;
  border-bottom: 3px solid transparent;
  color: #999093;
  padding: 0 5px;
  margin: 0 10px;
}

.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 3px solid #409eff;
  color: #303133;
}
</style>
