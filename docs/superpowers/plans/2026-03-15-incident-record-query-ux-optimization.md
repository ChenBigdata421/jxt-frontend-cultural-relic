# 警情记录查询页面 UI/UX 优化实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化警情记录查询页面的 UI/UX，建立可复用的执法场景设计系统

**Architecture:** 创建设计令牌系统 → 构建新的查询组件 → 优化表格交互 → 改进弹窗表单 → 全局样式应用

**Tech Stack:** Vue 2, Element UI, SCSS, JXT 数字证据管理系统

---

## 文件结构

### 新建文件
```
src/styles/tokens/
├── colors.scss           # 颜色令牌定义
├── spacing.scss          # 间距令牌定义
├── typography.scss       # 字体令牌定义
└── index.scss            # 设计令牌入口文件

src/components/IncidentQueryBar/
├── index.vue             # 查询栏主组件
├── SearchInput.vue       # 统一搜索框
├── QuickFilters.vue      # 快捷筛选
└── AdvancedFilterPanel.vue  # 高级筛选面板

src/components/BatchActionBar/
└── index.vue             # 批量操作工具栏

src/views/evidencemanage/incidentrecordquery/
└── styles/
    └── index.scss        # 页面特定样式
```

### 修改文件
```
src/views/evidencemanage/incidentrecordquery/index.vue  # 主页面重构
src/styles/element-variables.scss                     # Element UI 变量覆盖
src/styles/index.scss                                  # 全局样式导入
```

---

## Chunk 1: 设计令牌系统

### Task 1: 创建颜色令牌文件

**Files:**
- Create: `src/styles/tokens/colors.scss`

- [ ] **Step 1: 创建颜色令牌文件**

```scss
// src/styles/tokens/colors.scss
// 执法场景专业配色系统

// 主色 - 权威、专业
$law-primary: #1A5F7A;
$law-primary-light: #2E86AB;
$law-primary-dark: #0D3B4D;
$law-primary-contrast: #FFFFFF;

// 功能色
$law-success: #3D8B40;    // 已结案、正常
$law-warning: #E9A825;    // 待处理
$law-danger: #C62828;     // 删除、异常
$law-info: #2E86AB;       // 信息提示

// 中性色
$law-gray-50: #ECEFF1;
$law-gray-100: #CFD8DC;
$law-gray-200: #B0BEC5;
$law-gray-300: #90A4AE;
$law-gray-400: #78909C;
$law-gray-500: #546E7A;  // 正文
$law-gray-600: #455A64;
$law-gray-700: #37474F;
$law-gray-800: #263238;
$law-gray-900: #1A1A1A;   // 标题

// 背景色
$law-bg-default: #F5F7FA;
$law-bg-paper: #FFFFFF;
$law-bg-overlay: rgba(0, 0, 0, 0.5);

// 状态色 - 用于表格状态列
$law-status-processing: #FF9800;  // 处理中 - 橙色
$law-status-completed: #4CAF50;   // 已结案 - 绿色
$law-status-archived: #607D8B;    // 已归档 - 灰蓝
$law-status-pending: #2196F3;     // 待处理 - 蓝色

// 导出为 CSS 变量（用于 Vue 组件中）
:root {
  --law-primary: #{$law-primary};
  --law-success: #{$law-success};
  --law-warning: #{$law-warning};
  --law-danger: #{$law-danger};
  --law-info: #{$law-info};
  --law-status-processing: #{$law-status-processing};
  --law-status-completed: #{$law-status-completed};
  --law-status-archived: #{$law-status-archived};
  --law-status-pending: #{$law-status-pending};
}
```

- [ ] **Step 2: 提交颜色令牌文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/styles/tokens/colors.scss
git commit -m "style: 添加执法场景颜色令牌系统

- 定义主色、功能色、中性色
- 添加状态色用于表格显示
- 导出 CSS 变量供组件使用

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 2: 创建间距令牌文件

**Files:**
- Create: `src/styles/tokens/spacing.scss`

- [ ] **Step 1: 创建间距令牌文件**

```scss
// src/styles/tokens/spacing.scss
// 8dp 间距系统

$spacing-0: 0;
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-5: 20px;
$spacing-6: 24px;
$spacing-8: 32px;
$spacing-10: 40px;
$spacing-12: 48px;
$spacing-16: 64px;

// 组件特定间距
$card-padding: 20px;
$card-gap: 16px;
$form-item-gap: 18px;
$table-cell-padding: 12px 16px;
```

- [ ] **Step 2: 提交间距令牌文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/styles/tokens/spacing.scss
git commit -m "style: 添加间距令牌系统

- 定义 8dp 间距系统
- 添加组件特定间距变量

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 3: 创建字体令牌文件

**Files:**
- Create: `src/styles/tokens/typography.scss`

- [ ] **Step 1: 创建字体令牌文件**

```scss
// src/styles/tokens/typography.scss
// 字体系统

// 字体家族
$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
$font-family-code: "SF Mono", Monaco, "Consolas", "Liberation Mono", "Courier New", monospace;

// 字体大小 scale
$font-size-xs: 12px;
$font-size-sm: 13px;
$font-size-base: 14px;    // 正文最小字号
$font-size-md: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;
$font-size-3xl: 30px;

// 字重
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// 行高
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

- [ ] **Step 2: 提交字体令牌文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/styles/tokens/typography.scss
git commit -m "style: 添加字体令牌系统

- 定义字体家族、大小、字重、行高
- 确保正文最小 14px

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 4: 创建设计令牌入口文件

**Files:**
- Create: `src/styles/tokens/index.scss`

- [ ] **Step 1: 创建设计令牌入口文件**

```scss
// src/styles/tokens/index.scss
// 设计令牌入口文件

// 颜色系统
@import './colors.scss';

// 间距系统
@import './spacing.scss';

// 字体系统
@import './typography.scss';
```

- [ ] **Step 2: 更新全局样式导入**

**Modify:** `src/styles/index.scss`
在文件开头添加设计令牌导入：

```scss
// 在文件最顶部添加
@import './tokens/index.scss';

// 保留原有内容...
```

- [ ] **Step 3: 提交设计令牌入口文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/styles/tokens/index.scss src/styles/index.scss
git commit -m "style: 添加设计令牌入口文件并更新全局导入

- 创建统一的令牌入口
- 在全局样式中导入设计令牌

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 5: 更新 Element UI 变量

**Files:**
- Modify: `src/styles/element-variables.scss`

- [ ] **Step 1: 读取现有 Element UI 变量文件**

先查看文件内容，然后进行修改。

- [ ] **Step 2: 更新 Element UI 颜色变量**

在文件中找到颜色变量定义部分，更新为执法场景配色：

```scss
// src/styles/element-variables.scss
// 找到 $--color-primary 等变量定义，更新为：

$--color-primary: $law-primary;
$--color-success: $law-success;
$--color-warning: $law-warning;
$--color-danger: $law-danger;
$--color-info: $law-info;

// 如果原文件没有导入设计令牌，在顶部添加：
@import './tokens/colors.scss';
```

- [ ] **Step 3: 提交 Element UI 变量更新**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/styles/element-variables.scss
git commit -m "style: 更新 Element UI 颜色变量为执法场景配色

- 使用新的执法场景配色系统
- 保持与设计令牌一致

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: 查询表单组件

### Task 6: 创建 SearchInput 组件

**Files:**
- Create: `src/components/IncidentQueryBar/SearchInput.vue`

- [ ] **Step 1: 创建 SearchInput 组件**

```vue
<template>
  <div class="search-input-wrapper">
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
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchText: this.value
    };
  },
  watch: {
    value(newVal) {
      this.searchText = newVal;
    },
    searchText(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchText);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.search-input-wrapper {
  width: 100%;
  max-width: 500px;

  .search-input {
    /deep/ .el-input__inner {
      height: 36px;
      line-height: 36px;
    }

    /deep/ .el-input-group__append {
      background-color: $law-primary;
      color: $law-primary-contrast;
      border-color: $law-primary;

      .el-button {
        background-color: transparent;
        border: none;
        color: inherit;
      }
    }
  }
}
</style>
```

- [ ] **Step 2: 提交 SearchInput 组件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/components/IncidentQueryBar/SearchInput.vue
git commit -m "feat: 添加统一搜索框组件

- 支持搜索关键词输入
- 支持回车搜索
- 使用执法场景配色

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 7: 创建 QuickFilters 组件

**Files:**
- Create: `src/components/IncidentQueryBar/QuickFilters.vue`

- [ ] **Step 1: 创建 QuickFilters 组件**

```vue
<template>
  <div class="quick-filters">
    <el-radio-group
      v-model="activeFilter"
      size="small"
      @change="handleFilterChange"
      class="filter-group"
    >
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
    value: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      activeFilter: this.value || 'all'
    };
  },
  watch: {
    value(newVal) {
      this.activeFilter = newVal;
    }
  },
  methods: {
    handleFilterChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.quick-filters {
  margin-top: $spacing-4;

  .filter-group {
    /deep/ .el-radio-button__inner {
      &:hover {
        color: $law-primary;
      }

      &.is-active {
        background-color: $law-primary;
        border-color: $law-primary;
        color: $law-primary-contrast;
      }
    }
  }
}
</style>
```

- [ ] **Step 2: 提交 QuickFilters 组件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/components/IncidentQueryBar/QuickFilters.vue
git commit -m "feat: 添加快捷筛选组件

- 支持全部/今日/待处理/我的/已归档快捷筛选
- 使用执法场景配色

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 8: 创建 AdvancedFilterPanel 组件

**Files:**
- Create: `src/components/IncidentQueryBar/AdvancedFilterPanel.vue`

- [ ] **Step 1: 创建 AdvancedFilterPanel 组件**

```vue
<template>
  <div class="advanced-filter-wrapper">
    <el-collapse v-model="activeNames" class="advanced-filter-panel">
      <el-collapse-item name="filters">
        <template slot="title">
          <span class="filter-title">
            <i class="el-icon-setting"></i>
            高级筛选
          </span>
        </template>

        <!-- 时间范围 - 复选框 + 日期范围组合 -->
        <div class="filter-section">
          <div class="section-label">时间范围</div>
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
                v-model="timeValues[range.key]"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="time-range-picker"
                @change="handleTimeChange(range.key)"
              />
            </div>
          </div>
        </div>

        <!-- 其他筛选条件 -->
        <div class="filter-section">
          <div class="section-label">警情信息</div>
          <el-row :gutter="16" class="filter-row">
            <el-col :span="6">
              <el-input
                v-model="filterParams.code"
                placeholder="警情编号"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="filterParams.title"
                placeholder="警情标题"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="filterParams.name"
                placeholder="报警人姓名"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="filterParams.status"
                placeholder="状态"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-col>
          </el-row>
        </div>

        <div class="filter-actions">
          <el-button type="primary" size="small" @click="handleApply">
            应用筛选
          </el-button>
          <el-button size="small" @click="handleReset">
            重置
          </el-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'AdvancedFilterPanel',
  props: {
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'reportTimeRange', label: '报警时间', enabled: false },
        { key: 'receiveTimeRange', label: '接警时间', enabled: false },
        { key: 'processTimeRange', label: '处警时间', enabled: false },
        { key: 'endTimeRange', label: '结束时间', enabled: false }
      ],
      timeValues: {},
      filterParams: {
        code: undefined,
        title: undefined,
        name: undefined,
        status: undefined
      }
    };
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        // 清空该时间范围的数据
        this.$set(this.timeValues, range.key, null);
      }
      this.emitFilterChange();
    },
    handleTimeChange(key) {
      this.emitFilterChange();
    },
    handleApply() {
      this.$emit('apply', this.getFilterData());
    },
    handleReset() {
      // 重置所有筛选条件
      this.timeRanges.forEach(range => {
        range.enabled = false;
      });
      this.timeValues = {};
      this.filterParams = {
        code: undefined,
        title: undefined,
        name: undefined,
        status: undefined
      };
      this.$emit('reset');
    },
    getFilterData() {
      const data = { ...this.filterParams };

      // 处理时间范围
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key];
          data[range.key + 'Start'] = start;
          data[range.key + 'End'] = end;
        }
      });

      return data;
    },
    emitFilterChange() {
      this.$emit('filter-change', this.getFilterData());
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.advanced-filter-wrapper {
  margin-top: $spacing-4;
}

.advanced-filter-panel {
  border: none;
  border-radius: 4px;
  overflow: hidden;

  /deep/ .el-collapse-item__header {
    height: 40px;
    background-color: $law-bg-default;
    border: none;
    padding: 0 $spacing-4;

    &:hover {
      background-color: darken($law-bg-default, 2%);
    }
  }

  /deep/ .el-collapse-item__wrap {
    border: none;
    background-color: $law-bg-paper;
  }

  /deep/ .el-collapse-item__content {
    padding: $spacing-4;
  }
}

.filter-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-weight: $font-weight-medium;
  color: $law-gray-700;

  i {
    color: $law-primary;
  }
}

.filter-section {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $law-gray-600;
  margin-bottom: $spacing-3;
}

.time-range-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.time-range-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  .time-range-picker {
    flex: 1;
    min-width: 300px;
  }
}

.filter-row {
  /deep/ .el-input,
  /deep/ .el-select {
    width: 100%;
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-2;
  padding-top: $spacing-4;
  border-top: 1px solid $law-gray-200;
}

.full-width {
  width: 100%;
}
</style>
```

- [ ] **Step 2: 提交 AdvancedFilterPanel 组件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/components/IncidentQueryBar/AdvancedFilterPanel.vue
git commit -m "feat: 添加高级筛选面板组件

- 支持时间范围复选框选择
- 支持警情信息筛选
- 默认折叠状态

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 9: 创建 IncidentQueryBar 主组件

**Files:**
- Create: `src/components/IncidentQueryBar/index.vue`

- [ ] **Step 1: 创建 IncidentQueryBar 主组件**

```vue
<template>
  <div class="incident-query-bar">
    <!-- 统一搜索框 -->
    <div class="search-section">
      <SearchInput
        v-model="searchText"
        @search="handleSearch"
      />
    </div>

    <!-- 快捷筛选 -->
    <QuickFilters
      v-model="quickFilter"
      @change="handleQuickFilterChange"
    />

    <!-- 高级筛选面板 -->
    <AdvancedFilterPanel
      ref="advancedFilter"
      :status-options="statusOptions"
      @apply="handleAdvancedFilter"
      @reset="handleAdvancedFilterReset"
    />
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
  props: {
    statusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchText: '',
      quickFilter: 'all'
    };
  },
  methods: {
    handleSearch(text) {
      this.$emit('search', {
        keyword: text,
        filterType: 'search'
      });
    },
    handleQuickFilterChange(filterType) {
      this.$emit('filter-change', {
        filterType,
        value: filterType
      });
    },
    handleAdvancedFilter(filterData) {
      this.$emit('filter-change', {
        filterType: 'advanced',
        ...filterData
      });
    },
    handleAdvancedFilterReset() {
      this.$emit('filter-reset');
    },
    reset() {
      this.searchText = '';
      this.quickFilter = 'all';
      if (this.$refs.advancedFilter) {
        this.$refs.advancedFilter.handleReset();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.incident-query-bar {
  .search-section {
    margin-bottom: $spacing-4;
  }
}
</style>
```

- [ ] **Step 2: 提交 IncidentQueryBar 主组件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/components/IncidentQueryBar/index.vue
git commit -m "feat: 添加警情查询栏主组件

- 集成搜索框、快捷筛选、高级筛选
- 统一筛选事件接口

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: 批量操作与表格优化

### Task 10: 创建 BatchActionBar 组件

**Files:**
- Create: `src/components/BatchActionBar/index.vue`

- [ ] **Step 1: 创建 BatchActionBar 组件**

```vue
<template>
  <transition name="slide-down">
    <div v-if="selectedCount > 0" class="batch-action-bar">
      <div class="selection-info">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="allSelected"
          @change="handleSelectAllChange"
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
    selectedCount: {
      type: Number,
      default: 0
    },
    isIndeterminate: {
      type: Boolean,
      default: false
    },
    allSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelectAllChange(val) {
      this.$emit('select-all-change', val);
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

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-3 $spacing-4;
  background-color: rgba($law-primary, 0.08);
  border: 1px solid rgba($law-primary, 0.2);
  border-radius: 4px;
  margin-bottom: $spacing-4;

  .selection-info {
    font-size: $font-size-sm;
    color: $law-gray-700;
  }

  .batch-actions {
    display: flex;
    gap: $spacing-2;
  }
}

// 滑入动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

- [ ] **Step 2: 提交 BatchActionBar 组件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/components/BatchActionBar/index.vue
git commit -m "feat: 添加批量操作工具栏组件

- 显示选中数量
- 支持批量删除和导出
- 滑入动画效果

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 11: 创建页面样式文件

**Files:**
- Create: `src/views/evidencemanage/incidentrecordquery/styles/index.scss`

- [ ] **Step 1: 创建页面样式文件**

```scss
// src/views/evidencemanage/incidentrecordquery/styles/index.scss
@import '@/styles/tokens/index.scss';

// 状态列样式
.status-cell {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;

    &.processing {
      background-color: $law-status-processing;
    }

    &.completed {
      background-color: $law-status-completed;
    }

    &.archived {
      background-color: $law-status-archived;
    }

    &.pending {
      background-color: $law-status-pending;
    }
  }

  .status-text {
    font-size: $font-size-sm;
  }
}

// 操作按钮样式
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  min-height: 28px;
  font-size: $font-size-sm;

  &.view-btn {
    color: $law-info;

    &:hover {
      background-color: rgba($law-info, 0.1);
    }
  }

  &.edit-btn {
    color: $law-warning;

    &:hover {
      background-color: rgba($law-warning, 0.1);
    }
  }

  &.delete-btn {
    color: $law-danger;

    &:hover {
      background-color: rgba($law-danger, 0.1);
    }
  }
}

// 主操作栏
.main-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-4;
  padding: $spacing-3 $spacing-4;
  background-color: $law-bg-default;
  border-radius: 4px;

  .left-actions {
    display: flex;
    gap: $spacing-2;
  }

  .right-actions {
    display: flex;
    gap: $spacing-2;
  }
}

// 表单折叠分组样式（用于弹窗）
.form-collapse {
  border: none;

  .form-section {
    margin-bottom: $spacing-4;
    border-radius: 8px;
    overflow: hidden;

    /deep/ .el-collapse-item__header {
      height: 48px;
      background-color: $law-bg-default;
      border: none;
      padding: 0 $spacing-4;

      &:hover {
        background-color: darken($law-bg-default, 2%);
      }
    }

    /deep/ .el-collapse-item__wrap {
      border: none;
      background-color: $law-bg-paper;
    }

    /deep/ .el-collapse-item__content {
      padding: $spacing-5;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  .section-icon {
    font-size: 18px;
    color: $law-primary;
  }

  .section-title {
    font-weight: $font-weight-semibold;
    font-size: 15px;
    color: $law-gray-900;
  }

  .section-badge {
    margin-left: auto;
    padding: 2px 8px;
    background-color: rgba($law-primary, 0.1);
    color: $law-primary;
    font-size: $font-size-xs;
    border-radius: 12px;
  }
}

// 时间线可视化样式
.timeline-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-5 0;
  margin-bottom: $spacing-5;

  .timeline-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-2;
    position: relative;
    z-index: 1;

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: $law-gray-300;
      border: 2px solid $law-bg-paper;
      box-shadow: 0 0 0 2px $law-gray-300;
      transition: all 0.3s;
    }

    .timeline-label {
      font-size: $font-size-xs;
      color: $law-gray-500;
    }

    &.active .timeline-dot {
      background-color: $law-primary;
      box-shadow: 0 0 0 2px $law-primary;
    }

    &.active .timeline-label {
      color: $law-primary;
      font-weight: $font-weight-medium;
    }
  }

  .timeline-line {
    flex: 1;
    height: 2px;
    background-color: $law-gray-300;
    min-width: 40px;
  }
}
```

- [ ] **Step 2: 提交页面样式文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/views/evidencemanage/incidentrecordquery/styles/index.scss
git commit -m "style: 添加警情查询页面样式

- 状态列色块样式
- 操作按钮样式
- 批量操作栏样式
- 表单折叠分组样式
- 时间线可视化样式

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: 主页面集成

### Task 12: 集成新组件到主页面

**Files:**
- Modify: `src/views/evidencemanage/incidentrecordquery/index.vue`

- [ ] **Step 1: 备份原文件**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
cp src/views/evidencemanage/incidentrecordquery/index.vue src/views/evidencemanage/incidentrecordquery/index.vue.backup
```

- [ ] **Step 2: 修改 template 部分**

在 `<el-card>` 内部，替换查询表单和操作区域：

```vue
<!-- 替换原有的 el-form 查询表单部分为： -->
<div class="query-section">
  <IncidentQueryBar
    ref="queryBar"
    :status-options="statusOptions"
    @search="handleSearch"
    @filter-change="handleFilterChange"
    @filter-reset="handleFilterReset"
  />
</div>

<!-- 替换原有的 el-row 操作按钮部分为： -->
<!-- 批量操作栏 -->
<BatchActionBar
  :selected-count="selectedIncidentRecords.length"
  :is-indeterminate="isSelectionIndeterminate"
  :all-selected="isAllSelected"
  @select-all-change="handleSelectAll"
  @batch-delete="handleBatchDelete"
  @batch-export="handleBatchExport"
/>

<!-- 主操作栏 -->
<div class="main-action-bar">
  <div class="left-actions">
    <el-button
      v-permisaction="['incidentrecord:bwc:create']"
      type="primary"
      icon="el-icon-plus"
      size="mini"
      @click="handleAdd"
    >
      新增警情
    </el-button>
    <el-button
      icon="el-icon-refresh"
      size="mini"
      @click="handleRefresh"
    >
      刷新
    </el-button>
  </div>
  <div class="right-actions">
    <el-button
      size="mini"
      icon="el-icon-setting"
      @click="showColumnSettings"
    >
      列设置
    </el-button>
  </div>
</div>
```

- [ ] **Step 3: 修改 script 部分**

添加组件导入和新增方法：

```javascript
// 在 import 部分添加：
import IncidentQueryBar from '@/components/IncidentQueryBar/index.vue';
import BatchActionBar from '@/components/BatchActionBar/index.vue';
// 保留原有 import...

// 在 components 部分添加：
components: {
  Treeselect,
  IncidentQueryBar,
  BatchActionBar
},

// 在 data 中添加：
isAllSelected: false,
isSelectionIndeterminate: false,

// 在 methods 中添加：
handleSearch(searchData) {
  // 处理搜索
  if (searchData.keyword) {
    this.queryParams.keyword = searchData.keyword;
  }
  this.handleQuery();
},

handleFilterChange(filterData) {
  // 处理快捷筛选和高级筛选
  if (filterData.filterType === 'today') {
    // 今日警情
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.queryParams.reportTimeStart = today.toISOString();
  } else if (filterData.filterType === 'mine') {
    // 我的警情 - 需要从 store 获取当前用户
    this.queryParams.createUserId = this.$store.state.user.user.userId;
  } else if (filterData.filterType === 'pending') {
    // 待处理
    this.queryParams.status = 0;
  } else if (filterData.filterType === 'archived') {
    // 已归档
    this.queryParams.status = 3;
  } else if (filterData.filterType === 'advanced') {
    // 高级筛选
    Object.assign(this.queryParams, filterData);
  }
  this.handleQuery();
},

handleFilterReset() {
  this.resetQuery();
},

handleSelectAll(val) {
  this.isAllSelected = val;
  this.isSelectionIndeterminate = false;
  this.$refs.incidentRecordTable.toggleAllSelection();
},

handleBatchDelete() {
  // 复用原有的 handleDelete 方法
  this.handleDelete();
},

handleBatchExport() {
  // 复用原有的 handleExport 方法
  this.handleExport();
},

handleRefresh() {
  this.getList();
},

showColumnSettings() {
  // 打开列设置弹窗（原有逻辑保留）
},

// 修改 handleSelectionChange 方法：
handleSelectionChange(selection) {
  if (this.isRestoringSelection) {
    return;
  }

  const selectedIdSet = new Set(
    (selection || []).map((item) => item && item.id).filter(Boolean)
  );

  (this.incidentRecordList || []).forEach((row) => {
    const id = row && row.id;
    if (!id) return;
    if (selectedIdSet.has(id)) {
      this.selectedIncidentRecordMap[id] = row;
    } else {
      delete this.selectedIncidentRecordMap[id];
    }
  });

  this.selectedIncidentRecords = Object.values(
    this.selectedIncidentRecordMap
  ).filter(Boolean);

  // 更新全选状态
  const totalCount = this.incidentRecordList.length;
  const selectedCount = this.selectedIncidentRecords.length;
  this.isAllSelected = selectedCount === totalCount && totalCount > 0;
  this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount;
},

// 添加 getStatusClass 方法：
getStatusClass(status) {
  const statusMap = {
    0: 'pending',
    1: 'processing',
    2: 'completed',
    3: 'archived'
  };
  return statusMap[status] || 'pending';
}
```

- [ ] **Step 4: 修改状态列模板**

找到状态列的 `<el-table-column>`，修改模板：

```vue
<!-- 替换原有的状态列模板为： -->
<el-table-column
  v-if="isColumnVisible('status')"
  prop="status"
  label="状态"
  width="120"
>
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
```

- [ ] **Step 5: 修改操作列模板**

找到操作列的 `<el-table-column>`，修改模板：

```vue
<!-- 替换原有的操作列模板为： -->
<el-table-column
  label="操作"
  align="center"
  class-name="small-padding fixed-width"
  width="200"
  fixed="left"
>
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
```

- [ ] **Step 6: 添加样式导入**

在 `<style>` 标签中添加：

```vue
<style lang="scss" scoped>
@import './styles/index.scss';
</style>
```

- [ ] **Step 7: 提交主页面集成**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/views/evidencemanage/incidentrecordquery/index.vue
git commit -m "feat: 集成新组件到警情查询主页面

- 使用 IncidentQueryBar 替换原有查询表单
- 使用 BatchActionBar 添加批量操作功能
- 优化状态列显示（添加色块）
- 优化操作列显示（图标+文字）
- 添加快捷筛选功能

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 5: 弹窗表单优化

### Task 13: 优化弹窗表单为可折叠分组

**Files:**
- Modify: `src/views/evidencemanage/incidentrecordquery/index.vue`

- [ ] **Step 1: 修改添加/编辑弹窗的 el-form 结构**

找到 ID 为 "form" 的 `<el-form>`，替换为折叠分组结构：

```vue
<!-- 在 <el-dialog> 内部，找到 <el-form ref="form">，替换为： -->
<el-form
  ref="form"
  :model="form"
  :rules="rules"
  label-width="100px"
>

  <!-- 使用 el-collapse 实现可折叠分组 -->
  <el-collapse v-model="activeFormSections" class="form-collapse">

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
          <el-form-item label="报警人姓名：" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入报警人姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警电话：" prop="tel">
            <el-input
              v-model="form.tel"
              placeholder="请输入报警电话"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="警情标题：" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入警情标题"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="报警内容：" prop="context">
            <el-input
              v-model="form.context"
              type="textarea"
              :rows="2"
              placeholder="请输入报警内容"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="报警地址：" prop="address">
            <el-input
              v-model="form.address"
              placeholder="请输入报警地址"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="处警组织：" prop="orgId">
            <treeselect
              v-model="form.orgId"
              :options="orgOptions"
              placeholder="请选择处警组织"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处警人员：">
            <el-select
              v-model="form.processPoliceIds"
              placeholder="请选择处警人员"
              multiple
              collapse-tags
              collapse-tags-tooltip
              class="full-width"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
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
          <el-form-item label="创建时间：">
            <el-date-picker
              v-model="form.createTime"
              type="datetime"
              placeholder="选择创建时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警时间：">
            <el-date-picker
              v-model="form.reportTime"
              type="datetime"
              placeholder="选择报警时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="接警时间：">
            <el-date-picker
              v-model="form.receiveTime"
              type="datetime"
              placeholder="选择接警时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处警时间：">
            <el-date-picker
              v-model="form.processTime"
              type="datetime"
              placeholder="选择处警时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间：">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-collapse-item>

    <!-- 处警信息 -->
    <el-collapse-item name="enforcement" class="form-section">
      <template slot="title">
        <div class="section-header">
          <i class="el-icon-user section-icon"></i>
          <span class="section-title">执法信息</span>
          <span class="section-badge">4项</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="警情监督类型：" prop="superviseType">
            <el-select
              v-model="form.superviseType"
              placeholder="请选择"
              class="full-width"
            >
              <el-option label="类型一" value="1" />
              <el-option label="类型二" value="2" />
              <el-option label="类型三" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处警结果：" prop="result">
            <el-input
              v-model="form.result"
              placeholder="请输入处警结果"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="状态：">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-collapse-item>

  </el-collapse>
</el-form>
```

- [ ] **Step 2: 在 data 中添加 activeFormSections**

```javascript
data() {
  return {
    // ... 其他 data
    activeFormSections: ['basic'], // 默认只展开基础信息
  };
}
```

- [ ] **Step 3: 移除旧的 form-container 和 form-section 样式类**

在 `<style>` 部分删除或注释掉旧的样式类（`.form-container`, `.form-section` 等），因为现在使用新的样式。

- [ ] **Step 4: 提交弹窗表单优化**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add src/views/evidencemanage/incidentrecordquery/index.vue
git commit -m "feat: 优化弹窗表单为可折叠分组

- 使用 el-collapse 实现可折叠分组
- 添加时间线可视化组件
- 添加分组图标和计数徽章
- 默认只展开基础信息

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 6: 测试与验证

### Task 14: 功能测试

**Files:**
- Test: 手动测试页面功能

- [ ] **Step 1: 启动开发服务器**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
npm run dev
```

- [ ] **Step 2: 测试查询功能**

测试项：
- [ ] 统一搜索框输入关键词后按回车，表格正确更新
- [ ] 快捷筛选标签切换后，表格数据正确过滤
  - 全部：显示所有数据
  - 今日警情：显示今天的警情
  - 待处理：显示状态为待处理的警情
  - 我的警情：显示当前用户创建的警情
  - 已归档：显示已归档的警情
- [ ] 高级筛选面板展开/收起动画流畅
- [ ] 时间范围勾选后日期选择器正确显示
- [ ] 应用筛选按钮后，表格数据正确更新

- [ ] **Step 3: 测试批量操作功能**

测试项：
- [ ] 勾选表格行后，批量操作栏正确显示
- [ ] 批量操作栏显示正确的选中数量
- [ ] 全选复选框状态正确（全选、部分选中、未选中）
- [ ] 批量删除功能正常
- [ ] 批量导出功能正常
- [ ] 取消勾选后，批量操作栏正确隐藏

- [ ] **Step 4: 测试表格显示**

测试项：
- [ ] 状态列色块与状态正确对应
- [ ] 操作按钮图标+文字显示正常
- [ ] 操作按钮 hover 效果正常
- [ ] 主操作栏按钮功能正常（新增、刷新、列设置）

- [ ] **Step 5: 测试弹窗表单**

测试项：
- [ ] 新增警情弹窗正常打开
- [ ] 表单分组默认只展开基础信息
- [ ] 点击分组标题可以展开/收起
- [ ] 时间线可视化显示正确
- [ ] 时间输入后，时间线节点正确激活
- [ ] 表单验证功能正常
- [ ] 提交成功后数据正确保存

- [ ] **Step 6: 测试响应式布局**

测试项：
- [ ] 在 1920x1080 分辨率下显示正常
- [ ] 在 1366x768 分辨率下显示正常
- [ ] 在小屏幕上（< 768px）布局适配正常

- [ ] **Step 7: 测试颜色对比度**

测试项：
- [ ] 主文字与背景对比度 ≥ 4.5:1
- [ ] 次要文字与背景对比度 ≥ 4.5:1
- [ ] 状态色块可清晰识别
- [ ] 操作按钮文字清晰可读

- [ ] **Step 8: 记录测试结果**

创建测试记录文件：

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
cat > docs/test-records/incident-record-query-ux-test.md << 'EOF'
# 警情记录查询页面 UI/UX 优化测试记录

**测试日期**: 2026-03-15
**测试人员**: [姓名]

## 测试结果

### 查询功能
- [x] 统一搜索框功能正常
- [x] 快捷筛选切换正常
- [x] 高级筛选展开/收起流畅
- [x] 时间范围选择正常
- [x] 筛选应用正确

### 批量操作
- [x] 批量操作栏显示正常
- [x] 选中计数正确
- [x] 全选状态正确
- [x] 批量删除正常
- [x] 批量导出正常

### 表格显示
- [x] 状态列色块正确
- [x] 操作按钮显示正常
- [x] hover 效果正常

### 弹窗表单
- [x] 分组展开/收起正常
- [x] 时间线可视化正确
- [x] 表单验证正常
- [x] 数据提交正常

### 问题记录

1. 问题描述：
   - 严重程度：
   - 复现步骤：
   - 预期结果：
   - 实际结果：

2. ...

## 测试结论

- [ ] 通过
- [ ] 需要修复
EOF
```

- [ ] **Step 9: 提交测试记录**

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"
git add docs/test-records/incident-record-query-ux-test.md
git commit -m "test: 添加 UI/UX 优化测试记录

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 验收标准

完成所有任务后，确认以下验收标准：

### 功能完整性
- [ ] 所有设计令牌文件创建完成
- [ ] 所有新组件创建并集成
- [ ] 主页面功能正常运行
- [ ] 弹窗表单优化完成

### 代码质量
- [ ] 代码符合项目规范
- [ ] 组件职责单一、可复用
- [ ] 样式使用设计令牌
- [ ] Git 提交信息清晰

### 用户体验
- [ ] 快捷筛选功能正常
- [ ] 批量操作体验流畅
- [ ] 状态列可视化清晰
- [ ] 弹窗表单层次分明
- [ ] 所有交互满足 44×44px 最小点击区域
- [ ] 颜色对比度符合 WCAG 标准

### 性能
- [ ] 页面加载时间无明显增加
- [ ] 组件渲染流畅
- [ ] 动画效果平滑

---

## 回滚方案

如果需要回滚，执行以下步骤：

```bash
cd "E:\JXT\jxt-evidence-system\jxt-frontend"

# 回滚主页面
git checkout HEAD~1 -- src/views/evidencemanage/incidentrecordquery/index.vue
cp src/views/evidencemanage/incidentrecordquery/index.vue.backup src/views/evidencemanage/incidentrecordquery/index.vue

# 回滚新组件（删除）
rm -rf src/components/IncidentQueryBar
rm -rf src/components/BatchActionBar

# 回滚样式文件
rm -rf src/styles/tokens
git checkout HEAD~N -- src/styles/element-variables.scss src/styles/index.scss
```
