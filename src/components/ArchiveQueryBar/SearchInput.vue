<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">档案编号</label>
          <el-input
            v-model="searchForm.archiveCode"
            placeholder="请输入档案编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">档案标题</label>
          <el-input
            v-model="searchForm.archiveTitle"
            placeholder="请输入档案标题"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">档案类型</label>
          <el-select
            v-model="searchForm.archiveType"
            placeholder="请选择档案类型"
            clearable
          >
            <el-option
              v-for="dict in archiveTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div class="search-item">
          <label class="search-label">状态</label>
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
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
      searchForm: {
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        status: undefined
      }
    }
  },
  methods: {
    getSearchParams() {
      // 获取过滤空值后的搜索参数（不显示警告）
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
      // 获取搜索参数（不显示警告，空参数将筛选全部数据）
      const searchParams = this.getSearchParams()
      this.$emit('search', searchParams)
    },
    handleReset() {
      this.searchForm = {
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        status: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/components/search.scss: .search-row, .search-item, .search-label
-->

