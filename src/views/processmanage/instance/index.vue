<template>
  <div class="app-container workflow-instance-container">
    <!-- 页面标题和统计 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">工作流实例管理</h1>
        <p class="page-subtitle">查看和管理所有工作流实例的执行状态</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">总实例数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ runningCount }}</div>
          <div class="stat-label">运行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <!-- 查询条件卡片 -->
    <div class="filter-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="filter-form" label-width="80px">
        <el-form-item label="工作流" prop="workflowId">
          <el-select
            v-model="queryParams.workflowId"
            placeholder="请选择工作流"
            clearable
            class="filter-select"
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
            class="filter-select"
          >
            <el-option label="运行中" value="running">
              <span class="status-option">
                <span class="status-dot running"></span>
                运行中
              </span>
            </el-option>
            <el-option label="已完成" value="completed">
              <span class="status-option">
                <span class="status-dot completed"></span>
                已完成
              </span>
            </el-option>
            <el-option label="失败" value="failed">
              <span class="status-option">
                <span class="status-dot failed"></span>
                失败
              </span>
            </el-option>
            <el-option label="已取消" value="cancelled">
              <span class="status-option">
                <span class="status-dot cancelled"></span>
                已取消
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery" class="search-btn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery" class="reset-btn">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="instanceList"
        class="enhanced-table"
        header-row-class-name="table-header"
        row-class-name="table-row"
        :empty-text="emptyText"
        border
        :resizable="true"
      >
        <el-table-column label="操作" align="center" width="180" fixed="left">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="text"
              icon="el-icon-view"
              @click="handleDetail(scope.row)"
            >详情</el-button>
            <el-button
              v-if="scope.row.status === 'running'"
              size="small"
              type="text"
              icon="el-icon-video-pause"
              @click="handleCancel(scope.row)"
            >取消</el-button>
          </template>
        </el-table-column>
        <el-table-column label="实例编号" align="left" prop="instanceNo" min-width="220" show-overflow-tooltip resizable>
          <template slot-scope="scope">
            <div class="cell-content">
              <i class="el-icon-document-copy cell-icon"></i>
              <span class="cell-text">{{ scope.row.instanceNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="工作流" align="left" prop="workflowName" min-width="200" show-overflow-tooltip resizable>
          <template slot-scope="scope">
            <div class="cell-content">
              <i class="el-icon-share cell-icon"></i>
              <span class="cell-text">{{ scope.row.workflowName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="140" resizable>
          <template slot-scope="scope">
            <span :class="['status-badge', `status-${scope.row.status}`]">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusText(scope.row.status) }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center" prop="startedAt" width="180" resizable>
          <template slot-scope="scope">
            <div class="time-cell">
              <i class="el-icon-time time-icon"></i>
              <span>{{ parseTime(scope.row.startedAt) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="完成时间" align="center" prop="completedAt" width="180" resizable>
          <template slot-scope="scope">
            <div class="time-cell">
              <i class="el-icon-check time-icon completed"></i>
              <span>{{ parseTime(scope.row.completedAt) || '-' }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && instanceList.length === 0" class="empty-state">
        <i class="el-icon-folder-opened empty-icon"></i>
        <p class="empty-text">暂无工作流实例数据</p>
        <p class="empty-hint">请调整筛选条件或等待新的工作流实例创建</p>
      </div>
    </div>

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
      custom-class="instance-detail-drawer"
    >
      <div v-loading="detailLoading" class="drawer-content">
        <div class="workflow-detail-container">
          <!-- 工作流头部信息卡片 -->
          <div class="task-info-card">
            <div class="task-info-grid">
              <div class="task-info-item">
                <label class="task-info-label">实例编号</label>
                <div class="task-info-value">{{ instanceData.instanceNo || '-' }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">工作流名称</label>
                <div class="task-info-value">{{ instanceData.workflowName || '-' }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">状态</label>
                <div class="task-info-value">
                  <span :class="['status-badge', `status-${instanceData.status}`]">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ getStatusText(instanceData.status) }}</span>
                  </span>
                </div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">创建时间</label>
                <div class="task-info-value">{{ parseTime(instanceData.createdAt) }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">最后更新</label>
                <div class="task-info-value">{{ parseTime(instanceData.updatedAt) }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">开始时间</label>
                <div class="task-info-value">{{ parseTime(instanceData.startedAt) }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">完成时间</label>
                <div class="task-info-value">{{ parseTime(instanceData.completedAt) || '-' }}</div>
              </div>
              <div class="task-info-item">
                <label class="task-info-label">启动人</label>
                <div class="task-info-value">{{ instanceData.startedBy || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- 任务处理历史 -->
          <div v-if="taskHistory && taskHistory.length > 0" class="history-section">
            <h3 class="section-title">
              <i class="el-icon-time"></i>
              任务处理历史
            </h3>
            <task-history-list :task-history="taskHistory" @show-media-detail="handleShowMediaDetail" />
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-timeline">
            <i class="el-icon-warning-outline empty-icon"></i>
            <p class="empty-text">暂无任务处理历史</p>
            <p class="empty-hint">工作流实例尚未开始处理</p>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button
              type="primary"
              icon="el-icon-refresh"
              @click="refreshDetail"
              class="action-btn approve-btn"
            >
              刷新状态
            </el-button>
            <el-button
              icon="el-icon-close"
              @click="handleDrawerClose"
              class="action-btn cancel-btn"
            >
              关闭
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 媒体详情对话框 -->
    <MediaDetailDialog
      :visible.sync="mediaDetailDialogVisible"
      :media-data="currentMediaData"
      @close="handleMediaDetailClose"
    />

    <!-- 启动实例对话框 -->
    <el-dialog
      title="启动工作流实例"
      :visible.sync="startOpen"
      width="650px"
      append-to-body
      custom-class="start-instance-dialog"
    >
      <el-form ref="startForm" :model="startForm" :rules="startRules" label-width="100px" class="start-form">
        <el-form-item label="工作流" prop="workflowId">
          <el-select
            v-model="workflowId"
            placeholder="请选择工作流"
            class="full-width-select"
            filterable
          >
            <el-option
              v-for="opt in workflowOptions"
              :key="opt.workflowId"
              :label="opt.name"
              :value="opt.workflowId"
            >
              <span class="workflow-option">
                <i class="el-icon-share option-icon"></i>
                <span class="option-label">{{ opt.name }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="输入数据" prop="input">
          <el-input
            v-model="startForm.input"
            type="textarea"
            :rows="10"
            placeholder='请输入输入数据(JSON格式)，例如：{"key": "value"}'
            class="json-textarea"
          />
          <div class="form-hint">
            <i class="el-icon-info"></i>
            输入数据必须是有效的JSON格式
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer enhanced-footer">
        <el-button @click="cancelStart" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitStart" class="submit-btn">
          <i class="el-icon-video-play"></i>
          启动实例
        </el-button>
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
import MediaDetailDialog from "@/components/MediaDetailDialog";

export default {
  name: "WorkflowInstance",
  components: {
    TaskHistoryList,
    MediaDetailDialog,
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
      // 媒体详情相关
      mediaDetailDialogVisible: false,
      currentMediaData: {},
      // 启动表单参数
      startForm: {
        input: '',
      },
      // 启动表单校验
      startRules: {
        workflowId: [
          { required: true, message: '请选择工作流', trigger: 'change' }
        ],
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
  computed: {
    // 运行中的实例数量
    runningCount() {
      return this.instanceList.filter(item => item.status === 'running').length;
    },
    // 已完成的实例数量
    completedCount() {
      return this.instanceList.filter(item => item.status === 'completed').length;
    },
    // 空状态文本
    emptyText() {
      if (this.queryParams.workflowId || this.queryParams.status) {
        return '没有符合条件的实例';
      }
      return '暂无工作流实例';
    }
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
    /**
     * 处理显示媒体详情
     * @param {Object} mediaData - 媒体数据
     */
    handleShowMediaDetail(mediaData) {
      if (mediaData) {
        this.currentMediaData = mediaData;
        this.mediaDetailDialogVisible = true;
      }
    },
    /**
     * 关闭媒体详情对话框
     */
    handleMediaDetailClose() {
      this.mediaDetailDialogVisible = false;
      this.currentMediaData = {};
    },
  },
};
</script>

<style scoped>
/* ==================== 容器基础样式 ==================== */
.workflow-instance-container {
  padding: 24px;
  background: #F8FAFC;
  min-height: calc(100vh - 84px);
}

/* ==================== 页面头部 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #F8FAFC;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #94A3B8;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 24px;
  min-width: 120px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #F8FAFC;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ==================== 筛选卡片 ==================== */
.filter-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-select {
  width: 200px;
}

.filter-actions {
  margin-left: auto;
  margin-bottom: 0 !important;
}

.search-btn {
  background: linear-gradient(135deg, #0369A1 0%, #075985 100%);
  border: none;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
}

.reset-btn {
  border-color: #CBD5E1;
  color: #64748B;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  border-color: #94A3B8;
  color: #0F172A;
  background: #F8FAFC;
}

/* 状态选项样式 */
.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.running {
  background: #0369A1;
}

.status-dot.completed {
  background: #22C55E;
}

.status-dot.failed {
  background: #EF4444;
}

.status-dot.cancelled {
  background: #94A3B8;
}

/* ==================== 数据表格 ==================== */
.table-container {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.enhanced-table {
  border: 1px solid #E2E8F0;
}

.enhanced-table >>> .table-header {
  background: #F8FAFC;
}

.enhanced-table >>> .table-header th {
  background: transparent;
  border-bottom: 2px solid #E2E8F0;
  border-right: 1px solid #E2E8F0;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 12px;
}

.enhanced-table >>> .table-header th:last-child {
  border-right: none;
}

.enhanced-table >>> .table-row {
  transition: all 0.2s ease;
  cursor: pointer;
}

.enhanced-table >>> .table-row:hover {
  background: #F8FAFC;
}

.enhanced-table >>> .table-row td {
  border-bottom: 1px solid #F1F5F9;
  border-right: 1px solid #F1F5F9;
  padding: 16px 12px;
  color: #334155;
  font-size: 14px;
}

.enhanced-table >>> .table-row td:last-child {
  border-right: none;
}

/* 列宽调整手柄样式 */
.enhanced-table >>> .el-table__column-resize-proxy {
  background-color: #0369A1;
  width: 2px;
}

.enhanced-table >>> th.is-resizable:hover {
  cursor: col-resize;
}

.enhanced-table >>> th.is-resizable:hover::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #0369A1;
}

/* 单元格内容样式 */
.cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cell-icon {
  color: #94A3B8;
  font-size: 16px;
}

.cell-text {
  color: #0F172A;
  font-weight: 500;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #64748B;
  font-size: 13px;
}

.time-icon {
  color: #94A3B8;
}

.time-icon.completed {
  color: #22C55E;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-text {
  white-space: nowrap;
}

.status-badge.status-running {
  background: rgba(3, 105, 161, 0.1);
  color: #0369A1;
  border: 1px solid rgba(3, 105, 161, 0.2);
}

.status-badge.status-running .status-dot {
  background: #0369A1;
  box-shadow: 0 0 0 2px rgba(3, 105, 161, 0.2);
}

.status-badge.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.status-completed .status-dot {
  background: #22C55E;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.status-badge.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-badge.status-failed .status-dot {
  background: #EF4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-badge.status-cancelled {
  background: rgba(148, 163, 184, 0.1);
  color: #64748B;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.status-badge.status-cancelled .status-dot {
  background: #64748B;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.2);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.action-btn {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-btn .btn-text {
  white-space: nowrap;
}

.detail-btn {
  color: #0369A1;
}

.detail-btn:hover {
  background: rgba(3, 105, 161, 0.1);
}

.cancel-btn {
  color: #EF4444;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #CBD5E1;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #64748B;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}

/* ==================== 抽屉样式 ==================== */
.drawer-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.workflow-detail-container {
  max-width: 100%;
  margin: 0 auto;
}

/* ==================== 任务信息卡片 ==================== */
.task-info-card {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.1);
}

.task-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.task-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-info-label {
  font-size: 12px;
  font-weight: 500;
  color: #94A3B8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.task-info-value {
  font-size: 14px;
  font-weight: 500;
  color: #F8FAFC;
}

/* ==================== 状态徽章 ==================== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-badge.status-running {
  background: rgba(3, 105, 161, 0.1);
  color: #0369A1;
  border: 1px solid rgba(3, 105, 161, 0.2);
}

.status-badge.status-running .status-dot {
  background: #0369A1;
  box-shadow: 0 0 0 2px rgba(3, 105, 161, 0.2);
}

.status-badge.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.status-completed .status-dot {
  background: #22C55E;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.status-badge.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-badge.status-failed .status-dot {
  background: #EF4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-badge.status-cancelled {
  background: rgba(148, 163, 184, 0.1);
  color: #64748B;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.status-badge.status-cancelled .status-dot {
  background: #64748B;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.2);
}

.status-badge.status-pending {
  background: rgba(234, 179, 8, 0.1);
  color: #EAB308;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.status-badge.status-pending .status-dot {
  background: #EAB308;
  box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
}

/* ==================== 章节标题 ==================== */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #E2E8F0;
}

.section-title i {
  color: #0369A1;
}

/* ==================== 历史区域 ==================== */
.history-section {
  margin-bottom: 24px;
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px dashed #CBD5E1;
}

.empty-timeline .empty-icon {
  font-size: 48px;
  color: #CBD5E1;
  margin-bottom: 12px;
}

.empty-timeline .empty-text {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 4px 0;
}

.empty-timeline .empty-hint {
  font-size: 12px;
  color: #94A3B8;
  margin: 0;
}

/* ==================== 表单操作按钮 ==================== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.form-actions .action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
  justify-content: center;
}

.form-actions .approve-btn {
  background: linear-gradient(135deg, #0369A1 0%, #075985 100%);
  border: none;
  color: #FFFFFF;
}

.form-actions .approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.3);
}

.form-actions .cancel-btn {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: #64748B;
}

.form-actions .cancel-btn:hover {
  border-color: #94A3B8;
  color: #0F172A;
  background: #F8FAFC;
}

/* ==================== 抽屉滚动条样式 ==================== */
.drawer-content::-webkit-scrollbar {
  width: 8px;
}

.drawer-content::-webkit-scrollbar-track {
  background: #F8FAFC;
  border-radius: 4px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

.workflow-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-label i {
  font-size: 14px;
}

.meta-value {
  font-size: 14px;
  color: #F8FAFC;
  font-weight: 500;
}

/* 时间线区域 */
.timeline-section {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #F1F5F9;
}

/* ==================== 启动对话框 ==================== */
.start-instance-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #F8FAFC;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.start-instance-dialog >>> .el-dialog__title {
  color: #F8FAFC;
  font-weight: 600;
}

.start-instance-dialog >>> .el-dialog__body {
  padding: 24px;
}

.start-instance-dialog >>> .el-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
}

.start-form .full-width-select {
  width: 100%;
}

.workflow-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  color: #94A3B8;
}

.option-label {
  color: #0F172A;
}

.json-textarea >>> .el-textarea__inner {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  transition: all 0.2s ease;
}

.json-textarea >>> .el-textarea__inner:focus {
  border-color: #0369A1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #64748B;
}

.form-hint i {
  color: #0369A1;
}

.enhanced-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.submit-btn {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  border: none;
  color: #FFFFFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.cancel-btn {
  border-color: #CBD5E1;
  color: #64748B;
  padding: 10px 24px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: #94A3B8;
  color: #0F172A;
  background: #F8FAFC;
}

/* ==================== 分页组件 ==================== */
.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-stats {
    width: 100%;
    justify-content: center;
  }

  .task-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .workflow-instance-container {
    padding: 16px;
  }

  .page-header {
    padding: 20px;
  }

  .header-stats {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1;
    min-width: 100px;
    padding: 12px 16px;
  }

  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    display: flex;
    gap: 8px;
  }

  .filter-actions .el-button {
    flex: 1;
  }

  .task-info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .action-btn {
    width: 100%;
  }

  .drawer-content {
    padding: 16px;
  }
}

/* ==================== 动画 ==================== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workflow-instance-container > * {
  animation: slideIn 0.3s ease-out;
}

/* ==================== 过渡效果 ==================== */
.stat-card,
.filter-card,
.table-container,
.timeline-section,
.workflow-header {
  transition: all 0.3s ease;
}
</style>
