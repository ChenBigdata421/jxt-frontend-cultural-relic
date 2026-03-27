import request from '@/utils/request'

// ==================== 查询操作 (Query Service) ====================

/**
 * 查询档案列表（分页）
 * @param {Object} query - 查询参数
 * @param {string} query.archiveCode - 档案编码
 * @param {string} query.archiveTitle - 档案标题
 * @param {number} query.archiveType - 档案类型
 * @param {number} query.orgId - 组织ID
 * @param {string} query.orgCode - 组织编码
 * @param {string} query.orgName - 组织名称
 * @param {number} query.status - 状态
 * @param {string} query.inputTimeStart - 录入开始时间
 * @param {string} query.inputTimeEnd - 录入结束时间
 * @param {string} query.expirationStart - 过期开始时间
 * @param {string} query.expirationEnd - 过期结束时间
 * @param {number} query.storageDuration - 保存期限
 * @param {string} query.inputUserName - 录入人员
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @returns {Promise}
 */
export function listArchives(query) {
  return request({
    url: '/api/v1/archives',
    method: 'get',
    params: query
  })
}

/**
 * 根据ID查询档案详情
 * @param {string} archiveId - 档案ID (UUID格式)
 * @returns {Promise}
 */
export function getArchive(archiveId) {
  return request({
    url: '/api/v1/archives/' + archiveId,
    method: 'get'
  })
}

/**
 * 根据编码查询档案
 * @param {string} archiveCode - 档案编码
 * @returns {Promise}
 */
export function getArchiveByCode(archiveCode) {
  return request({
    url: '/api/v1/archives/code/' + archiveCode,
    method: 'get'
  })
}

// ==================== 命令操作 (Command Service) ====================

/**
 * 创建档案
 * @param {Object} data - 档案数据
 * @param {string} data.archiveTitle - 档案标题 (必填)
 * @param {number} data.archiveType - 档案类型 (必填)
 * @param {string} data.description - 档案描述
 * @param {number} data.storageDuration - 保存期限(月)
 * @param {string} data.remarks - 备注信息
 * @returns {Promise}
 */
export function addArchive(data) {
  return request({
    url: '/api/v1/archives',
    method: 'post',
    data: data
  })
}

/**
 * 更新档案
 * @param {Object} data - 档案数据
 * @param {string} id - 档案ID (UUID格式)
 * @returns {Promise}
 */
export function updateArchive(data, id) {
  return request({
    url: '/api/v1/archives/' + id,
    method: 'put',
    data: data
  })
}

/**
 * 删除档案
 * @param {string} id - 档案ID (UUID格式)
 * @returns {Promise}
 */
export function delArchive(id) {
  return request({
    url: '/api/v1/archives/' + id,
    method: 'delete'
  })
}

/**
 * 批量删除档案
 * @param {Object} data - 包含档案ID数组的对象
 * @param {Array<string>} data.ids - 档案ID数组 (UUID格式)
 * @returns {Promise}
 */
export function batchDelArchives(data) {
  return request({
    url: '/api/v1/archives/batch/delete',
    method: 'post',
    data: data
  })
}

/**
 * 批量更新档案
 * @param {Object} data - 批量更新数据
 * @param {Array<string>} data.ids - 档案ID数组 (UUID格式)
 * @param {number} data.archiveType - 档案类型
 * @param {number} data.storageDuration - 保存期限(月)
 * @param {number} data.status - 状态
 * @param {string} data.remarks - 备注信息
 * @returns {Promise}
 */
export function batchUpdateArchives(data) {
  return request({
    url: '/api/v1/archives/batch/update',
    method: 'post',
    data: data
  })
}

/**
 * 批量更新档案状态
 * @param {Object} data - 批量更新状态数据
 * @param {Array<string>} data.ids - 档案ID数组 (UUID格式)
 * @param {number} data.status - 状态值
 * @returns {Promise}
 */
export function batchUpdateArchiveStatus(data) {
  return request({
    url: '/api/v1/archives/batch/status',
    method: 'post',
    data: data
  })
}

// ==================== 档案媒体关联操作 ====================

/**
 * 批量创建档案媒体关联
 * @param {Object} data - 批量关联数据
 * @param {string} data.archiveId - 档案ID (UUID格式)
 * @param {string} data.archiveCode - 档案编码
 * @param {Array<string>} data.mediaIds - 媒体ID数组 (UUID格式)
 * @returns {Promise}
 */
export function batchAddArchiveMediaRelations(data) {
  return request({
    url: '/api/v1/archive-media-relations/batch',
    method: 'post',
    data: data
  })
}

/**
 * 查询档案的关联列表
 * @param {string} archiveId - 档案ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.page - 页码
 * @param {number} query.pageSize - 每页条数
 * @returns {Promise}
 */
export function getArchiveMediaRelationsByArchiveId(archiveId, query) {
  return request({
    url: `/api/v1/archive-media-relations/archive/${archiveId}`,
    method: 'get',
    params: query
  })
}

/**
 * 删除档案媒体关联(通过关联ID)
 * @param {string} relationId - 关联ID (UUID格式)
 * @returns {Promise}
 */
export function delArchiveMediaRelationById(relationId) {
  return request({
    url: `/api/v1/archive-media-relations/${relationId}`,
    method: 'delete'
  })
}

/**
 * 批量删除档案媒体关联
 * @param {Object} data - 批量删除数据
 * @param {Array<string>} data.ids - 关联ID数组 (UUID格式)
 * @returns {Promise}
 */
export function batchDelArchiveMediaRelations(data) {
  return request({
    url: '/api/v1/archive-media-relations/batch',
    method: 'delete',
    data: data
  })
}

