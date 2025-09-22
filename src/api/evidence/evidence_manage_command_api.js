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
////媒体

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
    url: '/api/v1/media',
    method: 'delete',
    data: mediaId
  })
}
