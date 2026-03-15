# 警情记录查询页面 UI/UX 优化设计规范

**日期**: 2026-03-15
**项目**: JXT 数字证据管理系统
**页面**: 警情记录查询 (incidentrecordquery/index.vue)

## 1. 概述

### 1.1 目标

对警情记录查询页面进行渐进式 UI/UX 优化，提升执法人员使用体验，建立可复用的设计系统。

### 1.2 优化范围

- 统一搜索框 + 快捷筛选
- 高级筛选折叠面板
- 批量操作工具栏
- 表格操作列图标化
- 状态列色块标识
- 弹窗表单可折叠分组
- 执法场景配色系统
- 可复用的设计令牌系统

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   警情记录查询                           │
├─────────────────────────────────────────────────────────┤
│ 【搜索与快捷筛选区】                                     │
│ 🔍 [统一搜索框]           [高级筛选 ▼]                   │
│ 快捷筛选: ◉全部 ○今日警情 ○待处理 ○我的警情 ○已归档   │
├─────────────────────────────────────────────────────────┤
│ 【高级筛选面板】(默认折叠)                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 警情信息: [编号] [标题] [报警人]                    │ │
│ │ 时间范围: ☑报警时间 [日期范围选择器]               │ │
│ │           ☐接警时间 [日期范围选择器]               │ │
│ │ 组织人员: [处警组织] [处警人员]                     │ │
│ │ 状态筛选: [状态] [关联状态]                         │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 【批量操作栏】(选中时显示)                               │
│ □ 已选择 3 项    [批量删除▼]  [批量导出]               │
├─────────────────────────────────────────────────────────┤
│ 【主操作栏】                                             │
│ [新增警情] [刷新]      [📊列设置] [⚙️视图设置]         │
├─────────────────────────────────────────────────────────┤
│ 【数据表格】                                             │
│ │ 操作 │警情号│标题│...│状态│是否关联│               │
│ │ 👁️浏览 │...  │... │...│●处理中│●已关联│           │
│ │ ✏️修改 │...  │... │...│       │       │           │
│ │ 🗑️删除 │...  │... │...│       │       │           │
├─────────────────────────────────────────────────────────┤
│ [分页组件]                                               │
└─────────────────────────────────────────────────────────┘
```

## 3. 设计系统

### 3.1 颜色令牌

**文件**: `src/styles/tokens/colors.scss`

```scss
// 执法场景专业配色
$law-enforcement: (
  // 主色 - 权威、专业
  primary: (
    base: #1A5F7A,
    light: #2E86AB,
    dark: #0D3B4D,
    contrast: #FFFFFF
  ),

  // 功能色
  success: #3D8B40,    // 已结案、正常
  warning: #E9A825,    // 待处理
  danger: #C62828,     // 删除、异常
  info: #2E86AB,       // 信息提示

  // 中性色
  gray: (
    50:  #ECEFF1,
    100: #CFD8DC,
    200: #B0BEC5,
    300: #90A4AE,
    400: #78909C,
    500: #546E7A,  // 正文
    600: #455A64,
    700: #37474F,
    800: #263238,
    900: #1A1A1A   // 标题
  ),

  // 背景色
  background: (
    default: #F5F7FA,
    paper: #FFFFFF,
    overlay: rgba(0, 0, 0, 0.5)
  ),

  // 状态色 - 用于表格状态列
  status: (
    processing: #FF9800,  // 处理中 - 橙色
    completed: #4CAF50,   // 已结案 - 绿色
    archived: #607D8B,    // 已归档 - 灰蓝
    pending: #2196F3      // 待处理 - 蓝色
  )
);

// Element UI 覆盖变量
$--color-primary: #1A5F7A;
$--color-success: #3D8B40;
$--color-warning: #E9A825;
$--color-danger: #C62828;
$--color-info: #2E86AB;
```

### 3.2 间距令牌

**文件**: `src/styles/tokens/spacing.scss`

```scss
// 8dp 间距系统
$spacing: (
  0: 0,
  1: 4px,
  2: 8px,
  3: 12px,
  4: 16px,
  5: 20px,
  6: 24px,
  8: 32px,
  10: 40px,
  12: 48px,
  16: 64px
);

// 组件特定间距
$component-spacing: (
  card-padding: 20px,
  card-gap: 16px,
  form-item-gap: 18px,
  table-cell-padding: 12px 16px
);
```

### 3.3 字体令牌

**文件**: `src/styles/tokens/typography.scss`

```scss
// 字体家族
$font-family: (
  base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
         "Helvetica Neue", Arial, sans-serif,
  code: "SF Mono", Monaco, "Consolas", "Liberation Mono", "Courier New", monospace
);

// 字体大小 scale
$font-size: (
  xs: 12px,
  sm: 13px,
  base: 14px,    // 正文最小字号
  md: 16px,
  lg: 18px,
  xl: 20px,
  2xl: 24px,
  3xl: 30px
);

// 字重
$font-weight: (
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
);

// 行高
$line-height: (
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75
);
```

### 3.4 按钮尺寸规范

满足 44×44px 最小点击区域要求：

```scss
$button: (
  height: (
    large: 44px,
    default: 36px,
    small: 32px,
    mini: 28px
  ),
  padding: (
    large: 12px 24px,
    default: 10px 20px,
    small: 8px 16px,
    mini: 6px 12px
  )
);
```

## 4. 组件设计

### 4.1 查询表单组件 (IncidentQueryBar)

**组件结构**:
```
IncidentQueryBar
├── SearchInput        # 统一搜索框
├── QuickFilters       # 快捷筛选标签
└── AdvancedFilterPanel # 可折叠高级筛选面板
```

#### 4.1.1 SearchInput 组件

```vue
<template>
  <el-input
    v-model="searchText"
    placeholder="请输入警情编号/标题/报警人"
    prefix-icon="el-icon-search"
    clearable
    @keyup.enter.native="handleSearch"
    class="search-input"
  >
    <el-button
      slot="append"
      icon="el-icon-search"
      @click="handleSearch"
    >
      搜索
    </el-button>
  </el-input>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: String
  },
  data() {
    return {
      searchText: this.value
    };
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchText);
    }
  }
};
</script>
```

#### 4.1.2 QuickFilters 组件

```vue
<template>
  <div class="quick-filters">
    <el-radio-group v-model="activeFilter" size="small" @change="handleFilterChange">
      <el-radio-button label="all">全部</el-radio-button>
      <el-radio-button label="today">今日警情</el-radio-button>
      <el-radio-button label="pending">待处理</el-radio-button>
      <el-radio-button label="mine">我的警情</el-radio-button>
      <el-radio-button label="archived">已归档</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'QuickFilters',
  props: {
    value: String
  },
  data() {
    return {
      activeFilter: this.value || 'all'
    };
  },
  methods: {
    handleFilterChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
};
</script>
```

#### 4.1.3 AdvancedFilterPanel 组件

```vue
<template>
  <el-collapse v-model="activeNames" class="advanced-filter-panel">
    <el-collapse-item name="filters">
      <template slot="title">
        <span class="filter-title">
          <i class="el-icon-setting"></i>
          高级筛选
        </span>
      </template>

      <!-- 时间范围 - 复选框 + 日期范围组合 -->
      <div class="time-range-group">
        <div v-for="range in timeRanges" :key="range.key" class="time-range-item">
          <el-checkbox
            v-model="range.enabled"
            @change="handleTimeRangeToggle(range)"
          >
            {{ range.label }}
          </el-checkbox>
          <el-date-picker
            v-if="range.enabled"
            v-model="queryParams[range.key]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :value-format="'yyyy-MM-dd HH:mm:ss'"
            class="time-range-picker"
          />
        </div>
      </div>

      <!-- 其他筛选条件 -->
      <el-row :gutter="16" class="filter-row">
        <el-col :span="6">
          <el-input v-model="queryParams.code" placeholder="警情编号" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="queryParams.title" placeholder="警情标题" />
        </el-col>
        <el-col :span="6">
          <el-input v-model="queryParams.name" placeholder="报警人姓名" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="queryParams.status" placeholder="状态" clearable>
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-col>
      </el-row>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  name: 'AdvancedFilterPanel',
  props: {
    statusOptions: Array
  },
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'reportTime', label: '报警时间', enabled: false },
        { key: 'receiveTime', label: '接警时间', enabled: false },
        { key: 'processTime', label: '处警时间', enabled: false },
        { key: 'endTime', label: '结束时间', enabled: false }
      ],
      queryParams: {}
    };
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        // 清空该时间范围的数据
        this.queryParams[range.key] = null;
      }
      this.$emit('filter-change', this.queryParams);
    }
  }
};
</script>
```

### 4.2 批量操作工具栏

```vue
<template>
  <transition name="slide-down">
    <div v-if="selectedCount > 0" class="batch-action-bar">
      <div class="selection-info">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="allSelected"
          @change="handleSelectAll"
        >
          已选择 {{ selectedCount }} 项
        </el-checkbox>
      </div>
      <div class="batch-actions">
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-download"
          @click="handleBatchExport"
        >
          批量导出
        </el-button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BatchActionBar',
  props: {
    selectedCount: Number,
    isIndeterminate: Boolean,
    allSelected: Boolean
  },
  methods: {
    handleSelectAll(val) {
      this.$emit('select-all', val);
    },
    handleBatchDelete() {
      this.$emit('batch-delete');
    },
    handleBatchExport() {
      this.$emit('batch-export');
    }
  }
};
</script>
```

### 4.3 表格操作列

```vue
<template>
  <el-table-column label="操作" width="200" fixed="left" align="center">
    <template slot-scope="scope">
      <el-button
        v-permisaction="['incidentrecord:bwc:browse']"
        size="mini"
        type="text"
        icon="el-icon-view"
        class="action-btn view-btn"
        @click="handleView(scope.row)"
      >
        浏览
      </el-button>
      <el-button
        v-permisaction="['incidentrecord:bwc:edit']"
        size="mini"
        type="text"
        icon="el-icon-edit"
        class="action-btn edit-btn"
        @click="handleUpdate(scope.row)"
      >
        修改
      </el-button>
      <el-button
        v-permisaction="['incidentrecord:bwc:remove']"
        size="mini"
        type="text"
        icon="el-icon-delete"
        class="action-btn delete-btn"
        @click="handleDelete(scope.row)"
      >
        删除
      </el-button>
    </template>
  </el-table-column>
</template>
```

### 4.4 状态列色块

```vue
<template>
  <el-table-column label="状态" width="120">
    <template slot-scope="{ row }">
      <div class="status-cell">
        <span
          class="status-dot"
          :class="getStatusClass(row.status)"
        ></span>
        <span class="status-text">{{ statusFormat(row) }}</span>
      </div>
    </template>
  </el-table-column>
</template>

<script>
export default {
  methods: {
    getStatusClass(status) {
      const statusMap = {
        0: 'pending',      // 待处理
        1: 'processing',   // 处理中
        2: 'completed',    // 已结案
        3: 'archived'      // 已归档
      };
      return statusMap[status] || 'pending';
    }
  }
};
</script>
```

### 4.5 弹窗表单可折叠分组

```vue
<template>
  <el-dialog :title="title" :visible.sync="open" width="800px" :close-on-click-modal="false">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">

      <!-- 使用 el-collapse 实现可折叠分组 -->
      <el-collapse v-model="activeSections" class="form-collapse">

        <!-- 基础信息 -->
        <el-collapse-item name="basic" class="form-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-document section-icon"></i>
              <span class="section-title">基础信息</span>
              <span class="section-badge">5项</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="报警人姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入报警人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入报警电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- ... 其他字段 -->
        </el-collapse-item>

        <!-- 时间信息 - 带时间线可视化 -->
        <el-collapse-item name="timeline" class="form-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-time section-icon"></i>
              <span class="section-title">时间流程</span>
              <span class="section-badge">5个节点</span>
            </div>
          </template>

          <!-- 时间线可视化 -->
          <div class="timeline-preview">
            <div class="timeline-item" :class="{ active: form.reportTime }">
              <span class="timeline-dot"></span>
              <span class="timeline-label">报警</span>
            </div>
            <div class="timeline-line"></div>
            <div class="timeline-item" :class="{ active: form.receiveTime }">
              <span class="timeline-dot"></span>
              <span class="timeline-label">接警</span>
            </div>
            <div class="timeline-line"></div>
            <div class="timeline-item" :class="{ active: form.processTime }">
              <span class="timeline-dot"></span>
              <span class="timeline-label">处警</span>
            </div>
            <div class="timeline-line"></div>
            <div class="timeline-item" :class="{ active: form.endTime }">
              <span class="timeline-dot"></span>
              <span class="timeline-label">结束</span>
            </div>
          </div>

          <el-row :gutter="20" class="time-inputs">
            <el-col :span="12">
              <el-form-item label="报警时间">
                <el-date-picker v-model="form.reportTime" type="datetime" class="full-width" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="接警时间">
                <el-date-picker v-model="form.receiveTime" type="datetime" class="full-width" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处警时间">
                <el-date-picker v-model="form.processTime" type="datetime" class="full-width" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间">
                <el-date-picker v-model="form.endTime" type="datetime" class="full-width" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>

        <!-- 执法信息 -->
        <el-collapse-item name="enforcement" class="form-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-user section-icon"></i>
              <span class="section-title">执法信息</span>
              <span class="section-badge">4项</span>
            </div>
          </template>
          <!-- ... -->
        </el-collapse-item>

      </el-collapse>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      activeSections: ['basic'] // 默认只展开基础信息
    };
  }
};
</script>
```

## 5. 样式定义

### 5.1 批量操作栏

```scss
.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(#1A5F7A, 0.08);
  border-radius: 4px;
  margin-bottom: 16px;

  .batch-actions {
    display: flex;
    gap: 8px;
  }
}
```

### 5.2 状态列

```scss
.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;

    &.processing { background: #FF9800; }
    &.completed { background: #4CAF50; }
    &.archived { background: #607D8B; }
    &.pending { background: #2196F3; }
  }
}
```

### 5.3 操作按钮

```scss
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.view-btn { color: #2E86AB; }
  &.edit-btn { color: #E9A825; }
  &.delete-btn { color: #C62828; }
}
```

### 5.4 表单折叠分组

```scss
.form-collapse {
  border: none;

  .form-section {
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;

    /deep/ .el-collapse-item__header {
      height: 48px;
      background: #F5F7FA;
      border: none;
      padding: 0 16px;

      &:hover {
        background: #EEF1F6;
      }
    }

    /deep/ .el-collapse-item__wrap {
      border: none;
      background: #FFFFFF;
    }

    /deep/ .el-collapse-item__content {
      padding: 20px;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;

  .section-icon {
    font-size: 18px;
    color: #1A5F7A;
  }

  .section-title {
    font-weight: 600;
    font-size: 15px;
    color: #1A1A1A;
  }

  .section-badge {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(#1A5F7A, 0.1);
    color: #1A5F7A;
    font-size: 12px;
    border-radius: 12px;
  }
}
```

### 5.5 时间线可视化

```scss
.timeline-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  margin-bottom: 20px;

  .timeline-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #E0E0E0;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 0 2px #E0E0E0;
      transition: all 0.3s;
    }

    .timeline-label {
      font-size: 12px;
      color: #90A4AE;
    }

    &.active .timeline-dot {
      background: #1A5F7A;
      box-shadow: 0 0 0 2px #1A5F7A;
    }

    &.active .timeline-label {
      color: #1A5F7A;
      font-weight: 500;
    }
  }

  .timeline-line {
    flex: 1;
    height: 2px;
    background: #E0E0E0;
    min-width: 40px;
  }
}
```

## 6. 实现顺序

1. **设计令牌系统** - 创建颜色、间距、字体变量文件
2. **查询表单组件** - 实现统一搜索框、快捷筛选、高级筛选面板
3. **表格操作区** - 实现批量操作栏、操作列、状态列
4. **弹窗表单** - 实现可折叠分组和时间线可视化
5. **全局样式应用** - 将新配色应用到其他组件

## 7. 测试要点

- [ ] 快捷筛选切换后表格数据正确更新
- [ ] 高级筛选面板折叠/展开动画流畅
- [ ] 时间范围勾选后日期选择器正确显示/隐藏
- [ ] 批量操作栏在选中/取消选中时正确显示/隐藏
- [ ] 状态列色块与状态文字正确对应
- [ ] 弹窗表单时间线随时间输入实时更新
- [ ] 所有交互元素满足 44×44px 最小点击区域
- [ ] 颜色对比度符合 WCAG 4.5:1 标准
