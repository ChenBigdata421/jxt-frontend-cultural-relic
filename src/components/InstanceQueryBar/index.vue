<template>
  <div class="instance-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <div class="quick-search-form">
          <div class="search-row">
            <div class="search-item">
              <label class="search-label">工作流</label>
              <el-select
                v-model="searchForm.workflowId"
                placeholder="请选择工作流"
                clearable
                filterable
              >
                <el-option
                  v-for="opt in workflowOptions"
                  :key="opt.workflowId"
                  :label="opt.name"
                  :value="opt.workflowId"
                />
              </el-select>
            </div>
            <div class="search-item">
              <label class="search-label">状态</label>
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="search-action-buttons">
        <el-button
          class="search-btn"
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button
          class="reset-btn"
          icon="el-icon-refresh-left"
          size="small"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstanceQueryBar',
  props: {
    workflowOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        workflowId: undefined,
        status: undefined
      },
      statusOptions: [
        { label: '运行中', value: 'running' },
        { label: '已完成', value: 'completed' },
        { label: '失败', value: 'failed' },
        { label: '已取消', value: 'cancelled' }
      ]
    }
  },
  methods: {
    getSearchParams() {
      // 获取过滤空值后的搜索参数
      const searchParams = {}
      Object.keys(this.searchForm).forEach(key => {
        const value = this.searchForm[key]
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value
        }
      })
      return searchParams
    },
    handleSearch() {
      const searchParams = this.getSearchParams()
      this.$emit('search', searchParams)
    },
    handleReset() {
      this.searchForm = {
        workflowId: undefined,
        status: undefined
      }
      this.$emit('reset')
    },
    reset() {
      this.handleReset()
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section
  - src/styles/components/forms.scss: .filter-row, .section-label
-->
