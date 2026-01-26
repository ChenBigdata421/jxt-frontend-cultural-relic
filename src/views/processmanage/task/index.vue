<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作流" prop="workflowId">
        <el-select
          v-model="queryParams.workflowId"
          placeholder="请选择工作流"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="opt in workflowOptions"
            :key="opt.workflowId"
            :label="opt.name"
            :value="opt.workflowId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option label="待处理" value="pending" />
          <el-option label="已认领" value="claimed" />
          <el-option label="已完成" value="completed" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="审批组织" prop="assignee">
        <treeselect
          :options="orgOptions"
          placeholder="请选择审批组织"
          style="width: 170px"
          clearable
          @input="handleOrgSelect($event)"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="taskList" border>
      <el-table-column label="任务编号" align="center" prop="taskNo" width="150" />
      <el-table-column label="任务名称" align="center" prop="taskName" width="150" />
      <el-table-column label="流程编号" align="center" prop="workflowNo" width="150" />
      <el-table-column label="流程名称" align="center" prop="workflowName" width="150" />
      <el-table-column label="实例编号" align="center" prop="instanceNo" width="150" />
      <el-table-column label="处理人" align="center" prop="assignee" width="120">
        <template slot-scope="scope">
          {{ getUserDisplayName(scope.row.assignee) }}
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'pending'" type="warning">待处理</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="success"
            >已完成</el-tag
          >
          <el-tag v-else-if="scope.row.status === 'rejected'" type="danger"
            >已驳回</el-tag
          >
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
      <el-table-column label="创建时间" align="center" prop="createdAt" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completedAt" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.completedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="200"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            >查看</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.status === 'pending'"
            >删除</el-button
          >
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

    <!-- 任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="viewOpen" width="900px" append-to-body>
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
          <el-tag v-else-if="taskDetail.status === 'completed'" type="success"
            >已完成</el-tag
          >
          <el-tag v-else-if="taskDetail.status === 'rejected'" type="danger"
            >已驳回</el-tag
          >
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
        <el-button @click="viewOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAllTasks, getTask, createTask, deleteTask } from "@/api/process/task";
import { listAllWorkflows } from "@/api/process/workflow";
import { orgTreeSelect, getOrgLeader } from "@/api/admin/sys-org";
import { getUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "TaskManage",
  components: {
    Treeselect,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务列表
      taskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      orgOptions: [], // 组织树选项
      workflowOptions: [], // 工作流下拉
      // 是否显示查看对话框
      viewOpen: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        taskName: undefined,
        workflowId: undefined,
        status: undefined,
        assignee: undefined,
      },
      // 表单参数
      form: {},
      // 任务详情
      taskDetail: {},
      // 表单校验
      rules: {},
      userCache: {}, // 用户信息缓存，避免重复请求
    };
  },
  created() {
    this.getList();
    this.getAllWorkflow();
    this.getOrgTree();
  },
  methods: {
    /** 查询任务列表 */
    getList() {
      this.loading = true;
      listAllTasks(this.queryParams)
        .then((response) => {
          if (response.code === 200) {
            this.taskList =
              response.data.list ||
              response.data.items ||
              (Array.isArray(response.data) ? response.data : []);
            this.total = response.data.total || response.data.count || 0;
          } else {
            this.msgError(response.msg || "查询失败");
          }
          this.loading = false;
        })
        .catch((error) => {
          this.msgError("查询失败：" + error.message);
          this.loading = false;
        });
    },
    getAllWorkflow() {
      listAllWorkflows()
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.workflowOptions = response.data;
          } else {
            this.workflowOptions = [];
            this.msgError(response.msg || "获取工作流失败");
          }
        })
        .catch((error) => {
          this.msgError("查询工作流失败：" + (error.message || "未知错误"));
          this.workflowOptions = [];
        })
        .finally(() => {});
    },
    getOrgTree() {
      orgTreeSelect()
        .then((response) => {
          this.orgOptions = response.data;
        })
        .catch((error) => {
          console.error("获取组织树失败:", error);
          this.orgOptions = [];
        });
    },
    async handleOrgSelect(orgId) {
      try {
        const response = await getOrgLeader(orgId);
        if (response && response.code === 200 && response.data) {
          // 将负责人的ID赋值给 nextTaskApprover
          this.queryParams.assignee = response.data.leaderId;
        } else {
          this.$message.warning("获取组织负责人失败");
        }
      } catch (error) {
        console.error("获取组织负责人失败:", error);
        this.$message.error("获取组织负责人失败：" + (error.message || "未知错误"));
      }
    },
    /**
     * 获取用户显示名称
     */
    getUserDisplayName(userId) {
      if (!userId) return "未知";
      if (this.userCache[userId]) {
        return this.userCache[userId].userName || "未知";
      }
      // 异步加载用户信息
      this.fetchUserInfo(userId);
      return "加载中...";
    },

    /**
     * 异步获取用户信息
     */
    async fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) {
        return;
      }

      try {
        const response = await getUser(userId);
        if (response && response.code === 200 && response.data) {
          this.$set(this.userCache, userId, {
            userName: response.data.userName || "未知",
          });
          // 触发重新渲染
          this.$forceUpdate();
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.$set(this.userCache, userId, {
          userName: "获取失败",
        });
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增任务";
    },
    /** 查看按钮操作 */
    handleView(row) {
      const id = row.taskId;
      getTask(id)
        .then((response) => {
          if (response.code === 200) {
            this.taskDetail = response.data;
            this.viewOpen = true;
          } else {
            this.msgError(response.msg || "获取详情失败");
          }
        })
        .catch((error) => {
          this.msgError("获取详情失败：" + error.message);
        });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除任务"' + row.taskName + '"?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return deleteTask(row.taskId);
        })
        .then((response) => {
          if (response.code === 200) {
            this.getList();
            this.msgSuccess("删除成功");
          } else {
            this.msgError(response.msg || "删除失败");
          }
        })
        .catch(() => {});
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 格式化JSON */
    formatJson(jsonStr) {
      if (!jsonStr) return "";
      try {
        const obj = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return jsonStr;
      }
    },
  },
};
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
