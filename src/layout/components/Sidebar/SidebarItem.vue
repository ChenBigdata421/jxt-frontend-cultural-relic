<template>
  <div v-if="!item.hidden" class="menu-wrapper">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body :style="{ backgroundColor: '#77797d' }">
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  /* 在该项目中，这里的parent就是一个顶部菜单路由下的子菜单路由（每个菜单都对应着一个路由，所以暂称他们为菜单路由，
  当然顶部菜单路由并不加入到路由系统中，即点击顶部菜单也不会渲染一个相对应的组件，只是为了方便统一管理 ，也将
  顶部菜单作为路由项 ） ，不过它们的子菜单路由，或者再下一级的子菜单路由对应着相应的待渲染组件*/
  methods: { // filter函数将返回一个新数组，新数组只包含使得入参函数返回为true的元素
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })
      // 只有子菜单日志管理有两个子菜单，且都不hidden，所以showingChildren.length > 1，除此之外，其他子菜单没有自己的子菜单项
      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        // 此时，由于this.onlyOneChild中不存在noShowingChildren这个属性，所以(!onlyOneChild.children||onlyOneChild.noShowingChildren)条件为false，所以以<el-submenu>格式来展示
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        /* 扩展运算符（...）来复制 parent 对象的所有属性和值
        同时，它还添加或覆盖了两个属性：path 和 noShowingChildren,path是覆盖， noShowingChildren是追加*/
        this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }

      /* 用于将一系列路径或路径片段解析为绝对路径。这个方法会考虑当前工作目录，然后生成一个绝对路径。
      在这里实际上就是将父path和子path连接在一起*/
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
