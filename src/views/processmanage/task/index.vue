<template>
  <div class="app-container">
    <el-breadcrumb class="mb20" separator="/">
      <el-breadcrumb-item>流程管理</el-breadcrumb-item>
      <el-breadcrumb-item>任务管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 查询表单 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="任务名称" prop="task_name">
        <el-input
          v-model="queryParams.task_name"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程名称" prop="workflow_name">
        <el-input
          v-model="queryParams.workflow_name"
          placeholder="请输入流程名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option label="待处理" value="pending" />
          <el-option label="已认领" value="claimed" />
          <el-option label="已完成" value="completed" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理人" prop="assignee">
        <el-input
          v-model="queryParams.assignee"
          placeholder="请输入处理人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="taskList" border>
      <el-table-column label="任务ID" align="center" prop="id" width="280" show-overflow-tooltip />
      <el-table-column label="任务名称" align="center" prop="task_name" width="150" />
      <el-table-column label="任务键" align="center" prop="task_key" width="120" />
      <el-table-column label="流程名称" align="center" prop="workflow_name" width="150" />
      <el-table-column label="流程实例ID" align="center" prop="instance_id" width="280" show-overflow-tooltip />
      <el-table-column label="处理人" align="center" prop="assignee" width="120" />
      <el-table-column label="候选组" align="center" prop="candidate_groups" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.candidate_groups && scope.row.candidate_groups.length > 0">
            {{ scope.row.candidate_groups.join(', ') }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'pending'" type="warning">待处理</el-tag>
          <el-tag v-else-if="scope.row.status === 'claimed'" type="primary">已认领</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === 'rejected'" type="danger">已驳回</el-tag>
          <el-tag v-else type="info">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" prop="priority" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="scope.row.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else-if="scope.row.priority === 'low'" type="info">低</el-tag>
          <el-tag v-else>{{ scope.row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="created_at" width="160" />
      <el-table-column label="完成时间" align="center" prop="completed_at" width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
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
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.status === 'pending'"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/修改任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <!-- 任务信息 -->
        <el-form-item label="工作流ID" prop="workflow_id">
          <el-input
            v-model="form.workflow_id"
            placeholder="请输入工作流ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="实例ID" prop="instance_id">
          <el-input
            v-model="form.instance_id"
            placeholder="请输入工作流实例ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="任务名称" prop="task_name">
          <el-input
            v-model="form.task_name"
            placeholder="请输入任务显示名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="任务键" prop="task_key">
          <el-input
            v-model="form.task_key"
            placeholder="请输入任务键值（英文）"
            clearable
          />
        </el-form-item>

        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入任务详细描述"
            rows="3"
          />
        </el-form-item>

        <!-- 任务分配 -->
        <el-divider>任务分配</el-divider>

        <el-form-item label="指定用户" prop="assignee">
          <el-input
            v-model="form.assignee"
            placeholder="请输入用户ID（可选）"
            clearable
          />
        </el-form-item>

        <el-form-item label="候选用户" prop="candidate_users">
          <el-input
            v-model="candidateUsersStr"
            placeholder="请输入用户ID，多个用逗号分隔（可选）"
            clearable
          />
        </el-form-item>

        <el-form-item label="候选组" prop="candidate_groups">
          <el-input
            v-model="candidateGroupsStr"
            placeholder="请输入角色名称，多个用逗号分隔（可选）"
            clearable
          />
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择任务优先级">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="viewOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ taskDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ taskDetail.task_name }}</el-descriptions-item>
        <el-descriptions-item label="任务键">{{ taskDetail.task_key }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{ taskDetail.workflow_name }}</el-descriptions-item>
        <el-descriptions-item label="工作流ID">{{ taskDetail.workflow_id }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{ taskDetail.instance_id }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ taskDetail.assignee || '-' }}</el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <el-tag v-if="taskDetail.status === 'pending'" type="warning">待处理</el-tag>
          <el-tag v-else-if="taskDetail.status === 'claimed'" type="primary">已认领</el-tag>
          <el-tag v-else-if="taskDetail.status === 'completed'" type="success">已完成</el-tag>
          <el-tag v-else-if="taskDetail.status === 'rejected'" type="danger">已驳回</el-tag>
          <el-tag v-else type="info">{{ taskDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="taskDetail.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="taskDetail.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else-if="taskDetail.priority === 'low'" type="info">低</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskDetail.created_at }}</el-descriptions-item>
        <el-descriptions-item label="认领时间">{{ taskDetail.claimed_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ taskDetail.completed_at || '-' }}</el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{ taskDetail.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="候选用户" :span="2">
          {{ taskDetail.candidate_users && taskDetail.candidate_users.length > 0 ? taskDetail.candidate_users.join(', ') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="候选组" :span="2">
          {{ taskDetail.candidate_groups && taskDetail.candidate_groups.length > 0 ? taskDetail.candidate_groups.join(', ') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="任务数据" :span="2">
          <pre>{{ formatJson(taskDetail.task_data) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="输出数据" :span="2">
          <pre>{{ formatJson(taskDetail.output) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="处理意见" :span="2">{{ taskDetail.comment || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAllTasks,
  getTask,
  createTask,
  deleteTask
} from '@/api/process/task'

export default {
  name: 'TaskManage',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务列表
      taskList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示查看对话框
      viewOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        task_name: undefined,
        workflow_name: undefined,
        status: undefined,
        assignee: undefined
      },
      // 表单参数
      form: {},
      // 任务详情
      taskDetail: {},
      // 候选用户字符串
      candidateUsersStr: '',
      // 候选组字符串
      candidateGroupsStr: '',
      // 表单校验
      rules: {
        workflow_id: [
          { required: true, message: '工作流ID不能为空', trigger: 'blur' }
        ],
        instance_id: [
          { required: true, message: '实例ID不能为空', trigger: 'blur' }
        ],
        task_name: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' }
        ],
        task_key: [
          { required: true, message: '任务键值不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询任务列表 */
    getList() {
      this.loading = true
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
        task_name: this.queryParams.task_name,
        workflow_name: this.queryParams.workflow_name,
        status: this.queryParams.status,
        assignee: this.queryParams.assignee
      }
      listAllTasks(params).then(response => {
        if (response.code === 200) {
          this.taskList = response.data.items || []
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增任务'
    },
    /** 查看按钮操作 */
    handleView(row) {
      const id = row.id
      getTask(id).then(response => {
        if (response.code === 200) {
          this.taskDetail = response.data
          this.viewOpen = true
        } else {
          this.msgError(response.msg || '获取详情失败')
        }
      }).catch(error => {
        this.msgError('获取详情失败：' + error.message)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除任务"' + row.task_name + '"?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteTask(row.id)
      }).then(response => {
        if (response.code === 200) {
          this.getList()
          this.msgSuccess('删除成功')
        } else {
          this.msgError(response.msg || '删除失败')
        }
      }).catch(() => {})
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          // 处理候选用户和候选组
          this.form.candidate_users = this.candidateUsersStr
            ? this.candidateUsersStr.split(',').map(u => u.trim()).filter(u => u)
            : []
          this.form.candidate_groups = this.candidateGroupsStr
            ? this.candidateGroupsStr.split(',').map(g => g.trim()).filter(g => g)
            : []

          createTask(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg || '新增失败')
            }
          }).catch(error => {
            this.msgError('新增失败：' + error.message)
          })
        }
      })
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        workflow_id: '',
        instance_id: '',
        task_name: '',
        task_key: '',
        description: '',
        assignee: '',
        candidate_users: [],
        candidate_groups: [],
        priority: 'medium'
      }
      this.candidateUsersStr = ''
      this.candidateGroupsStr = ''
      this.resetForm('form')
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
.mb8 {
  margin-bottom: 8px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}
</style>