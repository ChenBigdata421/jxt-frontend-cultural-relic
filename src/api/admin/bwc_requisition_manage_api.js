import request from '@/utils/request'

// 查询可以领用的执法仪列表
export function getBwcRequisitionList(query) {
  return request({
    url: '/api/v1/equipment/bwc/getRequisition',
    method: 'get',
    params: query
  })
}

// 查询执法仪领用记录
export function getBwcLogList(query) {
  return request({
    url: '/api/v1/requisition/bwc/getRequisitionRecord',
    method: 'get',
    params: query
  })
}

// 领用执法仪
export function bwcRequisition(data) {
  return request({
    url: '/api/v1/requisition/bwc/requisition',
    method: 'put',
    data: data
  })
}

// 退还执法仪
export function bwcReturn(data) {
  return request({
    url: '/api/v1/requisition/bwc/return',
    method: 'put',
    data: data
  })
}
