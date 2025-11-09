import request from '@/utils/request'

// ========== 命令端API（Command） ==========

/**
 * 批量添加证据源媒体
 * @param {Object} data - 添加数据
 * @param {string} data.caseId - 案件ID (UUID格式)
 * @param {Array<string>} data.mediaIds - 媒体ID列表 (UUID格式)
 * @param {number} data.operatorId - 操作员ID
 * @returns {Promise}
 */
export function batchAddEvidenceMedia(data) {
  return request({
    url: '/api/v1/evidence-media/batch',
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
export function removeEvidenceMedia(caseId, mediaId) {
  return request({
    url: `/api/v1/evidence-media/${caseId}/${mediaId}`,
    method: 'delete'
  })
}

/**
 * 健康检查
 * @returns {Promise}
 */
export function healthCheck() {
  return request({
    url: '/api/v1/evidence-media/health',
    method: 'get'
  })
}

