import request from '@/utils/request'

/**
 * 获取仪表盘概览数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getDashboardOverview(params) {
  return request({
    url: '/api/v1/dashboard/overview',
    method: 'get',
    params: params
  })
}
