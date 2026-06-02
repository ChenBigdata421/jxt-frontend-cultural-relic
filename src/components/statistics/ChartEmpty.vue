<template>
  <div class="chart-empty" :class="{ 'chart-empty--error': error }">
    <!-- 加载态 -->
    <div v-if="loading" class="chart-empty__loading">
      <i class="el-icon-loading" />
      <span>加载中...</span>
    </div>
    <!-- 错误态 -->
    <div v-else-if="error" class="chart-empty__error">
      <i class="el-icon-warning-outline" />
      <p class="chart-empty__msg">{{ errorMsg || '数据加载失败' }}</p>
      <el-button type="text" size="small" @click="$emit('retry')">
        <i class="el-icon-refresh" /> 重试
      </el-button>
    </div>
    <!-- 空态 -->
    <div v-else-if="empty" class="chart-empty__empty">
      <i class="el-icon-data-analysis" />
      <p class="chart-empty__msg">{{ emptyText || '暂无数据' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartEmpty',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    errorMsg: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
  text-align: center;
  color: var(--law-gray-400, #9EA1A4);
  font-size: 14px;

  i {
    font-size: 32px;
    margin-bottom: 8px;
    display: block;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    i {
      font-size: 28px;
      color: #725A45;
      margin-bottom: 8px;
    }
    span {
      color: #757575;
      font-size: 13px;
    }
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    i {
      color: #F57C00;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    i {
      color: #B0BEC5;
    }
  }

  &__msg {
    margin: 4px 0;
    font-size: 13px;
    color: var(--law-gray-400, #9EA1A4);
  }
}
</style>
