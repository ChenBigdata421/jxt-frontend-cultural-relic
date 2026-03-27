<template>
  <div :class="{'has-logo':showLogo}"><!--如果 showLogo 的值为 true，那么 has-logo 类将被添加到 div 元素上,如果 showLogo 的值为 false,那么 has-logo 类将不会被添加到 div 元素上。这样使得你能够基于组件的状态来动态改变其外观和行为-->
    <logo v-if="showLogo" :collapse="isCollapse" /><!--“collapse”通常指的是折叠或收起某个元素或组件的功能。-->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color=" $store.state.settings.themeStyle === 'light' ? variables.menuLightBg : variables.menuBg"
        :text-color="$store.state.settings.themeStyle === 'light' ? 'rgba(0,0,0,.65)' : '#fff'"
        :active-text-color="$store.state.settings.theme"
        :unique-opened="true"
        :collapse-transition="true"
        mode="vertical"
      >
        <sidebar-item
          v-for="(route) in sidebarRouters"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />

      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebarRouters',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
// 导入设计系统变量
@import "@/styles/tokens/index.scss";

// ============================================
// JXT 数字证据管理平台 - 侧边栏样式
// ============================================

.has-logo {
  // Logo 区域
  ::v-deep .sidebar-logo-container {
    position: relative;
    width: 100%;
    height: $law-nav-height;
    line-height: $law-nav-height;
    background: var(--law-bg-sidebar, $law-bg-sidebar);
    text-align: center;
    overflow: hidden;
    transition: $transition-base;

    &.collapse {
      .sidebar-logo {
        margin-right: 0;
      }
    }

    .sidebar-logo {
      display: inline-block;
      vertical-align: middle;
      margin-right: $spacing-3;
      max-width: 160px;
      height: 32px;

      &-icon {
        width: 32px;
        height: 32px;
        vertical-align: middle;
        margin-right: $spacing-2;
      }

      &-text {
        display: inline-block;
        @include text-lg;
        font-weight: $font-weight-semibold;
        color: #fff;
        vertical-align: middle;
      }
    }
  }
}

// ============================================
// 滚动条样式
// ============================================
::v-deep .scrollbar-wrapper {
  overflow-x: hidden !important;

  .el-scrollbar__view {
    height: 100%;
    padding-top: $spacing-8; // 菜单顶部间距，与 Logo 保持距离 (32px)
  }

  .el-scrollbar__bar {
    &.is-vertical {
      right: 0;
      width: 6px; // 增加宽度，更易操作
      background-color: transparent !important; // 轨道透明

      .el-scrollbar__thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: $radius-full;
        width: 4px !important; // 滑块宽度
        right: 1px; // 居中显示

        &:hover {
          background: rgba(255, 255, 255, 0.4);
          width: 6px !important; // 悬停时变宽
          right: 0;
        }
      }
    }
  }

  // 隐藏滚动条轨道的白色背景
  .el-scrollbar__wrap {
    overflow-x: hidden !important;
    background-color: transparent !important;

    // 覆盖原生滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
      background-color: transparent !important;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent !important;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;

      &:hover {
        background-color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

// ============================================
// 菜单样式
// ============================================
::v-deep .el-menu {
  border-right: none !important; // 移除 Element UI 默认的右边框
  border-left: none !important;
  height: 100%;
  width: 100% !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08); // 添加顶部边框分隔
  background-color: inherit !important; // 继承父容器背景色，避免白色背景

  // 重置所有菜单项样式
  .el-menu-item,
  .el-submenu__title {
    height: 48px;
    line-height: normal; // 重置 line-height，使用 flexbox 实现居中
    padding: 0 20px !important;
    @include text-base;
    transition: $transition-base;
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
    overflow: visible !important; // 允许箭头可见

    .svg-icon {
      margin-right: $spacing-3;
      font-size: 16px;
      transition: $transition-base;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
    }

    span {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0; // 允许 flex 子元素缩小
      overflow: hidden; // 文字溢出隐藏
      text-overflow: ellipsis; // 文字省略号
      white-space: nowrap; // 文字不换行
    }

    .el-submenu__icon-arrow {
      font-size: 12px;
      color: currentColor;
      opacity: 0.7;
      margin-left: $spacing-2;
      margin-right: $spacing-4; // 箭头距离右边缘的间距 (16px)
      flex-shrink: 0; // 箭头不缩小
      display: inline-flex !important; // 强制显示
      align-items: center;
    }
  }
}

// ============================================
// 深色主题菜单样式
// ============================================
::v-deep .el-menu:not(.el-menu--light) {
  background-color: var(--law-bg-sidebar, $law-bg-sidebar) !important;

  .el-menu-item,
  .el-submenu__title {
    color: var(--law-sidebar-text, $law-sidebar-text);

    &:hover {
      background-color: var(--law-sidebar-hover-bg, $law-sidebar-hover-bg) !important;
      color: var(--law-sidebar-text-hover, $law-sidebar-text-hover) !important;
    }

    &.is-active {
      background-color: var(--law-sidebar-active-bg, $law-sidebar-active-bg) !important;
      color: var(--law-sidebar-text-active, $law-sidebar-text-active) !important;
      font-weight: $font-weight-medium;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--law-primary, $law-primary);
        animation: slideInLeft 0.3s ease-out;
      }
    }
  }

  // 子菜单
  .el-submenu {
    .el-menu {
      background-color: var(--law-sidebar-submenu-bg, $law-sidebar-submenu-bg) !important;

      .el-menu-item {
        padding-left: 56px !important;

        &.is-active {
          background-color: var(--law-sidebar-active-bg, $law-sidebar-active-bg) !important;
        }
      }
    }

    &.is-active {
      > .el-submenu__title {
        color: var(--law-sidebar-text-active, $law-sidebar-text-active) !important;
      }
    }
  }
}

@keyframes slideInLeft {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

// ============================================
// 浅色主题菜单样式
// ============================================
::v-deep .el-menu--light {
  background-color: var(--law-sidebar-light-bg, $law-sidebar-light-bg) !important;
  border-right: 1px solid var(--law-sidebar-light-border, $law-sidebar-light-border) !important;

  .el-menu-item,
  .el-submenu__title {
    color: var(--law-sidebar-light-text, $law-sidebar-light-text);

    &:hover {
      background-color: var(--law-sidebar-light-hover-bg, $law-sidebar-light-hover-bg) !important;
      color: var(--law-sidebar-light-text-hover, $law-sidebar-light-text-hover) !important;
    }

    &.is-active {
      background-color: var(--law-sidebar-light-active-bg, $law-sidebar-light-active-bg) !important;
      color: var(--law-sidebar-light-text-active, $law-sidebar-light-text-active) !important;
      font-weight: $font-weight-medium;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--law-primary, $law-primary);
        animation: slideInLeft 0.3s ease-out;
      }
    }
  }

  // 子菜单
  .el-submenu {
    .el-menu {
      background-color: #fafafa !important;

      .el-menu-item {
        padding-left: 56px !important;
      }
    }

    .el-submenu__title {
      border-bottom: 1px solid var(--law-gray-200, $law-gray-200);
    }
  }
}

// ============================================
// 折叠状态
// ============================================
::v-deep .el-menu--collapse {
  .el-menu-item,
  .el-submenu__title {
    padding: 0 20px !important;
    text-align: center;

    .svg-icon {
      margin-right: 0;
    }

    span {
      display: none;
    }
  }

  .el-submenu {
    .el-menu {
      .el-menu-item {
        padding-left: 20px !important;
      }
    }
  }
}
</style>
