<template>
  <div class="writ-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :writ-type-options="writTypeOptions"
          :relation-status-options="relationStatusOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
        />
      </div>

      <!-- 快捷筛选 -->
      <div class="quick-filter-section">
        <div class="filter-row">
          <span class="section-label">快捷筛选</span>
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
      <div class="action-buttons">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleGlobalSearch"
        >
          搜索
        </el-button>
        <el-button
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
import SearchInput from './SearchInput.vue';
import QuickFilters from './QuickFilters.vue';
import AdvancedFilterPanel from './AdvancedFilterPanel.vue';

export default {
  name: 'WritQueryBar',
  components: {
    SearchInput,
    QuickFilters,
    AdvancedFilterPanel
  },
  props: {
    writTypeOptions: {
      type: Array,
      default: () => []
    },
    relationStatusOptions: {
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
    };
  },
  methods: {
    handleQuickSearch(searchParams) {
      this.$emit('search', searchParams);
    },
    handleQuickSearchReset() {
      this.$emit('quick-search-reset');
    },
    handleQuickFilterChange(filterType) {
      this.$emit('filter-change', { filterType });
    },
    handleAdvancedFilterChange(filterData) {
      this.$emit('filter-change', {
        filterType: 'advanced',
        ...filterData
      });
    },
    handleAdvancedFilterReset() {
      this.$emit('filter-reset');
    },
    handleGlobalSearch() {
      // 合并快速搜索和高级筛选的条件
      const quickSearchParams = this.$refs.quickSearch.getSearchParams();
      const advancedParams = this.$refs.advancedFilter.getFilterData();

      // 合并所有搜索条件并触发搜索
      const allParams = {
        ...quickSearchParams,
        ...advancedParams
      };

      this.$emit('search', allParams);
    },
    handleGlobalReset() {
      // 全局重置：重置所有筛选条件
      this.quickFilter = 'all';
      if (this.$refs.advancedFilter) {
        this.$refs.advancedFilter.handleReset();
      }
      if (this.$refs.quickSearch) {
        this.$refs.quickSearch.handleReset();
      }
    },
    reset() {
      this.handleGlobalReset();
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.writ-query-bar {
  .filter-container {
    background-color: $law-bg-paper;
    border-radius: 4px;
    border: 1px solid $law-gray-200;
    padding: $spacing-4;

    .search-section {
      margin-bottom: $spacing-4;
    }

    .quick-filter-section {
      margin-bottom: $spacing-4;

      .filter-row {
        display: flex;
        align-items: center;
        gap: $spacing-3;
      }

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

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: $spacing-3;
      padding-top: 0;
    }
  }

  // 按钮样式 - 符合设计规范
  .el-button {
    height: 32px;
    padding: 8px 16px;
    font-size: $font-size-xs;
    border-radius: 4px;
    min-width: 72px;

    &.el-button--primary {
      background-color: #1A5F7A;
      border-color: #1A5F7A;

      &:hover {
        background-color: #2E86AB;
        border-color: #2E86AB;
      }
    }
  }
}
</style>
