import request from '@/utils/request'

// ========== 查询端API（Query） ==========

/**
 * 根据案件ID查询证据源媒体列表
 * @param {string} caseId - 案件ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @returns {Promise}
 */
export function getEvidenceSourceMediaList(caseId, query) {
  return request({
    url: `/api/v1/evidence-source-media/case/${caseId}`,
    method: 'get',
    params: query
  })
}

// ========== 命令端API（Command） ==========

/**
 * 添加证据源媒体
 * @param {Object} data - 添加数据
 * @param {string} data.caseId - 案件ID (UUID格式)
 * @param {string} data.mediaId - 媒体ID (UUID格式)
 * @param {number} data.evidenceIndex - 证据索引
 * @param {number} data.operatorId - 操作员ID
 * @returns {Promise}
 */
export function addEvidenceSourceMedia(data) {
  return request({
    url: '/api/v1/evidence-source-media',
    method: 'post',
    data: data
  })
}

/**
 * 批量添加证据源媒体
 * @param {Object} data - 添加数据
 * @param {string} data.caseId - 案件ID (UUID格式)
 * @param {Array<string>} data.mediaIds - 媒体ID列表 (UUID格式)
 * @param {number} data.operatorId - 操作员ID
 * @returns {Promise}
 */
export function batchAddEvidenceSourceMedia(data) {
  return request({
    url: '/api/v1/evidence-source-media/batch',
    method: 'post',
    data: data
  })
}

/**
 * 移除证据源媒体
 * @param {string} caseId - 案件ID (UUID格式)
 * @param {string} mediaId - 媒体ID (UUID格式)
 * @returns {Promise}
 */
export function removeEvidenceSourceMedia(caseId, mediaId) {
  return request({
    url: `/api/v1/evidence-source-media/${caseId}/${mediaId}`,
    method: 'delete'
  })
}

/**
 * 健康检查
 * @returns {Promise}
 */
export function healthCheck() {
  return request({
    url: '/api/v1/evidence-source-media/health',
    method: 'get'
  })
}

