<template>
  <div class="view-switch">
    <el-radio-group
      :value="value"
      size="small"
      @input="handleInput"
    >
      <el-radio-button
        v-for="opt in availableOptions"
        :key="opt.value"
        :label="opt.value"
      >
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
/**
 * 角色视图切换
 * 根据用户角色 dataScope/roles 决定可见视图
 * - 省级/市级管理员: admin, auditor
 * - 县级/所级管理员: admin, officer
 * - 一线执法人员: officer
 * - 督导审计人员: auditor, admin
 */
const ALL_VIEWS = [
  { value: 'admin', label: '管理视图' },
  { value: 'officer', label: '执法人员' },
  { value: 'auditor', label: '督导审计' }
]

export default {
  name: 'ViewSwitch',
  props: {
    value: {
      type: String,
      required: true
    },
    availableViews: {
      type: Array,
      default: () => ['admin', 'officer', 'auditor']
    }
  },
  computed: {
    availableOptions() {
      return ALL_VIEWS.filter(v => this.availableViews.includes(v.value))
    }
  },
  methods: {
    handleInput(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.view-switch {
  display: inline-flex;
  align-items: center;
}
</style>
