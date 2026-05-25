<template>
  <div class="export-history-table">
    <el-table
      v-loading="loading"
      :data="data"
      border
      size="small"
      empty-text="暂无导出记录"
    >
      <el-table-column label="任务ID" width="180" prop="id">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.id || ''" placement="top" :disabled="!scope.row.id">
            <span class="task-id">{{ truncateId(scope.row.id) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="报表类型" width="140">
        <template slot-scope="scope">{{ reportTypeLabel(scope.row.reportType) }}</template>
      </el-table-column>
      <el-table-column label="格式" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.format === 'pdf' ? 'primary' : 'success'" size="mini">
            {{ String(scope.row.format || '').toUpperCase() }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数据量" width="110" align="right">
        <template slot-scope="scope">
          {{ scope.row.rowCount != null ? scope.row.rowCount + ' 行' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)" size="mini">
            <i :class="statusIcon(scope.row.status)" />
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">{{ parseTime(scope.row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="完成时间" width="160" align="center">
        <template slot-scope="scope">{{ parseTime(scope.row.completedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 'completed'"
            type="text"
            size="small"
            icon="el-icon-download"
            :loading="downloadingMap[scope.row.id]"
            @click="$emit('download', scope.row)"
          >
            下载
          </el-button>
          <el-button
            v-else-if="scope.row.status === 'failed'"
            type="text"
            size="small"
            icon="el-icon-refresh"
            @click="$emit('retry', scope.row)"
          >
            重试
          </el-button>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

const REPORT_TYPE_LABELS = {
  media_statistics: '媒体采集统计',
  association_analysis: '关联分析',
  officer_performance: '人员绩效',
  org_ranking: '部门排名',
  archive_lifecycle: '归档生命周期',
  storage_analysis: '存储分析'
}

const STATUS_META = {
  pending: { type: 'info', icon: 'el-icon-time', text: '等待中' },
  processing: { type: 'warning', icon: 'el-icon-loading', text: '处理中' },
  completed: { type: 'success', icon: 'el-icon-check', text: '已完成' },
  failed: { type: 'danger', icon: 'el-icon-close', text: '失败' }
}

export default {
  name: 'ExportHistoryTable',
  components: { Pagination },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    downloadingMap: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    currentPage: {
      get() { return this.page },
      set(val) { this.$emit('update:page', val) }
    },
    pageSize: {
      get() { return this.limit },
      set(val) { this.$emit('update:limit', val) }
    }
  },
  methods: {
    truncateId(id) {
      if (!id) return '-'
      const s = String(id)
      return s.length > 12 ? s.slice(0, 8) + '...' : s
    },
    reportTypeLabel(code) {
      return REPORT_TYPE_LABELS[code] || code || '-'
    },
    statusType(status) { return (STATUS_META[status] || {}).type || 'info' },
    statusIcon(status) { return (STATUS_META[status] || {}).icon || '' },
    statusText(status) { return (STATUS_META[status] || {}).text || status || '-' },
    handlePagination(p) {
      this.$emit('page-change', p)
    }
  }
}
</script>

<style lang="scss" scoped>
.export-history-table {
  background: #fff;
  border-radius: 8px;
}

.task-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #607D8B;
}

.text-muted {
  color: #909399;
}
</style>
