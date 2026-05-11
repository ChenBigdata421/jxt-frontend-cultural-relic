<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">任务编号</label>
          <el-input
            v-model="searchForm.code"
            placeholder="请输入任务编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">任务名称</label>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入任务名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">任务类型</label>
          <el-select
            v-model="searchForm.type"
            placeholder="请选择任务类型"
            clearable
          >
            <el-option
              v-for="dict in taskTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
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
              :value="Number(dict.value)"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssignmentSearchInput',
  props: {
    statusOptions: {
      type: Array,
      default: () => []
    },
    taskTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        code: undefined,
        name: undefined,
        type: undefined,
        status: undefined
      }
    }
  },
  methods: {
    getSearchParams() {
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
        code: undefined,
        name: undefined,
        type: undefined,
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
