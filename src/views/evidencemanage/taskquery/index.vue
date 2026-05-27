<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <AssignmentQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          :task-type-options="taskTypeOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @filter-change="handleFilterChange"
          @filter-reset="handleFilterReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedTasks.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['task:bwc:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增任务
            </el-button>
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-button
              v-permisaction="['task:bwc:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['task:bwc:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedTasks.length === 0"
              @click="handleBatchDeleteSelected"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="300"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
              @after-enter="handleColumnSettingsOpen"
              @after-leave="handleColumnSettingsClose"
            >
              <div
                role="dialog"
                aria-label="列显示设置"
                class="column-settings"
              >
                <div class="column-settings-header">
                  <span class="column-settings-title">列显示设置</span>
                  <el-button
                    type="text"
                    size="small"
                    class="column-settings-reset"
                    @click="resetColumns"
                  >
                    重置
                  </el-button>
                </div>
                <el-checkbox-group
                  v-model="visibleColumns"
                  @change="handleColumnChange"
                >
                  <div
                    v-for="col in columnOptions"
                    :key="col.prop"
                    class="column-item"
                  >
                    <el-checkbox
                      :label="col.prop"
                      :disabled="col.fixed"
                      :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
                    >
                      {{ col.label }}
                      <el-tooltip
                        v-if="col.fixed"
                        content="此列必须显示，不能隐藏"
                        placement="top"
                      >
                        <i class="el-icon-info column-item-icon" />
                      </el-tooltip>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button
                slot="reference"
                size="small"
                icon="el-icon-setting"
                type="text"
                class="action-btn tertiary"
                aria-label="打开列设置"
                aria-haspopup="dialog"
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <el-table
          ref="taskTable"
          :key="'task-table-' + taskList.length"
          v-loading="loading"
          :data="taskList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            v-if="isColumnVisible('code')"
            prop="code"
            label="任务编号"
            width="160"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            prop="name"
            label="任务名称"
            width="140"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('type')"
            prop="type"
            label="任务类型"
            width="120"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ taskTypeFormat(row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('context')"
            prop="context"
            label="任务内容"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            prop="address"
            label="任务地址"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('picNames')"
            prop="picNames"
            label="负责人姓名"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgName')"
            prop="orgName"
            label="组织名称"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgCode')"
            prop="orgCode"
            label="组织编码"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgJc')"
            prop="orgJc"
            label="组织简称"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('createUserName')"
            prop="createUserName"
            label="创建用户"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('createUserNo')"
            prop="createUserNo"
            label="创建用户编号"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('updateUserName')"
            prop="updateUserName"
            label="更新用户"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('updateUserNo')"
            prop="updateUserNo"
            label="更新用户编号"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('createTime')"
            prop="createTime"
            label="创建时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('startTime')"
            prop="startTime"
            label="开始时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('endTime')"
            prop="endTime"
            label="结束时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('result')"
            prop="result"
            label="任务结果"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            prop="status"
            label="状态"
            width="120"
          >
            <template slot-scope="{ row }">
              <div class="status-cell">
                <span
                  class="status-dot"
                  :class="getStatusClass(row.status)"
                />
                <span class="status-text">{{ statusFormat(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="240"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['task:bwc:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['task:bwc:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['task:bwc:remove']"
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改任务对话框 -->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="800px"
          :close-on-click-modal="false"
          append-to-body
          custom-class="edit-dialog"
        >
          <el-form
            ref="form"
            :model="form"
            :rules="rules"
          >
            <el-collapse v-model="activeFormSections" class="form-collapse">

              <!-- 基础信息 -->
              <el-collapse-item name="basic" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-document section-icon" />
                    <span class="section-title">基础信息</span>
                    <span class="section-badge">{{ basicFieldCount }}项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="任务名称" prop="name">
                      <el-input
                        v-model="form.name"
                        placeholder="请输入任务名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="负责组织" prop="orgId">
                      <treeselect
                        v-model="form.orgId"
                        :options="orgOptions"
                        placeholder="请选择负责组织"
                        :editable="false"
                        :append-to-body="true"
                        :z-index="9999"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="负责人" prop="picIds">
                      <el-select
                        v-model="form.picIds"
                        multiple
                        filterable
                        placeholder="请选择负责人"
                        collapse-tags
                        collapse-tags-tooltip
                        class="full-width"
                      >
                        <el-option
                          v-for="user in userOptions"
                          :key="user.userId"
                          :label="user.userName"
                          :value="user.userId"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="任务状态" prop="status">
                      <el-select v-model="form.status" placeholder="请选择任务状态">
                        <el-option
                          v-for="dict in statusOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="Number(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="任务类型" prop="taskType">
                      <el-select v-model="form.taskType" placeholder="请选择任务类型">
                        <el-option
                          v-for="dict in taskTypeOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="Number(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="任务内容" prop="context">
                      <el-input
                        v-model="form.context"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入任务内容"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="任务地址" prop="address">
                      <el-input
                        v-model="form.address"
                        placeholder="请输入任务地址"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 时间信息 -->
              <el-collapse-item name="timeline" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-time section-icon" />
                    <span class="section-title">时间信息</span>
                    <span class="section-badge">{{ timelineFieldCount }}项</span>
                  </div>
                </template>

                <el-row :gutter="20" class="time-inputs">
                  <el-col :span="12">
                    <el-form-item label="创建时间">
                      <el-date-picker
                        v-model="form.createTime"
                        type="datetime"
                        placeholder="选择创建时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="开始时间">
                      <el-date-picker
                        v-model="form.startTime"
                        type="datetime"
                        placeholder="选择开始时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="结束时间">
                      <el-date-picker
                        v-model="form.endTime"
                        type="datetime"
                        placeholder="选择结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 业务信息 -->
              <el-collapse-item name="business" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-user section-icon" />
                    <span class="section-title">业务信息</span>
                    <span class="section-badge">{{ businessFieldCount }}项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="任务结果" prop="result">
                      <el-input
                        v-model="form.result"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入任务结果"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

            </el-collapse>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="tertiary" size="small" @click="cancel">取 消</el-button>
            <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
          </div>
        </el-dialog>

        <!--显示详情-->
        <el-dialog
          title="任务详情"
          :visible.sync="ViewOpen"
          width="800px"
          append-to-body
          :close-on-click-modal="false"
          custom-class="detail-dialog"
        >
          <el-collapse v-model="activeDetailSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">{{ detailBasicFieldCount }}项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="任务编号">
                  <span class="nowrap-text">{{ viewData.code || "-" }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="任务名称">
                  {{ viewData.name || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="任务内容" :span="2">
                  {{ viewData.context || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="任务地址" :span="2">
                  {{ viewData.address || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

            <!-- 组织信息 -->
            <el-collapse-item name="organization" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-office-building section-icon" />
                  <span class="section-title">组织信息</span>
                  <span class="section-badge">{{ detailOrganizationFieldCount }}项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="组织名称">
                  {{ viewData.orgName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="组织编码">
                  <span class="nowrap-text">{{ viewData.orgCode || "-" }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="组织简称">
                  {{ viewData.orgJc || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

            <!-- 时间信息 -->
            <el-collapse-item name="timeline" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-time section-icon" />
                  <span class="section-title">时间信息</span>
                  <span class="section-badge">{{ detailTimelineFieldCount }}项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="创建时间">
                  {{ parseTime(viewData.createTime) || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="开始时间">
                  {{ parseTime(viewData.startTime) || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="结束时间">
                  {{ parseTime(viewData.endTime) || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

            <!-- 状态与操作 -->
            <el-collapse-item name="status" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">状态与操作</span>
                  <span class="section-badge">{{ detailStatusFieldCount }}项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="状态">
                  <el-tag
                    :type="viewData.status === 1 ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ statusFormat(viewData) || "-" }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="是否关联">
                  <el-tag
                    :type="viewData.isRelation === 1 ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ selectDictLabel(taskRelationStatusOptions, viewData.isRelation) || "-" }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="任务结果" :span="2">
                  {{ viewData.result || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="创建用户">
                  {{ viewData.createUserName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="创建用户编号">
                  {{ viewData.createUserNo || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="更新用户">
                  {{ viewData.updateUserName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="更新用户编号">
                  {{ viewData.updateUserNo || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

          </el-collapse>

          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="action-btn tertiary" size="small" @click="ViewOpen = false">关闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>
<script>
import {
  delTaskById,
  addTask,
  updateTask,
  batchDelTask
} from '@/api/evidence/evidence_manage_command_api'
import {
  getTaskList,
  getTask
} from '@/api/evidence/evidence_manage_query_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import AssignmentQueryBar from '@/components/AssignmentQueryBar'
import BatchActionBar from '@/components/BatchActionBar/index.vue'

export default {
  name: 'TaskQuery',
  components: {
    Treeselect,
    AssignmentQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 任务数据
      taskList: [],
      // 状态数据字典
      statusOptions: [],
      // 任务类型数据字典
      taskTypeOptions: [],
      // 关联状态数据字典
      taskRelationStatusOptions: [],
      // 负责人选项（根据组织联动）
      userOptions: [],
      // 首次加载标记（修改时不清空已选负责人）
      firstLoad: null,
      // 弹出层标题
      title: '',
      isEdit: false,
      // 使用 Map 存储所有选中的项（跨分页）
      selectedTaskMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的任务记录
      selectedTasks: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 是否显示增加任务对话框
      open: false,
      ViewOpen: false,
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 详情对话框折叠状态
      activeDetailSections: ['basic', 'timeline', 'status'],
      // 详情数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        type: undefined,
        context: undefined,
        address: undefined,
        orgId: undefined,
        chargeUserIds: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        name: undefined,
        context: undefined,
        address: undefined,
        orgId: undefined,
        createTime: undefined,
        startTime: undefined,
        endTime: undefined,
        result: undefined,
        status: 0,
        taskType: undefined,
        picIds: [],
        isRelation: undefined
      },
      // 表单校验规则
      rules: {
        name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
        orgId: [{ required: true, message: '请选择负责组织', trigger: 'change' }]
      },
      // 列配置选项
      columnOptions: [
        { prop: 'code', label: '任务编号', fixed: true, defaultVisible: true },
        { prop: 'name', label: '任务名称', defaultVisible: true },
        { prop: 'type', label: '任务类型', defaultVisible: true },
        { prop: 'context', label: '任务内容', defaultVisible: false },
        { prop: 'address', label: '任务地址', defaultVisible: true },
        { prop: 'picNames', label: '负责人姓名', defaultVisible: true },
        { prop: 'orgName', label: '组织名称', defaultVisible: true },
        { prop: 'orgCode', label: '组织编码', defaultVisible: false },
        { prop: 'orgJc', label: '组织简称', defaultVisible: false },
        { prop: 'createUserName', label: '创建用户', defaultVisible: false },
        { prop: 'createUserNo', label: '创建用户编号', defaultVisible: false },
        { prop: 'updateUserName', label: '更新用户', defaultVisible: false },
        { prop: 'updateUserNo', label: '更新用户编号', defaultVisible: false },
        { prop: 'createTime', label: '创建时间', defaultVisible: true },
        { prop: 'startTime', label: '开始时间', defaultVisible: true },
        { prop: 'endTime', label: '结束时间', defaultVisible: false },
        { prop: 'result', label: '任务结果', defaultVisible: true },
        { prop: 'status', label: '状态', defaultVisible: true }
      ],
      // 可见列
      visibleColumns: [],
      processingInstance: null,
      previousCursor: null
    }
  },
  computed: {
    basicFieldCount() {
      return 7
    },
    timelineFieldCount() {
      return 3
    },
    businessFieldCount() {
      return 1
    },
    detailBasicFieldCount() {
      return 4
    },
    detailOrganizationFieldCount() {
      return 3
    },
    detailTimelineFieldCount() {
      return 3
    },
    detailStatusFieldCount() {
      return 6
    }
  },
  watch: {
    'form.orgId': function(newVal) {
      // 当组织变化时，加载该组织的用户列表
      if (newVal) {
        if (this.firstLoad !== true) {
          // 非首次加载时，清空已选负责人
          this.form.picIds = []
        }
        this.firstLoad = false
        this.getFormUser()
      }
    }
  },
  created() {
    this.initVisibleColumns()
    this.getTreeselect()

    Promise.all([
      this.getDicts('task_status'),
      this.getDicts('task_type'),
      this.getDicts('relation_status')
    ])
      .then(([statusRes, taskTypeRes, relationStatusRes]) => {
        this.statusOptions = statusRes.data
        this.taskTypeOptions = taskTypeRes.data
        this.taskRelationStatusOptions = relationStatusRes.data
        this.getList()
      })
      .catch((error) => {
        console.error('[TaskQuery] 字典加载失败:', error)
        this.getList()
      })
  },
  methods: {
    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'startTimeStart' ||
            key === 'startTimeEnd' ||
            key === 'endTimeStart' ||
            key === 'endTimeEnd') &&
          typeof value === 'string'
        ) {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString()
          }
        }
      })
      return query
    },
    taskRelationStatusFormat(row) {
      return this.selectDictLabel(
        this.taskRelationStatusOptions,
        row.isRelation
      )
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    taskTypeFormat(row) {
      return this.selectDictLabel(this.taskTypeOptions, row.type)
    },
    /** 查询任务列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      getTaskList(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.taskList = response.data.list
            this.total = response.data.count
            this.restoreSelection()
          } else {
            this.taskList = []
            this.total = 0
            this.msgError(response.msg || '获取任务列表失败')
          }
        })
        .catch((error) => {
          this.taskList = []
          this.total = 0
          this.msgError('查询任务列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },

    /** 获取表单组织的用户列表 */
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.form.orgId + '/' })
          .then((response) => {
            this.userOptions = response.data.list || []
            resolve('true')
          })
          .catch((error) => {
            console.error('获取用户失败:', error)
            this.userOptions = []
            reject(error)
          })
      })
    },

    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.taskTable) return
      if (!this.taskList || !this.taskList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.taskList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedTaskMap[id]) {
              this.$refs.taskTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
    },

    // 表单重置
    reset() {
      this.form = {
        name: undefined,
        context: undefined,
        address: undefined,
        orgId: undefined,
        createTime: undefined,
        startTime: undefined,
        endTime: undefined,
        result: undefined,
        status: 0,
        taskType: undefined,
        picIds: [],
        isRelation: undefined
      }
      this.firstLoad = null
      this.userOptions = []
      this.resetForm('form')
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    resetSelected() {
      this.selectedTaskMap = {}
      this.selectedTasks = []
    },

    resetPage() {
      this.queryParams.pageIndex = 1
    },

    handleQuery() {
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.taskList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedTaskMap[id] = row
        } else {
          delete this.selectedTaskMap[id]
        }
      })
      this.selectedTasks = Object.values(
        this.selectedTaskMap
      ).filter(Boolean)

      const totalCount = this.taskList.length
      const selectedCount = this.selectedTasks.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    /** 新增按钮操作*/
    handleAdd() {
      this.reset()
      this.firstLoad = null
      this.userOptions = []
      this.open = true
      this.title = '添加任务'
      this.isEdit = false
    },

    handleSortChang(column, prop, order) {
      prop = column.prop
      order = column.order
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }

      this.getList()
    },

    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      const quickSearchFields = ['code', 'name', 'type', 'status']

      const advancedFields = [
        'chargeUserIds', 'context', 'address', 'orgId',
        'startTimeStart', 'startTimeEnd',
        'endTimeStart', 'endTimeEnd'
      ]

      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      advancedFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      this.handleQuery()
    },

    handleQuickSearchReset() {
      this.handleFilterReset()
    },

    handleFilterChange(filterData) {
      if (filterData.filterType === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.startTimeStart = today.toISOString()
        delete this.queryParams.startTimeEnd
      } else if (filterData.filterType === 'mine') {
        const currentUser = this.$store.state.user && this.$store.state.user.user
        if (currentUser && currentUser.userId) {
          this.queryParams.createUserId = currentUser.userId
        }
      } else if (filterData.filterType === 'pending') {
        this.queryParams.status = 0
      } else if (filterData.filterType === 'archived') {
        this.queryParams.status = 3
      } else if (filterData.filterType === 'advanced') {
        // eslint-disable-next-line no-unused-vars
        const { filterType: _, ...actualFilterData } = filterData
        Object.assign(this.queryParams, actualFilterData)

        const advancedFields = [
          'chargeUserIds', 'context', 'address', 'orgId',
          'startTimeStart', 'startTimeEnd',
          'endTimeStart', 'endTimeEnd'
        ]
        advancedFields.forEach(field => {
          if (!(field in actualFilterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        delete this.queryParams.startTimeStart
        delete this.queryParams.startTimeEnd
        delete this.queryParams.createUserId
        delete this.queryParams.status
        delete this.queryParams.chargeUserIds
      }
      this.handleQuery()
    },

    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        type: undefined,
        context: undefined,
        address: undefined,
        orgId: undefined,
        chargeUserIds: undefined,
        status: undefined,
        startTimeStart: undefined,
        startTimeEnd: undefined,
        endTimeStart: undefined,
        endTimeEnd: undefined,
        createUserId: undefined
      }
      this.handleQuery()
    },

    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.taskTable.toggleAllSelection()
    },

    handleBatchDeleteSelected() {
      this.handleDelete()
    },

    handleRefresh() {
      this.getList()
    },

    getStatusClass(status) {
      const statusMap = {
        0: 'pending',
        1: 'processing',
        2: 'completed',
        3: 'archived'
      }
      return statusMap[status] || 'pending'
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedTasks[0]
          ? { ...this.selectedTasks[0] }
          : {}
      }
      this.title = '修改任务'
      this.isEdit = true
      this.open = true
    },

    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      this.previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'
    },

    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      document.body.style.cursor = this.previousCursor
    },

    /** 浏览按钮操作 */
    handleView(row) {
      const recordId = row.id
      getTask(recordId).then((response) => {
        if (response.code === 200) {
          this.viewData = { ...(response.data || {}) }
          this.ViewOpen = true
          this.title = '任务信息'
        }
      })
    },
    /** 将 form 对象中的时间字段转换为国际标准格式 */
    convertFormTimeToISO(formData = {}) {
      const form = { ...formData }
      const timeFields = [
        'createTime',
        'startTime',
        'endTime'
      ]

      timeFields.forEach((key) => {
        const value = form[key]
        if (value && typeof value === 'string') {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            form[key] = date.toISOString()
          }
        }
      })

      return form
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing('正在修改任务...')
            const formData = this.convertFormTimeToISO(this.form)
            updateTask(formData, formData.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('修改任务失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建任务...')
            const formData = this.convertFormTimeToISO(this.form)
            addTask(formData)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('新增任务失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },

    async handleDelete(row) {
      try {
        var taskIds
        if (row && row.id !== undefined) {
          taskIds = row.id
        } else {
          taskIds = this.selectedTasks.map(
            (item) => item.id
          )
        }

        const count = Array.isArray(taskIds) ? taskIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条任务记录？此操作不可恢复。`
          : `是否确认删除此条任务记录？此操作不可恢复。`

        await this.$confirm(
          confirmMessage,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        this.startProcessing('正在删除任务...')
        var response = null
        if (Array.isArray(taskIds)) {
          response = await batchDelTask({ ids: taskIds })
        } else {
          response = await delTaskById(taskIds)
        }
        if (response.code === 200) {
          await this.delay(2000)
          this.resetSelected()
          this.resetPage()
          this.getList()
          this.msgSuccess(response.msg || '删除任务成功')
        } else {
          this.msgError(response.msg || '删除任务失败')
        }
      } catch (error) {
        if (error.message !== 'cancel') {
          this.msgError('删除任务失败：' + (error.message || '未知错误'))
        }
      } finally {
        this.stopProcessing()
      }
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedTasks) &&
          this.selectedTasks.length > 0

        const count = hasSelection ? this.selectedTasks.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条任务数据？`
          : '是否确认导出所有任务数据项？'

        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })

        const columnOptions = Array.isArray(this.columnOptions)
          ? this.columnOptions
          : []
        const visibleColumns = Array.isArray(this.visibleColumns)
          ? this.visibleColumns
          : []
        const exportColumns = columnOptions.filter((c) =>
          visibleColumns.includes(c.prop)
        )

        if (!exportColumns.length) {
          this.msgError('当前未选择任何可导出的列')
          return
        }

        const tHeader = exportColumns.map((c) => c.label)
        const filterVal = exportColumns.map((c) => c.prop)

        let list = []
        if (hasSelection) {
          list = this.selectedTasks
        } else {
          const baseQueryParams = { ...(this.queryParams || {}) }
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await getTaskList(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询任务列表失败')
            }

            const pageList = (resp.data && resp.data.list) || []
            total = (resp.data && resp.data.count) || 0
            list = list.concat(pageList)

            if (!pageList.length) {
              break
            }
            pageIndex += 1
          }
        }

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row }
          output.status = this.statusFormat(row)
          output.isRelation = this.taskRelationStatusFormat(row)
          output.createTime = this.parseTime(row.createTime)
          output.startTime = this.parseTime(row.startTime)
          output.endTime = this.parseTime(row.endTime)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '任务列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },

    initVisibleColumns() {
      const saved = localStorage.getItem('task_query_visible_columns')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 自动补全新增的列
          const allProps = this.columnOptions.map((item) => item.prop)
          allProps.forEach((prop) => {
            if (!parsed.includes(prop)) {
              const opt = this.columnOptions.find((c) => c.prop === prop)
              if (opt && opt.defaultVisible) {
                parsed.push(prop)
              }
            }
          })
          this.visibleColumns = parsed
        } catch (error) {
          this.visibleColumns = this.columnOptions.map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions.map((item) => item.prop)
      }
    },

    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    handleColumnChange(val) {
      localStorage.setItem(
        'task_query_visible_columns',
        JSON.stringify(val)
      )
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop)
      localStorage.setItem(
        'task_query_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },

    handleColumnSettingsOpen() {
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },

    handleColumnSettingsClose() {
    }
  }
}
</script>
