/**
 * Dashboard 工具函数
 */

/**
 * 千分位分隔符
 * @param {number|string} num
 * @returns {string}
 */
export function addThousandSeparator(num) {
  if (num === null || num === undefined) return '0'
  const str = String(num)
  const parts = str.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 格式化文件大小
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + units[i]
}

/**
 * 构建 ECharts tooltip 标题
 * @param {string} date
 * @returns {string}
 */
export function buildTooltipTitle(date) {
  return '<div style="font-weight:600;margin-bottom:4px;">' + escapeHtml(date) + '</div>'
}

/**
 * 构建 ECharts tooltip 行
 * @param {string} color - 色点颜色
 * @param {string} name - 系列名称
 * @param {string|number} value - 数值
 * @param {string} [unit=''] - 单位
 * @returns {string}
 */
export function buildTooltipRow(color, name, value, unit) {
  return (
    '<div style="display:flex;align-items:center;margin:2px 0;">' +
    '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + ';margin-right:6px;"></span>' +
    '<span style="flex:1;">' + escapeHtml(name) + '</span>' +
    '<span style="font-weight:600;margin-left:12px;">' + addThousandSeparator(value) + (unit ? ' ' + unit : '') + '</span>' +
    '</div>'
  )
}

/**
 * HTML 转义
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 截断文字
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncateText(str, maxLen) {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.substring(0, maxLen) + '...'
}
