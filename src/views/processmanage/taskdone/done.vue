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
      <el-table-column label="流程名称" align="center" prop="workflowName" width="150" />
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
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="150"
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
            icon="el-icon-document"
            @click="handleViewHistory(scope.row)"
            >历史</el-button
          >
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
    <el-dialog title="任务详情" :visible.sync="viewOpen" width="800px" append-to-body>
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
    <el-dialog title="任务历史" :visible.sync="historyOpen" width="900px" append-to-body>
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
              <el-tag v-if="item.result === 'approved'" type="success" size="small"
                >通过</el-tag
              >
              <el-tag v-else-if="item.result === 'rejected'" type="danger" size="small"
                >驳回</el-tag
              >
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
  </div>
</template>

<script>
import { listMyDoneTasks, getTask, getTaskHistory } from "@/api/process/task";
import { getUser } from "@/api/admin/sys-user";
export default {
  name: "DoneTask",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      userCache: {}, // 用户信息缓存，避免重复请求
      // 任务列表
      taskList: [],
      // 是否显示查看对话框
      viewOpen: false,
      // 是否显示历史对话框
      historyOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined,
      },
      // 任务详情
      taskDetail: {},
      // 历史列表
      historyList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询任务列表 */
    getList() {
      this.loading = true;
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
        task_name: this.queryParams.taskName,
        workflow_name: this.queryParams.workflowName,
      };
      listMyDoneTasks(params)
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
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
    /** 查看历史按钮操作 */
    handleViewHistory(row) {
      getTaskHistory(row.taskId)
        .then((response) => {
          if (response.code === 200) {
            this.historyList = response.data || [];
            this.historyOpen = true;
          } else {
            this.msgError(response.msg || "获取历史失败");
          }
        })
        .catch((error) => {
          this.msgError("获取历史失败：" + error.message);
        });
    },
    /** 获取时间线类型 */
    getTimelineType(result) {
      if (result === "approved") return "success";
      if (result === "rejected") return "danger";
      return "primary";
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
     * 获取用户组织名称
     */
    getUserOrgName(userId) {
      if (!userId) return "未知";
      if (this.userCache[userId]) {
        return this.userCache[userId].orgFullName || "未知";
      }
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
            orgFullName: response.data.orgFullName || "未知",
          });
          // 触发重新渲染
          this.$forceUpdate();
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.$set(this.userCache, userId, {
          userName: "获取失败",
          orgFullName: "获取失败",
        });
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
