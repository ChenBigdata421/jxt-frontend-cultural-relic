# 多租户域名配置设计

## 概述

本文档描述如何配置多个租户域名（如 `default.jxt.com`、`tenant2.jxt.com`、`tenant3.jxt.com`），实现每个域名对应一个独立租户。

## 需求

- 每个域名对应独立租户
- 使用 code 模式识别租户（子域名作为租户代码）
- 域名格式统一为 `*.jxt.com`
- 新增租户时无需修改 nginx 配置

## 架构

```
                    ┌─────────────────────┐
                    │     DNS 解析        │
                    │ *.jxt.com → IP      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Nginx         │
                    │ server_name: *.jxt.com │
                    │ proxy_pass backend  │
                    │ Host header: $host  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Backend Service   │
                    │   (Go Middleware)   │
                    │                     │
                    │  HTTPHostMode: code │
                    │  子域名 → 租户代码   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   ETCD Provider     │
                    │ codeIndex 查找      │
                    └─────────────────────┘
```

## Nginx 配置

### 文件位置

`deploy/dual-runtime/nginx/templates/dual-runtime.conf.template`

### 修改内容

第 72 行，将：

```nginx
server_name  ${BUSINESS_SERVER_NAME};
```

修改为：

```nginx
server_name  ${BUSINESS_SERVER_NAME} *.jxt.com;
```

### 匹配优先级说明

| 优先级 | 匹配类型 | 示例 |
|--------|----------|------|
| 1（最高） | 精确匹配 | `platform.jxt.com` |
| 2 | 前缀通配符 | `*.jxt.com` |

**结论**：`platform.jxt.com` 会精确匹配到平台站 server block，不会与业务站冲突。

## 后端租户识别配置

### ETCD 配置

**键**：`jxt/common/resolver`

**值**：
```json
{
  "httpType": "host",
  "httpHostMode": "code",
  "ftpType": "username"
}
```

### 租户元数据

每个租户在 ETCD 中的元数据必须包含 `code` 字段：

**键**：`jxt/tenants/{tenantId}/meta`

**值**：
```json
{
  "id": 1,
  "code": "default",
  "name": "默认租户",
  "status": "active"
}
```

### 识别流程

```
请求 tenant2.jxt.com
       ↓
    Nginx 透传 Host header
       ↓
    后端中间件提取子域名 "tenant2"
       ↓
    ETCD Provider 查找 codeIndex["tenant2"] → 租户ID
       ↓
    设置租户上下文，执行业务逻辑
```

## 子域名与租户对应关系

| 域名 | 子域名 | 租户代码 | 租户ID |
|------|--------|----------|--------|
| default.jxt.com | default | default | 1 |
| tenant2.jxt.com | tenant2 | tenant2 | 2 |
| tenant3.jxt.com | tenant3 | tenant3 | 3 |

**关键**：租户代码 = 子域名（DNS 不区分大小写，后端会转小写处理）

## 新增租户配置步骤

### 1. DNS 配置

添加 A 记录：
```
*.jxt.com  A  <服务器IP>
```

或单独配置每个租户域名。

### 2. 平台管理界面配置

访问 `platform.jxt.com` → 租户管理：

| 步骤 | 操作 | 字段示例 |
|------|------|----------|
| 1. 创建租户 | 设置租户代码 | `code: "tenant2"` |
| 2. 配置域名 | 设置主域名 | `primary: "tenant2.jxt.com"` |
| 3. 配置数据库 | 设置独立数据库 | MySQL/PostgreSQL 连接信息 |
| 4. 配置存储 | 设置 FTP/存储配额 | FTP 用户名、密码等 |
| 5. 激活租户 | 检查并激活 | 状态变为 `active` |

## 部署步骤

```bash
# 1. 修改 nginx 模板后重建容器
cd jxt-frontend/deploy/dual-runtime
docker-compose -f docker-compose.prod.yml up -d --build

# 2. 配置 ETCD resolver（通过 API 或 etcdctl）
etcdctl put jxt/common/resolver '{"httpType":"host","httpHostMode":"code","ftpType":"username"}'

# 3. 重启后端服务加载新配置
docker restart security-management evidence-command evidence-query
```

## 验证方法

```bash
# Nginx 配置验证
docker exec jxt-frontend-dual-1 nginx -t

# 检查 server_name 配置
docker exec jxt-frontend-dual-1 cat /etc/nginx/conf.d/default.conf | grep server_name

# 后端租户识别验证
curl -H "Host: default.jxt.com" http://localhost:8000/api/v1/health
curl -H "Host: tenant2.jxt.com" http://localhost:8000/api/v1/health

# ETCD 配置验证
etcdctl get jxt/common/resolver
etcdctl get jxt/tenants/1/meta
```

### 浏览器端到端测试

1. 访问 `http://default.jxt.com:8080` → 应加载默认租户
2. 访问 `http://tenant2.jxt.com:8080` → 应加载租户2
3. 访问 `http://platform.jxt.com:8080` → 应加载平台管理站

## 相关文件

| 文件 | 用途 |
|------|------|
| `deploy/dual-runtime/nginx/templates/dual-runtime.conf.template` | Nginx 配置模板 |
| `deploy/dual-runtime/docker-compose.prod.yml` | Docker Compose 配置 |
| `jxt-core/sdk/pkg/tenant/middleware/extract_tenant_id.go` | 租户ID提取中间件 |
| `jxt-core/sdk/pkg/tenant/provider/provider.go` | ETCD Provider（包含 codeIndex） |
| `tenant-service/tenant/domain/aggregate/tenant_resolver_config.go` | 租户识别配置聚合 |
| `tenant-service/tenant/domain/aggregate/tenant_domain_config.go` | 租户域名配置聚合 |
