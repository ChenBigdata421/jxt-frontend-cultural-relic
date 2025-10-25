import request from '@/utils/request'

/**
 * 查询我的待办任务列表
 * @param {Object} query - 查询参数 { limit, offset, status }
 * @returns {Promise}
 */
export function listMyTodoTasks(query) {
  return request({
    url: '/api/tasks/todo',
    method: 'get',
    params: query
  })
}

/**
 * 查询我的已办任务列表
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function listMyDoneTasks(query) {
  return request({
    url: '/api/tasks/done',
    method: 'get',
    params: query
  })
}

/**
 * 查询待领任务列表（任务池）
 * @param {Object} query - 查询参数 { limit, offset }
 * @returns {Promise}
 */
export function listClaimableTasks(query) {
  return request({
    url: '/api/tasks/claimable',
    method: 'get',
    params: query
  })
}

/**
 * 查询所有任务列表（管理员）
 * @param {Object} query - 查询参数 { limit, offset, task_name, workflow_name, status, assignee }
 * @returns {Promise}
 */
export function listAllTasks(query) {
  return request({
    url: '/api/tasks',
    method: 'get',
    params: query
  })
}

/**
 * 查询任务详细信息
 * @param {String} id - 任务ID
 * @returns {Promise}
 */
export function getTask(id) {
  return request({
    url: '/api/tasks/' + id,
    method: 'get'
  })
}

/**
 * 认领任务
 * @param {String} id - 任务ID
 * @returns {Promise}
 */
export function claimTask(id) {
  return request({
    url: '/api/tasks/' + id + '/claim',
    method: 'post'
  })
}

/**
 * 完成任务
 * @param {String} id - 任务ID
 * @param {Object} data - 任务完成数据 { output, comment }
 * @returns {Promise}
 */
export function completeTask(id, data) {
  return request({
    url: '/api/tasks/' + id + '/complete',
    method: 'post',
    data: data
  })
}

/**
 * 审批任务（通过）
 * @param {String} id - 任务ID
 * @param {Object} data - 审批数据 { comment, variables }
 * @returns {Promise}
 */
export function approveTask(id, data) {
  return request({
    url: '/api/tasks/' + id + '/approve',
    method: 'post',
    data: data
  })
}

/**
 * 审批任务（驳回）
 * @param {String} id - 任务ID
 * @param {Object} data - 驳回数据 { comment, reason }
 * @returns {Promise}
 */
export function rejectTask(id, data) {
  return request({
    url: '/api/tasks/' + id + '/reject',
    method: 'post',
    data: data
  })
}

/**
 * 转办任务
 * @param {String} id - 任务ID
 * @param {Object} data - 转办数据 { assignee, comment }
 * @returns {Promise}
 */
export function delegateTask(id, data) {
  return request({
    url: '/api/tasks/' + id + '/delegate',
    method: 'post',
    data: data
  })
}

/**
 * 退回任务
 * @param {String} id - 任务ID
 * @param {Object} data - 退回数据 { comment }
 * @returns {Promise}
 */
export function returnTask(id, data) {
  return request({
    url: '/api/tasks/' + id + '/return',
    method: 'post',
    data: data
  })
}

/**
 * 查询任务历史
 * @param {String} instanceId - 实例ID
 * @returns {Promise}
 */
export function getTaskHistory(instanceId) {
  return request({
    url: '/api/tasks/' + instanceId + '/history',
    method: 'get'
  })
}

/**
 * 查询任务表单定义
 * @param {String} id - 任务ID
 * @returns {Promise}
 */
export function getTaskForm(id) {
  return request({
    url: '/api/tasks/' + id + '/form',
    method: 'get'
  })
}


/**
 * 创建任务
 * @param {Object} data - 任务数据 { instance_id, workflow_id, task_name, task_key, description, assignee, candidate_users, candidate_groups, priority }
 * @returns {Promise}
 */
export function createTask(data) {
  return request({
    url: '/api/tasks',
    method: 'post',
    data: data
  })
}

/**
 * 删除任务
 * @param {String} id - 任务ID
 * @returns {Promise}
 */
export function deleteTask(id) {
  return request({
    url: '/api/tasks/' + id,
    method: 'delete'
  })
}
