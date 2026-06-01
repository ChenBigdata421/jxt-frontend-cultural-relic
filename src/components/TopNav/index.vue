<template>
  <div class="top-nav-wrapper">
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

    <div ref="measureMenu" class="top-nav-measure" aria-hidden="true">
      <div
        v-for="(item, index) in topMenus"
        :key="index"
        class="measure-menu-item"
      >
        <svg-icon :icon-class="item.meta.icon" />
        {{ item.meta.title }}
      </div>
      <div ref="measureMore" class="measure-menu-item measure-more-item">更多菜单</div>
    </div>
  </div>
</template>

<script>
import { constantRoutes } from '@/router'

export default {
  data() {
    return {
      // 顶部栏初始数
      visibleNumber: 5,
      // 是否为首次加载
      isFrist: false,
      // 防抖定时器
      resizeTimer: null,
      // 是否已完成首次计算
      isInitialized: false
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
    },
    // 侧边栏展开/收起状态
    sidebarOpened() {
      return this.$store.state.app.sidebar.opened
    }
  },
  watch: {
    // 监听侧边栏展开/收起状态变化
    sidebarOpened() {
      // 侧边栏状态变化时，延迟重新计算菜单数量
      // 需要等待侧边栏动画完成（通常是 300ms）
      setTimeout(() => {
        this.setVisibleNumber()
      }, 350)
    }
  },
  mounted() {
    // 初始化计算
    this.initVisibleNumber()

    // 添加窗口大小变化监听器，用于屏幕缩放时重新计算可见菜单数
    window.addEventListener('resize', this.handleResize)

    // 监听 visualViewport 变化（用于 Ctrl++ 缩放等场景）
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleResize)
    }

    // 监听字体加载完成事件
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.setVisibleNumber()
      })
    }
  },
  beforeDestroy() {
    // 移除监听器
    window.removeEventListener('resize', this.handleResize)

    // 移除 visualViewport 监听器
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleResize)
    }

    // 清除防抖定时器
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }
  },
  methods: {
    // 初始化可见菜单数量（首次加载时使用）
    initVisibleNumber() {
      // 首次加载时，先显示所有菜单，然后延迟计算
      // 这样可以确保菜单项已经渲染完成
      this.visibleNumber = this.topMenus.length

      // 使用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        this.$nextTick(() => {
          this.setVisibleNumber()
          this.isInitialized = true
        })
      })
    },

    // 处理窗口大小变化（包括屏幕缩放）
    handleResize() {
      // 使用防抖，避免频繁计算
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = setTimeout(() => {
        this.setVisibleNumber()
      }, 100)
    },

    // 根据宽度计算设置显示栏数
    setVisibleNumber() {
      // 等待 DOM 更新完成后再计算
      this.$nextTick(() => {
        const menuContainer = this.$el
        if (!menuContainer) return

        const totalMenus = this.topMenus.length
        if (totalMenus === 0) return

        // 获取导航栏的可用宽度
        // 减去右侧安全间距，确保菜单与右侧时间区域保持足够距离
        // 配合 Navbar 中 .breadcrumb-container 的 margin-right(32px) 共同保证视觉间距
        const RIGHT_MARGIN = 48
        const availableWidth = menuContainer.getBoundingClientRect().width - RIGHT_MARGIN

        const measureMenu = this.$refs.measureMenu
        if (!measureMenu) return

        const menuItemNodes = Array.from(measureMenu.querySelectorAll('.measure-menu-item:not(.measure-more-item)'))
        if (menuItemNodes.length === 0) {
          // 如果没有普通菜单项，可能是首次渲染还未完成，稍后重试
          if (!this.isInitialized) {
            setTimeout(() => this.setVisibleNumber(), 50)
          }
          return
        }

        // 计算所有普通菜单项的总宽度
        const itemWidths = menuItemNodes.map((item) => {
          const width = item.getBoundingClientRect().width
          return width > 0 ? width : 80
        })
        const totalMenuWidth = itemWidths.reduce((total, width) => total + width, 0)

        // "更多菜单"的宽度：测量实际宽度，并加上下拉箭头的额外空间
        // el-submenu 会额外渲染一个箭头图标(~16px) + padding(~20px)
        const ARROW_AND_PADDING = 36
        const measuredMoreWidth = this.$refs.measureMore
          ? this.$refs.measureMore.getBoundingClientRect().width
          : 0
        const moreMenuWidth = (measuredMoreWidth > 0 ? measuredMoreWidth : 80) + ARROW_AND_PADDING

        if (totalMenuWidth > availableWidth) {
          // 需要显示"更多菜单"，计算可以显示多少个菜单项
          // 可用于菜单项的宽度（减去"更多菜单"的宽度）
          const availableForMenus = availableWidth - moreMenuWidth
          let visibleCount = 0
          let usedWidth = 0
          for (let index = 0; index < itemWidths.length; index++) {
            if (usedWidth + itemWidths[index] > availableForMenus) break
            usedWidth += itemWidths[index]
            visibleCount++
          }
          visibleCount = Math.max(1, Math.min(visibleCount, totalMenus - 1))
          this.visibleNumber = visibleCount
        } else {
          // 空间足够，显示所有菜单项，不需要"更多菜单"
          this.visibleNumber = totalMenus
        }
      })
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
// 导入设计系统变量
@import "@/styles/tokens/index.scss";

// ============================================
// JXT 数字证据管理平台 - 顶部一级菜单样式
// ============================================

.top-nav-wrapper {
  position: relative;
  width: 100%;
  min-width: 0;
}

.top-nav-measure {
  position: absolute;
  left: -99999px;
  top: -99999px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  visibility: hidden;
  pointer-events: none;
}

.measure-menu-item {
  height: $law-nav-height;
  line-height: $law-nav-height;
  padding: $nav-item-padding;
  margin: 0 $nav-item-gap;
  @include text-base;
  font-weight: $font-weight-medium;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;

  .svg-icon {
    margin-right: $spacing-2;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
}

.el-menu--horizontal {
  border-bottom: none !important;
  background: transparent !important;
  display: flex;
  align-items: center;
  // 恢复：防止菜单换行，使用"更多菜单"机制
  flex-wrap: nowrap;
  white-space: nowrap;
  // 注意：不能使用 overflow: hidden，否则会截断"更多菜单"
  // 通过 JS 动态计算可见菜单数来控制显示
  overflow: visible;

  & > .el-menu-item,
  & > .el-submenu {
    float: left;
    height: $law-nav-height;
    line-height: $law-nav-height;
    margin: 0;
    border-bottom: 3px solid transparent;
    color: var(--law-nav-text, $law-nav-text);
    padding: $nav-item-padding;
    margin: 0 $nav-item-gap;
    @include text-base;
    font-weight: $font-weight-medium;
    transition: $transition-base;
    position: relative;
    display: inline-flex;
    align-items: center;
    // 防止单个菜单项换行
    flex-shrink: 0;
    white-space: nowrap;

    // 使用 flexbox 确保内容垂直居中
    span {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    .svg-icon {
      margin-right: $spacing-2;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }

    &:hover {
      background: var(--law-nav-hover-bg, $law-nav-hover-bg) !important;
      color: var(--law-nav-text-hover, $law-nav-text-hover) !important;
      border-bottom-color: transparent;
    }

    &.is-active {
      border-bottom-color: var(--law-nav-indicator, $law-nav-indicator);
      color: var(--law-nav-text-active, $law-nav-text-active) !important;
      font-weight: $font-weight-semibold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--law-nav-indicator, $law-nav-indicator);
        animation: slideIn 0.3s ease-out;
      }
    }
  }

  & > .el-submenu {
    .el-submenu__title {
      height: $law-nav-height;
      line-height: $law-nav-height;
      border-bottom: 3px solid transparent;
      color: var(--law-nav-text, $law-nav-text);
      @include text-base;
      font-weight: $font-weight-medium;
      transition: $transition-base;
      display: flex;
      align-items: center;
      padding: $nav-item-padding;

      span {
        display: flex;
        align-items: center;
      }

      .el-submenu__icon-arrow {
        margin-left: $spacing-1;
        vertical-align: middle;
      }

      &:hover {
        background: var(--law-nav-hover-bg, $law-nav-hover-bg) !important;
        color: var(--law-nav-text-hover, $law-nav-text-hover) !important;
        border-bottom-color: transparent;
      }
    }
  }
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

// ============================================
// 下拉菜单样式
// ============================================
::v-deep .el-menu--popup {
  min-width: 160px;
  padding: $spacing-2;
  border: 1px solid var(--law-gray-200, $law-gray-200);
  border-radius: $radius-md;
  box-shadow: $shadow-dropdown;
  background: var(--law-bg-card, $law-bg-card);
  margin-top: 4px;

  .el-menu-item {
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-sm;
    @include text-base;
    color: var(--law-gray-700, $law-gray-700);
    transition: $transition-fast;
    display: flex;
    align-items: center;

    span {
      display: flex;
      align-items: center;
    }

    &:hover {
      background: var(--law-nav-hover-bg, $law-nav-hover-bg) !important;
      color: var(--law-nav-text-active, $law-nav-text-active) !important;
    }

    &.is-active {
      background: var(--law-nav-hover-bg, $law-nav-hover-bg) !important;
      color: var(--law-nav-text-active, $law-nav-text-active) !important;
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
