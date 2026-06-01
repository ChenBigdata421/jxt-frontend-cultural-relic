import request from '@/utils/request'

// Common Channel API

export function queryOne(id) {
  return request({ url: '/api/common/channel/one', method: 'get', params: { id }})
}

export function update(data) {
  return request({ url: '/api/common/channel/update', method: 'post', data })
}

export function add(data) {
  return request({ url: '/api/common/channel/add', method: 'post', data })
}

export function reset(data) {
  return request({ url: '/api/common/channel/reset', method: 'post', data })
}

export function getIndustryList() {
  return request({ url: '/api/common/channel/industry/list', method: 'get' })
}

export function getTypeList() {
  return request({ url: '/api/common/channel/type/list', method: 'get' })
}

export function getNetworkIdentificationList() {
  return request({ url: '/api/common/channel/network/identification/list', method: 'get' })
}

export function getModelList() {
  return request({ url: '/api/server/map/model-icon/list', method: 'get' })
}

// Group API

export function getGroupPath(params) {
  return request({ url: '/api/group/path', method: 'get', params })
}

// Region API

export function getRegionPath(deviceId) {
  return request({ url: '/api/region/path', method: 'get', params: { deviceId }})
}

export function queryRegionChildList(parent) {
  return request({ url: '/api/region/base/child/list', method: 'get', params: { parent }})
}

// 独立通道列表 API

export function getList(params) {
  return request({ url: '/api/common/channel/list', method: 'get', params })
}

export function playChannel(channelId) {
  return request({ url: '/api/common/channel/play', method: 'get', params: { channelId }})
}

export function stopPlayChannel(channelId) {
  return request({ url: '/api/common/channel/play/stop', method: 'get', params: { channelId }})
}

// 录像回放 API

export function playback(channelId, startTime, endTime) {
  return request({
    url: '/api/common/channel/playback',
    method: 'get',
    params: { channelId, startTime, endTime }
  })
}

export function stopPlayback(channelId, stream) {
  return request({
    url: '/api/common/channel/playback/stop',
    method: 'get',
    params: { channelId, stream }
  })
}

// 电子地图 API

export function getAllForMap(params) {
  return request({ url: '/api/common/channel/map/list', method: 'get', params })
}

export function getMapConfig() {
  return request({ url: '/api/server/map/config', method: 'get' })
}

export function getRegionTreeList(params) {
  return request({ url: '/api/region/tree/list', method: 'get', params })
}

export function getGroupTreeList(params) {
  return request({ url: '/api/group/tree/list', method: 'get', params })
}

export function queryRegionTree(params) {
  return request({ url: '/api/region/tree/query', method: 'get', params })
}

export function queryGroupTree(params) {
  return request({ url: '/api/group/tree/query', method: 'get', params })
}

// 资源管理 — 区划通道操作

export function getCivilCodeList(params) {
  return request({ url: '/api/common/channel/civilcode/list', method: 'get', params })
}

export function getParentList(params) {
  return request({ url: '/api/common/channel/parent/list', method: 'get', params })
}

export function addDeviceToRegion(data) {
  return request({ url: '/api/common/channel/region/device/add', method: 'post', data })
}

export function deleteDeviceFromRegion(data) {
  return request({ url: '/api/common/channel/region/device/delete', method: 'post', data })
}

export function addToGroup(data) {
  return request({ url: '/api/common/channel/group/add', method: 'post', data })
}

export function deleteFromGroup(data) {
  return request({ url: '/api/common/channel/group/delete', method: 'post', data })
}

export function getUnusualCivilCodeList(params) {
  return request({ url: '/api/common/channel/civilCode/unusual/list', method: 'get', params })
}

export function clearUnusualCivilCodeList(data) {
  return request({ url: '/api/common/channel/civilCode/unusual/clear', method: 'post', data })
}

export function getUnusualParentList(params) {
  return request({ url: '/api/common/channel/parent/unusual/list', method: 'get', params })
}

export function clearUnusualParentList(data) {
  return request({ url: '/api/common/channel/parent/unusual/clear', method: 'post', data })
}
