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
