<template>
  <el-row :gutter="12" class="summary-cards">
    <el-col
      v-for="card in cardsConfig"
      :key="card.key"
      :xs="12"
      :sm="12"
      :md="6"
      :lg="6"
      :xl="6"
      class="summary-cards__col"
    >
      <div class="summary-card" :style="{ borderTopColor: card.color }">
        <div class="summary-card__header">
          <span class="summary-card__title">{{ card.label }}</span>
          <i :class="['summary-card__icon', card.icon]" :style="{ color: card.color }" />
        </div>
        <div class="summary-card__value">
          <CountTo
            v-if="getTotalCount(card.key) !== null && !prefersReducedMotion"
            :start-val="0"
            :end-val="getTotalCount(card.key)"
            :duration="1600"
            :separator="','"
            class="summary-card__num"
          />
          <span v-else class="summary-card__num">
            {{ getTotalCount(card.key) !== null ? getTotalCount(card.key).toLocaleString() : '-' }}
          </span>
        </div>
        <div class="summary-card__footer">
          今日新增
          <span v-if="getTodayCount(card.key) !== null" style="margin-left:4px;font-weight:600;">
            +{{ getTodayCount(card.key) }}
          </span>
          <span v-else style="margin-left:4px;">-</span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  name: 'SummaryCards',
  components: { CountTo },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      prefersReducedMotion: false
    }
  },
  computed: {
    summaryData() {
      return this.data || {}
    },
    cardsConfig() {
      return [
        { key: 'media', label: '媒体总数', icon: 'ri-film-line', color: '#2E7D32' },
        { key: 'task', label: '任务总数', icon: 'ri-task-line', color: '#0277BD' },
        { key: 'writ', label: '文书总数', icon: 'ri-file-text-line', color: '#F57C00' },
        { key: 'archive', label: '档案总数', icon: 'ri-archive-line', color: '#7B1FA2' },
      ]
    }
  },
  mounted() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.prefersReducedMotion = mq.matches
    const handler = (e) => { this.prefersReducedMotion = e.matches }
    if (mq.addEventListener) {
      mq.addEventListener('change', handler)
    } else {
      mq.addListener(handler)
    }
    this._reducedMotionHandler = handler
    this._mediaQuery = mq
  },
  beforeDestroy() {
    if (this._mediaQuery) {
      if (this._mediaQuery.removeEventListener) {
        this._mediaQuery.removeEventListener('change', this._reducedMotionHandler)
      } else {
        this._mediaQuery.removeListener(this._reducedMotionHandler)
      }
    }
  },
  methods: {
    getTotalCount(key) {
      const entity = this.summaryData[key]
      if (!entity || entity.totalCount === undefined || entity.totalCount === null) return null
      return entity.totalCount
    },
    getTodayCount(key) {
      const entity = this.summaryData[key]
      if (!entity || entity.todayCount === undefined || entity.todayCount === null) return null
      return entity.todayCount
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.summary-cards {
  margin-bottom: 16px;

  &__col {
    margin-bottom: 12px;
  }
}

.summary-card {
  background: $law-bg-card;
  border-radius: $radius-md;
  padding: 16px 20px;
  border-top: 3px solid transparent;
  box-shadow: $shadow-md;
  transition: box-shadow $transition-normal;
  height: 100%;

  &:hover {
    box-shadow: $shadow-lg;
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
    align-items: center;
  }

  &__num {
    font-size: 26px;
    font-weight: 700;
    color: $law-gray-900;
    line-height: 1;
  }

  &__footer {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid $law-gray-300;
    font-size: 12px;
    color: $law-gray-600;
  }
}
</style>
