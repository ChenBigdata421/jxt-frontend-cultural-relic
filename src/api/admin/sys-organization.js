import request from '@/utils/request'

export function getOrgList(query) {
  return request({
    url: '/api/v1/org',
    method: 'get',
    params: query
  })
}

// 查询组织详细
export function getOrg(orgId) {
  return request({
    url: '/api/v1/org/' + orgId,
    method: 'get'
  })
}

// 查询组织下拉树结构
export function orgTreeselect() {
  return request({
    url: '/api/v1/org/orgTreeSelect',
    method: 'get'
  })
}

// 根据角色ID查询组织树结构
export function orgRoleTreeselect(roleId) {
  return request({
    url: '/api/v1/orgRoleTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增组织
export function addOrg(data) {
  return request({
    url: '/api/v1/org',
    method: 'post',
    data: data
  })
}

// 修改组织
export function updateOrg(data, id) {
  return request({
    url: '/api/v1/org/' + id,
    method: 'put',
    data: data
  })
}

// 删除组织
export function delOrg(data) {
  return request({
    url: '/api/v1/org',
    method: 'delete',
    data: data
  })
}

// 组织状态修改
export function changeOrgStatus(orgId, status) {
  const data = {
    orgId,
    status
  }
  return request({
    url: '/api/v1/org/org-status',
    method: 'put',
    data: data
  })
}
