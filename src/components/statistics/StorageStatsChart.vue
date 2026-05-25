<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">存储统计</h3>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        error-msg="存储统计数据加载失败"
        @retry="$emit('retry')"
      />
      <div v-else ref="chartEl" :aria-label="ariaLabel" class="chart-container" />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import ChartEmpty from './ChartEmpty'
import { formatFileSizeFromKB } from '@/utils/dashboard'

// mediaCate → 名称/颜色
const mediaCateMap = {
  1: { name: '视频', color: '#1A5F7A' },
  2: { name: '音频', color: '#2E7D32' },
  3: { name: '图片', color: '#F57C00' },
  4: { name: '文档', color: '#0277BD' },
  5: { name: '其他', color: '#7B1FA2' }
}

export default {
  name: 'StorageStatsChart',
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
      return !this.loading && !this.error && (!this.data || !this.data.totalSizeBytes)
    },
    ariaLabel() {
      return '存储统计环形图，展示各媒体类型的存储空间占用'
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

      const byType = this.data.byMediaType || []
      const chartData = byType.map(t => {
        const mapping = mediaCateMap[t.mediaCate] || { name: t.name || '未知', color: '#90A4AE' }
        return {
          name: mapping.name,
          value: t.sizeBytes || 0,
          count: t.count || 0,
          itemStyle: { color: mapping.color }
        }
      })

      const total = chartData.reduce((s, d) => s + d.value, 0)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter(p) {
            return p.name + '：<b>' + formatFileSizeFromKB(p.value) + '</b>（' + p.percent + '%）'
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
            return name + '  ' + formatFileSizeFromKB(item.value) + '  ' + pct + '%'
          }
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            formatter() {
              return '{total|' + formatFileSizeFromKB(total) + '}\n{label|总存储}'
            },
            rich: {
              total: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#212121',
                lineHeight: 28
              },
              label: {
                fontSize: 12,
                color: '#757575',
                lineHeight: 20
              }
            }
          },
          emphasis: {
            label: { show: true }
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

.chart-container {
  width: 100%;
  height: 300px;
}

</style>
