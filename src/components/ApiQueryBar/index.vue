<template>
  <div class="api-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 快速搜索区域 -->
      <div class="search-section">
        <div class="quick-search-form">
          <div class="search-row">
            <div class="search-item">
              <label class="search-label">标题</label>
              <el-input
                v-model="searchForm.title"
                placeholder="请输入标题"
                clearable
                @keyup.enter.native="handleSearch"
              />
            </div>
            <div class="search-item">
              <label class="search-label">地址</label>
              <el-input
                v-model="searchForm.path"
                placeholder="请输入地址"
                clearable
                @keyup.enter.native="handleSearch"
              />
            </div>
            <div class="search-item">
              <label class="search-label">Method</label>
              <el-select
                v-model="searchForm.action"
                placeholder="请选择Method"
                clearable
              >
                <el-option value="GET">GET</el-option>
                <el-option value="POST">POST</el-option>
                <el-option value="PUT">PUT</el-option>
                <el-option value="DELETE">DELETE</el-option>
              </el-select>
            </div>
            <div class="search-item">
              <label class="search-label">类型</label>
              <el-select
                v-model="searchForm.type"
                placeholder="请选择类型"
                clearable
              >
                <el-option value="SYS">SYS</el-option>
                <el-option value="BUS">BUS</el-option>
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
  name: 'ApiQueryBar',
  data() {
    return {
      searchForm: {
        title: undefined,
        path: undefined,
        action: undefined,
        type: undefined
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
        title: undefined,
        path: undefined,
        action: undefined,
        type: undefined
      }
      this.$emit('reset')
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
