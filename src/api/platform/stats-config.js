import request from '@/utils/request'

/**
 * 获取统计分析配置
 * @returns {Promise}
 */
export function getStatsConfig() {
  return request({
    url: '/api/v1/statistics/config',
    method: 'get'
  })
}

/**
 * 更新统计分析配置
 * @param {Object} data - 配置对象
 * @returns {Promise}
 */
export function updateStatsConfig(data) {
  return request({
    url: '/api/v1/statistics/config',
    method: 'put',
    data: data
  })
}

/**
 * 手动触发统计预聚合刷新
 * @param {Object} data - { startDate, endDate }
 * @returns {Promise}
 */
export function triggerStatsRefresh(data) {
  return request({
    url: '/api/v1/statistics/refresh',
    method: 'post',
    data: data
  })
}

/**
 * 获取手动刷新状态
 * @returns {Promise}
 */
export function getRefreshStatus() {
  return request({
    url: '/api/v1/statistics/refresh/status',
    method: 'get'
  })
}
