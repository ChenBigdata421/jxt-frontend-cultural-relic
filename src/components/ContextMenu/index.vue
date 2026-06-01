<template>
  <transition name="ctx-fade">
    <ul
      v-if="visible"
      ref="menu"
      class="ctx-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      role="menu"
    >
      <li
        v-for="(item, idx) in items"
        :key="idx"
        :class="['ctx-menu-item', { 'is-disabled': item.disabled, 'is-divided': item.divided }]"
        role="menuitem"
        :tabindex="item.disabled ? -1 : 0"
        @click="handleClick(item)"
        @keydown.enter="handleClick(item)"
      >
        <i v-if="item.icon" :class="item.icon" />
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </transition>
</template>

<script>
export default {
  name: 'ContextMenu',
  data() {
    return {
      visible: false,
      position: { x: 0, y: 0 },
      items: []
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          document.addEventListener('click', this.close)
          document.addEventListener('contextmenu', this.close)
          this.adjustPosition()
        })
      } else {
        document.removeEventListener('click', this.close)
        document.removeEventListener('contextmenu', this.close)
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.close)
    document.removeEventListener('contextmenu', this.close)
  },
  methods: {
    show(event, items) {
      event.preventDefault()
      event.stopPropagation()
      this.position = { x: event.clientX, y: event.clientY }
      this.items = items
      this.visible = true
    },
    close() {
      this.visible = false
    },
    handleClick(item) {
      if (item.disabled) return
      this.close()
      item.onClick && item.onClick()
    },
    adjustPosition() {
      if (!this.$refs.menu) return
      const rect = this.$refs.menu.getBoundingClientRect()
      const x = rect.right > window.innerWidth ? window.innerWidth - rect.width - 8 : this.position.x
      const y = rect.bottom > window.innerHeight ? window.innerHeight - rect.height - 8 : this.position.y
      this.position = { x: Math.max(0, x), y: Math.max(0, y) }
    }
  }
}
</script>

<style scoped>
.ctx-menu {
  position: fixed;
  z-index: 3000;
  min-width: 160px;
  padding: 6px 0;
  margin: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
.ctx-menu-item {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 34px;
  line-height: 34px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}
.ctx-menu-item i { margin-right: 8px; }
.ctx-menu-item:hover { background-color: #ecf5ff; color: #409EFF; }
.ctx-menu-item.is-disabled { color: #c0c4cc; cursor: not-allowed; }
.ctx-menu-item.is-disabled:hover { background-color: transparent; color: #c0c4cc; }
.ctx-menu-item.is-divided { border-top: 1px solid #e4e7ed; margin-top: 6px; padding-top: 6px; }
.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity .15s; }
.ctx-fade-enter, .ctx-fade-leave-to { opacity: 0; }
</style>
