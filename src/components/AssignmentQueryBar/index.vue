<template>
  <div class="assignment-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :status-options="statusOptions"
          :task-type-options="taskTypeOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
        />
      </div>

      <!-- 快捷筛选 -->
      <div class="quick-filter-section">
        <div class="filter-row">
          <span class="section-label-inline">快捷筛选</span>
          <QuickFilters
            v-model="quickFilter"
            @change="handleQuickFilterChange"
          />
        </div>
      </div>

      <!-- 高级筛选面板 -->
      <div class="advanced-filter-section">
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
  name: 'AssignmentQueryBar',
  components: {
    SearchInput,
    QuickFilters,
    AdvancedFilterPanel
  },
  props: {
    statusOptions: {
      type: Array,
      default: () => []
    },
    taskTypeOptions: {
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
      const quickSearchParams = this.$refs.quickSearch.getSearchParams()
      const advancedParams = this.$refs.advancedFilter.getFilterData()

      const allParams = {
        ...quickSearchParams,
        ...advancedParams
      }

      this.$emit('search', allParams)
    },
    handleGlobalReset() {
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

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.assignment-query-bar {
  .filter-container {
    .search-section {
      margin-bottom: $spacing-4;
    }

    .quick-filter-section {
      margin-bottom: $spacing-4;

      .section-label {
        white-space: nowrap;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $law-gray-700;
      }
    }

    .advanced-filter-section {
      margin-bottom: $spacing-2;
    }
  }
}
</style>
