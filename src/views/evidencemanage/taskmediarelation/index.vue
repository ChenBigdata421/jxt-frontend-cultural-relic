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

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
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
          @sort-change="handleSortChang"
        >
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
                  v-permisaction="['task:bwc:link']"
                  size="small"
                  type="text"
                  icon="el-icon-link"
                  class="action-btn tertiary"
                  @click="handleLinkMedia(scope.row)"
                >
                  已包含媒体
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
      </el-card>

      <!-- 第一层抽屉：已关联媒体列表 -->
      <el-drawer
        :title="`任务【${
          currentTask ? currentTask.code : ''
        }】已包含的媒体`"
        :visible.sync="showMediaDrawer"
        direction="rtl"
        size="60%"
        :before-close="handleCloseMediaDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-drawer"
      >
        <!-- 关联媒体操作按钮 -->
        <div class="drawer-content">
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleOpenMediaSelector"
              >追加媒体</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnlinkMedia"
              >批量移除媒体</el-button>
            </el-col>
          </el-row>

          <!-- 关联媒体列表 -->
          <el-table
            ref="mediaRelationsTable"
            v-loading="relationsLoading"
            :data="mediaRelationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              prop="taskCode"
              label="任务编号"
              align="center"
            />
            <el-table-column prop="mediaName" label="媒体名称" />
            <el-table-column prop="mediaCate" label="媒体类别" align="center">
              <template slot-scope="{ row }">
                {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column prop="policeName" label="追加人" align="center" />
            <el-table-column prop="orgFullName" label="追加人组织" />
            <el-table-column prop="createdAt" label="追加时间" align="center">
              <template slot-scope="{ row }">
                {{ parseTime(row.relationTime || row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="handleUnlinkMedia(scope.row)"
                >移除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div
            v-if="!(mediaRelationsList && mediaRelationsList.length)"
            class="empty-data"
          >
            <el-empty description="暂无关联媒体" :image-size="100" />
          </div>
          <!-- 分页 -->
          <pagination
            v-show="relationTotal > 0"
            :total="relationTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadTaskMediaRelations"
          />
        </div>

        <!-- 底部操作栏 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseMediaDrawer()">关闭</el-button>
        </div>
      </el-drawer>

      <!-- 第二层抽屉：未关联媒体选择器 -->
      <el-drawer
        title="关联新媒体"
        :visible.sync="mediaSelectorDrawerOpen"
        direction="rtl"
        size="70%"
        :before-close="handleCloseSelectorDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-selector-drawer"
      >
        <div class="drawer-content">
          <!-- 媒体选择器 -->
          <MediaSelector
            ref="mediaSelector"
            :selection-mode="true"
            :multiple="true"
            :custom-list-api="getUnassociatedMediaListApi"
            @select="handleMediaSelect"
            @selection-change="handleMediaSelectionChange"
          />
        </div>

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseSelectorDrawer">取消</el-button>
          <el-button type="primary" size="small" @click="confirmLinkMedia">确定</el-button>
        </div>
      </el-drawer>

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
    </template>
  </BasicLayout>
</template>
<script>
import {
  addTaskMediaRelations,
  delTaskMediaRelations,
  batchDelTaskMediaRelations
} from '@/api/evidence/evidence_manage_command_api'
import {
  getTaskList,
  getTaskMediaRelationsByTaskId,
  getUnassociatedMediaByTaskId
} from '@/api/evidence/evidence_manage_query_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import MediaSelector from '@/components/MediaSelector'
import AssignmentQueryBar from '@/components/AssignmentQueryBar'

export default {
  name: 'TaskMediaRelation',
  components: {
    MediaSelector,
    AssignmentQueryBar
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
      // 关联状态数据字典
      taskRelationStatusOptions: [],
      // 任务类型数据字典
      taskTypeOptions: [],
      // 详情对话框折叠状态
      activeDetailSections: ['basic', 'organization', 'timeline', 'status'],
      // 当前选中的任务记录
      currentTask: null,
      // 详情数据
      viewData: {},
      // 是否显示详情对话框
      ViewOpen: false,
      // 组织树选项
      orgOptions: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        type: undefined,
        status: undefined,
        chargeUserIds: undefined
      },
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      // 警情媒体关联列表
      mediaRelationsList: [],
      // 媒体关联列表加载状态
      relationsLoading: false,
      relationTotal: 0,
      // 选中的媒体列表
      selectedMediaList: [],
      // 选中的已关联媒体列表（用于批量取消关联）
      selectedMediaRelations: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedMediaRelationMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringMediaRelationSelection: false,
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储类型选项
      storageTypeOptions: [],
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10
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
        { prop: 'orgJc', label: '组织简称', defaultVisible: false },
        { prop: 'createUserName', label: '创建用户', defaultVisible: false },
        { prop: 'createTime', label: '创建时间', defaultVisible: false },
        { prop: 'startTime', label: '开始时间', defaultVisible: true },
        { prop: 'endTime', label: '结束时间', defaultVisible: false },
        { prop: 'result', label: '任务结果', defaultVisible: true },
        { prop: 'status', label: '状态', defaultVisible: true }
      ],
      // 可见列
      visibleColumns: []
    }
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentTask || !this.currentTask.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 }})
        }
      }
      return (query) => {
        return getUnassociatedMediaByTaskId(
          this.currentTask.id,
          query
        )
      }
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
  created() {
    this.initVisibleColumns()
    this.getTreeselect()

    Promise.all([
      this.getDicts('task_status'),
      this.getDicts('task_type'),
      this.getDicts('relation_status'),
      this.getDicts('evidence_media_type'),
      this.getDicts('evidence_storage_type')
    ])
      .then(([statusRes, taskTypeRes, relationStatusRes, mediaCateRes, storageTypeRes]) => {
        this.statusOptions = statusRes.data
        this.taskTypeOptions = taskTypeRes.data
        this.taskRelationStatusOptions = relationStatusRes.data
        this.mediaCateOptions = mediaCateRes.data
        this.storageTypeOptions = storageTypeRes.data
        this.getList()
      })
      .catch((error) => {
        console.error('[TaskMediaRelation] 字典加载失败:', error)
        this.getList()
      })
  },
  methods: {
    /** ----------------主界面--------------- */
    getStatusClass(status) {
      const statusMap = {
        0: 'pending',
        1: 'processing',
        2: 'completed',
        3: 'archived'
      }
      return statusMap[status] || 'pending'
    },

    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    taskTypeFormat(row) {
      return this.selectDictLabel(this.taskTypeOptions, row.type)
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
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        const advancedFields = [
          'chargeUserIds', 'context', 'address', 'orgId',
          'startTimeStart', 'startTimeEnd',
          'endTimeStart', 'endTimeEnd'
        ]
        advancedFields.forEach(field => {
          if (!(field in filterData)) {
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
        status: undefined,
        chargeUserIds: undefined,
        startTimeStart: undefined,
        startTimeEnd: undefined,
        endTimeStart: undefined,
        endTimeEnd: undefined,
        createUserId: undefined
      }
      this.handleQuery()
    },

    handleRefresh() {
      this.getList()
    },

    initVisibleColumns() {
      const saved = localStorage.getItem('task_media_relation_visible_columns')
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
        'task_media_relation_visible_columns',
        JSON.stringify(val)
      )
    },

    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop)
      localStorage.setItem(
        'task_media_relation_visible_columns',
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
    },

    /** 查询任务列表 */
    getList() {
      this.loading = true
      const query = { ...this.queryParams }
      Object.keys(query).forEach((key) => {
        if (query[key] === '' || query[key] === null) {
          delete query[key]
        }
      })
      getTaskList(query).then((response) => {
        this.taskList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
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

    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = { ...(row || {}) }
      this.ViewOpen = true
      this.title = '任务信息'
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** --------第一层抽屉----------------- */

    /** 关联媒体按钮操作 - 打开第一层抽屉 */
    handleLinkMedia(row) {
      this.currentTask = row
      this.showMediaDrawer = true
      this.loadTaskMediaRelations(row.id)
    },

    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false
      this.currentTask = null
      this.mediaRelationsList = []
      this.selectedMediaRelationMap = {}
      this.selectedMediaRelations = []
      if (done) {
        done()
      }
    },

    /** 加载任务媒体关联列表 */
    loadTaskMediaRelations() {
      this.relationsLoading = true
      getTaskMediaRelationsByTaskId(
        this.currentTask.id,
        this.relationQueryParams
      )
        .then((response) => {
          if (response.code === 200) {
            this.mediaRelationsList = response.data.list || []
            this.relationTotal = response.data.count || 0
            this.restoreMediaRelationSelection()
          } else {
            console.error('加载媒体关联列表失败:', response.msg)
            this.msgError(response.msg || '加载媒体关联列表失败')
            this.mediaRelationsList = []
            this.relationTotal = 0
          }
        })
        .catch((error) => {
          console.error('加载媒体关联列表失败:', error)
          this.msgError(
            '加载媒体关联列表失败：' + (error.message || '未知错误')
          )
          this.mediaRelationsList = []
          this.relationTotal = 0
        })
        .finally(() => {
          this.relationsLoading = false
        })
    },

    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm('确认移除该媒体吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const previousCursor = document.body.style.cursor
        document.body.style.cursor = 'wait'

        const loadingInstance = this.$loading({
          lock: true,
          text: '正在移除...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })

        try {
          const response = await delTaskMediaRelations(row.id)

          if (response.code === 200) {
            await this.delay(2000)
            this.loadTaskMediaRelations(
              this.currentTask.id
            )
            this.getList()

            this.msgSuccess(response.msg || '移除成功')
          } else {
            this.msgError(response.msg || '移除失败')
          }
        } finally {
          document.body.style.cursor = previousCursor
          loadingInstance.close()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('移除失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 已关联媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      if (this.isRestoringMediaRelationSelection) {
        return
      }
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.mediaRelationsList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedMediaRelationMap[id] = row
        } else {
          delete this.selectedMediaRelationMap[id]
        }
      })
      this.selectedMediaRelations = Object.values(
        this.selectedMediaRelationMap
      ).filter(Boolean)
    },

    /** 恢复已关联媒体的选中状态 */
    restoreMediaRelationSelection() {
      if (this.isRestoringMediaRelationSelection) return
      if (!this.$refs.mediaRelationsTable) return
      if (!this.mediaRelationsList || !this.mediaRelationsList.length) return

      this.isRestoringMediaRelationSelection = true
      this.$nextTick(() => {
        try {
          this.mediaRelationsList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedMediaRelationMap[id]) {
              this.$refs.mediaRelationsTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringMediaRelationSelection = false
        }
      })
    },

    /** 批量取消关联媒体 */
    async handleBatchUnlinkMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError('请选择要移除的媒体')
        return
      }

      try {
        await this.$confirm(
          `确认移除选中的 ${this.selectedMediaRelations.length} 个媒体吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const previousCursor = document.body.style.cursor
        document.body.style.cursor = 'wait'

        const loadingInstance = this.$loading({
          lock: true,
          text: '正在批量移除...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })

        try {
          const relationIds = this.selectedMediaRelations.map(
            (item) => item.id
          )

          const response = await batchDelTaskMediaRelations({
            relationIds: relationIds
          })

          if (response.code === 200) {
            await this.delay(2000)
            this.selectedMediaRelationMap = {}
            this.selectedMediaRelations = []
            this.loadTaskMediaRelations(
              this.currentTask.id
            )
            this.getList()

            this.msgSuccess(
              response.msg ||
                `成功移除 ${
                  response.data?.deletedCount || relationIds.length
                } 个媒体`
            )
          } else {
            this.msgError(response.msg || '批量移除失败')
          }
        } finally {
          document.body.style.cursor = previousCursor
          loadingInstance.close()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('批量移除失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 打开第二层抽屉 - 关联新媒体 */
    handleOpenMediaSelector() {
      this.selectedMediaList = []
      this.mediaSelectorDrawerOpen = true
      this.$nextTick(() => {
        if (this.$refs.mediaSelector) {
          this.$refs.mediaSelector.clearSelection()
          this.$refs.mediaSelector.refreshList()
        }
      })
    },

    /** 关闭第二层抽屉 */
    handleCloseSelectorDrawer(done) {
      this.mediaSelectorDrawerOpen = false
      this.selectedMediaList = []
      if (done) {
        done()
      }
    },

    /** 检查媒体关联状态(单选时触发) */
    handleMediaSelect(row) {
      const taskCode = row.taskCode
      if (taskCode) {
        if (
          this.currentTask &&
          taskCode === this.currentTask.code
        ) {
          this.$confirm(
            `媒体"${row.mediaName}"已与当前任务"${taskCode}"关联`,
            '提示',
            {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'information'
            }
          )
        } else {
          this.$confirm(
            `本次关联之前，媒体"${row.mediaName}"将自动先与任务"${taskCode}"解除关联`,
            '提示',
            {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'warning'
            }
          )
        }
      }
    },

    /** 媒体选择变化 */
    handleMediaSelectionChange(selection) {
      this.selectedMediaList = selection
    },

    /** 确认关联媒体 */
    async confirmLinkMedia() {
      if (!this.selectedMediaList || this.selectedMediaList.length === 0) {
        this.msgError('请选择要关联的媒体')
        return
      }

      // 过滤掉已经与该任务关联的媒体
      const selectedMediaRelations = this.selectedMediaList.filter((item) => {
        const taskCode = item.taskCode
        return taskCode !== this.currentTask.code
      })

      const alreadyLinkedCount =
        this.selectedMediaList.length - selectedMediaRelations.length

      if (alreadyLinkedCount > 0) {
        this.$message({
          type: 'warning',
          message: `已过滤 ${alreadyLinkedCount} 个已关联当前任务的媒体`,
          duration: 3000
        })
      }

      if (!selectedMediaRelations || selectedMediaRelations.length === 0) {
        this.msgError('所选媒体均已关联当前任务,请重新选择')
        return
      }

      const previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'

      const loadingInstance = this.$loading({
        lock: true,
        text: '正在关联媒体...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })

      try {
        const data = {
          taskId: this.currentTask.id,
          mediaIds: selectedMediaRelations.map((item) => item.mediaId)
        }

        const response = await addTaskMediaRelations(data)

        if (response.code === 200) {
          this.mediaSelectorDrawerOpen = false

          await this.delay(2000)
          this.loadTaskMediaRelations(this.currentTask.id)
          this.getList()

          this.msgSuccess(
            response.msg || `成功关联 ${selectedMediaRelations.length} 个媒体`
          )
        } else {
          this.msgError(response.msg || '关联失败')
        }
      } catch (error) {
        this.msgError('关联失败：' + (error.message || '未知错误'))
      } finally {
        document.body.style.cursor = previousCursor
        loadingInstance.close()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

/* 本页面使用的样式类已全部在全局样式中定义 */
</style>
