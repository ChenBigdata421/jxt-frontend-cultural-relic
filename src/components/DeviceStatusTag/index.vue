<template>
  <span>
    <el-tag
      v-if="label"
      :type="tagType"
      size="small"
      :effect="effect"
      :aria-label="typeLabel + ': ' + label"
      role="status"
    >
      {{ label }}
    </el-tag>
    <el-tag
      v-else-if="value"
      type="warning"
      size="small"
      :effect="effect"
      :aria-label="typeLabel + ': ' + value"
      role="status"
    >
      {{ value }}
    </el-tag>
    <span v-else>{{ value || '-' }}</span>
  </span>
</template>

<script>
import {
  LifecycleStatusLabels, LifecycleStatusTagType,
  OperabilityStatusLabels, OperabilityStatusTagType,
  AssignmentStatusLabels, AssignmentStatusTagType,
  RuntimeStatusLabels, RuntimeStatusTagType,
  RequisitionStatusLabels, RequisitionStatusTagType
} from '@/constants/deviceStatus'

const statusMap = {
  lifecycle: { labels: LifecycleStatusLabels, tagType: LifecycleStatusTagType },
  operability: { labels: OperabilityStatusLabels, tagType: OperabilityStatusTagType },
  assignment: { labels: AssignmentStatusLabels, tagType: AssignmentStatusTagType },
  runtime: { labels: RuntimeStatusLabels, tagType: RuntimeStatusTagType },
  requisition: { labels: RequisitionStatusLabels, tagType: RequisitionStatusTagType }
}

const typeLabelMap = {
  lifecycle: '生命周期状态',
  operability: '可用性',
  assignment: '分配状态',
  runtime: '运行状态',
  requisition: '领用状态'
}

export default {
  name: 'DeviceStatusTag',
  props: {
    type: {
      type: String,
      required: true,
      validator: v => ['lifecycle', 'operability', 'assignment', 'runtime', 'requisition'].includes(v)
    },
    value: {
      type: String,
      default: ''
    },
    effect: {
      type: String,
      default: 'dark'
    }
  },
  computed: {
    config() {
      return statusMap[this.type] || {}
    },
    typeLabel() {
      return typeLabelMap[this.type] || ''
    },
    label() {
      return this.config.labels ? this.config.labels[this.value] : ''
    },
    tagType() {
      return this.config.tagType ? this.config.tagType[this.value] : ''
    }
  }
}
</script>
