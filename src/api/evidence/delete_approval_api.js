import request from '@/utils/request'

/**
 * 查询删除审批状态
 * @param {string|number} mediaId - 媒体ID
 * @returns {Promise} 返回审批状态信息
 */
export function getDeleteApprovalStatus(mediaId) {
  return request({
    url: `/api/v1/mediadelete/${mediaId}/delete-approval`,
    method: 'get'
  })
}

/**
 * 提交删除申请
 * @param {string|number} mediaId - 媒体ID
 * @param {Object} data - 申请数据
 * @param {string} data.reason - 申请原因
 * @returns {Promise} 返回申请结果
 */
export function submitDeleteApplyRecord(mediaId, data) {
  return request({
    url: `/api/v1/mediadelete/${mediaId}/delete-approval`,
    method: 'post',
    data
  })
}

