import request from '@/utils/request'

// ========== 查询端API（Query） ==========

/**
 * 查询文书列表
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @param {string} query.writCode - 文书编号
 * @param {string} query.writName - 文书名称
 * @param {number} query.writType - 文书类型
 * @param {number} query.orgId - 组织部门ID
 * @param {number} query.writRelation - 关联状态
 * @param {string} query.writTimeStart - 开书开始时间
 * @param {string} query.writTimeEnd - 开书结束时间
 * @returns {Promise}
 */
export function listWrits(query) {
  return request({
    url: '/api/v1/writs',
    method: 'get',
    params: query
  })
}

/**
 * 根据ID查询文书
 * @param {string} id - 文书ID (UUID格式)
 * @returns {Promise}
 */
export function getWrit(id) {
  return request({
    url: '/api/v1/writs/' + id,
    method: 'get'
  })
}

/**
 * 根据文书编号查询文书
 * @param {string} writCode - 文书编号
 * @returns {Promise}
 */
export function getWritByWritCode(writCode) {
  return request({
    url: '/api/v1/writs/code/' + writCode,
    method: 'get'
  })
}

// ========== 命令端API（Command） ==========

/**
 * 新增文书
 * @param {Object} data - 文书数据
 * @param {string} data.writName - 文书名称（必填）
 * @param {number} data.writType - 文书类型（必填）
 * @param {number} data.orgId - 组织部门ID（必填）
 * @param {Array<number>} data.policeIds - 警员ID列表（必填）
 * @returns {Promise}
 */
export function addWrit(data) {
  return request({
    url: '/api/v1/writs',
    method: 'post',
    data: data
  })
}

/**
 * 修改文书
 * @param {string} id - 文书ID
 * @param {Object} data - 文书数据
 * @param {string} data.writName - 文书名称
 * @param {number} data.writType - 文书类型
 * @param {number} data.orgId - 组织部门ID
 * @returns {Promise}
 */
export function updateWrit(id, data) {
  return request({
    url: '/api/v1/writs/' + id,
    method: 'put',
    data: data
  })
}

/**
 * 删除文书
 * @param {string} id - 文书ID
 * @returns {Promise}
 */
export function delWritById(id) {
  return request({
    url: '/api/v1/writs/' + id,
    method: 'delete'
  })
}

export function batchDelWrit(data) {
  return request({
    url: '/api/v1/writs/batch',
    method: 'delete',
    data: data
  })
}

/**
 * 文书评分
 * @param {string} id - 文书ID
 * @param {Object} data - 评分数据
 * @param {number} data.writScore - 文书评分（必填）
 * @param {string} data.scoreDesc - 评分说明
 * @returns {Promise}
 */
export function scoreWrit(id, data) {
  return request({
    url: '/api/v1/writs/' + id + '/score',
    method: 'put',
    data: data
  })
}

