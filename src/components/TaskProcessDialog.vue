<template>
  <el-dialog
    :title="'处理任务 - ' + processForm.task_name"
    :visible.sync="visible"
    width="900px"
    append-to-body
    @close="handleClose"
  >
    <el-form
      ref="taskProcessForm"
      :model="processForm"
      :rules="processRules"
      label-width="120px"
    >
      <!-- 任务基本信息 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="任务名称">
            <span>{{ processForm.task_name }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="流程名称">
            <span>{{ processForm.workflow_name }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级">
            <el-tag v-if="processForm.priority === 'high'" type="danger"
              >高</el-tag
            >
            <el-tag v-else-if="processForm.priority === 'low'" type="info"
              >低</el-tag
            >
            <el-tag v-else type="warning">中</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 驳回信息 -->
      <el-alert
        v-if="processForm.rejection_info"
        title="驳回信息"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div>
          <p>
            <strong>驳回人:</strong>
            {{ processForm.rejection_info.rejected_by }}
          </p>
          <p>
            <strong>驳回时间:</strong>
            {{ processForm.rejection_info.rejected_at }}
          </p>
          <p>
            <strong>驳回原因:</strong>
            {{ processForm.rejection_info.rejection_reason }}
          </p>
        </div>
      </el-alert>

      <!-- 流程处理历史 -->
      <div
        v-if="
          processForm.previous_tasks_history &&
          processForm.previous_tasks_history.length > 0
        "
        style="margin-bottom: 20px"
      >
        <el-divider>流程处理历史</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in processForm.previous_tasks_history"
            :key="index"
            :timestamp="history.completed_at"
            placement="top"
          >
            <el-card shadow="hover" style="margin-bottom: 10px">
              <div
                slot="header"
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                "
              >
                <span style="font-weight: bold; font-size: 16px">
                  {{ index + 1 }}. {{ history.task_name }}
                </span>
                <el-tag
                  :type="
                    history.result === '通过' || history.result === '完成'
                      ? 'success'
                      : 'danger'
                  "
                  size="small"
                >
                  {{ history.result }}
                </el-tag>
              </div>

              <!-- 处理意见 -->
              <div v-if="history.comment" style="margin-bottom: 15px">
                <div
                  style="color: #909399; font-size: 12px; margin-bottom: 5px"
                >
                  处理意见：
                </div>
                <div
                  style="
                    padding: 10px;
                    background-color: #f5f7fa;
                    border-radius: 4px;
                    color: #606266;
                  "
                >
                  {{ history.comment }}
                </div>
              </div>

              <!-- 表单字段数据 -->
              <div
                v-if="history.output && Object.keys(history.output).length > 0"
              >
                <div
                  style="color: #909399; font-size: 12px; margin-bottom: 5px"
                >
                  提交信息：
                </div>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item
                    v-for="(value, key) in history.output"
                    :key="key"
                    :label="getFieldLabel(key)"
                  >
                    <template v-if="typeof value === 'boolean'">
                      <el-tag v-if="value" type="success">是</el-tag>
                      <el-tag v-else type="info">否</el-tag>
                    </template>
                    <template v-else>
                      {{ value }}
                    </template>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <!-- 处理人信息 -->
              <div style="margin-top: 10px; color: #909399; font-size: 12px">
                处理人：{{ history.assignee }}
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 动态表单字段 -->
      <el-divider>填写信息</el-divider>
      <template
        v-if="processForm.form_fields && processForm.form_fields.length > 0"
      >
        <el-form-item
          v-for="field in processForm.form_fields"
          :key="field"
          :label="getFieldLabel(field)"
          :prop="'formData.' + field"
          :required="true"
        >
          <!-- 日期类型字段 -->
          <el-date-picker
            v-if="getFieldType(field) === 'date'"
            v-model="processForm.formData[field]"
            type="date"
            :placeholder="getFieldPlaceholder(field)"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
          <!-- 日期时间类型字段 -->
          <el-date-picker
            v-else-if="getFieldType(field) === 'datetime'"
            v-model="processForm.formData[field]"
            type="datetime"
            :placeholder="getFieldPlaceholder(field)"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
          <!-- 时间类型字段 -->
          <el-time-picker
            v-else-if="getFieldType(field) === 'time'"
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
          <!-- 数字类型字段 -->
          <el-input-number
            v-else-if="getFieldType(field) === 'number'"
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
            style="width: 100%"
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
          />
          <!-- 邮箱类型字段 -->
          <el-input
            v-else-if="getFieldType(field) === 'email'"
            v-model="processForm.formData[field]"
            type="email"
            :placeholder="getFieldPlaceholder(field)"
            clearable
          />
          <!-- 电话类型字段 -->
          <el-input
            v-else-if="getFieldType(field) === 'tel'"
            v-model="processForm.formData[field]"
            type="tel"
            :placeholder="getFieldPlaceholder(field)"
            clearable
          />
          <!-- URL类型字段 -->
          <el-input
            v-else-if="getFieldType(field) === 'url'"
            v-model="processForm.formData[field]"
            type="url"
            :placeholder="getFieldPlaceholder(field)"
            clearable
          />
          <!-- 默认文本输入框 -->
          <el-input
            v-else
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
            clearable
          />
        </el-form-item>
      </template>

      <!-- 如果没有定义 form_fields，显示传统的输出数据输入框 -->
      <el-form-item v-else label="输出数据" prop="output">
        <el-input
          v-model="processForm.output"
          type="textarea"
          :rows="4"
          placeholder="请输入输出数据(JSON格式)"
        />
      </el-form-item>

      <!-- 处理意见 -->
      <el-form-item label="处理意见" prop="comment">
        <el-input
          v-model="processForm.comment"
          type="textarea"
          :rows="3"
          placeholder="请输入处理意见"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="success" @click="handleApprove">通过</el-button>
      <el-button type="danger" :disabled="isFirstTask" @click="handleReject">
        驳回{{ isFirstTask ? "（第一个任务不可驳回）" : "" }}
      </el-button>
      <el-button @click="handleClose">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import workflowMixin from "@/mixins/workflowMixin";
import { deleteTask } from "@/api/process/task";
import { deleteInstance } from "@/api/process/instance";

export default {
  name: "TaskProcessDialog",
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
    };
  },
  watch: {
    value(val) {
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
    handleApprove() {
      this.submitTaskApproval("taskProcessForm", () => {
        this.isNormalClose = true; // 标记为正常完成
        this.visible = false;
        this.$emit("success");
      });
    },

    /**
     * 处理驳回
     */
    handleReject() {
      this.submitTaskRejection("taskProcessForm", () => {
        this.isNormalClose = true; // 标记为正常完成
        this.visible = false;
        this.$emit("success");
      });
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
        // 如果是正常完成（通过/驳回），不执行删除操作，直接关闭
        if (this.isNormalClose) {
          this.visible = false;
          this.$emit("close");
          return;
        }

        // 以下是取消操作的逻辑：删除任务和实例
        const taskId = this.currentTaskId;
        const instanceId = this.currentInstanceId;

        // 如果没有任务ID或实例ID，直接关闭
        if (!taskId && !instanceId) {
          this.visible = false;
          this.$emit("close");
          return;
        }

        // 删除任务
        if (taskId) {
          const taskResponse = await deleteTask(taskId);
          if (taskResponse.code !== 200) {
            throw new Error(taskResponse.msg || "删除任务失败");
          }
        }

        // 删除实例
        if (instanceId) {
          const instanceResponse = await deleteInstance(instanceId);
          if (instanceResponse.code !== 200) {
            throw new Error(instanceResponse.msg || "删除实例失败");
          }
        }
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
  },
};
</script>

<style scoped>
.el-timeline {
  padding-left: 0;
}
</style>


