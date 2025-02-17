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
