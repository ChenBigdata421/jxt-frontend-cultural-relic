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
