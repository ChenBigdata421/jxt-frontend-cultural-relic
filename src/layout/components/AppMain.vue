<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
  <!--mode="out-in" 表示先完成当前元素的过渡离开动画，然后再开始新元素的过渡进入动画。-->
  <!-- Vue 的 <transition> 组件，用于包裹要执行过渡动画的元素。-->
  <!--Vue 的 <keep-alive> 组件，它用于缓存不活动的组件实例，而不是销毁它们。:include="cachedViews"
    是一个动态绑定，表示只缓存 cachedViews 数组中列出的组件名。当组件在 <router-view> 中被切换时，
      如果它的名字在 cachedViews 数组中，那么它会被缓存起来，而不是被销毁和重新创建，这有助于提高性能，
      尤其是在组件包含大量状态或子组件时。-->
  <!--Vue Router 的 <router-view> 组件，它用于渲染当前路由对应的组件。:key="key" 是一个动态绑定，
    用于提供一个唯一的 key 来帮助 Vue 识别何时需要重新渲染组件。当路由变化时，如果 key 发生变化，
    Vue 会认为是一个全新的组件实例，这有助于触发组件的重新渲染，即使组件类型（即组件名）没有变化。
    这在某些情况下是有用的，比如当你想强制刷新组件的状态时。-->
  <!--html的<section>元素有助于将页面内容划分为逻辑上相关的块，从而提高页面的可访问性和可维护性。-->
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 93px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header+.app-main {
  padding-top: 93px;
}

// .hasTagsView {
//   .app-main {
//     /* 84 = navbar + tags-view = 50 + 34 */
//     min-height: calc(100vh - 93px);
//   }

//   .fixed-header+.app-main {
//     padding-top: 93px;
//   }
// }
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}

</style>
