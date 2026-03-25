<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label>案件编号</label>
          <el-input
            v-model="searchForm.caseCode"
            placeholder="请输入案件编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>案件名称</label>
          <el-input
            v-model="searchForm.caseName"
            placeholder="请输入案件名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>案件类型</label>
          <el-select
            v-model="searchForm.caseType"
            placeholder="请选择案件类型"
            clearable
          >
            <el-option
              v-for="dict in caseTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div class="search-item">
          <label>是否关联</label>
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
    caseTypeOptions: {
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
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
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
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        isRelation: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.search-input-wrapper {
  width: 100%;

  .quick-search-form {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    border: none;

    .search-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: $spacing-3;
      margin-bottom: $spacing-3;

      &:last-child {
        margin-bottom: 0;
      }

      .search-item {
        flex: 1;
        min-width: 180px;
        display: flex;
        align-items: center;
        gap: $spacing-3;

        label {
          white-space: nowrap;
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          color: $law-gray-700;
          width: 80px;
          flex-shrink: 0;
          text-align: right;
        }
      }

      // 使用 ::v-deep 确保样式正确应用到 Element UI 组件
      ::v-deep .el-input,
      ::v-deep .el-select {
        flex: 1;
        min-width: 0;
      }
    }
  }
}
</style>
