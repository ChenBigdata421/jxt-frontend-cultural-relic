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

// 查询组织负责人
export function getOrgLeader(orgId) {
  return request({
    url: '/api/v1/org/' + orgId + '/leader',
    method: 'get'
  })
}

// 查询组织下拉树结构
export function orgTreeSelect() {
  return request({
    url: '/api/v1/org/orgTreeSelect',
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
