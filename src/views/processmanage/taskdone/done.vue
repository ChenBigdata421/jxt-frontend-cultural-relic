<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 已完成任务查询栏组件 -->
        <TaskDoneQueryBar
          ref="queryBar"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 任务列表 -->
        <el-table
          v-loading="loading"
          :data="taskList"
          border
        >
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="150"
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
                  icon="el-icon-document"
                  class="action-btn tertiary"
                  @click="handleViewHistory(scope.row)"
                >
                  历史
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="任务编号" align="center" prop="taskNo" min-width="120" />
          <el-table-column label="任务名称" align="center" prop="taskName" min-width="120" />
          <el-table-column label="流程名称" align="center" prop="workflowName" min-width="120" />
          <el-table-column label="处理结果" align="center" prop="result" width="100">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.result === 'approved'" type="success">通过</el-tag>
              <el-tag v-else-if="scope.row.result === 'rejected'" type="danger">驳回</el-tag>
              <el-tag v-else type="info">完成</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="完成时间" align="center" prop="completedAt" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.completedAt) }}</span>
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
      </el-card>

      <!-- 任务详情对话框 -->
      <el-dialog
        title="任务详情"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{
            taskDetail.taskName
          }}</el-descriptions-item>
          <el-descriptions-item label="流程名称">{{
            taskDetail.workflowName
          }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{
            taskDetail.assignee
          }}</el-descriptions-item>
          <el-descriptions-item label="处理结果">
            <el-tag v-if="taskDetail.result === 'approved'" type="success">通过</el-tag>
            <el-tag v-else-if="taskDetail.result === 'rejected'" type="danger">驳回</el-tag>
            <el-tag v-else type="info">完成</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            taskDetail.created_at
          }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{
            taskDetail.completedAt
          }}</el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">{{
            taskDetail.description
          }}</el-descriptions-item>
          <el-descriptions-item label="处理意见" :span="2">{{
            taskDetail.comment
          }}</el-descriptions-item>
          <el-descriptions-item label="任务数据" :span="2">
            <pre>{{ formatJson(taskDetail.taskData) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="输出数据" :span="2">
            <pre>{{ formatJson(taskDetail.output) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>

      <!-- 任务历史对话框 -->
      <el-dialog
        title="任务历史"
        :visible.sync="historyOpen"
        width="900px"
        append-to-body
      >
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in historyList"
            :key="index"
            :timestamp="item.created_at"
            placement="top"
            :type="getTimelineType(item.result)"
          >
            <el-card>
              <h4>{{ item.taskName }}</h4>
              <div class="history-meta">
                <span>处理人：{{ getUserDisplayName(item.assignee) }}</span>
                <span>部门：{{ getUserOrgName(item.assignee) }}</span>
              </div>
              <p>
                处理结果：
                <el-tag
                  v-if="item.result === 'approved'"
                  type="success"
                  size="small"
                >通过</el-tag>
                <el-tag
                  v-else-if="item.result === 'rejected'"
                  type="danger"
                  size="small"
                >驳回</el-tag>
                <el-tag v-else type="info" size="small">完成</el-tag>
              </p>
              <p v-if="item.comment">处理意见：{{ item.comment }}</p>
              <p>创建时间：{{ parseTime(item.createdAt) || "-" }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div slot="footer" class="dialog-footer">
          <el-button @click="historyOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import TaskDoneQueryBar from '@/components/TaskDoneQueryBar/index.vue'
import { listMyDoneTasks, getTask, getTaskHistory } from '@/api/process/task'
import { getUser } from '@/api/admin/sys-user'

export default {
  name: 'DoneTask',
  components: {
    BasicLayout,
    Pagination,
    TaskDoneQueryBar
  },
  data() {
    return {
      loading: true,
      total: 0,
      userCache: {},
      taskList: [],
      viewOpen: false,
      historyOpen: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined
      },
      taskDetail: {},
      historyList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
        task_name: this.queryParams.taskName,
        workflow_name: this.queryParams.workflowName
      }
      listMyDoneTasks(params)
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
          this.msgError('查询失败：' + error.message)
          this.loading = false
        })
    },
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleReset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined
      }
      this.getList()
    },
    handleView(row) {
      const id = row.taskId
      getTask(id)
        .then((response) => {
          if (response.code === 200) {
            this.taskDetail = response.data
            this.viewOpen = true
          } else {
            this.msgError(response.msg || '获取详情失败')
          }
        })
        .catch((error) => {
          this.msgError('获取详情失败：' + error.message)
        })
    },
    handleViewHistory(row) {
      getTaskHistory(row.taskId)
        .then((response) => {
          if (response.code === 200) {
            this.historyList = response.data || []
            this.historyOpen = true
          } else {
            this.msgError(response.msg || '获取历史失败')
          }
        })
        .catch((error) => {
          this.msgError('获取历史失败：' + error.message)
        })
    },
    getTimelineType(result) {
      if (result === 'approved') return 'success'
      if (result === 'rejected') return 'danger'
      return 'primary'
    },
    formatJson(jsonStr) {
      if (!jsonStr) return ''
      try {
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        return jsonStr
      }
    },
    getUserDisplayName(userId) {
      if (!userId) return '未知'
      if (this.userCache[userId]) {
        return this.userCache[userId].userName || '未知'
      }
      this.fetchUserInfo(userId)
      return '加载中...'
    },
    getUserOrgName(userId) {
      if (!userId) return '未知'
      if (this.userCache[userId]) {
        return this.userCache[userId].orgFullName || '未知'
      }
      return '加载中...'
    },
    async fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) {
        return
      }

      try {
        const response = await getUser(userId)
        if (response && response.code === 200 && response.data) {
          this.$set(this.userCache, userId, {
            userName: response.data.userName || '未知',
            orgFullName: response.data.orgFullName || '未知'
          })
          this.$forceUpdate()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$set(this.userCache, userId, {
          userName: '获取失败',
          orgFullName: '获取失败'
        })
      }
    }
  }
}
</script>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .detail-dialog
  - src/styles/components/buttons.scss: .action-btn
-->
<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
.history-meta {
  margin-top: 10px;
  color: #606266;
  font-size: 13px;
  display: flex;
  gap: 24px;
}
</style>
