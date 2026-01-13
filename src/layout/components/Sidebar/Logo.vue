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
    <transition name="sidebarLogoFade"
      ><!--在 Vue.js 中，<transition> 是一个特殊的组件，用于在元素或组件的插入、更新或移除时应用淡入或淡出的过渡效果。-->
      <router-link key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logoUrl" :src="logoUrl" class="sidebar-logo" />
      </router-link>
    </transition>
  </div>
</template>

<script>
import variables from "@/styles/variables.scss";
import { mapGetters } from "vuex";

export default {
  name: "SidebarLogo",
  props: {
    collapse: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapGetters(["appInfo"]),
    variables() {
      return variables;
    },
    logoUrl() {
      const appInfo = this.appInfo || {};
      // 根据构建模式选择 Logo 键名
      if (process.env.VUE_APP_MODE === "platform") {
        return appInfo.console_app_logo;
      } else {
        return appInfo.sys_app_logo;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 64px;
  line-height: 64px;
  background: #001529;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 100px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
      border-radius: 3px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0;
      border-radius: 3px;
    }
  }
}
</style>
