import request from '@/utils/request'

/**
 * 查询下载审批状态
 * @param {string|number} mediaId - 媒体ID
 * @returns {Promise} 返回审批状态信息
 */
export function getDownloadApprovalStatus(mediaId) {
  return request({
    url: `/api/v1/mediadownload/${mediaId}/download-approval`,
    method: 'get'
  })
}

/**
 * 提交下载申请
 * @param {string|number} mediaId - 媒体ID
 * @param {Object} data - 申请数据
 * @param {string} data.reason - 申请原因
 * @returns {Promise} 返回申请结果
 */
export function submitDownloadApplyRecord(mediaId, data) {
  return request({
    url: `/api/v1/mediadownload/${mediaId}/download-approval`,
    method: 'post',
    data
  })
}

/**
 * 批量查询下载审批状态
 * @param {Array<string|number>} mediaIds - 媒体ID数组
 * @returns {Promise} 返回批量审批状态信息
 */
export function batchGetDownloadApprovalStatus(mediaIds) {
  return request({
    url: '/api/v1/mediadownload/download-approval/batch',
    method: 'post',
    data: { mediaIds }
  })
}

/**
 * 更新下载审批状态（工作流回调使用）
 * @param {string|number} approvalId - 审批记录ID
 * @param {Object} data - 更新数据
 * @param {string} data.status - 状态: approved/rejected
 * @param {string} data.comment - 审批意见
 * @returns {Promise} 返回更新结果
 */
export function updateDownloadApprovalStatus(approvalId, data) {
  return request({
    url: `/api/v1/mediadownload/download-approval/${approvalId}`,
    method: 'put',
    data
  })
}

/**
 * 记录下载操作（审批通过后下载时调用）
 * @param {string|number} mediaId - 媒体ID
 * @param {Object} data - 下载信息
 * @param {number} data.approvalId - 审批记录ID
 * @param {string} data.fileType - 文件类型
 * @returns {Promise} 返回记录结果
 */
export function recordDownload(mediaId, data) {
  return request({
    url: `/api/v1/mediadownload/${mediaId}/download-record`,
    method: 'post',
    data
  })
}
