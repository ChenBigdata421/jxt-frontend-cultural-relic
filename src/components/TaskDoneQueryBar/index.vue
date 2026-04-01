<template>
  <div class="task-done-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          @search="handleSearch"
          @reset="handleReset"
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
  name: 'TaskDoneQueryBar',
  components: {
    SearchInput
  },
  methods: {
    handleSearch(searchParams) {
      this.$emit('search', searchParams)
    },
    handleReset() {
      this.$emit('reset')
    },
    handleGlobalSearch() {
      const searchParams = this.$refs.quickSearch.getSearchParams()
      this.$emit('search', searchParams)
    },
    handleGlobalReset() {
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
