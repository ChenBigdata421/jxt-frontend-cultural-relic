import request from "@/utils/request";

export function listTenants(query) {
  return request({
    url: "/api/v1/tenants",
    method: "get",
    params: query,
  });
}

export function getTenant(id) {
  return request({
    url: `/api/v1/tenants/${id}`,
    method: "get",
  });
}

export function createTenant(data) {
  return request({
    url: "/api/v1/tenants",
    method: "post",
    data,
  });
}

export function updateTenant(id, data) {
  return request({
    url: `/api/v1/tenants/${id}`,
    method: "put",
    data,
  });
}

export function deleteTenants(data) {
  return request({
    url: "/api/v1/tenants",
    method: "delete",
    data,
  });
}

export function updateTenantStatus(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/status`,
    method: "put",
    data,
  });
}

export function getTenantByHost(host) {
  return request({
    url: "/api/v1/tenants/host",
    method: "get",
    params: { host },
  });
}

export function getTenantDomain(id) {
  return request({
    url: `/api/v1/tenants/${id}/domain`,
    method: "get",
  });
}

export function updateTenantDomain(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/domain`,
    method: "put",
    data,
  });
}

export function getTenantDatabase(id) {
  return request({
    url: `/api/v1/tenants/${id}/database`,
    method: "get",
  });
}

export function updateTenantDatabase(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/database`,
    method: "put",
    data,
  });
}

export function getTenantFtp(id) {
  return request({
    url: `/api/v1/tenants/${id}/ftp`,
    method: "get",
  });
}

export function updateTenantFtp(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/ftp`,
    method: "put",
    data,
  });
}

export function getTenantStorage(id) {
  return request({
    url: `/api/v1/tenants/${id}/storage`,
    method: "get",
  });
}

export function updateTenantStorage(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/storage`,
    method: "put",
    data,
  });
}

export function getTenantPrecheck(id) {
  return request({
    url: `/api/v1/tenants/${id}/precheck`,
    method: "get",
  });
}

// 新增：更新租户编码
export function updateTenantCode(id, code) {
  return request({
    url: `/api/v1/tenants/${id}/code`,
    method: "put",
    data: { code },
  });
}

// 新增：通过编码获取租户
export function getTenantByCode(code) {
  return request({
    url: `/api/v1/tenants/by-code/${code}`,
    method: "get",
  });
}

// ============================================
// Service-Level Database Configuration APIs
// 新架构：每个微服务独立配置数据库
// ============================================

// 获取租户的所有服务数据库配置
export function getTenantServiceConfigs(id) {
  return request({
    url: `/api/v1/tenants/${id}/service-configs`,
    method: "get",
  });
}

// 获取指定服务的数据库配置
export function getTenantServiceConfig(id, serviceCode) {
  return request({
    url: `/api/v1/tenants/${id}/service-configs/${serviceCode}`,
    method: "get",
  });
}

// 更新指定服务的数据库配置
export function updateTenantServiceConfig(id, serviceCode, data) {
  return request({
    url: `/api/v1/tenants/${id}/service-configs/${serviceCode}`,
    method: "put",
    data,
  });
}

// 批量创建服务数据库配置（支持创建多个服务配置）
export function createTenantServiceConfigs(data) {
  return request({
    url: `/api/v1/tenants/${data.tenantId}/service-configs`,
    method: "post",
    data,
  });
}

// 创建指定服务的数据库配置（单个，已弃用，保留兼容性）
export function createTenantServiceConfig(id, serviceCode, data) {
  return request({
    url: `/api/v1/tenants/${id}/service-configs/${serviceCode}`,
    method: "post",
    data,
  });
}

// 删除指定服务的数据库配置
export function deleteTenantServiceConfig(id, serviceCode) {
  return request({
    url: `/api/v1/tenants/${id}/service-configs/${serviceCode}`,
    method: "delete",
  });
}

// ============================================
// Multi FTP Configuration APIs
// 每个租户可配置多个 FTP 账号
// ============================================

// 获取租户的所有 FTP 配置列表
export function listTenantFtpConfigs(id) {
  return request({
    url: `/api/v1/tenants/${id}/ftp`,
    method: "get",
  });
}

// 创建新的 FTP 配置
export function createTenantFtpConfig(id, data) {
  return request({
    url: `/api/v1/tenants/${id}/ftp`,
    method: "post",
    data,
  });
}

// 获取单个 FTP 配置详情
export function getTenantFtpConfig(id, ftpId) {
  return request({
    url: `/api/v1/tenants/${id}/ftp/${ftpId}`,
    method: "get",
  });
}

// 更新 FTP 配置
export function updateTenantFtpConfig(id, ftpId, data) {
  return request({
    url: `/api/v1/tenants/${id}/ftp/${ftpId}`,
    method: "put",
    data,
  });
}

// 删除 FTP 配置
export function deleteTenantFtpConfig(id, ftpId) {
  return request({
    url: `/api/v1/tenants/${id}/ftp/${ftpId}`,
    method: "delete",
  });
}

// 测试 FTP 配置连接
export function testTenantFtpConfig(id, ftpId) {
  return request({
    url: `/api/v1/tenants/${id}/ftp/${ftpId}/test`,
    method: "post",
  });
}
