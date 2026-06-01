/**
 * 操作列"动态固定"mixin
 * 检测表格是否溢出，溢出时才 fixed="right"，避免窄屏下列内容被遮挡。
 *
 * 使用方式：
 * 1. 在组件中 import 并 mixins: [actionColumnMixin]
 * 2. 在 data() 中覆盖 tableRef 为实际 el-table 的 ref 名称（默认 'table'）
 * 3. 操作列模板中使用 :fixed="actionFixed ? 'right' : false"
 * 4. 在列表加载完成后调用 this.scheduleCheckActionFixed()
 * 5. 在列配置变更后调用 this.refreshTableLayout()
 */
export default {
  data() {
    return {
      actionFixed: false,
      checkingActionFixed: false,
      tableRef: 'table',
      actionFixedTimer: null
    }
  },
  mounted() {
    this.checkActionFixed()
    this._actionResizeHandler = () => this.checkActionFixed()
    window.addEventListener('resize', this._actionResizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._actionResizeHandler)
    clearTimeout(this.actionFixedTimer)
  },
  methods: {
    /** 检测表格列是否溢出，动态决定操作列是否 fixed */
    async checkActionFixed() {
      if (this.checkingActionFixed) return
      this.checkingActionFixed = true
      try {
        await this.$nextTick()
        const table = this.$refs[this.tableRef]
        if (!table) return

        // 先解除固定，重新布局以获取真实宽度
        this.actionFixed = false
        await this.$nextTick()
        if (table.doLayout) table.doLayout()
        await this.$nextTick()

        const bodyWrapper = table.$el.querySelector('.el-table__body-wrapper')
        const needFixed = bodyWrapper
          ? bodyWrapper.scrollWidth > bodyWrapper.clientWidth
          : false

        if (this.actionFixed !== needFixed) {
          this.actionFixed = needFixed
        }

        await this.$nextTick()
        if (table.doLayout) table.doLayout()
      } finally {
        this.checkingActionFixed = false
      }
    },

    /** 防抖包装 */
    scheduleCheckActionFixed() {
      clearTimeout(this.actionFixedTimer)
      this.actionFixedTimer = setTimeout(() => {
        this.checkActionFixed()
      }, 50)
    },

    /** nextTick + doLayout + scheduleCheckActionFixed */
    refreshTableLayout() {
      this.$nextTick(() => {
        const table = this.$refs[this.tableRef]
        if (table && table.doLayout) {
          table.doLayout()
        }
        this.scheduleCheckActionFixed()
      })
    }
  }
}
