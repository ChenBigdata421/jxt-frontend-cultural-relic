<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用媒体选择器组件 -->
        <MediaSelector
          ref="mediaSelector"
          :selection-mode="false"
          @add="handleAdd"
          @delete="handleDelete"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 批量操作栏插槽 -->
          <template #batch-actions>
            <BatchActionBar
              :selected-count="selectedMediaRecords.length"
              :is-indeterminate="isSelectionIndeterminate"
              :all-selected="isAllSelected"
              @select-all-change="handleSelectAll"
            />
          </template>
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-button
              type="primary"
              icon="el-icon-folder-add"
              size="small"
              :disabled="selectedMediaRecords.length === 0"
              @click="handleBatchArchive"
            >一键归档</el-button>
            <el-button
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedMediaRecords.length === 0"
              @click="handleDeleteWithApproval"
            >删除</el-button>
            <el-button
              icon="el-icon-edit"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="onSmartMark"
            >智能标注</el-button>
            <el-button
              icon="el-icon-document"
              size="small"
              type="text"
              class="action-btn secondary"
              @click="onManualMark"
            >手动标注</el-button>
            <el-button
              icon="el-icon-close"
              size="small"
              type="text"
              class="action-btn tertiary-danger"
              @click="onNoMark"
            >标注不是执法视频</el-button>
            <el-button
              icon="el-icon-setting"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="onLog"
            >日志管理</el-button>
            <el-button
              v-show="showDownload"
              icon="el-icon-download"
              size="small"
              type="text"
              class="action-btn secondary"
              @click="onDownload"
            >下载</el-button>
            <el-button
              v-show="showTransfer"
              icon="el-icon-s-custom"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="onTransfer"
            >移交</el-button>
            <el-button
              icon="el-icon-download"
              size="small"
              type="text"
              class="action-btn secondary"
              @click="handleExport"
            >导出</el-button>
            <el-button
              icon="el-icon-save"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="onSaveCols"
            >保存列头</el-button>
          </template>
        </MediaSelector>

        <!-- 标注不是执法视频确认对话框 -->
        <el-dialog
          title="标注不是执法视频"
          :visible.sync="noMarkDialogVisible"
          width="400px"
          custom-class="edit-dialog"
          :close-on-click-modal="false"
          append-to-body
        >
          <div style="text-align: center; padding: 20px">
            <i class="el-icon-warning" style="font-size: 48px; color: #e6a23c" />
            <p style="margin-top: 20px; font-size: 16px">
              确认将选中的媒体标注为非执法视频吗？
            </p>
            <p style="color: #909399; font-size: 14px">
              已选中 {{ mediaIds.length }} 条媒体
            </p>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="tertiary" size="small" @click="noMarkDialogVisible = false">否</el-button>
            <el-button type="primary" size="small" @click="confirmNoMark">是</el-button>
          </div>
        </el-dialog>

        <!-- 手动标注对话框 -->
        <el-dialog
          title="手动标注"
          :visible.sync="manualMarkDialogVisible"
          width="800px"
          :close-on-click-modal="false"
          append-to-body
          custom-class="edit-dialog"
        >
          <el-alert
            :title="`已选中 ${mediaIds.length} 条媒体`"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 12px"
          />

          <el-tabs v-model="manualMarkActiveTab" type="card">
            <el-tab-pane label="重要级别" name="importance">
              <el-form label-width="120px">
                <el-form-item label="重要级别">
                  <el-select
                    v-model="manualMarkForm.importantLevel"
                    placeholder="请选择重要级别"
                    style="width: 300px"
                    clearable
                  >
                    <el-option
                      v-for="dict in mediaImportanceOptions"
                      :key="dict.value"
                      :label="dict.label"
                      :value="parseInt(dict.value)"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="原因">
                  <el-input
                    v-model="manualMarkForm.importanceReason"
                    placeholder="可选"
                    maxlength="255"
                    show-word-limit
                    style="width: 520px"
                  />
                </el-form-item>
              </el-form>
              <div class="dialog-footer" style="text-align: right">
                <el-button type="text" class="tertiary" size="small" @click="manualMarkDialogVisible = false">关 闭</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="manualMarkSubmitting"
                  @click="submitManualMarkImportance"
                >确 定</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="执法类型" name="enforceType">
              <el-form label-width="120px">
                <el-form-item label="执法类型">
                  <treeselect
                    v-model="manualMarkForm.enforceType"
                    :options="enforceTypeLabel"
                    :normalizer="normalizeEnforceType"
                    placeholder="请选择执法类型"
                    style="width: 520px"
                    clearable
                  />
                </el-form-item>
              </el-form>
              <div class="dialog-footer" style="text-align: right">
                <el-button type="text" class="tertiary" size="small" @click="manualMarkDialogVisible = false">关 闭</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="manualMarkSubmitting"
                  @click="submitManualMarkEnforceType"
                >确 定</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="标注内容" name="comments">
              <el-form label-width="120px">
                <el-form-item label="标注内容">
                  <el-input
                    v-model="manualMarkForm.comments"
                    type="textarea"
                    :rows="5"
                    maxlength="255"
                    show-word-limit
                    placeholder="请输入标注内容"
                    style="width: 520px"
                  />
                </el-form-item>
              </el-form>
              <div class="dialog-footer" style="text-align: right">
                <el-button type="text" class="tertiary" size="small" @click="manualMarkDialogVisible = false">关 闭</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="manualMarkSubmitting"
                  @click="submitManualMarkComments"
                >确 定</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="过期时间" name="expiryTime">
              <el-form label-width="120px">
                <el-form-item label="方式">
                  <el-radio-group v-model="manualMarkForm.expiryMode">
                    <el-radio label="fixed">固定</el-radio>
                    <el-radio label="forever">永久</el-radio>
                    <el-radio label="custom">自定义</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item
                  v-if="manualMarkForm.expiryMode === 'fixed'"
                  label="固定天数"
                >
                  <el-input-number
                    v-model="manualMarkForm.fixedDays"
                    :min="1"
                    :max="36500"
                    style="width: 200px"
                  />
                </el-form-item>

                <el-form-item
                  v-if="manualMarkForm.expiryMode === 'custom'"
                  label="过期时间"
                >
                  <el-date-picker
                    v-model="manualMarkForm.customExpiryTime"
                    type="datetime"
                    placeholder="请选择过期时间"
                    style="width: 300px"
                    clearable
                  />
                </el-form-item>
              </el-form>
              <div class="dialog-footer" style="text-align: right">
                <el-button type="text" class="tertiary" size="small" @click="manualMarkDialogVisible = false">关 闭</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="manualMarkSubmitting"
                  @click="submitManualMarkExpiryTime"
                >确 定</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="锁定状态" name="locked">
              <el-form label-width="120px">
                <el-form-item label="锁定状态">
                  <el-radio-group v-model="manualMarkForm.isLocked">
                    <el-radio :label="1">锁定</el-radio>
                    <el-radio :label="0">解锁</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
              <div class="dialog-footer" style="text-align: right">
                <el-button type="text" class="tertiary" size="small" @click="manualMarkDialogVisible = false">关 闭</el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="manualMarkSubmitting"
                  @click="submitManualMarkIsLocked"
                >确 定</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>

        <!-- 一键归档对话框 -->
        <el-dialog
          :title="isBatchArchive ? '批量归档' : '一键归档'"
          :visible.sync="archiveDialogVisible"
          width="600px"
          :close-on-click-modal="false"
          custom-class="edit-dialog"
          append-to-body
        >
          <el-form label-width="120px">
            <!-- 单个媒体基本信息 -->
            <div
              v-if="!isBatchArchive && currentArchivingMedia"
              class="archive-info-section"
            >
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="媒体名称">
                  {{ currentArchivingMedia.mediaName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="媒体类别">
                  {{
                    selectDictLabel(mediaCateOptions, currentArchivingMedia.mediaCate) ||
                      "-"
                  }}
                </el-descriptions-item>
                <el-descriptions-item label="警员">
                  {{ currentArchivingMedia.policeName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="单位组织">
                  {{ currentArchivingMedia.orgFullName || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 批量归档信息 -->
            <div v-if="isBatchArchive" class="archive-info-section">
              <el-alert
                :title="`已选择 ${currentArchivingMediaList.length} 个媒体进行批量归档`"
                type="info"
                :closable="false"
                show-icon
              />
            </div>

            <el-form-item label="归档方式">
              <el-radio-group v-model="archiveType">
                <el-radio label="existing">选择现有档案</el-radio>
                <el-radio label="new">新增档案</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 选择现有档案 -->
            <div v-if="archiveType === 'existing'">
              <el-form-item label="档案编号：">
                <el-input
                  v-model="archiveForm.archiveCode"
                  placeholder="请选择档案"
                  readonly
                  style="width: 300px"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="openArchiveSelector"
                  >选择</el-button>
                </el-input>
              </el-form-item>
            </div>

            <!-- 新增档案 -->
            <div v-if="archiveType === 'new'">
              <el-form-item label="档案标题：">
                <el-input
                  v-model="archiveForm.archiveTitle"
                  placeholder="请输入档案标题"
                  maxlength="255"
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="档案类型：">
                <el-select
                  v-model="archiveForm.archiveType"
                  placeholder="请选择档案类型"
                  style="width: 400px"
                >
                  <el-option
                    v-for="dict in archiveTypeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="tertiary" size="small" @click="cancelArchive">取 消</el-button>
            <el-button type="primary" size="small" @click="submitArchive">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 档案选择对话框 -->
        <ArchiveSelectorDialog
          ref="archiveSelector"
          title="选择档案"
          :visible.sync="archiveSelectorVisible"
          :multiple="false"
          @confirm="confirmSelectArchive"
          @cancel="cancelSelectArchive"
        />

        <!-- 视频播放对话框 -->
        <VideoPlayerDialog
          :visible.sync="videoPlayerVisible"
          :initial-url="currentVideoUrl"
          :media-cate="currentPlayMediaCate"
          @close="handleVideoPlayerClose"
        />

        <!-- 图片预览对话框 -->
        <ImageViewerDialog
          :visible.sync="imageViewerVisible"
          :initial-url="currentImageUrl"
          @close="handleImageViewerClose"
        />

        <!-- 文本/日志预览对话框 -->
        <TextViewerDialog
          :visible.sync="textViewerVisible"
          :initial-url="currentTextUrl"
          @close="handleTextViewerClose"
        />

        <!-- 任务处理对话框 v-model="taskProcessOpen"等价于:value="taskProcessOpen" -->
        <TaskProcessDialog
          v-model="taskProcessOpen"
          :task-id="currentTaskId"
          @success="handleTaskProcessSuccess"
          @close="handleTaskProcessClose"
        />
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  batchMarkMediaNoEnforcementStatus,
  batchUpdateMediaEnforceType,
  batchUpdateMediaIsLocked,
  batchUpdateMediaImportanceLevel,
  batchUpdateMediaComments,
  batchUpdateMediaExpiryTime
} from '@/api/evidence/evidence_manage_command_api'
import { getMediaPlayURL, listMedia } from '@/api/evidence/evidence_manage_query_api'
import {
  getDownloadApprovalStatus,
  recordDownload,
  submitDownloadApplyRecord
} from '@/api/evidence/download_approval_api'
import {
  getDeleteApprovalStatus,
  submitDeleteApplyRecord
} from '@/api/evidence/delete_approval_api'
import { getEnforceTypeTree } from '@/api/admin/enforcetype'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import { getEquipmentBwcList } from '@/api/admin/equipment_manage_api'
import { addArchive, batchAddArchiveMediaRelations } from '@/api/evidence/archive_api'
import MediaSelector from '@/components/MediaSelector'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import ArchiveSelectorDialog from '@/components/ArchiveSelectorDialog'
import VideoPlayerDialog from '@/components/VideoPlayerDialog'
import ImageViewerDialog from '@/components/ImageViewerDialog'
import TextViewerDialog from '@/components/TextViewerDialog'
import TaskProcessDialog from '@/components/TaskProcessDialog'
import workflowMixin from '@/mixins/workflowMixin'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { formatJson } from '@/utils'

export default {
  name: 'MediaManage',
  components: {
    MediaSelector,
    BatchActionBar,
    ArchiveSelectorDialog,
    VideoPlayerDialog,
    ImageViewerDialog,
    TextViewerDialog,
    TaskProcessDialog,
    Treeselect
  },
  mixins: [workflowMixin],
  data() {
    return {
      // 选中的媒体记录
      selectedMediaRecords: [],
      // 选中数组
      mediaIds: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      processingInstance: null,
      // 手动标注对话框
      manualMarkDialogVisible: false,
      manualMarkActiveTab: 'importance',
      manualMarkSubmitting: false,
      manualMarkForm: {
        importantLevel: undefined,
        importanceReason: '',
        enforceType: undefined,
        comments: '',
        expiryMode: 'fixed', // fixed | forever | custom
        fixedDays: 30,
        customExpiryTime: undefined,
        isLocked: 0
      },
      // 媒体重要级别字典
      mediaImportanceOptions: [],
      // 执法类型树
      enforceTypeLabel: [],
      // 是否显示下载文件类型选择对话框
      downloadDialogVisible: false,
      // 下载审批相关
      currentDownloadMedia: null,
      currentDownloadApprovalId: null,
      // 是否显示标注不是执法视频对话框
      noMarkDialogVisible: false,
      showDownload: false,
      showTransfer: false,
      // 一键归档相关
      archiveDialogVisible: false,
      archiveType: 'existing', // 'existing' 或 'new'
      archiveForm: {
        archiveCode: '',
        archiveId: '',
        archiveTitle: '',
        archiveType: undefined
      },
      currentArchivingMedia: null, // 当前要归档的媒体(单个归档时使用)
      currentArchivingMediaList: [], // 当前要归档的媒体列表(批量归档时使用)
      isBatchArchive: false, // 是否为批量归档
      archiveSelectorVisible: false,
      // 档案类型选项
      archiveTypeOptions: [],
      // 视频播放相关
      videoPlayerVisible: false,
      currentVideoUrl: '',
      currentPlayMediaCate: 3,
      // 图片预览相关
      imageViewerVisible: false,
      currentImageUrl: '',
      // 文本/日志预览相关
      textViewerVisible: false,
      currentTextUrl: '',
      // 媒体详情对话框
      viewMediaOpen: false,
      // 媒体详情数据
      viewMediaData: {},
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 执法仪选项
      bwcOptions: [],
      // 媒体类型数据字典
      mediaCateOptions: [],
      // 表单校验
      rules: {
        mediaName: [{ required: true, message: '媒体名称不能为空', trigger: 'blur' }],
        mediaCate: [{ required: true, message: '媒体类型不能为空', trigger: 'change' }]
      },
      // 工作流相关
      currentDeleteMedia: null, // 当前要删除的媒体
      // 任务处理对话框
      taskProcessOpen: false
      // 注意: currentTaskId, currentTask, isFirstStep, processForm, processRules 由 workflowMixin 提供
    }
  },
  watch: {
    'form.orgId': function(newVal) {
      // 当表单中的组织ID变化时，自动获取该组织的用户列表
      if (newVal) {
        this.handleFormOrgSelect({ id: newVal })
      }
    }
  },
  created() {
    this.getTreeselect()
    this.getEnforceTypeTreeselect()

    // 加载媒体类型字典（用于表单）
    this.getDicts('evidence_media_type').then((response) => {
      this.mediaCateOptions = response.data
    })

    // 加载媒体重要级别字典（用于手动标注）
    this.getDicts('media_importance').then((response) => {
      this.mediaImportanceOptions = response.data
    })
    this.getDicts('archive_type').then((response) => {
      this.archiveTypeOptions = response.data
    })
  },
  methods: {
    async refreshMediaListWithDelay() {
      if (!this.$refs.mediaSelector) {
        return
      }
      await this.delay(2000)
      this.$refs.mediaSelector.refreshList()
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
    },

    /** 获取执法类型树形数据 */
    getEnforceTypeTreeselect() {
      getEnforceTypeTree()
        .then((response) => {
          this.enforceTypeLabel = response.data.list || response.data || []
        })
        .catch(() => {
          // 如果树形接口不存在，设置为空数组
          this.enforceTypeLabel = []
        })
    },

    /** 执法类型数据结构转换 当你的数据格式与 vue-treeselect 默认期望的格式不一致时，使用 normalizer 进行格式转换*/
    normalizeEnforceType(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id, // 将你数据中的 node.id 映射为 vue-treeselect 的id
        label: node.enforcementTypeName || node.label || '未知', // 将你数据中的 node.enforcementTypeName 映射为 vue-treeselect 的label
        children: node.children // 将你的数据中的 children 映射为 children
      }
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.mediaIds = selection.map((item) => item.mediaId)
      this.selectedMediaRecords = selection
      // 更新全选状态
      const mediaSelector = this.$refs.mediaSelector
      const totalCount = (mediaSelector && mediaSelector.mediaList && mediaSelector.mediaList.length) || 0
      const selectedCount = this.selectedMediaRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      const mediaSelector = this.$refs.mediaSelector
      if (mediaSelector && mediaSelector.toggleAllSelection) {
        mediaSelector.toggleAllSelection()
      }
    },

    onSmartMark() {
      // 智能标注逻辑
    },
    onManualMark() {
      if (this.selectedMediaRecords.length === 0) {
        this.$message.warning('请至少选择一条媒体数据')
        return
      }
      this.manualMarkActiveTab = 'importance'
      this.manualMarkSubmitting = false
      this.manualMarkForm = {
        importantLevel: undefined,
        importanceReason: '',
        enforceType: undefined,
        comments: '',
        expiryMode: 'fixed',
        fixedDays: 30,
        customExpiryTime: undefined,
        isLocked: 0
      }
      this.manualMarkDialogVisible = true
    },
    onNoMark() {
      if (this.selectedMediaRecords.length === 0) {
        this.$message.warning('请至少选择一条媒体数据')
        return
      }
      this.noMarkDialogVisible = true
    },
    confirmNoMark() {
      const mediaIds = this.mediaIds
      batchMarkMediaNoEnforcementStatus({
        ids: mediaIds,
        isNonEnforcementMedia: 1
      })
        .then((response) => {
          if (response.code === 200) {
            this.noMarkDialogVisible = false
            // 刷新列表
            this.refreshMediaListWithDelay()
            this.msgSuccess('标注成功')
          } else {
            this.msgError(response.msg || '标注失败')
          }
        })
        .catch((error) => {
          this.msgError('标注失败：' + (error.message || '未知错误'))
        })
    },
    onLog() {
      // 日志管理逻辑
    },
    onDownload() {
      this.downloadDialogVisible = true
    },
    onTransfer() {
      // 移交逻辑
    },
    onSaveCols() {
      // 保存列头逻辑
    },
    onSubmitDownload() {
      const media = this.currentDownloadMedia
      if (!media || !media.filePath) {
        this.$message.error('无法获取文件路径')
        return
      }

      // 构建下载URL
      // 后端接口: GET /api/v1/files/{filepath}
      // filePath 格式: YYYY/MM/DD/filename
      // 通过 Nginx 代理转发到文件存储服务
      const downloadUrl = `/api/v1/files/${media.filePath}`

      // 获取文件名（用于下载时的文件名）
      const fileName = media.mediaName || media.filePath.split('/').pop()

      // 创建隐藏的 a 标签触发下载
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('下载已开始')

      // 记录下载操作（可选，用于审计）
      if (this.currentDownloadApprovalId) {
        recordDownload(media.mediaId).catch((err) => {
          console.error('记录下载操作失败:', err)
        })
      }
    },

    /** 带审批的下载处理 */
    async handleDownloadWithApproval(row) {
      if (!row || !row.mediaId) {
        this.msgWarning('无法获取媒体信息')
        return
      }

      try {
        // 1. 查询审批状态
        const response = await getDownloadApprovalStatus(row.mediaId)
        if (response.code === 200 && response.data) {
          const {
            status,
            approvalId,
            downloadCount = 0,
            rejectReason = '',
            canDownload
          } = response.data

          // 2. 根据状态处理
          if (status === 'approved' || canDownload) {
            // 已审批通过，直接弹出下载类型选择
            this.currentDownloadMedia = row
            this.currentDownloadApprovalId = approvalId
            try {
              await this.$confirm(`已经下载${downloadCount}次，是否继续下载`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
              })
              this.onSubmitDownload()
            } catch (error) {
              if (error !== 'cancel') {
                this.msgError('下载媒体失败：' + (error || '未知错误'))
              }
            }
          } else if (status === 'pending') {
            // 审批中
            this.$message.warning('下载申请正在审批中，请等待审批完成')
          } else if (status === 'rejected') {
            // 已驳回，询问是否重新申请
            this.$message.warning(
              `下载申请已被驳回${
                rejectReason ? '，原因：' + rejectReason : ''
              }，如需重新申请，请进入“我的待办”`
            )
          } else if (status === 'expired') {
            try {
              await this.$confirm(`下载申请已过期，是否重新申请`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
              })
              this.showDownloadApplyDialog(row)
            } catch (error) {
              if (error !== 'cancel') {
                this.msgError('下载申请失败：' + (error || '未知错误'))
              }
            }
          } else {
            try {
              await this.$confirm('下载媒体需要提交申请电子流，是否继续？', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'info'
              })
              this.showDownloadApplyDialog(row)
            } catch (error) {
              if (error !== 'cancel') {
                this.msgError('下载媒体失败：' + (error || '未知错误'))
              }
            }
          }
        } else {
          this.msgError('查询下载审批状态失败!')
        }
      } catch (error) {
        this.msgError('下载媒体失败!')
      }
    },

    /** 带审批的删除处理 */
    async handleDeleteWithApproval(row) {
      // 只支持单个删除
      var mediaId
      var currentDeleteMedia
      if (row && row.mediaId !== undefined) {
        mediaId = row.mediaId
        currentDeleteMedia = row
      } else {
        mediaId = this.mediaIds[0]
        currentDeleteMedia = this.selectedMediaRecords[0]
      }

      if (this.mediaIds.length > 1) {
        this.msgError('删除操作需要通过工作流审批，暂不支持批量删除')
        return
      }

      // 保存当前要删除的媒体信息
      this.currentDeleteMedia = currentDeleteMedia

      try {
        // 1. 查询审批状态
        const response = await getDeleteApprovalStatus(row.mediaId)
        if (response.code === 200 && response.data) {
          const { status, rejectReason = '' } = response.data

          // 2. 根据状态处理
          if (status === 'pending') {
            // 审批中
            this.$message.warning('删除申请正在审批中，请等待审批完成')
          } else if (status === 'rejected') {
            // 已驳回，询问是否重新申请
            this.$message.warning(
              `删除申请已被驳回${
                rejectReason ? '，原因：' + rejectReason : ''
              }，如需重新申请，请进入“我的待办”`
            )
          } else {
            try {
              await this.$confirm('删除媒体需要提交申请电子流，是否继续？', '提示', {
                confirmButtonText: '继续',
                cancelButtonText: '取消',
                type: 'info'
              })
              this.startDeleteWorkflow(mediaId)
            } catch (error) {
              if (error !== 'cancel') {
                this.msgError('删除媒体失败：' + (error || '未知错误'))
              }
            }
          }
        } else {
          console.log('查询删除审批状态失败:', response)
          this.msgError('查询删除审批状态失败!')
        }
      } catch (error) {
        console.log('删除媒体失败:', error)
        this.msgError('删除媒体失败!')
      }
    },

    /** 启动下载审批工作流 */
    showDownloadApplyDialog(row) {
      this.currentDownloadMedia = row
      if (!this.currentDownloadMedia) {
        this.msgError('媒体信息丢失')
        return
      }

      // 构建输入数据
      const inputData = {
        mediaId: this.currentDownloadMedia.mediaId,
        mediaName: this.currentDownloadMedia.mediaName || '',
        documentId: this.currentDownloadMedia.mediaName
      }

      // 使用 mixin 提供的方法启动工作流实例
      this.startWorkflowInstance(
        '媒体下载申请流程',
        inputData,
        async(taskId) => {
          this.currentTaskId = taskId
          this.taskProcessOpen = true
          const data = {
            instanceId: this.currentInstanceId,
            taskId: taskId
          }
          try {
            const response = await submitDownloadApplyRecord(inputData.mediaId, data)
            if (response.code === 200) {
              this.msgSuccess('下载申请已提交')
            } else {
              this.msgError(response.msg || '下载申请提交失败')
            }
          } catch (err) {
            console.error('提交下载申请记录失败:', err)
            this.msgError('提交下载申请记录失败')
          }
        },
        (error) => {
          // 失败回调
          console.error('启动下载审批工作流失败:', error)
        }
      )
    },

    submitManualMarkImportance() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一条媒体数据')
        return
      }
      if (
        this.manualMarkForm.importantLevel === undefined ||
        this.manualMarkForm.importantLevel === null
      ) {
        this.msgError('请选择重要级别')
        return
      }
      this.manualMarkSubmitting = true
      this.startProcessing('正在更新重要级别...')
      batchUpdateMediaImportanceLevel({
        ids: this.mediaIds,
        importantLevel: this.manualMarkForm.importantLevel,
        reason: this.manualMarkForm.importanceReason || ''
      })
        .then(async(response) => {
          if (response && response.code === 200) {
            await this.refreshMediaListWithDelay()
            this.msgSuccess('批量更新重要级别成功')
          } else {
            this.msgError((response && response.msg) || '批量更新重要级别失败')
          }
        })
        .catch((error) => {
          this.msgError('批量更新重要级别失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.manualMarkSubmitting = false
          this.stopProcessing()
        })
    },

    submitManualMarkEnforceType() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一条媒体数据')
        return
      }
      if (
        this.manualMarkForm.enforceType === undefined ||
        this.manualMarkForm.enforceType === null
      ) {
        this.msgError('请选择执法类型')
        return
      }
      this.manualMarkSubmitting = true
      this.startProcessing('正在更新执法类型...')
      batchUpdateMediaEnforceType({
        ids: this.mediaIds,
        enforcementType: this.manualMarkForm.enforceType
      })
        .then(async(response) => {
          if (response && response.code === 200) {
            await this.refreshMediaListWithDelay()
            this.msgSuccess('批量更新执法类型成功')
          } else {
            this.msgError((response && response.msg) || '批量更新执法类型失败')
          }
        })
        .catch((error) => {
          this.msgError('批量更新执法类型失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.manualMarkSubmitting = false
          this.stopProcessing()
        })
    },

    submitManualMarkComments() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一条媒体数据')
        return
      }
      if (!this.manualMarkForm.comments) {
        this.msgError('请输入标注内容')
        return
      }
      this.manualMarkSubmitting = true
      this.startProcessing('正在更新标注内容...')
      batchUpdateMediaComments({
        ids: this.mediaIds,
        comments: this.manualMarkForm.comments
      })
        .then(async(response) => {
          if (response && response.code === 200) {
            await this.refreshMediaListWithDelay()
            this.msgSuccess('批量更新标注内容成功')
          } else {
            this.msgError((response && response.msg) || '批量更新标注内容失败')
          }
        })
        .catch((error) => {
          this.msgError('批量更新标注内容失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.manualMarkSubmitting = false
          this.stopProcessing()
        })
    },

    submitManualMarkExpiryTime() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一条媒体数据')
        return
      }

      let expiryTimeISO
      if (this.manualMarkForm.expiryMode === 'forever') {
        expiryTimeISO = new Date('2999-01-01T00:00:00Z').toISOString()
      } else if (this.manualMarkForm.expiryMode === 'fixed') {
        const days = Number(this.manualMarkForm.fixedDays || 0)
        if (!days || days <= 0) {
          this.msgError('请输入固定天数')
          return
        }
        const d = new Date()
        d.setDate(d.getDate() + days)
        expiryTimeISO = d.toISOString()
      } else {
        if (!this.manualMarkForm.customExpiryTime) {
          this.msgError('请选择过期时间')
          return
        }
        expiryTimeISO = new Date(this.manualMarkForm.customExpiryTime).toISOString()
      }

      this.manualMarkSubmitting = true
      this.startProcessing('正在更新过期时间...')
      batchUpdateMediaExpiryTime({
        ids: this.mediaIds,
        expiryTime: expiryTimeISO
      })
        .then(async(response) => {
          if (response && response.code === 200) {
            await this.refreshMediaListWithDelay()
            this.msgSuccess('批量更新过期时间成功')
          } else {
            this.msgError((response && response.msg) || '批量更新过期时间失败')
          }
        })
        .catch((error) => {
          this.msgError('批量更新过期时间失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.manualMarkSubmitting = false
          this.stopProcessing()
        })
    },

    submitManualMarkIsLocked() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一条媒体数据')
        return
      }
      if (this.manualMarkForm.isLocked !== 0 && this.manualMarkForm.isLocked !== 1) {
        this.msgError('请选择锁定状态')
        return
      }
      this.manualMarkSubmitting = true
      this.startProcessing('正在更新锁定状态...')
      batchUpdateMediaIsLocked({
        ids: this.mediaIds,
        isLocked: this.manualMarkForm.isLocked
      })
        .then(async(response) => {
          if (response && response.code === 200) {
            await this.refreshMediaListWithDelay()
            this.msgSuccess('批量更新锁定状态成功')
          } else {
            this.msgError((response && response.msg) || '批量更新锁定状态失败')
          }
        })
        .catch((error) => {
          this.msgError('批量更新锁定状态失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.manualMarkSubmitting = false
          this.stopProcessing()
        })
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const mediaSelector = this.$refs.mediaSelector
        if (!mediaSelector) {
          this.msgError('媒体列表组件未就绪，无法导出')
          return
        }

        const hasSelection = this.selectedMediaRecords.length

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedMediaRecords.length} 条媒体数据？`
          : '是否确认导出所有媒体数据项？'

        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        // 仅导出用户当前列设置中"可见"的列
        const columnOptions = Array.isArray(mediaSelector.columnOptions)
          ? mediaSelector.columnOptions
          : []
        const visibleColumns = Array.isArray(mediaSelector.visibleColumns)
          ? mediaSelector.visibleColumns
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
          list = this.selectedMediaRecords
        } else {
          const baseQueryParams = mediaSelector.queryParams || {}
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listMedia(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询媒体列表失败')
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
          out.mediaCate = this.selectDictLabel(this.mediaCateOptions, row.mediaCate)
          out.createdAt = this.parseTime(row.createdAt)
          out.updatedAt = this.parseTime(row.updatedAt)
          return out
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '媒体列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },

    // 表单重置
    reset() {
      this.form = {
        mediaName: undefined,
        mediaCate: undefined,
        policeId: undefined,
        orgId: undefined,
        recorderId: undefined,
        storageType: undefined,
        dataSource: undefined,
        enforType: undefined,
        mediaSuffix: undefined,
        shotTimeStart: undefined,
        shotTime: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined
      }
      // 重置下拉选项
      this.userOptions = []
      this.bwcOptions = []
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加媒体'
    },

    /** 删除按钮操作 ,目前暂时只支持单个删除 */
    handleDelete(row) {
      // 只支持单个删除
      var mediaId
      var currentDeleteMedia
      if (row && row.mediaId !== undefined) {
        mediaId = row.mediaId
        currentDeleteMedia = row
      } else {
        mediaId = this.mediaIds[0]
        currentDeleteMedia = this.selectedMediaRecords[0]
      }

      if (this.mediaIds.length > 1) {
        this.msgError('删除操作需要通过工作流审批，暂不支持批量删除')
        return
      }

      // 保存当前要删除的媒体信息
      this.currentDeleteMedia = currentDeleteMedia

      // 查询工作流列表，找到"文档删除申请流程"
      this.startDeleteWorkflow(mediaId)
    },

    handleOperation(row, action) {
      // 操作按钮逻辑
      if (action === 'edit') {
        // 一键归档
        this.handleQuickArchive(row)
      } else if (action === 'play') {
        // 播放视频
        this.handlePlayVideo(row)
      } else if (action === 'download') {
        // 下载（需要审批）
        this.handleDownloadWithApproval(row)
      } else if (action === 'delete') {
        // 删除
        this.handleDeleteWithApproval(row)
      }
    },

    /** 播放（按 mediaCate 分流：照片/音频/视频,1: 照片 2: 音频 3: 视频 4:日志 5:其他） */
    handlePlayVideo(row) {
      console.log('播放', row)

      const mediaId = row?.mediaId
      if (!mediaId) {
        this.msgWarning('无法获取媒体ID')
        return
      }

      // 先打开对应弹窗，显示加载状态
      if (row.mediaCate === 1) {
        this.currentImageUrl = ''
        this.imageViewerVisible = true
      } else if (row.mediaCate === 4) {
        this.currentTextUrl = ''
        this.textViewerVisible = true
      } else {
        this.currentVideoUrl = ''
        this.currentPlayMediaCate = row.mediaCate
        this.videoPlayerVisible = true
      }

      // 调用API获取播放地址
      getMediaPlayURL(mediaId)
        .then((response) => {
          if (response.code === 200 && response.data) {
            const playUrl = response.data.playUrl || response.data
            if (row.mediaCate === 1) {
              this.currentImageUrl = playUrl
              console.log(this.currentImageUrl)
            } else if (row.mediaCate === 4) {
              this.currentTextUrl = playUrl
            } else {
              this.currentVideoUrl = playUrl
            }
            console.log('获取播放地址成功:', playUrl)
          } else {
            console.warn('获取播放地址失败:', response.msg)
            this.msgWarning(response.msg || '获取播放地址失败')
          }
        })
        .catch((error) => {
          console.error('获取播放地址异常:', error)
          this.msgError('获取播放地址异常')
        })
    },

    /** 视频播放器关闭 */
    handleVideoPlayerClose() {
      this.currentVideoUrl = ''
      this.currentPlayMediaCate = 3
    },

    /** 图片预览关闭 */
    handleImageViewerClose() {
      this.currentImageUrl = ''
    },

    /** 文本/日志预览关闭 */
    handleTextViewerClose() {
      this.currentTextUrl = ''
    },

    /** 一键归档(单个) */
    handleQuickArchive(row) {
      this.isBatchArchive = false
      this.currentArchivingMedia = row
      this.currentArchivingMediaList = [this.currentArchivingMedia.mediaId]
      this.archiveType = 'existing'
      this.archiveForm = {
        archiveCode: '',
        archiveId: '',
        archiveTitle: '',
        archiveType: undefined
      }
      this.archiveDialogVisible = true
    },

    /** 批量归档 */
    handleBatchArchive() {
      if (this.mediaIds.length === 0) {
        this.msgError('请至少选择一个媒体')
        return
      }

      this.isBatchArchive = true
      this.currentArchivingMedia = null
      this.currentArchivingMediaList = this.mediaIds
      this.archiveType = 'existing'
      this.archiveForm = {
        archiveCode: '',
        archiveId: '',
        archiveTitle: '',
        archiveType: undefined
      }
      this.archiveDialogVisible = true
    },

    /** 取消归档 */
    cancelArchive() {
      this.archiveDialogVisible = false
      this.isBatchArchive = false
      this.currentArchivingMedia = null
      this.currentArchivingMediaList = []
      this.archiveForm = {
        archiveCode: '',
        archiveId: '',
        archiveTitle: '',
        archiveType: undefined
      }
    },

    /** 打开档案选择对话框 */
    openArchiveSelector() {
      this.archiveSelectorVisible = true
    },

    /** 确认选择档案 */
    confirmSelectArchive(selectedArchives) {
      if (selectedArchives && selectedArchives.length > 0) {
        const archive = selectedArchives[0]
        this.archiveForm.archiveCode = archive.archiveCode
        this.archiveForm.archiveId = archive.archiveId
      }
      this.archiveSelectorVisible = false
    },

    /** 取消选择档案 */
    cancelSelectArchive() {
      this.archiveSelectorVisible = false
    },

    /** 提交归档 */
    submitArchive() {
      // 验证是否选择了媒体
      if (this.currentArchivingMediaList.length === 0) {
        this.msgError('未选择要归档的媒体')
        return
      }

      if (this.archiveType === 'existing') {
        // 选择现有档案
        if (!this.archiveForm.archiveCode) {
          this.msgError('请选择档案')
          return
        }
        this.linkMediaToArchive()
      } else {
        // 新增档案
        if (!this.archiveForm.archiveTitle) {
          this.msgError('请输入档案标题')
          return
        }
        if (!this.archiveForm.archiveType) {
          this.msgError('请选择档案类型')
          return
        }
        this.createArchiveAndLink()
      }
    },

    /** 关联媒体到现有档案 */
    linkMediaToArchive() {
      // 批量归档
      const data = {
        archiveId: this.archiveForm.archiveId,
        mediaIds: this.currentArchivingMediaList
      }

      batchAddArchiveMediaRelations(data)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess('批量归档成功')
            this.archiveDialogVisible = false
            this.$refs.mediaSelector.refreshList()
          } else {
            this.msgError(response.msg || '批量归档失败')
          }
        })
        .catch((error) => {
          this.msgError('批量归档失败：' + (error.message || '未知错误'))
        })
    },

    /** 创建新档案并关联 */
    createArchiveAndLink() {
      const archiveData = {
        archiveTitle: this.archiveForm.archiveTitle,
        archiveType: this.archiveForm.archiveType,
        storageDuration: 120 // 默认保存期限120个月
      }

      // 先创建档案
      addArchive(archiveData)
        .then((response) => {
          if (response.code === 200) {
            // 档案创建成功，获取档案ID和编码
            this.archiveForm.archiveId = response.data
            // 然后关联媒体
            return this.linkMediaToArchive()
          } else {
            this.msgError(response.msg || '创建档案失败')
            return Promise.reject(new Error(response.msg))
          }
        })
        .catch((error) => {
          this.msgError('创建档案失败：' + (error.message || '未知错误'))
        })
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },

    /** 查询条件-组织选择事件 */
    handleOrgSelect(node) {
      if (node) {
        listUser({ orgId: '/' + node.id + '/' }).then((response) => {
          this.userOptions = response.data.list
        })
      } else {
        this.userOptions = []
      }
    },

    /** 表单-组织选择事件 */
    handleFormOrgSelect(node) {
      if (node) {
        listUser({ orgId: '/' + node.id + '/' }).then((response) => {
          this.userOptions = response.data.list
        })
        // 清空警员和执法仪选择
        this.form.policeId = undefined
        this.form.recorderId = undefined
        this.bwcOptions = []
      } else {
        this.userOptions = []
        this.form.policeId = undefined
        this.form.recorderId = undefined
        this.bwcOptions = []
      }
    },

    /** 表单-警员选择事件 */
    handleFormPoliceSelect(policeId) {
      if (policeId) {
        // 根据警员ID获取其管理的执法仪列表
        getEquipmentBwcList({ managerId: policeId }).then((response) => {
          this.bwcOptions = response.data.list || []
        })
        // 清空执法仪选择
        this.form.recorderId = undefined
      } else {
        this.bwcOptions = []
        this.form.recorderId = undefined
      }
    },

    /** 启动删除工作流 */
    startDeleteWorkflow(mediaId) {
      const currentUserId = this.$store?.state?.user?.userid || undefined
      // 构建输入数据
      const inputData = {
        mediaId: mediaId,
        mediaName: this.currentDeleteMedia?.mediaName || '',
        firstAssignee: currentUserId
      }

      // 使用 mixin 提供的方法启动工作流实例
      this.startWorkflowInstance(
        '文档删除申请流程',
        inputData,
        async(taskId) => {
          this.currentTaskId = taskId
          this.taskProcessOpen = true
          const data = {
            instanceId: this.currentInstanceId,
            taskId: taskId
          }
          try {
            const response = await submitDeleteApplyRecord(inputData.mediaId, data)
            if (response.code === 200) {
              this.msgSuccess('删除媒体申请已提交')
            } else {
              this.msgError(response.msg || '删除媒体申请提交失败')
            }
          } catch (err) {
            console.error('提交删除媒体申请失败:', err)
            this.msgError('提交删除媒体申请失败')
          }
        },
        (error) => {
          // 失败回调
          console.error('启动删除审批工作流失败:', error)
        }
      )
    },

    /** 任务处理成功回调 */
    handleTaskProcessSuccess() {
      // 刷新媒体列表
      this.$refs.mediaSelector.refreshList()
    },

    /** 任务处理对话框关闭回调 */
    handleTaskProcessClose() {
      this.taskProcessOpen = false
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    // 以下方法已由 workflowMixin 提供，无需重复定义:
    // - handleProcessTask (使用 loadTaskForProcessing 替代)
    // - submitTaskApprove (使用 submitTaskApproval 替代)
    // - submitTaskReject (使用 submitTaskRejection 替代)
    // - getFieldLabel
    // - getFieldType
    // - getFieldPlaceholder
    // - getFieldTypeForInit
    // - generateFormRules

    // ========== 以下方法已移除，由 workflowMixin 和 TaskProcessDialog 组件提供 ==========
    // - handleProcessTask (已由 TaskProcessDialog 组件处理)
    // - submitTaskApprove (已由 workflowMixin.submitTaskApproval 提供)
    // - submitTaskReject (已由 workflowMixin.submitTaskRejection 提供)
    // - getFieldLabel (已由 workflowMixin 提供)
    // - getFieldType (已由 workflowMixin 提供)
    // - getFieldPlaceholder (已由 workflowMixin 提供)
    // - getFieldTypeForInit (已由 workflowMixin 提供)
    // - generateFormRules (已由 workflowMixin 提供)
    // ==================================================================================
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

/* 本页面使用的样式类已全部在全局样式中定义：
   - .archive-info-section → src/styles/components/utilities.scss:37-43
   - .action-btn.* → src/styles/components/buttons.scss
   - .edit-dialog → src/styles/components/dialogs.scss:34-36
   - .dialog-footer → src/styles/components/dialogs.scss:6-14
   - .tertiary, .secondary → src/styles/components/buttons.scss
   - .vue-treeselect.* → src/styles/components/forms.scss:63-138

   注：本页面无自定义样式，所有样式均使用全局定义
 */
</style>
