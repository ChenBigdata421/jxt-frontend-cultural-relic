import request from '@/utils/request'

// 执法仪API
export function getEquipmentBwcList(query) {
  return request({
    url: '/api/v1/equipment/bwc',
    method: 'get',
    params: query
  })
}

export function getEquipmentBwc(bwcId) {
  return request({
    url: '/api/v1/equipment/bwc/' + bwcId,
    method: 'get'
  })
}

export function getEquipmentBwcByManagerId(managerId) {
  return request({
    url: '/api/v1/equipment/bwc/managerId/' + managerId,
    method: 'get'
  })
}

export function addEquipmentBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc',
    method: 'post',
    data: data
  })
}

export function updateEquipmentBwc(data, id) {
  return request({
    url: '/api/v1/equipment/bwc/' + id,
    method: 'put',
    data: data
  })
}

export function delEquipmentBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc',
    method: 'delete',
    data: data
  })
}

export function batchRetireBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc/batch-retire',
    method: 'post',
    data: data
  })
}

export function batchRevokeBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc/batch-revoke',
    method: 'post',
    data: data
  })
}

export function batchRepairBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc/batch-repair',
    method: 'post',
    data: data
  })
}

export function batchRepairCompleteBwc(data) {
  return request({
    url: '/api/v1/equipment/bwc/batch-repair-complete',
    method: 'post',
    data: data
  })
}

// 场地API
export function listEquipmentTrial(query) {
  return request({
    url: '/api/v1/equipment/trial',
    method: 'get',
    params: query
  })
}

export function getEquipmentTrial(trialId) {
  return request({
    url: '/api/v1/equipment/trial/' + trialId,
    method: 'get'
  })
}

export function addEquipmentTrial(data) {
  return request({
    url: '/api/v1/equipment/trial',
    method: 'post',
    data: data
  })
}

export function updateEquipmentTrial(data, trialId) {
  return request({
    url: '/api/v1/equipment/trial/' + trialId,
    method: 'put',
    data: data
  })
}

export function delEquipmentTrial(trialId) {
  return request({
    url: '/api/v1/equipment/trial',
    method: 'delete',
    data: trialId
  })
}

// 采集站API
export function listEquipmentSite(query) {
  return request({
    url: '/api/v1/equipment/collect-site',
    method: 'get',
    params: query
  })
}

export function getEquipmentSite(siteId) {
  return request({
    url: '/api/v1/equipment/collect-site/' + siteId,
    method: 'get'
  })
}

export function addEquipmentSite(data) {
  return request({
    url: '/api/v1/equipment/collect-site',
    method: 'post',
    data: data
  })
}

export function updateEquipmentSite(data, siteId) {
  return request({
    url: '/api/v1/equipment/collect-site/' + siteId,
    method: 'put',
    data: data
  })
}

export function delEquipmentSite(siteId) {
  return request({
    url: '/api/v1/equipment/collect-site',
    method: 'delete',
    data: siteId
  })
}

export function getEquipmentSiteConfig(siteConfigId) {
  return request({
    url: '/api/v1/equipment/collect-site-config/' + siteConfigId,
    method: 'get'
  })
}

// 品牌API
export function listEquipmentBrand(query) {
  return request({
    url: '/api/v1/equipment/brand',
    method: 'get',
    params: query
  })
}

export function getEquipmentBrand(brandId) {
  return request({
    url: '/api/v1/equipment/brand/' + brandId,
    method: 'get'
  })
}

export function addEquipmentBrand(data) {
  return request({
    url: '/api/v1/equipment/brand',
    method: 'post',
    data: data
  })
}

export function updateEquipmentBrand(data, brandId) {
  return request({
    url: '/api/v1/equipment/brand/' + brandId,
    method: 'put',
    data: data
  })
}

export function delEquipmentBrand(brandId) {
  return request({
    url: '/api/v1/equipment/brand',
    method: 'delete',
    data: brandId
  })
}

// 存储API
export function listEquipmentStorage(query) {
  return request({
    url: '/api/v1/equipment/storage-site',
    method: 'get',
    params: query
  })
}

export function getEquipmentStorage(storageId) {
  return request({
    url: '/api/v1/equipment/storage-site/' + storageId,
    method: 'get'
  })
}

export function addEquipmentStorage(data) {
  return request({
    url: '/api/v1/equipment/storage-site',
    method: 'post',
    data: data
  })
}

export function updateEquipmentStorage(data, storageId) {
  return request({
    url: '/api/v1/equipment/storage-site/' + storageId,
    method: 'put',
    data: data
  })
}

export function delEquipmentStorage(storageId) {
  return request({
    url: '/api/v1/equipment/storage-site',
    method: 'delete',
    data: storageId
  })
}

export function getEquipmentStorageConfig(storageConfigId) {
  return request({
    url: '/api/v1/equipment/storage-site-config/' + storageConfigId,
    method: 'get'
  })
}
