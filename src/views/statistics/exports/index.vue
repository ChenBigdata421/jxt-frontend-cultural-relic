<template>
  <div class="stats-exports-container">
    <div class="stats-exports__header">
      <h2 class="stats-exports__title">导出中心</h2>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        :disabled="true"
        title="Phase 1-B 启用"
      >
        新建导出
      </el-button>
    </div>

    <div class="stats-exports__body">
      <export-history-table
        :data="tableData"
        :loading="loading"
        :total="total"
        :page.sync="queryParams.pageIndex"
        :limit.sync="queryParams.pageSize"
        :downloading-map="downloadingMap"
        @page-change="handlePageChange"
        @download="handleDownload"
        @retry="handleRetry"
      />
    </div>
  </div>
</template>

<script>
import {
  getExportHistory,
  getExportStatus,
  downloadExport
} from '@/api/evidence/statistics'
import ExportHistoryTable from './components/ExportHistoryTable'

export default {
  name: 'StatisticsExports',
  components: { ExportHistoryTable },
  data() {
    return {
      tableData: [],
      total: 0,
      loading: false,
      queryParams: {
        pageIndex: 1,
        pageSize: 20
      },
      downloadingMap: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getExportHistory(this.queryParams)
        .then(response => {
          if (response.code === 200 && response.data) {
            this.tableData = response.data.list || response.data.items || []
            this.total = response.data.total || response.data.count || 0
          } else {
            this.$message.error(response.msg || '加载失败')
          }
        })
        .catch(() => {
          this.$message.error('加载导出历史失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handlePageChange({ page, limit }) {
      this.queryParams.pageIndex = page
      this.queryParams.pageSize = limit
      this.getList()
    },
    async handleDownload(row) {
      if (!row || !row.id) return
      // 先校验状态
      this.$set(this.downloadingMap, row.id, true)
      try {
        const statusResp = await getExportStatus(row.id)
        if (statusResp.code !== 200 || !statusResp.data) {
          this.$message.error(statusResp.msg || '查询任务状态失败')
          return
        }
        if (statusResp.data.status !== 'completed') {
          this.$message.warning('任务未完成，无法下载')
          // 同步刷新行
          this.refreshRow(row.id, statusResp.data)
          return
        }
        const blob = await downloadExport(row.id)
        const filename = this.buildFilename(row, statusResp.data)
        this.downloadBlob(blob, filename)
      } catch (e) {
        this.$message.error('下载失败：' + (e.message || ''))
      } finally {
        this.$set(this.downloadingMap, row.id, false)
      }
    },
    handleRetry(row) {
      this.$confirm('是否重试该导出任务？', '确认重试', {
        confirmButtonText: '重试',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.info('重试功能将在 Phase 1-B 完整接入异步导出后启用')
      }).catch(() => {})
    },
    refreshRow(id, partial) {
      const idx = this.tableData.findIndex(r => r.id === id)
      if (idx >= 0) {
        this.$set(this.tableData, idx, { ...this.tableData[idx], ...partial })
      }
    },
    buildFilename(row, status) {
      const ext = row.format || (status && status.format) || 'xlsx'
      const base = row.reportType || 'export'
      const ts = row.createdAt ? String(row.createdAt).replace(/[^0-9]/g, '').slice(0, 14) : Date.now()
      return `${base}-${ts}.${ext}`
    },
    downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.stats-exports-container {
  padding: 12px;
  background-color: $law-bg-page;
  min-height: calc(100vh - 84px);
}

.stats-exports__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  margin-bottom: 12px;
}

.stats-exports__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: $law-gray-900;
}

.stats-exports__body {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 12px;
}
</style>
