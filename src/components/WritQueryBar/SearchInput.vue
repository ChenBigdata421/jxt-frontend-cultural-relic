<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">文书编号</label>
          <el-input
            v-model="searchForm.writCode"
            placeholder="请输入文书编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">文书名称</label>
          <el-input
            v-model="searchForm.writName"
            placeholder="请输入文书名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">文书类型</label>
          <el-select
            v-model="searchForm.writType"
            placeholder="请选择文书类型"
            clearable
          >
            <el-option
              v-for="dict in writTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div class="search-item">
          <label class="search-label">关联状态</label>
          <el-select
            v-model="searchForm.writRelation"
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
  name: 'WritSearchInput',
  props: {
    writTypeOptions: {
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
        writCode: undefined,
        writName: undefined,
        writType: undefined,
        writRelation: undefined
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
        writCode: undefined,
        writName: undefined,
        writType: undefined,
        writRelation: undefined
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

