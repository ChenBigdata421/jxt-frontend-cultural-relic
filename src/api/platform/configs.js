import request from '@/utils/request'

export function listPlatformConfigs(query) {
  return request({
    url: '/api/v1/configs',
    method: 'get',
    params: query
  })
}

export function getPlatformConfig(id) {
  return request({
    url: `/api/v1/configs/${id}`,
    method: 'get'
  })
}

export function getPlatformConfigByKey(configKey) {
  return request({
    url: `/api/v1/configs/key/${encodeURIComponent(configKey)}`,
    method: 'get'
  })
}

export function getPlatformFrontendConfigs() {
  return request({
    url: '/api/v1/configs/frontend',
    method: 'get'
  })
}

export function createPlatformConfig(data) {
  return request({
    url: '/api/v1/configs',
    method: 'post',
    data
  })
}

export function updatePlatformConfig(id, data) {
  return request({
    url: `/api/v1/configs/${id}`,
    method: 'put',
    data
  })
}

export function deletePlatformConfigs(data) {
  return request({
    url: '/api/v1/configs',
    method: 'delete',
    data
  })
}
