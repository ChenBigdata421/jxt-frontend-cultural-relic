<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label>文书编号</label>
          <el-input
            v-model="searchForm.writCode"
            placeholder="请输入文书编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>文书名称</label>
          <el-input
            v-model="searchForm.writName"
            placeholder="请输入文书名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label>文书类型</label>
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
          <label>关联状态</label>
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
        isRelation: undefined
      }
    };
  },
  methods: {
    getSearchParams() {
      // 获取过滤空值后的搜索参数
      const searchParams = {};
      Object.keys(this.searchForm).forEach(key => {
        const value = this.searchForm[key];
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value;
        }
      });
      return searchParams;
    },
    handleSearch() {
      const searchParams = this.getSearchParams();
      this.$emit('search', searchParams);
    },
    handleReset() {
      this.searchForm = {
        writCode: undefined,
        writName: undefined,
        writType: undefined,
        isRelation: undefined
      };
      this.$emit('reset');
    }
  }
};
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
      gap: $spacing-4;
      margin-bottom: $spacing-3;

      &:last-child {
        margin-bottom: 0;
      }

      .search-item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: $spacing-2;
        min-width: 0;

        label {
          white-space: nowrap;
          font-size: $font-size-sm;
          font-weight: $font-weight-medium;
          color: $law-gray-700;
          width: 80px;
          flex-shrink: 0;
          text-align: right;
          padding-right: $spacing-1;
        }

        .el-input,
        .el-select {
          flex: 1;
          min-width: 0;
        }

        .el-input {
          min-width: 120px;
        }

        .el-select {
          min-width: 140px;
        }
      }
    }
  }

  // ========== 注意：通用字体规范已移至全局样式 ==========
  // 以下字体规范现已定义在 src/styles/components/forms.scss 中：
  // - 输入框内容、Placeholder、焦点状态
  // - 下拉列表选项（悬停、选中、禁用）
  //
  // 本文件只保留文书页面特有的布局样式。
}
</style>
