<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">媒体类型分布</h3>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        error-msg="媒体分布数据加载失败"
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
import { addThousandSeparator } from '@/utils/dashboard'

// mediaCate 值 → 颜色/名称映射（后端 MediaCate int 枚举）
const mediaCateMap = {
  1: { name: '视频', color: '#725A45' },
  2: { name: '音频', color: '#2E7D32' },
  3: { name: '图片', color: '#F57C00' },
  4: { name: '文档', color: '#0277BD' },
  5: { name: '其他', color: '#7B1FA2' }
}

export default {
  name: 'MediaDistributionChart',
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
      const items = this.data && this.data.items
      return !this.loading && !this.error && (!items || items.length === 0)
    },
    ariaLabel() {
      return '媒体类型分布环形图，展示各类型媒体文件的占比'
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

      const items = (this.data && this.data.items) || []
      const total = items.reduce((sum, d) => sum + (d.count || 0), 0)

      const chartData = items.map(d => {
        const mapping = mediaCateMap[d.mediaCate] || { name: d.name || '未知', color: '#90A4AE' }
        return {
          name: mapping.name,
          value: d.count || 0,
          itemStyle: { color: mapping.color }
        }
      })

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
          radius: ['45%', '70%'],
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
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
