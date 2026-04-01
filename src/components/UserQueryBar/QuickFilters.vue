<template>
  <div class="quick-filters">
    <el-radio-group
      v-model="activeFilter"
      size="small"
      class="filter-group"
      @change="handleFilterChange"
    >
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="normal">正常</el-radio-button>
      <el-radio-button label="disabled">禁用</el-radio-button>
      <el-radio-button label="today">今日新增</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'UserQuickFilters',
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
