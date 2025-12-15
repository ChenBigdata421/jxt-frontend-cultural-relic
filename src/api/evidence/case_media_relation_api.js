import request from '@/utils/request'

// ========== 查询端API（Query） ==========

/**
 * 根据案件ID查询关联的媒体列表
 * @param {string} caseId - 案件ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @returns {Promise}
 */
export function getCaseMediaRelationsByCaseId(caseId, query) {
  return request({
    url: `/api/v1/case-media-relations/case/${caseId}`,
    method: 'get',
    params: query
  })
}

/**
 * 根据媒体ID查询关联的案件列表
 * @param {string} mediaId - 媒体ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @returns {Promise}
 */
export function getCaseListByMediaId(mediaId, query) {
  return request({
    url: `/api/v1/case-media-relations/media/${mediaId}/cases`,
    method: 'get',
    params: query
  })
}

/**
 * 查询未关联到指定案件的媒体列表
 * @param {string} caseId - 案件ID (UUID格式)
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @param {string} query.mediaName - 媒体名称
 * @param {number} query.mediaCate - 媒体类别
 * @returns {Promise}
 */
export function getUnassociatedMediaList(caseId, query) {
  return request({
    url: `/api/v1/media/case/${caseId}/unassociated-media`,
    method: 'get',
    params: query
  })
}

/**
 * 查询未关联到指定案件的媒体列表(别名)
 * @param {string} caseId - 案件ID (UUID格式)
 * @param {Object} query - 查询参数
 * @returns {Promise}
 */
export function getUnassociatedMediaByCaseId(caseId, query) {
  return getUnassociatedMediaList(caseId, query);
}

// ========== 命令端API（Command） ==========

/**
 * 批量创建案件媒体关联
 * @param {Object} data - 关联数据
 * @param {string} data.caseId - 案件ID (UUID格式)
 * @param {Array<string>} data.mediaIds - 媒体ID列表 (UUID格式)
 * @param {number} data.operatorId - 操作员ID
 * @returns {Promise}
 */
export function batchCreateCaseMediaRelations(data) {
  return request({
    url: '/api/v1/case-media-relations/batch',
    method: 'post',
    data: data
  })
}

/**
 * 删除案件媒体关联
 * @param {string} id - 关联ID (UUID格式)
 * @returns {Promise}
 */
export function deleteCaseMediaRelation(id) {
  return request({
    url: `/api/v1/case-media-relations/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除案件媒体关联
 * @param {Object} data - 批量删除数据
 * @param {Array<string>} data.ids - 关联ID数组 (UUID格式)
 * @returns {Promise}
 */
export function batchDeleteCaseMediaRelations(data) {
  return request({
    url: '/api/v1/case-media-relations/batch',
    method: 'delete',
    data: data
  })
}

/**
 * 健康检查
 * @returns {Promise}
 */
export function healthCheck() {
  return request({
    url: '/api/v1/case-media-relations/health',
    method: 'get'
  })
}

