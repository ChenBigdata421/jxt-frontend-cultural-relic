<template>
  <div class="archive-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :status-options="statusOptions"
          :archive-type-options="archiveTypeOptions"
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
  name: 'ArchiveQueryBar',
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
    archiveTypeOptions: {
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
      // 快速搜索：直接传递搜索参数
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
      // 全局搜索：合并快速搜索和高级筛选的条件
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

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.archive-query-bar {
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
