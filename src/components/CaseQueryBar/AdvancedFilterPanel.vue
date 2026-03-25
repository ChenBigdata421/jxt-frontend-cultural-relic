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
          <!-- 案发地址 -->
          <div class="filter-section">
            <label class="section-label-inline">案发地址</label>
            <el-input
              v-model="filterParams.caseAddress"
              placeholder="案发地址"
              clearable
            />
          </div>

          <!-- 办案单位 -->
          <div class="filter-section org-section">
            <label class="section-label-inline">办案单位</label>
            <treeselect
              v-model="filterParams.caseOrgId"
              :options="orgOptions"
              placeholder="请选择办案单位"
              :append-to-body="true"
              :open-on-focus="false"
              :editable="false"
              :disable="false"
              @input="handleOrgChange"
            />
          </div>
        </div>

        <div class="filter-row">
          <!-- 处警人员 -->
          <div class="filter-section">
            <label class="section-label-inline">处警人员</label>
            <el-select
              v-model="filterParams.processPoliceIds"
              placeholder="请选择处警人员"
              clearable
              multiple
              collapse-tags
              filterable
              class="full-width"
              :popper-append-to-body="true"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listUser } from '@/api/admin/sys-user'

export default {
  name: 'AdvancedFilterPanel',
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
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'caseTimeRange', label: '案发时间', enabled: false },
        { key: 'procTimeRange', label: '处警时间', enabled: false }
      ],
      timeValues: {},
      userOptions: [],
      filterParams: {
        caseAddress: undefined,
        caseOrgId: undefined,
        processPoliceIds: []
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
    handleOrgChange(orgId) {
      // 当组织变化时，清空人员选择并加载该组织下的人员
      this.filterParams.processPoliceIds = []
      if (orgId) {
        this.loadUserOptions(orgId)
      } else {
        this.userOptions = []
      }
    },
    loadUserOptions(orgId) {
      listUser({ orgId: '/' + orgId + '/' })
        .then(response => {
          this.userOptions = response.data.list || []
        })
        .catch(error => {
          console.error('获取用户列表失败:', error)
          this.userOptions = []
        })
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
      this.userOptions = []
      this.filterParams = {
        caseAddress: undefined,
        caseOrgId: undefined,
        processPoliceIds: []
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = { ...this.filterParams }

      // 处理时间范围 - 移除字段名中的 'Range' 部分
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          // 将 caseTimeRange -> caseTime, procTimeRange -> procTime 等
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

// 组件特定的类名（如需自定义样式可在此添加）
// .org-section {}
</style>
