<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label>档案编号</label>
          <el-input
            v-model="searchForm.archiveCode"
            placeholder="请输入档案编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>档案标题</label>
          <el-input
            v-model="searchForm.archiveTitle"
            placeholder="请输入档案标题"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>档案类型</label>
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
          <label>状态</label>
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

  // ========== 注意：通用字体规范已移至全局样式 ==========
  // 以下字体规范现已定义在 src/styles/components/forms.scss 中：
  // - 输入框内容、Placeholder、焦点状态
  // - 下拉列表选项（悬停、选中、禁用）
  //
  // 本文件只保留档案页面特有的布局样式。
}
</style>
