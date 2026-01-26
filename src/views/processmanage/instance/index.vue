<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option label="运行中" value="running" />
          <el-option label="已完成" value="completed" />
          <el-option label="失败" value="failed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >查询</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="instanceList" border>
      <el-table-column label="实例编号" align="center" prop="instanceNo" width="280" />
      <el-table-column label="工作流编号" align="center" prop="workflowNo" width="280" />
      <el-table-column
        label="工作流名称"
        align="center"
        prop="workflowName"
        width="280"
      />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'running'" type="primary">运行中</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="success"
            >已完成</el-tag
          >
          <el-tag v-else-if="scope.row.status === 'failed'" type="danger">失败</el-tag>
          <el-tag v-else-if="scope.row.status === 'cancelled'" type="warning"
            >已取消</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.completedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="250"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleDetail(scope.row)"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-cancel"
            @click="handleCancel(scope.row)"
            >取消</el-button
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
                <label>实例编号:</label>
                <span>{{ instanceData.instanceNo }}</span>
              </div>
              <div class="meta-item">
                <label>工作流编号:</label>
                <span>{{ instanceData.workflowNo }}</span>
              </div>
              <div class="meta-item">
                <label>状态:</label>
                <span :class="['status', 'status-' + instanceData.status]">
                  {{ getStatusText(instanceData.status) }}
                </span>
              </div>
              <div class="meta-item">
                <label>创建时间:</label>
                <span>{{ parseTime(instanceData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 任务处理历史 -->
          <div v-if="taskHistory && taskHistory.length > 0" class="timeline-section">
            <div class="section-title">任务处理历史</div>
            <task-history-list :task-history="taskHistory" />
          </div>

          <!-- 操作按钮 -->
          <div class="workflow-actions">
            <el-button type="primary" icon="el-icon-refresh" @click="refreshDetail"
              >刷新状态</el-button
            >
          </div>

          <!-- 最后更新时间 -->
          <div class="last-updated">
            最后更新: <span>{{ parseTime(instanceData.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 启动实例对话框 -->
    <el-dialog
      title="启动工作流实例"
      :visible.sync="startOpen"
      width="600px"
      append-to-body
    >
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
import {
  listAllInstances,
  getInstance,
  startInstance,
  getInstanceDetail,
  cancelInstance,
} from "@/api/process/instance";
import { listAllWorkflows } from "@/api/process/workflow";
import TaskHistoryList from "@/components/TaskHistoryList.vue";

export default {
  name: "WorkflowInstance",
  components: {
    TaskHistoryList,
  },
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
        pageIndex: 1,
        pageSize: 10,
        workflowId: undefined,
        status: undefined,
      },
      // 实例详情数据
      instanceData: {},
      // 活动列表
      activities: [],
      workflowOptions: [],
      // 当前查看的实例ID
      currentInstanceId: null,
      // 任务历史数据
      taskHistory: [],
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
                callback();
                return;
              }
              try {
                JSON.parse(value);
                callback();
              } catch (e) {
                callback(new Error("输入数据必须是有效的JSON格式"));
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getAllWorkflow();
  },
  beforeDestroy() {
    // 清除定时器
    this.stopAutoRefresh();
  },
  methods: {
    /** 查询实例列表 */
    getList() {
      this.loading = true;
      listAllInstances(this.queryParams)
        .then((response) => {
          if (response.code === 200) {
            this.instanceList =
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
    /** 详情按钮操作 */
    handleDetail(row) {
      // 先清空之前的数据
      this.instanceData = {};
      this.activities = [];
      this.taskHistory = [];
      this.stopAutoRefresh();

      // 设置当前实例ID
      this.currentInstanceId = row.instanceId;

      // 打开抽屉
      this.detailDrawerVisible = true;

      this.getInstance(row.instanceId);

      // 加载实例详情和任务历史
      this.loadInstanceDetail(row.instanceId);
    },

    /** 加载实例详情 */
    async getInstance(instanceId) {
      try {
        const response = await getInstance(instanceId);
        if (response && response.code === 200 && response.data) {
          // 设置实例基本信息
          this.instanceData = response.data || {};
        } else {
          this.msgError(response.msg || "获取实例详情失败");
        }
      } catch (error) {
        console.error("获取实例详情失败:", error);
        this.msgError("获取实例详情失败：" + (error.message || "未知错误"));
      } finally {
      }
    },

    /** 加载实例任务历史 */
    async loadInstanceDetail(instanceId) {
      this.detailLoading = true;
      try {
        const response = await getInstanceDetail(instanceId);
        if (response && response.code === 200 && response.data) {
          // 设置任务历史
          this.taskHistory = response.data || [];
        } else {
          this.msgError(response.msg || "获取实例任务失败");
        }
      } catch (error) {
        console.error("获取实例任务失败:", error);
        this.msgError("获取实例任务失败：" + (error.message || "未知错误"));
      } finally {
        this.detailLoading = false;
      }
    },

    /** 刷新详情 */
    refreshDetail() {
      if (this.currentInstanceId) {
        this.getInstance(this.currentInstanceId);
        this.loadInstanceDetail(this.currentInstanceId);
      }
    },
    /** 启动自动刷新 */
    startAutoRefresh(instanceId) {
      this.stopAutoRefresh();
      this.refreshTimer = setInterval(() => {
        if (this.instanceData.status === "running") {
          this.refreshDetail();
        } else {
          this.stopAutoRefresh();
        }
      }, 5000); // 每5秒刷新一次
    },
    /** 停止自动刷新 */
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    /** 关闭抽屉 */
    handleDrawerClose() {
      this.stopAutoRefresh();
      this.detailDrawerVisible = false;
      this.currentInstanceId = null;
      this.instanceData = {};
      this.activities = [];
    },
    /** 取消工作流 */
    handleCancel(row) {
      this.$confirm("确定要取消该工作流实例吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const response = await cancelInstance(row.instanceId);
          if (response && response.code === 200) {
            this.msgSuccess("实例取消成功");
            this.getList();
          } else {
            this.msgError(response.msg || "实例取消失败");
          }
        })
        .catch(() => {});
    },
    /** 获取状态文本 */
    getStatusText(status) {
      const statusMap = {
        running: "运行中",
        completed: "已完成",
        failed: "失败",
        cancelled: "已取消",
        pending: "等待中",
      };
      return statusMap[status] || status;
    },
    /** 启动实例按钮操作 */
    handleStart() {
      this.startForm = {
        input: "",
      };
      this.startOpen = true;
    },
    /** 取消启动 */
    cancelStart() {
      this.startOpen = false;
      this.resetForm("startForm");
    },
    /** 提交启动 */
    submitStart() {
      this.$refs["startForm"].validate((valid) => {
        if (valid) {
          const data = {
            workflow_id: this.workflowId,
            input: this.startForm.input || "",
          };
          startInstance(data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("启动成功");
                this.startOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg || "启动失败");
              }
            })
            .catch((error) => {
              this.msgError("启动失败：" + error.message);
            });
        }
      });
    },
    /** 返回按钮操作 */
    handleBack() {
      this.$router.push("/processmanage/workflow");
    },
  },
};
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
  background: linear-gradient(135deg, #bfc0bf 0%, #fcfdfd 100%);
  color: rgb(8, 8, 8);
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
  content: "";
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
  content: "";
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
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
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
