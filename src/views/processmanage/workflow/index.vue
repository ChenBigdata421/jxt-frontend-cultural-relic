<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="工作流名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入工作流名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="激活" value="active" />
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

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="workflowList" border>
      <el-table-column label="工作流编号" align="center" prop="workflowNo" width="280" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column
        label="描述"
        align="center"
        prop="description"
        show-overflow-tooltip
      />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 'draft'" type="info">草稿</el-tag>
          <el-tag v-else-if="scope.row.status === 'active'" type="success">激活</el-tag>
          <el-tag v-else-if="scope.row.status === 'frozen'" type="warning">冻结</el-tag>
          <el-tag v-else-if="scope.row.status === 'completed'" type="primary"
            >已完成</el-tag
          >
          <el-tag v-else-if="scope.row.status === 'failed'" type="danger">失败</el-tag>
          <el-tag v-else-if="scope.row.status === 'cancelled'" type="warning"
            >已取消</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="350"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            >查看</el-button
          >
          <!-- 草稿状态：可以修改、激活、删除 -->
          <el-button
            v-if="scope.row.status === 'draft'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="scope.row.status === 'draft'"
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleActivate(scope.row)"
            >激活</el-button
          >
          <el-button
            v-if="scope.row.status === 'draft'"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
          <!-- 激活状态：可以启动实例、冻结 -->
          <el-button
            v-if="scope.row.status === 'active'"
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleStartInstance(scope.row)"
            >启动实例</el-button
          >
          <el-button
            v-if="scope.row.status === 'active'"
            size="mini"
            type="text"
            icon="el-icon-lock"
            @click="handleFreeze(scope.row)"
            >冻结</el-button
          >
          <!-- 冻结状态：可以修改、激活 -->
          <el-button
            v-if="scope.row.status === 'frozen'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="scope.row.status === 'frozen'"
            size="mini"
            type="text"
            icon="el-icon-unlock"
            @click="handleActivate(scope.row)"
            >激活</el-button
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

    <!-- 添加或修改工作流对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
    >
      <!-- 查看模式 -->
      <div v-if="viewMode">
        <el-form ref="form" :model="form" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="工作流名称">
                <span>{{ form.name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态">
                <el-tag v-if="form.status === 'draft'" type="info">草稿</el-tag>
                <el-tag v-else-if="form.status === 'active'" type="success">激活</el-tag>
                <el-tag v-else-if="form.status === 'frozen'" type="warning">冻结</el-tag>
                <el-tag v-else-if="form.status === 'completed'" type="primary"
                  >已完成</el-tag
                >
                <el-tag v-else-if="form.status === 'failed'" type="danger">失败</el-tag>
                <el-tag v-else-if="form.status === 'cancelled'" type="warning"
                  >已取消</el-tag
                >
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="创建时间">
                <span>{{ form.created_at }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述">
            <span>{{ form.description }}</span>
          </el-form-item>
        </el-form>

        <!-- 工作流图形展示 -->
        <div class="workflow-view-section">
          <div class="section-header">
            <h4 class="section-title">工作流程图</h4>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-document"
              @click="showWorkflowJSON"
              >显示JSON</el-button
            >
          </div>
          <div class="workflow-graph-container">
            <div v-if="viewSteps.length === 0" class="empty-state">
              <i class="el-icon-picture"></i>
              <p>该工作流暂无流程定义</p>
            </div>
            <div v-else class="workflow-tree-view">
              <div v-if="viewRootIds.length === 0" class="empty-state">
                <i class="el-icon-warning"></i>
                <p>未找到起始节点，请检查 next_steps 引用</p>
              </div>
              <div v-else class="roots-row">
                <view-workflow-node
                  v-for="rid in viewRootIds"
                  :key="rid"
                  :node-id="rid"
                  :get-node="getViewNodeById"
                  :get-next-ids="getViewNextIds"
                  :get-parallel-tasks="getViewParallelTasks"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 新增/编辑模式 - 使用设计器 -->
      <div v-else>
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="工作流名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入工作流名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="描述" prop="description">
                <el-input v-model="form.description" placeholder="请输入描述" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 工作流设计器组件 -->
        <div class="designer-wrapper">
          <workflow-designer ref="designer" :workflow-data="form" />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button v-if="!viewMode" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">{{ viewMode ? "关 闭" : "取 消" }}</el-button>
      </div>
    </el-dialog>

    <!-- 启动实例对话框 -->
    <el-dialog
      title="启动工作流实例"
      :visible.sync="startInstanceOpen"
      width="800px"
      append-to-body
    >
      <el-form
        ref="startInstanceForm"
        :model="startInstanceForm"
        :rules="startInstanceRules"
        label-width="120px"
      >
        <el-form-item label="工作流名称">
          <span>{{ currentWorkflow.name }}</span>
        </el-form-item>
        <el-form-item label="工作流描述">
          <span>{{ currentWorkflow.description }}</span>
        </el-form-item>

        <!-- 任务分配 -->
        <el-divider>任务分配（可选）</el-divider>

        <el-form-item label="指定用户">
          <el-select
            v-model="startInstanceForm.assignee"
            placeholder="请选择用户（可选）"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.userName + (user.policeNo ? ' (' + user.policeNo + ')' : '')"
              :value="String(user.userId)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="候选用户">
          <el-select
            v-model="startInstanceForm.candidate_users"
            placeholder="请选择候选用户（可选）"
            clearable
            filterable
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="user in userList"
              :key="user.userId"
              :label="user.userName + (user.policeNo ? ' (' + user.policeNo + ')' : '')"
              :value="String(user.userId)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="候选组">
          <el-select
            v-model="startInstanceForm.candidate_groups"
            placeholder="请选择候选组（可选）"
            clearable
            filterable
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName + ' (' + role.roleKey + ')'"
              :value="role.roleKey"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select
            v-model="startInstanceForm.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 100%"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>

        <el-divider>输入数据</el-divider>

        <el-form-item label="输入数据" prop="input">
          <el-input
            v-model="startInstanceForm.input"
            type="textarea"
            :rows="10"
            placeholder='请输入输入数据(JSON格式)，例如: {"applicant": "1", "orderId": "12345"}'
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitStartInstance">确 定</el-button>
        <el-button @click="cancelStartInstance">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 显示工作流JSON对话框 -->
    <el-dialog
      title="工作流定义 (JSON)"
      :visible.sync="jsonDialogVisible"
      width="70%"
      append-to-body
    >
      <div class="json-viewer">
        <el-input
          v-model="workflowJSON"
          type="textarea"
          :rows="20"
          readonly
          class="json-textarea"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-document-copy" @click="copyJSON"
          >复制</el-button
        >
        <el-button @click="jsonDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  freezeWorkflow,
  checkCanFreeze,
} from "@/api/process/workflow";
import { startInstance } from "@/api/process/instance";
import { listUser } from "@/api/admin/sys-user";
import { listRole } from "@/api/admin/sys-role";
import WorkflowDesigner from "./designer.vue";

const ViewWorkflowNode = {
  name: "ViewWorkflowNode",
  props: {
    nodeId: { type: String, required: true },
    getNode: { type: Function, required: true },
    getNextIds: { type: Function, required: true },
    getParallelTasks: { type: Function, required: true },
  },
  computed: {
    node() {
      return this.getNode(this.nodeId);
    },
    nextIds() {
      return this.getNextIds(this.node);
    },
    parallelTasks() {
      return this.getParallelTasks(this.node);
    },
    isParallelGateway() {
      return this.node && this.node.type === "parallel";
    },
  },
  methods: {
    typeLabel(type) {
      const labels = {
        user_task: "用户任务",
        process: "自动任务",
        parallel: "并行网关",
        complete: "完成",
      };
      return labels[type] || type;
    },
  },
  render(h) {
    if (!this.node) return null;

    const NodeChild = (id) =>
      h(ViewWorkflowNode, {
        key: id,
        props: {
          nodeId: id,
          getNode: this.getNode,
          getNextIds: this.getNextIds,
          getParallelTasks: this.getParallelTasks,
        },
      });

    const card = h(
      "div",
      {
        class: ["node-card", "t-" + this.node.type],
      },
      [
        h("div", { class: "node-head" }, [
          h("span", { class: "node-type" }, this.typeLabel(this.node.type)),
        ]),
        h("div", { class: "node-title" }, this.node.name),
        this.node.condition
          ? h("div", { class: "node-sub" }, `条件：${this.node.condition}`)
          : null,
        this.node.description
          ? h("div", { class: "node-sub" }, this.node.description)
          : null,
      ]
    );

    const parts = [card];

    if (this.isParallelGateway) {
      const taskRow = h(
        "div",
        { class: "wf-children-row" },
        (this.parallelTasks || []).map((t) => NodeChild(t.id))
      );
      const join =
        this.nextIds && this.nextIds.length
          ? h("div", { class: "wf-join" }, [
              h("div", { class: "wf-line-horz" }),
              h("div", { class: "wf-line-vert" }),
            ])
          : null;
      parts.push(
        h("div", { class: "wf-parallel" }, [
          h("div", { class: "wf-line-vert" }),
          h("div", { class: "wf-line-horz" }),
          taskRow,
          join,
        ])
      );
    }

    if (!this.isParallelGateway && this.nextIds && this.nextIds.length > 1) {
      parts.push(
        h("div", { class: "wf-branches" }, [
          h("div", { class: "wf-line-vert" }),
          h("div", { class: "wf-line-horz" }),
          h(
            "div",
            { class: "wf-children-row" },
            (this.nextIds || []).map((id) => NodeChild(id))
          ),
        ])
      );
    } else if (!this.isParallelGateway && this.nextIds && this.nextIds.length === 1) {
      parts.push(
        h("div", { class: "wf-next" }, [
          h("div", { class: "wf-line-vert" }),
          NodeChild(this.nextIds[0]),
        ])
      );
    } else if (this.isParallelGateway && this.nextIds && this.nextIds.length === 1) {
      parts.push(h("div", { class: "wf-next" }, [NodeChild(this.nextIds[0])]));
    }

    return h("div", { class: "wf-node" }, parts);
  },
};

ViewWorkflowNode.components = { ViewWorkflowNode };

export default {
  name: "Workflow",
  components: {
    WorkflowDesigner,
    ViewWorkflowNode,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 工作流表格数据
      workflowList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否为查看模式
      viewMode: false,
      // 查看模式下的步骤列表
      viewSteps: [],
      // 查看模式下的根节点 ID
      viewRootIds: [],
      // 是否显示启动实例对话框
      startInstanceOpen: false,
      // 当前工作流
      currentWorkflow: {},
      // 是否显示JSON对话框
      jsonDialogVisible: false,
      // 工作流JSON字符串
      workflowJSON: "",
      // 用户列表
      userList: [],
      // 角色列表
      roleList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          {
            required: true,
            message: "工作流名称不能为空",
            trigger: ["blur", "change"],
            transform: (value) => (value ? value.trim() : ""),
          },
        ],
        description: [
          {
            required: true,
            message: "工作流描述不能为空",
            trigger: ["blur", "change"],
            transform: (value) => (value ? value.trim() : ""),
          },
        ],
      },
      // 启动实例表单参数
      startInstanceForm: {},
      // 启动实例表单校验
      startInstanceRules: {
        input: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("输入数据不能为空"));
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
    this.getUserList();
    this.getRoleList();
  },
  methods: {
    /** 查询用户列表 */
    getUserList() {
      listUser({ pageIndex: 1, pageSize: 1000 })
        .then((response) => {
          if (response.code === 200 && response.data && response.data.list) {
            this.userList = response.data.list;
          }
        })
        .catch((error) => {
          console.error("获取用户列表失败:", error);
        });
    },
    /** 查询角色列表 */
    getRoleList() {
      listRole({ pageIndex: 1, pageSize: 1000 })
        .then((response) => {
          if (response.code === 200 && response.data && response.data.list) {
            this.roleList = response.data.list;
          }
        })
        .catch((error) => {
          console.error("获取角色列表失败:", error);
        });
    },
    /** 查询工作流列表 */
    getList() {
      this.loading = true;
      const params = {
        limit: this.queryParams.pageSize,
        offset: (this.queryParams.pageNum - 1) * this.queryParams.pageSize,
      };
      listWorkflows(params)
        .then((response) => {
          if (response.code === 200) {
            this.workflowList = response.data.list || [];
            this.total = response.data.count || 0;
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        description: undefined,
        definition: undefined,
        status: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
      this.viewMode = false;
      this.viewSteps = [];
      this.resetForm("form");
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加工作流";
    },
    /** 查看按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.workflowId;
      getWorkflow(id)
        .then((response) => {
          if (response.code === 200) {
            this.form = response.data;

            // 解析工作流定义，提取步骤列表
            if (this.form.definition) {
              try {
                const def = JSON.parse(this.form.definition);
                this.viewSteps = (def.steps || []).map((s) => this.normalizeStep(s));
                console.log("解析的工作流步骤:", this.viewSteps);
              } catch (error) {
                console.error("解析工作流定义失败:", error);
                this.viewSteps = [];
              }
            } else {
              this.viewSteps = [];
            }

            this.viewRootIds = this.getViewRootIds();

            this.open = true;
            this.viewMode = true;
            this.title = "查看工作流";
          } else {
            this.msgError(response.msg || "获取详情失败");
          }
        })
        .catch((error) => {
          this.msgError("获取详情失败：" + error.message);
        });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.workflowId;
      getWorkflow(id)
        .then((response) => {
          if (response.code === 200) {
            this.form = response.data;
            this.open = true;
            this.title = "修改工作流";
          } else {
            this.msgError(response.msg || "获取详情失败");
          }
        })
        .catch((error) => {
          this.msgError("获取详情失败：" + error.message);
        });
    },
    /** 激活按钮操作 */
    handleActivate(row) {
      const message =
        row.status === "frozen"
          ? '是否确认激活工作流"' +
            row.name +
            '"？激活后将可以启动新实例，但不能再修改工作流定义。'
          : '是否确认激活工作流"' + row.name + '"?';

      this.$confirm(message, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return activateWorkflow(row.workflowId);
        })
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("激活成功");
            this.getList();
          } else {
            this.msgError(response.msg || "激活失败");
          }
        })
        .catch((error) => {
          if (error !== "cancel") {
            this.msgError("激活失败：" + error.message);
          }
        });
    },
    /** 冻结按钮操作 */
    handleFreeze(row) {
      // 先检查是否可以冻结（所有实例都已完成）
      this.$confirm("冻结工作流前需要确认所有实例都已完成。是否继续检查？", "提示", {
        confirmButtonText: "继续",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 调用后端API检查是否可以冻结
          return checkCanFreeze(row.workflowId);
        })
        .then((response) => {
          if (response.code === 200) {
            if (response.data.can_freeze) {
              // 可以冻结，再次确认
              return this.$confirm(
                '确认冻结工作流"' +
                  row.name +
                  '"？\n' +
                  "冻结后将无法启动新实例，但可以修改工作流定义。\n" +
                  "当前运行中的实例：" +
                  (response.data.running_instances || 0) +
                  "个\n" +
                  "已完成的实例：" +
                  (response.data.completed_instances || 0) +
                  "个",
                "确认冻结",
                {
                  confirmButtonText: "确定冻结",
                  cancelButtonText: "取消",
                  type: "warning",
                }
              ).then(() => {
                return freezeWorkflow(row.workflowId);
              });
            } else {
              // 不能冻结
              this.msgError(
                "无法冻结工作流：" +
                  (response.data.reason || "存在未完成的实例") +
                  "\n" +
                  "运行中的实例：" +
                  (response.data.running_instances || 0) +
                  "个"
              );
              return Promise.reject("cannot_freeze");
            }
          } else {
            this.msgError(response.msg || "检查失败");
            return Promise.reject("check_failed");
          }
        })
        .then((response) => {
          if (response && response.code === 200) {
            this.msgSuccess("冻结成功");
            this.getList();
          } else if (response) {
            this.msgError(response.msg || "冻结失败");
          }
        })
        .catch((error) => {
          if (
            error !== "cancel" &&
            error !== "cannot_freeze" &&
            error !== "check_failed"
          ) {
            this.msgError("操作失败：" + (error.message || error));
          }
        });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除工作流"' + row.name + '"?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return deleteWorkflow(row.workflowId);
        })
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("删除成功");
            this.getList();
          } else {
            this.msgError(response.msg || "删除失败");
          }
        })
        .catch((error) => {
          if (error !== "cancel") {
            this.msgError("删除失败：" + error.message);
          }
        });
    },
    /** 设计工作流按钮操作 */
    handleDesign() {
      this.$router.push("/processmanage/workflow/designer");
    },
    /** 启动实例按钮操作 */
    handleStartInstance(row) {
      this.currentWorkflow = row;
      this.startInstanceForm = {
        input: "{}",
        assignee: "",
        candidate_users: [],
        candidate_groups: [],
        priority: "medium",
      };
      this.startInstanceOpen = true;
    },
    /** 提交启动实例 */
    submitStartInstance() {
      this.$refs["startInstanceForm"].validate((valid) => {
        if (valid) {
          // 构建输入数据
          let inputData = {};
          try {
            inputData = JSON.parse(this.startInstanceForm.input);
          } catch (e) {
            this.msgError("输入数据格式错误，请输入有效的JSON");
            return;
          }

          // 添加任务分配信息到输入数据中
          // 注意：这些字段会被工作流定义中的变量引用
          // 例如：工作流定义中的 ${applicant} 会从 inputData.applicant 中获取值
          if (this.startInstanceForm.assignee) {
            // 如果指定了用户，添加到 applicant 字段（常用变量名）
            if (!inputData.applicant) {
              inputData.applicant = this.startInstanceForm.assignee;
            }
            // 同时添加到 _assignee 字段，供后续步骤使用
            inputData._assignee = this.startInstanceForm.assignee;
          }
          if (
            this.startInstanceForm.candidate_users &&
            this.startInstanceForm.candidate_users.length > 0
          ) {
            inputData._candidate_users = this.startInstanceForm.candidate_users;
          }
          if (
            this.startInstanceForm.candidate_groups &&
            this.startInstanceForm.candidate_groups.length > 0
          ) {
            inputData._candidate_groups = this.startInstanceForm.candidate_groups;
          }
          if (this.startInstanceForm.priority) {
            inputData._priority = this.startInstanceForm.priority;
          }

          const data = {
            workflow_id: this.currentWorkflow.id,
            input: JSON.stringify(inputData),
          };
          startInstance(data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("实例启动成功");
                this.startInstanceOpen = false;
                // 跳转到实例列表页面
                this.$router.push({
                  path: "/processmanage/instance",
                  query: {
                    workflowId: this.currentWorkflow.id,
                    workflowName: this.currentWorkflow.name,
                  },
                });
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
    /** 取消启动实例 */
    cancelStartInstance() {
      this.startInstanceOpen = false;
      this.startInstanceForm = {};
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const name = (this.form.name || "").trim();
          const description = (this.form.description || "").trim();

          // 从设计器获取工作流定义
          const definition = this.$refs.designer.getWorkflowDefinition();
          if (!definition) {
            this.msgError("请至少添加一个步骤");
            return;
          }

          this.form.name = name;
          this.form.description = description;
          const data = {
            name,
            description,
            definition: definition,
          };

          if (this.form.workflowId != undefined) {
            updateWorkflow(this.form.workflowId, data)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg || "修改失败");
                }
              })
              .catch((error) => {
                this.msgError("修改失败：" + error.message);
              });
          } else {
            createWorkflow(data)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                  // 重置设计器
                  this.$refs.designer.reset();
                } else {
                  this.msgError(response.msg || "新增失败");
                }
              })
              .catch((error) => {
                this.msgError("新增失败：" + error.message);
              });
          }
        }
      });
    },
    /** 获取步骤类型标签 */
    getStepTypeLabel(type) {
      const labels = {
        user_task: "用户任务",
        process: "自动任务",
        parallel: "并行任务",
        complete: "完成",
      };
      return labels[type] || type;
    },

    getStepNextSteps(step) {
      const next = (step && (step.next_steps || step.nextSteps)) || [];
      return Array.isArray(next) ? next : [];
    },

    getStepParallelTasks(step) {
      const tasks = (step && (step.parallel_tasks || step.parallelTasks)) || [];
      return Array.isArray(tasks) ? tasks : [];
    },
    /** 获取步骤图标 */
    getStepIcon(type) {
      const icons = {
        validate: "el-icon-check",
        process: "el-icon-s-tools",
        notify: "el-icon-message",
        complete: "el-icon-success",
        custom: "el-icon-plus",
      };
      return icons[type] || "el-icon-s-operation";
    },
    /** 显示工作流JSON */
    showWorkflowJSON() {
      if (this.form.definition) {
        try {
          const def = JSON.parse(this.form.definition);
          this.workflowJSON = JSON.stringify(def, null, 2);
          this.jsonDialogVisible = true;
        } catch (error) {
          this.msgError("解析工作流定义失败");
        }
      } else {
        this.msgWarning("该工作流暂无定义");
      }
    },
    /** 复制JSON */
    copyJSON() {
      const textarea = document.createElement("textarea");
      textarea.value = this.workflowJSON;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      this.msgSuccess("已复制到剪贴板");
    },
    /** 规范化步骤数据 */
    normalizeStep(step) {
      const nextSteps = step.next_steps || step.nextSteps || [];
      const parallelTasks = step.parallel_tasks || step.parallelTasks || [];
      return {
        id: step.id,
        type: step.type,
        name: step.name,
        description: step.description,
        condition: step.condition || "",
        timeout: step.timeout,
        retries: step.retries,
        params: step.params,
        next_steps: Array.isArray(nextSteps) ? nextSteps : [],
        parallel_tasks: (Array.isArray(parallelTasks) ? parallelTasks : []).map((t) =>
          this.normalizeStep(t)
        ),
      };
    },
    /** 计算查看模式的根节点 ID */
    getViewRootIds() {
      const allIds = (this.viewSteps || []).map((s) => s.id).filter(Boolean);
      const referenced = new Set();

      const collectRefs = (node) => {
        if (!node) return;
        (this.getViewNextIds(node) || []).forEach((id) => referenced.add(id));
        const pts = this.getViewParallelTasks(node) || [];
        pts.forEach((t) => {
          if (t && t.id) referenced.add(t.id);
          collectRefs(t);
        });
      };

      (this.viewSteps || []).forEach((s) => collectRefs(s));

      const roots = allIds.filter((id) => !referenced.has(id));
      return roots.length ? roots : allIds.length ? [allIds[0]] : [];
    },
    /** 获取查看模式的节点 */
    getViewNodeById(id) {
      if (!id) return null;
      const direct = this.viewSteps.find((s) => s.id === id);
      if (direct) return direct;

      const walk = (tasks) => {
        if (!Array.isArray(tasks)) return null;
        for (const t of tasks) {
          if (t && t.id === id) return t;
          const found = walk(t && t.parallel_tasks);
          if (found) return found;
        }
        return null;
      };

      for (const s of this.viewSteps) {
        const found = walk(s && s.parallel_tasks);
        if (found) return found;
      }

      return null;
    },
    /** 获取查看模式的下一步 ID */
    getViewNextIds(node) {
      const next = (node && (node.next_steps || node.nextSteps)) || [];
      return Array.isArray(next) ? next : [];
    },
    /** 获取查看模式的并行任务 */
    getViewParallelTasks(node) {
      const tasks = (node && (node.parallel_tasks || node.parallelTasks)) || [];
      return Array.isArray(tasks) ? tasks : [];
    },
  },
};
</script>

<style lang="scss">
.app-container {
  padding: 20px;
}

.designer-wrapper {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background: #f5f7fa;
}

.workflow-view-section {
  margin-top: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  .workflow-graph-container {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 30px;
    min-height: 300px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 250px;
      color: #999;

      i {
        font-size: 64px;
        margin-bottom: 15px;
        color: #dcdfe6;
      }

      p {
        font-size: 14px;
      }
    }

    .workflow-tree-view {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 10px 0 30px;
      min-width: max-content;
      overflow-x: auto;

      .roots-row {
        display: flex;
        gap: 32px;
        align-items: flex-start;
      }

      .wf-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      .node-card {
        width: 240px;
        background: #ffffff;
        border: 2px solid #d9d9d9;
        border-radius: 10px;
        padding: 10px 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        transition: all 0.15s ease;
      }

      .node-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .node-card.t-user_task {
        border-left: 4px solid #409eff;
      }
      .node-card.t-process {
        border-left: 4px solid #67c23a;
      }
      .node-card.t-parallel {
        border-left: 4px solid #e6a23c;
      }
      .node-card.t-complete {
        border-left: 4px solid #909399;
      }

      .node-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .node-type {
        font-size: 12px;
        font-weight: 700;
        color: #606266;
      }

      .node-title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2d3d;
        line-height: 1.3;
        word-break: break-all;
      }

      .node-sub {
        margin-top: 6px;
        font-size: 12px;
        color: #909399;
        word-break: break-all;
      }

      .wf-next {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 12px;
      }

      .wf-branches,
      .wf-parallel {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 14px;
      }

      .wf-children-row {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        padding-top: 10px;
        min-width: max-content;
      }

      .wf-line-vert {
        width: 2px;
        height: 16px;
        background: #dcdfe6;
      }

      .wf-line-horz {
        height: 2px;
        width: calc(100% - 40px);
        background: #dcdfe6;
      }

      .wf-join {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 10px;
      }
    }

    .steps-flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;

      .flow-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 500px;

        .step-card {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #409eff;
          border-radius: 8px;
          padding: 20px;
          width: 100%;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
            transform: translateY(-2px);
          }

          .step-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;

            i {
              font-size: 24px;
              color: white;
            }
          }

          .step-content {
            flex: 1;

            .step-type-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 5px;
            }

            .step-name {
              font-size: 16px;
              font-weight: bold;
              color: #303133;
              margin-bottom: 5px;
            }

            .step-desc {
              font-size: 13px;
              color: #606266;
              line-height: 1.5;
            }
          }
        }

        .flow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;

          i {
            font-size: 28px;
            color: #409eff;
            animation: bounce 2s infinite;
          }
        }
      }
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

.json-viewer {
  .json-textarea {
    ::v-deep .el-textarea__inner {
      font-family: "Courier New", Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      background-color: #f5f7fa;
      color: #333;
    }
  }
}
</style>
