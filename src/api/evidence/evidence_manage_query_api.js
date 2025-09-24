import request from '@/utils/evidence_query_request'

// 执法仪API
export function getIncidentRecordList(query) {
  return request({
    url: '/api/v1/incidentRecords',
    method: 'get',
    params: query
  })
}

export function getIncidentRecord(lawcameraId) {
  return request({
    url: '/api/v1/incidentRecords/' + lawcameraId,
    method: 'get'
  })
}

////媒体
// 查询 Media 列表
export function listMedia(query) {
  return request({
    url: '/api/v1/media',
    method: 'get',
    params: query
  })
}

// 根据 id 查询 Media 
export function getMedia(mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId,
    method: 'get'
  })
}

// 查询执法类型列表
export function getEnforcementTypeList(query) {
  return request({
    url: '/api/v1/enforcement-types',
    method: 'get',
    params: query
  })
}

// 查询执法类型详细
export function getEnforcementType(id) {
  return request({
    url: '/api/v1/enforcement-types/' + id,
    method: 'get'
  })
}

// 查询执法类型树形结构
export function getEnforcementTypeTree(query) {
  return request({
    url: '/api/v1/enforcement-types/tree',
    method: 'get',
    params: query
  })
}