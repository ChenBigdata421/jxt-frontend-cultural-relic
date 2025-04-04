import request from '@/utils/request'

export function getDeptList(query) {
  return request({
    url: '/api/v1/org',
    method: 'get',
    params: query
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/api/v1/org/' + deptId,
    method: 'get'
  })
}

// 查询部门下拉树结构
export function orgTreeSelect() {
  return request({
    url: '/api/v1/org/orgTreeSelect',
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/api/v1/org',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data, id) {
  return request({
    url: '/api/v1/org/' + id,
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(data) {
  return request({
    url: '/api/v1/org',
    method: 'delete',
    data: data
  })
}
