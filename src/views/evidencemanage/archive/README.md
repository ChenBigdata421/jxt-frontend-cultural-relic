# 档案管理功能实现说明

## 📋 功能概述

档案管理模块用于管理各类执法档案，包括案件档案、证据档案、执法档案等。支持档案的创建、修改、删除、查询等完整的CRUD操作。

---

## 🔌 后端API接口

### 查询端（Query Service）- 端口 8002

#### 1. 分页查询档案列表
```
GET /api/v1/archives
```

**查询参数：**
- `archiveCode` (string) - 档案编码
- `archiveTitle` (string) - 档案标题
- `archiveType` (int) - 档案类型
- `orgId` (int) - 组织ID
- `orgCode` (string) - 组织编码
- `orgName` (string) - 组织名称
- `status` (int) - 状态
- `inputTimeStart` (string) - 录入开始时间
- `inputTimeEnd` (string) - 录入结束时间
- `expirationStart` (string) - 过期开始时间
- `expirationEnd` (string) - 过期结束时间
- `storageDuration` (int) - 保存期限
- `inputUserName` (string) - 录入人员
- `pageSize` (int) - 每页条数
- `pageIndex` (int) - 页码

**响应示例：**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "list": [
      {
        "archiveId": "550e8400-e29b-41d4-a716-446655440000",
        "archiveCode": "DA202510240001",
        "archiveTitle": "重要案件档案",
        "archiveType": 1,
        "description": "某重要案件的相关档案材料",
        "orgId": 1,
        "orgCode": "ORG001",
        "orgName": "市公安局",
        "orgJc": "市局",
        "storageDuration": 120,
        "expirationTime": "2035-10-24T10:00:00Z",
        "status": 0,
        "remarks": "需要长期保存",
        "createUserName": "张三",
        "createUserNo": "001",
        "createdAt": "2025-10-24T10:00:00Z",
        "updateUserName": "李四",
        "updateUserNo": "002",
        "updatedAt": "2025-10-24T11:00:00Z"
      }
    ],
    "total": 100
  }
}
```

#### 2. 根据ID查询档案详情
```
GET /api/v1/archives/:id
```

**路径参数：**
- `id` (string, UUID) - 档案ID

#### 3. 根据编码查询档案
```
GET /api/v1/archives/code/:code
```

**路径参数：**
- `code` (string) - 档案编码

---

### 命令端（Command Service）- 端口 8001

#### 1. 创建档案
```
POST /api/v1/archives
```

**请求体：**
```json
{
  "archiveTitle": "重要案件档案",
  "archiveType": 1,
  "description": "某重要案件的相关档案材料",
  "storageDuration": 120,
  "remarks": "需要长期保存"
}
```

**必填字段：**
- `archiveTitle` (string) - 档案标题
- `archiveType` (int) - 档案类型

**响应示例：**
```json
{
  "code": 200,
  "msg": "创建档案成功",
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 2. 更新档案
```
PUT /api/v1/archives/:id
```

**路径参数：**
- `id` (string, UUID) - 档案ID

**请求体：**
```json
{
  "archiveTitle": "更新后的档案标题",
  "archiveType": 2,
  "description": "更新后的档案描述",
  "storageDuration": 180,
  "remarks": "修改备注信息"
}
```

#### 3. 删除档案
```
DELETE /api/v1/archives/:id
```

**路径参数：**
- `id` (string, UUID) - 档案ID

#### 4. 批量删除档案
```
POST /api/v1/archives/batch/delete
```

**请求体：**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

#### 5. 批量更新档案
```
POST /api/v1/archives/batch/update
```

**请求体：**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "archiveType": 2,
  "storageDuration": 240,
  "status": 0,
  "remarks": "批量更新备注"
}
```

#### 6. 批量更新档案状态
```
POST /api/v1/archives/batch/status
```

**请求体：**
```json
{
  "ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "status": 1
}
```

---

## 📊 数据字段说明

### 档案字段

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| archiveId | UUID | 档案ID | 自动生成 |
| archiveCode | string | 档案编号 | 自动生成 |
| archiveTitle | string | 档案标题 | 是 |
| archiveType | int | 档案类型 | 是 |
| description | string | 档案描述 | 否 |
| orgId | int | 管理部门ID | 自动获取 |
| orgCode | string | 管理部门编码 | 自动填充 |
| orgName | string | 管理部门名称 | 自动填充 |
| orgJc | string | 管理部门简称 | 自动填充 |
| storageDuration | int | 保存期限(月) | 否 |
| expirationTime | datetime | 过期时间 | 自动计算 |
| status | int | 档案状态 | 默认0 |
| remarks | string | 备注信息 | 否 |
| createUserName | string | 创建人名称 | 自动填充 |
| createUserNo | string | 创建人编号 | 自动填充 |
| updateUserName | string | 更新人名称 | 自动填充 |
| updateUserNo | string | 更新人编号 | 自动填充 |
| createdAt | datetime | 创建时间 | 自动生成 |
| updatedAt | datetime | 更新时间 | 自动更新 |

### 档案类型枚举

| 值 | 说明 |
|----|------|
| 1 | 案件档案 |
| 2 | 证据档案 |
| 3 | 执法档案 |
| 4 | 其他档案 |

### 档案状态枚举

| 值 | 说明 | 标签颜色 |
|----|------|----------|
| 0 | 正常 | success (绿色) |
| 1 | 异常 | danger (红色) |
| 2 | 其他 | info (灰色) |

---

## 🎨 前端实现

### 文件结构

```
src/
├── api/
│   └── evidence/
│       └── archive_api.js          # 档案API接口
└── views/
    └── evidencemanage/
        └── archive/
            ├── index.vue            # 档案管理主页面
            └── README.md            # 本文档
```

### 主要功能

1. **列表查询**
   - 支持多条件组合查询
   - 分页显示
   - 排序功能

2. **新增档案**
   - 表单验证
   - 必填字段检查

3. **修改档案**
   - 单条修改
   - 批量修改

4. **删除档案**
   - 单条删除
   - 批量删除
   - 删除确认

5. **查看详情**
   - 完整信息展示
   - 格式化显示

6. **导出功能**
   - 待实现

---

## 🔧 配置说明

### Nginx路由配置

需要在 `nginx.conf` 中添加档案路由映射：

```nginx
# 档案路由映射
map $request_method $archives_backend {
    GET     http://evidence-query:8002;
    default http://evidence-command:8001;
}
```

在 `server` 块中添加：

```nginx
# 档案API路由
location ~ ^/api/v1/archives {
    proxy_pass $archives_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 权限配置

需要在系统中配置以下权限：

- `archive:create` - 创建档案
- `archive:edit` - 修改档案
- `archive:remove` - 删除档案
- `archive:view` - 查看档案详情
- `archive:export` - 导出档案

---

## 📝 使用说明

### 1. 访问页面

在菜单中添加档案管理菜单项，路由路径为：`/evidencemanage/archive`

### 2. 查询档案

- 在查询表单中输入查询条件
- 点击"搜索"按钮执行查询
- 点击"重置"按钮清空查询条件

### 3. 新增档案

- 点击"新增"按钮
- 填写档案信息
- 点击"确定"提交

### 4. 修改档案

- 选中一条记录，点击"修改"按钮
- 或点击操作列的"修改"按钮
- 修改档案信息
- 点击"确定"提交

### 5. 删除档案

- 选中一条或多条记录，点击"删除"按钮
- 或点击操作列的"删除"按钮
- 确认删除操作

### 6. 查看详情

- 点击操作列的"详情"按钮
- 查看档案完整信息

---

## ⚠️ 注意事项

1. **ID格式**：档案ID使用UUID格式，不是整数
2. **组织信息**：创建档案时，组织ID会自动从JWT token中获取
3. **档案编号**：档案编号由后端自动生成，无需手动输入
4. **过期时间**：根据保存期限自动计算
5. **软删除**：删除操作为软删除，数据不会真正删除
6. **CQRS架构**：读写分离，查询和命令使用不同的服务

---

## 🚀 后续优化

1. 实现导出功能
2. 添加档案关联媒体功能
3. 添加档案审批流程
4. 添加档案借阅功能
5. 添加档案统计报表

