import request from '@/utils/evidence_command_request'

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

// 新增执法类型
export function addEnforcementType(data) {
  return request({
    url: '/api/v1/enforcement-types',
    method: 'post',
    data: data
  })
}

// 修改执法类型
export function updateEnforcementType(data, id) {
  return request({
    url: '/api/v1/enforcement-types/' + id,
    method: 'put',
    data: data
  })
}

// 删除执法类型
export function delEnforcementType(id) {
  return request({
    url: '/api/v1/enforcement-types/' + id,
    method: 'delete'
  })
}
