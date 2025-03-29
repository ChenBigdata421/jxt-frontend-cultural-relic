import request from '@/utils/request'

// 查询 Media 列表
export function listMedia(query) {
  return request({
    url: '/api/v1/media',
    method: 'get',
    params: query
  })
}

// 根据 id 查询 Media 
export function getMedia(mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId,
    method: 'get'
  })
}

// 新增 Media
export function addMedia(data) {
  return request({
    url: '/api/v1/media',
    method: 'post',
    data: data
  })
}

// 更新 Media
export function updateMedia(data, mediaId) {
  return request({
    url: '/api/v1/media/' + mediaId,
    method: 'put',
    data: data
  })
}

// 删除 Media
export function delMedia(mediaId) {
  return request({
    url: '/api/v1/media',
    method: 'delete',
    data: mediaId
  })
}

