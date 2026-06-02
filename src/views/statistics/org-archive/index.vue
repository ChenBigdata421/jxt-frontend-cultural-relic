<template>
  <div class="org-archive-container">
    <!-- 页面头部：筛选条件 -->
    <div class="org-archive__header">
      <h2 class="org-archive__title">机构归档统计</h2>
      <div class="org-archive__filters">
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
          class="org-archive__org-select"
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

    <!-- 指标控制栏 -->
    <div class="org-archive__controls">
      <div class="control-group">
        <span class="control-label">统计指标：</span>
        <el-radio-group v-model="activeMetric" size="small" @change="handleMetricChange">
          <el-radio-button label="archive_rate">归档率</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-spacer" />
      <el-button
        type="success"
        icon="el-icon-download"
        size="small"
        :disabled="!chartData.orgNames || chartData.orgNames.length === 0"
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
import { getOrgArchiveStats } from '@/api/evidence/statistics'
import { orgTreeSelect } from '@/api/admin/sys-org'

const PALETTE = ['#725A45', '#2E7D32', '#E67E22', '#2980B9', '#7B1FA2', '#C0392B', '#00897B', '#8D6E63']

const METRIC_LABELS = {
  archive_rate: '归档率'
}

export default {
  name: 'OrgArchiveStats',
  components: { Treeselect, ChartEmpty },
  mixins: [resize],
  data() {
    return {
      timeRange: [],
      orgIds: null,
      orgOptions: [],
      loading: false,
      error: false,
      activeMetric: 'archive_rate',
      chartData: {
        orgNames: [],
        metric: 'archive_rate',
        metricLabel: '归档率',
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
      return this.chartData.orgNames.length === 0
    },
    chartTitle() {
      const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
      return '机构' + metricLabel + ' TOP10'
    }
  },
  created() {
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

    // ==================== 指标控制 ====================

    handleMetricChange() {
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
        metric: this.activeMetric
      }
      this.loading = true
      this.error = false
      getOrgArchiveStats(params)
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
      this.activeMetric = 'archive_rate'
      this.chartData = { orgNames: [], metric: 'archive_rate', metricLabel: '归档率', series: [] }
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
      if (val === null || val === undefined) return '0.0%'
      return Number(val).toFixed(1) + '%'
    },
    renderChart() {
      const { orgNames, series } = this.chartData
      if (!orgNames || !orgNames.length) return
      this.initChart()
      if (!this.chart) return

      const reversedNames = [...orgNames].reverse()
      const reversedData = series.length > 0 ? [...(series[0].data || [])].reverse() : []

      const self = this
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter(params) {
            let html = params[0].name + '<br/>'
            params.forEach(p => {
              html += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.color + ';margin-right:4px;"></span>'
              html += p.seriesName + '：<b>' + self.formatValue(p.value) + '</b><br/>'
            })
            return html
          }
        },
        grid: {
          left: 180,
          right: 80,
          top: 10,
          bottom: 10
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          data: reversedNames,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            fontSize: 12,
            color: '#616161',
            width: 160,
            overflow: 'truncate',
            ellipsis: '...'
          }
        },
        series: [{
          name: series.length > 0 ? series[0].name : METRIC_LABELS[this.activeMetric],
          type: 'bar',
          barMaxWidth: 20,
          data: reversedData,
          itemStyle: {
            color: PALETTE[0],
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: (p) => this.formatValue(p.value),
            fontSize: 12,
            color: '#616161'
          }
        }]
      }

      this.chart.setOption(option, true)
      this.chart.resize()
    },

    // ==================== 导出 Excel ====================

    async handleExportExcel() {
      const { orgNames, series } = this.chartData
      if (!orgNames || !orgNames.length) return

      try {
        const excel = await import('@/vendor/Export2Excel')
        const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
        const tHeader = ['机构名称', metricLabel]
        const data = orgNames.map((name, idx) => {
          const val = series.length > 0 ? series[0].data[idx] : 0
          return [name, this.formatValue(val)]
        })

        const dateStr = this.timeRange ? this.timeRange[0] + '~' + this.timeRange[1] : 'export'
        excel.export_json_to_excel({
          header: tHeader,
          data: data,
          filename: '机构归档统计_' + dateStr,
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

.org-archive-container {
  padding: 12px;
  background-color: $law-bg-page;
  min-height: calc(100vh - 84px);
}

.org-archive__header {
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

.org-archive__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.org-archive__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.org-archive__org-select {
  width: 260px;
  min-width: 180px;
}

.org-archive__controls {
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
  .org-archive__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .org-archive__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .control-spacer {
    display: none;
  }
}
</style>
