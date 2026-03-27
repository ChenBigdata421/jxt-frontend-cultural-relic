import storage from '@/utils/storage'

export default function getPageTitle(pageTitle) {
  const app_info = storage.get('app_info')

  let title = 'go-admin 后台管理系统'
  if (app_info) {
    // 根据构建模式选择系统名称键名
    if (process.env.VUE_APP_MODE === 'platform') {
      title = app_info.console_app_name || '平台管控'
    } else {
      title = app_info.sys_app_name || '业务管理'
    }
  }

  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
