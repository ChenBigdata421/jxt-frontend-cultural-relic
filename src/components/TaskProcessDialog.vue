<template>
  <el-dialog
    :title="'处理任务 - ' + processForm.taskName"
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
            <span>{{ processForm.taskName }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="流程名称">
            <span>{{ processForm.workflowName }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级">
            <el-tag v-if="processForm.priority === 'high'" type="danger">高</el-tag>
            <el-tag v-else-if="processForm.priority === 'low'" type="info">低</el-tag>
            <el-tag v-else type="warning">中</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 驳回信息 -->
      <el-alert
        v-if="processForm.rejectionInfo"
        title="驳回信息"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div>
          <p>
            <strong>驳回人:</strong>
            {{ processForm.rejectionInfo.rejectedBy }}
          </p>
          <p>
            <strong>驳回时间:</strong>
            {{ processForm.rejectionInfo.rejectedAt }}
          </p>
          <p>
            <strong>驳回原因:</strong>
            {{ processForm.rejectionInfo.rejectionReason }}
          </p>
        </div>
      </el-alert>

      <!-- 流程处理历史 -->
      <div
        v-if="
          processForm.previousTasksHistory && processForm.previousTasksHistory.length > 0
        "
        style="margin-bottom: 20px"
      >
        <el-divider>流程处理历史</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in processForm.previousTasksHistory"
            :key="index"
            :timestamp="history.completedAt"
            placement="top"
          >
            <el-card shadow="hover" style="margin-bottom: 10px">
              <div
                slot="header"
                style="display: flex; justify-content: space-between; align-items: center"
              >
                <span style="font-weight: bold; font-size: 16px">
                  {{ index + 1 }}. {{ history.taskName }}
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
                <div style="color: #909399; font-size: 12px; margin-bottom: 5px">
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
              <div v-if="history.output && Object.keys(history.output).length > 0">
                <div style="color: #909399; font-size: 12px; margin-bottom: 5px">
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
                处理人：{{ getUserDisplayName(history.assignee) }}
                <span style="margin-left: 24px">
                  部门：{{ getUserOrgName(history.assignee) }}
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 动态表单字段 -->
      <el-divider>填写信息</el-divider>
      <template v-if="processForm.formFields && processForm.formFields.length > 0">
        <el-form-item
          v-for="field in processForm.formFields"
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
          <treeselect
            v-else-if="getFieldType(field) === 'approver'"
            :options="orgOptions"
            placeholder="请选择审批组织"
            style="width: 100%"
            clearable
            @input="handleOrgSelect($event, field)"
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
import { orgTreeSelect, getOrgLeader } from "@/api/admin/sys-org";
import { getUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "TaskProcessDialog",
  components: {
    Treeselect,
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
      orgOptions: [], // 组织树选项
      userCache: {}, // 用户信息缓存，避免重复请求
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
  },
};
</script>

<style scoped>
.el-timeline {
  padding-left: 0;
}
</style>
