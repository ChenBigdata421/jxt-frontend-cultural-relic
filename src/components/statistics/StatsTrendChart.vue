<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">媒体日采集量趋势</h3>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        empty-text="暂无趋势数据"
        error-msg="趋势数据加载失败"
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
import { buildTooltipTitle, buildTooltipRow } from '@/utils/dashboard'

// 系列名 → 颜色映射（按设计文档 jxt 主题色系）
const SERIES_PALETTE = [
  '#725A45', '#2E7D32', '#F57C00', '#0277BD', '#7B1FA2', '#00897B'
]

export default {
  name: 'StatsTrendChart',
  components: { ChartEmpty },
  mixins: [resize],
  props: {
    /**
     * 趋势数据：{ labels: [], series: [{ name, key?, data: [] }] }
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
    isEmpty() {
      return !this.loading && !this.error && (!this.data || !this.data.labels || this.data.labels.length === 0)
    },
    ariaLabel() {
      return '统计趋势折线图，展示采集量、关联量、归档量等指标的时间变化'
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
    },
    updateChart() {
      if (this.isEmpty || this.error || this.loading) return
      this.initChart()
      if (!this.chart) return

      const labels = this.data.labels || []
      const seriesArr = this.data.series || []

      const series = seriesArr.map((s, idx) => {
        const color = SERIES_PALETTE[idx % SERIES_PALETTE.length]
        // hex → rgba 辅助
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r},${g},${b},${alpha})`
        }
        return {
          name: s.name,
          type: 'line',
          data: s.data || [],
          itemStyle: { color },
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(color, 0.35) },
              { offset: 1, color: hexToRgba(color, 0) }
            ])
          },
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 6
        }
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            const d = params[0] ? params[0].axisValue : ''
            let html = buildTooltipTitle(d)
            params.forEach(p => {
              html += buildTooltipRow(p.color, p.seriesName, p.value)
            })
            return html
          }
        },
        legend: {
          data: seriesArr.map(s => s.name),
          bottom: 0
        },
        grid: {
          left: 40,
          right: 20,
          top: 20,
          bottom: 40
        },
        xAxis: {
          type: 'category',
          data: labels,
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: series
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
