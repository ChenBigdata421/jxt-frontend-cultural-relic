<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">执法类型分布</h3>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        empty-text="暂无分布数据"
        error-msg="执法类型分布加载失败"
        @retry="$emit('retry')"
      />
      <div
        v-else
        ref="chartEl"
        :aria-label="ariaLabel"
        class="chart-container"
      />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '@/components/statistics/mixins/resize'
import ChartEmpty from '@/components/statistics/ChartEmpty'
import { addThousandSeparator } from '@/utils/dashboard'

// 配色（与 jxt 主题色系一致）
const PALETTE = [
  '#1A5F7A', '#2E7D32', '#F57C00', '#0277BD', '#7B1FA2',
  '#C62828', '#00897B', '#5D4037', '#455A64', '#AD1457'
]

export default {
  name: 'EnforcementTypeDist',
  components: { ChartEmpty },
  mixins: [resize],
  props: {
    /**
     * 分布数据：{ items: [{ label, value, id? }] }
     */
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
  data() {
    return {
      chart: null
    }
  },
  computed: {
    items() {
      return (this.data && this.data.items) || []
    },
    isEmpty() {
      return !this.loading && !this.error && this.items.length === 0
    },
    ariaLabel() {
      return '执法类型分布环形图，展示各执法类型的媒体数量占比'
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.$nextTick(() => this.updateChart())
      }
    },
    loading(val) {
      if (!val) {
        this.$nextTick(() => this.updateChart())
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.updateChart())
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.off && this.chart.off('click')
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    initChart() {
      if (this.chart) return
      const el = this.$refs.chartEl
      if (!el) return
      this.chart = echarts.init(el, 'jxt')
      // Phase 2 联动过滤发射点位（已绑定 click，目前仅向上 emit，避免依赖事件总线）
      this.chart.on('click', (params) => {
        if (!params || params.componentType !== 'series') return
        this.$emit('filter-click', {
          dimension: 'enforcementType',
          value: params.data && params.data.id,
          label: params.name,
          source: 'EnforcementTypeDist'
        })
        // TODO(Phase 2): StatsEventBus.$emit('filter-change', payload)
      })
    },
    updateChart() {
      if (this.isEmpty || this.error || this.loading) return
      this.initChart()
      if (!this.chart) return

      const items = this.items
      const total = items.reduce((sum, d) => sum + (Number(d.value) || 0), 0)

      const chartData = items.map((d, idx) => ({
        name: d.label || ('未知' + idx),
        value: Number(d.value) || 0,
        id: d.id,
        itemStyle: { color: PALETTE[idx % PALETTE.length] }
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter(p) {
            return (
              '<div style="font-weight:600;margin-bottom:4px;">' + p.name + '</div>' +
              '<div>数量：<b>' + addThousandSeparator(p.value) + '</b></div>' +
              '<div>占比：<b>' + p.percent + '%</b></div>'
            )
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          formatter(name) {
            const item = chartData.find(d => d.name === name)
            if (!item) return name
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
            return name + '  ' + addThousandSeparator(item.value) + '  ' + pct + '%'
          }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: chartData
        }]
      }

      this.chart.setOption(option, true)
      this.chart.resize()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.chart-card--dashboard {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 16px 20px;
  height: 100%;
  transition: box-shadow $transition-normal;

  &:hover {
    box-shadow: $shadow-lg;
  }

  &__header {
    margin-bottom: 12px;
  }

  &__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: $law-gray-900;
  }

  &__body {
    position: relative;
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
