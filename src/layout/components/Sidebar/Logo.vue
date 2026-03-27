<template>
  <div
    class="sidebar-logo-container"
    :class="{ collapse: collapse }"
    :style="{
      backgroundColor:
        $store.state.settings.themeStyle === 'dark'
          ? variables.menuBg
          : variables.menuLightBg,
    }"
  >
    <transition
      name="sidebarLogoFade"
    ><!--在 Vue.js 中，<transition> 是一个特殊的组件，用于在元素或组件的插入、更新或移除时应用淡入或淡出的过渡效果。-->
      <router-link key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logoUrl" :src="logoUrl" class="sidebar-logo">
      </router-link>
    </transition>
  </div>
</template>

<script>
import variables from '@/styles/variables.scss'
import { mapGetters } from 'vuex'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    ...mapGetters(['appInfo']),
    variables() {
      return variables
    },
    logoUrl() {
      const appInfo = this.appInfo || {}
      // 根据构建模式选择 Logo 键名
      if (process.env.VUE_APP_MODE === 'platform') {
        return appInfo.console_app_logo
      } else {
        return appInfo.sys_app_logo
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 导入设计系统变量
@import "@/styles/tokens/index.scss";

// ============================================
// 过渡动画
// ============================================
.sidebarLogoFade-enter-active {
  transition: opacity 0.3s ease-out;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

// ============================================
// Logo 容器
// ============================================
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: $law-nav-height;
  line-height: $law-nav-height;
  background: var(--law-bg-sidebar, $law-bg-sidebar);
  text-align: center;
  overflow: hidden;
  transition: $transition-base;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &.collapse {
    .sidebar-logo-link {
      .sidebar-logo {
        width: 32px;
        margin-right: 0;
      }
    }
  }

  & .sidebar-logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 0 $spacing-4;
    text-decoration: none;
    transition: $transition-base;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    & .sidebar-logo {
      width: 120px;
      height: 32px;
      max-width: 120px;
      object-fit: contain;
      vertical-align: middle;
      margin-right: $spacing-3;
      border-radius: $radius-sm;
      transition: $transition-base;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: $font-weight-semibold;
      line-height: $law-nav-height;
      @include text-base;
      font-family: $font-family-base;
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 浅色主题
  &[style*="background: #fff"],
  &[style*="background: #FFF"],
  &[style*="background: #FFFFFF"] {
    border-bottom-color: var(--law-gray-200, $law-gray-200);

    .sidebar-logo-link {
      .sidebar-title {
        color: var(--law-gray-800, $law-gray-800);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }
  }
}

// 折叠状态
.sidebar-logo-container.collapse {
  .sidebar-logo-link {
    .sidebar-logo {
      width: 32px;
      height: 32px;
      margin-right: 0;
    }

    .sidebar-title {
      display: none;
    }
  }
}
</style>
