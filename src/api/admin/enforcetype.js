import request from '@/utils/request'

// 查询执法类型详细
export function getEnforceType(id) {
  return request({
    url: '/api/v1/enforcement-type/' + id,
    method: 'get'
  })
}
// 查询执法类型列表
export function getEnforceTypeList(query) {
  return request({
    url: '/api/v1/enforcement-type',
    method: 'get',
    params: query
  })
}
// 查询执法类型树形结构
export function getEnforceTypeTree(query) {
  return request({
    url: '/api/v1/enforcement-type/tree',
    method: 'get',
    params: query
  })
}

// 新增执法类型
export function addEnforceType(data) {
  return request({
    url: '/api/v1/enforcement-type',
    method: 'post',
    data: data
  })
}

// 修改执法类型
export function updateEnforceType(data, id) {
  return request({
    url: '/api/v1/enforcement-type/' + id,
    method: 'put',
    data: data
  })
}

// 删除执法类型
export function delEnforceType(id) {
  return request({
    url: '/api/v1/enforcement-type/' + id,
    method: 'delete'
  })
}
