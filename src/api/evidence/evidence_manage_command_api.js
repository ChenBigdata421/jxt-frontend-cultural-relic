import request from '@/utils/request'

export function addIncidentRecord(data) {
  return request({
    url: '/api/v1/incidentRecords',
    method: 'post',
    data: data
  })
}

export function updateIncidentRecord(data, id) {
  return request({
    url: '/api/v1/incidentRecords/' + id,
    method: 'put',
    data: data
  })
}

export function batchDelIncidentRecord(data) {
  return request({
    url: '/api/v1/incidentRecords/batch',
    method: 'delete',
    data: data
  })
}

export function delIncidentRecordById(id) {
  return request({
    url: '/api/v1/incidentRecords/' + id,
    method: 'delete'
  })
}

// 新增 Media
export function addMedia(data) {
  return request({
    url: '/api/v1/media',
    method: 'post',
    data: data
  })
}

// 更新 Media
export function updateMedia(data, mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId,
    method: 'put',
    data: data
  })
}

// 删除 Media
export function delMedia(mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId,
    method: 'delete'
  })
}

// 批量删除 Media
export function batchDelMedia(data) {
  return request({
    url: '/api/v1/media/batch',
    method: 'delete',
    data: data
  })
}

// 批量标注媒体是否为执法媒体
export function batchMarkMediaNoEnforcementStatus(data) {
  return request({
    url: '/api/v1/media/batch/mark-no-enforcement-media-status',
    method: 'post',
    data: data
  })
}

// 批量更新媒体执法类型
export function batchUpdateMediaEnforceType(data) {
  return request({
    url: '/api/v1/media/batch/update-enforcement-type',
    method: 'post',
    data: data
  })
}

// 批量更新媒体锁定状态
export function batchUpdateMediaIsLocked(data) {
  return request({
    url: '/api/v1/media/batch/update-is-locked',
    method: 'post',
    data: data
  })
}

// 批量更新媒体重要级别
export function batchUpdateMediaImportanceLevel(data) {
  return request({
    url: '/api/v1/media/batch/update-importance-level',
    method: 'post',
    data: data
  })
}

// 批量更新媒体备注（标注内容）
export function batchUpdateMediaComments(data) {
  return request({
    url: '/api/v1/media/batch/update-comments',
    method: 'post',
    data: data
  })
}

// 批量更新媒体过期时间
export function batchUpdateMediaExpiryTime(data) {
  return request({
    url: '/api/v1/media/batch/update-expiry-time',
    method: 'post',
    data: data
  })
}

// 新增任务
export function addTask(data) {
  return request({
    url: '/api/v1/assignments',
    method: 'post',
    data: data
  })
}

// 更新任务
export function updateTask(data, id) {
  return request({
    url: '/api/v1/assignments/' + id,
    method: 'put',
    data: data
  })
}

// 删除任务
export function delTaskById(id) {
  return request({
    url: '/api/v1/assignments/' + id,
    method: 'delete'
  })
}

// 批量删除任务
export function batchDelTask(data) {
  return request({
    url: '/api/v1/assignments/batch',
    method: 'delete',
    data: data
  })
}

// 新增任务媒体关联关系
export function addTaskMediaRelations(data) {
  return request({
    url: '/api/v1/task-media-relations/batch',
    method: 'post',
    data: data
  })
}

// 删除任务媒体关联关系
export function delTaskMediaRelations(id) {
  return request({
    url: '/api/v1/task-media-relations/' + id,
    method: 'delete'
  })
}

// 批量删除任务媒体关联关系
export function batchDelTaskMediaRelations(data) {
  return request({
    url: '/api/v1/task-media-relations/batch',
    method: 'delete',
    data: data
  })
}

// 新增警情媒体关联关系
export function addIncidentRecordMediaRelations(data) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/batch',
    method: 'post',
    data: data
  })
}

// 删除警情媒体关联关系
export function delIncidentRecordMediaRelations(id) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/' + id,
    method: 'delete'
  })
}

// 批量删除警情媒体关联关系
export function batchDelIncidentRecordMediaRelations(data) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/batch',
    method: 'delete',
    data: data
  })
}

// 新增警情媒体关联信息
export function addIncidentRecordMediaInfo(data) {
  return request({
    url: '/api/v1/incidentrecord-media-info',
    method: 'post',
    data: data
  })
}

// 修改警情媒体关联信息
export function updateIncidentRecordMediaInfo(data, id) {
  return request({
    url: '/api/v1/incidentrecord-media-info/' + id,
    method: 'put',
    data: data
  })
}
