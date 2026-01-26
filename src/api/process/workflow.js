import request from '@/utils/request'

/**
 * 查询工作流列表
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function listWorkflows(query) {
  return request({
    url: '/api/v1/workflows',
    method: 'get',
    params: query
  })
}

export function listAllWorkflows() {
  return request({
    url: '/api/v1/workflows/all',
    method: 'get'
  })
}

/**
 * 查询工作流详细信息
 * @param {String} id - 工作流ID
 * @returns {Promise}
 */
export function getWorkflow(id) {
  return request({
    url: '/api/v1/workflows/' + id,
    method: 'get'
  })
}

export function getWorkflowByName(name) {
  return request({
    url: '/api/v1/workflows/name/' + name,
    method: 'get'
  })
}
/**
 * 新增工作流
 * @param {Object} data - 工作流数据 { name, description, definition }
 * @returns {Promise}
 */
export function createWorkflow(data) {
  return request({
    url: '/api/v1/workflows',
    method: 'post',
    data: data
  })
}

/**
 * 修改工作流
 * @param {String} id - 工作流ID
 * @param {Object} data - 工作流数据 { name, description, definition }
 * @returns {Promise}
 */
export function updateWorkflow(id, data) {
  return request({
    url: '/api/v1/workflows/' + id,
    method: 'put',
    data: data
  })
}

/**
 * 删除工作流
 * @param {String} id - 工作流ID
 * @returns {Promise}
 */
export function deleteWorkflow(id) {
  return request({
    url: '/api/v1/workflows/' + id,
    method: 'delete'
  })
}

/**
 * 激活工作流
 * @param {String} id - 工作流ID
 * @returns {Promise}
 */
export function activateWorkflow(id) {
  return request({
    url: '/api/v1/workflows/' + id + '/activate',
    method: 'post'
  })
}

/**
 * 冻结工作流
 * @param {String} id - 工作流ID
 * @returns {Promise}
 */
export function freezeWorkflow(id) {
  return request({
    url: '/api/v1/workflows/' + id + '/freeze',
    method: 'post'
  })
}

/**
 * 检查工作流是否可以冻结（所有实例都已完成）
 * @param {String} id - 工作流ID
 * @returns {Promise}
 */
export function checkCanFreeze(id) {
  return request({
    url: '/api/v1/workflows/' + id + '/can-freeze',
    method: 'get'
  })
}

