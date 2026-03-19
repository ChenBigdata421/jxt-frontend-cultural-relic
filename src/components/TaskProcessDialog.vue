<template>
  <el-dialog
    :title="'处理任务 - ' + processForm.taskName"
    :visible.sync="visible"
    width="1000px"
    append-to-body
    @close="handleClose"
    custom-class="task-process-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <!-- 任务基本信息卡片 -->
    <div class="task-info-card">
      <div class="task-info-grid">
        <div class="task-info-item">
          <label class="task-info-label">任务名称</label>
          <div class="task-info-value">{{ processForm.taskName }}</div>
        </div>
        <div class="task-info-item">
          <label class="task-info-label">流程名称</label>
          <div class="task-info-value">{{ processForm.workflowName }}</div>
        </div>
        <div class="task-info-item">
          <label class="task-info-label">优先级</label>
          <div class="task-info-value">
            <span
              :class="['priority-badge', `priority-${processForm.priority}`]"
            >
              {{ getPriorityText(processForm.priority) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 驳回信息 -->
    <div v-if="processForm.rejectionInfo" class="rejection-alert" role="alert" aria-live="polite">
      <div class="rejection-header">
        <i class="el-icon-warning-outline"></i>
        <span class="rejection-title">驳回信息</span>
      </div>
      <div class="rejection-content">
        <div class="rejection-row">
          <span class="rejection-label">驳回人:</span>
          <span class="rejection-value">{{ processForm.rejectionInfo.rejectedBy }}</span>
        </div>
        <div class="rejection-row">
          <span class="rejection-label">驳回时间:</span>
          <span class="rejection-value">{{ processForm.rejectionInfo.rejectedAt }}</span>
        </div>
        <div class="rejection-row">
          <span class="rejection-label">驳回原因:</span>
          <span class="rejection-value">{{ processForm.rejectionInfo.rejectionReason }}</span>
        </div>
      </div>
    </div>

    <el-form
      ref="taskProcessForm"
      :model="processForm"
      :rules="processRules"
      label-width="120px"
      class="task-form"
    >
      <!-- 流程处理历史 -->
      <div
        v-if="processForm.previousTasksHistory && processForm.previousTasksHistory.length > 0"
        class="history-section"
      >
        <h3 class="section-title">
          <i class="el-icon-time"></i>
          流程处理历史
        </h3>
        <div class="history-timeline">
          <div
            v-for="(history, index) in processForm.previousTasksHistory"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-dot" :class="`status-${history.result === '通过' || history.result === '完成' ? 'approved' : 'rejected'}`"></div>
            <div class="timeline-content">
              <div class="timeline-card">
                <div class="timeline-header">
                  <div class="timeline-title">
                    <span class="timeline-number">{{ index + 1 }}</span>
                    <span class="timeline-name">{{ history.taskName }}</span>
                  </div>
                  <span
                    :class="['status-badge', `status-${history.result === '通过' || history.result === '完成' ? 'approved' : 'rejected'}`]"
                  >
                    {{ history.result }}
                  </span>
                </div>

                <!-- 处理意见 -->
                <div v-if="history.comment" class="timeline-comment">
                  <div class="comment-label">处理意见</div>
                  <div class="comment-content">{{ history.comment }}</div>
                </div>

                <!-- 表单字段数据 -->
                <div v-if="history.output && Object.keys(history.output).length > 0" class="timeline-output">
                  <div class="output-label">提交信息</div>
                  <div class="output-grid">
                    <div
                      v-for="(value, key) in history.output"
                      :key="key"
                      class="output-item"
                    >
                      <span class="output-item-label">{{ getFieldLabel(key) }}</span>
                      <span class="output-item-value">
                        <!-- 媒体名称字段：显示为可点击链接 -->
                        <template v-if="isMediaNameField(key)">
                          <el-button
                            type="text"
                            class="media-link"
                            @click="handleMediaNameClick(value)"
                          >
                            {{ value || "-" }}
                          </el-button>
                        </template>
                        <!-- 布尔类型字段 -->
                        <template v-else-if="typeof value === 'boolean'">
                          <span :class="['boolean-badge', value ? 'true' : 'false']">
                            {{ value ? '是' : '否' }}
                          </span>
                        </template>
                        <!-- 默认文本显示 -->
                        <template v-else>
                          {{ value }}
                        </template>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 处理人信息 -->
                <div class="timeline-footer">
                  <span class="footer-item">
                    <i class="el-icon-user"></i>
                    {{ getUserDisplayName(history.assignee) }}
                  </span>
                  <span class="footer-item">
                    <i class="el-icon-office-building"></i>
                    {{ getUserOrgName(history.assignee) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 动态表单字段 -->
      <div class="form-section">
        <h3 class="section-title">
          <i class="el-icon-edit"></i>
          填写信息
        </h3>
        <div v-if="processForm.formFields && processForm.formFields.length > 0" class="form-fields-grid">
          <el-form-item
            v-for="field in processForm.formFields"
            :key="field"
            :label="getFieldLabel(field)"
            :prop="'formData.' + field"
            :required="true"
            class="enhanced-form-item"
          >
            <!-- 日期类型字段 -->
            <el-date-picker
              v-if="getFieldType(field) === 'date'"
              v-model="processForm.formData[field]"
              type="date"
              :placeholder="getFieldPlaceholder(field)"
              value-format="yyyy-MM-dd"
              class="full-width-input"
              popper-class="date-picker-popper"
            />
            <!-- 日期时间类型字段 -->
            <el-date-picker
              v-else-if="getFieldType(field) === 'datetime'"
              v-model="processForm.formData[field]"
              type="datetime"
              :placeholder="getFieldPlaceholder(field)"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="full-width-input"
              popper-class="date-picker-popper"
            />
            <!-- 时间类型字段 -->
            <el-time-picker
              v-else-if="getFieldType(field) === 'time'"
              v-model="processForm.formData[field]"
              :placeholder="getFieldPlaceholder(field)"
              value-format="HH:mm:ss"
              class="full-width-input"
              popper-class="date-picker-popper"
            />
            <!-- 数字类型字段 -->
            <el-input-number
              v-else-if="getFieldType(field) === 'number'"
              v-model="processForm.formData[field]"
              :placeholder="getFieldPlaceholder(field)"
              class="full-width-input"
              :controls="true"
            />
            <!-- 布尔类型字段使用开关 -->
            <el-switch
              v-else-if="getFieldType(field) === 'boolean'"
              v-model="processForm.formData[field]"
              active-text="是"
              inactive-text="否"
            />
            <!-- 文本域类型字段 -->
            <el-input
              v-else-if="getFieldType(field) === 'textarea'"
              v-model="processForm.formData[field]"
              type="textarea"
              :rows="3"
              :placeholder="getFieldPlaceholder(field)"
              class="enhanced-textarea"
            />
            <!-- 邮箱类型字段 -->
            <el-input
              v-else-if="getFieldType(field) === 'email'"
              v-model="processForm.formData[field]"
              type="email"
              :placeholder="getFieldPlaceholder(field)"
              clearable
              class="enhanced-input"
            >
              <template slot="prefix">
                <i class="el-icon-message"></i>
              </template>
            </el-input>
            <!-- 电话类型字段 -->
            <el-input
              v-else-if="getFieldType(field) === 'tel'"
              v-model="processForm.formData[field]"
              type="tel"
              :placeholder="getFieldPlaceholder(field)"
              clearable
              class="enhanced-input"
            >
              <template slot="prefix">
                <i class="el-icon-phone"></i>
              </template>
            </el-input>
            <!-- URL类型字段 -->
            <el-input
              v-else-if="getFieldType(field) === 'url'"
              v-model="processForm.formData[field]"
              type="url"
              :placeholder="getFieldPlaceholder(field)"
              clearable
              class="enhanced-input"
            >
              <template slot="prefix">
                <i class="el-icon-link"></i>
              </template>
            </el-input>
            <treeselect
              v-else-if="getFieldType(field) === 'approver'"
              :options="orgOptions"
              placeholder="请选择审批组织"
              class="full-width-input"
              clearable
              @input="handleOrgSelect($event, field)"
            />
            <!-- 默认文本输入框 -->
            <el-input
              v-else
              v-model="processForm.formData[field]"
              :placeholder="getFieldPlaceholder(field)"
              clearable
              class="enhanced-input"
            />
          </el-form-item>
        </div>

        <!-- 如果没有定义 form_fields，显示传统的输出数据输入框 -->
        <el-form-item v-else label="输出数据" prop="output" class="enhanced-form-item">
          <el-input
            v-model="processForm.output"
            type="textarea"
            :rows="4"
            placeholder="请输入输出数据(JSON格式)"
            class="enhanced-textarea"
          />
        </el-form-item>

        <!-- 处理意见 -->
        <el-form-item label="处理意见" prop="comment" class="enhanced-form-item">
          <el-input
            v-model="processForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入处理意见（选填）"
            class="enhanced-textarea"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer enhanced-footer">
      <el-button
        type="success"
        class="action-btn approve-btn"
        :loading="isSubmitting"
        @click="handleApprove"
      >
        <i class="el-icon-check"></i>
        {{ isFirstStep ? "提交申请" : "通过" }}
      </el-button>
      <el-button
        type="danger"
        class="action-btn reject-btn"
        :loading="isSubmitting"
        @click="handleReject"
      >
        <i class="el-icon-close"></i>
        {{ isFirstStep ? "撤销" : "驳回" }}
      </el-button>
      <el-button class="action-btn cancel-btn" @click="handleClose">
        取消
      </el-button>
    </div>

    <!-- 媒体详情对话框 -->
    <MediaDetailDialog
      :visible.sync="mediaDetailDialogVisible"
      :media-data="currentMediaData"
      @close="handleMediaDetailClose"
    />
  </el-dialog>
</template>

<script>
import workflowMixin from "@/mixins/workflowMixin";
import { orgTreeSelect, getOrgLeader } from "@/api/admin/sys-org";
import { getUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import { cancelTask } from "@/api/process/task";
import { cancelInstance } from "@/api/process/instance";
import { GetMediaByName } from "@/api/evidence/evidence_manage_query_api";
import MediaDetailDialog from "@/components/MediaDetailDialog";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "TaskProcessDialog",
  components: {
    Treeselect,
    MediaDetailDialog,
  },
  mixins: [workflowMixin],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      visible: this.value,
      isClosing: false,
      isNormalClose: false, // 标记是否为正常完成（通过/驳回），而非取消
      isSubmitting: false, // 提交状态
      orgOptions: [], // 组织树选项
      userCache: {}, // 用户信息缓存，避免重复请求
      // 媒体详情相关
      mediaDetailDialogVisible: false, // 媒体详情对话框显示状态
      currentMediaData: {}, // 当前查看的媒体数据
    };
  },
  created() {
    this.getOrgTree();
  },
  watch: {
    value(val) {
      //val：value变化后的新值
      this.visible = val;
      if (val && this.taskId) {
        this.loadTask();
      }
    },
    visible(val) {
      this.$emit("input", val);
    },
  },
  methods: {
    /**
     * 获取组织树
     */
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

    /**
     * 加载任务
     */
    async loadTask() {
      await this.loadTaskForProcessing(this.taskId, () => {
        // 任务加载完成
      });
    },

    /**
     * 处理通过
     */
    async handleApprove() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      try {
        await this.submitTaskApproval("taskProcessForm", () => {
          this.isNormalClose = true; // 标记为正常完成
          this.visible = false;
          this.$emit("success");
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * 处理驳回
     */
    async handleReject() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      try {
        if (this.isFirstStep) {
          const response = await cancelTask(this.currentTaskId);
          if (response.code === 200) {
            this.msgSuccess("任务已撤销");
          } else {
            this.msgError(response.msg || "任务撤销失败");
          }
          response = await cancelInstance(this.currentInstanceId);
          if (response.code === 200) {
            this.msgSuccess("实例已取消");
          } else {
            this.msgError(response.msg || "实例取消失败");
          }
        } else {
          await this.submitTaskRejection("taskProcessForm", () => {
            this.isNormalClose = true; // 标记为正常完成
            this.visible = false;
            this.$emit("success");
          });
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * 处理组织选择事件
     * 当用户从下拉列表中选中一个组织时，获取该组织的名称和负责人
     */
    handleOrgSelect(orgId, field) {
      if (!orgId) {
        // 如果清空选择，则清空对应的表单字段
        this.processForm.formData[field] = null;
        this.processForm.nextTaskApprover = null;
        return;
      }

      // 从组织树中查找选中组织的名称
      const orgName = this.findOrgName(orgId);
      if (orgName) {
        this.processForm.formData[field] = orgName;
      }

      // 调用获取组织负责人的API
      this.getOrgLeaderInfo(orgId, field);
    },

    /**
     * 从组织树中递归查找组织名称
     */
    findOrgName(orgId) {
      const search = (options) => {
        for (const opt of options) {
          if (opt.id === orgId) {
            return opt.label;
          }
          if (Array.isArray(opt.children) && opt.children.length > 0) {
            const found = search(opt.children);
            if (found) return found;
          }
        }
        return null;
      };
      return search(this.orgOptions);
    },

    /**
     * 获取组织负责人信息
     */
    async getOrgLeaderInfo(orgId, field) {
      try {
        const response = await getOrgLeader(orgId);
        if (response && response.code === 200 && response.data) {
          // 将负责人的ID赋值给 nextTaskApprover
          this.processForm.nextTaskApprover = response.data.leaderId;
        } else {
          this.$message.warning("获取组织负责人失败，请手动选择");
        }
      } catch (error) {
        console.error("获取组织负责人失败:", error);
        this.$message.error("获取组织负责人失败：" + (error.message || "未知错误"));
      }
    },

    /**
     * 关闭对话框
     */
    async handleClose() {
      // 防止重复执行
      if (this.isClosing) {
        return;
      }
      this.isClosing = true;

      try {
        // 如果是正常完成（通过/驳回），关闭对话框
        if (this.isNormalClose) {
          this.visible = false;
          this.$emit("close");
          return;
        }

        this.$message.info("请在'我的待办'中处理任务！");
        this.$emit("close");
      } catch (error) {
        if (error !== "cancel") {
          this.msgError(error.message || "删除失败");
        }
        this.$emit("close");
      } finally {
        this.visible = false;
        // 延迟重置标志位，确保对话框完全关闭后才允许再次打开
        this.$nextTick(() => {
          this.isClosing = false;
          this.isNormalClose = false; // 重置标志位
        });
      }
    },

    /**
     * 处理媒体名称点击事件
     * @param {String} mediaName - 媒体名称
     */
    async handleMediaNameClick(mediaName) {
      if (!mediaName) {
        this.$message.warning("媒体名称不存在");
        return;
      }

      try {
        // 根据媒体名称获取完整媒体数据
        const response = await GetMediaByName(mediaName);

        if (response.code === 200 && response.data) {
          this.currentMediaData = response.data;
          this.mediaDetailDialogVisible = true;
        } else {
          this.$message.warning(response.msg || "获取媒体详情失败");
        }
      } catch (error) {
        console.error("获取媒体详情失败:", error);
        this.$message.error("获取媒体详情失败");
      }
    },

    /**
     * 关闭媒体详情对话框
     */
    handleMediaDetailClose() {
      this.mediaDetailDialogVisible = false;
      this.currentMediaData = {};
    },

    /**
     * 判断是否为媒体名称字段
     */
    isMediaNameField(key) {
      return key === "mediaName" || key === "media_name";
    },

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
      const priorityMap = {
        high: '高',
        medium: '中',
        low: '低'
      };
      return priorityMap[priority] || '中';
    },
  },
};
</script>

<style scoped>
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
  gap: 24px;
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
  font-size: 16px;
  font-weight: 600;
  color: #F8FAFC;
}

/* ==================== 优先级徽章 ==================== */
.priority-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.priority-high {
  background: rgba(220, 38, 38, 0.15);
  color: #FCA5A5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.priority-medium {
  background: rgba(234, 179, 8, 0.15);
  color: #FDE047;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.priority-low {
  background: rgba(148, 163, 184, 0.15);
  color: #CBD5E1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* ==================== 驳回信息 ==================== */
.rejection-alert {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.rejection-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #DC2626;
  font-size: 16px;
  font-weight: 600;
}

.rejection-title {
  line-height: 1;
}

.rejection-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rejection-row {
  display: flex;
  gap: 12px;
}

.rejection-label {
  font-weight: 500;
  color: #7F1D1D;
  min-width: 80px;
}

.rejection-value {
  color: #991B1B;
  flex: 1;
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

/* ==================== 历史时间线 ==================== */
.history-section {
  margin-bottom: 32px;
}

.history-timeline {
  position: relative;
  padding-left: 32px;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -32px;
  top: 20px;
  width: 2px;
  height: calc(100% + 4px);
  background: #E2E8F0;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #F8FAFC;
  z-index: 1;
}

.timeline-dot.status-approved {
  background: #22C55E;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

.timeline-dot.status-rejected {
  background: #EF4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.timeline-content {
  flex: 1;
}

.timeline-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #CBD5E1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #0F172A;
  color: #F8FAFC;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.timeline-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.status-badge.status-approved {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* ==================== 时间线内容 ==================== */
.timeline-comment,
.timeline-output {
  margin-bottom: 16px;
}

.comment-label,
.output-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-content {
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 8px;
  color: #475569;
  line-height: 1.6;
  border-left: 3px solid #0369A1;
}

.output-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.output-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.output-item:hover {
  background: #F1F5F9;
}

.output-item-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
}

.output-item-value {
  font-size: 14px;
  color: #0F172A;
  word-break: break-word;
}

.boolean-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.boolean-badge.true {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.boolean-badge.false {
  background: rgba(148, 163, 184, 0.1);
  color: #64748B;
}

.media-link {
  padding: 0;
  color: #0369A1;
  font-weight: 500;
  transition: color 0.2s ease;
}

.media-link:hover {
  color: #075985;
  text-decoration: underline;
}

.timeline-footer {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
}

.footer-item i {
  font-size: 14px;
}

/* ==================== 表单区域 ==================== */
.form-section {
  margin-bottom: 24px;
}

.form-fields-grid {
  display: grid;
  gap: 20px;
}

.enhanced-form-item {
  margin-bottom: 20px;
}

.enhanced-form-item >>> .el-form-item__label {
  font-weight: 500;
  color: #0F172A;
  font-size: 14px;
}

.full-width-input {
  width: 100%;
}

.enhanced-input >>> .el-input__inner {
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  transition: all 0.2s ease;
  padding-left: 36px;
}

.enhanced-input >>> .el-input__inner:focus {
  border-color: #0369A1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

.enhanced-input >>> .el-input__prefix {
  left: 10px;
  color: #94A3B8;
}

.enhanced-textarea >>> .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1.6;
}

.enhanced-textarea >>> .el-textarea__inner:focus {
  border-color: #0369A1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
}

/* ==================== 底部操作按钮 ==================== */
.enhanced-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.action-btn {
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

.action-btn.approve-btn {
  background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
  border: none;
  color: #FFFFFF;
}

.action-btn.approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-btn.reject-btn {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  border: none;
  color: #FFFFFF;
}

.action-btn.reject-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn.cancel-btn {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: #64748B;
}

.action-btn.cancel-btn:hover {
  border-color: #94A3B8;
  color: #0F172A;
  background: #F8FAFC;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .task-info-grid {
    grid-template-columns: 1fr;
  }

  .output-grid {
    grid-template-columns: 1fr;
  }

  .timeline-footer {
    flex-direction: column;
    gap: 8px;
  }

  .enhanced-footer {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

/* ==================== 动画 ==================== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-process-dialog >>> .el-dialog__body {
  animation: slideIn 0.3s ease-out;
}

/* ==================== 滚动条样式 ==================== */
.task-process-dialog >>> .el-dialog__body::-webkit-scrollbar {
  width: 8px;
}

.task-process-dialog >>> .el-dialog__body::-webkit-scrollbar-track {
  background: #F8FAFC;
  border-radius: 4px;
}

.task-process-dialog >>> .el-dialog__body::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: 4px;
}

.task-process-dialog >>> .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}
</style>
