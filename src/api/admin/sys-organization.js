import request from '@/utils/request'

export function getOrgList(query) {
  return request({
    url: '/api/v1/org',
    method: 'get',
    params: query
  })
}

// 查询部门详细
export function getOrg(orgId) {
  return request({
    url: '/api/v1/org/' + orgId,
    method: 'get'
  })
}

// 查询部门下拉树结构
export function orgTreeselect() {
  return request({
    url: '/api/v1/org/orgTreeSelect',
    method: 'get'
  })
}

// 根据角色ID查询部门树结构
export function orgRoleTreeselect(roleId) {
  return request({
    url: '/api/v1/orgRoleTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增部门
export function addOrg(data) {
  return request({
    url: '/api/v1/org',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateOrg(data, id) {
  return request({
    url: '/api/v1/org/' + id,
    method: 'put',
    data: data
  })
}

// 删除部门
export function delOrg(data) {
  return request({
    url: '/api/v1/org',
    method: 'delete',
    data: data
  })
}
