import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/api/v1/role',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/api/v1/role/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/api/v1/role',
    method: 'post',
    data
  })
}

// 修改角色
export function updateRole(data, roleId) {
  return request({
    url: '/api/v1/role/' + roleId,
    method: 'put',
    data
  })
}

// 删除角色
export function delRole(data) {
  return request({
    url: '/api/v1/role',
    method: 'delete',
    data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  return request({
    url: '/api/v1/role-status',
    method: 'put',
    data: { roleId, status }
  })
}
