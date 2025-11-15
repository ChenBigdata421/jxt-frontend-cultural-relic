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
            <el-card>
              <h4>{{ history.task_name }}</h4>
              <p><strong>处理人:</strong> {{ history.assignee }}</p>
              <p><strong>处理结果:</strong> {{ history.result }}</p>
              <p v-if="history.comment">
                <strong>处理意见:</strong> {{ history.comment }}
              </p>
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
        >
          <!-- 日期选择器 -->
          <el-date-picker
            v-if="getFieldType(field) === 'date'"
            v-model="processForm.formData[field]"
            type="date"
            :placeholder="getFieldPlaceholder(field)"
            style="width: 100%"
          />
          <!-- 日期时间选择器 -->
          <el-date-picker
            v-else-if="getFieldType(field) === 'datetime'"
            v-model="processForm.formData[field]"
            type="datetime"
            :placeholder="getFieldPlaceholder(field)"
            style="width: 100%"
          />
          <!-- 时间选择器 -->
          <el-time-picker
            v-else-if="getFieldType(field) === 'time'"
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
            style="width: 100%"
          />
          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="getFieldType(field) === 'number'"
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
            style="width: 100%"
          />
          <!-- 开关 -->
          <el-switch
            v-else-if="getFieldType(field) === 'boolean'"
            v-model="processForm.formData[field]"
          />
          <!-- 文本域 -->
          <el-input
            v-else-if="getFieldType(field) === 'textarea'"
            v-model="processForm.formData[field]"
            type="textarea"
            :rows="3"
            :placeholder="getFieldPlaceholder(field)"
          />
          <!-- 邮箱输入框 -->
          <el-input
            v-else-if="getFieldType(field) === 'email'"
            v-model="processForm.formData[field]"
            type="email"
            :placeholder="getFieldPlaceholder(field)"
          />
          <!-- 电话输入框 -->
          <el-input
            v-else-if="getFieldType(field) === 'tel'"
            v-model="processForm.formData[field]"
            type="tel"
            :placeholder="getFieldPlaceholder(field)"
          />
          <!-- URL输入框 -->
          <el-input
            v-else-if="getFieldType(field) === 'url'"
            v-model="processForm.formData[field]"
            type="url"
            :placeholder="getFieldPlaceholder(field)"
          />
          <!-- 默认文本输入框 -->
          <el-input
            v-else
            v-model="processForm.formData[field]"
            :placeholder="getFieldPlaceholder(field)"
          />
        </el-form-item>
      </template>

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


