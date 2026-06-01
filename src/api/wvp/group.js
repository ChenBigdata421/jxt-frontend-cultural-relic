import request from '@/utils/request'

export function addGroup(data) {
  return request({ url: '/api/group/add', method: 'post', data })
}

export function updateGroup(data) {
  return request({ url: '/api/group/update', method: 'post', data })
}

export function deleteGroup(params) {
  return request({ url: '/api/group/delete', method: 'delete', params })
}
