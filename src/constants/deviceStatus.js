// LifecycleStatus — device phase
export const LifecycleStatus = {
  Active: '活动中',
  Repair: '修理中',
  Retired: '已回收',
  Revoked: '已吊销'
}

export const LifecycleStatusLabels = {
  '活动中': '活动中',
  '修理中': '修理中',
  '已回收': '已回收',
  '已吊销': '已吊销'
}

export const LifecycleStatusTagType = {
  '活动中': 'success',
  '修理中': 'warning',
  '已回收': 'info',
  '已吊销': 'danger'
}

// OperabilityStatus — device usability
export const OperabilityStatus = {
  Enabled: '可用',
  Disabled: '不可用'
}

export const OperabilityStatusLabels = {
  '可用': '可用',
  '不可用': '不可用'
}

export const OperabilityStatusTagType = {
  '可用': 'success',
  '不可用': 'danger'
}

// AssignmentStatus — device allocation
export const AssignmentStatus = {
  Assigned: '分配',
  Unassigned: '未分配'
}

export const AssignmentStatusLabels = {
  '分配': '已分配',
  '未分配': '未分配'
}

// Unassigned uses 'warning' (yellow) to distinguish from Retired (info/gray)
export const AssignmentStatusTagType = {
  '分配': '',
  '未分配': 'warning'
}

// RuntimeStatus — device connectivity
export const RuntimeStatus = {
  Online: '在线',
  Offline: '未在线',
  Unknown: '未知'
}

export const RuntimeStatusLabels = {
  '在线': '在线',
  '未在线': '未在线',
  '未知': '未知'
}

export const RuntimeStatusTagType = {
  '在线': 'success',
  '未在线': 'danger',
  '未知': 'info'
}

// BWCType — body-worn camera type
export const BWCType = { FiveG: '5G', Standard: '标准' }
export const BWCTypeLabels = { '5G': '5G', '标准': '标准' }

// RequisitionStatus — requisition record status
export const RequisitionStatus = { Active: '领用中', Returned: '已归还', Overdue: '逾期未还' }
export const RequisitionStatusLabels = { '领用中': '领用中', '已归还': '已归还', '逾期未还': '逾期未还' }
export const RequisitionStatusTagType = { '领用中': 'success', '已归还': 'info', '逾期未还': 'danger' }

// Helper: convert {Key: 'Value'} enum to [{label, value}] options array for el-select
export function enumToOptions(labels) {
  return Object.entries(labels).map(([key, label]) => ({
    label,
    value: key
  }))
}

// Helper: for enums where label keys differ from actual values (e.g. BWCType)
// values: { FiveG: '5G', Standard: '标准' }
// labels: { '5G': '5G执法仪', '标准': '普通执法仪' }
export function enumValueToOptions(values, labels) {
  return Object.keys(values).map(function(key) {
    return { label: labels[values[key]], value: values[key] }
  })
}
