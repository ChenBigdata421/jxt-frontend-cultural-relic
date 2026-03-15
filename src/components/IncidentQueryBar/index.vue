<template>
  <div class="incident-query-bar">
    <!-- 统一搜索框 -->
    <div class="search-section">
      <SearchInput
        v-model="searchText"
        @search="handleSearch"
      />
    </div>

    <!-- 快捷筛选 -->
    <QuickFilters
      v-model="quickFilter"
      @change="handleQuickFilterChange"
    />

    <!-- 高级筛选面板 -->
    <AdvancedFilterPanel
      ref="advancedFilter"
      :status-options="statusOptions"
      @apply="handleAdvancedFilter"
      @reset="handleAdvancedFilterReset"
    />
  </div>
</template>

<script>
import SearchInput from './SearchInput.vue';
import QuickFilters from './QuickFilters.vue';
import AdvancedFilterPanel from './AdvancedFilterPanel.vue';

export default {
  name: 'IncidentQueryBar',
  components: {
    SearchInput,
    QuickFilters,
    AdvancedFilterPanel
  },
  props: {
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchText: '',
      quickFilter: 'all'
    };
  },
  methods: {
    handleSearch(text) {
      this.$emit('search', {
        keyword: text,
        filterType: 'search'
      });
    },
    handleQuickFilterChange(filterType) {
      this.$emit('filter-change', {
        filterType,
        value: filterType
      });
    },
    handleAdvancedFilter(filterData) {
      this.$emit('filter-change', {
        filterType: 'advanced',
        ...filterData
      });
    },
    handleAdvancedFilterReset() {
      this.$emit('filter-reset');
    },
    reset() {
      this.searchText = '';
      this.quickFilter = 'all';
      if (this.$refs.advancedFilter) {
        this.$refs.advancedFilter.handleReset();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.incident-query-bar {
  .search-section {
    margin-bottom: $spacing-4;
  }
}
</style>
