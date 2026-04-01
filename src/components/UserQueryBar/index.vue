<template>
  <div class="user-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :sex-options="sexOptions"
          :status-options="statusOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
        />
      </div>

      <!-- 快捷筛选 -->
      <div class="search-section">
        <div class="filter-row">
          <span class="section-label-inline">快捷筛选</span>
          <QuickFilters
            v-model="quickFilter"
            @change="handleQuickFilterChange"
          />
        </div>
      </div>

      <!-- 高级筛选面板 -->
      <div class="search-section">
        <AdvancedFilterPanel
          ref="advancedFilter"
          :org-options="orgOptions"
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
import QuickFilters from './QuickFilters.vue'
import AdvancedFilterPanel from './AdvancedFilterPanel.vue'

export default {
  name: 'UserQueryBar',
  components: {
    SearchInput,
    QuickFilters,
    AdvancedFilterPanel
  },
  props: {
    sexOptions: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => []
    },
    orgOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      quickFilter: 'all'
    }
  },
  methods: {
    handleQuickSearch(searchParams) {
      this.$emit('search', searchParams)
    },
    handleQuickSearchReset() {
      this.$emit('quick-search-reset')
    },
    handleQuickFilterChange(filterType) {
      this.$emit('filter-change', { filterType })
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
      // 合并快速搜索和高级筛选的条件
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
      this.quickFilter = 'all'
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
  - src/styles/components/forms.scss: .filter-row, .section-label
-->
