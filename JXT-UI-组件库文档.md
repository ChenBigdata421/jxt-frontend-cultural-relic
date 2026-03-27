# JXT 数字证据管理平台 - UI 组件库文档

## 目录

- [概述](#概述)
- [安装与使用](#安装与使用)
- [设计系统](#设计系统)
- [组件列表](#组件列表)
- [样式规范](#样式规范)
- [最佳实践](#最佳实践)

---

## 概述

JXT UI 是专为数字证据管理平台设计的 UI 组件库，基于 Vue 2 和 Element UI 构建，采用司法权威风格的设计语言，体现专业性、规范性和权威性。

### 特性

- **司法权威风格**：专业的视觉设计，符合公检法执法场景
- **完整的设计系统**：包含颜色、字体、间距、圆角、阴影等设计 Token
- **响应式设计**：支持桌面端和移动端适配
- **无障碍支持**：遵循 WCAG 2.1 AA 标准
- **主题定制**：支持亮色/暗色主题切换

---

## 安装与使用

### 导入样式

在项目的 `src/styles/index.scss` 中导入组件库样式：

```scss
// 导入设计系统
@import './tokens/index.scss';

// 导入组件样式
@import './components/...';
```

### 使用设计 Token

#### 在 SCSS 中使用

```scss
@import '@/styles/tokens/index.scss';

.my-component {
  color: var(--law-primary, $law-primary);
  padding: $spacing-4;
  border-radius: $radius-sm;
  box-shadow: $shadow-sm;
}
```

#### 在 Vue 组件中使用

```vue
<template>
  <div class="my-component">内容</div>
</template>

<script>
import designTokens from '@/styles/tokens/index.scss';

export default {
  computed: {
    primaryColor() {
      return designTokens.primary;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.my-component {
  color: var(--law-primary);
  background: var(--law-bg-card);
  padding: $spacing-4;
  @include text-title;
}
</style>
```

---

## 设计系统

### 颜色系统

#### 主色（司法蓝）

```scss
// 主色
--law-primary: #1A5F7A;      // 主蓝色
--law-primary-light: #2E86AB; // 浅蓝色
--law-primary-dark: #0D3B4D;  // 深蓝色
```

**使用场景**：
- 主要操作按钮
- 导航激活状态
- 重要信息强调
- 链接文字

#### 功能色

```scss
// 成功 - 已结案、正常
--law-success: #2E7D32;

// 警告 - 待处理、注意
--law-warning: #F57C00;

// 危险 - 删除、异常、紧急
--law-danger: #C62828;

// 信息 - 一般提示
--law-info: #0277BD;
```

#### 中性色

```scss
// 用于文本、边框、背景
--law-gray-50: #FAFAFA;
--law-gray-100: #F5F5F5;
--law-gray-200: #EEEEEE;
--law-gray-300: #E0E0E0;
--law-gray-400: #BDBDBD;
--law-gray-500: #9E9E9E;
--law-gray-600: #757575;
--law-gray-700: #616161;
--law-gray-800: #424242;
--law-gray-900: #212121;
```

#### 状态色

```scss
// 证据状态
--law-status-archived: #607D8B;   // 已归档
--law-status-completed: #4CAF50;  // 已结案
--law-status-processing: #FF9800; // 处理中
--law-status-pending: #2196F3;    // 待处理
--law-status-rejected: #C62828;   // 已驳回
--law-status-review: #7B1FA2;     // 待审核
```

### 字体系统

#### 字体家族

```scss
// 中文字体优先
--font-family-base: "SF Pro Text", "PingFang SC", "Hiragino Sans GB",
                   "Microsoft YaHei", "微软雅黑", Arial, sans-serif;

// 数字字体
--font-family-number: "SF Mono", "Roboto Mono", "Consolas", monospace;
```

#### 字体大小

| 类名 | 字号 | 用途 |
|------|------|------|
| `--font-size-xs` | 12px | 辅助信息 |
| `--font-size-sm` | 13px | 次要文本 |
| `--font-size-base` | 14px | 正文（最小可读） |
| `--font-size-md` | 16px | 强调正文 |
| `--font-size-lg` | 18px | 小标题 |
| `--font-size-xl` | 20px | 卡片标题 |
| `--font-size-2xl` | 24px | 页面标题 |
| `--font-size-3xl` | 30px | 主标题 |

#### 文本 Mixins

```scss
// 标题
@mixin text-title {
  font-size: $font-size-xl;
  line-height: $line-height-tight;
  font-weight: $font-weight-semibold;
  color: var(--law-gray-800);
}

// 正文
@mixin text-body {
  font-size: $font-size-base;
  line-height: $line-height-normal;
  font-weight: $font-weight-normal;
  color: var(--law-gray-700);
}

// 次要文本
@mixin text-secondary {
  font-size: $font-size-sm;
  line-height: $line-height-normal;
  font-weight: $font-weight-normal;
  color: var(--law-gray-600);
}

// 辅助文本
@mixin text-caption {
  font-size: $font-size-xs;
  line-height: $line-height-normal;
  font-weight: $font-weight-normal;
  color: var(--law-gray-500);
}
```

### 间距系统

基于 8dp 的间距系统：

```scss
--spacing-0: 0;
--spacing-1: 4px;     // 极小间距
--spacing-2: 8px;     // 小间距（基础单位）
--spacing-3: 12px;    // 中小间距
--spacing-4: 16px;    // 标准间距
--spacing-5: 20px;    // 中大间距
--spacing-6: 24px;    // 大间距
--spacing-8: 32px;    // 超大间距
--spacing-10: 40px;   // 特大间距
--spacing-12: 48px;   // 巨大间距
```

### 圆角系统

```scss
--radius-xs: 2px;     // 极小圆角（标签、徽章）
--radius-sm: 4px;     // 小圆角（按钮、输入框）
--radius-md: 6px;     // 中圆角（卡片）
--radius-lg: 8px;     // 大圆角（模态框）
--radius-xl: 12px;    // 超大圆角
--radius-full: 9999px; // 完全圆角（头像）
```

### 阴影系统

```scss
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.08);
--shadow-focus: 0 0 0 3px rgba(26, 95, 122, 0.15);
```

---

## 组件列表

### 按钮

#### 主要按钮

```vue
<template>
  <el-button type="primary">主要操作</el-button>
  <el-button type="primary" :loading="loading">加载中</el-button>
  <el-button type="primary" disabled>禁用</el-button>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

::v-deep .el-button--primary {
  background: var(--law-primary);
  border-color: var(--law-primary);
  transition: $transition-button;

  &:hover {
    background: var(--law-primary-light);
    border-color: var(--law-primary-light);
  }
}
</style>
```

#### 次要按钮

```vue
<el-button>次要操作</el-button>
```

#### 文字按钮

```vue
<el-button type="text">文字按钮</el-button>
```

#### 按钮尺寸

| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| 迷你 | 24px | 4px 8px | 12px |
| 小 | 28px | 6px 12px | 13px |
| 中 | 32px | 8px 16px | 14px |
| 大 | 40px | 12px 24px | 14px |

### 表单

#### 输入框

```vue
<template>
  <el-input
    v-model="inputValue"
    placeholder="请输入内容"
    clearable
  />
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

::v-deep .el-input__inner {
  height: 48px;
  border: 1px solid var(--law-gray-300);
  border-radius: $radius-sm;
  @include text-base;
  padding: $input-padding;
  transition: $transition-input;

  &:focus {
    border-color: var(--law-primary);
    box-shadow: $shadow-focus;
  }

  &::placeholder {
    color: var(--law-gray-400);
  }
}
</style>
```

#### 选择器

```vue
<el-select v-model="value" placeholder="请选择">
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>
```

#### 日期选择器

```vue
<el-date-picker
  v-model="dateValue"
  type="date"
  placeholder="选择日期"
/>
```

#### 表单项间距

```scss
.form-item {
  margin-bottom: $form-item-gap;
}

.form-label {
  margin-bottom: $form-label-gap;
}
```

### 表格

#### 基础表格

```vue
<template>
  <el-table :data="tableData" stripe>
    <el-table-column prop="date" label="日期" width="180" />
    <el-table-column prop="name" label="姓名" width="180" />
    <el-table-column prop="address" label="地址" />
  </el-table>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

::v-deep .el-table {
  .el-table__header-wrapper {
    th {
      background: var(--law-gray-50);
      padding: $table-head-padding;
      @include text-secondary;
      font-weight: $font-weight-medium;
    }
  }

  .el-table__body-wrapper {
    td {
      padding: $table-cell-padding;
      @include text-base;
    }
  }

  &.el-table--striped {
    .el-table__body tr.el-table__row--striped td {
      background: var(--law-gray-50);
    }
  }
}
</style>
```

#### 状态标签

```vue
<template>
  <el-tag :type="getStatusType(status)">{{ status }}</el-tag>
</template>

<script>
export default {
  methods: {
    getStatusType(status) {
      const statusMap = {
        '已归档': 'info',
        '已结案': 'success',
        '处理中': 'warning',
        '待处理': 'primary',
        '已驳回': 'danger',
      };
      return statusMap[status] || '';
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

::v-deep .el-tag {
  border-radius: $radius-xs;
  padding: 4px 10px;
  @include text-caption;
  font-weight: $font-weight-medium;
  border: none;
}
</style>
```

### 模态框

```vue
<template>
  <el-dialog
    title="标题"
    :visible.sync="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">内容</div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

::v-deep .el-dialog {
  border-radius: $radius-lg;
  box-shadow: $shadow-modal;

  .el-dialog__header {
    padding: $modal-header-padding;
    border-bottom: 1px solid var(--law-gray-200);
  }

  .el-dialog__title {
    @include text-xl;
    font-weight: $font-weight-semibold;
    color: var(--law-gray-800);
  }

  .el-dialog__body {
    padding: $modal-body-padding;
  }

  .el-dialog__footer {
    padding: $modal-footer-padding;
    border-top: 1px solid var(--law-gray-200);
  }
}
</style>
```

### 消息提示

```vue
<template>
  <el-button @click="showMessage">显示消息</el-button>
</template>

<script>
export default {
  methods: {
    showMessage() {
      this.$message({
        message: '操作成功',
        type: 'success',
        duration: 3000
      });
    }
  }
}
</script>
```

### 确认框

```vue
<script>
export default {
  methods: {
    async handleDelete() {
      try {
        await this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 执行删除操作
      } catch {
        // 用户取消
      }
    }
  }
}
</script>
```

---

## 样式规范

### 卡片样式

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
      卡片内容
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.card {
  background: var(--law-bg-card);
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
  transition: $transition-base;

  &:hover {
    box-shadow: $shadow-card-hover;
  }
}

.card-header {
  padding: $card-padding;
  border-bottom: 1px solid var(--law-gray-200);
}

.card-title {
  @include text-xl;
  font-weight: $font-weight-semibold;
  color: var(--law-gray-800);
  margin: 0;
}

.card-body {
  padding: $card-padding;
}
</style>
```

### 状态指示器

```vue
<template>
  <div class="status-badge" :class="statusClass">
    {{ statusText }}
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      required: true
    }
  },
  computed: {
    statusClass() {
      return `status-badge--${this.status}`;
    },
    statusText() {
      return this.status;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: $radius-full;
  @include text-caption;
  font-weight: $font-weight-medium;

  &.status-badge--archived {
    background: var(--law-gray-100);
    color: var(--law-status-archived);
  }

  &.status-badge--completed {
    background: var(--law-success-bg);
    color: var(--law-status-completed);
  }

  &.status-badge--processing {
    background: var(--law-warning-bg);
    color: var(--law-status-processing);
  }

  &.status-badge--pending {
    background: var(--law-info-bg);
    color: var(--law-status-pending);
  }
}
</style>
```

### 加载状态

```vue
<template>
  <div class="loading-container" v-loading="loading">
    内容
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.loading-container {
  position: relative;
  min-height: 200px;

  &[v-loading]::before {
    background: rgba(255, 255, 255, 0.8);
  }
}
</style>
```

---

## 最佳实践

### 1. 使用 CSS 变量

始终使用 CSS 变量而非硬编码颜色值：

```scss
// ❌ 错误
.my-component {
  color: #1A5F7A;
}

// ✅ 正确
.my-component {
  color: var(--law-primary, $law-primary);
}
```

### 2. 使用设计 Token Mixins

利用预定义的 mixins 保持样式一致：

```scss
// ✅ 使用 mixins
.title {
  @include text-title;
}

.body {
  @include text-body;
}
```

### 3. 保持间距一致性

使用 8dp 间距系统：

```scss
// ✅ 正确
.component {
  padding: $spacing-4;
  margin-bottom: $spacing-6;
}
```

### 4. 过渡动画统一

使用设计系统定义的过渡：

```scss
// ✅ 正确
.button {
  transition: $transition-button;
}

.input {
  transition: $transition-input;
}
```

### 5. 响应式设计

使用断点系统进行响应式布局：

```scss
.component {
  padding: $layout-padding;

  @media (max-width: $breakpoint-md) {
    padding: $layout-padding-sm;
  }
}
```

### 6. 无障碍支持

确保足够的对比度和焦点状态：

```scss
.input {
  &:focus {
    border-color: var(--law-primary);
    box-shadow: $shadow-focus;
    outline: none;
  }
}
```

### 7. 暗黑模式支持

使用 CSS 变量实现主题切换：

```scss
.component {
  background: var(--law-bg-card);
  color: var(--law-gray-800);

  [data-theme="dark"] & {
    background: var(--law-bg-card);
    color: var(--law-gray-100);
  }
}
```

---

## 更新日志

### v1.0.0 (2026-03-26)

- 初始版本发布
- 完整的设计系统（颜色、字体、间距、圆角、阴影）
- 登录页面组件
- 主框架组件（导航栏、侧边栏）
- 基础组件样式规范

---

## 贡献指南

欢迎提交问题和改进建议！

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

## 许可证

Copyright © 2026 JXT Digital Evidence Management Platform
