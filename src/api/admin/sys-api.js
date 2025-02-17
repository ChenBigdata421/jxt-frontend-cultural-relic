import request from '@/utils/request'

// 查询SysApi列表
export function listSysApi(query) {
  return request({
    url: '/api/v1/sys-api',
    method: 'get',
    params: query
  })
}

// 查询SysApi的ID和title信息，目前没有使用，暂时保留
export function listSysApiIdTitle(query) {
  return request({
    url: '/api/v1/sys-api/id-title',
    method: 'get',
    params: query
  })
}

// 查询SysApi详细
export function getSysApi(id) {
  return request({
    url: '/api/v1/sys-api/' + id,
    method: 'get'
  })
}

// 新增SysApi
export function addSysApi(data) {
  return request({
    url: '/api/v1/sys-api',
    method: 'post',
    data: data
  })
}

// 修改SysApi
export function updateSysApi(data) {
  return request({
    url: '/api/v1/sys-api/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除SysApi
export function delSysApi(data) {
  return request({
    url: '/api/v1/sys-api',
    method: 'delete',
    data: data
  })
}

