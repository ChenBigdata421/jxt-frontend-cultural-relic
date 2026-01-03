import request from '@/utils/request'

// 执法仪API
export function getIncidentRecordList(query) {
  return request({
    url: '/api/v1/incidentRecords',
    method: 'get',
    params: query
  })
}

export function getIncidentRecord(bwcId) {
  return request({
    url: '/api/v1/incidentRecords/' + bwcId,
    method: 'get'
  })
}

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

// 根据 mediaId 获取媒体播放地址
export function getMediaPlayURL(mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId + '/playurl',
    method: 'get'
  })
}

// 根据案件ID查询关联的媒体列表
export function getMediaByCaseId(caseId, query) {
  return request({
    url: `/api/v1/media/case/${caseId}`,
    method: 'get',
    params: query
  })
}

// 根据案件ID查询源证据媒体列表
export function getSourceMediaByCaseId(caseId, query) {
  return request({
    url: `/api/v1/media/case/${caseId}/source`,
    method: 'get',
    params: query
  })
}

// 根据案件ID查询证据媒体列表
export function getEvidenceMediaByCaseId(caseId, query) {
  return request({
    url: `/api/v1/media/case/${caseId}/evidence`,
    method: 'get',
    params: query
  })
}

// 查询警情媒体关联关系列表
export function getIncidentRecordMediaRelationsByIncidentRecordId(incidentRecordId, query) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/incidentrecord/' + incidentRecordId,
    method: 'get',
    params: query

  })
}

// 查询警情媒体关联关系列表
export function getIncidentRecordUnassociatedMediaByIncidentRecord(incidentRecordId) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/unassociated-media/' + incidentRecordId,
    method: 'get'
  })
}

// 查询警情未关联的媒体列表(带分页)
export function getUnassociatedMediaByIncidentRecordId(incidentRecordId, query) {
  return request({
    url: `/api/v1/media/incidentrecord/${incidentRecordId}/unassociated-media`,
    method: 'get',
    params: query
  })
}

// 根据 mediaId 查询警情媒体关联列表
export function getIncidentRecordMediaRelationsByMedia(mediaId) {
  return request({
    url: '/api/v1/incidentrecord-media-relations/media/' + mediaId,
    method: 'get'
  })
}

// 查询警情媒体信息列表
export function getIncidentRecordMediaInfos(query) {
  return request({
    url: '/api/v1/incidentrecord-media-info',
    method: 'get',
    params: query
  })
}
