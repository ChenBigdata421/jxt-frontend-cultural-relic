<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">媒体覆盖统计</h3>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        error-msg="媒体覆盖数据加载失败"
        @retry="$emit('retry')"
      />
      <el-row v-else :gutter="8" class="coverage-cards">
        <el-col
          v-for="item in coverageData"
          :key="item.key"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
        >
          <div class="coverage-card">
            <div class="coverage-card__header">
              <span class="coverage-card__label">{{ item.name }}</span>
              <span v-if="item.todayMatchedCount !== null && item.todayMatchedCount !== undefined" class="coverage-card__today">
                今日 +{{ item.todayMatchedCount }}
              </span>
            </div>
            <div class="coverage-card__value">{{ formatNum(item.matchedCount) }}</div>
            <div class="coverage-card__bar">
              <div
                class="coverage-card__bar-fill"
                :style="{ width: Math.round(item.rate * 100) + '%', background: getColor(item.key) }"
              />
            </div>
            <div class="coverage-card__rate">覆盖率 {{ (item.rate * 100).toFixed(1) }}%</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import ChartEmpty from './ChartEmpty'
import { addThousandSeparator } from '@/utils/dashboard'

const colorMap = {
  archived: '#1A5F7A',
  taskAssociated: '#F57C00',
  locked: '#0277BD'
}

const hiddenKeys = ['caseAssociated', 'incidentAssociated', 'nonEnforcementMedia']

export default {
  name: 'MediaCoverageStats',
  components: { ChartEmpty },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isEmpty() {
      return !this.loading && !this.error && (!this.data || !this.data.items || this.data.items.length === 0)
    },
    coverageData() {
      const items = (this.data && this.data.items) || []
      return items.filter(item => !hiddenKeys.includes(item.key))
    }
  },
  methods: {
    formatNum(val) {
      return addThousandSeparator(val)
    },
    getColor(key) {
      return colorMap[key] || '#1A5F7A'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.coverage-cards {
  padding: 4px 0;
}

.coverage-card {
  padding: 12px 16px;
  background: $law-gray-100;
  border-radius: $radius-sm;
  margin-bottom: 8px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  &__label {
    font-size: 13px;
    color: $law-gray-600;
  }

  &__today {
    font-size: 12px;
    color: #2E7D32;
    font-weight: 500;
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: $law-gray-900;
    margin-bottom: 8px;
  }

  &__bar {
    height: 4px;
    background: $law-gray-300;
    border-radius: 2px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }

  &__rate {
    font-size: 12px;
    color: $law-gray-600;
    margin-top: 4px;
  }
}
</style>
