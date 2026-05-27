<template>
  <div class="officer-relation-container">
    <!-- 页面头部：筛选条件 -->
    <div class="officer-relation__header">
      <h2 class="officer-relation__title">人员追加统计</h2>
      <div class="officer-relation__filters">
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
          class="officer-relation__org-select"
        />
        <!-- 人员筛选 -->
        <el-select
          v-model="policeIds"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入人员姓名搜索"
          :remote-method="searchOfficers"
          :loading="officerSearchLoading"
          size="small"
          class="officer-relation__police-select"
        >
          <el-option
            v-for="item in officerOptions"
            :key="item.userId"
            :label="item.userName + '(' + item.policeNo + ')'"
            :value="item.userId"
          />
        </el-select>
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
    <div class="officer-relation__controls">
      <div class="control-group">
        <span class="control-label">统计指标：</span>
        <el-radio-group v-model="activeMetric" size="small" @change="handleMetricChange">
          <el-radio-button label="task_relation_rate">任务追加率</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-spacer" />
      <el-button
        type="success"
        icon="el-icon-download"
        size="small"
        :disabled="!chartData.officerNames || chartData.officerNames.length === 0"
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
import { getOfficerRelationStats } from '@/api/evidence/statistics'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'

const PALETTE = ['#1A5F7A', '#2E7D32', '#F57C00', '#0277BD', '#7B1FA2', '#C62828', '#00838F', '#4E342E']

const METRIC_LABELS = {
  task_relation_rate: '任务追加率'
}

export default {
  name: 'OfficerRelationStats',
  components: { Treeselect, ChartEmpty },
  mixins: [resize],
  data() {
    return {
      timeRange: [],
      orgIds: null,
      orgOptions: [],
      policeIds: [],
      officerOptions: [],
      officerSearchLoading: false,
      loading: false,
      error: false,
      activeMetric: 'task_relation_rate',
      chartData: {
        officerNames: [],
        metric: 'task_relation_rate',
        metricLabel: '任务追加率',
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
      return this.chartData.officerNames.length === 0
    },
    chartTitle() {
      const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
      return '人员' + metricLabel + ' TOP10'
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
    searchOfficers(query) {
      if (!query || query.length < 1) {
        this.officerOptions = []
        return
      }
      this.officerSearchLoading = true
      listUser({ userName: query, pageIndex: 1, pageSize: 20 }).then(response => {
        if (response.code === 200 && response.data && response.data.list) {
          this.officerOptions = response.data.list
        } else {
          this.officerOptions = []
        }
      }).catch(() => {
        this.officerOptions = []
      }).finally(() => {
        this.officerSearchLoading = false
      })
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
        policeIds: this.policeIds || [],
        metric: this.activeMetric
      }
      this.loading = true
      this.error = false
      getOfficerRelationStats(params)
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
      this.policeIds = []
      this.activeMetric = 'task_relation_rate'
      this.chartData = { officerNames: [], metric: 'task_relation_rate', metricLabel: '任务追加率', series: [] }
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
      const { officerNames, series } = this.chartData
      if (!officerNames || !officerNames.length) return
      this.initChart()
      if (!this.chart) return

      const reversedNames = [...officerNames].reverse()
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
      const { officerNames, series } = this.chartData
      if (!officerNames || !officerNames.length) return

      try {
        const excel = await import('@/vendor/Export2Excel')
        const metricLabel = METRIC_LABELS[this.activeMetric] || this.activeMetric
        const tHeader = ['人员姓名', metricLabel]
        const data = officerNames.map((name, idx) => {
          const val = series.length > 0 ? series[0].data[idx] : 0
          return [name, this.formatValue(val)]
        })

        const dateStr = this.timeRange ? this.timeRange[0] + '~' + this.timeRange[1] : 'export'
        excel.export_json_to_excel({
          header: tHeader,
          data: data,
          filename: '人员追加统计_' + dateStr,
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

.officer-relation-container {
  padding: 12px;
  background-color: $law-bg-page;
  min-height: calc(100vh - 84px);
}

.officer-relation__header {
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

.officer-relation__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.officer-relation__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.officer-relation__org-select {
  width: 220px;
  min-width: 160px;
}

.officer-relation__police-select {
  width: 260px;
  min-width: 180px;
}

.officer-relation__controls {
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
  .officer-relation__header {
    flex-direction: column;
    align-items: flex-start;
  }
  .officer-relation__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .control-spacer {
    display: none;
  }
}
</style>
