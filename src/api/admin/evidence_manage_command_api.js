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