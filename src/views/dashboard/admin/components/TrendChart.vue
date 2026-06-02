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
import resize from './mixins/resize'
import ChartEmpty from './ChartEmpty'
import { buildTooltipTitle, buildTooltipRow } from '@/utils/dashboard'

const SERIES_COLORS = {
  media: '#2E7D32',
  writ: '#E67E22',
  archive: '#7B1FA2',
  task: '#C0392B'
}

const SERIES_DEFAULT_SELECTED = {
  '媒体': true,
  '任务': true,
  '文书': true,
  '归档': true
}

export default {
  name: 'TrendChart',
  components: { ChartEmpty },
  mixins: [resize],
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
      return '媒体日采集量趋势折线图，展示媒体采集数据的近期走势'
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

      const EXCLUDED_KEYS = ['case', 'incidentRecord']
      const labels = this.data.labels || []
      const seriesArr = (this.data.series || []).filter(s => !EXCLUDED_KEYS.includes(s.key))

      const series = seriesArr.map(s => ({
        name: s.name,
        type: 'line',
        data: s.data || [],
        itemStyle: { color: SERIES_COLORS[s.key] || '#90A4AE' },
        lineStyle: { color: SERIES_COLORS[s.key] || '#90A4AE', width: 2 },
        smooth: 0.3,
        symbol: 'circle',
        symbolSize: 6
      }))

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
          bottom: 0,
          selected: SERIES_DEFAULT_SELECTED
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

.chart-container {
  width: 100%;
  height: 240px;
}
</style>
