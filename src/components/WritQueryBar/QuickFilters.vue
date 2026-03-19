<template>
  <div class="quick-filters">
    <el-radio-group
      v-model="activeFilter"
      size="small"
      @change="handleFilterChange"
      class="filter-group"
    >
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="today">今日文书</el-radio-button>
      <el-radio-button label="pending">待处理</el-radio-button>
      <el-radio-button label="mine">我的文书</el-radio-button>
      <el-radio-button label="related">已关联</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'WritQuickFilters',
  props: {
    value: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      activeFilter: this.value || 'all'
    };
  },
  watch: {
    value(newVal) {
      this.activeFilter = newVal;
    }
  },
  methods: {
    handleFilterChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.quick-filters {
  flex: 1;

  .filter-group {
    ::v-deep .el-radio-button__inner {
      &:hover {
        color: $law-primary;
      }

      &.is-active {
        background-color: $law-primary;
        border-color: $law-primary;
        color: $law-primary-contrast;
      }
    }
  }
}
</style>
