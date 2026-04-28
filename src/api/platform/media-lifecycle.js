import request from '@/utils/request'

export function getLifecycleConfig() {
  return request({
    url: '/api/v1/lifecycle/config',
    method: 'get'
  })
}

export function updateLifecycleConfig(data) {
  return request({
    url: '/api/v1/lifecycle/config',
    method: 'put',
    data
  })
}
