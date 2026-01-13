# 成品前端镜像（platform + business 双站）交付说明

## 1. 你要交付给客户什么

- **一个镜像**：`jxt-frontend-dual-nginx:<版本号>`
- （建议同时交付）一个客户侧启动文件：`deploy/dual-runtime/docker-compose.prod.yml`

> 客户环境不需要 npm、不需要源码、不需要 builder。

---

## 2. 你这边怎么构建成品镜像

在 `jxt-frontend` 目录执行（示例）：

```bash
# 构建一个同时包含 platform + business 两套 dist 的 nginx 镜像
# 注意：本项目各 API 模块的 url 已显式写成 /api/v1/...，因此构建注入的 PLATFORM_BASE_API / BUSINESS_BASE_API
#       必须使用 /（或空前缀），否则会出现 /api/v1/api/v1/... 导致 404

docker build -f deploy/dual-runtime/Dockerfile.dual-runtime \
  --build-arg PLATFORM_BASE_API=/ \
  --build-arg BUSINESS_BASE_API=/ \
  --build-arg PLATFORM_TITLE=平台管控 \
  --build-arg BUSINESS_TITLE=业务管理 \
  -t jxt-frontend-dual-nginx:latest .
```

> 如果客户侧一定要 https，请在客户的网关/反向代理层处理 TLS，或在此镜像上扩展 443 与证书挂载。

---

## 3. 客户侧怎么部署

### 3.1 在线仓库方式
- 你推送镜像到客户 Harbor（或你们的交付仓库）
- 客户 `docker pull ...` 然后 `docker compose up -d`

### 3.2 离线交付方式
在你这边导出：

```bash
docker save jxt-frontend-dual-nginx:latest -o jxt-frontend-dual-nginx_latest.tar
```

客户导入：

```bash
docker load -i jxt-frontend-dual-nginx_latest.tar
```

然后在客户机器执行：

```bash
docker compose -f deploy/dual-runtime/docker-compose.prod.yml up -d
```

---

## 3.1 同一个镜像适配不同客户环境（关键点）

本镜像采用 **Nginx 配置模板 + 启动时渲染** 的方式：

- 模板文件：`deploy/dual-runtime/nginx/templates/dual-runtime.conf.template`
- 镜像启动时，Nginx 官方镜像的入口脚本会对 `/etc/nginx/templates/*.template` 执行 `envsubst`，生成最终配置到 `/etc/nginx/conf.d/`。

因此：
- **镜像只需要构建一次**
- 不同客户只需要在 `docker-compose.prod.yml` 里设置不同的环境变量即可

客户需要配置的环境变量如下（见 `deploy/dual-runtime/docker-compose.prod.yml`）：

- `PLATFORM_SERVER_NAME`
  - 平台站域名（Nginx `server_name`）
- `BUSINESS_SERVER_NAME`
  - 业务站域名（Nginx `server_name`）

- `PLATFORM_UPSTREAM`
  - 平台站 `/api/v1/` 代理上游（必须带协议，如 `http://10.0.0.10:8010` 或 `http://platform-control-service:8010`）

- `SECURITY_MANAGEMENT_UPSTREAM`
  - 业务站 `/api` 与 `/static/uploadfile` 兜底上游（必须带协议，如 `http://10.0.0.11:8000` 或 `http://security-management:8000`）

- `EVIDENCE_QUERY_UPSTREAM`
  - 业务站 GET 请求分流上游（默认 query，必须带协议，如 `http://evidence-query:8002`）
- `EVIDENCE_COMMAND_UPSTREAM`
  - 业务站非 GET 请求分流上游（默认 command，必须带协议，如 `http://evidence-command:8001`）

- `PROCESS_MANAGEMENT_UPSTREAM`
  - 业务站流程管理上游（必须带协议，如 `http://process-management-api:8003`）
- `FILE_STORAGE_UPSTREAM`
  - 业务站文件存储上游（必须带协议，如 `http://file-storage-service:8004`）

---

## 4. Nginx 反代与网络要求

本镜像默认采用"**容器名/服务名解析**"的方式作为上游（例如 `http://security-management:8000`）。

因此客户侧有两种部署方式：

1. **统一 Docker 网络（推荐）**
   - 前端 nginx 容器与各后端容器加入同一个 docker network（例如 external network：`jxt-web`）
   - 上游用 `http://服务名:端口`（最符合 compose 使用习惯）

2. **上游改为 IP/域名（最通用）**
   - 如果客户后端不在同一个 docker network，或不使用 docker 部署后端
   - 直接将上游变量配置为 `http://IP:端口` 或 `http://域名:端口`

> 注意：本镜像不再写死域名/后端地址，均推荐通过环境变量配置（见 3.1）。

---

## 5. 基础设施服务依赖

本前端镜像依赖以下共享基础设施服务：

### 5.1 ETCD（服务发现）

- **容器名**: `jxt-etcd`
- **端口**: 2379（客户端）, 2380（节点通信）
- **用途**: 服务注册与发现
- **网络**: 必须与前端容器在同一网络

### 5.2 RedPanda（事件总线）

- **容器名**: `jxt-redpanda`
- **端口**: 9092（Kafka API）, 8082（HTTP Proxy）
- **用途**: 事件驱动架构的消息队列
- **网络**: 必须与前端容器在同一网络

### 5.3 启动顺序

重要：必须先启动基础设施服务，再启动业务服务：

```bash
# 1. 启动基础设施
cd infrastructure
docker-compose up -d

# 2. 等待基础设施就绪后，启动各业务服务
cd security-management && docker-compose up -d
cd platform-control-service && docker-compose up -d
cd evidence-management && docker-compose up -d
cd file-storage-service && docker-compose up -d

# 3. 最后启动前端
cd jxt-frontend/deploy/dual-runtime
docker-compose -f docker-compose.prod.yml up -d
```

---

## 6. Nginx 配置说明

### 6.1 配置文件结构

```
/etc/nginx/
├── nginx.conf              # 主配置（DNS resolver + backend maps）
└── conf.d/
    └── dual-runtime.conf   # 路由配置（platform + business server）
```

### 6.2 DNS 解析配置

`nginx.conf` 中包含关键的 DNS 解析器配置：

```nginx
resolver 127.0.0.11 valid=30s;
resolver_timeout 10s;
```

- `127.0.0.11` 是 Docker 内置 DNS 服务器
- 用于解析容器名到 IP 地址

### 6.3 Backend Map 定义

所有 CQRS 后端映射都在 `nginx.conf` 中定义：

```nginx
map $request_method $media_backend {
    GET     http://evidence-query:8002;
    default http://evidence-command:8001;
}
```

这些映射使业务站能够根据 HTTP 方法路由请求到正确的服务。

### 6.4 路由优先级

业务站的路由匹配优先级（从高到低）：

1. 精确匹配：`location ^~ /api/v1/media`
2. 前缀匹配：`location /api`
3. 兜底路由：`location /`

---

## 7. 常见问题与排查

### 7.1 浏览器访问失败（但命令行可访问）

现象：浏览器提示"未发送任何数据"等，但用命令行测试（例如 `Invoke-WebRequest`）是 200。

优先检查：

- **浏览器/系统代理**：将以下域名与地址加入"直连/不走代理"
  - `platform.xxx.com`
  - `app.xxx.com`
  - `127.0.0.1`
  - `localhost`

### 7.2 API 请求返回 "no resolver defined to resolve xxx"

现象：Nginx 错误日志显示 `no resolver defined to resolve evidence-query`。

原因：`nginx.conf` 中缺少 DNS 解析器配置。

解决：
- 确认 `nginx.conf` 包含：`resolver 127.0.0.11 valid=30s;`
- 重新构建镜像并重启容器

### 7.3 Windows 本机测试时 `host.docker.internal` 在容器里解析失败

现象：Nginx 启动报错 `host not found in upstream "host.docker.internal"`。

说明：Linux 容器里默认不一定能解析 `host.docker.internal`。

解决：

- 本机临时测试启动容器时加：
  - `--add-host=host.docker.internal:host-gateway`

生产环境建议：

- 前端 nginx 与后端加入同一个 docker network，直接用 `http://服务名:端口`

### 7.4 Nginx 模板渲染（envsubst）与 `$` 变量

说明：Nginx 配置里有大量 `$host/$uri/$request_method` 等变量。

为避免被 `envsubst` 错误替换，模板使用 `${DOLLAR}host` 这种写法，并要求运行时传入：

- `DOLLAR=$`

### 7.5 Logo 图片不显示

现象：平台站或业务站登录页面 logo 不显示。

检查：

1. 数据库配置中的 logo 路径是否为 `/static/uploadfile/logo.png`
2. 后端服务是否正常提供静态文件服务
3. Nginx 配置中是否包含 `/static/uploadfile` 代理规则
4. 静态文件是否已上传到后端的 `static/uploadfile/` 目录

### 7.6 Windows 下用 curl 调接口时 JSON body 被截断

现象：后端返回 `参数错误`，抓包发现请求体只剩 `}`（例如 `Content-Length: 2`）。

建议：

- 在 Windows 上联调写接口优先使用 PowerShell：`Invoke-RestMethod`/`Invoke-WebRequest`

### 7.7 租户创建 quotaJson 必须是合法 JSON

说明：租户表的 `quota_json` 是 JSON 类型字段。

创建租户时如果传空字符串会导致 PostgreSQL 报错：

- `invalid input syntax for type json (SQLSTATE 22P02)`

建议创建时至少传：

- `"quotaJson": "{}"`

---

## 8. 版本历史

### v1.1.0 (当前版本)

**新增**：
- 添加完整的 DNS resolver 配置
- 添加 12 个 CQRS backend map 定义
- 完善业务站 API 路由配置
- 添加平台站 `/static/uploadfile` 代理规则
- 更新部署文档，补充基础设施服务说明

**修复**：
- 修复 API 请求 404 问题（no resolver defined）
- 修复平台站 logo 不显示问题

### v1.0.0

**初始版本**：
- 双运行时架构（Platform + Business）
- 基于 Docker Compose 的部署方式
- 环境变量配置支持
