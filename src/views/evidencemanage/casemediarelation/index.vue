<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询表单 -->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="案件编号" prop="caseCode">
            <el-input
              v-model="queryParams.caseCode"
              placeholder="请输入案件编号"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件名称" prop="caseName">
            <el-input
              v-model="queryParams.caseName"
              placeholder="请输入案件名称"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件类型" prop="caseType">
            <el-select v-model="queryParams.caseType" placeholder="案件类型" clearable style="width: 170px;">
              <el-option
                v-for="dict in caseTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="案件流程" prop="caseFlow">
            <el-select v-model="queryParams.caseFlow" placeholder="案件流程" clearable style="width: 170px;">
              <el-option
                v-for="dict in caseFlowOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 案件列表 -->
        <el-table
          ref="caseTable"
          v-loading="loading"
          :data="caseList"
          border
          @select="handleSelect"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column prop="caseCode" label="案件编号" width="120" />
          <el-table-column prop="caseName" label="案件名称" width="200" />
          <el-table-column prop="caseType" label="案件类型" width="100">
            <template slot-scope="scope">
              {{ caseTypeFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="caseTime" label="案发时间" width="170" />
          <el-table-column prop="caseAddress" label="案发地址" width="200" />
          <el-table-column prop="caseFlow" label="案件流程" width="100">
            <template slot-scope="scope">
              {{ caseFlowFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="300"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-link"
                @click="handleLinkMedia(scope.row)"
              >关联媒体</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleEditEvidence(scope.row)"
              >编辑证据</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 案件媒体关联列表 -->
        <div v-if="currentSelectedCase" class="media-relations-section">
          <el-divider content-position="left">
            <span style="font-weight: bold; color: #409EFF;">
              案件媒体关联列表
            </span>
          </el-divider>

          <el-table
            v-loading="mediaRelationsLoading"
            :data="mediaRelationsList"
            border
            style="margin-top: 10px;"
          >
            <el-table-column prop="caseCode" label="案件编号" width="120" align="center" />
            <el-table-column prop="mediaName" label="媒体名称" width="180" />
            <el-table-column prop="mediaCate" label="媒体种类" width="100" align="center">
              <template slot-scope="scope">
                <el-tag disable-transitions>{{ mediaCateFormat(scope.row) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="shotTimeStart" label="拍摄时间" width="160" align="center">
              <template slot-scope="scope">
                {{ parseTime(scope.row.shotTimeStart) }}
              </template>
            </el-table-column>
            <el-table-column prop="importTime" label="导入时间" width="160" align="center">
              <template slot-scope="scope">
                {{ parseTime(scope.row.importTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="relationTime" label="关联时间" width="160" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.relationTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="operatorName" label="操作员" width="100" align="center" />
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  style="color: #F56C6C;"
                  @click="handleUnlinkMedia(scope.row)"
                >取消关联</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="mediaRelationsList.length === 0" class="empty-data">
            <el-empty description="暂无关联媒体" :image-size="100" />
          </div>
        </div>

        <!-- 关联媒体对话框 -->
        <MediaSelectorDialog
          ref="mediaSelector"
          title="关联媒体"
          :visible.sync="linkMediaOpen"
          :multiple="true"
          :currentCase="currentCase"
          @confirm="confirmLinkMedia"
          @cancel="cancelLinkMedia"
        />

        <!-- 编辑证据对话框 -->
        <el-dialog
          title="编辑证据"
          :visible.sync="editEvidenceOpen"
          width="90%"
          :close-on-click-modal="false"
        >
          <!-- 案件基本信息 -->
          <el-card shadow="never" style="margin-bottom: 20px;">
            <div slot="header" class="clearfix">
              <span style="font-weight: bold;">案件基本信息</span>
            </div>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="案件编号">{{ currentEditCase.caseCode }}</el-descriptions-item>
              <el-descriptions-item label="案件名称">{{ currentEditCase.caseName }}</el-descriptions-item>
              <el-descriptions-item label="案件类型">{{ caseTypeFormat(currentEditCase) }}</el-descriptions-item>
              <el-descriptions-item label="案件流程">{{ caseFlowFormat(currentEditCase) }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentEditCase.createdAt }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 当前案件已关联的媒体列表 -->
          <el-card shadow="never" style="margin-bottom: 20px;">
            <div slot="header" class="clearfix">
              <span style="font-weight: bold;">当前案件已关联的媒体列表</span>
            </div>
            <el-table
              v-loading="caseMediaListLoading"
              :data="caseMediaList"
              border
              max-height="300"
            >
              <el-table-column prop="mediaName" label="媒体名称" width="180" />
              <el-table-column prop="mediaCate" label="媒体种类" width="180" align="center">
                <template slot-scope="scope">
                  <el-tag disable-transitions>{{ mediaCateFormat(scope.row) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="mediaSuffix" label="媒体后缀" width="180" align="center"/>
              <el-table-column prop="storageType" label="存储方式" width="180"  align="center">
                <template slot-scope="scope">
                  {{ storageTypeFormat(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column prop="shotTimeStart" label="拍摄时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ parseTime(scope.row.shotTimeStart) }}
                </template>
              </el-table-column>
              <el-table-column prop="importTime" label="导入时间" width="160" align="center">
                <template slot-scope="scope">
                  {{ parseTime(scope.row.importTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" align="center">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-upload"
                    @click="handleSetAsSourceEvidence(scope.row)"
                  >设为源证据</el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-view"
                    @click="handleViewMedia(scope.row)"
                  >浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 证据媒体和源证据媒体并列显示 -->
          <el-row :gutter="20">
            <!-- 左侧：证据媒体列表 -->
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span style="font-weight: bold; color: #67C23A;">证据媒体</span>
                </div>
                <el-table
                  v-loading="evidenceMediaListLoading"
                  :data="evidenceMediaList"
                  border
                  max-height="400"
                >
                  <el-table-column prop="mediaName" label="媒体名称" width="150" />
                  <el-table-column prop="mediaCate" label="媒体种类" width="90" align="center">
                    <template slot-scope="scope">
                      <el-tag disable-transitions>{{ mediaCateFormat(scope.row) }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="shotTimeStart" label="拍摄时间" width="150" align="center">
                    <template slot-scope="scope">
                      {{ parseTime(scope.row.shotTimeStart) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="importTime" label="导入时间" width="150" align="center">
                    <template slot-scope="scope">
                      {{ parseTime(scope.row.importTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-view"
                        @click="handleViewMedia(scope.row)"
                      >浏览</el-button>
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-delete"
                        style="color: #F56C6C;"
                        @click="handleRemoveEvidenceMedia(scope.row)"
                      >移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div v-if="evidenceMediaList.length === 0" class="empty-data">
                  <el-empty description="暂无证据媒体" :image-size="80" />
                </div>
              </el-card>
            </el-col>

            <!-- 右侧：源证据媒体列表 -->
            <el-col :span="12">
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span style="font-weight: bold; color: #E6A23C;">源证据媒体</span>
                </div>
                <el-table
                  v-loading="sourceEvidenceMediaListLoading"
                  :data="sourceEvidenceMediaList"
                  border
                  max-height="400"
                >
                  <el-table-column prop="mediaName" label="媒体名称" width="150" />
                  <el-table-column prop="mediaCate" label="媒体种类" width="90" align="center">
                    <template slot-scope="scope">
                      <el-tag disable-transitions>{{ mediaCateFormat(scope.row) }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="shotTimeStart" label="拍摄时间" width="150" align="center">
                    <template slot-scope="scope">
                      {{ parseTime(scope.row.shotTimeStart) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="importTime" label="导入时间" width="150" align="center">
                    <template slot-scope="scope">
                      {{ parseTime(scope.row.importTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-view"
                        @click="handleViewMedia(scope.row)"
                      >浏览</el-button>
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-delete"
                        style="color: #F56C6C;"
                        @click="handleRemoveSourceEvidence(scope.row)"
                      >移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div v-if="sourceEvidenceMediaList.length === 0" class="empty-data">
                  <el-empty description="暂无源证据媒体" :image-size="80" />
                </div>
              </el-card>
            </el-col>
          </el-row>

          <div slot="footer" class="dialog-footer">
            <el-button @click="editEvidenceOpen = false">关 闭</el-button>
          </div>
        </el-dialog>

        <!-- 媒体详情对话框 -->
        <el-dialog title="媒体详情" :visible.sync="viewMediaOpen" width="800px" append-to-body>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="媒体名称">{{ viewMediaData.mediaName }}</el-descriptions-item>
            <el-descriptions-item label="媒体编号">{{ viewMediaData.mediaCode }}</el-descriptions-item>
            <el-descriptions-item label="媒体类型">{{ mediaCateFormat(viewMediaData.row) }}</el-descriptions-item>
            <el-descriptions-item label="拍摄时间">{{ parseTime(viewMediaData.shotTime) }}</el-descriptions-item>
            <el-descriptions-item label="拍摄警员">{{ viewMediaData.policeName }}</el-descriptions-item>
            <el-descriptions-item label="所属组织">{{ viewMediaData.orgFullName }}</el-descriptions-item>
            <el-descriptions-item label="存储路径" :span="2">{{ viewMediaData.mediaUrl }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="viewMediaData.mediaUrl" style="margin-top: 20px; text-align: center;">
            <el-button type="primary" icon="el-icon-view" @click="window.open(viewMediaData.mediaUrl, '_blank')">
              打开媒体文件
            </el-button>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="viewMediaOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listCases } from '@/api/evidence/case_api'
import { batchCreateCaseMediaRelations, deleteCaseMediaRelation, getMediaListByCaseId } from '@/api/evidence/case_media_relation_api'
import { batchAddEvidenceSourceMedia, removeEvidenceSourceMedia } from '@/api/evidence/evidence_media_source_api'
import { getMediaByCaseId, getSourceMediaByCaseId, getEvidenceMediaByCaseId } from '@/api/evidence/evidence_manage_query_api'
import MediaSelectorDialog from '@/components/MediaSelectorDialog'

export default {
  name: 'CaseMediaRelation',
  components: {
    MediaSelectorDialog
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 案件数据
      caseList: [],
      // 案件类型选项
      caseTypeOptions: [],
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储方式选项
      storageTypeOptions: [],
      // 案件流程选项 - 行政案件流程
      adminCaseProcessOptions: [],
      // 案件流程选项 - 刑事案件流程
      criminalCaseProcessOptions: [],
      // 是否显示关联媒体对话框
      linkMediaOpen: false,
      // 当前选中的案件记录
      currentCase: null,
      // 当前选中的案件记录（用于显示媒体关联列表）
      currentSelectedCase: null,
      // 案件媒体关联列表
      mediaRelationsList: [],
      // 媒体关联列表加载状态
      mediaRelationsLoading: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        caseFlow: undefined
      },
      // ========== 编辑证据相关 ==========
      // 是否显示编辑证据对话框
      editEvidenceOpen: false,
      // 当前编辑的案件
      currentEditCase: {},
      // 当前案件已关联的媒体列表
      caseMediaList: [],
      caseMediaListLoading: false,
      // 证据媒体列表（暂时与源证据媒体列表相同）
      evidenceMediaList: [],
      evidenceMediaListLoading: false,
      // 源证据媒体列表
      sourceEvidenceMediaList: [],
      sourceEvidenceMediaListLoading: false,
      // 媒体详情对话框
      viewMediaOpen: false,
      // 媒体详情数据
      viewMediaData: {}
    }
  },
  created() {
    this.getList()
    this.getDicts('case_type').then(response => {
      this.caseTypeOptions = response.data
    })
    this.getDicts('admin_case_process').then(response => {
      this.adminCaseProcessOptions = response.data
    })
    this.getDicts('criminal_case_process').then(response => {
      this.criminalCaseProcessOptions = response.data
    })
    this.getDicts('evidence_media_type').then(response => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('evidence_storage_type').then(response => {
      this.storageTypeOptions = response.data
    })
  },
  methods: {
    /** 查询案件列表 */
    getList() {
      this.loading = true
      listCases(this.queryParams).then(response => {
        this.caseList = response.data.list
        this.total = response.data.count
        this.loading = false

        // 默认选中第一条案件
        this.$nextTick(() => {
          if (this.caseList.length > 0) {
            const firstCase = this.caseList[0]
            this.$refs.caseTable.clearSelection()
            this.$refs.caseTable.toggleRowSelection(firstCase, true)
            this.currentSelectedCase = firstCase
            this.loadMediaRelations(firstCase.id)
          } else {
            this.currentSelectedCase = null
            this.mediaRelationsList = []
          }
        })
      })
    },

    // 案件类型字典翻译
    caseTypeFormat(row) {
      return this.selectDictLabel(this.caseTypeOptions, parseInt(row.caseType))
    },

    // 案件流程字典翻译 - 根据案件类型选择对应的流程字典
    caseFlowFormat(row) {
      return this.getCaseFlowLabel(row.caseFlow, row.caseType)
    },
    // 字典状态字典翻译
    mediaCateFormat(row) {
          if (row != undefined) {
            return this.selectDictLabel(this.mediaCateOptions, parseInt(row.mediaCate))
          }
          
    },
    // 字典状态字典翻译
    storageTypeFormat(row) {
          if (row != undefined) {
            return this.selectDictLabel(this.storageTypeOptions, parseInt(row.storageType))
          }
          
    },

    /** 获取案件流程标签 - 根据案件类型确定字典类型 */
    getCaseFlowLabel(value, caseType) {
      // 根据案件类型确定字典类型
      if (this.caseTypeOptions && this.caseTypeOptions.length > 0) {
        const caseTypeDict = this.caseTypeOptions.find(item => item.value === caseType || item.value === String(caseType))
        if (caseTypeDict) {
          if (caseTypeDict.label.includes('行政')) {
            return this.selectDictLabel(this.adminCaseProcessOptions, value)
          } else if (caseTypeDict.label.includes('刑事')) {
            return this.selectDictLabel(this.criminalCaseProcessOptions, value)
          }
        }
      }
      return value
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 表格选择事件 */
    handleSelect(selection, row) {
      // 单选逻辑：清除其他选择，只保留当前行
      this.$refs.caseTable.clearSelection()
      this.$refs.caseTable.toggleRowSelection(row, true)
      this.currentSelectedCase = row
      this.loadMediaRelations(row.id)
    },

    /** 表格选择变化事件 */
    handleSelectionChange(selection) {
      if (selection.length > 0) {
        const selectedCase = selection[selection.length - 1]
        this.currentSelectedCase = selectedCase
        this.loadMediaRelations(selectedCase.id)
      } else {
        this.currentSelectedCase = null
        this.mediaRelationsList = []
      }
    },

    /** 关联媒体按钮操作 */
    handleLinkMedia(row) {
      this.currentCase = row
      // 自动选中该行
      this.$refs.caseTable.clearSelection()
      this.$refs.caseTable.toggleRowSelection(row, true)
      this.$refs.mediaSelector.refresh()
      this.linkMediaOpen = true
    },

    /** 取消关联媒体 */
    cancelLinkMedia() {
      this.linkMediaOpen = false
      this.currentCase = null
    },

    /** 确认关联媒体 */
    confirmLinkMedia(selectedMedia) {
      // 检查是否选中了媒体
      if (!selectedMedia || selectedMedia.length === 0) {
        this.msgError('请选择要关联的媒体')
        return
      }

      // 调用关联媒体的API
      const data = {
        caseId: this.currentCase.id,
        mediaIds: selectedMedia.map(item => item.mediaId)
      }

      batchCreateCaseMediaRelations(data).then(response => {
        this.msgSuccess(`成功关联 ${selectedMedia.length} 个媒体`)
        this.linkMediaOpen = false

        // 延迟2秒后刷新媒体关联列表
        setTimeout(() => {
          this.loadMediaRelations(this.currentCase.id)
        }, 2000)
      }).catch(error => {
        this.msgError('关联媒体失败：' + (error.message || '未知错误'))
      })
    },

    /** 加载案件媒体关联列表 */
    loadMediaRelations(caseId) {
      this.mediaRelationsLoading = true
      const query = {
        pageIndex: 1,
        pageSize: 100
      }
      getMediaListByCaseId(caseId, query).then(response => {
        this.mediaRelationsList = response.data.list || []
        this.mediaRelationsLoading = false
      }).catch(error => {
        console.error('加载媒体关联列表失败:', error)
        this.mediaRelationsList = []
        this.mediaRelationsLoading = false
      })
    },

    /** 取消关联媒体 */
    handleUnlinkMedia(row) {
      this.$confirm('确认取消关联该媒体吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCaseMediaRelation(row.id).then(response => {
          this.msgSuccess('取消关联成功')
          // 延迟2秒后刷新媒体关联列表
          setTimeout(() => {
            this.loadMediaRelations(this.currentSelectedCase.id)
          }, 2000)
        }).catch(error => {
          this.msgError('取消关联失败：' + (error.message || '未知错误'))
        })
      })
    },

    // ========== 编辑证据相关方法 ==========

    /** 编辑证据 */
    handleEditEvidence(row) {
      this.currentEditCase = { ...row }
      this.editEvidenceOpen = true

      // 加载当前案件已关联的媒体列表
      this.loadCaseMediaList(row.id)

      // 加载源证据媒体列表
      this.loadSourceEvidenceMediaList(row.id)

      // 加载证据媒体列表
      this.loadEvidenceMediaList(row.id)
    },

    /** 加载当前案件已关联的媒体列表 */
    loadCaseMediaList(caseId) {
      this.caseMediaListLoading = true
      getMediaByCaseId(caseId, { pageIndex: 1, pageSize: 1000 }).then(response => {
        this.caseMediaList = response.data.list || []
        this.caseMediaListLoading = false
      }).catch(error => {
        this.msgError('加载案件媒体列表失败：' + (error.message || '未知错误'))
        this.caseMediaListLoading = false
      })
    },

    /** 加载源证据媒体列表 */
    loadSourceEvidenceMediaList(caseId) {
      this.sourceEvidenceMediaListLoading = true
      getSourceMediaByCaseId(caseId, { pageIndex: 1, pageSize: 1000 }).then(response => {
        this.sourceEvidenceMediaList = response.data.list || []
        this.sourceEvidenceMediaListLoading = false
      }).catch(error => {
        this.msgError('加载源证据媒体列表失败：' + (error.message || '未知错误'))
        this.sourceEvidenceMediaListLoading = false
      })
    },

    /** 加载证据媒体列表 */
    loadEvidenceMediaList(caseId) {
      this.evidenceMediaListLoading = true
      getEvidenceMediaByCaseId(caseId, { pageIndex: 1, pageSize: 1000 }).then(response => {
        this.evidenceMediaList = response.data.list || []
        this.evidenceMediaListLoading = false
      }).catch(error => {
        this.msgError('加载证据媒体列表失败：' + (error.message || '未知错误'))
        this.evidenceMediaListLoading = false
      })
    },

    /** 设为源证据 */
    handleSetAsSourceEvidence(row) {
      const data = {
        caseId: this.currentEditCase.id,
        mediaIds: [row.mediaId],
        operatorId: this.$store.state.user.userId
      }

      batchAddEvidenceSourceMedia(data).then(() => {
        this.msgSuccess('设为源证据成功')
        // 刷新源证据媒体列表和证据媒体列表
        this.loadSourceEvidenceMediaList(this.currentEditCase.id)
        this.loadEvidenceMediaList(this.currentEditCase.id)
      }).catch(error => {
        this.msgError('设为源证据失败：' + (error.message || '未知错误'))
      })
    },

    /** 移除源证据 */
    handleRemoveSourceEvidence(row) {
      this.$confirm('确认要移除该源证据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeEvidenceSourceMedia(this.currentEditCase.id, row.mediaId).then(() => {
          this.msgSuccess('移除源证据成功')
          // 刷新源证据媒体列表和证据媒体列表
          this.loadSourceEvidenceMediaList(this.currentEditCase.id)
          this.loadEvidenceMediaList(this.currentEditCase.id)
        }).catch(error => {
          this.msgError('移除源证据失败：' + (error.message || '未知错误'))
        })
      })
    },

    /** 移除证据媒体 */
    handleRemoveEvidenceMedia(row) {
      this.$confirm('确认要移除该证据媒体吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 暂时与移除源证据功能相同
        removeEvidenceSourceMedia(this.currentEditCase.id, row.mediaId).then(() => {
          this.msgSuccess('移除证据媒体成功')
          // 刷新源证据媒体列表
          this.loadSourceEvidenceMediaList(this.currentEditCase.id)
        }).catch(error => {
          this.msgError('移除证据媒体失败：' + (error.message || '未知错误'))
        })
      })
    },

    /** 浏览媒体详情 */
    handleViewMedia(row) {
      // 导入getMedia API
      const { getMedia } = require('@/api/evidence/evidence_manage_query_api')

      // 根据媒体ID获取媒体详细信息
      getMedia(row.mediaId).then(response => {
        this.viewMediaData = response.data
        this.viewMediaOpen = true
      }).catch(error => {
        this.msgError('获取媒体详情失败：' + (error.message || '未知错误'))
      })
    },

    /** 格式化日期时间 */
    formatDateTime(dateTime) {
      if (!dateTime) {
        return '-'
      }
      // 如果是字符串,转换为Date对象
      const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
      // 格式化为 YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style scoped>
.media-relations-section {
  margin-top: 20px;
}

.empty-data {
  text-align: center;
  padding: 20px;
}
</style>
