<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row search-row-5">
        <div class="search-item">
          <label class="search-label">警情编号</label>
          <el-input
            v-model="searchForm.code"
            placeholder="请输入警情编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">警情标题</label>
          <el-input
            v-model="searchForm.title"
            placeholder="请输入警情标题"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">报警人姓名</label>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入报警人姓名"
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
          <label class="search-label">是否关联</label>
          <el-select
            v-model="searchForm.isRelation"
            placeholder="请选择是否关联"
            clearable
          >
            <el-option
              v-for="dict in relationStatusOptions"
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
    relationStatusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        code: undefined,
        title: undefined,
        name: undefined,
        status: undefined,
        isRelation: undefined
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
        code: undefined,
        title: undefined,
        name: undefined,
        status: undefined,
        isRelation: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>
