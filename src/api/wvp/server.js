import request from '@/utils/request'

// Get system config (SIP server info)
export function getSystemConfig() {
  return request({ url: '/api/server/system/configInfo', method: 'get' })
}

// Get online media server list
export function getOnlineMediaServerList() {
  return request({ url: '/api/server/media_server/online/list', method: 'get' })
}
