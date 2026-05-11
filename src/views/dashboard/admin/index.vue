<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="12">
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="总销售额" total="￥126,560">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <trend flag="top" style="margin-right: 16px;" rate="12">
              <span slot="term">周同比</span>
            </trend>
            <trend flag="bottom" rate="11">
              <span slot="term">日同比</span>
            </trend>
          </div>
          <template slot="footer">日均销售额<span>￥ 234.56</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="访问量" :total="8846">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-area />
          </div>
          <template slot="footer">日访问量<span> {{ '1234' }}</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="支付笔数" :total="6560">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-bar />
          </div>
          <template slot="footer">转化率 <span>60%</span></template>
        </chart-card>
      </el-col>
      <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
        <chart-card title="运营活动效果" total="78%">
          <el-tooltip slot="action" class="item" effect="dark" content="指标说明" placement="top-start">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <div>
            <mini-progress color="rgb(19, 194, 194)" :target="80" :percentage="78" height="8px" />
          </div>
          <template slot="footer">
            <trend flag="top" style="margin-right: 16px;" rate="12">
              <span slot="term">同周比</span>
            </trend>
            <trend flag="bottom" rate="80">
              <span slot="term">日环比</span>
            </trend>
          </template>
        </chart-card>
      </el-col>
    </el-row>

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
            placeholder="请选择处警人员"
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
import ChartCard from '@/components/ChartCard'
import Trend from '@/components/Trend'
import MiniArea from '@/components/MiniArea'
import MiniBar from '@/components/MiniBar'
import MiniProgress from '@/components/MiniProgress'
import Pagination from '@/components/Pagination'
import TaskProcessDialog from '@/components/TaskProcessDialog'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listMyTodoTasks, getTask, delegateTask } from '@/api/process/task'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'

const barData = []
const barData2 = []
for (let i = 0; i < 12; i += 1) {
  barData.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200
  })
  barData2.push({
    x: `${i + 1}月`,
    y: Math.floor(Math.random() * 1000) + 200
  })
}

const rankList = []
for (let i = 0; i < 7; i++) {
  rankList.push({
    name: '白鹭岛 ' + (i + 1) + ' 号店',
    total: 1234.56 - i * 100
  })
}

export default {
  name: 'DashboardAdmin',
  components: {
    ChartCard,
    Trend,
    MiniArea,
    MiniBar,
    MiniProgress,
    Pagination,
    TaskProcessDialog,
    Treeselect
  },
  data() {
    return {
      isPlatform: process.env.VUE_APP_MODE === 'platform',
      barData,
      barData2,
      rankList,
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
  watch: {
    orgId: function(newVal) {
      if (newVal) {
        this.getFormUser()
      }
    }
  },
  created() {
    if (!this.isPlatform) {
      this.getList()
      this.getTreeselect()
    }
  },
  methods: {
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
.dashboard-editor-container {
  padding: 12px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

::v-deep .el-tabs__item{
   padding-left: 16px!important;
   height: 50px;
   line-height: 50px;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>
