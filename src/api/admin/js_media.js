import request from '@/utils/request'

export function get_js_media_list(query) {
  return request({
    url: '/api/v1/jsMedia',
    method: 'get',
    params: query
  })
}

