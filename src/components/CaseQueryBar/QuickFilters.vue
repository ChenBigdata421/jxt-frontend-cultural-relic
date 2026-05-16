<template>
  <div class="quick-filters">
    <el-radio-group
      v-model="activeFilter"
      size="small"
      class="filter-group"
      @change="handleFilterChange"
    >
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="today">今日案件</el-radio-button>
      <el-radio-button label="pending">待处理</el-radio-button>
      <el-radio-button label="mine">我的案件</el-radio-button>
      <el-radio-button label="archived">已归档</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'QuickFilters',
  props: {
    value: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      activeFilter: this.value || 'all'
    }
  },
  watch: {
    value(newVal) {
      this.activeFilter = newVal
    }
  },
  methods: {
    handleFilterChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    }
  }
}
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
    }

    ::v-deep .el-radio-button.is-active .el-radio-button__inner {
      background-color: $law-primary;
      border-color: $law-primary;
      color: $law-primary-contrast;

      &:hover {
        color: $law-primary-contrast;
      }
    }
  }
}
</style>
