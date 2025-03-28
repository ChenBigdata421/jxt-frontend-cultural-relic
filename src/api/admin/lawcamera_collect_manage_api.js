import request from '@/utils/request'

// 查询可以领用的执法仪列表
export function getLawcameraCollectList(query) {
  return request({
    url: '/api/v1/equipment/lawcamera/getRequisition',
    method: 'get',
    params: query
  })
}

// 查询执法仪领用记录
export function getLawCameraLogList(query) {
  return request({
    url: '/api/v1/requisition/lawcamera/getRequisitionRecord',
    method: 'get',
    params: query
  })
}

// 领用执法仪
export function lawcameraCollect(data) {
  return request({
    url: '/api/v1/requisition/lawcamera/requisition',
    method: 'put',
    data: data
  })
}

// 退还执法仪
export function lawcameraReturn(data) {
  return request({
    url: '/api/v1/requisition/lawcamera/return',
    method: 'put',
    data: data
  })
}
