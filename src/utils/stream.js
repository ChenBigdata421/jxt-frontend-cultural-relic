/**
 * 从 streamInfo 对象中选择合适的流 URL。
 * 优先使用 wss_flv（HTTPS 环境），回退到 ws_flv。
 * @param {Object} streamInfo - 后端返回的流信息对象
 * @returns {string|null} 流 URL，如果无可用流则返回 null
 */
export function handleStreamResponse(streamInfo) {
  if (!streamInfo) return null
  if (location.protocol === 'https:') {
    return streamInfo.wss_flv || null
  }
  return streamInfo.ws_flv || null
}
