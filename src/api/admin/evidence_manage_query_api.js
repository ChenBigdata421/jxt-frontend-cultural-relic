import request from '@/utils/request'

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
