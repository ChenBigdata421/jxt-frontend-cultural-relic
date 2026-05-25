<template>
  <div class="trend-collect-container">
    <!-- 页面头部：筛选条件 -->
    <div class="trend-collect__header">
      <h2 class="trend-collect__title">采集趋势统计</h2>
      <div class="trend-collect__filters">
        <!-- 时间筛选 -->
        <el-date-picker
          v-model="timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          size="small"
          style="width: 280px;"
          :picker-options="pickerOptions"
        />
        <!-- 机构筛选 -->
        <treeselect
          v-model="orgIds"
          :options="orgOptions"
          :multiple="true"
          :flat="true"
          placeholder="请选择机构"
          no-options-text="暂无机构数据"
          no-results-text="未找到匹配机构"
          class="trend-collect__org-select"
        />
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          :loading="loading"
          @click="handleQuery"
        >
          查询
        </el-button>
        <el-button
          icon="el-icon-refresh"
          size="small"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
    </div>

    <!-- 指标、维度和粒度控制栏 -->
    <div class="trend-collect__controls">
      <div class="control-group">
        <span class="control-label">统计指标：</span>
        <el-radio-group v-model="activeMetric" size="small" @change="handleMetricChange">
          <el-radio-button label="media_count">媒体数量</el-radio-button>
          <el-radio-button label="file_size_sum">媒体占用空间</el-radio-button>
          <el-radio-button label="video_duration">视频时长</el-radio-button>
          <el-radio-button label="audio_duration">音频时长</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-group">
        <span class="control-label">统计维度：</span>
        <el-radio-group v-model="activeDimension" size="small" @change="handleDimensionChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="media_cate">媒体类型</el-radio-button>
          <el-radio-button label="enforcement_type">执法类型</el-radio-button>
          <el-radio-button label="important_level">重要级别</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-group">
        <span class="control-label">分组粒度：</span>
        <el-radio-group v-model="activeGranularity" size="small" @change="handleGranularityChange">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="quarter">季</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-spacer" />
      <el-button
        type="success"
        icon="el-icon-download"
        size="small"
        :disabled="!chartData.labels || chartData.labels.length === 0"
        @click="handleExportExcel"
      >
        导出 Excel
      </el-button>
    </div>

    <!-- 图表区域 -->
    <div class="chart-card">
      <div class="chart-card__header">
        <h3 class="chart-card__title">{{ chartTitle }}</h3>
      </div>
      <div class="chart-card__body">
        <div ref="chartEl" class="chart-container" />
        <chart-empty
          v-if="loading || error || isEmpty"
          :loading="loading"
          :empty="isEmpty"
          :error="error"
          empty-text="暂无数据，请设置筛选条件后查询"
          error-msg="数据加载失败"
          @retry="handleQuery"
        />
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import resize from '@/components/statistics/mixins/resize'
import ChartEmpty from '@/components/statistics/ChartEmpty'
import { addThousandSeparator, formatFileSizeFromKB } from '@/utils/dashboard'
import { getTrendCollectStats } from '@/api/evidence/statistics'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { parseTime } from '@/utils/costum'

const PALETTE = ['#1A5F7A', '#2E7D32', '#F57C00', '#0277BD', '#7B1FA2', '#C62828', '#00838F', '#4E342E']

const METRIC_LABELS = {
  media_count: '媒体数量',
  file_size_sum: '媒体占用空间',
  video_duration: '视频时长',
  audio_duration: '音频时长'
}

const DIMENSION_LABELS = {
  media_cate: '按媒体类型',
  enforcement_type: '按执法类型',
  important_level: '按重要级别'
}

const GRANULARITY_LABELS = {
  day: '按日',
  week: '按周',
  month: '按月',
  quarter: '按季',
  year: '按年'
}

export default {
  name: 'TrendCollectStats',
  components: { Treeselect, ChartEmpty },
  mixins: [resize],
  data() {
    return {
      timeRange: [],
      orgIds: null,
      orgOptions: [],
      loading: false,
      error: false,
      // 指标、维度和粒度
      activeMetric: 'media_count',
      activeDimension: '',
      activeGranularity: 'day',
      // 接口返回数据
      chartData: {
        labels: [],
        metric: 'media_count',
        metricLabel: '媒体数量',
        dimension: '',
        series: []
      },
      chart: null,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    isEmpty() {
      if (this.loading || this.error) return false
      return !this.chartData.labels || this.chartData.labels.length === 0
    },
    currentDimension() {
      return this.activeDimension || ''
    },
    chartTitle() {
      const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
      const dimLabel = this.currentDimension ? '（' + (DIMENSION_LABELS[this.currentDimension] || '') + '）' : ''
      const granLabel = GRANULARITY_LABELS[this.activeGranularity] || ''
      return metricLabel + '采集趋势' + dimLabel + ' - ' + granLabel
    }
  },
  created() {
    // 默认最近30天
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 30 * 24 * 3600 * 1000)
    this.timeRange = [
      this.formatDate(start),
      this.formatDate(end)
    ]
    this.fetchOrgOptions()
  },
  mounted() {
    this.handleQuery()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    fetchOrgOptions() {
      orgTreeSelect().then(response => {
        if (response.code === 200 && response.data) {
          this.orgOptions = response.data
        }
      }).catch(() => {})
    },

    // ==================== 指标、维度和粒度控制 ====================

    handleMetricChange() {
      this.fetchData()
    },
    handleDimensionChange() {
      this.fetchData()
    },
    handleGranularityChange() {
      this.fetchData()
    },

    // ==================== 数据查询 ====================

    handleQuery() {
      if (!this.timeRange || this.timeRange.length !== 2) {
        this.$message.warning('请选择时间范围')
        return
      }
      this.fetchData()
    },
    fetchData() {
      if (!this.timeRange || this.timeRange.length !== 2) return
      const [start, end] = this.timeRange
      const params = {
        startDate: start,
        endDate: end,
        orgIds: this.orgIds || [],
        metric: this.activeMetric,
        dimension: this.currentDimension,
        granularity: this.activeGranularity
      }
      this.loading = true
      this.error = false
      getTrendCollectStats(params)
        .then(response => {
          if (response.code === 200 && response.data) {
            this.chartData = response.data
          } else {
            this.error = true
            this.$message.error(response.msg || '查询失败')
          }
        })
        .catch(() => {
          this.error = true
        })
        .finally(() => {
          this.loading = false
          this.$nextTick(() => {
            this.renderChart()
          })
        })
    },
    handleReset() {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 30 * 24 * 3600 * 1000)
      this.timeRange = [this.formatDate(start), this.formatDate(end)]
      this.orgIds = null
      this.activeMetric = 'media_count'
      this.activeDimension = ''
      this.activeGranularity = 'day'
      this.chartData = { labels: [], metric: 'media_count', metricLabel: '媒体数量', dimension: '', series: [] }
      this.error = false
      this.fetchData()
    },

    // ==================== 图表渲染 ====================

    initChart() {
      if (this.chart) return
      const el = this.$refs.chartEl
      if (!el) return
      this.chart = echarts.init(el, 'jxt')
    },
    formatValue(val) {
      if (this.activeMetric === 'file_size_sum') {
        return formatFileSizeFromKB(val)
      }
      if (this.activeMetric === 'video_duration' || this.activeMetric === 'audio_duration') {
        return this.formatDuration(val)
      }
      return addThousandSeparator(val)
    },
    formatDuration(ms) {
      if (!ms || ms === 0) return '0秒'
      const seconds = Math.floor(ms / 1000)
      if (seconds < 60) return seconds + '秒'
      const minutes = Math.floor(seconds / 60)
      const remainSeconds = seconds % 60
      if (minutes < 60) return minutes + '分' + (remainSeconds > 0 ? remainSeconds + '秒' : '')
      const hours = Math.floor(minutes / 60)
      const remainMinutes = minutes % 60
      return hours + '小时' + (remainMinutes > 0 ? remainMinutes + '分' : '')
    },
    // 使用 parseTime 格式化日期标签，与文书管理页面保持一致
    formatDateLabel(dateStr) {
      if (!dateStr) return ''
      return parseTime(dateStr, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    renderChart() {
      const { labels, series } = this.chartData
      if (!labels || !labels.length) return
      this.initChart()
      if (!this.chart) return

      const hasDimension = this.currentDimension !== '' && series.length > 1

      const self = this

      // 将后端返回的日期格式化为 YYYY-MM-DD HH:mm:ss
      const formattedLabels = labels.map(l => this.formatDateLabel(l))

      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${alpha})`
      }

      const chartSeries = series.map((s, idx) => {
        const color = PALETTE[idx % PALETTE.length]
        return {
          name: s.name,
          type: 'line',
          data: s.data || [],
          itemStyle: { color },
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(color, 0.25) },
              { offset: 1, color: hexToRgba(color, 0) }
            ])
          },
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            focus: 'series'
          }
        }
      })

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            let html = '<b>' + params[0].axisValue + '</b><br/>'
            params.forEach(p => {
              html += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.color + ';margin-right:4px;"></span>'
              html += p.seriesName + '：<b>' + self.formatValue(p.value) + '</b><br/>'
            })
            if (hasDimension) {
              const total = params.reduce((sum, p) => sum + (p.value || 0), 0)
              html += '合计：<b>' + self.formatValue(total) + '</b>'
            }
            return html
          }
        },
        legend: hasDimension
          ? { data: chartSeries.map(s => s.name), bottom: 0 }
          : undefined,
        grid: {
          left: 60,
          right: 30,
          top: 20,
          bottom: hasDimension ? 40 : 20
        },
        xAxis: {
          type: 'category',
          data: formattedLabels,
          boundaryGap: false,
          axisLabel: {
            fontSize: 12,
            color: '#616161',
            rotate: formattedLabels.length > 15 ? 45 : 0
          },
          axisLine: { lineStyle: { color: '#E0E0E0' } },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 12,
            color: '#616161',
            formatter(val) {
              if (self.activeMetric === 'file_size_sum') {
                return formatFileSizeFromKB(val)
              }
              if (self.activeMetric === 'video_duration' || self.activeMetric === 'audio_duration') {
                return self.formatDuration(val)
              }
              return addThousandSeparator(val)
            }
          },
          splitLine: { lineStyle: { color: '#F0F0F0' } },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        series: chartSeries
      }

      this.chart.setOption(option, true)
      this.chart.resize()
    },

    // ==================== 导出 Excel ====================

    async handleExportExcel() {
      const { labels, series, metricLabel, dimension } = this.chartData
      if (!labels || !labels.length) return

      try {
        const excel = await import('@/vendor/Export2Excel')

        let tHeader = ['时间']
        let dimensionName = ''
        if (dimension) {
          dimensionName = DIMENSION_LABELS[dimension] || dimension
          tHeader.push('分类')
        }
        tHeader.push(metricLabel)

        const data = []
        labels.forEach((label, labelIdx) => {
          if (!dimension || series.length <= 1) {
            const val = series.length > 0 ? series[0].data[labelIdx] : 0
            if (dimension) {
              series.forEach(s => {
                const v = s.data[labelIdx]
                data.push([label, s.name, this.formatValue(v)])
              })
            } else {
              data.push([label, this.formatValue(val)])
            }
          } else {
            series.forEach(s => {
              const v = s.data[labelIdx]
              data.push([label, s.name, this.formatValue(v)])
            })
          }
        })

        const dateStr = this.timeRange ? this.timeRange[0] + '~' + this.timeRange[1] : 'export'
        excel.export_json_to_excel({
          header: tHeader,
          data: data,
          filename: '采集趋势统计_' + dateStr,
          autoWidth: true,
          bookType: 'xlsx'
        })
        this.$message.success('导出成功')
      } catch (e) {
        console.error('导出失败', e)
        this.$message.error('导出失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.trend-collect-container {
  padding: 12px;
  background-color: $law-bg-page;
  min-height: calc(100vh - 84px);
}

.trend-collect__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.trend-collect__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.trend-collect__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.trend-collect__org-select {
  width: 220px;
  min-width: 160px;
}

.trend-collect__controls {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  margin-bottom: 12px;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;

  & + .control-group {
    margin-left: 16px;
  }
}

.control-label {
  font-size: 13px;
  font-weight: 500;
  color: $law-gray-900;
  white-space: nowrap;
}

.control-spacer {
  flex: 1;
}

.chart-card {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 16px 20px;
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
  height: 420px;
}

@media (max-width: 992px) {
  .trend-collect__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .trend-collect__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .control-spacer {
    display: none;
  }
}
</style>
