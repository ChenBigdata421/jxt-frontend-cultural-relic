<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">用户名称</label>
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">警号</label>
          <el-input
            v-model="searchForm.policeNo"
            placeholder="请输入警号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">手机号码</label>
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号码"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">性别</label>
          <el-select
            v-model="searchForm.sex"
            placeholder="请选择性别"
            clearable
          >
            <el-option
              v-for="dict in sexOptions"
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
  name: 'UserSearchInput',
  props: {
    sexOptions: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        userName: undefined,
        policeNo: undefined,
        phone: undefined,
        sex: undefined,
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
        userName: undefined,
        policeNo: undefined,
        phone: undefined,
        sex: undefined,
        status: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>
