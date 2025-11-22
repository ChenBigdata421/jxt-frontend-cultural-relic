import request from '@/utils/request'

// ========== 查询端API（Query） ==========

/**
 * 根据文书ID查询关联的媒体列表
 * @param {string} writId - 文书ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @returns {Promise}
 */
export function getMediaListByWritId(writId, query) {
  return request({
    url: `/api/v1/writ-media-relations/writ/${writId}/media`,
    method: 'get',
    params: query
  })
}

/**
 * 根据文书ID查询未关联的媒体列表
 * @param {string} writId - 文书ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @param {string} query.mediaName - 媒体名称
 * @param {number} query.mediaCate - 媒体类别
 * @param {number} query.orgId - 组织ID
 * @returns {Promise}
 */
export function getUnassociatedMediaByWritId(writId, query) {
  return request({
    url: `/api/v1/writ-media-relations/writ/${writId}/unassociated-media`,
    method: 'get',
    params: query
  })
}

// ========== 命令端API（Command） ==========

/**
 * 创建文书媒体关联
 * @param {Object} data - 关联数据
 * @param {string} data.writId - 文书ID（必填）
 * @param {string} data.mediaId - 媒体ID（必填）
 * @param {number} data.policeId - 警员ID
 * @returns {Promise}
 */
export function createWritMediaRelation(data) {
  return request({
    url: '/api/v1/writ-media-relations',
    method: 'post',
    data: data
  })
}

/**
 * 批量创建文书媒体关联
 * @param {Object} data - 批量关联数据
 * @param {string} data.writId - 文书ID（必填）
 * @param {Array<string>} data.mediaIds - 媒体ID列表（必填）
 * @param {number} data.policeId - 警员ID
 * @returns {Promise}
 */
export function batchCreateWritMediaRelation(data) {
  return request({
    url: '/api/v1/writ-media-relations/batch',
    method: 'post',
    data: data
  })
}

/**
 * 删除文书媒体关联
 * @param {string} id - 关联ID
 * @returns {Promise}
 */
export function deleteWritMediaRelation(id) {
  return request({
    url: '/api/v1/writ-media-relations/' + id,
    method: 'delete'
  })
}

