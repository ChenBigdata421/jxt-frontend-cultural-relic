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
          <!-- 任务内容 -->
          <div class="filter-section">
            <label class="section-label-inline">任务内容</label>
            <el-input
              v-model="filterParams.context"
              placeholder="任务内容"
              clearable
            />
          </div>

          <!-- 任务地址 -->
          <div class="filter-section">
            <label class="section-label-inline">任务地址</label>
            <el-input
              v-model="filterParams.address"
              placeholder="任务地址"
              clearable
            />
          </div>
        </div>

        <div class="filter-row">
          <!-- 负责组织 -->
          <div class="filter-section org-section">
            <label class="section-label-inline">负责组织</label>
            <treeselect
              v-model="filterParams.orgId"
              :options="orgOptions"
              placeholder="请选择负责组织"
              :append-to-body="true"
              :open-on-focus="false"
              :editable="false"
              :disable="false"
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'TaskAdvancedFilterPanel',
  components: {
    Treeselect
  },
  props: {
    orgOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: [],
      timeRanges: [
        { key: 'startTimeRange', label: '开始时间', enabled: false },
        { key: 'endTimeRange', label: '结束时间', enabled: false }
      ],
      timeValues: {},
      filterParams: {
        context: undefined,
        address: undefined,
        orgId: undefined
      }
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
      this.filterParams = {
        context: undefined,
        address: undefined,
        orgId: undefined
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = { ...this.filterParams }

      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
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
// 全宽度工具类
.full-width {
  width: 100%;
}
</style>
