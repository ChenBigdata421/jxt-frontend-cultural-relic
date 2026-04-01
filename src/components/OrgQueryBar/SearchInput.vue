<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">组织名称</label>
          <el-input
            v-model="searchForm.orgName"
            placeholder="请输入组织名称"
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
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div class="search-item">
          <label class="search-label">负责人</label>
          <el-select
            v-model="searchForm.leaderId"
            placeholder="请选择负责人"
            clearable
            filterable
          >
            <el-option
              v-for="user in userOptions"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrgSearchInput',
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
  data() {
    return {
      searchForm: {
        orgName: undefined,
        status: undefined,
        leaderId: undefined
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
        orgName: undefined,
        status: undefined,
        leaderId: undefined
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
