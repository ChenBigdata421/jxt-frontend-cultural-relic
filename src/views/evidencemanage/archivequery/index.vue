<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用档案选择器组件 -->
        <ArchiveSelector
          ref="archiveSelector"
          :selection-mode="false"
          @update="handleUpdate"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 批量操作栏插槽 -->
          <template #batch-actions>
            <BatchActionBar
              :selected-count="selectedArchiveRecords.length"
              :is-indeterminate="isSelectionIndeterminate"
              :all-selected="isAllSelected"
              @select-all-change="handleSelectAll"
            />
          </template>
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-button
              v-permisaction="['archive:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >新增</el-button>
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >刷新</el-button>
            <el-button
              v-permisaction="['archive:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >导出</el-button>
            <el-button
              v-permisaction="['archive:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedArchiveRecords.length === 0"
              @click="handleDelete"
            >删除</el-button>
          </template>
          <!-- 自定义操作列插槽 -->
          <template #operation="{ row }">
            <div class="action-buttons">
              <el-button
                size="small"
                type="text"
                icon="el-icon-link"
                class="action-btn tertiary"
                @click="handleShowMedia(row)"
              >已归档媒体</el-button>
            </div>
          </template>
        </ArchiveSelector>
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="800px"
        :close-on-click-modal="false"
        append-to-body
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules">
          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">6项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="档案标题" prop="archiveTitle">
                    <el-input
                      v-model="form.archiveTitle"
                      placeholder="请输入档案标题"
                      maxlength="255"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="档案类型" prop="archiveType">
                    <el-select
                      v-model="form.archiveType"
                      placeholder="请选择档案类型"
                      class="full-width"
                    >
                      <el-option
                        v-for="dict in archiveTypeOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="保存期限(月)" prop="storageDuration">
                    <el-input-number
                      v-model="form.storageDuration"
                      :min="1"
                      :max="9999"
                      placeholder="请输入保存期限"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态" prop="status">
                    <el-select
                      v-model="form.status"
                      placeholder="请选择状态"
                      class="full-width"
                    >
                      <el-option
                        v-for="dict in statusOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="档案描述" prop="description">
                    <el-input
                      v-model="form.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入档案描述"
                      maxlength="1024"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注信息" prop="remarks">
                    <el-input
                      v-model="form.remarks"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入备注信息"
                      maxlength="512"
                      show-word-limit
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

      <!-- 详情对话框 -->
      <el-dialog
        title="档案详情"
        :visible.sync="viewOpen"
        width="800px"
        :close-on-click-modal="false"
        append-to-body
        custom-class="detail-dialog"
      >
        <el-collapse v-model="activeDetailSections" class="form-collapse">

          <!-- 基础信息 -->
          <el-collapse-item name="basic" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-document section-icon" />
                <span class="section-title">基础信息</span>
                <span class="section-badge">8项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="档案编号">
                <span class="nowrap-text">{{ viewData.archiveCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="档案标题">
                {{ viewData.archiveTitle || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="档案类型">
                {{ archiveTypeFormat(viewData) }}
              </el-descriptions-item>
              <el-descriptions-item label="管理部门">
                {{ viewData.orgName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="保存期限">
                {{ viewData.storageDuration || "-" }} 月
              </el-descriptions-item>
              <el-descriptions-item label="过期时间">
                {{ parseTime(viewData.expirationTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="档案描述" :span="2">
                {{ viewData.description || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="备注信息" :span="2">
                {{ viewData.remarks || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 状态与时间 -->
          <el-collapse-item name="status" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">状态与时间</span>
                <span class="section-badge">5项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(viewData.status)">
                  {{ statusFormat(viewData) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="录入人员">
                {{ viewData.createUserName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="录入时间">
                {{ parseTime(viewData.createdAt) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="更新人员">
                {{ viewData.updateUserName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间" :span="2">
                {{ parseTime(viewData.updatedAt) || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关闭</el-button>
        </div>
      </el-dialog>

      <!-- 已归档媒体抽屉 -->
      <el-drawer
        :title="`档案【${currentArchive.archiveTitle}】的已归档媒体`"
        :visible.sync="showMediaDrawer"
        direction="rtl"
        size="60%"
        :before-close="handleCloseMediaDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-drawer"
      >
        <div class="drawer-content">
          <!-- 操作按钮 -->
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="small"
                class="action-btn tertiary-danger"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnarchiveMedia"
              >批量解除归档</el-button>
            </el-col>
          </el-row>

          <!-- 已归档媒体列表 -->
          <el-table
            ref="mediaRelationsTable"
            v-loading="relationLoading"
            :data="mediaRelationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column
              label="档案编号"
              align="center"
              prop="archiveCode"
            />
            <el-table-column label="媒体名称" align="center" prop="mediaName" />
            <el-table-column label="媒体类型" align="center" prop="mediaCate">
              <template slot-scope="scope">
                {{ selectDictLabel(mediaCateOptions, scope.row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column label="归档人" align="center" prop="policeName" />
            <el-table-column
              label="归档人组织"
              align="center"
              prop="orgFullName"
            />
            <el-table-column label="归档时间" align="center" prop="createdAt">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createdAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150">
              <template slot-scope="scope">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    type="text"
                    icon="el-icon-delete"
                    class="action-btn tertiary-danger"
                    @click="handleUnarchiveMedia(scope.row)"
                  >解除归档</el-button>
                </div>
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
            v-show="mediaTotal > 0"
            :total="mediaTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadArchiveMediaRelations"
          />
        </div>

        <!-- 底部操作栏 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseMediaDrawer()">关闭</el-button>
        </div>
      </el-drawer>
    </template>
  </BasicLayout>
</template>

<script>
import {
  getArchive,
  addArchive,
  updateArchive,
  delArchive,
  batchDelArchives,
  getArchiveMediaRelationsByArchiveId,
  delArchiveMediaRelationById,
  batchDelArchiveMediaRelations,
  listArchives
} from '@/api/evidence/archive_api'
import BasicLayout from '@/layout/BasicLayout'
import ArchiveSelector from '@/components/ArchiveSelector'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import Pagination from '@/components/Pagination'
import { formatJson } from '@/utils'

export default {
  name: 'Archive',
  components: {
    BasicLayout,
    ArchiveSelector,
    BatchActionBar,
    Pagination
  },
  data() {
    return {
      // 选中的档案 - ArchiveSelector组件已实现跨分页选择
      selectedArchiveRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示详情弹出层
      viewOpen: false,
      // 详情数据
      viewData: {},
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 详情对话框折叠状态 (默认展开: 基础信息、状态与时间)
      activeDetailSections: ['basic', 'status'],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        archiveTitle: [
          { required: true, message: '档案标题不能为空', trigger: 'blur' }
        ],
        archiveType: [
          { required: true, message: '档案类型不能为空', trigger: 'change' }
        ]
      },
      // 档案类型选项
      archiveTypeOptions: [],
      // 状态选项
      statusOptions: [],
      // 媒体类型字典
      mediaCateOptions: [],
      // 是否显示媒体抽屉
      showMediaDrawer: false,
      // 当前档案
      currentArchive: {},
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      // 媒体关联列表
      mediaRelationsList: [],
      // 媒体列表加载状态
      relationLoading: false,
      // 媒体总数
      mediaTotal: 0,
      // 媒体查询参数
      mediaQueryParams: {
        page: 1,
        pageSize: 10
      },
      // 选中的已归档媒体列表（用于批量解除归档）
      selectedMediaRelations: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedMediaRelationMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringMediaRelationSelection: false,
      processingInstance: null, // Element UI全局加载动画的实例
      previousCursor: null // 记录鼠标状态
    }
  },
  created() {
    // 组件初始化时不需要调用getList，由ArchiveSelector组件自己处理
    // 加载媒体类型字典
    this.getDicts('evidence_media_type').then((response) => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('archive_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('archive_type').then((response) => {
      this.archiveTypeOptions = response.data
    })
  },
  methods: {
    /** 获取状态标签类型 */
    getStatusType(status) {
      const typeMap = {
        0: 'success',
        1: 'danger',
        2: 'info'
      }
      return typeMap[status] || 'info'
    },

    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    archiveTypeFormat(row) {
      return this.selectDictLabel(this.archiveTypeOptions, row.archiveType)
    },

    /** 多选框选中数据 - ArchiveSelector组件已实现跨分页选择 */
    handleSelectionChange(selection) {
      // ArchiveSelector 组件内部已经实现了跨分页选择逻辑
      // 它会发送所有跨分页选中的记录，直接使用即可
      this.selectedArchiveRecords = selection || []
      // 更新全选状态
      const archiveSelector = this.$refs.archiveSelector
      const totalCount = (archiveSelector && archiveSelector.archiveList && archiveSelector.archiveList.length) || 0
      const selectedCount = this.selectedArchiveRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      const archiveSelector = this.$refs.archiveSelector
      if (archiveSelector && archiveSelector.toggleAllSelection) {
        archiveSelector.toggleAllSelection()
      }
    },

    /** 刷新列表 */
    handleRefresh() {
      const archiveSelector = this.$refs.archiveSelector
      if (archiveSelector) {
        archiveSelector.refreshList()
      }
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      // 鼠标切换为等待状态
      this.previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      // 恢复鼠标状态
      document.body.style.cursor = this.previousCursor
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加档案'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      // 使用对象展开运算符创建新对象
      if (row && row.archiveId !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedArchiveRecords[0]
          ? { ...this.selectedArchiveRecords[0] }
          : {}
      }
      this.title = '修改档案'
      this.open = true
    },
    /** 查看详情 */
    handleView(row) {
      const archiveId = row.archiveId
      getArchive(archiveId).then((response) => {
        if (response.code === 200) {
          this.viewData = response.data
          this.viewOpen = true
        }
      })
    },
    /** 操作按钮处理 */
    handleOperation(row, action) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
        case 'view':
          this.handleView(row)
          break
        default:
          break
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.archiveId) {
            this.startProcessing('正在修改档案...')
            updateArchive(this.form, this.form.archiveId)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.$refs.archiveSelector.refreshList()
                  this.msgSuccess('修改档案成功')
                  this.open = false
                } else {
                  this.msgError(
                    response.msg || '修改档案失败：后端返回异常状态'
                  )
                }
              })
              .catch((error) => {
                this.msgError('修改档案失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建档案...')
            addArchive(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.$refs.archiveSelector.refreshList()
                  this.msgSuccess('创建档案成功')
                  this.open = false
                } else {
                  this.msgError(
                    response.msg || '创建档案失败：后端返回异常状态'
                  )
                }
              })
              .catch((error) => {
                this.msgError('创建档案失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var archiveIds
        var archiveCodes
        if (row && row.archiveId !== undefined) {
          archiveIds = row.archiveId
          archiveCodes = row.archiveCode
        } else {
          archiveIds = this.selectedArchiveRecords.map(
            (item) => item.archiveId
          )
          archiveCodes = this.selectedArchiveRecords.map(
            (item) => item.archiveCode
          )
        }

        // 计算删除数量，优化确认消息
        const count = Array.isArray(archiveIds) ? archiveIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条档案记录？此操作不可恢复。`
          : `是否确认删除档案【${archiveCodes}】？此操作不可恢复。`

        await this.$confirm(
          confirmMessage,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        this.startProcessing('正在删除档案...')
        var response = null
        if (Array.isArray(archiveIds)) {
          response = await batchDelArchives({ ids: archiveIds })
        } else {
          response = await delArchive(archiveIds)
        }
        if (response.code === 200) {
          await this.delay(2000)
          const archiveSelector = this.$refs.archiveSelector
          if (archiveSelector) {
            archiveSelector.handleQuery() // 使用 ArchiveSelector 的 handleQuery 方法
          }
          this.msgSuccess(response.msg || '删除档案成功')
        } else {
          this.msgError(response.msg || '删除档案失败')
        }

        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除档案失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 导出按钮操作 */
    async handleExport() {
      try {
        const archiveSelector = this.$refs.archiveSelector
        if (!archiveSelector) {
          this.msgError('档案列表组件未就绪，无法导出')
          return
        }

        const hasSelection = this.selectedArchiveRecords.length

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedArchiveRecords.length} 条档案数据？`
          : '是否确认导出所有档案数据项？'

        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        // 仅导出用户当前列设置中“可见”的列
        const columnOptions = Array.isArray(archiveSelector.columnOptions)
          ? archiveSelector.columnOptions
          : []
        const visibleColumns = Array.isArray(archiveSelector.visibleColumns)
          ? archiveSelector.visibleColumns
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

        // 获取要导出的数据：有勾选则导出勾选，否则导出全部（按当前查询条件拉取）
        let list = []
        if (hasSelection) {
          list = this.selectedArchiveRecords
        } else {
          const baseQueryParams = archiveSelector.queryParams || {}
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listArchives(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询档案列表失败')
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

        // 对导出字段做必要的格式化（与页面展示保持一致）
        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const out = { ...row }
          out.archiveType = this.archiveTypeFormat(row)
          out.status = this.statusFormat(row)
          out.createdAt = this.parseTime(row.createdAt)
          out.updatedAt = this.parseTime(row.updatedAt)
          out.expirationTime = this.parseTime(row.expirationTime)
          return out
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出（会弹出另存为对话框）
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '档案列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        archiveId: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        description: undefined,
        storageDuration: 120,
        status: 0,
        remarks: undefined
      }
      this.resetForm('form')
    },
    /** 显示已归档媒体 */
    handleShowMedia(row) {
      this.currentArchive = row
      this.showMediaDrawer = true
      this.mediaQueryParams.page = 1
      this.loadArchiveMediaRelations()
    },
    /** 获取已归档媒体列表 */
    loadArchiveMediaRelations() {
      this.relationLoading = true
      getArchiveMediaRelationsByArchiveId(
        this.currentArchive.archiveId,
        this.relationQueryParams
      )
        .then((response) => {
          if (response.code === 200) {
            this.mediaRelationsList = response.data.list || []
            this.mediaTotal = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreMediaRelationSelection()
          } else {
            this.msgError(response.msg || '获取已归档媒体列表失败')
            this.mediaRelationsList = []
            this.mediaTotal = 0
          }
        })
        .catch((error) => {
          console.error('[loadArchiveMediaRelations] API调用异常:', error)
          this.msgError(
            '获取已归档媒体列表失败：' + (error.message || '未知错误')
          )
          this.mediaRelationsList = []
          this.mediaTotal = 0
        })
        .finally(() => {
          this.relationLoading = false
        })
    },
    /** 解除归档 */
    async handleUnarchiveMedia(row) {
      try {
        await this.$confirm(
          `是否确认解除媒体"${row.mediaName}"的归档关系？`,
          '确认解除',
          {
            confirmButtonText: '解除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.startProcessing('正在解除归档...')

        try {
          const response = await delArchiveMediaRelationById(row.id)

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000)
            this.loadArchiveMediaRelations()

            this.msgSuccess(response.msg || '解除归档成功')
          } else {
            this.msgError(response.msg || '解除归档失败')
          }
        } finally {
          this.stopProcessing()
        }
      } catch (error) {
        // 用户取消操作或发生错误
        if (error !== 'cancel') {
          this.msgError('解除归档失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 关闭媒体抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false
      this.currentArchive = {}
      this.mediaRelationsList = []
      this.mediaTotal = 0
      this.mediaQueryParams.page = 1
      this.selectedMediaRelations = []
      if (done) {
        done()
      }
    },

    /** 已归档媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      if (this.isRestoringMediaRelationSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
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

    /** 批量解除归档 */
    async handleBatchUnarchiveMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError('请选择要解除归档的媒体')
        return
      }

      try {
        await this.$confirm(
          `确认解除选中的 ${this.selectedMediaRelations.length} 个媒体的归档关系吗？`,
          '确认解除',
          {
            confirmButtonText: '解除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.startProcessing('正在批量解除归档...')

        try {
          // 提取选中的关联ID列表
          const ids = this.selectedMediaRelations.map((item) => item.id)

          const response = await batchDelArchiveMediaRelations({ ids: ids })

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000)
            this.selectedMediaRelationMap = {}
            this.selectedMediaRelations = []
            this.loadArchiveMediaRelations()

            this.msgSuccess(
              response.msg || `成功解除 ${ids.length} 个媒体的归档关系`
            )
          } else {
            this.msgError(response.msg || '批量解除归档失败')
          }
        } finally {
          this.stopProcessing()
        }
      } catch (error) {
        // 用户取消操作或发生错误
        if (error !== 'cancel') {
          this.msgError('批量解除归档失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 字典标签格式化 */
    selectDictLabel(options, value) {
      const item = options.find((opt) => opt.value === value)
      return item ? item.label : value
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
/* 本页面使用的样式类已全部在全局样式中定义：
   - .action-btn.secondary, .action-btn.tertiary, .action-btn.tertiary-danger → src/styles/components/buttons.scss
   - .action-buttons → src/styles/components/forms.scss 和 table.scss
   - .main-action-bar → src/styles/components/dialogs.scss
   - .section-descriptions, .section-header → src/styles/components/dialogs.scss
   - .form-collapse → src/styles/components/forms.scss
   - .full-width → src/styles/components/utilities.scss
   - .mb8 → src/styles/components/utilities.scss
   - .empty-data → src/styles/components/utilities.scss
   - .drawer-content → src/styles/components/dialogs.scss
   - .media-drawer → src/styles/components/dialogs.scss
   - .detail-dialog, .edit-dialog → src/styles/components/dialogs.scss
   - .nowrap-text → src/styles/components/dialogs.scss
*/
</style>
