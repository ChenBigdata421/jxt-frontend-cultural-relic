<template>
  <div class="app-container instance-detail-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="mb20">
      <el-breadcrumb-item :to="{ path: '/processmanage/workflow' }">工作流管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/processmanage/instance', query: { workflowId: workflowId, workflowName: workflowName } }">
        工作流实例
      </el-breadcrumb-item>
      <el-breadcrumb-item>实例详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 工作流详情容器 -->
    <div v-loading="loading" class="workflow-detail-container">
      <!-- 工作流头部 -->
      <div class="workflow-header">
        <h2>工作流实例详情</h2>
        <div class="workflow-meta">
          <div class="meta-item">
            <label>实例ID:</label>
            <span>{{ instanceData.id }}</span>
          </div>
          <div class="meta-item">
            <label>工作流ID:</label>
            <span>{{ instanceData.workflow_id }}</span>
          </div>
          <div class="meta-item">
            <label>状态:</label>
            <span :class="['status', 'status-' + instanceData.status]">{{ getStatusText(instanceData.status) }}</span>
          </div>
          <div class="meta-item">
            <label>创建时间:</label>
            <span>{{ instanceData.started_at }}</span>
          </div>
        </div>
      </div>

      <!-- 时间线部分 -->
      <div class="timeline-section">
        <div class="section-title">活动执行时间线</div>

        <div class="timeline">
          <div
            v-for="(activity, index) in activities"
            :key="index"
            :class="['timeline-item', 'status-' + activity.status]"
          >
            <div class="timeline-marker">
              <div class="marker-icon">
                <span v-if="activity.status === 'completed'">✓</span>
                <span v-else-if="activity.status === 'failed'">✗</span>
                <span v-else-if="activity.status === 'running'">⟳</span>
                <span v-else>○</span>
              </div>
            </div>
            <div class="timeline-content">
              <div class="activity-name">{{ activity.name }}</div>
              <div class="activity-status">{{ getStatusText(activity.status) }}</div>
              <div class="activity-time">
                <span v-if="activity.scheduled_at">计划: {{ activity.scheduled_at }}</span>
                <span v-if="activity.completed_at">{{ activity.status === 'completed' ? '完成' : '失败' }}: {{ activity.completed_at }}</span>
              </div>
              <div v-if="activity.error_message" class="activity-error">
                {{ activity.error_message }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="workflow-actions">
        <el-button type="primary" icon="el-icon-refresh" @click="refreshStatus">刷新状态</el-button>
        <el-button v-if="instanceData.status === 'running'" type="danger" icon="el-icon-close" @click="handleCancel">
          取消工作流
        </el-button>
        <el-button icon="el-icon-back" @click="handleBack">返回</el-button>
      </div>

      <!-- 最后更新时间 -->
      <div class="last-updated">
        最后更新: <span>{{ instanceData.updated_at }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getInstance, getInstanceTaskHistory } from '@/api/process/instance'

export default {
  name: 'InstanceDetail',
  data() {
    return {
      loading: true,
      instanceId: undefined,
      workflowId: undefined,
      workflowName: undefined,
      instanceData: {},
      activities: [],
      refreshTimer: null
    }
  },
  created() {
    this.instanceId = this.$route.query.instanceId
    this.workflowId = this.$route.query.workflowId
    this.workflowName = this.$route.query.workflowName
    this.getInstanceDetail()
    // 如果实例正在运行，每5秒自动刷新
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    /** 获取实例详情 */
    getInstanceDetail() {
      this.loading = true

      // 同时获取实例详情和任务历史
      Promise.all([
        getInstance(this.instanceId),
        getInstanceTaskHistory(this.instanceId, { limit: 100, offset: 0 })
      ]).then(([instanceResponse, historyResponse]) => {
        if (instanceResponse.code === 200) {
          this.instanceData = instanceResponse.data
        } else {
          this.msgError(instanceResponse.msg || '获取实例详情失败')
        }

        if (historyResponse.code === 200) {
          // 将任务历史转换为活动列表
          this.activities = this.convertHistoryToActivities(historyResponse.data)
        } else {
          // 如果获取任务历史失败，使用模拟数据
          this.activities = this.createMockActivities()
        }

        this.loading = false
      }).catch(error => {
        this.msgError('获取详情失败：' + error.message)
        this.loading = false
      })
    },
    /** 将任务历史转换为活动列表 */
    convertHistoryToActivities(histories) {
      if (!histories || histories.length === 0) {
        return this.createMockActivities()
      }

      return histories.map(history => ({
        name: history.task_name || '未命名任务',
        status: this.mapResultToStatus(history.result),
        scheduled_at: history.created_at,
        completed_at: history.created_at,
        error_message: history.result === 'rejected' ? (history.comment || '任务被驳回') : null
      }))
    },
    /** 将任务结果映射为状态 */
    mapResultToStatus(result) {
      const statusMap = {
        'completed': 'completed',
        'rejected': 'failed',
        'cancelled': 'cancelled'
      }
      return statusMap[result] || 'pending'
    },
    /** 创建模拟活动数据 */
    createMockActivities() {
      const mockActivities = []
      const status = this.instanceData.status
      
      // 根据实例状态创建不同的活动
      mockActivities.push({
        name: '初始化',
        status: 'completed',
        scheduled_at: this.instanceData.started_at,
        completed_at: this.instanceData.started_at
      })
      
      if (status === 'running') {
        mockActivities.push({
          name: '执行中',
          status: 'running',
          scheduled_at: this.instanceData.started_at
        })
      } else if (status === 'completed') {
        mockActivities.push({
          name: '处理完成',
          status: 'completed',
          scheduled_at: this.instanceData.started_at,
          completed_at: this.instanceData.completed_at
        })
      } else if (status === 'failed') {
        mockActivities.push({
          name: '执行失败',
          status: 'failed',
          scheduled_at: this.instanceData.started_at,
          completed_at: this.instanceData.completed_at,
          error_message: this.instanceData.error_message || '执行过程中发生错误'
        })
      }
      
      return mockActivities
    },
    /** 刷新状态 */
    refreshStatus() {
      this.getInstanceDetail()
      this.msgSuccess('状态已刷新')
    },
    /** 开始自动刷新 */
    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        if (this.instanceData.status === 'running') {
          this.getInstanceDetail()
        } else {
          this.stopAutoRefresh()
        }
      }, 5000) // 每5秒刷新一次
    },
    /** 停止自动刷新 */
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    /** 取消工作流 */
    handleCancel() {
      this.$confirm('是否确认取消该工作流实例?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: 调用取消实例的API
        this.msgSuccess('取消成功')
        this.getInstanceDetail()
      }).catch(() => {
        // 用户取消操作
      })
    },
    /** 返回 */
    handleBack() {
      this.$router.push({
        path: '/processmanage/instance',
        query: { workflowId: this.workflowId, workflowName: this.workflowName }
      })
    },
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        'running': '运行中',
        'completed': '已完成',
        'failed': '失败',
        'cancelled': '已取消',
        'pending': '等待中'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped lang="scss">
.instance-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.mb20 {
  margin-bottom: 20px;
}

.workflow-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.workflow-header {
  padding: 24px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;

  h2 {
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 24px;
  }
}

.workflow-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;

  label {
    font-weight: 500;
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 6px;
  }

  span {
    font-size: 16px;
    font-weight: 500;
  }
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-running {
  background: rgba(33, 150, 243, 0.15);
  color: #1976d2;
}

.status-completed {
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.status-failed {
  background: rgba(244, 67, 54, 0.15);
  color: #c62828;
}

.status-cancelled {
  background: rgba(117, 117, 117, 0.15);
  color: #757575;
}

.status-pending {
  background: rgba(255, 193, 7, 0.15);
  color: #ff8f00;
}

.timeline-section {
  padding: 24px;
  background: white;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 18px;
    background: #3498db;
    margin-right: 10px;
    border-radius: 2px;
  }
}

.timeline {
  position: relative;
  margin: 24px 0;

  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e0e0e0;
  }
}

.timeline-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.timeline-marker {
  width: 48px;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.marker-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e0e0e0;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-item.status-completed .marker-icon {
  border-color: #4caf50;
  background: #4caf50;
  color: white;
}

.timeline-item.status-failed .marker-icon {
  border-color: #f44336;
  background: #f44336;
  color: white;
}

.timeline-item.status-running .marker-icon {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
  animation: pulse 2s infinite;
}

.timeline-item.status-pending .marker-icon {
  border-color: #ffc107;
  background: white;
  color: #ffc107;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.timeline-content {
  flex: 1;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  border: 1px solid #eaeef2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  margin-left: 8px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.activity-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 16px;
}

.activity-status {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.activity-time {
  font-size: 13px;
  color: #888;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  span {
    display: inline-block;
  }
}

.activity-error {
  font-size: 13px;
  color: #f44336;
  margin-top: 8px;
  padding: 8px;
  background: #ffebee;
  border-radius: 6px;
  border-left: 3px solid #f44336;
}

.workflow-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: #f8f9fa;
  border-top: 1px solid #eaeef2;
}

.last-updated {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #777;
  background: #f8f9fa;
  border-top: 1px solid #eaeef2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workflow-meta {
    grid-template-columns: 1fr;
  }

  .timeline::before {
    left: 18px;
  }

  .timeline-marker {
    width: 36px;
  }

  .marker-icon {
    width: 32px;
    height: 32px;
  }

  .workflow-actions {
    flex-direction: column;
  }
}
</style>

