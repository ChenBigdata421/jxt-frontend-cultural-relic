<template>
  <div class="workflow-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <div class="quick-search-form">
          <div class="search-row">
            <div class="search-item">
              <label class="search-label">工作流名称</label>
              <el-input
                v-model="searchForm.name"
                placeholder="请输入工作流名称"
                clearable
                @keyup.enter.native="handleSearch"
              />
            </div>
            <div class="search-item">
              <label class="search-label">状态</label>
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
              >
                <el-option label="草稿" value="draft" />
                <el-option label="激活" value="active" />
                <el-option label="冻结" value="frozen" />
                <el-option label="已完成" value="completed" />
                <el-option label="失败" value="failed" />
                <el-option label="已取消" value="cancelled" />
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
          搜索
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
  name: 'WorkflowQueryBar',
  data() {
    return {
      searchForm: {
        name: undefined,
        status: undefined
      }
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
        name: undefined,
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
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
-->
