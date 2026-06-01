<template>
  <div class="stats-dashboard-container">
    <!-- 页面头部：标题 + 视图切换 + 时间范围 + 刷新 -->
    <div class="stats-dashboard__header">
      <div class="stats-dashboard__header-left">
        <h2 class="stats-dashboard__title">统计分析</h2>
        <span v-if="meta.dataAsOf" class="stats-dashboard__as-of">
          数据截至 {{ parseTime(meta.dataAsOf) }}
        </span>
      </div>
      <div class="stats-dashboard__header-right">
        <view-switch
          v-model="view"
          :available-views="availableViews"
          @change="handleViewChange"
        />
        <el-select
          v-model="days"
          size="small"
          style="width: 110px;"
          @change="handleRefresh"
        >
          <el-option label="近 7 天" :value="7" />
          <el-option label="近 30 天" :value="30" />
          <el-option label="近 90 天" :value="90" />
        </el-select>
        <el-button
          :loading="refreshing"
          icon="el-icon-refresh"
          size="small"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- partial 错误提示 -->
    <el-alert
      v-if="meta.partial && errorLabels.length"
      type="warning"
      :closable="false"
      class="stats-dashboard__alert"
      show-icon
    >
      <template slot="title">
        部分数据加载失败：{{ errorLabels.join('、') }}
      </template>
    </el-alert>

    <!-- ========== Admin 视图 ========== -->
    <template v-if="view === 'admin'">
      <!-- 汇总卡片 -->
      <summary-cards :data="dashboardData.summary" :loading="dashLoading && !dashboardData.summary" />

      <!-- 第一行：趋势 + 媒体类型分布 -->
      <el-row type="flex" :gutter="12" class="stats-dashboard__section">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <div class="stats-dashboard__card">
            <el-tabs v-model="trendTab" class="stats-dashboard__tabs">
              <el-tab-pane label="媒体日采集量趋势" name="stats">
                <stats-trend-chart
                  :data="dashboardData.trend"
                  :loading="dashLoading && !dashboardData.trend"
                  :error="!!errorMap.trend"
                  @retry="fetchDashboard"
                />
              </el-tab-pane>
              <el-tab-pane label="媒体分类日采集量趋势" name="daily">
                <trend-chart
                  ref="overviewTrendChart"
                  :data="dashboardData.overviewTrend"
                  :loading="dashLoading && !dashboardData.overviewTrend"
                  :error="!!errorMap.overviewTrend"
                  @retry="fetchDashboard"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <media-distribution-chart
            :data="dashboardData.mediaTypeDistribution"
            :loading="dashLoading && !dashboardData.mediaTypeDistribution"
            :error="!!errorMap.mediaTypeDistribution"
            @retry="fetchDashboard"
          />
        </el-col>
      </el-row>

      <!-- 第二行：存储统计 + 媒体覆盖统计 -->
      <el-row type="flex" :gutter="12" class="stats-dashboard__section">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <storage-stats-chart
            :data="dashboardData.storageStats"
            :loading="dashLoading && !dashboardData.storageStats"
            :error="!!errorMap.storageStats"
            @retry="fetchDashboard"
          />
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <media-coverage-stats
            :data="dashboardData.mediaCoverageStats"
            :loading="dashLoading && !dashboardData.mediaCoverageStats"
            :error="!!errorMap.mediaCoverageStats"
            @retry="fetchDashboard"
          />
        </el-col>
      </el-row>

      <!-- 第二行：部门排名 -->
      <div class="stats-dashboard__section">
        <org-ranking-table
          :data="dashboardData.orgRanking"
          :loading="dashLoading && !dashboardData.orgRanking"
          :error="!!errorMap.orgRanking"
          @retry="fetchDashboard"
        />
      </div>
    </template>

    <!-- ========== Officer 视图（Phase 1-B） ========== -->
    <template v-else-if="view === 'officer'">
      <div class="stats-dashboard__placeholder">
        <p>Officer 视图（Phase 1-B 实现）</p>
      </div>
    </template>

    <!-- ========== Auditor 视图（Phase 1-B） ========== -->
    <template v-else-if="view === 'auditor'">
      <div class="stats-dashboard__placeholder">
        <p>Auditor 视图（Phase 1-B 实现）</p>
      </div>
    </template>
  </div>
</template>

<script>
import { getStatisticsDashboard } from '@/api/evidence/statistics'
import ViewSwitch from './components/ViewSwitch'
import SummaryCards from '@/components/statistics/SummaryCards'
import StatsTrendChart from '@/components/statistics/StatsTrendChart'
import TrendChart from '@/components/statistics/TrendChart'
import MediaDistributionChart from '@/components/statistics/MediaDistributionChart'
import StorageStatsChart from '@/components/statistics/StorageStatsChart'
import MediaCoverageStats from '@/components/statistics/MediaCoverageStats'
import OrgRankingTable from './components/OrgRankingTable'

// Section key → 中文标签映射
const SECTION_LABELS = {
  summary: '汇总统计',
  heroMetrics: '汇总指标',
  trend: '业务趋势',
  overviewTrend: '分类采集趋势',
  mediaTypeDistribution: '媒体分布',
  storageStats: '存储统计',
  mediaCoverageStats: '媒体覆盖',
  orgRanking: '部门排名',
  officerStats: '执法人员统计',
  complianceOverview: '合规总览',
  alertSummary: '告警摘要'
}

export default {
  name: 'StatisticsDashboard',
  components: { ViewSwitch, SummaryCards, StatsTrendChart, TrendChart, MediaDistributionChart, StorageStatsChart, MediaCoverageStats, OrgRankingTable },
  data() {
    return {
      // 视图模式
      view: 'admin',
      days: 30,

      // 趋势标签页
      trendTab: 'stats',

      // 仪表盘数据（统一来自 getStatisticsDashboard）
      dashboardData: {
        summary: null,
        trend: null,
        overviewTrend: null,
        mediaTypeDistribution: null,
        storageStats: null,
        mediaCoverageStats: null,
        orgRanking: null,
        officerStats: null,
        complianceOverview: null,
        alertSummary: null
      },

      // 元信息
      meta: {
        dataAsOf: '',
        partial: false
      },

      // 状态
      dashLoading: false,
      refreshing: false,
      errors: []
    }
  },
  computed: {
    availableViews() {
      const roles = (this.$store && this.$store.state && this.$store.state.user && this.$store.state.user.roles) || []
      if (!roles.length) return ['admin', 'officer', 'auditor']
      return ['admin', 'officer', 'auditor']
    },
    defaultView() {
      return 'admin'
    },
    errorMap() {
      const map = {}
      this.errors.forEach(e => { map[e.section] = e })
      return map
    },
    errorLabels() {
      return this.errors.map(e => SECTION_LABELS[e.section] || e.section)
    }
  },
  created() {
    this.view = this.defaultView
    this.fetchDashboard()
  },
  watch: {
    trendTab(val) {
      if (val === 'daily') {
        this.$nextTick(() => {
          const comp = this.$refs.overviewTrendChart
          if (comp && comp.chart) comp.chart.resize()
        })
      }
    }
  },
  methods: {
    fetchDashboard() {
      this.dashLoading = true
      this.refreshing = true
      this.errors = []
      getStatisticsDashboard({ view: this.view, days: this.days })
        .then(response => {
          if (response.code === 200 && response.data) {
            const data = response.data
            // 逐 section 赋值
            Object.keys(this.dashboardData).forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                this.$set(this.dashboardData, key, data[key])
              }
            })
            // meta
            if (data.meta) {
              if (data.meta.dataAsOf) this.meta.dataAsOf = data.meta.dataAsOf
              if (data.meta.partial) this.meta.partial = true
            }
            // errors[]
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
              this.meta.partial = true
              this.errors = data.errors
            }
          } else {
            // 整体失败
            Object.keys(this.dashboardData).forEach(key => {
              this.errors.push({ section: key })
            })
            this.meta.partial = true
          }
        })
        .catch(() => {
          Object.keys(this.dashboardData).forEach(key => {
            this.errors.push({ section: key })
          })
          this.meta.partial = true
        })
        .finally(() => {
          this.dashLoading = false
          this.refreshing = false
        })
    },
    handleRefresh() {
      this.fetchDashboard()
    },
    handleViewChange() {
      Object.keys(this.dashboardData).forEach(key => {
        this.$set(this.dashboardData, key, null)
      })
      this.meta = { dataAsOf: '', partial: false }
      this.fetchDashboard()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.stats-dashboard-container {
  padding: 12px;
  background-color: $law-bg-page;
  position: relative;
  min-height: calc(100vh - 84px);
}

.stats-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;

  &-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.stats-dashboard__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.stats-dashboard__as-of {
  font-size: 13px;
  color: $law-gray-600;
}

.stats-dashboard__alert {
  margin-bottom: 12px;
}

.stats-dashboard__section {
  margin-bottom: 12px;
}

.stats-dashboard__card {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 0 20px;
}

.stats-dashboard__tabs {
  .el-tabs__header {
    margin-bottom: 0;
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item {
    font-size: 14px;
    font-weight: 500;
  }
}

.stats-dashboard__placeholder {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 32px;
  text-align: center;
  color: $law-gray-600;

  p {
    margin: 4px 0;
  }

  .hint {
    font-size: 12px;
    color: $law-gray-500;
  }
}

@media (max-width: 768px) {
  .stats-dashboard-container {
    padding: 8px;
  }
}
</style>
