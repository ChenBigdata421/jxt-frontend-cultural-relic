import request from '@/utils/request'

export function getLawcameraCollectList(query) {
  return request({
    url: '/api/v1/equipment/lawcamera/getCollect',
    method: 'get',
    params: query
  })
}

export function getLawCameraLogList(query) {
  return request({
    url: '/api/v1/equipment/lawcamera/getCollectRecord',
    method: 'get',
    params: query
  })
}

// 领用执法仪
export function lawcameraCollect(data) {
  return request({
    url: '/api/v1/equipment/lawcamera/collect',
    method: 'put',
    data: data
  })
}

// 退还执法仪
export function lawcameraReturn(data) {
  return request({
    url: '/api/v1/equipment/lawcamera/return',
    method: 'put',
    data: data
  })
}
