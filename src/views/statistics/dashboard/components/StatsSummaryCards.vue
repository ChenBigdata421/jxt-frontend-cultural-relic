<template>
  <el-row type="flex" :gutter="12" class="stats-summary-cards">
    <el-col
      v-for="card in cardsConfig"
      :key="card.key"
      :xs="12"
      :sm="12"
      :md="6"
      :lg="6"
      class="stats-summary-cards__col"
    >
      <div
        v-if="loading"
        class="skeleton skeleton--card"
      >
        <div class="skeleton__line skeleton__line--title" />
        <div class="skeleton__line skeleton__line--value" />
        <div class="skeleton__line skeleton__line--short" />
      </div>
      <div
        v-else
        class="stats-card"
        :style="{ borderTopColor: card.color }"
      >
        <div class="stats-card__header">
          <span class="stats-card__title">{{ card.label }}</span>
          <i :class="['stats-card__icon', card.icon]" :style="{ color: card.color }" />
        </div>
        <div class="stats-card__value">
          <span class="stats-card__num">{{ formatValue(card) }}</span>
          <span v-if="card.unit" class="stats-card__unit">{{ card.unit }}</span>
        </div>
        <div v-if="card.change !== null && card.change !== undefined" class="stats-card__footer">
          <span
            class="stats-card__change"
            :class="changeClass(card)"
          >
            <i :class="changeIcon(card)" />
            较上月 {{ formatChange(card) }}
          </span>
        </div>
        <div v-else class="stats-card__footer stats-card__footer--placeholder">
          —
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { addThousandSeparator, formatFileSizeFromKB } from '@/utils/dashboard'

/**
 * Hero Metrics 卡片
 * 数据来源：StatisticsDashboardResponse.heroMetrics
 * 字段约定（按 key 取值，兼容数组顺序）：
 *   totalMedia           - 总采集量（数字）
 *   associationRate      - 关联率（0-1 浮点）
 *   archiveRate          - 归档率（0-1 浮点）
 *   storageUsedBytes     - 存储占用（字节）
 *
 * 每项还可含：
 *   value         - 当前值
 *   change        - MoM 变化（绝对值或百分比，按 format 决定）
 *   changeType    - 'absolute' | 'percent'  默认 percent
 */
const CARD_DEFS = [
  {
    key: 'totalMedia',
    label: '总采集量',
    icon: 'el-icon-film',
    color: '#1A5F7A',
    format: 'number'
  },
  {
    key: 'associationRate',
    label: '关联率',
    icon: 'el-icon-link',
    color: '#2E7D32',
    format: 'percent'
  },
  {
    key: 'archiveRate',
    label: '归档率',
    icon: 'el-icon-folder-checked',
    color: '#F57C00',
    format: 'percent'
  },
  {
    key: 'storageUsedBytes',
    label: '存储占用',
    icon: 'el-icon-coin',
    color: '#7B1FA2',
    format: 'filesize'
  }
]

export default {
  name: 'StatsSummaryCards',
  props: {
    metrics: {
      type: [Array, Object],
      default: null
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
    /**
     * 将 metrics（数组或对象）规范化为按 key 索引的字典
     */
    metricsMap() {
      const map = {}
      if (!this.metrics) return map
      if (Array.isArray(this.metrics)) {
        this.metrics.forEach(m => {
          if (m && m.key) map[m.key] = m
        })
      } else if (typeof this.metrics === 'object') {
        Object.keys(this.metrics).forEach(k => {
          const m = this.metrics[k]
          map[k] = (m && typeof m === 'object') ? m : { value: m }
        })
      }
      return map
    },
    cardsConfig() {
      return CARD_DEFS.map(def => {
        const item = this.metricsMap[def.key] || {}
        return {
          ...def,
          value: item.value !== undefined ? item.value : null,
          change: item.change !== undefined ? item.change : null,
          changeType: item.changeType || 'percent'
        }
      })
    }
  },
  methods: {
    formatValue(card) {
      if (card.value === null || card.value === undefined) return '-'
      switch (card.format) {
        case 'number':
          return addThousandSeparator(card.value)
        case 'percent':
          // 后端约定为 0-1 浮点
          return (Number(card.value) * 100).toFixed(1) + '%'
        case 'filesize':
          return formatFileSizeFromKB(card.value)
        default:
          return String(card.value)
      }
    },
    formatChange(card) {
      const v = Number(card.change)
      if (isNaN(v)) return '-'
      const sign = v >= 0 ? '+' : ''
      if (card.changeType === 'absolute') {
        if (card.format === 'filesize') return sign + formatFileSizeFromKB(Math.abs(v)) + (v >= 0 ? '' : '')
        if (card.format === 'number') return sign + addThousandSeparator(v)
        return sign + v.toFixed(1)
      }
      // percent: change 是百分点差值（例如 5.2 表示 +5.2 个百分点）
      return sign + v.toFixed(1) + '%'
    },
    changeClass(card) {
      const v = Number(card.change)
      if (isNaN(v) || v === 0) return 'stats-card__change--neutral'
      // 业务语义：4 张卡片中 associationRate/archiveRate 增加是好事；其余视为中性
      return v > 0
        ? 'stats-card__change--up'
        : 'stats-card__change--down'
    },
    changeIcon(card) {
      const v = Number(card.change)
      if (isNaN(v) || v === 0) return 'el-icon-minus'
      return v > 0 ? 'el-icon-top' : 'el-icon-bottom'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.stats-summary-cards {
  margin-bottom: 12px;
  flex-wrap: wrap;

  &__col {
    margin-bottom: 12px;
  }
}

.stats-card {
  background: $law-bg-card;
  border-radius: $radius-md;
  padding: 16px 20px;
  border-top: 3px solid transparent;
  box-shadow: $shadow-md;
  transition: box-shadow $transition-normal, transform $transition-normal;
  height: 100%;
  position: relative;

  &--clickable {
    cursor: pointer;

    &:hover {
      box-shadow: $shadow-lg;
      transform: translateY(-2px);
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 13px;
    color: $law-gray-600;
    font-weight: 500;
  }

  &__icon {
    font-size: 22px;
  }

  &__value {
    min-height: 36px;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__num {
    font-size: 26px;
    font-weight: 700;
    color: $law-gray-900;
    line-height: 1;
  }

  &__unit {
    font-size: 13px;
    color: $law-gray-600;
  }

  &__footer {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid $law-gray-300;
    font-size: 12px;
    color: $law-gray-600;

    &--placeholder {
      color: $law-gray-400;
    }
  }

  &__change {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;

    &--up {
      color: #3D8B40;
    }
    &--down {
      color: #C62828;
    }
    &--neutral {
      color: $law-gray-500;
    }
  }
}

// ========== 骨架屏 ==========
.skeleton {
  background: $law-bg-card;
  border-radius: $radius-md;
  padding: 16px 20px;
  height: 120px;

  &__line {
    background: linear-gradient(90deg, #ECEFF1 25%, #F5F5F5 50%, #ECEFF1 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 12px;

    &--title {
      width: 40%;
      height: 14px;
    }

    &--value {
      width: 60%;
      height: 26px;
      margin-top: 12px;
    }

    &--short {
      width: 30%;
      height: 10px;
      margin-top: 16px;
    }
  }
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
