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
          <!-- 单位组织 -->
          <div class="filter-section org-section">
            <label class="section-label-inline">单位组织</label>
            <treeselect
              v-model="filterParams.orgId"
              :options="orgOptions"
              placeholder="请选择单位组织"
              :append-to-body="true"
              :open-on-focus="false"
              :editable="false"
              :disable="false"
              @input="handleOrgChange"
            />
          </div>

          <!-- 拍摄人员 -->
          <div class="filter-section">
            <label class="section-label-inline">拍摄人员</label>
            <el-select
              v-model="filterParams.policeId"
              placeholder="请选择拍摄人员"
              clearable
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
          <!-- 存储方式 -->
          <div class="filter-section">
            <label class="section-label-inline">存储方式</label>
            <el-select
              v-model="filterParams.storageType"
              placeholder="请选择存储方式"
              clearable
              class="full-width"
            >
              <el-option
                v-for="dict in storageTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </div>

          <!-- 执法仪编号 -->
          <div class="filter-section">
            <label class="section-label-inline">执法仪编号</label>
            <el-input
              v-model="filterParams.recorderNo"
              placeholder="请输入执法仪编号"
              clearable
            />
          </div>
        </div>

        <div class="filter-row">
          <!-- 重要级别（平台） -->
          <div class="filter-section">
            <label class="section-label-inline">重要级别(平台)</label>
            <el-select
              v-model="filterParams.importantLevel"
              placeholder="请选择重要级别"
              clearable
              class="full-width"
            >
              <el-option
                v-for="dict in mediaImportantLevelOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </div>

          <!-- 重要级别（设备） -->
          <div class="filter-section">
            <label class="section-label-inline">重要级别(设备)</label>
            <el-select
              v-model="filterParams.importantLevelRec"
              placeholder="请选择重要级别"
              clearable
              class="full-width"
            >
              <el-option
                v-for="dict in mediaImportantLevelOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
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
  name: 'MediaAdvancedFilterPanel',
  components: {
    Treeselect
  },
  props: {
    orgOptions: {
      type: Array,
      default: () => []
    },
    storageTypeOptions: {
      type: Array,
      default: () => []
    },
    enforceTypeOptions: {
      type: Array,
      default: () => []
    },
    mediaImportantLevelOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'captureTimeRange', label: '拍摄时间', enabled: false },
        { key: 'uploadTimeRange', label: '导入时间', enabled: false }
      ],
      timeValues: {},
      userOptions: [],
      filterParams: {
        orgId: undefined,
        policeId: undefined,
        storageType: undefined,
        enforceType: undefined,
        recorderNo: undefined,
        importantLevel: undefined,
        importantLevelRec: undefined
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
      this.filterParams.policeId = undefined
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
    normalizeEnforceType(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || '未知',
        children: node.children
      }
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
        orgId: undefined,
        policeId: undefined,
        storageType: undefined,
        enforceType: undefined,
        recorderNo: undefined,
        importantLevel: undefined,
        importantLevelRec: undefined
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = {}

      // 过滤掉 undefined/null/空值，防止覆盖快速搜索中的同名参数
      Object.keys(this.filterParams).forEach(key => {
        const value = this.filterParams[key]
        if (value !== undefined && value !== null && value !== '') {
          data[key] = value
        }
      })

      // 处理时间范围 - 移除字段名中的 'Range' 部分
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          // 将 captureTimeRange -> captureTime, uploadTimeRange -> uploadTime 等
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
// - .time-range-group (时间范围选择组)
// - .time-range-item (时间范围选择项)
//
// 表单行内布局工具类：
// - .filter-row (表单行容器 - 多列布局)
// - .filter-section (表单区块 - 标签和输入框在同一行)
// - .section-label-inline (行内标签样式)
// - 输入组件的 flex 布局样式
//
// Treeselect 下拉菜单样式已在 forms.scss 文件开头定义
// ========== 本组件保留的特定样式 ==========

// 组件特定的类名（如需自定义样式可在此添加）
// .org-section {}
// .enforce-type-section {}
</style>
