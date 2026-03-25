<template>
  <div class="advanced-filter-wrapper">
    <el-collapse v-model="activeNames" class="advanced-filter-panel">
      <el-collapse-item name="filters">
        <template slot="title">
          <span class="filter-title">
            <i class="el-icon-arrow-right collapse-icon" />
            高级筛选
          </span>
        </template>

        <!-- 时间范围 - 复选框 + 日期范围组合 -->
        <div class="filter-section filter-section-full">
          <div class="section-label">时间范围</div>
          <div class="time-range-group">
            <div v-for="range in timeRanges" :key="range.key" class="time-range-item">
              <el-checkbox
                v-model="range.enabled"
                @change="handleTimeRangeToggle(range)"
              >
                {{ range.label }}
              </el-checkbox>
              <el-date-picker
                v-if="range.enabled"
                v-model="timeValues[range.key]"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="time-range-picker"
                @change="handleTimeChange(range.key)"
              />
            </div>
          </div>
        </div>

        <!-- 其他筛选条件 - 两列布局 -->
        <div class="filter-row">
          <!-- 档案描述 -->
          <div class="filter-section">
            <label class="section-label-inline">档案描述</label>
            <el-input
              v-model="filterParams.description"
              placeholder="档案描述"
              clearable
            />
          </div>

          <!-- 备注信息 -->
          <div class="filter-section">
            <label class="section-label-inline">备注信息</label>
            <el-input
              v-model="filterParams.remarks"
              placeholder="备注信息"
              clearable
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'AdvancedFilterPanel',
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'createdAtRange', label: '创建时间', enabled: false },
        { key: 'expirationTimeRange', label: '过期时间', enabled: false }
      ],
      timeValues: {},
      filterParams: {
        description: undefined,
        remarks: undefined
      }
    }
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        // 清空该时间范围的数据
        this.$set(this.timeValues, range.key, null)
      }
      // 移除立即查询，等待用户点击"搜索"按钮
    },
    handleTimeChange(key) {
      // 移除立即查询，等待用户点击"搜索"按钮
    },
    handleApply() {
      this.$emit('apply', this.getFilterData())
    },
    handleReset() {
      // 重置所有筛选条件
      this.timeRanges.forEach(range => {
        range.enabled = false
      })
      this.timeValues = {}
      this.filterParams = {
        description: undefined,
        remarks: undefined
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = { ...this.filterParams }

      // 处理时间范围 - 移除字段名中的 'Range' 部分
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          // 将 createdAtRange -> createdAt, expirationTimeRange -> expirationTime 等
          const fieldKey = range.key.replace('Range', '')
          data[fieldKey + 'Start'] = start
          data[fieldKey + 'End'] = end
        }
      })

      return data
    },
    emitFilterChange() {
      this.$emit('filter-change', this.getFilterData())
    }
  }
}
</script>

<style lang="scss" scoped>
// ========== 本组件样式说明 ==========
// 以下样式已在全局样式中定义，供所有页面共享使用：
// 全局样式位置: src/styles/components/forms.scss
//
// 高级筛选面板样式：
// - .advanced-filter-panel (折叠面板基础样式)
// - .filter-title (筛选标题样式)
// - .filter-section-full (全宽筛选区块)
// - .section-label (独立区块标签)
// - .section-label-inline (行内标签样式)
// - .time-range-group (时间范围选择组)
// - .time-range-item (时间范围选择项)
//
// 表单行内布局工具类：
// - .filter-row (表单行容器 - 多列布局)
// - .filter-section (表单区块 - 标签和输入框在同一行)
// - 输入组件的 flex 布局样式
//
// ========== 本组件保留的特定样式 ==========

// 组件特定的类名（如需自定义样式可在此添加）
</style>
