import request from '@/utils/request'

// Start play (extended timeout for stream negotiation)
export function startPlay(deviceId, channelId) {
  return request({ url: `/api/play/start/${deviceId}/${channelId}`, method: 'get', timeout: 30000 })
}

// Stop play
export function stopPlay(deviceId, channelId) {
  return request({ url: `/api/play/stop/${deviceId}/${channelId}`, method: 'get' })
}
