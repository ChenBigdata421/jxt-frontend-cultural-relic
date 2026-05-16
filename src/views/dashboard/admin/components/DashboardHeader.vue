<template>
  <div class="dashboard-header">
    <div class="dashboard-header__left">
      <h2 class="dashboard-header__title">数据概览</h2>
      <span v-if="dataAsOf" class="dashboard-header__as-of">
        数据截至 {{ parseTime(dataAsOf) }}
      </span>
    </div>
    <div class="dashboard-header__right">
      <el-alert
        v-if="partial && errors && errors.length"
        type="warning"
        :closable="false"
        class="dashboard-header__alert"
        show-icon
      >
        <template slot="title">
          部分数据加载失败：{{ errors.join('、') }}
        </template>
      </el-alert>
      <el-button
        :loading="loading"
        icon="el-icon-refresh"
        size="small"
        @click="$emit('refresh')"
      >
        刷新
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardHeader',
  props: {
    dataAsOf: {
      type: String,
      default: ''
    },
    partial: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  &__left {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $law-gray-900;
  }

  &__as-of {
    font-size: 13px;
    color: $law-gray-600;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__alert {
    max-width: 400px;
    padding: 4px 8px;
  }
}
</style>
