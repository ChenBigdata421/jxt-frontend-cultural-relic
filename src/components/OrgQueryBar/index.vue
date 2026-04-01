<template>
  <div class="org-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :status-options="statusOptions"
          :user-options="userOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
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

export default {
  name: 'OrgQueryBar',
  components: {
    SearchInput
  },
  props: {
    statusOptions: {
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
    handleGlobalSearch() {
      // 获取快速搜索的条件
      const quickSearchParams = this.$refs.quickSearch.getSearchParams()

      // 触发搜索
      this.$emit('search', quickSearchParams)
    },
    handleGlobalReset() {
      // 全局重置：重置所有筛选条件
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
