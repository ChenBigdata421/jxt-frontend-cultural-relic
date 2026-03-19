# 警情记录查询页面 UI/UX 优化设计规范

**日期**: 2026-03-15
**项目**: JXT 数字证据管理系统
**页面**: 警情记录查询 (incidentrecordquery/index.vue)

## 1. 概述

### 1.1 目标

本项目是一个数字管理平台，面向公检法执法人员，执法人员在执法过程中，可通过音视频录制、图片拍摄、文字记录等多种方式，实时采集现场各类信息（统称为“媒体资料”），并将其统一汇聚至数字管理平台。平台根据业务需求，对媒体资料进行管理，包括信息关联、归档存储、内容标注、数据分析、监控告警等。通过对作业过程多方位地数字化系统化管理，不仅提升了执法工作的规范性和透明度，进而确保各项工作过程可审查、可追溯、可控制。本规范结合本项目的特点，使用UI UX Pro Max技能设计出来的。今后其他页面的样式需要遵循该规范，如有疑问，可使用UI UX Pro Max技能进一步完善。

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
│ └────────┴─────┴────┴───┴──────┴──────┘               │
│ 操作列宽度: 240px (固定左侧)                            │
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
├── AdvancedFilterPanel # 可折叠高级筛选面板
└── ActionButtons      # 搜索和重置按钮
```

**布局规范**:

```
┌─────────────────────────────────────────────────────────┐
│ 【搜索区域】                                             │
│                                                         │
│ 1️⃣ 快速搜索区域                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 警情号: [______]  警情标题: [__________]            │ │
│ │ 报警人: [______]  状态: [________]  关联: [____]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 2️⃣ 快捷筛选                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 快捷筛选: ◉全部 ○今日警情 ○待处理 ○我的警情 ○已归档   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 3️⃣ 高级筛选面板                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ▼ 高级筛选                                           │ │
│ │   报警内容: [________]  报警电话: [________]         │ │
│ │   处警组织: [________]  处警人员: [________]         │ │
│ │   ☑报警时间  [______] 至 [______]                   │ │
│ │   ☐接警时间  [______] 至 [______]                   │ │
│ │   ☐处警时间  [______] 至 [______]                   │ │
│ │   ☐结束时间  [______] 至 [______]                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 4️⃣ 操作按钮                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                    [🔍 搜索] [🔄 重置] │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**设计说明**:

1. **快速搜索区域**: 提供常用字段的快速输入，位于顶部，方便快速查询
2. **快捷筛选**: 提供预设的常用筛选条件（今日、我的、待处理等）
3. **高级筛选面板**: 可折叠，包含更多筛选条件和时间范围选择
4. **操作按钮**: 放置在高级筛选下方，用户完成所有筛选条件设置后再点击

**交互流程**:

```
用户操作流程：
快速搜索设置 → 快捷筛选选择 → 高级筛选配置 → 点击搜索/重置
     ↓              ↓                ↓               ↓
  输入关键字      选择预设        设置详细条件      执行查询
```

**布局优势**:

- 符合用户从上到下、从简单到复杂的操作习惯
- 避免用户在设置筛选条件时误触搜索按钮
- 按钮位置固定，用户完成所有配置后自然点击下方按钮
- 视觉层次清晰，各功能区域边界明确

#### 4.1.1 IncidentQueryBar 主组件

```vue
<template>
  <div class="incident-query-bar">
    <!-- 统一的筛选容器 -->
    <div class="filter-container">
      <!-- 1. 快速搜索区域 -->
      <div class="search-section">
        <SearchInput
          ref="quickSearch"
          :status-options="statusOptions"
          :relation-status-options="relationStatusOptions"
          @search="handleQuickSearch"
          @reset="handleQuickSearchReset"
        />
      </div>

      <!-- 2. 快捷筛选 -->
      <div class="quick-filter-section">
        <div class="filter-row">
          <span class="section-label">快捷筛选</span>
          <QuickFilters
            v-model="quickFilter"
            @change="handleQuickFilterChange"
          />
        </div>
      </div>

      <!-- 3. 高级筛选面板 -->
      <div class="advanced-filter-section">
        <AdvancedFilterPanel
          ref="advancedFilter"
          :org-options="orgOptions"
          @filter-change="handleAdvancedFilterChange"
          @reset="handleAdvancedFilterReset"
        />
      </div>

      <!-- 4. 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="handleGlobalSearch"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh-left"
          size="small"
          @click="handleGlobalReset"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SearchInput from './SearchInput.vue';
import QuickFilters from './QuickFilters.vue';
import AdvancedFilterPanel from './AdvancedFilterPanel.vue';

export default {
  name: 'IncidentQueryBar',
  components: {
    SearchInput,
    QuickFilters,
    AdvancedFilterPanel
  },
  methods: {
    handleGlobalSearch() {
      // 合并快速搜索和高级筛选的条件
      const quickSearchParams = this.$refs.quickSearch.getSearchParams();
      const advancedParams = this.$refs.advancedFilter.getFilterData();
      const allParams = { ...quickSearchParams, ...advancedParams };
      this.$emit('search', allParams);
    },
    handleGlobalReset() {
      // 重置所有筛选条件
      this.quickFilter = 'all';
      this.$refs.advancedFilter.handleReset();
      this.$refs.quickSearch.handleReset();
    }
  }
};
</script>

<style lang="scss" scoped>
.incident-query-bar {
  .filter-container {
    background-color: $law-bg-paper;
    border-radius: 4px;
    border: 1px solid $law-gray-200;
    padding: $spacing-4;

    .search-section {
      margin-bottom: $spacing-4;
    }

    .quick-filter-section {
      margin-bottom: $spacing-4;

      .filter-row {
        display: flex;
        align-items: center;
        gap: $spacing-3;
      }

      .section-label {
        white-space: nowrap;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $law-gray-700;
      }
    }

    .advanced-filter-section {
      margin-bottom: $spacing-2;  // 缩小间距，保持搜索区域紧凑
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: $spacing-3;
      padding-top: 0;  // 移除顶部间距，与高级筛选面板更紧凑
    }
  }
}
</style>
```

#### 4.1.2 SearchInput 组件

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

#### 4.1.3 QuickFilters 组件

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

#### 4.1.4 AdvancedFilterPanel 组件

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

  }
};
</script>
```

### 4.3 状态列色块

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

### 4.4 弹窗表单可折叠分组

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

### 5.1 表格列宽度规范

**强制规范**:

| 列名  | 宽度      | 说明                |
| --- | ------- | ----------------- |
| 操作列 | `240px` | 固定左侧，包含浏览/修改/删除按钮 |
| 选择列 | `60px`  | 复选框列，居中对齐         |

**设计原则**:

| 字段类型 | 宽度设置                                  | 示例          |
| ---- | ------------------------------------- | ----------- |
| 短字段  | 固定宽度 `100-150px`                      | 警情号、状态、是否关联 |
| 长字段  | `min-width` + `show-overflow-tooltip` | 标题、地址、报警内容  |
| 时间字段 | 固定 `170px`                            | 包含日期时间格式    |

**说明**: 非关键列可根据实际内容灵活调整，不强制要求具体数值。

### 5.2 表格字体规范

为确保表格数据的可读性和专业感，制定以下字体规范：

| 表格元素     | 字体大小                     | 字重                            | 行高  | 颜色变量                      | 说明     |
| -------- | ------------------------ | ----------------------------- | --- | ------------------------- | ------ |
| **表头**   | `$font-size-sm` (13px)   | `$font-weight-semibold` (600) | 1.5 | `$law-gray-900` (#1A1A1A) | 清晰区分列名 |
| **表体数据** | `$font-size-base` (14px) | `$font-weight-normal` (400)   | 1.5 | `$law-gray-700` (#546E7A) | 主要业务数据 |
| **表体辅助** | `$font-size-sm` (13px)   | `$font-weight-normal` (400)   | 1.5 | `$law-gray-600` (#455A64) | 次要信息   |
| **表脚信息** | `$font-size-sm` (13px)   | `$font-weight-normal` (400)   | 1.5 | `$law-gray-600` (#455A64) | 分页信息   |

**设计原则**:

1. **表头使用较小字号** - 表头文字较短，使用 13px 既清晰又不占用过多空间
2. **表体数据使用基础字号** - 14px 确保业务数据清晰可读，符合正文最小字号要求
3. **字重层次分明** - 表头 semibold (600) 建立视觉层次，表体 normal (400) 保持可读性
4. **统一行高** - 1.5 确保良好的垂直韵律和可读性
5. **颜色对比度** - 遵循 WCAG 4.5:1 标准，使用灰度色阶建立层次

**实现示例**:

```scss
// 表格字体样式
.el-table {
  // 表头
  .el-table__header-wrapper {
    th {
      font-size: $font-size-sm;      // 13px
      font-weight: $font-weight-semibold;  // 600
      color: $law-gray-900;           // #1A1A1A
      line-height: 1.5;
    }
  }

  // 表体
  .el-table__body-wrapper {
    td {
      font-size: $font-size-base;     // 14px
      font-weight: $font-weight-normal;  // 400
      color: $law-gray-700;           // #546E7A
      line-height: 1.5;
    }
  }

  // 辅助信息（如状态文字）
  .status-text {
    font-size: $font-size-sm;         // 13px
    color: $law-gray-600;             // #455A64
  }
}
```

### 5.3 批量操作栏

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

### 5.4 状态列

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

### 5.5 表单折叠分组

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

#### 5.5.1 分组徽章规范

**动态计算原则**: 分组徽章显示的字段数量应根据实际可见字段数量动态计算，而非硬编码。

**实现方式**:

```vue
<template>
  <el-collapse-item name="basic" class="form-section">
    <template slot="title">
      <div class="section-header">
        <i class="el-icon-document section-icon"></i>
        <span class="section-title">基础信息</span>
        <span class="section-badge">{{ basicFieldCount }}项</span>
      </div>
    </template>
    <!-- ... -->
  </el-collapse-item>
</template>

<script>
export default {
  computed: {
    basicFieldCount() {
      // 返回实际显示的字段数量
      return 7; // 报警人姓名、报警电话、警情标题、报警内容、报警地址、处警组织、处警人员
    },
    timelineFieldCount() {
      return 5; // 创建时间、报警时间、接警时间、处警时间、结束时间
    },
    enforcementFieldCount() {
      return 3; // 警情监督类型、处警结果、状态
    }
  }
};
</script>
```

**设计原则**:

- 准确性：徽章数量应与实际字段数量一致
- 可维护性：使用计算属性而非硬编码，便于后续修改
- 一致性：编辑对话框和详情对话框的徽章计算方式保持一致
  
  ```
  
  ```

### 5.6 时间线可视化

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

### 5.7 表单标签规范

为确保搜索表单和查询表单中标签与输入框之间的视觉一致性，制定以下规范：

#### 5.7.1 标签格式

**不包含冒号**: 所有表单标签不应包含冒号（：），保持简洁。

```vue
<!-- ✅ 正确 -->
<el-form-item label="报警人姓名" prop="name">

<!-- ❌ 错误 -->
<el-form-item label="报警人姓名：" prop="name">
```

**设计原则**:

- 标签与输入框之间已有明确的视觉分隔
- 冒号是冗余符号，增加视觉噪音
- 现代设计趋势趋向简化表单标签

#### 5.7.2 标签宽度

**固定宽度原则**: 所有表单标签应使用固定宽度，而非最小宽度，确保标签文字右对齐，输入框左对齐。

```scss
.search-item,
.form-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;  // 标签与输入框之间的间距

  label {
    white-space: nowrap;
    font-size: $font-size-sm;  // 13px
    color: $law-gray-700;
    width: 80px;  // 固定宽度，可容纳4-5个汉字
    flex-shrink: 0;
    text-align: right;  // 右对齐
    padding-right: $spacing-1;  // 额外的右侧间距
  }
}
```

#### 5.7.2 标签宽度参考表

| 标签字数 | 推荐宽度  | 示例     |
| ---- | ----- | ------ |
| 2字   | 60px  | 状态     |
| 3字   | 70px  | 警情号    |
| 4字   | 80px  | 警情编号   |
| 5字   | 90px  | 报警人姓名  |
| 6字   | 100px | 处警组织名称 |

**统一建议**: 搜索表单统一使用 `80px` 宽度，可满足大部分4字标签的需求。

#### 5.7.3 实现示例

```vue
<template>
  <div class="search-row">
    <div class="search-item">
      <label>警情编号</label>
      <el-input v-model="form.code" placeholder="请输入警情编号" />
    </div>
    <div class="search-item">
      <label>警情标题</label>
      <el-input v-model="form.title" placeholder="请输入警情标题" />
    </div>
    <div class="search-item">
      <label>报警人姓名</label>
      <el-input v-model="form.name" placeholder="请输入报警人姓名" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-row {
  display: flex;
  gap: $spacing-4;

  .search-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    label {
      width: 80px;
      flex-shrink: 0;
      text-align: right;
      padding-right: $spacing-1;
      font-size: $font-size-sm;
      color: $law-gray-700;
    }

    .el-input {
      flex: 1;
    }
  }
}
</style>
```

#### 5.7.4 设计原则

1. **视觉一致性**: 同一表单内所有标签宽度一致
2. **右对齐**: 标签文字右对齐，形成清晰的视觉分隔线
3. **合理间距**: 标签与输入框之间使用固定间距（$spacing-2 = 8px）
4. **文字不换行**: 使用 `white-space: nowrap` 防止标签文字换行

#### 5.7.5 输入框提示文本（Placeholder）规范

输入框的提示文本（placeholder）用于向用户提供输入格式或内容的示例提示。

**样式令牌**:

```scss
$placeholder: (
  font-size: $font-size-sm,        // 13px - 与标签保持一致
  font-weight: $font-weight-normal, // 400 - 比标签(500)更轻，形成视觉层级
  color: $law-gray-400,             // 浅灰色 - 与输入文字形成对比
);
```

**样式对比表**:

| 元素          | 字体大小 | 字重           | 颜色            | 用途      |
| ----------- | ---- | ------------ | ------------- | ------- |
| 标签 (label)  | 13px | 500 (Medium) | $law-gray-700 | 输入框标题   |
| 输入文字        | 13px | 400 (Normal) | $law-gray-700 | 用户输入的内容 |
| Placeholder | 13px | 400 (Normal) | $law-gray-400 | 提示信息    |
| 错误提示        | 13px | 500 (Medium) | $law-error    | 表单验证错误  |

**可访问性对比度检查**:

| 文字颜色          | 背景色             | 对比度    | WCAG等级 | 是否通过 |
| ------------- | --------------- | ------ | ------ | ---- |
| $law-gray-400 | White (#FFFFFF) | ~5.8:1 | AA     | ✓ 通过 |
| $law-gray-700 | White (#FFFFFF) | ~9.1:1 | AAA    | ✓ 通过 |

**实现示例**:

```scss
// Element UI 输入框 placeholder 覆盖样式
::v-deep .el-input__inner {
  &::placeholder {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    color: $law-gray-400;
    opacity: 1; // Firefox默认opacity较低
  }

  // 兼容 WebKit, Blink, Edge
  &::-webkit-input-placeholder {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    color: $law-gray-400;
  }

  // 兼容 Mozilla Firefox 19+
  &::-moz-placeholder {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    color: $law-gray-400;
    opacity: 1;
  }

  // 兼容 IE 10-11
  &:-ms-input-placeholder {
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    color: $law-gray-400;
  }
}

// Select 下拉框 placeholder
::v-deep .el-select__placeholder {
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;
  color: $law-gray-400;
}
```

**设计原则**:

1. **视觉层级**: placeholder颜色($law-gray-400)比输入文字($law-gray-700)浅，清晰区分已输入和未输入状态
2. **可访问性**: 对比度≥4.5:1，确保视力障碍用户能清晰阅读提示信息
3. **一致性**: 所有输入框的placeholder样式保持统一
4. **语义清晰**: placeholder是辅助提示，不能替代可见标签（参考UI/UX Pro Max规范）

**注意事项**:

- Placeholder不应包含关键信息，因为用户开始输入后立即消失
- 对于必填字段，应使用可见的星号(*)或"必填"标签，而非placeholder提示
- Placeholder文字应简洁明了，提供示例而非说明（如："2024-01-01" 而非 "请输入日期格式为YYYY-MM-DD"）

#### 5.7.6 输入框和下拉列表字体规范（新增）

为确保用户输入内容和下拉列表选项的可读性和可访问性，制定以下字体规范。

**规范依据**：WCAG AAA 级对比度标准，正文最小字号 14px

##### 5.7.6.1 输入框内容字体规范

用户在输入框中输入的内容应使用以下样式：

```scss
$law-input-content: (
  font-size: $font-size-base,        // 14px - 正文最小字号
  font-weight: $font-weight-normal,   // 400 - 正常字重
  color: $law-gray-900,               // #1A1A1A - 高对比度（15.2:1 AAA）
  line-height: $line-height-normal,   // 1.5 - 易读行高
);
```

**实现示例**:

```scss
// Element UI 输入框内容样式
::v-deep .el-input__inner {
  font-size: $font-size-base;      // 14px
  font-weight: $font-weight-normal; // 400
  color: $law-gray-900;            // #1A1A1A
  line-height: $line-height-normal; // 1.5

  &:focus {
    color: $law-gray-900;          // 焦点时保持深色
    border-color: $law-primary;    // 边框变主色 #1A5F7A
  }

  &::placeholder {
    // Placeholder 规范：13px, 400, gray-400（参见 5.7.5）
    font-size: $font-size-sm;
    font-weight: $font-weight-normal;
    color: $law-gray-400;
    opacity: 1;
  }
}
```

##### 5.7.6.2 下拉列表字体规范

下拉列表选项应使用以下样式：

```scss
$law-select-option: (
  font-size: $font-size-base,        // 14px
  font-weight: $font-weight-normal,   // 400
  color: $law-gray-900,               // #1A1A1A - 高对比度（15.2:1 AAA）
  line-height: $line-height-normal,   // 1.5
  padding: 10px 16px,                 // 触控友好（≥44px 高度）
);
```

**状态样式表**:

| 状态  | 字体大小 | 字重  | 颜色      | 背景色                     | 对比度          |
| --- | ---- | --- | ------- | ----------------------- | ------------ |
| 默认  | 14px | 400 | #1A1A1A | transparent             | 15.2:1 (AAA) |
| 悬停  | 14px | 400 | #1A1A1A | rgba(26, 95, 122, 0.08) | 15.2:1 (AAA) |
| 选中  | 14px | 500 | #1A5F7A | transparent             | 7.8:1 (AA)   |
| 禁用  | 14px | 400 | #78909C | transparent             | 4.5:1 (AA)   |

**实现示例**:

```scss
// Element UI Select 下拉选项样式
::v-deep .el-select-dropdown__item {
  font-size: $font-size-base;      // 14px
  font-weight: $font-weight-normal; // 400
  color: $law-gray-900;            // #1A1A1A
  line-height: $line-height-normal; // 1.5
  padding: 10px 16px;              // 触控友好

  &:hover {
    background-color: rgba($law-primary, 0.08); // 悬停背景
    color: $law-gray-900;          // 保持高对比
  }

  &.selected {
    font-weight: $font-weight-medium; // 500 - 选中时加粗
    color: $law-primary;            // #1A5F7A - 主色标识选中
  }

  &.is-disabled {
    color: $law-gray-400;          // #78909C - 禁用状态
    cursor: not-allowed;
  }
}

// Select 选中值显示
::v-deep .el-select__selected-item {
  font-size: $font-size-base;      // 14px
  font-weight: $font-weight-normal; // 400
  color: $law-gray-900;            // #1A1A1A
}
```

##### 5.7.6.3 组织树字体规范

组织树（vue-treeselect）节点文字应使用以下样式：

```scss
$law-tree-node: (
  font-size: $font-size-base,        // 14px
  font-weight: $font-weight-normal,   // 400
  color: $law-gray-900,               // #1A1A1A - 高对比度（15.2:1 AAA）
  line-height: $line-height-normal,   // 1.5
);
```

**状态样式表**:

| 状态    | 字体大小 | 字重  | 颜色                    | 对比度          |
| ----- | ---- | --- | --------------------- | ------------ |
| 默认节点  | 14px | 400 | #1A1A1A               | 15.2:1 (AAA) |
| 高亮/悬停 | 14px | 400 | #1A1A1A               | 15.2:1 (AAA) |
| 选中    | 14px | 500 | #1A5F7A               | 7.8:1 (AA)   |
| 禁用    | 14px | 400 | #78909C (opacity 0.6) | 4.5:1 (AA)   |

**实现示例**:

```scss
// vue-treeselect 组织树样式
::v-deep .vue-treeselect__label {
  font-size: $font-size-base;      // 14px
  font-weight: $font-weight-normal; // 400
  color: $law-gray-900;            // #1A1A1A
  line-height: $line-height-normal; // 1.5
}

// 树节点选中/高亮状态
::v-deep .vue-treeselect__option--highlight {
  .vue-treeselect__label {
    font-weight: $font-weight-medium; // 500 - 选中时加粗以区分
    color: $law-primary;            // #1A5F7A - 主色标识
  }
}

// 树节点禁用状态
::v-deep .vue-treeselect__option--disabled {
  .vue-treeselect__label {
    color: $law-gray-400;          // #78909C
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// 已选中的标签显示
::v-deep .vue-treeselect__single-value {
  font-size: $font-size-base;      // 14px
  font-weight: $font-weight-normal; // 400
  color: $law-gray-900;            // #1A1A1A
  line-height: $line-height-normal; // 1.5
}
```

##### 5.7.6.4 字体规范汇总表

| 元素              | 字体大小 | 字重  | 颜色      | 行高  | 对比度等级        |
| --------------- | ---- | --- | ------- | --- | ------------ |
| **输入框内容**       | 14px | 400 | #1A1A1A | 1.5 | AAA (15.2:1) |
| **下拉选项（默认）**    | 14px | 400 | #1A1A1A | 1.5 | AAA (15.2:1) |
| **下拉选项（选中）**    | 14px | 500 | #1A5F7A | 1.5 | AA (7.8:1)   |
| **组织树节点**       | 14px | 400 | #1A1A1A | 1.5 | AAA (15.2:1) |
| **组织树（选中）**     | 14px | 500 | #1A5F7A | 1.5 | AA (7.8:1)   |
| **Placeholder** | 13px | 400 | #78909C | -   | AA (4.5:1)   |

##### 5.7.6.5 设计原则

1. **可访问性优先** - 所有文字颜色与白色背景的对比度≥4.5:1（AA级），主要内容达到≥7:1（AAA级）
2. **正文最小字号** - 用户输入和选项文字使用14px，确保在执法工作场景下清晰可读
3. **字重层次** - 使用字重来区分状态：默认400，选中时500（medium），避免过度依赖颜色
4. **行高优化** - 统一使用1.5行高，确保良好的可读性和垂直韵律
5. **触控友好** - 下拉选项内边距≥10px垂直，确保触控区域≥44px（移动端友好）
6. **焦点状态** - 输入框焦点时文字颜色保持不变，仅改变边框颜色，避免视觉干扰

##### 5.7.6.6 可访问性检查

| 文字颜色    | 背景色   | 对比度    | WCAG等级 | 适用场景             |
| ------- | ----- | ------ | ------ | ---------------- |
| #1A1A1A | White | 15.2:1 | AAA    | 输入内容、选项文字、树节点    |
| #1A5F7A | White | 7.8:1  | AA     | 选中状态、主色标识        |
| #78909C | White | 4.5:1  | AA     | Placeholder、禁用状态 |
| #546E7A | White | 9.1:1  | AAA    | 表格数据、次要文字        |

**更新日期**: 2026-03-18

### 5.8 分页组件

分页组件位于数据表格底部，用于控制大量数据的分页展示。

#### 5.8.1 组件布局结构

```
┌─────────────────────────────────────────────────────────┐
│ [分页容器]                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 总数: 100 条    [每页10条▼]  [<] 1 2 3 ... 10 [>]   │ │
│ │                                  前往  [__] 页       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**元素说明**:

| 元素   | 说明                  | 必需   |
| ---- | ------------------- | ---- |
| 总数显示 | 显示数据总条数             | ✅ 必需 |
| 每页数量 | 选择器：10/20/30/50 条/页 | ✅ 必需 |
| 上一页  | 上一页按钮               | ✅ 必需 |
| 页码   | 数字页码按钮（当前页高亮）       | ✅ 必需 |
| 下一页  | 下一页按钮               | ✅ 必需 |
| 跳转   | 快速跳转到指定页            | ⭕ 可选 |

#### 5.8.2 视觉规范

**字体规范**:

| 元素          | 字体大小                   | 字重                            | 行高  | 颜色变量                      | 说明    |
| ----------- | ---------------------- | ----------------------------- | --- | ------------------------- | ----- |
| **总数/每页条数** | `$font-size-sm` (13px) | `$font-weight-normal` (400)   | 1.5 | `$law-gray-600` (#455A64) | 辅助信息  |
| **页码按钮-默认** | `$font-size-sm` (13px) | `$font-weight-normal` (400)   | 1.5 | `$law-gray-600` (#455A64) | 非激活状态 |
| **页码按钮-激活** | `$font-size-sm` (13px) | `$font-weight-semibold` (600) | 1.5 | `$law-primary` (#1A5F7A)  | 当前页   |
| **上一页/下一页** | `$font-size-sm` (13px) | `$font-weight-normal` (400)   | 1.5 | `$law-gray-600` (#455A64) | 导航按钮  |
| **跳转输入框**   | `$font-size-sm` (13px) | `$font-weight-normal` (400)   | 1.5 | `$law-gray-700` (#37474F) | 输入文字  |

**尺寸规范**:

| 元素        | 尺寸                  | 圆角  | 间距       |
| --------- | ------------------- | --- | -------- |
| **页码按钮**  | 32px × 32px         | 4px | 按钮间距 4px |
| **导航按钮**  | 32px × 32px         | 4px | -        |
| **每页选择器** | 高度 32px             | 4px | -        |
| **跳转输入框** | 高度 32px             | 4px | -        |
| **容器内边距** | `$spacing-4` (16px) | -   | -        |

**颜色规范**:

| 状态     | 背景色                        | 文字色             | 边框色                      | 说明    |
| ------ | -------------------------- | --------------- | ------------------------ | ----- |
| **默认** | 透明                         | `$law-gray-600` | 无                        | 常规状态  |
| **悬停** | `rgba($law-gray-100, 0.5)` | `$law-primary`  | 无                        | 鼠标悬停  |
| **激活** | `rgba($law-primary, 0.1)`  | `$law-primary`  | 无                        | 当前页码  |
| **禁用** | 透明                         | `$law-gray-300` | 无                        | 首页/末页 |
| **焦点** | 透明                         | `$law-primary`  | `2px solid $law-primary` | 键盘导航  |

#### 5.8.3 交互状态

**状态说明**:

```
┌─────────────────────────────────────────────────────────┐
│ 交互状态图示                                            │
│                                                         │
│ 默认状态:    [ 1 ] [ 2 ] [ 3 ]                         │
│              □ 灰色文字，无背景                         │
│                                                         │
│ 激活状态:    [ 1 ] [●2●] [ 3 ]                         │
│              ● 主题色文字 + 浅背景 + 加粗               │
│                                                         │
│ 悬停状态:    [ 1 ] [▣2▣] [ 3 ]                         │
│              ▣ 主题色文字 + 浅灰背景                    │
│                                                         │
│ 禁用状态:    [<] [ 1 ] [ 2 ] [ 3 ] [>]                 │
│              [] 禁用时显示浅灰色，不可点击               │
│                                                         │
│ 焦点状态:    [ 1 ] [⊞2⊞] [ 3 ]                         │
│              ⊞ 2px 主题色边框 + 2px 偏移（键盘导航）    │
└─────────────────────────────────────────────────────────┘
```

**动画规范**:

| 交互类型     | 时长    | 缓动函数        | 说明       |
| -------- | ----- | ----------- | -------- |
| **悬停过渡** | 200ms | ease        | 所有可交互元素  |
| **点击反馈** | 100ms | ease-out    | 按下状态     |
| **页码切换** | 300ms | ease-in-out | 切换动画（可选） |

#### 5.8.4 响应式规则

| 屏幕尺寸               | 显示元素     | 隐藏元素       | 调整   |
| ------------------ | -------- | ---------- | ---- |
| **≥ 1024px**       | 全部元素     | 无          | 标准布局 |
| **768px - 1023px** | 页码、导航、总数 | 每页数量、跳转    | 精简布局 |
| **< 768px**        | 页码、导航    | 总数、每页数量、跳转 | 极简布局 |

**移动端适配**:

```scss
// 小屏幕优化
@media (max-width: 768px) {
  .pagination-container {
    // 隐藏部分元素
    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      display: none;
    }

    // 缩小页码按钮
    .el-pager li {
      min-width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }
}
```

#### 5.8.5 可访问性要求

**键盘导航**:

- 所有按钮可通过 Tab 键访问
- 焦点顺序：每页数量 → 上一页 → 页码 1-N → 下一页 → 跳转输入框
- 焦点样式：2px 主题色边框 + 2px 偏移

**ARIA 标签**:

```html
<!-- 示例 ARIA 标签 -->
<div role="navigation" aria-label="分页导航">
  <button aria-label="上一页" :disabled="isFirstPage">
    <i class="el-icon-arrow-left"></i>
  </button>
  <button aria-label="第1页" aria-current="page">1</button>
  <button aria-label="第2页">2</button>
  <button aria-label="下一页" :disabled="isLastPage">
    <i class="el-icon-arrow-right"></i>
  </button>
</div>
```

**对比度要求**:

- 所有文字与背景对比度 ≥ 4.5:1 (WCAG AA)
- 焦点边框与背景对比度 ≥ 3:1

#### 5.8.6 实现代码

**SCSS 实现**:

```scss
// ========== 分页组件规范 ==========
// 根据设计规范 5.8 分页组件
// 符合 Data-Dense Dashboard 风格要求

.pagination-container {
  background: $law-bg-paper;
  padding: $spacing-4 $spacing-4;  // 统一使用间距令牌 (16px)
  border-top: 1px solid $law-gray-200;  // 添加视觉分隔

  ::v-deep .el-pagination {
    // 总数和每页显示文字 - 符合规范
    .el-pagination__total,
    .el-pagination__sizes {
      font-size: $font-size-sm;           // 13px
      font-weight: $font-weight-normal;    // 400
      color: $law-gray-600;               // #455A64
      line-height: $line-height-normal;    // 1.5
    }

    // 页码按钮 - 使用执法场景主题色
    .el-pager li {
      font-size: $font-size-sm;           // 13px
      font-weight: $font-weight-normal;    // 400
      color: $law-gray-600;               // 辅助信息颜色
      min-width: 32px;
      height: 32px;
      line-height: $line-height-normal;    // 1.5
      border-radius: 4px;
      transition: all 0.2s ease;          // 平滑过渡 200ms

      &.active {
        color: $law-primary;              // #1A5F7A 执法主题色
        background-color: rgba($law-primary, 0.1);
        font-weight: $font-weight-semibold; // 600 - 激活状态加粗
      }

      &:hover:not(.active) {
        color: $law-primary;              // 悬停使用主题色
        background-color: rgba($law-gray-100, 0.5);
      }

      // 键盘导航焦点状态
      &:focus {
        outline: 2px solid $law-primary;
        outline-offset: 2px;
      }
    }

    // 上一页/下一页按钮
    .btn-prev,
    .btn-next {
      font-size: $font-size-sm;
      color: $law-gray-600;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        color: $law-primary;
        background-color: rgba($law-gray-100, 0.5);
      }

      &:disabled {
        color: $law-gray-300;            // 禁用状态更明显
        cursor: not-allowed;
      }

      // 键盘导航焦点状态
      &:focus {
        outline: 2px solid $law-primary;
        outline-offset: 2px;
      }

      i {
        font-size: 12px;
      }
    }

    // 每页显示选择器
    .el-pagination__sizes .el-select .el-input .el-input__inner {
      font-size: $font-size-sm;
      color: $law-gray-600;
      border-radius: 4px;
    }

    // 跳转输入框
    .el-pagination__jump {
      font-size: $font-size-sm;
      color: $law-gray-600;

      input {
        font-size: $font-size-sm;
        color: $law-gray-700;
        border-radius: 4px;

        &:focus {
          border-color: $law-primary;     // 焦点使用主题色
        }
      }
    }

    // 响应式适配 - 小屏幕优化
    @media (max-width: 768px) {
      .el-pagination__total,
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;  // 小屏幕隐藏部分元素
      }

      .el-pager li {
        min-width: 28px;
        height: 28px;
        font-size: 12px;
      }
    }
  }
}
```

**Vue 组件使用**:

```vue
<template>
  <pagination
    v-show="total > 0"
    :total="total"
    :page.sync="queryParams.pageIndex"
    :limit.sync="queryParams.pageSize"
    :page-sizes="[10, 20, 30, 50]"
    layout="total, sizes, prev, pager, next, jumper"
    @pagination="getList"
  />
</template>
```

#### 5.8.7 设计原则

1. **数据密度优先** - 紧凑布局适合数据密集型场景
2. **视觉层次清晰** - 激活状态使用主题色高亮
3. **交互反馈及时** - 200ms 过渡动画提供流畅体验
4. **键盘导航友好** - 明显焦点状态支持无障碍访问
5. **响应式适配** - 小屏幕自动精简显示元素
6. **设计令牌统一** - 使用项目统一的设计变量系统

## 6. 确认对话框规范

### 6.1 概述

确认对话框（Confirm Dialog）用于在执行重要或破坏性操作前获取用户明确同意。规范化的确认对话框可以提升用户体验，减少误操作。

### 6.2 对话框类型

根据操作的危险程度，确认对话框分为三种类型：

| 操作类型      | 语义类型              | 图标颜色  | 使用场景              |
| --------- | ----------------- | ----- | ----------------- |
| **破坏性操作** | `type: "warning"` | 橙色/红色 | 删除、批量删除、撤销不可恢复的操作 |
| **重要操作**  | `type: "info"`    | 蓝色    | 导出、发布、状态变更        |
| **常规操作**  | 不使用确认框            | -     | 搜索、筛选、视图切换        |

### 6.3 对话框结构

#### 6.3.1 结构组成

```
┌─────────────────────────────────────────┐
│ [图标] 标题（如：确认删除）              │
├─────────────────────────────────────────┤
│                                         │
│ 确认消息内容                             │
│ • 清晰说明将要执行的操作                 │
│ • 对于破坏性操作，提示不可恢复           │
│                                         │
├─────────────────────────────────────────┤
│              [取消]  [操作名称]          │
└─────────────────────────────────────────┘
```

#### 6.3.2 元素规范

**标题规范**:
| 操作类型 | 标题格式 | 示例 |
|---------|---------|------|
| 删除操作 | "确认删除" | 确认删除 |
| 导出操作 | "导出确认" | 导出确认 |
| 发布操作 | "发布确认" | 发布确认 |

**消息内容规范**:

- 单条操作：`是否确认[操作][对象]？此操作不可恢复。`
- 批量操作：`是否确认[操作]选中的 N 条[对象]？此操作不可恢复。`

**按钮规范**:
| 按钮 | 破坏性操作 | 非破坏性操作 |
|------|-----------|-------------|
| 主操作按钮 | 使用操作名称（如"删除"） | 使用操作名称（如"导出"） |
| 取消按钮 | "取消" | "取消" |
| 排列 | 取消在前，删除在后 | 取消在前，导出在后 |

### 6.4 实现示例

#### 6.4.1 删除操作

```javascript
async handleDelete(row) {
  try {
    // 获取要删除的ID
    const incidentRecordIds = row?.id
      ? row.id
      : this.selectedIncidentRecords.map((item) => item.id);

    // 计算删除数量，生成合适的确认消息
    const count = Array.isArray(incidentRecordIds) ? incidentRecordIds.length : 1;
    const confirmMessage = count > 1
      ? `是否确认删除选中的 ${count} 条警情记录？此操作不可恢复。`
      : `是否确认删除此条警情记录？此操作不可恢复。`;

    await this.$confirm(confirmMessage, "确认删除", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",  // 使用 warning 类型显示警告色
    });

    // 执行删除操作...
  } catch (error) {
    // 用户取消操作，不显示错误
    if (error.message !== "cancel") {
      this.msgError("删除警情失败：" + (error.message || "未知错误"));
    }
  }
}
```

#### 6.4.2 导出操作

```javascript
async handleExport() {
  try {
    const hasSelection = this.selectedIncidentRecords?.length > 0;
    const count = hasSelection ? this.selectedIncidentRecords.length : 0;

    const confirmText = hasSelection
      ? `是否确认导出已勾选的 ${count} 条警情数据？`
      : "是否确认导出所有警情数据项？";

    await this.$confirm(confirmText, "导出确认", {
      confirmButtonText: "导出",
      cancelButtonText: "取消",
      type: "info",
    });

    // 执行导出操作...
  } catch (error) {
    if (error !== "cancel") {
      this.msgError("导出失败：" + (error.message || "未知错误"));
    }
  }
}
```

### 6.5 设计原则

1. **语义化类型**：破坏性操作必须使用 `type: "warning"`，非破坏性操作使用 `type: "info"`
2. **清晰的标题**：标题应明确表达操作意图，如"确认删除"、"导出确认"
3. **具体的消息**：消息内容应具体说明操作范围（单条/批量），破坏性操作应提示"不可恢复"
4. **动作导向的按钮**：主操作按钮使用动作名称（如"删除"、"导出"），而非通用的"确定"
5. **取消操作处理**：正确处理用户取消操作，不显示错误提示
6. **消息长度控制**：批量操作时使用数量而非具体列表，避免消息过长

### 6.6 无障碍要求

- 对话框应能通过键盘 ESC 键关闭
- 焦点应自动进入对话框，关闭后返回触发元素
- 按钮应有明确的焦点状态
- 对话框应有 `role="dialog"` 或 `role="alertdialog"` 属性

### 6.7 测试要点

- [ ] 破坏性操作显示警告色（warning）
- [ ] 批量操作消息显示数量而非具体列表
- [ ] 消息中包含"不可恢复"提示（破坏性操作）
- [ ] 按钮文本使用动作名称而非"确定"
- [ ] 用户取消操作时不显示错误提示

## 7. 实现顺序

1. **设计令牌系统** - 创建颜色、间距、字体变量文件
2. **查询表单组件** - 实现统一搜索框、快捷筛选、高级筛选面板
3. **表格操作区** - 实现批量操作栏、操作列、状态列
4. **弹窗表单** - 实现可折叠分组和时间线可视化
5. **确认对话框** - 规范化删除、导出等操作的确认对话框
6. **全局样式应用** - 将新配色应用到其他组件

## 8. 测试要点

### 7.1 查询表单

- [ ] 快捷筛选切换后表格数据正确更新
- [ ] 高级筛选面板折叠/展开动画流畅
- [ ] 时间范围勾选后日期选择器正确显示/隐藏

### 7.2 批量操作

- [ ] 批量操作栏在选中/取消选中时正确显示/隐藏
- [ ] 跨分页选中状态正确保持

### 7.3 表格显示

- [ ] 状态列色块与状态文字正确对应
- [ ] 表格字体大小、颜色符合规范
- [ ] 操作列宽度固定为 240px

### 7.4 弹窗表单

- [ ] 弹窗表单时间线随时间输入实时更新
- [ ] 可折叠分组默认展开状态正确

### 7.5 分页组件

- [ ] 页码切换后数据正确更新
- [ ] 每页数量选择后正确刷新数据
- [ ] 首页/末页时上一页/下一页按钮正确禁用
- [ ] 跳转输入框只允许输入有效页码
- [ ] 当前页码正确高亮显示（主题色 + 浅背景 + 加粗）
- [ ] 悬停状态颜色正确（主题色 + 浅灰背景）
- [ ] 焦点状态边框可见（2px 主题色边框 + 2px 偏移）
- [ ] 动画过渡流畅（200ms ease）

### 7.6 响应式

- [ ] 小屏幕（<768px）自动隐藏总数、每页数量、跳转
- [ ] 小屏幕页码按钮正确缩小（28px × 28px）

### 7.7 可访问性

- [ ] 所有交互元素满足 44×44px 最小点击区域
- [ ] 颜色对比度符合 WCAG 4.5:1 标准
- [ ] 键盘 Tab 键可遍历所有分页按钮
- [ ] 焦点顺序符合视觉顺序
- [ ] 屏幕阅读器可正确识别分页元素（ARIA 标签）

### 4.4 警情详情对话框

#### 4.4.1 对话框结构

警情详情对话框应使用可折叠分组结构，与编辑对话框保持一致的视觉层次。

**组件结构**:

```
el-dialog (详情对话框)
├── el-collapse (可折叠分组)
│   ├── el-collapse-item (基础信息)
│   │   ├── section-header (分组头部: 图标 + 标题 + 徽章)
│   │   └── el-descriptions (描述列表)
│   ├── el-collapse-item (时间流程)
│   │   ├── section-header (分组头部)
│   │   ├── timeline-preview (时间线可视化)
│   │   └── el-descriptions (描述列表)
│   ├── el-collapse-item (执法信息)
│   │   ├── section-header (分组头部)
│   │   └── el-descriptions (描述列表)
│   ├── el-collapse-item (组织与人员)
│   │   ├── section-header (分组头部)
│   │   └── el-descriptions (描述列表)
│   └── el-collapse-item (状态与操作)
│       ├── section-header (分组头部)
│       └── el-descriptions (描述列表)
└── dialog-footer (底部操作按钮)
```

#### 4.4.2 对话框宽度

**对话框宽度规范**:

| 对话框类型    | 固定宽度    | 说明                        |
| -------- | ------- | ------------------------- |
| 修改/添加对话框 | `800px` | 编辑表单使用固定宽度                |
| 详情对话框    | `800px` | 详情查看使用与编辑对话框相同的宽度，保持视觉一致性 |

**设计原则**:

- 所有对话框使用统一的 800px 固定宽度，确保视觉一致性
- 详情对话框与编辑对话框宽度相同，用户在切换查看/编辑时体验更流畅
- 固定宽度避免了响应式调整可能带来的布局跳动问题

#### 4.4.3 分组内容组织

**分组结构**:

| 分组名称  | 图标                        | 字段数量 | 包含字段                                 |
| ----- | ------------------------- | ---- | ------------------------------------ |
| 基础信息  | `el-icon-document`        | 6项   | 警情编号、警情标题、报警人姓名、报警电话、报警地址、报警内容       |
| 时间流程  | `el-icon-time`            | 5个节点 | 报警时间、接警时间、处警时间、结束时间、创建时间             |
| 执法信息  | `el-icon-user`            | 6项   | 处警单编号、接警单编号、反馈单编号、警情监督类型、案件编号、归档编号   |
| 组织与人员 | `el-icon-office-building` | 5项   | 处警组织路径、处警组织名称、组织编码、组织简称、处警人员         |
| 状态与操作 | `el-icon-info`            | 8项   | 状态、是否关联、处警结果、创建用户、创建用户警号、更新用户、更新用户警号 |

#### 4.4.4 默认展开状态

**默认展开分组** (优先级从高到低):

1. `basic` - 基础信息（最常查看）
2. `timeline` - 时间流程（核心业务流程）
3. `status` - 状态与操作（关键状态信息）

**默认折叠分组**:

- `enforcement` - 执法信息（次要信息）
- `organization` - 组织与人员（次要信息）

```javascript
data() {
  return {
    activeDetailSections: ['basic', 'timeline', 'status'],
    // ...
  }
}
```

#### 4.4.5 时间线可视化

**时间线节点**:

```
报警 ━━ 接警 ━━ 处警 ━━ 结束
 ●      ●      ●      ●
```

**激活状态**:

- 当时间字段有值时，节点变为激活状态
- 激活节点使用主题色填充
- 激活节点标签使用加粗字重

**实现代码**:

```vue
<div class="timeline-preview">
  <div class="timeline-item" :class="{ active: viewData.reportTime }">
    <span class="timeline-dot"></span>
    <span class="timeline-label">报警</span>
  </div>
  <div class="timeline-line"></div>
  <div class="timeline-item" :class="{ active: viewData.receiveTime }">
    <span class="timeline-dot"></span>
    <span class="timeline-label">接警</span>
  </div>
  <div class="timeline-line"></div>
  <div class="timeline-item" :class="{ active: viewData.processTime }">
    <span class="timeline-dot"></span>
    <span class="timeline-label">处警</span>
  </div>
  <div class="timeline-line"></div>
  <div class="timeline-item" :class="{ active: viewData.endTime }">
    <span class="timeline-dot"></span>
    <span class="timeline-label">结束</span>
  </div>
</div>
```

#### 4.4.6 描述列表规范

**列数设置**:

- 大部分字段使用 `:column="2"`（双列布局）
- 长文本字段使用 `:span="2"`（跨两列显示）

**长文本字段** (使用 `:span="2"`):

- 警情标题
- 报警地址
- 报警内容
- 处警结果
- 处警组织路径

**不换行字段** (使用 `<span class="nowrap-text">` 包裹):

- 报警电话
- 警情编号
- 处警单编号
- 接警单编号
- 反馈单编号
- 案件编号
- 归档编号
- 组织编码

**实现方式**:
由于 Element UI 的 `class-name` 属性在某些版本中不稳定，推荐使用 `<span>` 标签包裹不换行内容的方式。

**设计原则**:

1. **长文本字段**: 应占据整行（`:span="2"`），避免换行影响可读性
2. **编号类字段**: 应防止换行（`class-name="nowrap-cell"`），保持完整性
3. **普通字段**: 使用双列布局，提高空间利用率
4. **最小宽度**: 不换行字段内容区域最小宽度 140px，确保内容可见

**实现示例**:

```vue
<el-descriptions :column="2" border class="section-descriptions">
  <!-- 普通字段 - 双列布局 -->
  <el-descriptions-item label="警情编号">
    <span class="nowrap-text">{{ viewData.code || "-" }}</span>
  </el-descriptions-item>

  <!-- 长文本字段 - 占据整行 -->
  <el-descriptions-item label="警情标题" :span="2">{{ viewData.title || "-" }}</el-descriptions-item>

  <!-- 不换行字段 - 使用 nowrap-text 类包裹 -->
  <el-descriptions-item label="报警电话">
    <span class="nowrap-text">{{ viewData.tel || "-" }}</span>
  </el-descriptions-item>

  <!-- 长文本字段 - 占据整行 -->
  <el-descriptions-item label="报警地址" :span="2">{{ viewData.address || "-" }}</el-descriptions-item>
  <el-descriptions-item label="报警内容" :span="2">{{ viewData.context || "-" }}</el-descriptions-item>
</el-descriptions>
```

**样式定义**:

```scss
.section-descriptions {
  ::v-deep .el-descriptions-item__label {
    width: 100px;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $law-gray-700;
    line-height: $line-height-normal;
  }

  ::v-deep .el-descriptions-item__content {
    font-size: $font-size-base;
    font-weight: $font-weight-normal;
    color: $law-gray-900;
    line-height: $line-height-normal;
    word-break: break-word;
  }

  // 不换行文本样式（用于手机号、编号等）
  .nowrap-text {
    white-space: nowrap !important;
    word-break: keep-all !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    min-width: 150px !important;
    display: inline-block !important;
  }
}
```

#### 4.4.7 样式规范

**详情折叠面板样式**:

```scss
.detail-collapse {
  border: none;

  .detail-section {
    margin-bottom: $spacing-4;
    border-radius: 8px;
    overflow: hidden;

    ::v-deep .el-collapse-item__header {
      height: 48px;
      background-color: $law-bg-default;
      border: none;
      padding: 0 $spacing-4;
      transition: all 0.3s ease;

      &:hover {
        background-color: darken($law-bg-default, 2%);
      }
    }

    ::v-deep .el-collapse-item__wrap {
      border: none;
      background-color: $law-bg-paper;
    }

    ::v-deep .el-collapse-item__content {
      padding: $spacing-4;
    }
  }
}

.section-descriptions {
  ::v-deep .el-descriptions-item__label {
    width: 120px;
    font-weight: $font-weight-medium;
    color: $law-gray-700;
  }

  ::v-deep .el-descriptions-item__content {
    color: $law-gray-900;
  }
}
```

#### 4.4.8 设计原则

1. **视觉一致性**: 详情对话框与编辑对话框使用相同的分组结构
2. **信息层次**: 通过可折叠分组建立清晰的信息层次
3. **渐进式披露**: 默认展开核心信息，次要信息可折叠
4. **响应式设计**: 根据屏幕尺寸调整对话框宽度
5. **时间可视化**: 使用时间线组件直观展示业务流程
6. **空值处理**: 所有空值字段显示为 "-"，避免空白

#### 4.4.9 字体规范

详情对话框中各元素的字体必须符合以下规范：

**对话框标题**:
| 元素 | 字体大小 | 字重 | 行高 | 颜色变量 |
|------|----------|------|------|----------|
| 对话框标题 | `$font-size-lg` (18px) | `$font-weight-semibold` (600) | `$line-height-normal` (1.5) | `$law-gray-900` (#1A1A1A) |

**分组头部**:
| 元素 | 字体大小 | 字重 | 行高 | 颜色变量 |
|------|----------|------|------|----------|
| 图标 | `$font-size-lg` (18px) | - | - | `$law-primary` (#1A5F7A) |
| 标题 | `$font-size-md` (16px) | `$font-weight-semibold` (600) | `$line-height-normal` (1.5) | `$law-gray-900` (#1A1A1A) |
| 徽章 | `$font-size-xs` (12px) | `$font-weight-normal` (400) | `$line-height-normal` (1.5) | `$law-primary` (#1A5F7A) |

**描述列表**:
| 元素 | 字体大小 | 字重 | 行高 | 颜色变量 | 说明 |
|------|----------|------|------|----------|------|
| 标签 | `$font-size-sm` (13px) | `$font-weight-medium` (500) | `$line-height-normal` (1.5) | `$law-gray-700` (#546E7A) | 字段名称 |
| 内容 | `$font-size-base` (14px) | `$font-weight-normal` (400) | `$line-height-normal` (1.5) | `$law-gray-900` (#1A1A1A) | 字段值 |

**时间线**:
| 元素 | 字体大小 | 字重 | 行高 | 颜色变量 | 说明 |
|------|----------|------|------|----------|------|
| 标签（非激活） | `$font-size-sm` (13px) | `$font-weight-normal` (400) | `$line-height-normal` (1.5) | `$law-gray-600` (#455A64) | 默认状态 |
| 标签（激活） | `$font-size-sm` (13px) | `$font-weight-medium` (500) | `$line-height-normal` (1.5) | `$law-primary` (#1A5F7A) | 激活状态 |

**实现代码**:

```scss
// 对话框标题
::v-deep .incident-detail-dialog {
  .el-dialog__title {
    font-size: $font-size-lg;            // 18px
    font-weight: $font-weight-semibold;  // 600
    color: $law-gray-900;
    line-height: $line-height-normal;    // 1.5
  }
}

// 分组头部
.section-header {
  .section-title {
    font-size: $font-size-md;            // 16px
    font-weight: $font-weight-semibold;  // 600
    color: $law-gray-900;
    line-height: $line-height-normal;    // 1.5
  }

  .section-badge {
    font-size: $font-size-xs;            // 12px
    font-weight: $font-weight-normal;    // 400
    line-height: $line-height-normal;    // 1.5
  }
}

// 描述列表
.section-descriptions {
  ::v-deep .el-descriptions-item__label {
    font-size: $font-size-sm;            // 13px
    font-weight: $font-weight-medium;    // 500
    color: $law-gray-700;
    line-height: $line-height-normal;    // 1.5
  }

  ::v-deep .el-descriptions-item__content {
    font-size: $font-size-base;          // 14px
    font-weight: $font-weight-normal;    // 400
    color: $law-gray-900;
    line-height: $line-height-normal;    // 1.5
  }
}

// 时间线
.timeline-preview {
  .timeline-label {
    font-size: $font-size-sm;            // 13px
    color: $law-gray-600;
    font-weight: $font-weight-normal;    // 400
    line-height: $line-height-normal;    // 1.5
  }

  .active .timeline-label {
    font-weight: $font-weight-medium;    // 500
  }
}
```

## 8. 更新记录

### 2026-03-18 - 对话框宽度统一规范

**问题描述**: 详情对话框与修改对话框使用不同的宽度，导致用户在切换查看/编辑时视觉体验不一致。

**优化方案**:

- 详情对话框宽度从响应式（700px/600px/95%）改为固定 800px
- 与修改/添加对话框保持统一的 800px 宽度
- 删除响应式宽度相关的代码逻辑（`detailDialogWidth`、`updateDetailDialogWidth` 方法）
- 简化对话框宽度规范，所有对话框使用统一宽度

**修改文件**:

- `src/views/evidencemanage/incidentrecordquery/index.vue`
  - 详情对话框从 `:width="detailDialogWidth"` 改为 `width="800px"`
  - 删除 `detailDialogWidth` 数据属性
  - 删除 `mounted`/`beforeDestroy` 中的响应式宽度相关代码
  - 删除 `updateDetailDialogWidth()` 方法
- `src/views/evidencemanage/incidentrecordquery/styles/index.scss`
  - 保留移动端对对话框内部内容的样式适配（标签宽度、内边距等）
- `docs/界面规范/2026-03-15-incident-record-query-ux-design.md`
  - 更新第 4.4.2 节：对话框宽度规范
  - 更新附录 A 常用组件规范速查表

**设计原则**:

- 视觉一致性：所有对话框使用统一宽度，减少用户视觉跳跃
- 简化实现：使用固定宽度避免响应式调整带来的布局跳动
- 用户体验：用户在查看和编辑之间切换时，界面保持稳定

### 2026-03-18 - 列设置对话框规范

**新增内容**:

- 新增第 7 节：列设置对话框规范
- 包括对话框结构、无障碍性规范、触控与交互规范、视觉规范、响应式规范
- 新增禁用状态说明、数据持久化、实现代码、测试要点
- 新增设计原则

**问题修复**:

- 添加 ARIA 标签（role、aria-label、aria-haspopup）
- 实现键盘焦点管理（打开后自动进入第一个复选框）
- 扩大触控区域到 ≥44×44px
- 添加禁用状态的视觉说明（图标 + Tooltip）
- 优化响应式适配（移动端宽度自适应）
- 添加悬停和焦点状态的视觉反馈

**设计原则**:

- 渐进式披露：将高级配置放在 Popover 中，不占用主界面空间
- 即时反馈：列的显示/隐藏立即生效，无需额外确认
- 记忆用户偏好：使用 localStorage 保存用户选择
- 清晰的禁用说明：对固定列提供明确的视觉和文本说明
- 完整的键盘支持：所有操作都可通过键盘完成
- 触控友好：确保所有交互元素有足够的触控区域

### 2026-03-17 - 详情对话框字段布局优化

**问题描述**: 详情对话框中部分字段布局不合理，导致：

1. "警情标题"字段内容较长，在双列布局中出现换行，影响可读性
2. "报警电话"（手机号）在单元格较小时出现换行，不符合使用习惯
3. 其他编号类字段（警情编号、案件编号等）也可能出现类似问题
4. 缺少关于字段换行的明确规范

**优化方案**:

- "警情标题"：改为占据整行（`:span="2"`），给足空间显示完整标题
- "报警电话"：使用 `<span class="nowrap-text">` 包裹，强制不换行，设置最小宽度 150px
- 其他编号类字段：统一使用 `<span class="nowrap-text">` 包裹，包括：
  - 警情编号
  - 处警单编号
  - 接警单编号
  - 反馈单编号
  - 案件编号
  - 归档编号
  - 组织编码
- 补充第 4.4.6 节：描述列表规范，新增"不换行字段"分类
- 新增样式定义：`.nowrap-text` 类，设置 `white-space: nowrap`、`min-width: 150px`
- 标签宽度从 120px 减少到 100px，给内容更多空间

**技术说明**:

- 由于 Element UI 的 `class-name` 属性在某些版本中不稳定或支持有限，改用 `<span>` 标签直接包裹不换行内容的方式
- 使用 `!important` 确保样式优先级高于 Element UI 默认样式
- 使用 `display: inline-block` 确保宽度约束生效

**设计原则**:

- 长文本优先：较长字段应占据整行，避免换行影响可读性
- 编号不换行：编号类字段应保持完整，便于阅读和复制
- 最小宽度保证：不换行字段设置最小宽度 140px，确保内容可见
- 溢出处理：超长内容使用省略号（`text-overflow: ellipsis`）提示

### 2026-03-17 - 警情详情对话框字体规范

**问题描述**: 详情对话框中各文字元素缺少明确的字体规范定义，导致：

1. 分组标题使用 15px，不在标准字体 scale 中
2. 描述列表标签和内容缺少字体大小、字重、行高定义
3. 时间线标签使用 12px 偏小，且非激活状态颜色使用了 gray-500 而非 gray-600
4. 对话框标题未自定义样式

**优化方案**:

- 分组标题：从 15px 改为 `$font-size-md` (16px)
- 描述列表标签：添加 `$font-size-sm` (13px)、`$font-weight-medium` (500)、`$line-height-normal` (1.5)
- 描述列表内容：添加 `$font-size-base` (14px)、`$font-weight-normal` (400)、`$line-height-normal` (1.5)
- 时间线标签：从 12px 改为 `$font-size-sm` (13px)，颜色从 `$law-gray-500` 改为 `$law-gray-600`
- 对话框标题：添加 `$font-size-lg` (18px)、`$font-weight-semibold` (600)、`$line-height-normal` (1.5)
- 新增第 4.4.9 节：详情对话框字体规范

**设计原则**:

- 标准化：所有字体大小使用标准 scale (12/13/14/16/18px)
- 层次感：通过字体大小和字重建立视觉层次
- 一致性：对话框内所有文字元素遵循统一的字体规范

### 2026-03-17 - 警情详情对话框规范

**新增内容**:

- 新增第 4.4 节：警情详情对话框设计规范
- 包括对话框结构、响应式宽度、分组内容组织、默认展开状态、时间线可视化、描述列表规范、样式规范

**设计原则**:

- 视觉一致性：详情对话框与编辑对话框使用相同的分组结构
- 信息层次：通过可折叠分组建立清晰的信息层次
- 渐进式披露：默认展开核心信息，次要信息可折叠

### 2026-03-17 - 搜索区域紧凑化优化

**问题描述**: 高级筛选面板与搜索/重置按钮之间间距过大，导致搜索区域看起来不够紧凑。

**优化方案**:

- 将 `.advanced-filter-section` 的 `margin-bottom` 从 `$spacing-4` (16px) 减小到 `$spacing-2` (8px)
- 将 `.action-buttons` 的 `padding-top` 从 `$spacing-3` (12px) 减小到 `0`

**设计原则**:

- 紧凑布局：减少不必要的空白，让搜索区域内容更加紧凑
- 保持视觉层次：虽然缩小了间距，但仍然保持各功能区域的视觉分隔

**适用场景**: 其他页面的搜索/筛选区域可参考此间距规范，实现紧凑的布局效果。

### 2026-03-17 - 修改对话框规范更新

**问题描述**: 修改/添加对话框宽度不符合实际需求，表单标签格式不统一，分组徽章硬编码。

**优化方案**:

- 修改/添加对话框宽度规范从 700px 改为 800px 固定宽度
- 新增第 5.7.1 节：表单标签格式规范，明确标签不包含冒号
- 新增第 5.5.1 节：分组徽章规范，要求动态计算字段数量
- 修改对话框宽度规范，区分编辑对话框（800px 固定）和详情对话框（响应式）

**设计原则**:

- 固定宽度：编辑对话框需要更多空间展示表单控件，使用固定宽度确保一致性
- 标签简洁：表单标签不包含冒号，减少视觉噪音
- 动态徽章：分组徽章数量应动态计算，确保准确性并便于维护

### 2026-03-17 - 确认对话框规范

**问题描述**：删除和导出操作的确认对话框缺少统一的规范，存在以下问题：

1. 删除操作使用 `type: "info"` 而非 `type: "warning"`，未体现操作的危险性
2. 对话框标题使用通用文本（"信息"、"提示"），未明确操作类型
3. 批量删除时直接拼接警情编号，导致消息过长
4. 确认消息缺少"不可恢复"提示
5. 主操作按钮使用"确定"而非动作名称

**优化方案**：

- 新增第 6 节：确认对话框规范，包括类型、结构、实现示例
- 删除操作使用 `type: "warning"` 显示警告色
- 标题改为操作类型名称（如"确认删除"、"导出确认"）
- 批量操作使用数量描述（如"选中的 N 条"）而非具体列表
- 破坏性操作消息添加"此操作不可恢复"提示
- 主操作按钮使用动作名称（如"删除"、"导出"）

**设计原则**：

- 语义化类型：破坏性操作必须使用 warning 类型
- 清晰的标题：标题应明确表达操作意图
- 具体的消息：消息内容应具体说明操作范围和后果
- 动作导向的按钮：按钮使用动作名称而非通用文本
- 取消操作处理：正确处理用户取消，不显示错误提示

## 7. 列设置对话框规范

### 7.1 概述

列设置对话框（Column Settings Popover）允许用户自定义表格列的显示/隐藏状态，是数据表格的重要辅助功能。

### 7.2 对话框结构

#### 7.2.1 结构组成

```
┌─────────────────────────────────────────┐
│ 列显示设置              [重置]          │
├─────────────────────────────────────────┤
│ ☑ 警情号 (ℹ️)                          │
│ ☑ 报警人姓名                           │
│ ☐ 报警内容                             │
│ ☐ 处警单编号                           │
│ ...                                    │
└─────────────────────────────────────────┘
```

**元素说明**:

| 元素     | 说明                      | 必需   |
| ------ | ----------------------- | ---- |
| 标题     | "列显示设置"，使用 semibold 字重  | ✅ 必需 |
| 重置按钮   | 恢复所有列到默认显示状态            | ✅ 必需 |
| 列选项    | 复选框列表，显示列名称             | ✅ 必需 |
| 必须显示标识 | 固定列使用图标 ℹ️ 和 tooltip 说明 | ✅ 必需 |
| 滚动条    | 列数量较多时显示                | ⭕ 条件 |

### 7.3 无障碍性规范

#### 7.3.1 ARIA 标签

| 属性                 | 值              | 说明                |
| ------------------ | -------------- | ----------------- |
| `role`             | `dialog`       | 标识 Popover 内容为对话框 |
| `aria-label`       | `"列显示设置"`      | 描述对话框用途           |
| `aria-haspopup`    | `dialog`       | 触发按钮声明弹出类型        |
| `aria-label` (按钮)  | `"打开列设置"`      | 触发按钮的可访问标签        |
| `aria-label` (禁用项) | `"{列名}（必须显示）"` | 禁用复选框的额外说明        |

#### 7.3.2 键盘导航

| 操作    | 按键              | 说明           |
| ----- | --------------- | ------------ |
| 打开对话框 | Enter / Space   | 在触发按钮上按下     |
| 关闭对话框 | ESC             | 关闭并返回焦点到触发按钮 |
| 切换选项  | Space           | 切换复选框状态      |
| 移动焦点  | Tab / Shift+Tab | 在复选框之间移动     |

**焦点管理**:

- 打开后焦点自动进入第一个复选框
- 关闭后焦点返回触发按钮
- 焦点顺序符合视觉顺序

#### 7.3.3 屏幕阅读器支持

```vue
<!-- 触发按钮 -->
<el-button
  aria-label="打开列设置"
  aria-haspopup="dialog"
>
  列设置
</el-button>

<!-- 对话框内容 -->
<div
  role="dialog"
  aria-label="列显示设置"
>
  <!-- 复选框 -->
  <el-checkbox
    :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
  >
    {{ col.label }}
  </el-checkbox>
</div>
```

### 7.4 触控与交互规范

#### 7.4.1 触控区域

| 元素    | 最小尺寸    | 实现方式               |
| ----- | ------- | ------------------ |
| 列项高度  | 44px    | `min-height: 44px` |
| 复选框区域 | 44×44px | 扩大 `::after` 伪元素   |
| 重置按钮  | 32×44px | 默认按钮高度             |

#### 7.4.2 交互反馈

| 状态     | 视觉反馈            | 实现                                |
| ------ | --------------- | --------------------------------- |
| **悬停** | 复选框边框变为主题色      | `border-color: $law-primary`      |
| **焦点** | 2px 主题色边框 + 外发光 | `box-shadow: 0 0 0 2px rgba(...)` |
| **禁用** | 降低透明度 + 鼠标指针变化  | `cursor: not-allowed`             |
| **按下** | 缩放 0.95         | `transform: scale(0.95)` (可选)     |

### 7.5 视觉规范

#### 7.5.1 字体规范

| 元素        | 字体大小                     | 字重                            | 行高                          | 颜色变量                      |
| --------- | ------------------------ | ----------------------------- | --------------------------- | ------------------------- |
| **标题**    | `$font-size-base` (14px) | `$font-weight-semibold` (600) | `$line-height-normal` (1.5) | `$law-gray-900` (#1A1A1A) |
| **重置按钮**  | `$font-size-sm` (13px)   | `$font-weight-normal` (400)   | `$line-height-normal` (1.5) | `$law-primary` (#1A5F7A)  |
| **列选项文字** | `$font-size-base` (14px) | `$font-weight-normal` (400)   | `$line-height-normal` (1.5) | `$law-gray-900` (#1A1A1A) |
| **禁用文字**  | `$font-size-base` (14px) | `$font-weight-normal` (400)   | `$line-height-normal` (1.5) | `$law-gray-400` (#B0BEC5) |

#### 7.5.2 间距规范

| 位置         | 间距值                 | 说明         |
| ---------- | ------------------- | ---------- |
| **头部底部边距** | `$spacing-3` (12px) | 标题与列表之间的分隔 |
| **列项垂直间距** | `$spacing-2` (8px)  | 每列的内边距     |
| **列项最小高度** | 44px                | 触控区域要求     |
| **复选框右边距** | `$spacing-2` (8px)  | 复选框与文字的间距  |
| **图标左边距**  | `$spacing-1` (4px)  | 文字与图标的间距   |

#### 7.5.3 颜色规范

| 状态     | 背景色                        | 文字色             | 边框色            | 说明   |
| ------ | -------------------------- | --------------- | -------------- | ---- |
| **默认** | 透明                         | `$law-gray-900` | 无              | 常规状态 |
| **悬停** | 透明                         | `$law-gray-900` | `$law-primary` | 鼠标悬停 |
| **焦点** | `rgba($law-primary, 0.04)` | `$law-gray-900` | `$law-primary` | 键盘导航 |
| **禁用** | 透明                         | `$law-gray-400` | 无              | 固定列  |
| **选中** | 透明                         | `$law-gray-900` | `$law-primary` | 勾选状态 |

#### 7.5.4 边框与分隔

| 元素       | 样式                         | 颜色              | 宽度  |
| -------- | -------------------------- | --------------- | --- |
| **头部底边** | `border-bottom: 1px solid` | `$law-gray-200` | 1px |
| **列项底边** | `border-bottom: 1px solid` | `$law-gray-100` | 1px |
| **最后一项** | 无                          | -               | -   |

### 7.6 响应式规范

| 屏幕尺寸        | 对话框宽度                | 位置           | 调整         |
| ----------- | -------------------- | ------------ | ---------- |
| **≥ 768px** | 300px (最大 320px)     | `bottom-end` | 标准布局       |
| **< 768px** | `calc(100vw - 32px)` | 左对齐          | 留出 16px 边距 |

**移动端额外调整**:

- 增大触控区域到 48px（如果需要）
- 考虑使用 Drawer 替代 Popover
- 确保在横屏模式下仍可用

### 7.7 禁用状态说明

**固定列的处理**:

固定列（如"警情号"、"操作"）必须始终显示，不能隐藏。对用户来说：

1. **视觉标识**: 禁用的复选框
2. **说明图标**: 使用 `el-icon-info` 图标
3. **Tooltip**: 悬停时显示"此列必须显示，不能隐藏"
4. **ARIA 标签**: `{列名}（必须显示）`

```vue
<el-checkbox
  :label="col.prop"
  :disabled="col.fixed"
  :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
>
  {{ col.label }}
  <el-tooltip
    v-if="col.fixed"
    content="此列必须显示，不能隐藏"
    placement="top"
  >
    <i class="el-icon-info column-item-icon"></i>
  </el-tooltip>
</el-checkbox>
```

### 7.8 数据持久化

**存储方式**: 使用 `localStorage` 保存用户选择

```javascript
// 存储键名
const STORAGE_KEY = 'incident_query_visible_columns';

// 保存选择
localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));

// 读取选择
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    visibleColumns = JSON.parse(saved);
  } catch (error) {
    // 使用默认值
    visibleColumns = defaultColumns;
  }
}
```

**重置功能**: 点击"重置"按钮后：

1. 恢复所有列到 `defaultVisible: true` 的状态
2. 更新 localStorage
3. 显示成功提示："已重置为默认显示"
4. 复选框状态实时更新

### 7.9 实现代码

#### 7.9.1 Vue 模板

```vue
<el-popover
  ref="columnSettingsPopover"
  placement="bottom-end"
  width="300"
  trigger="click"
  popper-class="column-settings-popover"
  :visible-arrow="true"
  @after-enter="handleColumnSettingsOpen"
  @after-leave="handleColumnSettingsClose"
>
  <div
    role="dialog"
    aria-label="列显示设置"
    class="column-settings"
  >
    <div class="column-settings-header">
      <span class="column-settings-title">列显示设置</span>
      <el-button
        type="text"
        size="small"
        class="column-settings-reset"
        @click="resetColumns"
      >
        重置
      </el-button>
    </div>
    <el-checkbox-group v-model="visibleColumns" @change="handleColumnChange">
      <div v-for="col in columnOptions" :key="col.prop" class="column-item">
        <el-checkbox
          :label="col.prop"
          :disabled="col.fixed"
          :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
        >
          {{ col.label }}
          <el-tooltip
            v-if="col.fixed"
            content="此列必须显示，不能隐藏"
            placement="top"
          >
            <i class="el-icon-info column-item-icon"></i>
          </el-tooltip>
        </el-checkbox>
      </div>
    </el-checkbox-group>
  </div>
  <el-button
    slot="reference"
    size="small"
    icon="el-icon-setting"
    type="text"
    class="action-btn tertiary"
    aria-label="打开列设置"
    aria-haspopup="dialog"
  >
    列设置
  </el-button>
</el-popover>
```

#### 7.9.2 JavaScript 方法

```javascript
methods: {
  // 焦点管理 - 打开后进入第一个复选框
  handleColumnSettingsOpen() {
    this.$nextTick(() => {
      const firstCheckbox = document.querySelector(
        ".column-settings-popover .el-checkbox:first-child .el-checkbox__input"
      );
      if (firstCheckbox) {
        firstCheckbox.focus();
      }
    });
  },

  // 焦点管理 - 关闭后返回触发按钮（自动）
  handleColumnSettingsClose() {
    // Element UI 自动处理，无需额外代码
  },

  // 重置列配置
  resetColumns() {
    this.visibleColumns = this.columnOptions.map((item) => item.prop);
    localStorage.setItem(
      "incident_query_visible_columns",
      JSON.stringify(this.visibleColumns)
    );
    this.$message.success("已重置为默认显示");
  },

  // 列变化处理
  handleColumnChange(val) {
    localStorage.setItem(
      "incident_query_visible_columns",
      JSON.stringify(val)
    );
  }
}
```

#### 7.9.3 SCSS 样式

```scss
.column-settings {
  // 头部样式
  .column-settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: $spacing-3;          // 12px
    margin-bottom: $spacing-3;           // 12px
    border-bottom: 1px solid $law-gray-200;

    .column-settings-title {
      font-size: $font-size-base;        // 14px
      font-weight: $font-weight-semibold; // 600
      color: $law-gray-900;              // #1A1A1A
      line-height: $line-height-normal;   // 1.5
    }

    .column-settings-reset {
      font-size: $font-size-sm;          // 13px
      font-weight: $font-weight-normal;   // 400
      color: $law-primary;               // #1A5F7A
      padding: 4px 8px;
      min-height: 32px;

      &:hover {
        background-color: rgba($law-primary, 0.1);
      }

      &:focus {
        outline: 2px solid $law-primary;
        outline-offset: 2px;
      }
    }
  }

  // 列项样式 - 确保触控区域 ≥44px
  .column-item {
    padding: $spacing-2 0;               // 8px 上下间距
    min-height: 44px;                    // 确保触控区域足够 ✓
    display: flex;
    align-items: center;
    border-bottom: 1px solid $law-gray-100;

    &:last-child {
      border-bottom: none;
    }

    ::v-deep .el-checkbox {
      width: 100%;
      display: flex;
      align-items: center;

      // 扩大复选框点击区域
      .el-checkbox__input {
        margin-right: $spacing-2;        // 8px
        &::after {
          content: "";
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
        }
      }

      .el-checkbox__label {
        font-size: $font-size-base;      // 14px
        font-weight: $font-weight-normal; // 400
        color: $law-gray-900;            // #1A1A1A
        line-height: $line-height-normal; // 1.5
        display: flex;
        align-items: center;
        padding-left: $spacing-2;        // 8px
      }

      &.is-disabled .el-checkbox__label {
        color: $law-gray-400;
        cursor: not-allowed;
      }

      &:not(.is-disabled):hover .el-checkbox__inner {
        border-color: $law-primary;
      }

      .el-checkbox__input:focus .el-checkbox__inner {
        border-color: $law-primary;
        box-shadow: 0 0 0 2px rgba($law-primary, 0.2);
      }
    }

    .column-item-icon {
      margin-left: $spacing-1;           // 4px
      font-size: $font-size-sm;          // 13px
      color: $law-gray-500;              // #78909C
      cursor: help;

      &:hover {
        color: $law-primary;
      }
    }
  }

  .el-checkbox-group {
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $law-gray-100;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: $law-gray-400;
      border-radius: 3px;

      &:hover {
        background: $law-gray-500;
      }
    }
  }
}

// Popover 容器样式 - 响应式适配
::v-deep .column-settings-popover {
  max-width: 320px;

  @media (max-width: 768px) {
    max-width: calc(100vw - 32px);
    left: 16px !important;
  }

  .el-checkbox:focus-within {
    background-color: rgba($law-primary, 0.04);
    border-radius: 4px;
  }

  .el-checkbox__inner {
    transition: all 0.2s ease;
  }
}
```

### 7.10 测试要点

#### 7.10.1 功能测试

- [ ] 复选框勾选/取消后表格列正确显示/隐藏
- [ ] 固定列（fixed: true）正确禁用
- [ ] 重置按钮恢复所有列到默认状态
- [ ] localStorage 正确保存和读取配置
- [ ] 刷新页面后配置保持不变

#### 7.10.2 无障碍测试

- [ ] Tab 键可遍历所有复选框
- [ ] 焦点顺序符合视觉顺序
- [ ] 打开后焦点自动进入第一个复选框
- [ ] 关闭后焦点返回触发按钮
- [ ] ESC 键关闭对话框
- [ ] 屏幕阅读器正确朗读所有元素

#### 7.10.3 交互测试

- [ ] 悬停状态视觉反馈明显
- [ ] 焦点状态有清晰的边框和外发光
- [ ] 禁用状态视觉上可区分
- [ ] Tooltip 正确显示固定列说明
- [ ] 动画过渡流畅（200ms）

#### 7.10.4 响应式测试

- [ ] 桌面端显示位置正确（bottom-end）
- [ ] 移动端对话框宽度正确适配
- [ ] 横屏模式下仍可用
- [ ] 列表滚动流畅

#### 7.10.5 触控测试

- [ ] 列项触控区域 ≥44×44px
- [ ] 复选框触控区域 ≥44×44px
- [ ] 重置按钮触控区域 ≥44×44px
- [ ] 触控响应灵敏，无误触

### 7.11 设计原则

1. **渐进式披露**: 将高级配置放在 Popover 中，不占用主界面空间
2. **即时反馈**: 列的显示/隐藏立即生效，无需额外确认
3. **记忆用户偏好**: 使用 localStorage 保存用户选择
4. **清晰的禁用说明**: 对固定列提供明确的视觉和文本说明
5. **完整的键盘支持**: 所有操作都可通过键盘完成
6. **触控友好**: 确保所有交互元素有足够的触控区域

---

## 9. 全局共享组件规范

### 9.1 概述

本规范说明如何在全局共享组件（`src/components/`）中实施设计规范，以及如何在页面中使用这些组件。

**背景**: Pagination等全局组件被多个页面使用，其实施设计规范的方式与页面特定组件不同。本规范确保全局组件的一致性和可维护性。

### 9.2 组件分类

| 类型         | 位置                        | 说明           | 示例                       |
| ---------- | ------------------------- | ------------ | ------------------------ |
| **全局共享组件** | `src/components/`         | 可在整个应用中复用的组件 | Pagination, TableSearch等 |
| **页面特定组件** | `src/views/*/components/` | 仅在特定页面使用的组件  | IncidentQueryBar等        |
| **布局组件**   | `src/layout/`             | 应用布局结构组件     | BasicLayout等             |

**设计原则**:

- **DRY原则**: 可复用的UI模式应提取为全局组件
- **渐进式实施**: 优先在高频组件中实施设计规范
- **向后兼容**: 组件API变更应考虑现有使用场景

### 9.3 样式管理原则

#### 9.3.1 设计令牌优先

**原则**: 全局共享组件必须使用设计令牌系统，而非硬编码颜色、尺寸、间距值。

**实现方式**:

```scss
// ✅ 正确 - 使用设计令牌
@import '@/styles/tokens/index.scss';

.pagination-container {
  background: $law-bg-paper;
  padding: $spacing-4;
  color: $law-gray-600;
}

// ❌ 错误 - 硬编码值
.pagination-container {
  background: #fff;
  padding: 16px;
  color: #606266;
}
```

**好处**:

- **主题切换**: 设计令牌变更时自动适配
- **设计一致性**: 确保所有组件使用统一的视觉语言
- **易于维护**: 设计变更时统一更新令牌即可

#### 9.3.2 样式作用域控制

**原则**: 使用 `scoped` 避免样式污染，但保留 `::v-deep` 用于主题定制。

**实现方式**:

```vue
<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

// 组件自身样式 - 使用scoped防止样式泄漏
.component-wrapper {
  padding: $spacing-4;
}

// 允许外部定制的样式 - 使用::v-deep穿透scoped
::v-deep .el-pagination {
  display: flex;
  align-items: center;
}
</style>
```

**设计决策**:

- **组件内部**: 使用 `scoped` 防止样式泄漏到其他组件
- **第三方组件**: 使用 `::v-deep` 定制Element UI等第三方库样式
- **样式钩子**: 保留足够的class供页面级样式覆盖

#### 9.3.3 默认样式规范

**原则**: 全局组件默认样式应遵循设计规范，页面级样式仅用于特殊情况。

**实施顺序**:

1. **优先**: 在全局组件中实施设计规范
2. **其次**: 使用props控制组件变体（如size、variant）
3. **最后**: 页面级使用 `::v-deep` 覆盖样式（仅特殊需求）

**示例**:

```vue
<!-- 优先：使用props控制 -->
<pagination :layout="'total, prev, pager, next'" />

<!-- 其次：组件内部已实施规范 -->
<pagination /> <!-- 自动使用设计规范样式 -->

<!-- 最后：页面级特殊定制 -->
<style scoped>
.pagination-container ::v-deep .el-pagination {
  /* 仅在有特殊需求时使用 */
}
</style>
```

### 9.4 已实施规范的全局组件

| 组件名称       | 路径                                    | 规范章节     | 实施状态  | 实施日期       |
| ---------- | ------------------------------------- | -------- | ----- | ---------- |
| Pagination | `src/components/Pagination/index.vue` | 5.8 分页组件 | ✅ 已实施 | 2026-03-18 |

**详细更新记录**:

**Pagination组件 (2026-03-18)**:

- **优化内容**:
  - 使用设计令牌替代硬编码值（颜色、尺寸、间距）
  - 优化垂直对齐问题（flexbox + align-items: center）
  - 统一交互元素高度（32px）
  - 完善悬停、焦点、禁用状态样式
- **变更影响**: 全局生效，所有使用Pagination的页面自动继承新样式
- **向后兼容**: ✅ 完全兼容，无需修改页面代码
- **相关提交**: 添加commit message引用

### 9.5 组件样式继承和覆盖

#### 9.5.1 页面级样式覆盖

当需要为特定页面定制全局组件样式时，按以下优先级选择方案：

**方案1: 使用props控制组件行为（优先推荐）**

```vue
<template>
  <pagination
    :layout="'total, prev, pager, next'"
    :background="false"
  />
</template>
```

**方案2: 使用页面级scoped样式（推荐）**

```vue
<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

// 覆盖Pagination组件样式
.pagination-container {
  ::v-deep .el-pagination {
    // 页面特定样式
    justify-content: center; // 示例：居中对齐
  }
}
</style>
```

**方案3: 使用CSS类名变体（需要组件支持）**

```vue
<template>
  <pagination class="pagination-center" />
</template>

<style scoped>
.pagination-center ::v-deep .el-pagination {
  justify-content: center;
}
</style>
```

#### 9.5.2 主题定制

全局组件应支持主题定制，通过以下方式：

**方式1: CSS变量（推荐用于颜色主题）**

```scss
// 主题定义
:root {
  --law-primary: #1A5F7A;
  --law-bg-paper: #FFFFFF;
}

// 组件中使用
.pagination-container {
  background: var(--law-bg-paper);
  color: var(--law-primary);
}
```

**方式2: 设计令牌覆盖（用于组件级定制）**

```scss
// 主题覆盖文件
$law-primary: #1A5F7A; // 覆盖默认值
@import '@/styles/tokens/index.scss';
```

**方式3: SCSS变量（编译时主题）**

```scss
// 不同主题文件
@import '@/styles/themes/dark.scss'; // 深色主题
@import '@/styles/themes/light.scss'; // 浅色主题
```

### 9.6 组件迁移指南

#### 9.6.1 迁移现有组件到设计规范

**迁移步骤**:

1. **评估现状**: 检查组件当前使用的颜色、尺寸、间距
2. **引用令牌**: 添加 `@import '@/styles/tokens/index.scss'`
3. **替换硬编码**: 将硬编码值替换为设计令牌
4. **测试验证**: 确保视觉效果符合规范
5. **更新文档**: 在本规范"已实施规范"表格中记录

**示例 - Pagination组件迁移**:

```scss
// ========== 迁移前 ==========
<style scoped>
.pagination-container {
  background: #fff;           // 硬编码
  padding: 32px 16px;         // 硬编码
}
</style>

// ========== 迁移后 ==========
<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.pagination-container {
  background: $law-bg-paper;          // 使用设计令牌
  padding: $spacing-4 $spacing-4;     // 使用设计令牌
  display: flex;                       // 优化布局
  justify-content: flex-end;           // 靠右对齐
  align-items: center;                 // 垂直居中

  ::v-deep .el-pagination {
    display: flex;
    align-items: center;               // 优化对齐
    gap: $spacing-2;                   // 统一间距
  }
}
</style>
```

#### 9.6.2 组件版本控制

**策略**: 使用语义化版本号记录设计规范变更

| 版本号变更类型           | 说明             | 示例               |
| ----------------- | -------------- | ---------------- |
| **Major (X.0.0)** | 设计规范重大变更，不兼容旧版 | 颜色系统重构、布局结构变更    |
| **Minor (0.X.0)** | 新增设计令牌或组件变体    | 新增深色模式支持、新增props |
| **Patch (0.0.X)** | 样式修复，不影响API    | 修复垂直对齐、调整间距      |

**实施建议**:

- 组件样式变更应在commit message中说明设计规范版本
- 重大变更应更新文档并通知相关开发者
- 使用Git tag标记组件的设计规范版本

### 9.7 设计规范实施检查清单

#### 9.7.1 新组件开发检查清单

**开发前**:

- [ ] 阅读本设计规范相关章节
- [ ] 确认组件类型（全局/页面特定）
- [ ] 确认是否需要实施设计规范
- [ ] 引入设计令牌系统

**开发中**:

- [ ] 使用设计令牌定义颜色（$law-*）
- [ ] 使用设计令牌定义尺寸（$spacing-*）
- [ ] 遵循字体规范（$font-size-*, $font-weight-*）
- [ ] 实施交互状态（悬停、焦点、禁用）
- [ ] 确保触控区域 ≥44×44px（移动端）
- [ ] 添加过渡动画（150-300ms）
- [ ] 使用 scoped 样式防止污染
- [ ] 使用 ::v-deep 定制第三方组件

**开发后**:

- [ ] 测试主题切换（如有）
- [ ] 验证响应式行为（移动端/平板/桌面）
- [ ] 检查无障碍性（键盘导航、屏幕阅读器）
- [ ] 验证颜色对比度（≥4.5:1）
- [ ] 测试所有交互状态
- [ ] 更新本规范"已实施规范"表格
- [ ] 添加组件文档注释

#### 9.7.2 使用全局组件检查清单

**使用前**:

- [ ] 检查组件是否已实施设计规范
- [ ] 查阅组件相关规范章节
- [ ] 确认组件props和事件

**使用中**:

- [ ] 优先使用props控制组件行为
- [ ] 避免不必要的样式覆盖
- [ ] 必要覆盖时使用 ::v-deep
- [ ] 使用设计令牌保持一致性

**使用后**:

- [ ] 验证组件显示符合预期
- [ ] 测试所有交互状态
- [ ] 检查与其他组件的视觉一致性
- [ ] 验证响应式行为

### 9.8 设计规范维护流程

#### 9.8.1 规范更新触发条件

**需要更新规范的情况**:

1. 新增UI组件或组件变体
2. 修改颜色、尺寸、字体等设计令牌
3. 发现现有规范不符合实际需求
4. 接收到新的设计需求或反馈
5. 用户体验测试发现问题

#### 9.8.2 规范更新流程

```
1. 提出规范变更需求
   ↓
2. 评估影响范围（全局/局部）
   ↓
3. 更新设计规范文档
   ↓
4. 实施到代码（全局组件优先）
   ↓
5. 测试验证（视觉/交互/无障碍）
   ↓
6. 更新"更新记录"章节
   ↓
7. 通知相关开发者（如为重大变更）
```

#### 9.8.3 规范实施优先级

| 优先级         | 场景     | 实施时限  | 说明          |
| ----------- | ------ | ----- | ----------- |
| **P0 - 立即** | 全局共享组件 | 1-2天  | 影响所有页面，优先实施 |
| **P1 - 尽快** | 常用页面组件 | 1周内   | 高频使用页面，尽快实施 |
| **P2 - 计划** | 低频页面组件 | 按迭代计划 | 低频使用，按计划实施  |

### 9.9 参考资源

**内部资源**:

- **设计令牌定义**: `src/styles/tokens/index.scss`
- **全局组件库**: `src/components/`
- **页面组件示例**: 各 `src/views/*/components/`
- **本规范文档**: `docs/界面规范/2026-03-15-incident-record-query-ux-design.md`

**外部参考**:

- **Element UI 设计规范**: https://element.eleme.io/#/zh-CN/component/design
- **Material Design**: https://material.io/design
- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **WCAG 无障碍指南**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 附录A: 设计规范快速参考

### A.1 颜色速查表

| 用途      | 变量名             | 值       | RGB               | 说明     |
| ------- | --------------- | ------- | ----------------- | ------ |
| **主题色** | `$law-primary`  | #1A5F7A | rgb(26, 95, 122)  | 执法场景主色 |
| **成功**  | `$law-success`  | #3D8B40 | rgb(61, 139, 64)  | 已结案、正常 |
| **警告**  | `$law-warning`  | #E9A825 | rgb(233, 168, 37) | 待处理    |
| **危险**  | `$law-danger`   | #C62828 | rgb(198, 40, 40)  | 删除、异常  |
| **信息**  | `$law-info`     | #2E86AB | rgb(46, 134, 171) | 信息提示   |
| **正文**  | `$law-gray-700` | #546E7A | rgb(84, 110, 122) | 主要文字   |
| **标题**  | `$law-gray-900` | #1A1A1A | rgb(26, 26, 26)   | 标题文字   |
| **辅助**  | `$law-gray-600` | #455A64 | rgb(69, 90, 100)  | 辅助文字   |

### A.2 间距速查表

| 令牌           | 值    | 用途   | 示例      |
| ------------ | ---- | ---- | ------- |
| `$spacing-1` | 4px  | 紧凑间距 | 图标与文字间距 |
| `$spacing-2` | 8px  | 小间距  | 按钮内部间距  |
| `$spacing-3` | 12px | 中间距  | 表单项间距   |
| `$spacing-4` | 16px | 标准间距 | 卡片内边距   |
| `$spacing-5` | 20px | 大间距  | 区域间距    |
| `$spacing-6` | 24px | 更大间距 | 页面边距    |

### A.3 字体速查表

| 用途       | 变量名                     | 值    | 字重  | 行高  |
| -------- | ----------------------- | ---- | --- | --- |
| **特小**   | `$font-size-xs`         | 12px | -   | -   |
| **小**    | `$font-size-sm`         | 13px | -   | -   |
| **基础**   | `$font-size-base`       | 14px | -   | -   |
| **中**    | `$font-size-md`         | 16px | -   | -   |
| **大**    | `$font-size-lg`         | 18px | -   | -   |
| **特大**   | `$font-size-2xl`        | 24px | -   | -   |
| **正常**   | `$font-weight-normal`   | -    | 400 | -   |
| **中等**   | `$font-weight-medium`   | -    | 500 | -   |
| **半粗**   | `$font-weight-semibold` | -    | 600 | -   |
| **标准行高** | `$line-height-normal`   | -    | -   | 1.5 |

### A.4 常用组件规范速查表

| 组件      | 规范章节 | 关键尺寸        | 关键间距         | 过渡时间  |
| ------- | ---- | ----------- | ------------ | ----- |
| **按钮**  | 3.4  | 高32px       | 内边距10px 20px | 200ms |
| **表格**  | 5.2  | 单元格高auto    | 内边距12px 16px | -     |
| **分页**  | 5.8  | 按钮32×32px   | 间距4-8px      | 200ms |
| **表单**  | 5.7  | 高32px       | 项间距18px      | -     |
| **对话框** | 4.4  | 800px（统一宽度） | 内边距20px      | 300ms |

### A.5 交互状态速查表

| 状态     | 背景色                    | 文字色           | 边框            | 过渡    |
| ------ | ---------------------- | ------------- | ------------- | ----- |
| **默认** | 透明/白色                  | $law-gray-700 | $law-gray-200 | -     |
| **悬停** | rgba(0,0,0,0.04)       | $law-primary  | $law-primary  | 200ms |
| **激活** | rgba($law-primary,0.1) | $law-primary  | -             | -     |
| **禁用** | -                      | $law-gray-300 | -             | -     |
| **焦点** | -                      | -             | 2px solid     | -     |

---

## 8. 更新记录

### 2026-03-18 - 全局共享组件规范与分页组件优化

**新增内容**:

- 新增第 9 节：全局共享组件规范
  - 组件分类与样式管理原则
  - 设计令牌优先原则
  - 样式作用域控制规范
  - 已实施规范的全局组件记录
  - 组件样式继承和覆盖指南
  - 组件迁移指南与版本控制策略
  - 设计规范实施检查清单
  - 设计规范维护流程
- 新增附录 A：设计规范快速参考
  - 颜色速查表（含RGB值）
  - 间距速查表
  - 字体速查表
  - 常用组件规范速查表
  - 交互状态速查表

**问题修复**:

- Pagination组件垂直对齐问题
  - 使用flexbox布局实现"共25条"文本和页码数字的基线对齐
  - 统一所有交互元素高度为32px
  - 添加元素间距管理（gap: 8px）
  - 优化悬停、焦点、禁用状态样式

**技术说明**:

- Pagination组件（`src/components/Pagination/index.vue`）升级为使用设计令牌
- 使用 `@import '@/styles/tokens/index.scss'` 引入设计系统
- 使用 `::v-deep` 穿透scoped样式定制Element UI组件
- 使用 `display: flex` + `align-items: center` 实现垂直对齐

**设计原则**:

- DRY原则：可复用的UI模式应提取为全局组件
- 渐进式实施：优先在高频组件中实施设计规范
- 向后兼容：组件API变更应考虑现有使用场景
- 设计令牌优先：全局组件必须使用设计令牌系统

**影响范围**:

- 全局生效：所有使用Pagination组件的页面自动继承新样式
- 向后兼容：完全兼容，无需修改页面代码
- 规范指导：为其他全局组件的设计规范实施提供参考

**参考资源**:

- UI/UX Pro Max技能应用
- Element UI设计规范
- Material Design指南
- WCAG无障碍指南
