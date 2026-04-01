<template>
  <div class="requisition-log-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :org-options="orgOptions"
          :user-options="userOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
          @org-change="handleOrgChange"
        />
      </div>

      <!-- 高级筛选面板 -->
      <div class="search-section">
        <AdvancedFilterPanel
          ref="advancedFilter"
          @filter-change="handleAdvancedFilterChange"
          @reset="handleAdvancedFilterReset"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="search-action-buttons">
        <el-button
          class="search-btn"
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleGlobalSearch"
        >
          搜索
        </el-button>
        <el-button
          class="reset-btn"
          icon="el-icon-refresh-left"
          size="small"
          @click="handleGlobalReset"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SearchInput from './SearchInput.vue'
import AdvancedFilterPanel from './AdvancedFilterPanel.vue'

export default {
  name: 'RequisitionLogQueryBar',
  components: {
    SearchInput,
    AdvancedFilterPanel
  },
  props: {
    orgOptions: {
      type: Array,
      default: () => []
    },
    userOptions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleQuickSearch(searchParams) {
      this.$emit('search', searchParams)
    },
    handleQuickSearchReset() {
      this.$emit('quick-search-reset')
    },
    handleOrgChange(orgId) {
      this.$emit('org-change', orgId)
    },
    handleAdvancedFilterChange(filterData) {
      this.$emit('filter-change', {
        filterType: 'advanced',
        ...filterData
      })
    },
    handleAdvancedFilterReset() {
      this.$emit('filter-reset')
    },
    handleGlobalSearch() {
      const quickSearchParams = this.$refs.quickSearch.getSearchParams()
      const advancedParams = this.$refs.advancedFilter.getFilterData()

      // 合并所有搜索条件并触发搜索
      const allParams = {
        ...quickSearchParams,
        ...advancedParams
      }

      this.$emit('search', allParams)
    },
    handleGlobalReset() {
      // 全局重置：重置所有筛选条件
      if (this.$refs.advancedFilter) {
        this.$refs.advancedFilter.handleReset()
      }
      if (this.$refs.quickSearch) {
        this.$refs.quickSearch.handleReset()
      }
    },
    reset() {
      this.handleGlobalReset()
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section
  - src/styles/components/buttons.scss: .search-action-buttons
  - src/styles/components/forms.scss: .advanced-filter-panel
-->
