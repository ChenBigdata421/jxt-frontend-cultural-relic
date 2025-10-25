<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
      <el-form-item label="工作流ID" prop="workflowId">
        <el-input
          v-model="queryParams.workflowId"
          placeholder="请输入工作流ID"
          clearable
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option label="运行中" value="running" />
          <el-option label="已完成" value="completed" />
          <el-option label="失败" value="failed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="instanceList" border>
      <el-table-column label="实例ID" align="center" prop="id" width="280" />
      <el-table-column label="工作流ID" align="center" prop="workflow_id" width="280" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'running'" type="primary">运行中</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === 'failed'" type="danger">失败</el-tag>
          <el-tag v-else-if="scope.row.status === 'cancelled'" type="warning">已取消</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="started_at" width="180" />
      <el-table-column label="完成时间" align="center" prop="completed_at" width="180" />
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleDetail(scope.row)"
          >详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 实例详情抽屉 -->
    <el-drawer
      title="工作流实例详情"
      :visible.sync="detailDrawerVisible"
      direction="rtl"
      size="60%"
      :before-close="handleDrawerClose"
    >
      <div v-loading="detailLoading" class="drawer-content">
        <div class="workflow-detail-container">
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
                <span :class="['status', 'status-' + instanceData.status]">
                  {{ getStatusText(instanceData.status) }}
                </span>
              </div>
              <div class="meta-item">
                <label>创建时间:</label>
                <span>{{ instanceData.created_at }}</span>
              </div>
            </div>
          </div>

          <!-- 活动执行时间线 -->
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
                    <span v-if="activity.completed_at">
                      {{ activity.status === 'completed' ? '完成' : '失败' }}: {{ activity.completed_at }}
                    </span>
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
            <el-button type="primary" icon="el-icon-refresh" @click="refreshDetail">刷新状态</el-button>
            <el-button
              v-if="instanceData.status === 'running'"
              type="danger"
              icon="el-icon-close"
              @click="handleCancel"
            >取消工作流</el-button>
          </div>

          <!-- 最后更新时间 -->
          <div class="last-updated">
            最后更新: <span>{{ instanceData.updated_at }}</span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 启动实例对话框 -->
    <el-dialog title="启动工作流实例" :visible.sync="startOpen" width="600px" append-to-body>
      <el-form ref="startForm" :model="startForm" :rules="startRules" label-width="100px">
        <el-form-item label="输入数据" prop="input">
          <el-input
            v-model="startForm.input"
            type="textarea"
            :rows="10"
            placeholder="请输入输入数据(JSON格式)"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitStart">确 定</el-button>
        <el-button @click="cancelStart">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAllInstances, getInstance, startInstance, getInstanceTaskHistory, getInstanceTasks } from '@/api/process/instance'
import { getWorkflow } from '@/api/process/workflow'

export default {
  name: 'WorkflowInstance',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 详情加载
      detailLoading: false,
      // 总条数
      total: 0,
      // 实例表格数据
      instanceList: [],
      // 是否显示详情抽屉
      detailDrawerVisible: false,
      // 是否显示启动对话框
      startOpen: false,
      // 工作流ID
      workflowId: undefined,
      // 工作流名称
      workflowName: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        workflowId: undefined,
        status: undefined
      },
      // 实例详情数据
      instanceData: {},
      // 活动列表
      activities: [],
      // 当前查看的实例ID
      currentInstanceId: null,
      // 自动刷新定时器
      refreshTimer: null,
      // 启动表单参数
      startForm: {},
      // 启动表单校验
      startRules: {
        input: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
                return
              }
              try {
                JSON.parse(value)
                callback()
              } catch (e) {
                callback(new Error('输入数据必须是有效的JSON格式'))
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    // 从路由参数获取工作流ID（可选）
    this.workflowId = this.$route.query.workflowId
    this.workflowName = this.$route.query.workflowName
    if (this.workflowId) {
      this.queryParams.workflowId = this.workflowId
    }
    this.getList()
  },
  beforeDestroy() {
    // 清除定时器
    this.stopAutoRefresh()
  },
  methods: {
    /** 查询实例列表 */
    getList() {
      this.loading = true
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
        workflow_id: this.queryParams.workflowId,
        status: this.queryParams.status
      }
      listAllInstances(params).then(response => {
        if (response.code === 200) {
          this.instanceList = response.data.items || []
          this.total = response.data.total || 0
        } else {
          this.msgError(response.msg || '查询失败')
        }
        this.loading = false
      }).catch(error => {
        this.msgError('查询失败：' + error.message)
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 详情按钮操作 */
    handleDetail(row) {
      // 先清空之前的数据
      this.instanceData = {}
      this.activities = []
      this.stopAutoRefresh()

      // 设置当前实例ID
      this.currentInstanceId = row.id

      // 打开抽屉
      this.detailDrawerVisible = true

      // 加载新的实例详情
      this.getInstanceDetail(row.id)
    },
    /** 获取实例详情 */
    getInstanceDetail(instanceId) {
      console.log('正在加载实例详情，实例ID:', instanceId)
      this.detailLoading = true

      // 用于存储工作流定义和任务历史
      let workflowDefinition = null
      let taskHistory = []

      // 先获取实例详情
      getInstance(instanceId).then(instanceResponse => {
        console.log('实例详情响应:', instanceResponse)

        if (instanceResponse.code === 200) {
          this.instanceData = instanceResponse.data
          console.log('已设置实例数据:', this.instanceData)

          // 获取工作流定义以提取活动列表
          if (this.instanceData.workflow_id) {
            return getWorkflow(this.instanceData.workflow_id)
          } else {
            throw new Error('实例缺少工作流ID')
          }
        } else {
          throw new Error(instanceResponse.msg || '获取实例详情失败')
        }
      }).then(workflowResponse => {
        console.log('工作流定义响应:', workflowResponse)

        if (workflowResponse.code === 200 && workflowResponse.data.definition) {
          workflowDefinition = workflowResponse.data.definition
          console.log('已获取工作流定义')
        } else {
          console.log('无法获取工作流定义')
        }

        // 获取实例的所有任务（包含当前状态）
        return getInstanceTasks(instanceId, { limit: 1000, offset: 0 })
      }).then(tasksResponse => {
        console.log('实例任务响应:', tasksResponse)

        if (tasksResponse.code === 200 && tasksResponse.data) {
          taskHistory = tasksResponse.data.items || tasksResponse.data || []
          console.log('已获取实例任务，共', taskHistory.length, '条记录')
        } else {
          console.log('无法获取实例任务')
        }

        // 从工作流定义中提取活动列表，并结合任务历史设置状态
        if (workflowDefinition) {
          this.activities = this.extractActivitiesFromDefinition(workflowDefinition, taskHistory)
          console.log('从工作流定义提取的活动列表:', this.activities)
        } else {
          this.activities = []
          console.log('无法获取工作流定义，显示空活动列表')
        }

        // 如果实例正在运行，启动自动刷新
        if (this.instanceData.status === 'running') {
          this.startAutoRefresh(instanceId)
        }

        this.detailLoading = false
      }).catch(error => {
        console.error('获取详情失败:', error)
        this.msgError('获取详情失败：' + error.message)
        this.detailLoading = false
      })
    },
    /** 从工作流定义中提取活动列表 */
    extractActivitiesFromDefinition(definition, taskHistory = []) {
      try {
        // 解析工作流定义
        const def = typeof definition === 'string' ? JSON.parse(definition) : definition
        console.log('解析的工作流定义:', def)
        console.log('任务历史记录数:', taskHistory.length)

        // 创建任务历史映射表（按 task_key 分组）
        const taskHistoryMap = {}
        taskHistory.forEach(task => {
          if (task.task_key) {
            if (!taskHistoryMap[task.task_key]) {
              taskHistoryMap[task.task_key] = []
            }
            taskHistoryMap[task.task_key].push(task)
          }
        })
        console.log('任务历史映射表:', taskHistoryMap)

        // 检查是否有steps字段（新格式）
        if (def.steps && Array.isArray(def.steps)) {
          console.log('从steps字段提取活动，共', def.steps.length, '个步骤')
          return def.steps.map((step, index) => {
            const stepId = step.id || step.key || `step_${index}`
            const stepTasks = taskHistoryMap[stepId] || []

            console.log(`步骤 ${index}: ${step.name}`)
            console.log(`  - stepId: ${stepId}`)
            console.log(`  - 找到的任务数: ${stepTasks.length}`)
            if (stepTasks.length > 0) {
              console.log(`  - 任务状态:`, stepTasks.map(t => t.status))
            }

            // 根据任务历史确定步骤状态
            const activityStatus = this.getActivityStatusFromHistory(stepTasks, step, index, def.steps.length)
            console.log(`  - 活动状态: ${activityStatus.status}`)

            // 获取最新的任务记录
            const latestTask = stepTasks.length > 0 ? stepTasks[stepTasks.length - 1] : null

            return {
              name: step.name || `步骤 ${index + 1}`,
              status: activityStatus.status,
              scheduled_at: latestTask?.created_at || this.instanceData.started_at || this.instanceData.created_at,
              completed_at: activityStatus.completed_at,
              error_message: activityStatus.error_message
            }
          })
        }

        // 检查是否有activities字段（旧格式）
        if (def.activities && Array.isArray(def.activities)) {
          console.log('从activities字段提取活动，共', def.activities.length, '个活动')
          return def.activities.map((activity, index) => {
            const activityId = activity.id || activity.key || `activity_${index}`
            const activityTasks = taskHistoryMap[activityId] || []

            // 根据任务历史确定活动状态
            const activityStatus = this.getActivityStatusFromHistory(activityTasks, activity, index, def.activities.length)

            // 获取最新的任务记录
            const latestTask = activityTasks.length > 0 ? activityTasks[activityTasks.length - 1] : null

            return {
              name: activity.name || `活动 ${index + 1}`,
              status: activityStatus.status,
              scheduled_at: latestTask?.created_at || this.instanceData.started_at || this.instanceData.created_at,
              completed_at: activityStatus.completed_at,
              error_message: activityStatus.error_message
            }
          })
        }

        // 如果没有steps或activities字段，返回空数组
        console.log('工作流定义中没有steps或activities字段')
        return []
      } catch (error) {
        console.error('解析工作流定义失败:', error)
        return []
      }
    },
    /** 根据任务历史获取活动状态 */
    getActivityStatusFromHistory(stepTasks, step, index, totalSteps) {
      console.log(`getActivityStatusFromHistory 被调用: 步骤${index}, 任务数${stepTasks.length}`)

      // 如果该步骤有任务记录
      if (stepTasks && stepTasks.length > 0) {
        // 获取最新的任务
        const latestTask = stepTasks[stepTasks.length - 1]
        console.log(`  最新任务状态: ${latestTask.status}`)

        // 根据任务状态确定活动状态
        if (latestTask.status === 'completed') {
          console.log(`  返回: completed`)
          return {
            status: 'completed',
            completed_at: latestTask.completed_at,
            error_message: null
          }
        } else if (latestTask.status === 'rejected') {
          console.log(`  返回: failed`)
          return {
            status: 'failed',
            completed_at: latestTask.completed_at,
            error_message: latestTask.comment || '任务被驳回'
          }
        } else if (latestTask.status === 'pending' || latestTask.status === 'claimed') {
          console.log(`  返回: running`)
          return {
            status: 'running',
            completed_at: null,
            error_message: null
          }
        } else {
          console.log(`  返回: pending (未知状态: ${latestTask.status})`)
          return {
            status: 'pending',
            completed_at: null,
            error_message: null
          }
        }
      }

      // 如果没有任务记录，根据实例状态和步骤位置推断
      console.log(`  没有任务记录，实例状态: ${this.instanceData.status}`)
      if (this.instanceData.status === 'completed') {
        console.log(`  返回: completed (实例已完成)`)
        return {
          status: 'completed',
          completed_at: this.instanceData.completed_at,
          error_message: null
        }
      } else if (this.instanceData.status === 'failed') {
        // 假设失败发生在最后一个活动
        const isFailed = index === totalSteps - 1
        console.log(`  返回: ${isFailed ? 'failed' : 'completed'} (实例失败)`)
        return {
          status: isFailed ? 'failed' : 'completed',
          completed_at: isFailed ? this.instanceData.completed_at : null,
          error_message: isFailed ? this.instanceData.error_message : null
        }
      } else if (this.instanceData.status === 'running') {
        // 没有任务记录的步骤都是等待中
        console.log(`  返回: pending (实例运行中，但无任务记录)`)
        return {
          status: 'pending',
          completed_at: null,
          error_message: null
        }
      } else {
        console.log(`  返回: pending (默认)`)
        return {
          status: 'pending',
          completed_at: null,
          error_message: null
        }
      }
    },
    /** 获取活动状态（已废弃，保留用于兼容） */
    getActivityStatus(activity, index, totalSteps) {
      // 根据实例状态推断活动状态
      if (this.instanceData.status === 'completed') {
        return 'completed'
      } else if (this.instanceData.status === 'failed') {
        // 假设失败发生在最后一个活动
        return index === totalSteps - 1 ? 'failed' : 'completed'
      } else if (this.instanceData.status === 'running') {
        // 假设正在执行第一个活动
        return index === 0 ? 'running' : 'pending'
      } else {
        return 'pending'
      }
    },
    /** 刷新详情 */
    refreshDetail() {
      if (this.currentInstanceId) {
        this.getInstanceDetail(this.currentInstanceId)
      }
    },
    /** 启动自动刷新 */
    startAutoRefresh(instanceId) {
      this.stopAutoRefresh()
      this.refreshTimer = setInterval(() => {
        if (this.instanceData.status === 'running') {
          this.getInstanceDetail(instanceId)
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
    /** 关闭抽屉 */
    handleDrawerClose() {
      this.stopAutoRefresh()
      this.detailDrawerVisible = false
      this.currentInstanceId = null
      this.instanceData = {}
      this.activities = []
    },
    /** 取消工作流 */
    handleCancel() {
      this.$confirm('确定要取消该工作流实例吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // TODO: 调用取消工作流API
        this.msgSuccess('取消成功')
        this.refreshDetail()
      }).catch(() => {})
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
    },
    /** 启动实例按钮操作 */
    handleStart() {
      this.startForm = {
        input: ''
      }
      this.startOpen = true
    },
    /** 取消启动 */
    cancelStart() {
      this.startOpen = false
      this.resetForm('startForm')
    },
    /** 提交启动 */
    submitStart() {
      this.$refs['startForm'].validate(valid => {
        if (valid) {
          const data = {
            workflow_id: this.workflowId,
            input: this.startForm.input || ''
          }
          startInstance(data).then(response => {
            if (response.code === 200) {
              this.msgSuccess('启动成功')
              this.startOpen = false
              this.getList()
            } else {
              this.msgError(response.msg || '启动失败')
            }
          }).catch(error => {
            this.msgError('启动失败：' + error.message)
          })
        }
      })
    },
    /** 返回按钮操作 */
    handleBack() {
      this.$router.push('/processmanage/workflow')
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.drawer-content {
  padding: 20px;
}

/* 工作流详情样式 */
.workflow-detail-container {
  max-width: 100%;
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
}

.workflow-header h2 {
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 24px;
}

.workflow-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-item label {
  font-weight: 500;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.meta-item span {
  font-size: 16px;
  font-weight: 500;
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
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #3498db;
  margin-right: 10px;
  border-radius: 2px;
}

.timeline {
  position: relative;
  margin: 24px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
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
}

.timeline-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
}

.activity-time span {
  display: inline-block;
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
