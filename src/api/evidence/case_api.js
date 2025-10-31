import request from '@/utils/request'

// ========== 查询端API（Query） ==========

/**
 * 查询案件列表
 * @param {Object} query - 查询参数
 * @param {number} query.pageSize - 每页条数
 * @param {number} query.pageIndex - 页码
 * @param {string} query.caseCode - 案件编号
 * @param {string} query.caseName - 案件名称
 * @param {number} query.caseType - 案件类型
 * @param {number} query.caseOrgId - 办案单位ID
 * @param {number} query.caseFlow - 案件流程
 * @param {string} query.caseTimeStart - 案发开始时间
 * @param {string} query.caseTimeEnd - 案发结束时间
 * @returns {Promise}
 */
export function listCases(query) {
  return request({
    url: '/api/v1/cases',
    method: 'get',
    params: query
  })
}

/**
 * 根据ID查询案件
 * @param {string} id - 案件ID (UUID格式)
 * @returns {Promise}
 */
export function getCase(id) {
  return request({
    url: '/api/v1/cases/' + id,
    method: 'get'
  })
}

/**
 * 根据案件编号查询案件
 * @param {string} caseCode - 案件编号
 * @returns {Promise}
 */
export function getCaseByCaseCode(caseCode) {
  return request({
    url: '/api/v1/cases/code/' + caseCode,
    method: 'get'
  })
}

// ========== 命令端API（Command） ==========

/**
 * 新增案件
 * @param {Object} data - 案件数据
 * @param {string} data.caseName - 案件名称（必填）
 * @param {number} data.caseType - 案件类型（必填）
 * @param {number} data.caseOrgId - 办案单位ID（必填）
 * @param {string} data.receiptIncidentRecordNum - 接警编号
 * @param {string} data.disposalIncidentRecordNum - 处警编号
 * @param {string} data.caseTime - 案发时间
 * @param {number} data.caseFlow - 案件流程标注
 * @param {string} data.caseAddress - 案发地址
 * @param {number} data.procOrgId - 处警单位ID
 * @param {string} data.procTime - 处警时间
 * @param {string} data.incidentRecordContext - 接警内容
 * @param {string} data.procResult - 处警过程描述
 * @param {Array<number>} data.processPoliceIds - 处警人员ID列表
 * @param {string} data.processPoliceNames - 处警人员姓名
 * @returns {Promise}
 */
export function addCase(data) {
  return request({
    url: '/api/v1/cases',
    method: 'post',
    data: data
  })
}

/**
 * 更新案件
 * @param {Object} data - 案件数据
 * @param {string} id - 案件ID
 * @returns {Promise}
 */
export function updateCase(data, id) {
  return request({
    url: '/api/v1/cases/' + id,
    method: 'put',
    data: data
  })
}

/**
 * 删除案件
 * @param {string} id - 案件ID
 * @returns {Promise}
 */
export function delCase(id) {
  return request({
    url: '/api/v1/cases/' + id,
    method: 'delete'
  })
}

/**
 * 批量删除案件
 * @param {Object} data - 批量删除数据
 * @param {Array<string>} data.ids - 案件ID列表
 * @returns {Promise}
 */
export function batchDelCases(data) {
  return request({
    url: '/api/v1/cases/batch/delete',
    method: 'post',
    data: data
  })
}

/**
 * 更新案件流程（标注）
 * @param {string} id - 案件ID
 * @param {Object} data - 流程数据
 * @param {number} data.caseFlow - 案件流程
 * @returns {Promise}
 */
export function updateCaseFlow(id, data) {
  return request({
    url: '/api/v1/cases/' + id + '/flow',
    method: 'put',
    data: data
  })
}

