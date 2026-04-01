<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">任务名称</label>
          <el-input
            v-model="searchForm.taskName"
            placeholder="请输入任务名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">流程名称</label>
          <el-input
            v-model="searchForm.workflowName"
            placeholder="请输入流程名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskDoneSearchInput',
  data() {
    return {
      searchForm: {
        taskName: undefined,
        workflowName: undefined
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
        taskName: undefined,
        workflowName: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>
