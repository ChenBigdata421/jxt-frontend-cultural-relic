<template>
  <div class="dashboard-editor-container">
    <!-- 页面头部 -->
    <dashboard-header
      v-if="!isPlatform"
      :data-as-of="meta.dataAsOf"
      :partial="meta.partial"
      :errors="errorLabels"
      :loading="refreshing"
      @refresh="handleRefresh"
    />

    <!-- 骨架屏：首次加载 -->
    <template v-if="!isPlatform && dashLoading && !overview.summary">
      <el-row :gutter="12" class="dashboard-section">
        <el-col v-for="i in 4" :key="'sk-card-'+i" :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="skeleton skeleton--card">
            <div class="skeleton__line skeleton__line--title" />
            <div class="skeleton__line skeleton__line--value" />
            <div class="skeleton__line skeleton__line--short" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="12" class="dashboard-section">
        <el-col :sm="12" :xs="24">
          <div class="skeleton skeleton--chart" />
        </el-col>
        <el-col :sm="12" :xs="24">
          <div class="skeleton skeleton--chart" />
        </el-col>
      </el-row>
      <div class="skeleton skeleton--chart skeleton--chart--tall" />
    </template>

    <!-- 数据区 -->
    <template v-if="!isPlatform">
      <!-- 汇总卡片 -->
      <summary-cards :data="overview.summary" :loading="dashLoading" />

      <!-- 第一行：趋势 + 媒体分布 -->
      <el-row type="flex" :gutter="12" class="dashboard-section">
        <el-col :sm="12" :xs="24">
          <trend-chart
            :data="overview.trend"
            :loading="dashLoading"
            :error="!!errorMap.trend"
            @retry="fetchOverview"
          />
        </el-col>
        <el-col :sm="12" :xs="24">
          <media-distribution-chart
            :data="overview.mediaTypeDistribution"
            :loading="dashLoading"
            :error="!!errorMap.mediaTypeDistribution"
            @retry="fetchOverview"
          />
        </el-col>
      </el-row>

      <!-- 待办任务 -->
      <el-card v-if="!isPlatform" :bordered="false" :body-style="{padding: '0'}">
        <div class="salesCard">
          <el-tabs>
            <el-tab-pane label="待办任务">
              <!-- 任务列表 -->
              <el-table
                v-loading="loading"
                :data="taskList"
                border
                style="margin-top: 16px;"
              >
                <el-table-column
                  label="操作"
                  align="center"
                  class-name="small-padding fixed-width"
                  width="300"
                  fixed="left"
                >
                  <template slot-scope="scope">
                    <div class="action-buttons">
                      <el-button
                        size="small"
                        type="text"
                        icon="el-icon-view"
                        class="action-btn tertiary"
                        @click="handleView(scope.row)"
                      >
                        查看
                      </el-button>
                      <el-button
                        size="small"
                        type="text"
                        icon="el-icon-edit"
                        class="action-btn tertiary"
                        @click="handleProcess(scope.row)"
                      >
                        处理
                      </el-button>
                      <el-button
                        size="small"
                        type="text"
                        icon="el-icon-share"
                        class="action-btn tertiary"
                        @click="handleDelegate(scope.row)"
                      >
                        转办
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="任务编号" align="center" prop="taskNo" min-width="120" />
                <el-table-column label="任务名称" align="center" prop="taskName" min-width="120" />
                <el-table-column label="流程名称" align="center" prop="workflowName" min-width="120" />
                <el-table-column label="优先级" align="center" prop="priority" width="80">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
                    <el-tag v-else-if="scope.row.priority === 'medium'" type="warning">中</el-tag>
                    <el-tag v-else type="info">低</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="创建时间" align="center" prop="createdAt" width="160">
                  <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createdAt) }}</span>
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
            </el-tab-pane>
            <el-tab-pane label="系统状态">
              <el-row />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </template>

    <!-- 任务详情对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="viewOpen"
      width="800px"
      append-to-body
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ taskDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{
          taskDetail.task_name
        }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{
          taskDetail.workflow_name
        }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{
          taskDetail.instance_id
        }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="taskDetail.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="taskDetail.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else type="info">低</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          taskDetail.created_at
        }}</el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{
          taskDetail.description
        }}</el-descriptions-item>
        <el-descriptions-item label="任务数据" :span="2">
          <pre>{{ formatJson(taskDetail.task_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 任务处理对话框 - 使用统一组件 -->
    <TaskProcessDialog
      v-model="processOpen"
      :task-id="currentTaskId"
      @success="handleTaskProcessSuccess"
      @close="handleTaskProcessClose"
    />

    <!-- 转办对话框 -->
    <el-dialog
      title="转办任务"
      :visible.sync="delegateOpen"
      width="500px"
      append-to-body
    >
      <el-form
        ref="delegateForm"
        :model="delegateForm"
        :rules="delegateRules"
        label-width="100px"
      >
        <el-form-item label="组织" prop="orgId">
          <treeselect
            v-model="orgId"
            :options="orgOptions"
            placeholder="请选择组织"
            style="width: 170px"
            clearable
            @select="handleOrgSelect"
          />
        </el-form-item>
        <el-form-item label="转办人" prop="assignee">
          <el-select
            v-model="delegateForm.targetId"
            :options="userOptions"
            placeholder="请选择人员"
            style="width: 170px"
            clearable
          >
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="转办说明" prop="comment">
          <el-input
            v-model="delegateForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入转办说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDelegate">确定</el-button>
        <el-button @click="delegateOpen = false">取消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import TaskProcessDialog from '@/components/TaskProcessDialog'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listMyTodoTasks, getTask, delegateTask } from '@/api/process/task'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import { getStatisticsDashboard } from '@/api/evidence/statistics'

import DashboardHeader from './components/DashboardHeader'
import SummaryCards from './components/SummaryCards'
import TrendChart from './components/TrendChart'
import MediaDistributionChart from './components/MediaDistributionChart'


// Section key → 中文标签映射
const SECTION_LABELS = {
  summary: '汇总统计',
  trend: '媒体日采集量趋势',
  mediaTypeDistribution: '媒体分布',
}

export default {
  name: 'DashboardAdmin',
  components: {
    Pagination,
    TaskProcessDialog,
    Treeselect,
    DashboardHeader,
    SummaryCards,
    TrendChart,
    MediaDistributionChart,
  },
  data() {
    return {
      isPlatform: process.env.VUE_APP_MODE === 'platform',

      // ---- 仪表盘数据 ----
      overview: {
        summary: null,
        trend: null,
        mediaTypeDistribution: null,
      },
      meta: {
        dataAsOf: '',
        partial: false
      },
      dashLoading: false,
      refreshing: false,
      errors: [],

      // ---- 待办任务数据 ----
      loading: true,
      total: 0,
      taskList: [],
      dialogTitle: '',
      viewOpen: false,
      processOpen: false,
      delegateOpen: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      taskDetail: {},
      delegateForm: {},
      currentTaskId: null,
      orgOptions: [],
      userOptions: [],
      orgId: undefined,
      delegateRules: {
        targetId: [{ required: true, message: '转办人不能为空', trigger: 'blur' }],
        comment: [{ required: true, message: '转办说明不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    errorMap() {
      const map = {}
      this.errors.forEach(e => { map[e.section] = e })
      return map
    },
    errorLabels() {
      return this.errors.map(e => SECTION_LABELS[e.section] || e.section)
    }
  },
  watch: {
    orgId: function(newVal) {
      if (newVal) {
        this.getFormUser()
      }
    }
  },
  created() {
    if (!this.isPlatform) {
      this.fetchOverview()
      this.getList()
      this.getTreeselect()
    }
  },
  methods: {
    // ---- 仪表盘方法 ----
    fetchOverview() {
      this.dashLoading = true
      this.refreshing = true
      this.errors = []
      getStatisticsDashboard({ view: 'admin', days: 30 })
        .then(response => {
          if (response.code === 200 && response.data) {
            const data = response.data
            // 逐 section 赋值
            const sections = Object.keys(this.overview)
            sections.forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                this.$set(this.overview, key, data[key])
              }
            })
            // 读取 meta 信息
            if (data.meta) {
              if (data.meta.dataAsOf) {
                this.meta.dataAsOf = data.meta.dataAsOf
              }
              if (data.meta.partial) {
                this.meta.partial = true
              }
            }
            // 读取部分失败 errors
            if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
              this.meta.partial = true
              this.errors = data.errors
            }
          } else {
            // 整体失败
            const sections = Object.keys(this.overview)
            sections.forEach(key => {
              this.errors.push({ section: key })
            })
            this.meta.partial = true
          }
        })
        .catch(() => {
          const sections = Object.keys(this.overview)
          sections.forEach(key => {
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
      this.fetchOverview()
    },

    // ---- 待办任务方法（完整保留） ----
    getList() {
      this.loading = true
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      }
      listMyTodoTasks(params)
        .then((response) => {
          if (response.code === 200) {
            this.taskList =
              response.data.list ||
              response.data.items ||
              (Array.isArray(response.data) ? response.data : [])
            this.total = response.data.total || response.data.count || 0
          } else {
            this.msgError(response.msg || '查询失败')
          }
          this.loading = false
        })
        .catch((error) => {
          this.msgError('查询失败' + error.message)
          this.loading = false
        })
    },
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },
    handleOrgSelect(node) {
      listUser({ orgId: '/' + node.id + '/' }).then((response) => {
        this.userOptions = response.data.list
      })
    },
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.orgId + '/' })
          .then((response) => {
            this.userOptions = response.data.list
            resolve('true')
          })
          .catch((error) => {
            console.error('获取用户失败:', error)
            this.userOptions = []
            reject(error)
          })
      })
    },
    handleView(row) {
      const id = row.id
      getTask(id)
        .then((response) => {
          if (response.code === 200) {
            this.taskDetail = response.data
            this.viewOpen = true
            this.dialogTitle = '任务详情'
          } else {
            this.msgError(response.msg || '获取详情失败')
          }
        })
        .catch((error) => {
          this.msgError('获取详情失败' + error.message)
        })
    },
    handleProcess(row) {
      this.currentTaskId = row.taskId
      this.processOpen = true
    },
    handleDelegate(row) {
      this.currentTaskId = row.taskId
      const currentUserId = this.$store?.state?.user?.userid || undefined
      this.delegateForm = {
        userId: currentUserId,
        targetId: undefined,
        comment: ''
      }
      this.orgId = undefined
      this.delegateOpen = true
    },
    handleTaskProcessSuccess() {
      this.processOpen = false
      this.getList()
    },
    handleTaskProcessClose() {
      this.processOpen = false
    },
    submitDelegate() {
      this.$refs['delegateForm'].validate((valid) => {
        if (valid) {
          delegateTask(this.currentTaskId, this.delegateForm)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess('转办成功')
                this.delegateOpen = false
                this.getList()
              } else {
                this.msgError(response.msg || '转办失败')
              }
            })
            .catch((error) => {
              this.msgError('转办失败' + error.message)
            })
        }
      })
    },
    formatJson(jsonStr) {
      if (!jsonStr) return ''
      try {
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return jsonStr
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.dashboard-editor-container {
  padding: 12px;
  background-color: $law-bg-page;
  position: relative;
  min-height: calc(100vh - 84px);
}

.dashboard-section {
  margin-bottom: 12px;
}

// ---- 图表卡片通用样式 ----
.chart-card--dashboard {
  background: $law-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  padding: 16px 20px;
  margin-bottom: 12px;
  height: 100%;
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

// ---- 骨架屏 ----
.skeleton {
  background: $law-bg-card;
  border-radius: $radius-md;
  margin-bottom: 12px;

  &--card {
    padding: 16px 20px;
    height: 120px;
  }

  &--chart {
    height: 340px;
  }

  &--chart--tall {
    height: 200px;
  }

  &__line {
    background: linear-gradient(90deg, #ECEFF1 25%, #F5F5F5 50%, #ECEFF1 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 12px;

    &--title {
      width: 40%;
      height: 14px;
    }

    &--value {
      width: 60%;
      height: 26px;
      margin-top: 12px;
    }

    &--short {
      width: 30%;
      height: 10px;
      margin-top: 16px;
    }
  }
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ---- 待办任务 tabs ----
::v-deep .el-tabs__item {
  padding-left: 16px !important;
  height: 50px;
  line-height: 50px;
}

// ---- 对话框代码块 ----
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}

// ---- 响应式 ----
@media (max-width: 768px) {
  .dashboard-editor-container {
    padding: 8px;
  }
  .chart-card--dashboard {
    padding: 12px 14px;
  }
}

@media print {
  .dashboard-editor-container {
    padding: 0;
    background: #fff;
  }
  .chart-card--dashboard {
    box-shadow: none;
    border: 1px solid #E0E0E0;
  }
}
</style>
