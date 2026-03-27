<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程名称" prop="workflowName">
        <el-input
          v-model="queryParams.workflowName"
          placeholder="请输入流程名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="taskList" border>
      <el-table-column label="任务编号" align="center" prop="taskNo" width="150" />
      <el-table-column label="任务名称" align="center" prop="taskName" width="150" />
      <el-table-column label="流程名称" align="center" prop="workflowName" width="150" />

      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="scope.row.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else type="info">低</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="160" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="300"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleProcess(scope.row)"
          >处理</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleDelegate(scope.row)"
          >转办</el-button>
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

    <!-- 任务详情对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="viewOpen" width="800px" append-to-body>
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
    <el-dialog title="转办任务" :visible.sync="delegateOpen" width="500px" append-to-body>
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
import { listMyTodoTasks, getTask, delegateTask } from '@/api/process/task'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import TaskProcessDialog from '@/components/TaskProcessDialog'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'TodoTask',
  components: {
    TaskProcessDialog,
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务列表
      taskList: [],
      // 对话框标题
      dialogTitle: '',
      viewOpen: false,
      processOpen: false,
      delegateOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined
      },
      // 任务详情
      taskDetail: {},
      // 转办表单
      delegateForm: {},
      // 当前任务ID
      currentTaskId: null,
      orgOptions: [],
      userOptions: [],
      orgId: undefined,
      // 表单校验
      delegateRules: {
        targetId: [{ required: true, message: '转办人不能为空', trigger: 'blur' }],
        comment: [{ required: true, message: '转办说明不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    orgId: function(newVal) {
      // 当 form.orgId 更新时，调用 getUser
      if (newVal) {
        this.getFormUser()
      }
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
  },
  methods: {
    /** 查询任务列表 */
    getList() {
      this.loading = true
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
        task_name: this.queryParams.taskName,
        workflow_name: this.queryParams.workflowName
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
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]），
      })
    },
    handleOrgSelect(node) {
      listUser({ orgId: '/' + node.id + '/' }).then((response) => {
        this.userOptions = response.data.list
      })
    },
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.form.orgId + '/' })
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
    /** 查看按钮操作 */
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
    /** 处理按钮操作 */
    handleProcess(row) {
      this.currentTaskId = row.taskId
      this.processOpen = true
    },
    /** 转办按钮操作 */
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
    /** 任务处理成功回调 */
    handleTaskProcessSuccess() {
      this.processOpen = false
      this.getList()
    },
    /** 任务处理对话框关闭回调 */
    handleTaskProcessClose() {
      this.processOpen = false
    },
    /** 提交转办 */
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
    /** 格式化JSON */
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

<style scoped>
.app-container {
  padding: 20px;
}
.mb20 {
  margin-bottom: 20px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>
