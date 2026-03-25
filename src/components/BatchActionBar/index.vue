<template>
  <transition name="slide-down">
    <div v-if="selectedCount > 0" class="batch-action-bar">
      <div class="selection-info">
        <el-checkbox
          v-model="allSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          已选择 {{ selectedCount }} 项
        </el-checkbox>
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
      this.$emit('select-all-change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.batch-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-3 $spacing-4;
  background-color: $law-gray-50;
  border: 1px solid $law-gray-200;
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

// ========== Secondary Button 样式 ==========
.action-btn {
  &.secondary {
    background-color: rgba(26, 95, 122, 0.1);
    color: #1A5F7A;
    border: none;

    &:hover {
      background-color: rgba(26, 95, 122, 0.2);
    }

    &:active {
      background-color: rgba(26, 95, 122, 0.3);
    }

    &:focus {
      outline: 2px solid #1A5F7A;
      outline-offset: 2px;
    }

    // 确保图标和文字颜色一致
    i {
      color: inherit;
    }
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
