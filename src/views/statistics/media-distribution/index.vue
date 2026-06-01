<template>
  <div class="media-dist-container">
    <!-- 页面头部：筛选条件 -->
    <div class="media-dist__header">
      <h2 class="media-dist__title">媒体分布统计</h2>
      <div class="media-dist__filters">
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
          class="media-dist__org-select"
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

    <!-- 指标和维度控制栏 -->
    <div class="media-dist__controls">
      <div class="control-group">
        <span class="control-label">统计指标：</span>
        <el-radio-group v-model="activeMetric" size="small" @change="handleMetricChange">
          <el-radio-button label="media_count">媒体数量</el-radio-button>
          <el-radio-button label="file_size_sum">媒体占用空间</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-group">
        <span class="control-label">统计维度：</span>
        <el-radio-group v-model="activeDimension" size="small" @change="handleDimensionChange">
          <el-radio-button label="media_cate">媒体类型</el-radio-button>
          <el-radio-button label="important_level">重要级别</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-spacer" />
      <el-button
        type="success"
        icon="el-icon-download"
        size="small"
        :disabled="!chartData.items || chartData.items.length === 0"
        @click="handleExportExcel"
      >
        导出 Excel
      </el-button>
    </div>

    <!-- 图表 + 数据面板 -->
    <div class="chart-card">
      <div class="chart-card__header">
        <h3 class="chart-card__title">{{ chartTitle }}</h3>
      </div>
      <div class="chart-card__body">
        <!-- 状态层：loading / error / empty 时显示，与图表互斥 -->
        <chart-empty
          v-if="loading || error || isEmpty"
          :loading="loading"
          :empty="isEmpty"
          :error="error"
          empty-text="暂无数据，请设置筛选条件后查询"
          error-msg="数据加载失败"
          @retry="handleQuery"
        />
        <!-- 数据层：仅在有数据时才挂载图表与数据面板 -->
        <template v-else>
          <div ref="chartEl" class="chart-container" />
          <div class="data-panel">
            <div class="data-panel__header">
              <span class="data-panel__label">总计</span>
              <span class="data-panel__total">{{ formatValue(chartData.total) }}</span>
            </div>
            <div class="data-panel__list">
              <div
                v-for="(item, index) in chartData.items"
                :key="index"
                class="data-panel__item"
              >
                <span class="data-panel__dot" :style="{ backgroundColor: PALETTE[index % PALETTE.length] }" />
                <span class="data-panel__name">{{ item.name }}</span>
                <span class="data-panel__value">{{ formatValue(item.value) }}</span>
                <span class="data-panel__percent">{{ calcPercent(item.value, chartData.total) }}%</span>
              </div>
            </div>
          </div>
        </template>
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
import { getMediaDistributionStats } from '@/api/evidence/statistics'
import { orgTreeSelect } from '@/api/admin/sys-org'

const PALETTE = ['#1A5F7A', '#2E7D32', '#F57C00', '#0277BD', '#7B1FA2', '#C62828', '#00838F', '#4E342E']

const METRIC_LABELS = {
  media_count: '媒体数量',
  file_size_sum: '媒体占用空间'
}

const DIMENSION_LABELS = {
  media_cate: '按媒体类型',
  important_level: '按重要级别'
}

export default {
  name: 'MediaDistributionStats',
  components: { Treeselect, ChartEmpty },
  mixins: [resize],
  data() {
    return {
      timeRange: [],
      orgIds: null,
      orgOptions: [],
      loading: false,
      error: false,
      // 指标和维度
      activeMetric: 'media_count',
      activeDimension: 'media_cate',
      // 接口返回数据
      chartData: {
        items: [],
        metric: 'media_count',
        metricLabel: '媒体数量',
        dimension: 'media_cate',
        total: 0
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
      const items = this.chartData && this.chartData.items
      return !Array.isArray(items) || items.length === 0
    },
    chartTitle() {
      const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
      const dimLabel = '（' + DIMENSION_LABELS[this.activeDimension] + '）'|| ''
      return metricLabel + '分布' + dimLabel
    }
  },
  created() {
    // 将模块级常量挂到实例上，使模板可访问
    this.PALETTE = PALETTE
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

    // ==================== 指标和维度控制 ====================

    handleMetricChange() {
      this.fetchData()
    },
    handleDimensionChange() {
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
        dimension: this.activeDimension
      }
      this.loading = true
      this.error = false
      getMediaDistributionStats(params)
        .then(response => {
          if (response && response.code === 200 && response.data) {
            const d = response.data
            // 严格 sanitize：保证 chartData 结构稳定，items 永远是数组
            this.chartData = {
              items: Array.isArray(d.items) ? d.items : [],
              metric: d.metric || this.activeMetric,
              metricLabel: d.metricLabel || '',
              dimension: d.dimension || this.activeDimension,
              total: typeof d.total === 'number' ? d.total : 0
            }
          } else {
            this.error = true
            this.$message.error((response && response.msg) || '查询失败')
          }
        })
        .catch(err => {
          this.error = true
          console.error('[MediaDistribution] fetchData failed:', err)
        })
        .finally(() => {
          this.loading = false
          // 必须在 loading=false 之后调用，否则 v-if 仍为 true，chartEl 未挂载到 DOM
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
      this.activeDimension = 'media_cate'
      this.chartData = { items: [], metric: 'media_count', metricLabel: '媒体数量', dimension: 'media_cate', total: 0 }
      this.error = false
      this.fetchData()
    },

    // ==================== 工具方法 ====================

    formatValue(val) {
      if (this.activeMetric === 'file_size_sum') {
        return formatFileSizeFromKB(val)
      }
      return addThousandSeparator(val)
    },
    calcPercent(value, total) {
      if (!total || total === 0) return '0.00'
      return ((value / total) * 100).toFixed(2)
    },

    // ==================== 图表渲染 ====================

    initChart() {
      const el = this.$refs.chartEl
      if (!el) return
      // 容器条件渲染后可能换了 DOM 节点，已有 instance 绑定到旧节点则需重新初始化
      if (this.chart) {
        const oldDom = this.chart.getDom && this.chart.getDom()
        if (oldDom === el) return
        this.chart.dispose()
        this.chart = null
      }
      this.chart = echarts.init(el, 'jxt')
    },
    renderChart() {
      const { items } = this.chartData
      if (!items || !items.length) return
      this.initChart()
      if (!this.chart) return

      const self = this
      const chartData = items.map((item, idx) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: PALETTE[idx % PALETTE.length]
        }
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter(params) {
            return params.name + '：<b>' + self.formatValue(params.value) + '</b>（' + params.percent + '%）'
          }
        },
        series: [
          {
            name: METRIC_LABELS[this.activeMetric] || '',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              fontSize: 12,
              color: '#616161'
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              }
            },
            data: chartData
          }
        ]
      }

      this.chart.setOption(option, true)
      this.chart.resize()
    },

    // ==================== 导出 Excel ====================

    async handleExportExcel() {
      const { items, total } = this.chartData
      if (!items || !items.length) return

      try {
        const excel = await import('@/vendor/Export2Excel')

        const tHeader = ['分类名称', METRIC_LABELS[this.activeMetric] || '数量', '占比(%)']
        const data = items.map(item => [
          item.name,
          this.formatValue(item.value),
          this.calcPercent(item.value, total)
        ])

        const dateStr = this.timeRange ? this.timeRange[0] + '~' + this.timeRange[1] : 'export'
        excel.export_json_to_excel({
          header: tHeader,
          data: data,
          filename: '媒体分布统计_' + dateStr,
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

.media-dist-container {
  padding: 12px;
  background-color: $law-bg-page;
  min-height: calc(100vh - 84px);
}

.media-dist__header {
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

.media-dist__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.media-dist__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.media-dist__org-select {
  width: 220px;
  min-width: 160px;
}

.media-dist__controls {
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
  width: 55%;
  min-width: 360px;
  height: 420px;
  display: inline-block;
  vertical-align: top;
}

.data-panel {
  display: inline-block;
  width: calc(45% - 24px);
  min-width: 240px;
  vertical-align: top;
  margin-left: 24px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 12px;
  }

  &__label {
    font-size: 13px;
    color: #9e9e9e;
  }

  &__total {
    font-size: 18px;
    font-weight: 600;
    color: $law-gray-900;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    font-size: 13px;
    color: #616161;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__value {
    font-size: 13px;
    font-weight: 500;
    color: $law-gray-900;
    white-space: nowrap;
  }

  &__percent {
    font-size: 12px;
    color: #9e9e9e;
    min-width: 52px;
    text-align: right;
  }
}

@media (max-width: 992px) {
  .media-dist__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .media-dist__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .control-spacer {
    display: none;
  }
  .chart-container {
    width: 100%;
    min-width: unset;
  }
  .data-panel {
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>
