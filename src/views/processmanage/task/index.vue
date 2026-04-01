<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 任务查询栏组件 -->
        <TaskQueryBar
          ref="queryBar"
          :workflow-options="workflowOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @reset="handleReset"
          @org-select="handleOrgSelect"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedTaskRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-button
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedTaskRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="300"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
              @after-enter="handleColumnSettingsOpen"
              @after-leave="handleColumnSettingsClose"
            >
              <div
                role="dialog"
                aria-label="列显示设置"
                class="column-settings"
              >
                <div class="column-settings-header">
                  <span class="column-settings-title">列显示设置</span>
                  <el-button
                    type="text"
                    size="small"
                    class="column-settings-reset"
                    @click="resetColumns"
                  >
                    重置
                  </el-button>
                </div>
                <el-checkbox-group
                  v-model="visibleColumns"
                  @change="handleColumnChange"
                >
                  <div
                    v-for="col in columnOptions"
                    :key="col.prop"
                    class="column-item"
                  >
                    <el-checkbox
                      :label="col.prop"
                      :disabled="col.fixed"
                      :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
                    >
                      {{ col.label }}
                      <el-tooltip
                        v-if="col.fixed"
                        content="此列必须显示，不能隐藏"
                        placement="top"
                      >
                        <i class="el-icon-info column-item-icon" />
                      </el-tooltip>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button
                slot="reference"
                size="small"
                icon="el-icon-setting"
                type="text"
                class="action-btn tertiary"
                aria-label="打开列设置"
                aria-haspopup="dialog"
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <!-- 任务列表 -->
        <el-table
          ref="taskTable"
          v-loading="loading"
          :data="taskList"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="200"
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
                  v-if="scope.row.status === 'pending'"
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('taskNo')"
            label="任务编号"
            align="center"
            prop="taskNo"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('taskName')"
            label="任务名称"
            align="center"
            prop="taskName"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('workflowNo')"
            label="流程编号"
            align="center"
            prop="workflowNo"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('workflowName')"
            label="流程名称"
            align="center"
            prop="workflowName"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('instanceNo')"
            label="实例编号"
            align="center"
            prop="instanceNo"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('assignee')"
            label="处理人"
            align="center"
            prop="assignee"
            width="120"
          >
            <template slot-scope="scope">
              {{ getUserDisplayName(scope.row.assignee) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('status')"
            label="任务状态"
            align="center"
            prop="status"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 'pending'" type="warning">待处理</el-tag>
              <el-tag
                v-else-if="scope.row.status === 'completed'"
                type="success"
              >已完成</el-tag>
              <el-tag
                v-else-if="scope.row.status === 'rejected'"
                type="danger"
              >已驳回</el-tag>
              <el-tag v-else type="info">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('priority')"
            label="优先级"
            align="center"
            prop="priority"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
              <el-tag v-else-if="scope.row.priority === 'medium'" type="warning">中</el-tag>
              <el-tag v-else-if="scope.row.priority === 'low'" type="info">低</el-tag>
              <el-tag v-else>{{ scope.row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('createdAt')"
            label="创建时间"
            align="center"
            prop="createdAt"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('completedAt')"
            label="完成时间"
            align="center"
            prop="completedAt"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.completedAt) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>

      <!-- 任务详情对话框 -->
      <el-dialog
        title="任务详情"
        :visible.sync="viewOpen"
        width="900px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{
            taskDetail.taskName
          }}</el-descriptions-item>
          <el-descriptions-item label="任务编号">{{
            taskDetail.taskNo
          }}</el-descriptions-item>
          <el-descriptions-item label="流程名称">{{
            taskDetail.workflowName
          }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{
            getUserDisplayName(taskDetail.assignee) || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag v-if="taskDetail.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag
              v-else-if="taskDetail.status === 'completed'"
              type="success"
            >已完成</el-tag>
            <el-tag
              v-else-if="taskDetail.status === 'rejected'"
              type="danger"
            >已驳回</el-tag>
            <el-tag v-else type="info">{{ taskDetail.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag v-if="taskDetail.priority === 'high'" type="danger">高</el-tag>
            <el-tag v-else-if="taskDetail.priority === 'medium'" type="warning">中</el-tag>
            <el-tag v-else-if="taskDetail.priority === 'low'" type="info">低</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            taskDetail.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{
            taskDetail.completedAt || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">{{
            taskDetail.description || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="任务数据" :span="2">
            <pre>{{ formatJson(taskDetail.taskData) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="输出数据" :span="2">
            <pre>{{ formatJson(taskDetail.output) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="处理意见" :span="2">{{
            taskDetail.comment || "-"
          }}</el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import TaskQueryBar from '@/components/TaskQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import { listAllTasks, getTask, deleteTask } from '@/api/process/task'
import { listAllWorkflows } from '@/api/process/workflow'
import { orgTreeSelect, getOrgLeader } from '@/api/admin/sys-org'
import { getUser } from '@/api/admin/sys-user'

export default {
  name: 'TaskManage',
  components: {
    BasicLayout,
    Pagination,
    TaskQueryBar,
    BatchActionBar
  },
  data() {
    return {
      loading: true,
      total: 0,
      taskList: [],
      orgOptions: [],
      workflowOptions: [],
      viewOpen: false,
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        taskName: undefined,
        workflowId: undefined,
        status: undefined,
        assignee: undefined
      },
      form: {},
      taskDetail: {},
      rules: {},
      userCache: {},
      selectedTaskMap: {},
      isRestoringSelection: false,
      selectedTaskRecords: [],
      isAllSelected: false,
      isSelectionIndeterminate: false,
      columnOptions: [
        { prop: 'taskNo', label: '任务编号', fixed: true, defaultVisible: true },
        { prop: 'taskName', label: '任务名称', fixed: true, defaultVisible: true },
        { prop: 'workflowNo', label: '流程编号', fixed: false, defaultVisible: true },
        { prop: 'workflowName', label: '流程名称', fixed: false, defaultVisible: true },
        { prop: 'instanceNo', label: '实例编号', fixed: false, defaultVisible: false },
        { prop: 'assignee', label: '处理人', fixed: false, defaultVisible: true },
        { prop: 'status', label: '任务状态', fixed: false, defaultVisible: true },
        { prop: 'priority', label: '优先级', fixed: false, defaultVisible: true },
        { prop: 'createdAt', label: '创建时间', fixed: false, defaultVisible: true },
        { prop: 'completedAt', label: '完成时间', fixed: false, defaultVisible: false }
      ],
      visibleColumns: []
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getAllWorkflow()
    this.getOrgTree()
  },
  methods: {
    initVisibleColumns() {
      const saved = localStorage.getItem('task_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions
            .filter((item) => item.defaultVisible !== false)
            .map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions
          .filter((item) => item.defaultVisible !== false)
          .map((item) => item.prop)
      }
    },
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    handleColumnChange(value) {
      localStorage.setItem('task_visible_columns', JSON.stringify(value))
    },
    resetColumns() {
      this.visibleColumns = this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
      localStorage.setItem('task_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
    },
    handleColumnSettingsOpen() {
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },
    handleColumnSettingsClose() {
      // Focus returns to trigger button
    },
    getList() {
      this.loading = true
      listAllTasks(this.queryParams)
        .then((response) => {
          if (response.code === 200) {
            this.taskList =
              response.data.list ||
              response.data.items ||
              (Array.isArray(response.data) ? response.data : [])
            this.total = response.data.total || response.data.count || 0
            this.restoreSelection()
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
    getAllWorkflow() {
      listAllWorkflows()
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.workflowOptions = response.data
          } else {
            this.workflowOptions = []
            this.msgError(response.msg || '获取工作流失败')
          }
        })
        .catch((error) => {
          this.msgError('查询工作流失败：' + (error.message || '未知错误'))
          this.workflowOptions = []
        })
    },
    getOrgTree() {
      orgTreeSelect()
        .then((response) => {
          this.orgOptions = response.data
        })
        .catch((error) => {
          console.error('获取组织树失败:', error)
          this.orgOptions = []
        })
    },
    async handleOrgSelect(orgId) {
      try {
        const response = await getOrgLeader(orgId)
        if (response && response.code === 200 && response.data) {
          this.queryParams.assignee = response.data.leaderId
        } else {
          this.$message.warning('获取组织负责人失败')
        }
      } catch (error) {
        console.error('获取组织负责人失败:', error)
        this.$message.error('获取组织负责人失败：' + (error.message || '未知错误'))
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
    async fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) {
        return
      }

      try {
        const response = await getUser(userId)
        if (response && response.code === 200 && response.data) {
          this.$set(this.userCache, userId, {
            userName: response.data.userName || '未知'
          })
          this.$forceUpdate()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$set(this.userCache, userId, {
          userName: '获取失败'
        })
      }
    },
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.taskTable) return
      if (!this.taskList || !this.taskList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.taskList.forEach((row) => {
            const taskId = row && row.taskId
            if (!taskId) return
            if (this.selectedTaskMap[taskId]) {
              this.$refs.taskTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          setTimeout(() => {
            this.isRestoringSelection = false
          }, 0)
        }
      })
    },
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.taskId).filter(Boolean)
      )

      ;(this.taskList || []).forEach((row) => {
        const taskId = row && row.taskId
        if (!taskId) return
        if (selectedIdSet.has(taskId)) {
          this.selectedTaskMap[taskId] = row
        } else {
          delete this.selectedTaskMap[taskId]
        }
      })
      this.selectedTaskRecords = Object.values(this.selectedTaskMap).filter(Boolean)

      const totalCount = this.taskList.length
      const selectedCount = this.selectedTaskRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.taskTable.toggleAllSelection()
    },
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      this.queryParams.pageIndex = 1
      this.selectedTaskMap = {}
      this.selectedTaskRecords = []
      this.getList()
    },
    handleReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        taskName: undefined,
        workflowId: undefined,
        status: undefined,
        assignee: undefined
      }
      this.selectedTaskMap = {}
      this.selectedTaskRecords = []
      this.getList()
    },
    handleRefresh() {
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
    async handleDelete(row) {
      try {
        var taskIds
        var taskNames
        if (row && row.taskId !== undefined) {
          taskIds = [row.taskId]
          taskNames = row.taskName
        } else {
          taskIds = this.selectedTaskRecords.map((item) => item.taskId)
          taskNames = this.selectedTaskRecords.map((item) => item.taskName)
        }

        const count = Array.isArray(taskIds) ? taskIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条任务记录？此操作不可恢复。`
          : `是否确认删除任务"${taskNames}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await deleteTask(Array.isArray(taskIds) ? taskIds[0] : taskIds)
        if (response.code === 200) {
          this.queryParams.pageIndex = 1
          this.selectedTaskMap = {}
          this.selectedTaskRecords = []
          this.getList()
          this.msgSuccess(response.msg || '删除成功')
        } else {
          this.msgError(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },
    reset() {
      this.form = {}
      this.resetForm('form')
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

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .detail-dialog
  - src/styles/components/buttons.scss: .action-btn
  - src/styles/components/main-action-bar.scss: .main-action-bar
-->
