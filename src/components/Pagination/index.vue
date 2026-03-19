<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 引入设计令牌
@import '@/styles/tokens/index.scss';

.pagination-container {
  background: $law-bg-paper;
  padding: $spacing-4 $spacing-4;
  display: flex;
  justify-content: flex-end;  // 分页组件靠右对齐
  align-items: center;        // 垂直居中对齐

  // 使用 ::v-deep 确保样式能穿透到 el-pagination
  ::v-deep .el-pagination {
    display: flex;
    align-items: center;       // 确保所有子元素垂直居中对齐
    gap: $spacing-2;           // 元素之间添加8px间距
    white-space: nowrap;       // 防止文本换行

    // 总数和每页显示文字
    .el-pagination__total,
    .el-pagination__sizes {
      font-size: $font-size-sm;           // 13px
      font-weight: $font-weight-normal;    // 400
      color: $law-gray-600;               // #455A64
      line-height: $line-height-normal;    // 1.5
      display: flex;
      align-items: center;                // 确保内部元素垂直对齐
    }

    // 每页显示选择器
    .el-pagination__sizes {
      margin-left: $spacing-2;
    }

    // 页码按钮
    .el-pager {
      display: flex;
      align-items: center;
      gap: 4px;

      li {
        font-size: $font-size-sm;
        font-weight: $font-weight-normal;
        color: $law-gray-600;
        min-width: 32px;
        height: 32px;
        line-height: 32px;              // 设置与高度相同，实现垂直居中
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &.active {
          color: $law-primary;
          background-color: rgba($law-primary, 0.1);
          font-weight: $font-weight-semibold;
        }

        &:hover:not(.active) {
          color: $law-primary;
          background-color: rgba($law-gray-100, 0.5);
        }

        &:focus {
          outline: 2px solid $law-primary;
          outline-offset: 2px;
        }
      }
    }

    // 上一页/下一页按钮
    .btn-prev,
    .btn-next {
      font-size: $font-size-sm;
      color: $law-gray-600;
      border-radius: 4px;
      transition: all 0.2s ease;
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        color: $law-primary;
        background-color: rgba($law-gray-100, 0.5);
      }

      &:disabled {
        color: $law-gray-300;
        cursor: not-allowed;
      }

      &:focus {
        outline: 2px solid $law-primary;
        outline-offset: 2px;
      }

      i {
        font-size: 12px;
      }
    }

    // 每页显示选择器
    .el-pagination__sizes .el-select .el-input .el-input__inner {
      font-size: $font-size-sm;
      color: $law-gray-600;
      border-radius: 4px;
      height: 32px;
      line-height: 32px;
    }

    // 跳转输入框
    .el-pagination__jump {
      font-size: $font-size-sm;
      color: $law-gray-600;
      display: flex;
      align-items: center;

      input {
        font-size: $font-size-sm;
        color: $law-gray-700;
        border-radius: 4px;
        height: 32px;
        line-height: 32px;

        &:focus {
          border-color: $law-primary;
        }
      }
    }
  }
}

.pagination-container.hidden {
  display: none;
}
</style>
