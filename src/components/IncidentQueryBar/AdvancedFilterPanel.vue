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
