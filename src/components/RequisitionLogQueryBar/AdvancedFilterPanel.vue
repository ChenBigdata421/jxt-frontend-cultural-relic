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
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'RequisitionLogAdvancedFilterPanel',
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'requisitionStartTimeRange', label: '领用开始时间', enabled: false },
        { key: 'requisitionEndTimeRange', label: '领用结束时间', enabled: false }
      ],
      timeValues: {}
    }
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        this.$set(this.timeValues, range.key, null)
      }
    },
    handleTimeChange(key) {
      // 等待用户点击"搜索"按钮
    },
    handleReset() {
      this.timeRanges.forEach(range => {
        range.enabled = false
      })
      this.timeValues = {}
      this.$emit('reset')
    },
    getFilterData() {
      const data = {}

      // 处理时间范围
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          const fieldKey = range.key.replace('Range', '')
          data[fieldKey + 'Begin'] = start
          data[fieldKey + 'End'] = end
        }
      })

      return data
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/components/forms.scss: .advanced-filter-panel, .filter-section, .filter-section-full, .time-range-group, .time-range-item
-->
