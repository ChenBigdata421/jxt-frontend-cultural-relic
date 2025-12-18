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
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件名称" prop="caseName">
            <el-input
              v-model="queryParams.caseName"
              placeholder="请输入案件名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件类型" prop="caseType">
            <el-select
              v-model="queryParams.caseType"
              placeholder="案件类型"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in caseTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="案件流程" prop="caseFlow">
            <el-select
              v-model="queryParams.caseFlow"
              placeholder="案件流程"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in caseFlowOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
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

        <!-- 案件列表 -->
        <el-table ref="caseTable" v-loading="loading" :data="caseList" border>
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
                >已关联媒体</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleEditEvidence(scope.row)"
                >编辑证据</el-button
              >
            </template>
          </el-table-column>
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
        :title="`案件【${currentCase ? currentCase.caseCode : ''}】的关联媒体`"
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
                >关联新媒体</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnlinkMedia"
                >批量取消关联</el-button
              >
            </el-col>
          </el-row>

          <!-- 关联媒体列表 -->
          <el-table
            ref="mediaRelationsTable"
            v-loading="relationsLoading"
            :data="relationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="caseCode" label="案件编号" align="center" />
            <el-table-column prop="mediaName" label="媒体名称" />
            <el-table-column prop="mediaCate" label="媒体种类" align="center">
              <template slot-scope="{ row }">
                {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column prop="policeName" label="关联人" align="center" />
            <el-table-column
              prop="orgFullName"
              label="关联人组织"
              align="center"
            />
            <el-table-column prop="createdAt" label="关联时间" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.createdAt) }}
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
                  >取消关联</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <div v-if="relationsList.length === 0" class="empty-data">
            <el-empty description="暂无关联媒体" :image-size="100" />
          </div>
          <pagination
            v-show="relationTotal > 0"
            :total="relationTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadCaseMediaRelations"
          />
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
            @selection-change="handleMediaSelectionChange"
          />
        </div>

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button @click="handleCloseSelectorDrawer">取 消</el-button>
          <el-button type="primary" @click="confirmLinkMedia">确 定</el-button>
        </div>
      </el-drawer>

      <!-- 导入证据对话框 -->
      <el-dialog
        :title="upload.title"
        :visible.sync="upload.open"
        width="650px"
        :close-on-click-modal="false"
        @close="handleUploadDialogClose"
      >
        <!-- 表单区域 -->
        <el-form
          ref="uploadForm"
          :model="uploadForm"
          :rules="uploadRules"
          label-width="100px"
          size="small"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备编号" prop="deviceCode">
                <el-input
                  v-model="uploadForm.deviceCode"
                  placeholder="请输入设备编号"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="警察编号" prop="policeCode">
                <el-input
                  v-model="uploadForm.policeCode"
                  placeholder="请输入警察编号"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="重要级别" prop="importantLevel">
                <el-select
                  v-model="uploadForm.importantLevel"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="1级" :value="1" />
                  <el-option label="2级" :value="2" />
                  <el-option label="3级" :value="3" />
                  <el-option label="4级" :value="4" />
                  <el-option label="5级" :value="5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="存储类型" prop="storageType">
                <el-select
                  v-model="uploadForm.storageType"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option label="本地存储" :value="1" />
                  <el-option label="OSS存储" :value="2" />
                  <el-option label="分布式存储" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标签" prop="tags">
            <el-input
              v-model="uploadForm.tags"
              placeholder="请输入标签，多个标签用逗号分隔"
              clearable
            />
          </el-form-item>
          <el-form-item label="备注" prop="comments">
            <el-input
              v-model="uploadForm.comments"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>

        <!-- 文件上传区域 -->
        <div class="upload-area">
          <el-upload
            ref="uploadComponent"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="[]"
            :show-file-list="false"
            :limit="10"
            multiple
            action="#"
            drag
            class="upload-dragger"
          >
            <div class="upload-dragger-content">
              <i
                class="el-icon-folder"
                style="font-size: 48px; color: #ffc107; margin-bottom: 10px"
              />
              <div class="upload-text">点击选择文件或拖拽文件到此处</div>
              <div class="upload-hint">支持多选，自动上传已禁用</div>
              <el-button type="primary" size="small" style="margin-top: 15px"
                >选择文件</el-button
              >
            </div>
          </el-upload>
          <div class="upload-tip">可多选，大小限制自行判断</div>
        </div>

        <!-- 文件列表 -->
        <div v-if="fileList.length > 0" class="file-list">
          <div v-for="(file, index) in fileList" :key="index" class="file-item">
            <div class="file-info">
              <i :class="getFileIcon(file.name)" class="file-icon" />
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
                <div class="file-status" :class="getFileStatusClass(file)">
                  <i :class="getFileStatusIcon(file)" />
                  {{ getFileStatusText(file) }}
                </div>
              </div>
            </div>
            <div class="file-actions">
              <el-button
                v-if="!file.uploaded"
                type="primary"
                size="mini"
                @click="submitUploadForm(index, true)"
                >上传</el-button
              >
              <el-button type="danger" size="mini" @click="removeFile(index)"
                >删除</el-button
              >
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div slot="footer" class="dialog-footer">
          <el-button
            v-if="fileList.length > 0"
            type="success"
            :loading="upload.isUploading"
            @click="submitUploadForm(null, false)"
            >上传全部文件</el-button
          >
          <el-button type="danger" @click="clearAllFiles">清空列表</el-button>
          <el-button type="danger" @click="handleUploadDialogClose"
            >关闭</el-button
          >
        </div>
      </el-dialog>

      <!-- 编辑证据对话框 -->
      <el-dialog
        title="编辑证据"
        :visible.sync="editEvidenceOpen"
        width="90%"
        :close-on-click-modal="false"
      >
        <!-- 案件基本信息 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold">案件基本信息</span>
          </div>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="案件编号">{{
              currentEditCase.caseCode
            }}</el-descriptions-item>
            <el-descriptions-item label="案件名称">{{
              currentEditCase.caseName
            }}</el-descriptions-item>
            <el-descriptions-item label="案件类型">{{
              caseTypeFormat(currentEditCase)
            }}</el-descriptions-item>
            <el-descriptions-item label="案件流程">{{
              caseFlowFormat(currentEditCase)
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              currentEditCase.createdAt
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 当前案件已关联的媒体列表 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <div slot="header" class="clearfix">
            <span style="font-weight: bold">当前案件已关联的媒体列表</span>
          </div>
          <el-table
            v-loading="caseMediaListLoading"
            :data="caseMediaList"
            border
            max-height="300"
          >
            <el-table-column prop="mediaName" label="媒体名称" width="180" />
            <el-table-column
              prop="mediaCate"
              label="媒体种类"
              width="120"
              align="center"
            >
              <template slot-scope="{ row }">
                {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="mediaSuffix"
              label="媒体后缀"
              width="180"
              align="center"
            />
            <el-table-column
              prop="storageType"
              label="存储方式"
              width="120"
              align="center"
            >
              <template slot-scope="{ row }">
                {{ selectDictLabel(storageTypeOptions, row.storageType) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="shotTimeStart"
              label="拍摄时间"
              width="160"
              align="center"
            >
              <template slot-scope="scope">
                {{ parseTime(scope.row.shotTimeStart) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="importTime"
              label="导入时间"
              width="160"
              align="center"
            >
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
                  :disabled="isMediaSourceEvidence(scope.row)"
                  @click="handleSetAsSourceEvidence(scope.row)"
                  >设为源证据</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-view"
                  @click="handleViewMedia(scope.row)"
                  >浏览</el-button
                >
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
                <span
                  style="font-weight: bold; color: #67c23a; margin-right: 400px"
                  >证据媒体</span
                >
                <el-button
                  v-permisaction="['admin:sysUser:import']"
                  type="warning"
                  icon="el-icon-upload"
                  size="mini"
                  @click="handleImportEvidence"
                  >导入证据</el-button
                >
                <el-button
                  v-permisaction="['admin:sysUser:refresh']"
                  type="warning"
                  icon="el-icon-refresh"
                  size="mini"
                  @click="handleRefreshEvidenceMediaList"
                  >刷新</el-button
                >
              </div>
              <el-table
                v-loading="evidenceMediaListLoading"
                :data="evidenceMediaList"
                border
                max-height="400"
              >
                <el-table-column
                  prop="mediaName"
                  label="媒体名称"
                  width="150"
                />
                <el-table-column
                  prop="mediaCate"
                  label="媒体种类"
                  width="90"
                  align="center"
                  :formatter="mediaCateFormat"
                />
                <el-table-column
                  prop="shotTimeStart"
                  label="拍摄时间"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    {{ parseTime(scope.row.shotTimeStart) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="importTime"
                  label="导入时间"
                  width="150"
                  align="center"
                >
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
                      >浏览</el-button
                    >
                    <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      style="color: #f56c6c"
                      @click="handleRemoveEvidenceMedia(scope.row)"
                      >移除</el-button
                    >
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
                <span
                  style="font-weight: bold; color: #e6a23c; margin-right: 500px"
                  >证据源媒体</span
                >
                <el-button
                  v-permisaction="['admin:sysUser:refresh']"
                  type="warning"
                  icon="el-icon-refresh"
                  size="mini"
                  @click="handleRefreshEvidenceMediaSourceList"
                  >刷新</el-button
                >
              </div>
              <el-table
                v-loading="sourceEvidenceMediaListLoading"
                :data="sourceEvidenceMediaList"
                border
                max-height="400"
              >
                <el-table-column
                  prop="mediaName"
                  label="媒体名称"
                  width="150"
                />
                <el-table-column
                  prop="mediaCate"
                  label="媒体种类"
                  width="90"
                  align="center"
                  :formatter="mediaCateFormat"
                />
                <el-table-column
                  prop="shotTimeStart"
                  label="拍摄时间"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    {{ parseTime(scope.row.shotTimeStart) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="importTime"
                  label="导入时间"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    {{ parseTime(scope.row.importTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200" align="center">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-view"
                      @click="handleViewMedia(scope.row)"
                      >浏览</el-button
                    >
                    <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      style="color: #f56c6c"
                      @click="handleRemoveSourceEvidence(scope.row)"
                      >移除</el-button
                    >
                    <el-button
                      size="mini"
                      type="text"
                      icon="el-icon-download"
                      @click="handleDownloadMedia(scope.row)"
                      >下载</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <div
                v-if="sourceEvidenceMediaList.length === 0"
                class="empty-data"
              >
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
      <el-dialog
        title="媒体详情"
        :visible.sync="viewMediaOpen"
        width="800px"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="媒体名称">{{
            viewMediaData.mediaName
          }}</el-descriptions-item>
          <el-descriptions-item label="媒体编号">{{
            viewMediaData.mediaCode
          }}</el-descriptions-item>
          <el-descriptions-item label="媒体类型">
            {{ selectDictLabel(mediaCateOptions, viewMediaData.mediaCate) }}
          </el-descriptions-item>
          <el-descriptions-item label="拍摄时间">{{
            parseTime(viewMediaData.shotTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="拍摄警员">{{
            viewMediaData.policeName
          }}</el-descriptions-item>
          <el-descriptions-item label="所属组织">{{
            viewMediaData.orgFullName
          }}</el-descriptions-item>
          <el-descriptions-item label="存储路径" :span="2">{{
            viewMediaData.mediaUrl
          }}</el-descriptions-item>
        </el-descriptions>
        <div
          v-if="viewMediaData.mediaUrl"
          style="margin-top: 20px; text-align: center"
        >
          <el-button
            type="primary"
            icon="el-icon-view"
            @click="window.open(viewMediaData.mediaUrl, '_blank')"
          >
            打开媒体文件
          </el-button>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewMediaOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import { listCases } from "@/api/evidence/case_api";
import {
  batchCreateCaseMediaRelations,
  deleteCaseMediaRelation,
  batchDeleteCaseMediaRelations,
  getCaseMediaRelationsByCaseId,
  getUnassociatedMediaByCaseId,
} from "@/api/evidence/case_media_relation_api";
import {
  batchAddEvidenceSourceMedia,
  removeEvidenceSourceMedia,
} from "@/api/evidence/evidence_media_source_api";
import {
  getMediaByCaseId,
  getSourceMediaByCaseId,
  getEvidenceMediaByCaseId,
  listMedia,
} from "@/api/evidence/evidence_manage_query_api";
import { uploadDocuments } from "@/api/evidence/file_storage_service_api";
import {
  batchAddEvidenceMedia,
  removeEvidenceMedia,
} from "@/api/evidence/evidence_media_api";
import MediaSelector from "@/components/MediaSelector";

export default {
  name: "CaseMediaRelation",
  components: {
    MediaSelector,
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
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      // 当前选中的案件记录
      currentCase: null,
      relationTotal: 0,
      // 选中的媒体列表
      selectedMediaList: [],
      // 当前选中的案件记录（用于显示媒体关联列表）
      currentSelectedCase: null,
      // 案件媒体关联列表
      relationsList: [],
      // 媒体关联列表加载状态
      relationsLoading: false,
      // 选中的已关联媒体列表（用于批量取消关联）
      selectedMediaRelations: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        caseFlow: undefined,
      },
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10,
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
      viewMediaData: {},
      // 导入证据参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 是否禁用上传
        isUploading: false,
      },
      // 上传表单数据
      uploadForm: {
        deviceCode: "",
        policeCode: "",
        importantLevel: 1,
        storageType: 1,
        tags: "",
        comments: "",
      },
      // 上传表单验证规则
      uploadRules: {
        deviceCode: [
          { required: true, message: "请输入设备编号", trigger: "blur" },
        ],
        policeCode: [
          { required: true, message: "请输入警察编号", trigger: "blur" },
        ],
      },
      // 文件列表
      fileList: [],
      // 文件上传状态映射
      fileUploadStatus: {},
    };
  },
  created() {
    this.getList();
    this.getDicts("case_type").then((response) => {
      this.caseTypeOptions = response.data;
    });
    this.getDicts("admin_case_process").then((response) => {
      this.adminCaseProcessOptions = response.data;
    });
    this.getDicts("criminal_case_process").then((response) => {
      this.criminalCaseProcessOptions = response.data;
    });
    this.getDicts("evidence_media_type").then((response) => {
      this.mediaCateOptions = response.data;
    });
    this.getDicts("evidence_storage_type").then((response) => {
      this.storageTypeOptions = response.data;
    });
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentCase || !this.currentCase.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 } });
        };
      }
      return (query) => {
        return getUnassociatedMediaByCaseId(this.currentCase.id, query);
      };
    },
  },
  methods: {
    /* ========== 基本功能相关方法 ========== */

    /** 格式化日期时间 */
    formatDateTime(dateTime) {
      if (!dateTime) {
        return "-";
      }
      // 如果是字符串,转换为Date对象
      const date = typeof dateTime === "string" ? new Date(dateTime) : dateTime;
      // 格式化为 YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },

    // 延迟函数
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    // 显示通知
    showNotification(response) {
      const isSuccess = response?.code === 200;
      this.$notify({
        title: "通知",
        message: response?.msg || (isSuccess ? "操作成功" : "操作失败"),
        type: isSuccess ? "success" : "error",
        duration: 3000,
        customClass: "center-notification",
      });
    },

    // 处理错误
    handleError(error, defaultMessage) {
      const errorMsg =
        error?.response?.data?.msg || error?.message || "未知错误";
      this.msgError(`${defaultMessage}：${errorMsg}`);
    },

    // 恢复UI状态
    restoreUIState(previousCursor, loadingInstance) {
      document.body.style.cursor = previousCursor || "auto";
      loadingInstance?.close();
    },

    // 确认操作
    async confirmOperation(message) {
      try {
        await this.$confirm(message, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        return true;
      } catch {
        return false;
      }
    },

    /* ========== 查询列表相关方法 ========== */

    /** 查询案件列表 */
    getList() {
      this.loading = true;
      listCases(this.queryParams).then((response) => {
        this.caseList = response.data.list;
        this.total = response.data.count;
        this.loading = false;
      });
    },

    /** 加载当前案件已关联的媒体列表 */
    async loadCaseMediaList(caseId) {
      this.caseMediaListLoading = true;
      getMediaByCaseId(caseId, { pageIndex: 1, pageSize: 1000 })
        .then((response) => {
          this.caseMediaList = response.data ? response.data.list : [];
          this.caseMediaListLoading = false;
        })
        .catch((error) => {
          this.msgError(
            "加载案件媒体列表失败：" + (error.message || "未知错误")
          );
          this.caseMediaListLoading = false;
        });
    },

    /** 加载源证据媒体列表 */
    async loadSourceEvidenceMediaList(caseId) {
      this.sourceEvidenceMediaListLoading = true;
      getSourceMediaByCaseId(caseId, { pageIndex: 1, pageSize: 1000 })
        .then((response) => {
          this.sourceEvidenceMediaList = response.data.list || [];
          this.sourceEvidenceMediaListLoading = false;
        })
        .catch((error) => {
          this.msgError(
            "加载源证据媒体列表失败：" + (error.message || "未知错误")
          );
          this.sourceEvidenceMediaListLoading = false;
        });
    },

    /** 加载证据媒体列表 */
    async loadEvidenceMediaList(caseId) {
      this.evidenceMediaListLoading = true;
      try {
        const response = await getEvidenceMediaByCaseId(caseId, {
          pageIndex: 1,
          pageSize: 1000,
        });

        this.evidenceMediaList = response.data ? response.data.list : [];
      } catch (error) {
        this.msgError("加载证据媒体列表失败：" + (error.message || "未知错误"));
      } finally {
        this.evidenceMediaListLoading = false;
      }
    },

    /** 浏览媒体详情 */
    handleViewMedia(row) {
      // 导入getMedia API
      const { getMedia } = require("@/api/evidence/evidence_manage_query_api");

      // 根据媒体ID获取媒体详细信息
      getMedia(row.mediaId)
        .then((response) => {
          this.viewMediaData = response.data;
          this.viewMediaOpen = true;
        })
        .catch((error) => {
          this.msgError("获取媒体详情失败：" + (error.message || "未知错误"));
        });
    },

    /** 刷新证据媒体列表 */
    handleRefreshEvidenceMediaList() {
      // 刷新证据列表
      this.loadEvidenceMediaList(this.currentEditCase.id);
    },

    /** 刷新源证据媒体列表 */
    handleRefreshEvidenceMediaSourceList() {
      // 刷新源证据列表
      this.loadSourceEvidenceMediaList(this.currentEditCase.id);
    },

    /** 刷新案件和证据源媒体列表 */
    async refreshCaseAndSourceMediaLists(caseId) {
      try {
        await Promise.all([
          this.loadSourceEvidenceMediaList(caseId),
          this.loadCaseMediaList(caseId),
        ]);
      } catch (error) {
        this.handleError(error, "刷新案件和证据源媒体列表失败！");
      }
    },

    /* ========== 字典相关方法 ========== */

    // 案件类型字典翻译
    caseTypeFormat(row) {
      return this.selectDictLabel(this.caseTypeOptions, parseInt(row.caseType));
    },

    // 案件流程字典翻译 - 根据案件类型选择对应的流程字典
    caseFlowFormat(row) {
      return this.getCaseFlowLabel(row.caseFlow, row.caseType);
    },

    /** 获取案件流程标签 - 根据案件类型确定字典类型 */
    getCaseFlowLabel(value, caseType) {
      // 根据案件类型确定字典类型
      if (this.caseTypeOptions && this.caseTypeOptions.length > 0) {
        const caseTypeDict = this.caseTypeOptions.find(
          (item) => item.value === caseType || item.value === String(caseType)
        );
        if (caseTypeDict) {
          if (caseTypeDict.label.includes("行政")) {
            return this.selectDictLabel(this.adminCaseProcessOptions, value);
          } else if (caseTypeDict.label.includes("刑事")) {
            return this.selectDictLabel(this.criminalCaseProcessOptions, value);
          }
        }
      }
      return value;
    },

    /* ========== 文件上传相关方法 ========== */

    /** 文件选择变化 */
    handleFileChange(file, fileList) {
      // 添加文件到列表，初始化状态
      const newFile = {
        name: file.name,
        size: file.size,
        raw: file.raw,
        uploaded: false,
        uploading: false,
        error: null,
      };
      this.fileList.push(newFile);
    },

    /** 移除单个文件 */
    removeFile(index) {
      this.fileList.splice(index, 1);
    },

    /** 清空所有文件 */
    clearAllFiles() {
      this.$confirm("确认清空所有文件吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.fileList = [];
          if (this.$refs.uploadComponent) {
            this.$refs.uploadComponent.clearFiles();
          }
        })
        .catch(() => {});
    },

    /** 获取文件图标 */
    getFileIcon(fileName) {
      const ext = fileName.split(".").pop().toLowerCase();
      const iconMap = {
        pdf: "el-icon-document",
        doc: "el-icon-document",
        docx: "el-icon-document",
        xls: "el-icon-tickets",
        xlsx: "el-icon-tickets",
        ppt: "el-icon-data-analysis",
        pptx: "el-icon-data-analysis",
        jpg: "el-icon-picture",
        jpeg: "el-icon-picture",
        png: "el-icon-picture",
        gif: "el-icon-picture",
        mp4: "el-icon-video-camera",
        avi: "el-icon-video-camera",
        mp3: "el-icon-headset",
        wav: "el-icon-headset",
      };
      return iconMap[ext] || "el-icon-document";
    },

    /** 格式化文件大小 */
    formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    /** 获取文件状态类名 */
    getFileStatusClass(file) {
      if (file.uploaded) return "status-success";
      if (file.uploading) return "status-uploading";
      if (file.error) return "status-error";
      return "status-waiting";
    },

    /** 获取文件状态图标 */
    getFileStatusIcon(file) {
      if (file.uploaded) return "el-icon-success";
      if (file.uploading) return "el-icon-loading";
      if (file.error) return "el-icon-error";
      return "el-icon-time";
    },

    /** 获取文件状态文本 */
    getFileStatusText(file) {
      if (file.uploaded) return "上传成功";
      if (file.uploading) return "上传中...";
      if (file.error) return file.error;
      return "等待上传";
    },

    /* ========== 关联媒体相关方法 ========== */

    /** 关联媒体按钮操作 - 打开第一层抽屉 */
    handleLinkMedia(row) {
      this.currentCase = row;
      this.showMediaDrawer = true;
      this.loadCaseMediaRelations();
    },

    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false;
      this.currentCase = null;
      this.relationsList = [];
      this.relationTotal = 0;
      this.selectedMediaRelations = [];
      if (done) {
        done();
      }
    },

    /** 打开第二层抽屉 - 关联新媒体 */
    handleOpenMediaSelector() {
      this.selectedMediaList = [];
      this.mediaSelectorDrawerOpen = true;
      this.$nextTick(() => {
        if (this.$refs.mediaSelector) {
          this.$refs.mediaSelector.clearSelection();
          this.$refs.mediaSelector.refresh();
        }
      });
    },

    /** 关闭第二层抽屉 */
    handleCloseSelectorDrawer(done) {
      this.mediaSelectorDrawerOpen = false;
      this.selectedMediaList = [];
      if (done) {
        done();
      }
    },

    /** 媒体选择变化 */
    handleMediaSelectionChange(selection) {
      this.selectedMediaList = selection;
    },

    /** 确认关联媒体 */
    async confirmLinkMedia() {
      // 检查是否选中了媒体
      if (!this.selectedMediaList || this.selectedMediaList.length === 0) {
        this.msgError("请选择要关联的媒体");
        return;
      }

      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";

      const loadingInstance = this.$loading({
        lock: true,
        text: "正在关联媒体...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });

      try {
        // 调用关联媒体的API
        const data = {
          caseId: this.currentCase.id,
          mediaIds: this.selectedMediaList.map((item) => item.mediaId),
        };

        const response = await batchCreateCaseMediaRelations(data);

        if (response.code === 200) {
          // 保存当前案件ID,避免getList()改变选中状态后丢失
          const currentCaseId = this.currentCase.id;

          // 关闭第二层抽屉
          this.mediaSelectorDrawerOpen = false;
          // 延迟2秒后刷新媒体关联列表和案件列表
          await this.delay(2000);
          // 先刷新当前案件的媒体关联列表(参考警情页面的实现)
          this.loadCaseMediaRelations();
          // 再刷新案件列表以更新关联状态
          this.getList();

          this.msgSuccess(response.msg || "关联成功");
        } else {
          this.msgError(response.msg || "关联失败");
        }
      } catch (error) {
        this.msgError("关联失败：" + (error.message || "未知错误"));
      } finally {
        // 恢复鼠标状态
        document.body.style.cursor = previousCursor;
        loadingInstance.close();
      }
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /** 加载案件媒体关联列表 */
    loadCaseMediaRelations() {
      if (!this.currentCase || !this.currentCase.id) {
        this.relationsList = [];
        this.relationTotal = 0;
        this.relationsLoading = false;
        return;
      }
      this.relationsLoading = true;
      getCaseMediaRelationsByCaseId(
        this.currentCase.id,
        this.relationQueryParams
      )
        .then((response) => {
          // 必须检查response.code是否为200
          if (response.code === 200) {
            this.relationsList = response.data.list || [];
            this.relationTotal = response.data.count || 0;
          } else {
            this.msgError(response.msg || "加载媒体关联列表失败");
            this.relationsList = [];
            this.relationTotal = 0;
          }
        })
        .catch((error) => {
          console.error("加载媒体关联列表失败:", error);
          this.msgError(
            "加载媒体关联列表失败：" + (error.message || "未知错误")
          );
          this.relationsList = [];
          this.relationTotal = 0;
        })
        .finally(() => {
          this.relationsLoading = false;
        });
    },

    /** 已关联媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      this.selectedMediaRelations = selection;
    },

    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm("确认取消关联该媒体吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = "wait";

        const loadingInstance = this.$loading({
          lock: true,
          text: "正在取消关联...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });

        try {
          const response = await deleteCaseMediaRelation(row.id);

          if (response.code === 200) {
            // 保存当前案件ID,避免getList()改变选中状态后丢失
            const currentCaseId = this.currentCase.id;

            // 延迟2秒后刷新媒体关联列表和案件列表
            await this.delay(2000);
            // 先刷新当前案件的媒体关联列表(参考警情页面的实现)
            this.loadCaseMediaRelations();
            // 再刷新案件列表以更新关联状态
            this.getList();

            this.msgSuccess(response.msg || "取消关联成功");
          } else {
            this.msgError(response.msg || "取消关联失败");
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor;
          loadingInstance.close();
        }
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("取消关联失败：" + (error.message || "未知错误"));
        }
      }
    },

    /** 批量取消关联媒体 */
    async handleBatchUnlinkMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError("请选择要取消关联的媒体");
        return;
      }

      try {
        await this.$confirm(
          `确认取消关联选中的 ${this.selectedMediaRelations.length} 个媒体吗？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = "wait";

        const loadingInstance = this.$loading({
          lock: true,
          text: "正在批量取消关联...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });

        try {
          // 提取选中的关联ID列表
          const ids = this.selectedMediaRelations.map((item) => item.id);

          const response = await batchDeleteCaseMediaRelations({ ids: ids });

          if (response.code === 200) {
            // 保存当前案件ID,避免getList()改变选中状态后丢失
            const currentCaseId = this.currentCase.id;

            // 清空选中列表
            this.selectedMediaRelations = [];
            if (this.$refs.mediaRelationsTable) {
              this.$refs.mediaRelationsTable.clearSelection();
            }

            // 延迟2秒后刷新媒体关联列表和案件列表
            await this.delay(2000);
            this.loadCaseMediaRelations();
            this.getList();

            this.msgSuccess(
              response.msg ||
                `成功取消关联 ${
                  response.data?.deletedCount || ids.length
                } 个媒体`
            );
          } else {
            this.msgError(response.msg || "批量取消关联失败");
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor;
          loadingInstance.close();
        }
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("批量取消关联失败：" + (error.message || "未知错误"));
        }
      }
    },

    // ========== 编辑证据相关方法 ==========

    /** 编辑证据 */
    handleEditEvidence(row) {
      this.currentEditCase = { ...row };
      this.editEvidenceOpen = true;

      // 加载当前案件已关联的媒体列表
      this.loadCaseMediaList(row.id);

      // 加载源证据媒体列表
      this.loadSourceEvidenceMediaList(row.id);

      // 加载证据媒体列表
      this.loadEvidenceMediaList(row.id);
    },

    /** 导入按钮操作 */
    handleImportEvidence() {
      this.upload.title = "导入证据";
      this.upload.open = true;
      // 重置表单
      this.uploadForm = {
        deviceCode: "",
        policeCode: "",
        importantLevel: 1,
        storageType: 1,
        tags: "",
        comments: "",
      };
      this.fileList = [];
    },

    /** 设为源证据 */
    /*Element UI 的 this.$loading({ lock: true, … }) 会在页面上渲染一个全屏遮罩层，并把遮罩层的 z-index 设得比通知更高。
    当 batchAddEvidenceSourceMedia 的请求完成时，this.$notify 其实已经执行并创建了通知组件，但通知被遮罩层盖住了，视觉上就像没有弹出。
    只有在 finally 里调用 loadingInstance.close() 移除遮罩层后，通知才从遮罩层下方显现出来，看起来好像是“关闭 loading 后才弹出”。 这符合 Element UI 的实现逻辑，也符合我们的预期*/
    async handleSetAsSourceEvidence(row) {
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";

      const loadingInstance = this.$loading({
        lock: true,
        text: "正在设为源证据...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });

      try {
        const response = await batchAddEvidenceSourceMedia({
          caseId: this.currentEditCase.id,
          mediaIds: [row.mediaId],
          operatorId: this.$store.state.user.userId,
        });

        await this.delay(2000);
        await this.refreshCaseAndSourceMediaLists(this.currentEditCase.id);
        this.showNotification(response);
      } catch (error) {
        this.handleError(error, "设为源证据失败");
      } finally {
        this.restoreUIState(previousCursor, loadingInstance);
      }
    },

    /** 下载源证据 */
    handleDownloadSourceEvidence(row) {},

    /** 移除源证据 */
    async handleRemoveSourceEvidence(row) {
      if (!(await this.confirmOperation("确认要移除该证据源媒体吗？"))) {
        return;
      }

      // 等待确认对话框完全关闭
      await this.delay(100);

      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";
      const loadingInstance = this.$loading({
        lock: true,
        text: "正在移除源证据...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });
      try {
        const response = await removeEvidenceSourceMedia(
          this.currentEditCase.id,
          row.mediaId
        );
        await this.delay(2000);
        await this.refreshCaseAndSourceMediaLists(this.currentEditCase.id);
        this.showNotification(response);
      } catch (error) {
        this.handleError(error, "移除源证据失败");
      } finally {
        this.restoreUIState(previousCursor, loadingInstance);
      }
    },

    /** 关闭上传对话框 */
    handleUploadDialogClose() {
      // 清空文件列表
      if (this.$refs.uploadComponent) {
        this.$refs.uploadComponent.clearFiles();
      }
      this.fileList = [];
      // 重置表单验证
      if (this.$refs.uploadForm) {
        this.$refs.uploadForm.resetFields();
      }
      this.upload.open = false;
    },

    /** 上传单个文件 */
    uploadSingleFile(file, index, isSingleFile) {
      // 验证表单
      this.$refs.uploadForm.validate((valid) => {
        if (!valid) {
          this.msgError("请先填写必填项");
          return;
        }

        // 设置文件状态为上传中
        /*this.$set() 确保了数据变化与界面更新的同步性，这是 Vue 响应式系统的核心特性之一。
        一旦执行，相关的界面部分会立即重新渲染以反映最新的数据状态。*/
        this.$set(this.fileList[index], "uploading", true);
        this.$set(this.fileList[index], "error", null);

        // 构建 FormData
        const formData = new FormData();
        formData.append("file", file.raw);
        formData.append("deviceCode", this.uploadForm.deviceCode);
        formData.append("policeCode", this.uploadForm.policeCode);
        formData.append("importantLevel", this.uploadForm.importantLevel);
        formData.append("storageType", this.uploadForm.storageType);

        if (this.uploadForm.tags) {
          formData.append("tags", this.uploadForm.tags);
        }
        if (this.uploadForm.comments) {
          formData.append("comments", this.uploadForm.comments);
        }

        // 调用上传API
        uploadDocuments(formData)
          .then((response) => {
            this.$set(this.fileList[index], "uploading", false);
            this.$set(this.fileList[index], "uploaded", true);
            this.msgSuccess(`${file.name} 上传成功`);
          })
          .catch((error) => {
            this.$set(this.fileList[index], "uploading", false);
            this.$set(
              this.fileList[index],
              "error",
              error.message || "上传失败"
            );
            this.msgError(
              `${file.name} 上传失败：` + (error.message || "未知错误")
            );
          });
      });
    },

    /** 提交上传表单 - 批量上传所有文件 */
    async submitUploadForm(index, isSingleFile) {
      this.$refs.uploadForm.validate((valid) => {
        if (!valid) {
          return;
        }
      });
      if (
        this.uploadForm.deviceCode === "" ||
        this.uploadForm.policeCode === ""
      ) {
        this.msgError("请输入设备编号和警员编号");
        return;
      }
      // 检查是否选择了文件
      if (!this.fileList || this.fileList.length === 0) {
        this.msgError("请选择要上传的文件");
        return;
      }

      var pendingFiles = [];
      if (isSingleFile) {
        pendingFiles = [this.fileList[index]];
      } else {
        pendingFiles = this.fileList.filter((f) => !f.uploaded && !f.uploading);
      }

      if (pendingFiles.length === 0) {
        this.msgWarning("所有文件已上传");
        return;
      }

      // 设置文件状态为上传中
      /*this.$set() 确保了数据变化与界面更新的同步性，这是 Vue 响应式系统的核心特性之一。
        一旦执行，相关的界面部分会立即重新渲染以反映最新的数据状态。*/
      pendingFiles.forEach((fileItem) => {
        this.$set(fileItem, "uploading", true);
        this.$set(fileItem, "error", null);
      });

      // 设置上传状态
      this.upload.isUploading = true;

      // 构建 FormData
      const formData = new FormData();

      // 添加所有未上传的文件
      pendingFiles.forEach((fileItem) => {
        formData.append("file", fileItem.raw);
      });

      // 添加表单字段
      formData.append("deviceCode", this.uploadForm.deviceCode);
      formData.append("policeCode", this.uploadForm.policeCode);
      formData.append("importantLevel", this.uploadForm.importantLevel);
      formData.append("storageType", this.uploadForm.storageType);

      if (this.uploadForm.tags) {
        formData.append("tags", this.uploadForm.tags);
      }
      if (this.uploadForm.comments) {
        formData.append("comments", this.uploadForm.comments);
      }

      // 调用上传API
      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";
      const loadingInstance = this.$loading({
        lock: true,
        text: "正在上传证据并关联到案件...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });

      try {
        const response = await uploadDocuments(formData);
        this.uploadDocumentsDisplayResult(response);
        // 处理成功上传的证据：查询媒体ID并关联到案件
        if (response.data.results && response.data.results.length > 0) {
          await this.processUploadedEvidences(response.data.results);
          await this.delay(2000);
          await this.loadEvidenceMediaList(this.currentEditCase.id);
        }
      } catch (error) {
        this.handleError(error, "上传证据并关联到案件失败");
      } finally {
        this.upload.isUploading = false;
        this.restoreUIState(previousCursor, loadingInstance);
      }
    },

    /** 处理上传成功的证据：查询媒体ID并关联到案件 */
    async processUploadedEvidences(uploadResults) {
      try {
        // 过滤出成功上传的证据
        const successResults = uploadResults.filter(
          (item) => item.status === "success"
        );

        if (successResults.length === 0) {
          this.upload.isUploading = false;
          return;
        }

        // 收集所有成功上传的媒体ID
        var mediaIds = [];

        // 遍历每个成功上传的证据，根据返回的信息查询媒体
        var mediaPromises = successResults.map((item) =>
          this.queryMediaWithRetry(item.fileName)
        );
        mediaIds = (await Promise.all(mediaPromises)).filter((id) => id);
        // 如果找到了媒体ID，则关联到当前案件
        if (
          mediaIds.length > 0 &&
          this.currentEditCase &&
          this.currentEditCase.id
        ) {
          const data = {
            caseId: this.currentEditCase.id,
            mediaIds: mediaIds,
            operatorId: this.$store.state.user.userId,
          };
          const response = await batchAddEvidenceMedia(data);
          if (response.msg.includes("成功")) {
            response.msg = `成功将 ${mediaIds.length} 个证据关联到案件`;
          }
          this.showNotification(response);
        }
      } catch (error) {
        this.handleError(error, "关联证据到案件失败");
      }
    },

    /** 根据证据名称查询对应的媒体ID */
    async queryMediaWithRetry(mediaName, retryCount = 0, maxRetries = 5) {
      try {
        const queryParams = {
          // 你的查询参数
          mediaName: mediaName,
        };
        const mediaResponse = await listMedia(queryParams);

        if (
          mediaResponse.data &&
          mediaResponse.data.list &&
          mediaResponse.data.list.length > 0
        ) {
          // 取第一个匹配的媒体
          const media = mediaResponse.data.list[0];
          return media.mediaId;
        } else {
          if (retryCount < maxRetries) {
            console.warn(
              `未找到证据 ${mediaName} 对应的媒体，第${retryCount + 1}次重试...`
            );

            // 等待500ms后重试
            await this.delay(500);
            return this.queryMediaWithRetry(
              mediaName,
              retryCount + 1,
              maxRetries
            );
          } else {
            console.error(
              `未找到证据 ${mediaName} 对应的媒体，已重试${maxRetries}次`
            );
            return null;
          }
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          console.warn(
            `查询证据 ${mediaName} 失败，第${retryCount + 1}次重试...`,
            error
          );

          // 等待500ms后重试
          await this.delay(500);
          return this.queryMediaWithRetry(
            mediaName,
            retryCount + 1,
            maxRetries
          );
        } else {
          console.error(
            `查询证据 ${mediaName} 失败，已重试${maxRetries}次`,
            error
          );
          return null;
        }
      }
    },

    uploadDocumentsDisplayResult(response) {
      // 显示上传结果
      const result = response.data;
      let message = `上传完成！成功：${result.successCount}个，失败：${result.failureCount}个`;

      if (result.results && result.results.length > 0) {
        message += "<br/><br/>详细结果：<br/>";
        result.results.forEach((item) => {
          const status = item.status === "success" ? "✓" : "✗";
          message += `${status} ${item.originalName} - ${
            item.status === "success" ? "成功" : item.error
          }<br/>`;
        });
      }

      this.$alert(message, "上传结果", {
        dangerouslyUseHTMLString: true,
        type: result.failureCount === 0 ? "success" : "warning",
      });

      // 更新文件状态
      if (result.results) {
        result.results.forEach((item, idx) => {
          const fileIndex = this.fileList.findIndex(
            (f) => f.name === item.originalName
          );
          if (fileIndex !== -1) {
            if (item.status === "success") {
              this.$set(this.fileList[fileIndex], "uploaded", true);
              this.$set(this.fileList[fileIndex], "uploading", false);
            } else {
              this.$set(this.fileList[fileIndex], "error", item.error);
              this.$set(this.fileList[fileIndex], "uploading", false);
            }
          }
        });
      }
    },

    /** 移除证据媒体 */
    async handleRemoveEvidenceMedia(row) {
      if (!(await this.confirmOperation("确认要移除该证据媒体吗？"))) {
        return;
      }
      // 等待确认对话框完全关闭
      await this.delay(100);
      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";
      const loadingInstance = this.$loading({
        lock: true,
        text: "正在移除证据媒体...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });
      try {
        // 暂时与移除源证据功能相同
        const response = await removeEvidenceMedia(
          this.currentEditCase.id,
          row.mediaId
        );
        await this.delay(2000);
        await this.loadEvidenceMediaList(this.currentEditCase.id);
        this.showNotification(response);
      } catch (error) {
        this.handleError(error, "移除证据媒体失败");
      } finally {
        this.restoreUIState(previousCursor, loadingInstance);
      }
    },

    /** 检查媒体是否已经是源证据 */
    isMediaSourceEvidence(row) {
      if (!row || !row.mediaId || !this.sourceEvidenceMediaList) {
        return false;
      }
      return this.sourceEvidenceMediaList.some(
        (item) => item.mediaId === row.mediaId
      );
    },
  },
};
</script>

<style scoped>
.media-relations-section {
  margin-top: 20px;
}

.empty-data {
  text-align: center;
  padding: 20px;
}

/* 文件上传区域样式 */
.upload-area {
  margin: 20px 0;
}

.upload-dragger {
  width: 100%;
}

.upload-dragger >>> .el-upload-dragger {
  width: 100%;
  height: 220px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.upload-dragger >>> .el-upload-dragger:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-dragger-content {
  text-align: center;
  padding: 20px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}

/* 文件列表样式 */
.file-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 32px;
  margin-right: 12px;
  color: #909399;
}

.file-icon.el-icon-document {
  color: #e6a23c;
}

.file-icon.el-icon-tickets {
  color: #67c23a;
}

.file-icon.el-icon-data-analysis {
  color: #f56c6c;
}

.file-icon.el-icon-picture {
  color: #409eff;
}

.file-icon.el-icon-video-camera {
  color: #9c27b0;
}

.file-icon.el-icon-headset {
  color: #ff5722;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.file-status {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.file-status i {
  margin-right: 4px;
}

.status-waiting {
  color: #909399;
}

.status-uploading {
  color: #409eff;
}

.status-success {
  color: #67c23a;
}

.status-error {
  color: #f56c6c;
}

.file-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 抽屉样式 */
.drawer-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  text-align: right;
  z-index: 1;
}

/* 第一层抽屉样式 */
.media-drawer {
  z-index: 1000 !important;
}

/* 第二层抽屉样式 - 更高的z-index */
.media-selector-drawer {
  z-index: 2000 !important;
}

/* 抽屉遮罩层样式 */
::v-deep .el-drawer__wrapper {
  transition: all 0.3s ease;
}

/* 第二层抽屉的遮罩层 */
::v-deep .media-selector-drawer .el-drawer__wrapper {
  background-color: rgba(0, 0, 0, 0.3);
}

/* 抽屉滑入滑出动画 */
::v-deep .el-drawer {
  transition: transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
}

::v-deep .el-drawer.rtl {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}
</style>

<style>
.center-notification {
  top: 50% !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  transform: translate(-50%, -50%) !important;
}
</style>
