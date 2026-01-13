import request from '@/utils/request'

export function refreshDistribution(data) {
  return request({
    url: '/api/v1/distribution/refresh',
    method: 'post',
    data
  })
}

export function getDistributionStatus() {
  return request({
    url: '/api/v1/distribution/status',
    method: 'get'
  })
}
