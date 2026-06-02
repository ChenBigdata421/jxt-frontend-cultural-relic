<template>
  <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom" effect="dark">
    <div class="screenfull-container" @click="click">
      <svg v-if="!isFullscreen" class="screenfull-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
      </svg>
      <svg v-else class="screenfull-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
      </svg>
    </div>
  </el-tooltip>
</template>

<script>
import screenfull from 'screenfull'
/* screenfull 是一个用于检测和处理全屏 API 的 JavaScript 库。它允许你检测浏览器是否支持全屏模式，
并提供方法来请求和退出全屏模式。
全屏模式是一种浏览器功能，允许网页占据整个屏幕，通常隐藏浏览器的地址栏、工具栏等界面元素，以提供更加沉浸式的
用户体验。这在视频播放器、游戏、演示文稿等应用中特别有用。*/
export default {
  name: 'Screenfull',
  data() {
    return {
      isFullscreen: false
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    click() {
      // if (!screenfull.enabled) {
      //   this.$message({
      //     message: 'you browser can not work',
      //     type: 'warning'
      //   })
      //   return false
      // }
      /* screenfull.toggle() 是 screenfull 库中的一个方法，用于切换当前元素（通常是整个网页）的全屏状态。
      如果当前元素处于全屏模式，调用 toggle() 方法会使其退出全屏模式；如果当前元素不在全屏模式，
      调用 toggle() 方法则会请求进入全屏模式。 */
      screenfull.toggle()
    },
    change() {
      this.isFullscreen = screenfull.isFullscreen
    },
    /* 代码块中的 screenfull.on('change', this.change) 是为 screenfull 库添加了一个事件监听器，
    监听 'change' 事件。'change' 事件会在全屏状态发生变化时触发，无论是从全屏模式切换到非全屏模式，
    还是相反。 */
    init() {
      if (screenfull.enabled) {
        screenfull.on('change', this.change)
      }
    },
    /* 是用来移除之前通过 screenfull.on('change', this.change) 添加的 'change' 事件监听器。
    当你不再需要监听全屏状态的变化，或者当组件即将被销毁以避免内存泄漏时，通常会调用这个方法。 */
    destroy() {
      if (screenfull.enabled) {
        screenfull.off('change', this.change)
      }
    }
  }
}
</script>

<style scoped>
.screenfull-container {
  display: inline-block;
  cursor: pointer;
  width: 20px;
  height: 20px;
  vertical-align: 10px;

  .screenfull-icon {
    width: 20px;
    height: 20px;
    fill: #725A45;
    transition: fill 0.3s;
  }

  &:hover .screenfull-icon {
    fill: #4C3B2E;
  }
}
</style>
