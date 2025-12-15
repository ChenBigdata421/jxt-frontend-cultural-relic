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
