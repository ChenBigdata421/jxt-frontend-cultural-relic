<template>
  <div class="archive-selector">
    <!-- 新的查询栏组件 -->
    <div class="search-section">
      <ArchiveQueryBar
        ref="queryBar"
        :status-options="statusOptions"
        :archive-type-options="archiveTypeOptions"
        @search="handleSearch"
        @quick-search-reset="handleQuickSearchReset"
        @filter-change="handleFilterChange"
        @filter-reset="handleFilterReset"
      />
    </div>

    <!-- 批量操作栏插槽 -->
    <slot name="batch-actions" />

    <!-- 主操作栏 -->
    <div class="main-action-bar">
      <div class="left-actions">
        <slot name="toolbar" />
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
            <el-checkbox-group v-model="visibleColumns" @change="handleColumnChange">
              <div v-for="col in columnOptions" :key="col.prop" class="column-item">
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

    <!-- 档案列表 -->
    <el-table
      ref="archiveTable"
      :key="'archive-table-' + archiveList.length"
      v-loading="loading"
      :data="archiveList"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 (单选和多选都使用checkbox) -->
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column
        v-if="isColumnVisible('archiveCode')"
        prop="archiveCode"
        label="档案编号"
        min-width="180"
        align="center"
        sortable="custom"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('archiveTitle')"
        prop="archiveTitle"
        label="档案标题"
        min-width="200"
        sortable="custom"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('archiveType')"
        prop="archiveType"
        label="档案类型"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag disable-transitions>{{
            archiveTypeFormat(scope.row)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('description')"
        prop="description"
        label="档案描述"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgName')"
        prop="orgName"
        label="管理部门"
        min-width="150"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgJc')"
        prop="orgJc"
        label="管理部门简称"
        min-width="140"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgCode')"
        prop="orgCode"
        label="管理部门编码"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgId')"
        prop="orgId"
        label="管理部门ID"
        width="140"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('storageDuration')"
        prop="storageDuration"
        label="保存期限(月)"
        width="120"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('expirationTime')"
        prop="expirationTime"
        label="过期时间"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          {{
            parseTime(row.expirationTime) === "2999-01-01 08:00:00" ||
              parseTime(row.expirationTime) === "2999-01-01 00:00:00"
              ? "永久"
              : parseTime(row.expirationTime) || "-"
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('lifecycleStatus')"
        prop="lifecycleStatus"
        label="生命周期状态"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="getLifecycleStatusType(row.lifecycleStatus)"
            disable-transitions
          >
            {{ lifecycleStatusFormat(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('status')"
        prop="status"
        label="状态"
        width="120"
        align="center"
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
        v-if="isColumnVisible('createUserName')"
        prop="createUserName"
        label="录入人员"
        min-width="120"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('createUserNo')"
        prop="createUserNo"
        label="录入人编号"
        min-width="140"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('updateUserName')"
        prop="updateUserName"
        label="更新人员"
        min-width="120"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('updateUserNo')"
        prop="updateUserNo"
        label="更新人编号"
        min-width="140"
        align="center"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('remarks')"
        prop="remarks"
        label="备注信息"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('createdAt')"
        prop="createdAt"
        label="录入时间"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('updatedAt')"
        prop="updatedAt"
        label="更新时间"
        width="180"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.updatedAt) }}
        </template>
      </el-table-column>
      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="360"
        align="center"
        class-name="small-padding fixed-width"
        :fixed="actionFixed ? 'right' : false"
      >
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-button
              size="small"
              type="text"
              icon="el-icon-view"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'view')"
            >详情</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-edit"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'edit')"
            >修改</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-delete"
              class="action-btn tertiary-danger"
              @click="handleOperation(scope.row, 'delete')"
            >删除</el-button>
            <!-- 自定义操作按钮插槽 -->
            <slot name="operation" :row="scope.row" />
          </div>
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
  </div>
</template>

<script>
import { listArchives } from '@/api/evidence/archive_api'
import ArchiveQueryBar from '@/components/ArchiveQueryBar/index.vue'
import actionColumnMixin from '@/mixins/actionColumnMixin'

export default {
  name: 'ArchiveSelector',
  mixins: [actionColumnMixin],
  components: { ArchiveQueryBar },
  props: {
    // 是否为选择模式（用于对话框中的档案选择）
    selectionMode: {
      type: Boolean,
      default: false
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 初始查询参数
    initialQuery: {
      type: Object,
      default: () => ({})
    },
    // 自定义档案列表API函数
    customListApi: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      tableRef: 'archiveTable',
      // 遮罩层
      loading: true,

      // 非单个禁用
      singleDisabled: true,
      // 非多个禁用
      multipleDisabled: true,
      // 总条数
      total: 0,
      // 档案数据
      archiveList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        status: undefined,
        description: undefined,
        remarks: undefined,
        createdAtStart: undefined,
        createdAtEnd: undefined,
        expirationTimeStart: undefined,
        expirationTimeEnd: undefined
      },
      // 档案类型选项
      archiveTypeOptions: [],
      // 状态选项
      statusOptions: [],
      // 列配置选项
      columnOptions: [
        { prop: 'archiveCode', label: '档案编号', fixed: true },
        { prop: 'archiveTitle', label: '档案标题', fixed: false },
        { prop: 'archiveType', label: '档案类型', fixed: false },
        { prop: 'description', label: '档案描述', fixed: false },
        { prop: 'orgName', label: '管理部门', fixed: false },
        { prop: 'orgJc', label: '管理部门简称', fixed: false },
        { prop: 'orgCode', label: '管理部门编码', fixed: false },
        { prop: 'storageDuration', label: '保存期限(月)', fixed: false },
        { prop: 'expirationTime', label: '过期时间', fixed: false },
        { prop: 'lifecycleStatus', label: '生命周期状态', fixed: false },
        { prop: 'status', label: '状态', fixed: false },
        { prop: 'createUserName', label: '录入人员', fixed: false },
        { prop: 'createUserNo', label: '录入人编号', fixed: false },
        { prop: 'updateUserName', label: '更新人员', fixed: false },
        { prop: 'updateUserNo', label: '更新人编号', fixed: false },
        { prop: 'remarks', label: '备注信息', fixed: false },
        { prop: 'createdAt', label: '录入时间', fixed: false },
        { prop: 'updatedAt', label: '更新时间', fixed: false }
      ],
      // 可见列（默认全部显示）
      visibleColumns: [],
      selectedArchiveMap: {},
      isRestoringSelection: false
    }
  },
  created() {
    // 初始化可见列
    this.initVisibleColumns()
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery }
    this.getList()
    this.getDicts('archive_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('archive_type').then((response) => {
      this.archiveTypeOptions = response.data
    })
  },
  methods: {
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    lifecycleStatusFormat(row) {
      const map = {
        active: '活跃',
        archived: '已归档',
        expired: '已过期',
        disposed: '已销毁'
      }
      return map[row.lifecycleStatus] || row.lifecycleStatus || '-'
    },

    getLifecycleStatusType(status) {
      const typeMap = {
        active: 'success',
        archived: '',
        expired: 'warning',
        disposed: 'danger'
      }
      return typeMap[status] || 'info'
    },

    archiveTypeFormat(row) {
      return this.selectDictLabel(this.archiveTypeOptions, row.archiveType)
    },
    /** 查询档案列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)

      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listArchives
      const apiFunc = this.customListApi || listArchives
      apiFunc(query)
        .then((response) => {
          if (response.code === 200) {
            this.archiveList = response.data.list || []
            this.total = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.archiveList = []
            this.total = 0
            this.msgError(response.msg || '查询档案失败')
          }
        })
        .catch((error) => {
          this.archiveList = []
          this.total = 0
          this.msgError('查询档案失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
          this.scheduleCheckActionFixed()
        })
    },

    /** 搜索按钮操作 */
    handleSearch(searchData) {
      // 快速搜索字段列表
      const quickSearchFields = ['archiveCode', 'archiveTitle', 'archiveType', 'status']

      // 高级筛选中的时间范围字段列表
      const timeRangeFields = [
        'createdAtStart', 'createdAtEnd',
        'expirationTimeStart', 'expirationTimeEnd'
      ]

      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的快速搜索字段
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      // 删除被清空的时间范围字段
      timeRangeFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      // 删除被清空的高级筛选字段
      const advancedFilterFields = ['description', 'remarks']
      advancedFilterFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      this.handleQuery()
    },

    /** 快速搜索重置 */
    handleQuickSearchReset() {
      // 重置所有筛选条件（与全局重置保持一致）
      this.handleFilterReset()
    },

    /** 筛选条件变化 */
    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'today') {
        // 今日创建
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.createdAtStart = today.toISOString()
        delete this.queryParams.createdAtEnd
      } else if (filterData.filterType === 'archiving') {
        // 归档中
        this.queryParams.status = 0
      } else if (filterData.filterType === 'archived') {
        // 已归档
        this.queryParams.status = 1
      } else if (filterData.filterType === 'expired') {
        // 已过期
        this.queryParams.status = 2
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数（移除 filterType，只保留实际的查询条件）
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        // 删除被清空的时间范围字段
        const timeRangeFields = [
          'createdAtStart', 'createdAtEnd',
          'expirationTimeStart', 'expirationTimeEnd'
        ]
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })

        // 删除被清空的高级筛选字段
        const advancedFilterFields = ['description', 'remarks']
        advancedFilterFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.createdAtStart
        delete this.queryParams.createdAtEnd
        delete this.queryParams.status
      }
      this.handleQuery()
    },

    /** 筛选条件重置 */
    handleFilterReset() {
      // 重置所有筛选条件到初始值
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        status: undefined,
        description: undefined,
        remarks: undefined,
        createdAtStart: undefined,
        createdAtEnd: undefined,
        expirationTimeStart: undefined,
        expirationTimeEnd: undefined
      }
      this.handleQuery()
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedArchiveMap = {}
      // 向父组件发送数据变化事件
      this.$emit(
        'selection-change',
        Object.values(this.selectedArchiveMap).filter(Boolean)
      )
    },

    /** 清空跨页选中（供外部调用） */
    clearSelection() {
      this.selectedArchiveMap = {}
      this.$emit('selection-change', [])
      this.$nextTick(() => {
        if (this.$refs.archiveTable) {
          this.$refs.archiveTable.clearSelection()
        }
      })
    },

    /** 全选/取消全选（供外部调用） */
    toggleAllSelection() {
      if (this.$refs.archiveTable) {
        this.$refs.archiveTable.toggleAllSelection()
      }
    },

    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
    },

    handleQuery() {
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        }
      })
      return query
    },

    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    /** 单个选择框点击事件 - 实现单选逻辑 */
    handleSelect(selection, row) {
      const isSelected = selection.some(
        (item) => item.archiveId === row.archiveId
      )
      // 如果是单选模式,清空其他选择,只保留当前选中的行
      if (!this.multiple) {
        this.$refs.archiveTable.clearSelection()
        this.$refs.archiveTable.toggleRowSelection(row, true)
      }
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit('select', row)
      }
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      // 向父组件发送选中数据变化事件
      if (this.isRestoringSelection) {
        return
      }
      // Boolean 是 JavaScript 内置函数，它会过滤掉数组中的假值（false、0、""、null、undefined、NaN）
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.archiveId).filter(Boolean)
      );

      (this.archiveList || []).forEach((row) => {
        const id = row && row.archiveId
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedArchiveMap[id] = row
        } else {
          delete this.selectedArchiveMap[id]
        }
      })
      // 向父组件发送“全量已选”的数据变化事件
      this.$emit(
        'selection-change',
        Object.values(this.selectedArchiveMap).filter(Boolean)
      )
    },

    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.archiveTable) return
      if (!this.archiveList || !this.archiveList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.archiveList.forEach((row) => {
            const id = row && row.archiveId
            if (!id) return
            if (this.selectedArchiveMap[id]) {
              this.$refs.archiveTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
    },

    /** 排序回调函数 */
    handleSortChange(column, prop, order) {
      prop = column.prop
      order = column.order
      if (this.order !== '' && this.order !== prop + 'Order') {
        this.queryParams[this.order] = undefined
      }
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
        this.order = prop + 'Order'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
        this.order = prop + 'Order'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }
      this.getList()
    },

    /** 获取状态对应的样式类名 */
    getStatusClass(status) {
      const statusMap = {
        0: 'pending', // 归档中
        1: 'archived', // 已归档
        2: 'completed' // 已过期
      }
      return statusMap[status] || 'pending'
    },

    // 以下方法仅在非选择模式下使用
    /** 新增按钮操作 */
    handleAdd() {
      this.$emit('add')
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      this.$emit('operation', row, action)
    },

    /** 刷新列表 */
    refreshList() {
      this.getList()
    },

    /** 初始化可见列 */
    initVisibleColumns() {
      // 从localStorage读取用户配置
      const savedColumns = localStorage.getItem('archive_visible_columns')
      if (savedColumns) {
        try {
          this.visibleColumns = JSON.parse(savedColumns)
        } catch (e) {
          // 如果解析失败，使用默认配置
          this.visibleColumns = this.columnOptions.map((col) => col.prop)
        }
      } else {
        // 默认显示所有列
        this.visibleColumns = this.columnOptions.map((col) => col.prop)
      }
    },

    /** 判断列是否可见 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    /** 列显示变化处理 */
    handleColumnChange(value) {
      // 保存到localStorage
      localStorage.setItem('archive_visible_columns', JSON.stringify(value))
    },

    /** 重置列显示 */
    resetColumns() {
      this.visibleColumns = this.columnOptions.map((col) => col.prop)
      localStorage.setItem(
        'archive_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },

    /** 列设置对话框打开后的焦点管理 */
    handleColumnSettingsOpen() {
      // 等待 DOM 更新后将焦点移到第一个复选框
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },

    /** 列设置对话框关闭后的焦点管理 */
    handleColumnSettingsClose() {
      // 焦点自动返回触发按钮，无需额外处理
    }
  }
}
</script>

<style scoped>
/*
  本组件样式说明：
  - .main-action-bar, .left-actions, .right-actions → src/styles/components/dialogs.scss
  - .action-btn.tertiary, .action-btn.tertiary-danger → src/styles/components/buttons.scss
  - .action-buttons, .small-padding → src/styles/components/forms.scss 和 table.scss
  - .status-cell, .status-dot, .status-text → src/styles/components/status.scss
  - .column-settings, .column-settings-header, .column-item → src/styles/components/forms.scss
*/
</style>
