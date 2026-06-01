import request from '@/utils/request'

export function addRegion(data) {
  return request({ url: '/api/region/add', method: 'post', data })
}

export function updateRegion(data) {
  return request({ url: '/api/region/update', method: 'post', data })
}

export function deleteRegion(params) {
  return request({ url: '/api/region/delete', method: 'delete', params })
}

export function getRegionDescription(civilCode) {
  return request({ url: '/api/region/description', method: 'get', params: { civilCode }})
}

export function addRegionByCivilCode(civilCode) {
  return request({ url: '/api/region/addByCivilCode', method: 'get', params: { civilCode }})
}

export function getRegionBaseChildList(parent) {
  return request({ url: '/api/region/base/child/list', method: 'get', params: { parent }})
}
