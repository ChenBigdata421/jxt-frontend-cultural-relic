<template>
  <div class="app-container">
    <el-breadcrumb class="mb20" separator="/">
      <el-breadcrumb-item>流程管理</el-breadcrumb-item>
      <el-breadcrumb-item>待领任务</el-breadcrumb-item>
    </el-breadcrumb>

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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="taskList" border>
      <el-table-column label="任务ID" align="center" prop="id" width="280" show-overflow-tooltip />
      <el-table-column label="任务名称" align="center" prop="task_name" width="150" />
      <el-table-column label="流程名称" align="center" prop="workflow_name" width="150" />
      <el-table-column label="流程实例ID" align="center" prop="instance_id" width="280" show-overflow-tooltip />
      <el-table-column label="候选组" align="center" prop="candidate_group" width="120" />
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="scope.row.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else type="info">低</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="created_at" width="160" />
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
            icon="el-icon-download"
            @click="handleClaim(scope.row)"
          >认领</el-button>
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

    <!-- 任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{ taskDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ taskDetail.task_name }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{ taskDetail.workflow_name }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{ taskDetail.instance_id }}</el-descriptions-item>
        <el-descriptions-item label="候选组">{{ taskDetail.candidate_group }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="taskDetail.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="taskDetail.priority === 'medium'" type="warning">中</el-tag>
          <el-tag v-else type="info">低</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskDetail.created_at }}</el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{ taskDetail.description }}</el-descriptions-item>
        <el-descriptions-item label="任务数据" :span="2">
          <pre>{{ formatJson(taskDetail.task_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClaimFromDetail">认 领</el-button>
        <el-button @click="viewOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listClaimableTasks,
  getTask,
  claimTask
} from '@/api/process/task'

export default {
  name: 'ClaimableTask',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务列表
      taskList: [],
      // 是否显示查看对话框
      viewOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined
      },
      // 任务详情
      taskDetail: {}
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
        task_name: this.queryParams.taskName,
        workflow_name: this.queryParams.workflowName
      }
      listClaimableTasks(params).then(response => {
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
    /** 认领按钮操作 */
    handleClaim(row) {
      this.$confirm('确认认领任务"' + row.task_name + '"?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        return claimTask(row.id)
      }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('认领成功')
          this.getList()
        } else {
          this.msgError(response.msg || '认领失败')
        }
      }).catch(error => {
        if (error !== 'cancel') {
          this.msgError('认领失败：' + error.message)
        }
      })
    },
    /** 从详情对话框认领 */
    handleClaimFromDetail() {
      this.$confirm('确认认领该任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        return claimTask(this.taskDetail.id)
      }).then(response => {
        if (response.code === 200) {
          this.msgSuccess('认领成功')
          this.viewOpen = false
          this.getList()
        } else {
          this.msgError(response.msg || '认领失败')
        }
      }).catch(error => {
        if (error !== 'cancel') {
          this.msgError('认领失败：' + error.message)
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

