import request from '@/utils/request'

/** 上传文档到 file-storage-service */
export function uploadDocuments(formData) {
  return request({
    url: '/api/v1/documents',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时，支持大文件上传
  })
}
