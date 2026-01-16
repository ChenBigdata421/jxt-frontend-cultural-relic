# JXT Frontend - 双运行时架构

JXT 数字证据管理系统的前端项目，采用 **双运行时架构**，支持平台管控站和业务管理站两种运行模式。

## 架构说明

### 双运行时架构

本项目采用单一代码库、两次构建的方式，通过构建时环境变量 `VUE_APP_MODE` 区分两种运行模式：

| 运行模式 | 域名 | 用途 | 后端服务 |
|---------|------|------|---------|
| **Platform** | `platform.jxt.com` | 租户管理站 | tenant-service:8010 |
| **Business** | `app.jxt.com` | 业务管理站 | security-management:8000 + 微服务集群 |

### 构建时差异

两种模式的差异在构建时确定：

```javascript
// 配置键名映射
Platform: console_app_name, console_app_logo
Business:  sys_app_name, sys_app_logo

// API 端点映射
Platform: /api/v1/configs/frontend
Business: /api/v1/app-config
```

## 目录结构

```
jxt-frontend/
├── deploy/                    # 部署配置
│   └── dual-runtime/         # 双运行时部署
│       ├── Dockerfile.dual-runtime
│       ├── docker-compose.prod.yml
│       └── nginx/            # Nginx 配置
│           ├── nginx.conf    # 主配置（DNS resolver + backend maps）
│           └── conf.d/
│               └── dual-runtime.conf  # 路由配置
├── public/                   # 静态资源
├── src/                      # 源代码
│   ├── api/                 # API 接口定义
│   ├── assets/              # 资源文件
│   ├── components/          # 组件
│   ├── layout/              # 布局组件
│   ├── router/              # 路由配置
│   ├── store/               # Vuex 状态管理
│   ├── utils/               # 工具函数
│   └── views/               # 页面视图
├── package.json
└── README.Zh-cn.md
```

## 本地开发

### 环境要求

- Node.js: v14.16.0+
- npm: 6.14.11+

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
# 启动开发服务器（默认为业务模式）
npm run dev

# 如需测试平台模式，可设置环境变量
VUE_APP_MODE=platform npm run dev
```

访问地址：http://localhost:8080

## Docker 部署

### 构建镜像

项目使用 `Dockerfile.dual-runtime` 进行多阶段构建，同时生成平台站和业务站的静态资源：

```bash
cd deploy/dual-runtime
docker-compose -f docker-compose.prod.yml build
```

### 启动服务

```bash
# 启动前端服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 环境变量配置

在 `docker-compose.prod.yml` 中可配置以下环境变量：

| 变量名 | 说明 | 默认值 |
|-------|------|-------|
| `PLATFORM_SERVER_NAME` | 平台站域名 | `platform.jxt.com` |
| `BUSINESS_SERVER_NAME` | 业务站域名 | `app.jxt.com` |
| `PLATFORM_UPSTREAM` | 租户站后端地址 | `http://tenant-service:8010` |
| `SECURITY_MANAGEMENT_UPSTREAM` | 安全管理后端地址 | `http://security-management:8000` |
| `EVIDENCE_QUERY_UPSTREAM` | 证据查询服务地址 | `http://evidence-query:8002` |
| `EVIDENCE_COMMAND_UPSTREAM` | 证据命令服务地址 | `http://evidence-command:8001` |
| `PROCESS_MANAGEMENT_UPSTREAM` | 流程管理服务地址 | `http://process-management-api:8003` |
| `FILE_STORAGE_UPSTREAM` | 文件存储服务地址 | `http://file-storage-service:8004` |

## Nginx 路由配置

### CQRS 读写分离路由

业务站的证据管理 API 采用 CQRS 模式，根据 HTTP 请求方法路由到不同服务：

```nginx
# GET 请求 -> Query 服务（只读）
# POST/PUT/DELETE -> Command 服务（写入）

map $request_method $media_backend {
    GET     http://evidence-query:8002;
    default http://evidence-command:8001;
}
```

### API 路由表

| API 路径 | GET 路由到 | 其他方法路由到 |
|---------|-----------|--------------|
| `/api/v1/media` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/archives` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/cases` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/writs` | evidence-query:8002 | evidence-command:8001 |
| `/api/workflows` | process-management-api:8003 | process-management-api:8003 |
| `/api/v1/documents` | file-storage-service:8004 | file-storage-service:8004 |
| `/api/*` (其他) | security-management:8000 | security-management:8000 |

## 配置键名适配

### Platform 模式

```javascript
// 前端代码根据 VUE_APP_MODE 选择配置键
computed: {
  appName() {
    return this.sysInfo.console_app_name || '平台管控'
  },
  logoUrl() {
    return this.sysInfo.console_app_logo || ''
  }
}
```

### Business 模式

```javascript
computed: {
  appName() {
    return this.sysInfo.sys_app_name || '业务管理'
  },
  logoUrl() {
    return this.sysInfo.sys_app_logo || ''
  }
}
```

## 访问地址

部署完成后，通过以下地址访问：

- **平台管控站**: http://platform.jxt.com:8080
- **业务管理站**: http://app.jxt.com:8080

## 常见问题

### 1. Logo 图片不显示

确保后端配置的 logo 路径为 `/static/uploadfile/logo.png`，且 Nginx 已配置 `/static/uploadfile` 代理规则。

### 2. API 请求 404

检查：
- Nginx 配置中是否包含对应的 `location` 规则
- 后端服务是否正常运行
- DNS 解析是否正常（`resolver 127.0.0.11`）

### 3. 配置键名不匹配

确认前端 `src/api/login.js` 中的 API 端点与后端实际路由一致：
- Platform: `/api/v1/configs/frontend`
- Business: `/api/v1/app-config`

## 相关项目

- [tenant-service](../tenant-service) - 租户管理后端服务
- [security-management](../security-management) - 安全管理后端服务
- [evidence-management](../evidence-management) - 证据管理微服务
- [file-storage-service](../file-storage-service) - 文件存储服务
- [infrastructure](../infrastructure) - 共享基础设施（etcd, RedPanda）

## License

Copyright (c) 2020-2025 JXT Team
