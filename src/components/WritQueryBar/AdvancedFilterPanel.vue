<template>
  <div class="advanced-filter-wrapper">
    <el-collapse v-model="activeNames" class="advanced-filter-panel">
      <el-collapse-item name="filters">
        <template slot="title">
          <span class="filter-title">
            <i class="el-icon-arrow-right collapse-icon"></i>
            高级筛选
          </span>
        </template>

        <!-- 时间范围 - 复选框 + 日期范围组合 -->
        <div class="filter-section filter-section-full">
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
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="time-range-picker"
                @change="handleTimeChange(range.key)"
              />
            </div>
          </div>
        </div>

        <!-- 其他筛选条件 - 两列布局 -->
        <div class="filter-row">
          <!-- 组织部门 -->
          <div class="filter-section org-section">
            <div class="section-label">组织部门</div>
            <treeselect
              v-model="filterParams.orgId"
              :options="orgOptions"
              placeholder="请选择组织部门"
              @input="handleOrgChange"
              :append-to-body="true"
              :open-on-focus="false"
            />
          </div>

          <!-- 警员 -->
          <div class="filter-section">
            <div class="section-label">警员</div>
            <el-select
              v-model="filterParams.writPoliceIds"
              placeholder="请选择警员"
              clearable
              multiple
              collapse-tags
              filterable
              class="full-width"
              :popper-append-to-body="true"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </div>
        </div>

        <div class="filter-row">
          <!-- 文书地址 -->
          <div class="filter-section">
            <div class="section-label">文书地址</div>
            <el-input
              v-model="filterParams.writAddress"
              placeholder="文书地址"
              clearable
            />
          </div>

          <!-- 文书来源 -->
          <div class="filter-section">
            <div class="section-label">文书来源</div>
            <el-input
              v-model="filterParams.writSource"
              placeholder="文书来源"
              clearable
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { listUser } from '@/api/admin/sys-user';

export default {
  name: 'WritAdvancedFilterPanel',
  components: {
    Treeselect
  },
  props: {
    orgOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'writTimeRange', label: '开书时间', enabled: false },
        { key: 'createdAtRange', label: '创建时间', enabled: false },
        { key: 'updatedAtRange', label: '更新时间', enabled: false }
      ],
      timeValues: {},
      userOptions: [],
      filterParams: {
        orgId: undefined,
        writPoliceIds: [],
        writAddress: undefined,
        writSource: undefined
      }
    };
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        this.$set(this.timeValues, range.key, null);
      }
    },
    handleTimeChange(key) {
      // 等待用户点击"搜索"按钮
    },
    handleOrgChange(orgId) {
      // 当组织变化时，清空警员选择并加载该组织下的人员
      this.filterParams.writPoliceIds = [];
      if (orgId) {
        this.loadUserOptions(orgId);
      } else {
        this.userOptions = [];
      }
    },
    loadUserOptions(orgId) {
      listUser({ orgId: '/' + orgId + '/' })
        .then(response => {
          this.userOptions = response.data.list || [];
        })
        .catch(error => {
          console.error('获取用户列表失败:', error);
          this.userOptions = [];
        });
    },
    handleReset() {
      this.timeRanges.forEach(range => {
        range.enabled = false;
      });
      this.timeValues = {};
      this.userOptions = [];
      this.filterParams = {
        orgId: undefined,
        writPoliceIds: [],
        writAddress: undefined,
        writSource: undefined
      };
      this.$emit('reset');
    },
    getFilterData() {
      const data = { ...this.filterParams };

      // 处理时间范围
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key];
          // 将 writTimeRange -> writTime, createdAtRange -> createdAt 等
          const fieldKey = range.key.replace('Range', '');
          data[fieldKey + 'Start'] = start;
          data[fieldKey + 'End'] = end;
        }
      });

      return data;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.advanced-filter-wrapper {
}

.advanced-filter-panel {
  border: none;
  border-radius: 0;
  overflow: hidden;

  ::v-deep .el-collapse-item__header {
    height: 40px;
    background-color: $law-bg-default;
    border: none;
    border-radius: 0;
    padding: 0 $spacing-4;

    &:hover {
      background-color: darken($law-bg-default, 2%);
    }
  }

  ::v-deep .el-collapse-item__wrap {
    border: none;
    background-color: transparent;
  }

  ::v-deep .el-collapse-item__content {
    padding: $spacing-4;
  }
}

.filter-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-weight: $font-weight-medium;
  color: $law-gray-700;

  .collapse-icon {
    color: $law-gray-500;
    transition: transform 0.3s;
    font-size: 12px;
  }
}

::v-deep .el-collapse-item.is-active .filter-title .collapse-icon {
  transform: rotate(90deg);
}

.filter-section {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-section-full {
  width: 100%;
}

.filter-row {
  display: flex;
  gap: $spacing-5;
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }

  .filter-section {
    flex: 1;
    margin-bottom: 0;
    min-width: 0;
  }
}

.section-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $law-gray-700;
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

  ::v-deep .el-checkbox__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $law-gray-700;
  }

  .time-range-picker {
    flex: 1;
    min-width: 250px;
  }
}

.filter-row {
  ::v-deep .el-input,
  ::v-deep .el-select,
  ::v-deep .vue-treeselect {
    width: 100%;
  }
}

.full-width {
  width: 100%;
}

::v-deep .vue-treeselect {
  .vue-treeselect__control {
    border-radius: 4px;
  }

  &.vue-treeselect--open {
    .vue-treeselect__menu {
      position: fixed;
      z-index: 9999;
    }
  }
}

::v-deep .vue-treeselect__menu-container {
  &.vue-treeselect__menu-container--absolute {
    position: fixed !important;
  }
}

// ========== 注意：通用字体规范已移至全局样式 ==========
// 以下字体规范现已定义在 src/styles/components/forms.scss 中：
// - 输入框内容、Placeholder、焦点状态
// - 下拉列表选项（悬停、选中、禁用）
// - 组织树节点（默认、高亮、禁用）
// - 日期选择器样式
//
// 本文件只保留文书页面特有的布局样式。
//
</style>
