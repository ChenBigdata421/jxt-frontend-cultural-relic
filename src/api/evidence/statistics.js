import request from '@/utils/request'

/**
 * 统计分析 API 模块
 * 对应后端设计：2026-05-17-statistics-analysis-design.md
 * 前端设计：2026-05-19-statistics-analysis-frontend-design.md
 */

// ==================== 仪表盘 ====================

/**
 * 获取统计分析仪表盘数据
 * @param {Object} params - { view: 'admin'|'officer'|'auditor', days: 7|30|90 }
 * @returns {Promise}
 */
export function getStatisticsDashboard(params) {
  return request({
    url: '/api/v1/statistics/dashboard',
    method: 'get',
    params: params
  })
}

// ==================== 机构采集统计 ====================

/**
 * 获取机构采集统计数据
 * @param {Object} params - { startDate, endDate, orgIds, metric, dimension }
 *   metric: 'media_count'(默认) | 'file_size_sum' | 'video_duration' | 'audio_duration'
 *   dimension: '' | 'media_cate' | 'enforcement_type' | 'important_level'
 * @returns {Promise}
 */
export function getOrgCollectStats(params) {
  return request({
    url: '/api/v1/statistics/org-collect',
    method: 'get',
    params: params
  })
}

// ==================== 警员采集统计 ====================

/**
 * 获取警员采集统计数据
 * @param {Object} params - { startDate, endDate, policeIds, orgIds, metric, dimension }
 *   metric: 'media_count'(默认) | 'file_size_sum' | 'video_duration' | 'audio_duration'
 *   dimension: '' | 'media_cate' | 'enforcement_type' | 'important_level'
 * @returns {Promise}
 */
export function getOfficerCollectStats(params) {
  return request({
    url: '/api/v1/statistics/officer-collect',
    method: 'get',
    params: params
  })
}

// ==================== 采集趋势统计 ====================

/**
 * 获取采集趋势统计数据
 * @param {Object} params - { startDate, endDate, orgIds, metric, dimension, granularity }
 *   metric: 'media_count'(默认) | 'file_size_sum' | 'video_duration' | 'audio_duration'
 *   dimension: '' | 'media_cate' | 'enforcement_type' | 'important_level'
 *   granularity: 'day'(默认) | 'week' | 'month' | 'quarter' | 'year'
 * @returns {Promise}
 */
export function getTrendCollectStats(params) {
  return request({
    url: '/api/v1/statistics/trend-collect',
    method: 'get',
    params: params
  })
}

// ==================== 设备采集统计 ====================

/**
 * 获取设备采集统计数据
 * @param {Object} params - { startDate, endDate, orgIds, recorderNo, metric, dimension }
 *   metric: 'media_count'(默认) | 'file_size_sum' | 'video_duration' | 'audio_duration'
 *   dimension: '' | 'media_cate' | 'enforcement_type' | 'important_level'
 * @returns {Promise}
 */
export function getDeviceCollectStats(params) {
  return request({
    url: '/api/v1/statistics/device-collect',
    method: 'get',
    params: params
  })
}

// ==================== 警员关联统计 ====================

/**
 * 获取警员关联统计数据
 * @param {Object} params - { startDate, endDate, orgIds, policeIds, metric }
 *   metric: 'task_relation_rate'(默认) | 'case_relation_rate' | 'alarm_relation_rate'
 * @returns {Promise}
 */
export function getOfficerRelationStats(params) {
  return request({
    url: '/api/v1/statistics/officer-relation',
    method: 'get',
    params: params
  })
}

// ==================== 机构关联统计 ====================

/**
 * 获取机构关联统计数据
 * @param {Object} params - { startDate, endDate, orgIds, metric }
 *   metric: 'task_relation_rate'(默认) | 'case_relation_rate' | 'alarm_relation_rate'
 * @returns {Promise}
 */
export function getOrgRelationStats(params) {
  return request({
    url: '/api/v1/statistics/org-relation',
    method: 'get',
    params: params
  })
}

// ==================== 警员归档统计 ====================

/**
 * 获取警员归档统计数据
 * @param {Object} params - { startDate, endDate, orgIds, policeIds, metric }
 *   metric: 'archive_rate'(默认)
 * @returns {Promise}
 */
export function getOfficerArchiveStats(params) {
  return request({
    url: '/api/v1/statistics/officer-archive',
    method: 'get',
    params: params
  })
}

// ==================== 机构归档统计 ====================

/**
 * 获取机构归档统计数据
 * @param {Object} params - { startDate, endDate, orgIds, metric }
 *   metric: 'archive_rate'(默认)
 * @returns {Promise}
 */
export function getOrgArchiveStats(params) {
  return request({
    url: '/api/v1/statistics/org-archive',
    method: 'get',
    params: params
  })
}

// ==================== 媒体分布统计 ====================

/**
 * 获取媒体分布统计数据（环形图）
 * @param {Object} params - { startDate, endDate, orgIds, metric, dimension }
 *   metric: 'media_count'(默认) | 'file_size_sum'
 *   dimension: 'media_cate'(默认) | 'enforcement_type' | 'important_level'
 * @returns {Promise}
 */
export function getMediaDistributionStats(params) {
  return request({
    url: '/api/v1/statistics/media-distribution',
    method: 'get',
    params: params
  })
}

// ==================== 告警 ====================

/**
 * 告警列表查询
 * @param {Object} params - { severity, status, orgId, keyword, pageIndex, pageSize }
 * @returns {Promise}
 */
export function listAlerts(params) {
  return request({
    url: '/api/v1/statistics/alerts',
    method: 'get',
    params: params
  })
}

/**
 * 获取告警详情
 * @param {string|number} id
 * @returns {Promise}
 */
export function getAlert(id) {
  return request({
    url: `/api/v1/statistics/alerts/${id}`,
    method: 'get'
  })
}

/**
 * 确认告警
 * @param {string|number} id
 * @returns {Promise}
 */
export function acknowledgeAlert(id) {
  return request({
    url: `/api/v1/statistics/alerts/${id}/acknowledge`,
    method: 'put'
  })
}

/**
 * 解决告警
 * @param {string|number} id
 * @returns {Promise}
 */
export function resolveAlert(id) {
  return request({
    url: `/api/v1/statistics/alerts/${id}/resolve`,
    method: 'put'
  })
}

/**
 * 告警规则列表
 * @returns {Promise}
 */
export function listAlertRules() {
  return request({
    url: '/api/v1/statistics/alerts/rules',
    method: 'get'
  })
}

/**
 * 更新告警规则
 * @param {string|number} id
 * @param {Object} data - { thresholdValue, enabled }
 * @returns {Promise}
 */
export function updateAlertRule(id, data) {
  return request({
    url: `/api/v1/statistics/alerts/rules/${id}`,
    method: 'put',
    data: data
  })
}

// ==================== 导出 ====================

/**
 * 查询导出任务状态
 * @param {string} taskId
 * @returns {Promise}
 */
export function getExportStatus(taskId) {
  return request({
    url: `/api/v1/statistics/exports/${taskId}/status`,
    method: 'get'
  })
}

/**
 * 下载导出文件
 * @param {string} taskId
 * @returns {Promise<Blob>}
 */
export function downloadExport(taskId) {
  return request({
    url: `/api/v1/statistics/exports/${taskId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导出历史列表
 * @param {Object} params - { pageIndex, pageSize }
 * @returns {Promise}
 */
export function getExportHistory(params) {
  return request({
    url: '/api/v1/statistics/exports/history',
    method: 'get',
    params: params
  })
}
