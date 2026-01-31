import request from '@/utils/request'

/**
 * 启动工作流实例
 * @param {Object} data - 实例数据 { workflow_id, input }
 * @returns {Promise}
 */
export function startInstance(data) {
  return request({
    url: '/api/v1/instances',
    method: 'post',
    data: data
  })
}

/**
 * 查询工作流实例详细信息
 * @param {String} id - 实例ID
 * @returns {Promise}
 */
export function getInstance(id) {
  return request({
    url: '/api/v1/instances/' + id,
    method: 'get'
  })
}

export function cancelInstance(id) {
  return request({
    url: '/api/v1/instances/' + id + '/cancel',
    method: 'put'
  })
}

export function getInstanceDetail(id) {
  return request({
    url: '/api/v1/instances/' + id + '/detail',
    method: 'get'
  })
}
/**
 * 查询指定工作流的实例列表
 * @param {String} workflowId - 工作流ID
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function listInstances(workflowId, query) {
  return request({
    url: '/api/v1/instances/workflow/' + workflowId,
    method: 'get',
    params: query
  })
}

/**
 * 查询所有实例列表
 * @param {Object} query - 查询参数 { limit, offset, workflow_id, status }
 * @returns {Promise}
 */
export function listAllInstances(query) {
  return request({
    url: '/api/v1/instances',
    method: 'get',
    params: query
  })
}

/**
 * 获取实例的任务历史
 * @param {String} instanceId - 实例ID
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function getInstanceTaskHistory(instanceId, query) {
  return request({
    url: '/api/v1/tasks/instance/' + instanceId + '/history',
    method: 'get',
    params: query
  })
}

/**
 * 获取实例的所有任务（包含当前状态）
 * @param {String} instanceId - 实例ID
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function getInstanceTasks(instanceId, query) {
  return request({
    url: '/api/v1/tasks/instance/' + instanceId,
    method: 'get',
    params: query
  })
}

export function getRecentTaskByInstance(instanceId) {
  return request({
    url: '/api/v1/tasks/instance/' + instanceId + '/recent',
    method: 'get',
  })
}

/**
 * 删除工作流实例
 * @param {String} id - 实例ID
 * @returns {Promise}
 */
export function deleteInstance(id) {
  return request({
    url: '/api/v1/instances/' + id,
    method: 'delete'
  })
}

