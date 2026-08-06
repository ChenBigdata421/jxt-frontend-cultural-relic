<template>
  <div class="chart-card--dashboard">
    <div class="chart-card--dashboard__header">
      <h3 class="chart-card--dashboard__title">部门排名</h3>
      <el-button
        type="text"
        size="small"
        @click="handleViewAll"
      >
        查看全部 <i class="el-icon-arrow-right" />
      </el-button>
    </div>
    <div class="chart-card--dashboard__body">
      <chart-empty
        v-if="loading || error || isEmpty"
        :loading="loading"
        :empty="isEmpty"
        :error="error"
        empty-text="暂无排名数据"
        error-msg="部门排名加载失败"
        @retry="$emit('retry')"
      />
      <template v-else>
        <!-- 上部：TOP10 横向柱状图 -->
        <div
          ref="chartEl"
          :aria-label="ariaLabel"
          class="chart-container"
        />
        <!-- 下部：el-table 明细 -->
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          size="small"
        >
          <el-table-column label="排名" type="index" width="70" align="center" />
          <el-table-column prop="orgName" label="部门名称" min-width="160" />
          <el-table-column prop="mediaCount" label="采集量" width="120" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.mediaCount) }}</template>
          </el-table-column>
          <el-table-column prop="associationRate" label="追加率" width="100" align="right">
            <template slot-scope="scope">{{ formatRate(scope.row.associationRate) }}</template>
          </el-table-column>
          <el-table-column prop="archiveRate" label="归档率" width="100" align="right">
            <template slot-scope="scope">{{ formatRate(scope.row.archiveRate) }}</template>
          </el-table-column>
          <el-table-column prop="score" label="综合得分" width="100" align="right">
            <template slot-scope="scope">{{ formatScore(scope.row.score) }}</template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > pageSize"
          :total="total"
          :page.sync="currentPage"
          :limit.sync="pageSize"
          :page-sizes="[5, 10, 20]"
          @pagination="handlePagination"
        />
      </template>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '@/components/statistics/mixins/resize'
import ChartEmpty from '@/components/statistics/ChartEmpty'
import Pagination from '@/components/Pagination'
import { addThousandSeparator, truncateText } from '@/utils/dashboard'

const BAR_COLOR = '#64B5F6'

export default {
  name: 'OrgRankingTable',
  components: { ChartEmpty, Pagination },
  mixins: [resize],
  props: {
    /**
     * 排名数据：{ items: [{ orgId, orgName, mediaCount, associationRate, archiveRate, score }] }
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
      chart: null,
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    items() {
      return (this.data && this.data.items) || []
    },
    total() {
      return this.items.length
    },
    isEmpty() {
      return !this.loading && !this.error && this.items.length === 0
    },
    /**
     * 当前分页显示的表格数据
     */
    tableData() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.items.slice(start, start + this.pageSize)
    },
    /**
     * 柱状图显示前 10 名
     */
    topItems() {
      return this.items.slice(0, 10)
    },
    ariaLabel() {
      return '部门排名横向柱状图，展示综合得分前 10 名的部门'
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.currentPage = 1
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
      this.chart.on('click', (params) => {
        if (!params || params.componentType !== 'series') return
        const item = this.topItems[this.topItems.length - 1 - params.dataIndex]
        if (!item) return
        this.$emit('filter-click', {
          dimension: 'org',
          value: item.orgId,
          label: item.orgName,
          source: 'OrgRankingTable'
        })
        // TODO(Phase 2): StatsEventBus.$emit('filter-change', payload)
      })
    },
    updateChart() {
      if (this.isEmpty || this.error || this.loading) return
      this.initChart()
      if (!this.chart) return

      const top = this.topItems
      // 横向柱状图：按采集量从大到小排列，最大的在顶部
      const sorted = [...top].sort((a, b) => {
        const va = a.mediaCount || 0
        const vb = b.mediaCount || 0
        return va - vb // 升序：最小的在前（y轴底部），最大的在后（y轴顶部）
      })
      const fullNames = sorted.map(d => d.orgName || '')
      const names = fullNames
      const values = sorted.map(d => Number(d.mediaCount || 0))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter(params) {
            const p = params[0]
            const fullName = fullNames[p.dataIndex] || p.name
            return fullName + '<br/>采集量：<b>' + addThousandSeparator(p.value) + '</b>'
          }
        },
        grid: {
          left: 200,
          right: 60,
          top: 10,
          bottom: 10
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          data: names,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { fontSize: 12, color: '#616161' }
        },
        series: [{
          type: 'bar',
          data: values.map(v => ({
            value: v,
            itemStyle: {
              color: BAR_COLOR,
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barMaxWidth: 18,
          label: {
            show: true,
            position: 'right',
            formatter(p) { return addThousandSeparator(p.value) },
            fontSize: 12,
            color: '#616161'
          }
        }]
      }

      this.chart.setOption(option, true)
      this.chart.resize()
    },
    handleViewAll() {
      this.$emit('view-all', { source: 'OrgRankingTable' })
    },
    handlePagination({ page, limit }) {
      this.currentPage = page
      this.pageSize = limit
    },
    formatNumber(v) {
      if (v === null || v === undefined) return '-'
      return addThousandSeparator(v)
    },
    formatRate(v) {
      if (v === null || v === undefined) return '-'
      return (Number(v) * 100).toFixed(1) + '%'
    },
    formatScore(v) {
      if (v === null || v === undefined) return '-'
      return Number(v).toFixed(1)
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
  transition: box-shadow $transition-normal;

  &:hover {
    box-shadow: $shadow-lg;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  height: 280px;
  margin-bottom: 16px;
}

</style>
