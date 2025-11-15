<template>
  <div class="app-container">
    <el-breadcrumb class="mb20" separator="/">
      <el-breadcrumb-item>流程管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的待办</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 查询表单 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
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
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="taskList" border>
      <el-table-column
        label="任务ID"
        align="center"
        prop="id"
        width="280"
        show-overflow-tooltip
      />
      <el-table-column
        label="任务名称"
        align="center"
        prop="task_name"
        width="150"
      />
      <el-table-column
        label="流程名称"
        align="center"
        prop="workflow_name"
        width="150"
      />
      <el-table-column
        label="流程实例ID"
        align="center"
        prop="instance_id"
        width="280"
        show-overflow-tooltip
      />
      <el-table-column label="优先级" align="center" prop="priority" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority === 'high'" type="danger">高</el-tag>
          <el-tag v-else-if="scope.row.priority === 'medium'" type="warning"
            >中</el-tag
          >
          <el-tag v-else type="info">低</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="created_at"
        width="160"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="300"
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
            icon="el-icon-edit"
            @click="handleProcess(scope.row)"
            >处理</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleDelegate(scope.row)"
            >转办</el-button
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
    <el-dialog
      :title="dialogTitle"
      :visible.sync="viewOpen"
      width="800px"
      append-to-body
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务ID">{{
          taskDetail.id
        }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{
          taskDetail.task_name
        }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{
          taskDetail.workflow_name
        }}</el-descriptions-item>
        <el-descriptions-item label="流程实例ID">{{
          taskDetail.instance_id
        }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag v-if="taskDetail.priority === 'high'" type="danger"
            >高</el-tag
          >
          <el-tag v-else-if="taskDetail.priority === 'medium'" type="warning"
            >中</el-tag
          >
          <el-tag v-else type="info">低</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          taskDetail.created_at
        }}</el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{
          taskDetail.description
        }}</el-descriptions-item>
        <el-descriptions-item label="任务数据" :span="2">
          <pre>{{ formatJson(taskDetail.task_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 任务处理对话框 -->
    <el-dialog
      :title="'处理任务 - ' + processForm.task_name"
      :visible.sync="processOpen"
      width="900px"
      append-to-body
    >
      <el-form
        ref="processForm"
        :model="processForm"
        :rules="processRules"
        label-width="120px"
      >
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
              <el-tag
                v-else-if="processForm.priority === 'medium'"
                type="warning"
                >中</el-tag
              >
              <el-tag v-else-if="processForm.priority === 'low'" type="info"
                >低</el-tag
              >
              <span v-else>{{ processForm.priority || "-" }}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 显示驳回信息（如果有） -->
        <el-alert
          v-if="processForm.rejection_info"
          title="任务被驳回"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <div style="margin-top: 10px">
            <p>
              <strong>驳回人：</strong
              >{{ processForm.rejection_info.rejected_by }}
            </p>
            <p>
              <strong>驳回时间：</strong
              >{{ processForm.rejection_info.rejected_at }}
            </p>
            <p>
              <strong>驳回原因：</strong
              >{{ processForm.rejection_info.rejection_reason }}
            </p>
          </div>
        </el-alert>

        <!-- 显示所有前序任务的处理历史 -->
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
              v-for="(taskHistory, index) in processForm.previous_tasks_history"
              :key="index"
              :timestamp="taskHistory.completed_at"
              placement="top"
            >
              <!-- 任务标题 -->
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
                    {{ index + 1 }}. {{ taskHistory.task_name }}
                  </span>
                  <el-tag
                    :type="
                      taskHistory.result === '通过' ||
                      taskHistory.result === '完成'
                        ? 'success'
                        : 'danger'
                    "
                    size="small"
                  >
                    {{ taskHistory.result }}
                  </el-tag>
                </div>

                <!-- 处理意见 -->
                <div v-if="taskHistory.comment" style="margin-bottom: 15px">
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
                    {{ taskHistory.comment }}
                  </div>
                </div>

                <!-- 表单字段数据 -->
                <div
                  v-if="
                    taskHistory.output &&
                    Object.keys(taskHistory.output).length > 0
                  "
                >
                  <div
                    style="color: #909399; font-size: 12px; margin-bottom: 5px"
                  >
                    提交信息：
                  </div>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item
                      v-for="(value, key) in taskHistory.output"
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
                  处理人：{{ taskHistory.assignee }}
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 根据 form_fields 动态生成表单 -->
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
        <el-button type="success" @click="submitApprove">通过</el-button>
        <el-button type="danger" @click="submitReject" :disabled="isFirstTask">
          驳回{{ isFirstTask ? "（第一个任务不可驳回）" : "" }}
        </el-button>
        <el-button @click="processOpen = false">取消</el-button>
      </div>
    </el-dialog>

    <!-- 转办对话框 -->
    <el-dialog
      title="转办任务"
      :visible.sync="delegateOpen"
      width="500px"
      append-to-body
    >
      <el-form
        ref="delegateForm"
        :model="delegateForm"
        :rules="delegateRules"
        label-width="100px"
      >
        <el-form-item label="转办人" prop="assignee">
          <el-input
            v-model="delegateForm.assignee"
            placeholder="请输入用户ID或用户名"
          />
        </el-form-item>
        <el-form-item label="转办说明" prop="comment">
          <el-input
            v-model="delegateForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入转办说明"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDelegate">确定</el-button>
        <el-button @click="delegateOpen = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMyTodoTasks,
  getTask,
  approveTask,
  rejectTask,
  delegateTask,
} from "@/api/process/task";
import { getWorkflow } from "@/api/process/workflow";

export default {
  name: "TodoTask",
  data() {
    return {
      // 遮罩层      loading: true,
      // 总条数      total: 0,
      // 任务列表
      taskList: [],
      // 对话框标题      dialogTitle: '',
      viewOpen: false,
      processOpen: false,
      delegateOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        workflowName: undefined,
      },
      // 任务详情
      taskDetail: {},
      // 处理表单
      processForm: {},
      // 转办表单
      delegateForm: {},
      // 当前任务ID
      currentTaskId: null,
      // 当前任务对象
      currentTask: null,
      // 是否是第一个任务
      isFirstTask: false,
      // 表单校验
      processRules: {
        comment: [
          { required: true, message: "处理意见不能为空", trigger: "blur" },
        ],
      },
      delegateRules: {
        assignee: [
          { required: true, message: "转办人不能为空", trigger: "blur" },
        ],
        comment: [
          { required: true, message: "转办说明不能为空", trigger: "blur" },
        ],
      },
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
      listMyTodoTasks(params)
        .then((response) => {
          if (response.code === 200) {
            this.taskList = response.data.items || [];
            this.total = response.data.total || 0;
          } else {
            this.msgError(response.msg || "查询失败");
          }
          this.loading = false;
        })
        .catch((error) => {
          this.msgError("查询失败" + error.message);
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
      const id = row.id;
      getTask(id)
        .then((response) => {
          if (response.code === 200) {
            this.taskDetail = response.data;
            this.viewOpen = true;
            this.dialogTitle = "任务详情";
          } else {
            this.msgError(response.msg || "获取详情失败");
          }
        })
        .catch((error) => {
          this.msgError("获取详情失败" + error.message);
        });
    },
    /** 处理按钮操作 */
    handleProcess(row) {
      this.currentTaskId = row.id;

      // 获取任务详情以获取完整信息
      getTask(row.id)
        .then((response) => {
          if (response.code === 200) {
            const task = response.data;
            this.currentTask = task;

            // 获取工作流定义以判断是否是第一个任务
            return getWorkflow(task.workflow_id);
          } else {
            this.msgError(response.msg || "获取任务详情失败");
            throw new Error(response.msg || "获取任务详情失败");
          }
        })
        .then((workflowResponse) => {
          if (workflowResponse.code === 200) {
            const task = this.currentTask;
            const workflow = workflowResponse.data;

            // 解析工作流定义
            let definition = {};
            try {
              definition =
                typeof workflow.definition === "string"
                  ? JSON.parse(workflow.definition)
                  : workflow.definition;
            } catch (e) {
              console.error("解析工作流定义失败:", e);
            }

            // 判断是否是第一个任务
            if (definition.steps && definition.steps.length > 0) {
              const firstStepId = definition.steps[0].id;
              this.isFirstTask = task.task_key === firstStepId;
            } else {
              this.isFirstTask = false;
            }

            // 解析 form_data
            let formDataObj = {};
            if (task.form_data) {
              try {
                if (typeof task.form_data === "string") {
                  formDataObj = JSON.parse(task.form_data);
                } else if (typeof task.form_data === "object") {
                  formDataObj = task.form_data;
                }
              } catch (e) {
                console.error(
                  "解析 form_data 失败:",
                  e,
                  "原始数据:",
                  task.form_data
                );
              }
            }

            // 解析 form_fields
            let formFields = [];
            if (formDataObj && formDataObj.form_fields) {
              formFields = formDataObj.form_fields;
            } else {
              console.warn("未找到 form_fields，formDataObj:", formDataObj);
            }

            // 初始化表单数据对象
            const formData = {};
            formFields.forEach((field) => {
              // 特殊处理：approved 字段默认为 true
              if (field === "approved") {
                formData[field] = true;
              } else {
                // 根据字段类型初始化默认值
                const fieldType = this.getFieldTypeForInit(field);
                if (fieldType === "boolean") {
                  formData[field] = false;
                } else if (fieldType === "number") {
                  formData[field] = null;
                } else {
                  formData[field] = "";
                }
              }
            });

            // 解析任务数据（当前任务的数据）
            let taskData = {};
            let rejectionInfo = null;
            let previousTasksHistory = [];

            if (task.task_data) {
              try {
                if (typeof task.task_data === "string") {
                  taskData = JSON.parse(task.task_data);

                  // 检查是否是双重JSON编码（解析后仍然是字符串）
                  if (typeof taskData === "string") {
                    taskData = JSON.parse(taskData);
                  }
                } else if (
                  typeof task.task_data === "object" &&
                  task.task_data !== null
                ) {
                  taskData = task.task_data;
                }

                // 检查是否包含驳回信息
                if (taskData.rejected_by) {
                  rejectionInfo = {
                    rejected_by: taskData.rejected_by,
                    rejected_at: taskData.rejected_at,
                    rejection_reason: taskData.rejection_reason,
                    rejected_task_id: taskData.rejected_task_id,
                  };
                }

                // 🆕 从 task_data 中提取所有前序任务的历史记录
                if (
                  taskData.previous_tasks_history &&
                  Array.isArray(taskData.previous_tasks_history)
                ) {
                  previousTasksHistory = taskData.previous_tasks_history;
                }
              } catch (e) {
                console.error(
                  "解析任务数据失败:",
                  e,
                  "原始数据:",
                  task.task_data
                );
                taskData = {};
              }
            }

            // 确保 taskData 是对象
            const finalTaskData =
              taskData && typeof taskData === "object" ? taskData : {};

            this.processForm = {
              task_name: task.task_name,
              workflow_name: task.workflow_name,
              priority: task.priority || "medium",
              task_data: finalTaskData,
              previous_tasks_history: previousTasksHistory, // 🆕 所有前序任务的历史记录
              form_fields: formFields,
              formData: formData,
              comment: "",
              output: "",
              rejection_info: rejectionInfo, // 添加驳回信息
            };

            // 动态生成表单验证规则
            this.generateFormRules(formFields);

            this.processOpen = true;
          } else {
            this.msgError(response.msg || "获取任务详情失败");
          }
        })
        .catch((error) => {
          if (error.message) {
            this.msgError("获取任务详情失败：" + error.message);
          }
        });
    },
    /** 转办按钮操作 */
    handleDelegate(row) {
      this.currentTaskId = row.id;
      this.delegateForm = {
        assignee: "",
        comment: "",
      };
      this.delegateOpen = true;
    },
    /** 提交审批通过 */
    submitApprove() {
      this.$refs["processForm"].validate((valid) => {
        if (valid) {
          // 构建输出数据
          let outputData = "";
          if (
            this.processForm.form_fields &&
            this.processForm.form_fields.length > 0
          ) {
            // 如果有 form_fields，将表单数据转换为 JSON
            outputData = JSON.stringify(this.processForm.formData);
          } else {
            // 否则使用原始的 output 字段
            outputData = this.processForm.output || "{}";
          }

          const data = {
            comment: this.processForm.comment || "审批通过",
            output: outputData,
          };
          approveTask(this.currentTaskId, data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("审批通过");
                this.processOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg || "审批失败");
              }
            })
            .catch((error) => {
              this.msgError("审批失败" + error.message);
            });
        }
      });
    },
    /** 提交审批驳回 */
    submitReject() {
      this.$refs["processForm"].validate((valid) => {
        if (valid) {
          this.$confirm("确认驳回该任务吗？", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              const data = {
                comment: this.processForm.comment,
                reason: this.processForm.comment,
              };
              return rejectTask(this.currentTaskId, data);
            })
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("已驳回");
                this.processOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg || "驳回失败");
              }
            })
            .catch((error) => {
              if (error !== "cancel") {
                this.msgError("驳回失败" + error.message);
              }
            });
        }
      });
    },
    /** 提交转办 */
    submitDelegate() {
      this.$refs["delegateForm"].validate((valid) => {
        if (valid) {
          delegateTask(this.currentTaskId, this.delegateForm)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("转办成功");
                this.delegateOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg || "转办失败");
              }
            })
            .catch((error) => {
              this.msgError("转办失败" + error.message);
            });
        }
      });
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
    /** 获取字段标签 */
    getFieldLabel(field) {
      // 扩展的字段名称映射表
      const labelMap = {
        // 通用字段
        applicant: "申请人",
        description: "描述",
        comment: "备注",
        reason: "原因",
        remark: "备注",
        note: "说明",
        priority: "优先级",
        status: "状态",

        // 文档相关
        document_id: "文档编号",
        document_name: "文档名称",
        document_type: "文档类型",
        document_number: "文档编号",
        file_name: "文件名称",
        file_path: "文件路径",
        file_size: "文件大小",
        attachment: "附件",

        // 物证相关
        evidence_id: "物证编号",
        evidence_name: "物证名称",
        evidence_type: "物证类型",
        evidence_number: "物证编号",
        storage_location: "存储位置",
        storage_place: "存放地点",
        handler: "经手人",
        keeper: "保管人",
        receiver: "接收人",

        // 审批相关
        approver: "审批人",
        approval_date: "审批日期",
        approval_time: "审批时间",
        approval_result: "审批结果",
        approval_opinion: "审批意见",
        approved: "是否批准",
        reject_reason: "驳回原因",

        // 用户相关
        user_id: "用户ID",
        user_name: "用户名",
        username: "用户名",
        assignee: "处理人",
        operator: "操作人",
        creator: "创建人",
        updater: "更新人",

        // 组织相关
        department: "部门",
        department_id: "部门ID",
        department_name: "部门名称",
        organization: "组织",
        team: "团队",

        // 时间相关
        date: "日期",
        time: "时间",
        datetime: "日期时间",
        start_date: "开始日期",
        end_date: "结束日期",
        start_time: "开始时间",
        end_time: "结束时间",
        deadline: "截止日期",
        due_date: "到期日期",
        created_at: "创建时间",
        updated_at: "更新时间",
        deleted_at: "删除时间",
        completed_at: "完成时间",

        // 联系方式
        phone: "电话",
        mobile: "手机",
        telephone: "电话",
        email: "邮箱",
        address: "地址",
        url: "网址",
        website: "网站",

        // 数量金额
        amount: "金额",
        quantity: "数量",
        count: "数量",
        number: "编号",
        code: "编码",
        price: "价格",
        total: "总计",

        // 状态标识
        deleted: "是否删除",
        submitted: "是否提交",
        completed: "是否完成",
        enabled: "是否启用",
        active: "是否激活",
        verified: "是否验证",
        confirmed: "是否确认",

        // 其他
        result: "结果",
        title: "标题",
        content: "内容",
        category: "分类",
        tag: "标签",
        level: "级别",
        grade: "等级",
        score: "分数",
        version: "版本",
      };

      // 1. 先查映射表
      if (labelMap[field]) {
        return labelMap[field];
      }

      // 2. 智能转换：将下划线分隔的英文转为中文
      const parts = field.split("_");
      const wordMap = {
        id: "ID",
        name: "名称",
        type: "类型",
        date: "日期",
        time: "时间",
        user: "用户",
        document: "文档",
        file: "文件",
        status: "状态",
        code: "编码",
        number: "编号",
        evidence: "物证",
        storage: "存储",
        location: "位置",
        approval: "审批",
        approver: "审批人",
        reason: "原因",
        comment: "意见",
        department: "部门",
        organization: "组织",
        phone: "电话",
        email: "邮箱",
        address: "地址",
        amount: "金额",
        quantity: "数量",
        price: "价格",
        result: "结果",
        description: "描述",
        remark: "备注",
        handler: "经手人",
        operator: "操作人",
        creator: "创建人",
        start: "开始",
        end: "结束",
        deadline: "截止",
        created: "创建",
        updated: "更新",
        deleted: "删除",
        completed: "完成",
        at: "于",
        is: "是否",
        has: "是否有",
        can: "是否可以",
      };

      const translated = parts
        .map((part) => {
          return wordMap[part.toLowerCase()] || part;
        })
        .join("");

      return translated || field;
    },

    /** 获取字段类型 */
    getFieldType(field) {
      const fieldLower = field.toLowerCase();

      // 日期类型
      if (
        fieldLower.includes("date") &&
        !fieldLower.includes("time") &&
        !fieldLower.includes("datetime")
      ) {
        return "date";
      }

      // 日期时间类型
      if (
        fieldLower.includes("datetime") ||
        fieldLower.includes("created_at") ||
        fieldLower.includes("updated_at") ||
        fieldLower.includes("deleted_at") ||
        fieldLower.includes("completed_at")
      ) {
        return "datetime";
      }

      // 时间类型
      if (fieldLower.includes("time") && !fieldLower.includes("datetime")) {
        return "time";
      }

      // 邮箱类型
      if (fieldLower.includes("email") || fieldLower.includes("mail")) {
        return "email";
      }

      // 电话类型
      if (
        fieldLower.includes("phone") ||
        fieldLower.includes("mobile") ||
        fieldLower.includes("telephone") ||
        fieldLower.includes("tel")
      ) {
        return "tel";
      }

      // URL类型
      if (
        fieldLower.includes("url") ||
        fieldLower.includes("website") ||
        fieldLower.includes("link")
      ) {
        return "url";
      }

      // 数字类型
      if (
        fieldLower.includes("amount") ||
        fieldLower.includes("price") ||
        fieldLower.includes("quantity") ||
        fieldLower.includes("count") ||
        (fieldLower.includes("number") && !fieldLower.includes("phone")) ||
        fieldLower.includes("score") ||
        fieldLower.includes("total")
      ) {
        return "number";
      }

      // 布尔类型
      if (
        fieldLower.includes("approved") ||
        fieldLower.includes("deleted") ||
        fieldLower.includes("submitted") ||
        fieldLower.includes("completed") ||
        fieldLower.includes("enabled") ||
        fieldLower.includes("active") ||
        fieldLower.includes("verified") ||
        fieldLower.includes("confirmed") ||
        fieldLower.startsWith("is_") ||
        fieldLower.startsWith("has_") ||
        fieldLower.startsWith("can_")
      ) {
        return "boolean";
      }

      // 文本域类型
      if (
        fieldLower.includes("description") ||
        fieldLower.includes("reason") ||
        fieldLower.includes("comment") ||
        fieldLower.includes("remark") ||
        fieldLower.includes("content") ||
        fieldLower.includes("note") ||
        fieldLower.includes("opinion") ||
        fieldLower.includes("detail")
      ) {
        return "textarea";
      }

      // 默认文本类型
      return "text";
    },

    /** 获取字段占位符 */
    getFieldPlaceholder(field) {
      const fieldType = this.getFieldType(field);
      const fieldLabel = this.getFieldLabel(field);

      // 根据字段类型生成不同的占位符
      const placeholderMap = {
        date: `请选择${fieldLabel}`,
        datetime: `请选择${fieldLabel}`,
        time: `请选择${fieldLabel}`,
        number: `请输入${fieldLabel}`,
        email: `请输入${fieldLabel}，例如：example@email.com`,
        tel: `请输入${fieldLabel}，例如：13800138000`,
        url: `请输入${fieldLabel}，例如：https://example.com`,
        textarea: `请输入${fieldLabel}`,
        text: `请输入${fieldLabel}`,
      };

      return placeholderMap[fieldType] || `请输入${fieldLabel}`;
    },

    /** 获取字段类型（用于初始化） */
    getFieldTypeForInit(field) {
      return this.getFieldType(field);
    },

    /** 动态生成表单验证规则 */
    generateFormRules(formFields) {
      // 重置验证规则
      this.processRules = {};

      // 为每个form_field添加必填验证
      if (formFields && formFields.length > 0) {
        formFields.forEach((field) => {
          const fieldLabel = this.getFieldLabel(field);
          const fieldType = this.getFieldType(field);

          // 布尔类型不需要必填验证
          if (fieldType === "boolean") {
            return;
          }

          this.processRules[`formData.${field}`] = [
            {
              required: true,
              message: `${fieldLabel}不能为空`,
              trigger: "blur",
            },
          ];

          // 为特定类型添加格式验证
          if (fieldType === "email") {
            this.processRules[`formData.${field}`].push({
              type: "email",
              message: "请输入正确的邮箱格式",
              trigger: "blur",
            });
          }
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
</style>



