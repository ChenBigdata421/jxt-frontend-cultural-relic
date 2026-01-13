import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/api/v1/sys-user',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/api/v1/sys-user/' + userId,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/api/v1/sys-user',
    method: 'post',
    data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: '/api/v1/sys-user',
    method: 'put',
    data
  })
}

// 删除用户
export function delUser(data) {
  return request({
    url: '/api/v1/sys-user',
    method: 'delete',
    data
  })
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: '/api/v1/sys-user/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}
