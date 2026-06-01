import request from '@/utils/request'

// Device list
export function queryDevices(params) {
  return request({ url: '/api/device/query/devices', method: 'get', params })
}

// Device detail
export function queryDeviceOne(deviceId) {
  return request({ url: `/api/device/query/devices/${deviceId}`, method: 'get' })
}

// Add device
export function addDevice(data) {
  return request({ url: '/api/device/query/device/add', method: 'post', data })
}

// Update device
export function updateDevice(data) {
  return request({ url: '/api/device/query/device/update', method: 'post', data })
}

// Delete device
export function deleteDevice(deviceId) {
  return request({ url: `/api/device/query/devices/${deviceId}/delete`, method: 'delete' })
}

// Sync device
export function syncDevice(deviceId) {
  return request({ url: `/api/device/query/devices/${deviceId}/sync`, method: 'get' })
}

// Query sync status
export function queryDeviceSyncStatus(deviceId) {
  return request({ url: '/api/device/query/sync_status', method: 'get', params: { deviceId }})
}

// Update transport mode
export function updateDeviceTransport(deviceId, streamMode) {
  return request({ url: `/api/device/query/transport/${deviceId}/${streamMode}`, method: 'post' })
}

// Query channels
export function queryChannels(deviceId, params) {
  return request({ url: `/api/device/query/devices/${deviceId}/channels`, method: 'get', params })
}

// Query sub-channels
export function querySubChannels(deviceId, parentChannelId, params) {
  return request({ url: `/api/device/query/devices/${deviceId}/channels/${parentChannelId}/subChannels`, method: 'get', params })
}

// Change channel audio
export function changeChannelAudio(channelId, audio) {
  return request({ url: '/api/device/query/channel/audio', method: 'post', params: { channelId, audio }})
}

// Update channel stream identification
export function updateChannelStreamIdentification(data) {
  return request({ url: '/api/device/query/channel/stream/identification/update/', method: 'post', data })
}

// Device record control
export function deviceRecord(deviceId, channelId, recordCmdStr) {
  return request({ url: '/api/device/control/record', method: 'get', params: { deviceId, channelId, recordCmdStr }})
}

// Set guard (alarm arm)
export function setGuard(deviceId) {
  return request({ url: '/api/device/control/guard', method: 'get', params: { deviceId, guardCmd: 'SetGuard' }})
}

// Reset guard (alarm disarm)
export function resetGuard(deviceId) {
  return request({ url: '/api/device/control/guard', method: 'get', params: { deviceId, guardCmd: 'ResetGuard' }})
}

// Subscribe catalog
export function subscribeCatalog(id, cycle) {
  return request({ url: '/api/device/query/subscribe/catalog', method: 'get', params: { id, cycle }})
}

// Subscribe mobile position
export function subscribeMobilePosition(id, cycle, interval) {
  return request({ url: '/api/device/query/subscribe/mobile-position', method: 'get', params: { id, cycle, interval }})
}

// Subscribe alarm
export function subscribeForAlarm(id, cycle) {
  return request({ url: '/api/device/query/subscribe/alarm', method: 'get', params: { id, cycle }})
}

// Query basic params
export function queryBasicParam(deviceId) {
  return request({ url: `/api/device/config/query/${deviceId}/BasicParam`, method: 'get' })
}

// Keepalive time statistics
export function getKeepaliveTimeStatistics(deviceId, count) {
  return request({ url: '/api/device/query/statistics/keepalive', method: 'get', params: { deviceId, count }})
}

// Register time statistics
export function getRegisterTimeStatistics(deviceId, count) {
  return request({ url: '/api/device/query/statistics/register', method: 'get', params: { deviceId, count }})
}

// 设备按行政区划查询（后端新增端点）
export function queryDevicesByCivilCode(params) {
  return request({ url: '/api/device/query/devices/civilcode', method: 'get', params })
}
