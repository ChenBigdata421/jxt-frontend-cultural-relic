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
          <!-- 组织部门 -->
          <div class="filter-section org-section">
            <label class="section-label-inline">组织部门</label>
            <treeselect
              v-model="filterParams.orgId"
              :options="orgOptions"
              placeholder="请选择组织部门"
              :append-to-body="true"
              :open-on-focus="false"
              @input="handleOrgChange"
            />
          </div>

          <!-- 人员 -->
          <div class="filter-section">
            <label class="section-label-inline">人员</label>
            <el-select
              v-model="filterParams.writPoliceIds"
              placeholder="请选择人员"
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

        <div class="filter-row">
          <!-- 文书地址 -->
          <div class="filter-section">
            <label class="section-label-inline">文书地址</label>
            <el-input
              v-model="filterParams.writAddress"
              placeholder="文书地址"
              clearable
            />
          </div>

          <!-- 文书来源 -->
          <div class="filter-section">
            <label class="section-label-inline">文书来源</label>
            <el-input
              v-model="filterParams.writSource"
              placeholder="文书来源"
              clearable
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
import { listUser } from '@/api/admin/sys-user'

export default {
  name: 'WritAdvancedFilterPanel',
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
        { key: 'writTimeRange', label: '开书时间', enabled: false },
        { key: 'createdAtRange', label: '创建时间', enabled: false },
        { key: 'updatedAtRange', label: '更新时间', enabled: false }
      ],
      timeValues: {},
      userOptions: [],
      filterParams: {
        orgId: undefined,
        writPoliceIds: [],
        writAddress: undefined,
        writSource: undefined
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
    handleOrgChange(orgId) {
      // 当组织变化时，清空人员选择并加载该组织下的人员
      this.filterParams.writPoliceIds = []
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
    handleReset() {
      this.timeRanges.forEach(range => {
        range.enabled = false
      })
      this.timeValues = {}
      this.userOptions = []
      this.filterParams = {
        orgId: undefined,
        writPoliceIds: [],
        writAddress: undefined,
        writSource: undefined
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = { ...this.filterParams }

      // 处理时间范围
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          // 将 writTimeRange -> writTime, createdAtRange -> createdAt 等
          const fieldKey = range.key.replace('Range', '')
          data[fieldKey + 'Start'] = start
          data[fieldKey + 'End'] = end
        }
      })

      return data
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
// - .section-label (独立区块标签 - 用于时间范围等)
// - .section-label-inline (行内标签 - 用于两列布局)
// - .time-range-group (时间范围选择组)
// - .time-range-item (时间范围选择项)
//
// 表单行内布局工具类：
// - .filter-row (表单行容器 - 多列布局)
// - .filter-section (表单区块 - 标签和输入框在同一行)
// - 输入组件的 flex 布局样式
//
// Treeselect 下拉菜单样式已在 forms.scss 文件开头定义
// ========== 本组件暂无特定样式 ==========
</style>
