<template>
  <div class="media-selector">
    <!-- 新的查询栏组件 -->
    <div class="search-section">
      <MediaQueryBar
        ref="queryBar"
        :media-cate-options="mediaCateOptions"
        :is-archived-options="isArchivedOptions"
        :org-options="orgOptions"
        :storage-type-options="storageTypeOptions"
        :enforce-type-options="enforceTypeOptions"
        :terminal-type-options="terminalTypeOptions"
        :media-important-level-options="mediaImportanceOptions"
        @search="handleSearch"
        @quick-search-reset="handleQuickSearchReset"
        @filter-change="handleFilterChange"
        @filter-reset="handleFilterReset"
      />
    </div>

    <!-- 批量操作栏插槽 -->
    <slot name="batch-actions" />

    <!-- 工具栏插槽 -->
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

    <!-- 媒体列表 -->
    <el-table
      ref="mediaTable"
      v-loading="loading"
      :data="mediaList"
      :row-key="getRowKey"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        type="selection"
        width="60"
        align="center"
        :reserve-selection="true"
      />
      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="350"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-button
              size="small"
              type="text"
              icon="el-icon-folder-add"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'edit')"
            >一键归档</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-view"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'view')"
            >浏览</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-video-play"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'play')"
            >播放</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-document-copy"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'copy')"
            >复制地址</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-delete"
              class="action-btn tertiary-danger"
              @click="handleOperation(scope.row, 'delete')"
            >删除</el-button>
            <el-button
              size="small"
              type="text"
              icon="el-icon-download"
              class="action-btn secondary"
              @click="handleOperation(scope.row, 'download')"
            >下载</el-button>
            <el-button
              v-if="scope.row.mediaCate === 3"
              size="small"
              type="text"
              icon="el-icon-location"
              class="action-btn tertiary"
              @click="handleOperation(scope.row, 'track')"
            >视频轨迹</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('mediaName')"
        prop="mediaName"
        label="媒体名称"
        min-width="160"
        sortable="custom"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('mediaCate')"
        prop="mediaCate"
        label="媒体类型"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('mediaSuffix')"
        prop="mediaSuffix"
        label="媒体后缀"
        width="120"
      />
      <el-table-column
        v-if="isColumnVisible('captureTime')"
        prop="captureTime"
        label="拍摄时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.captureTime) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('captureEndTime')"
        prop="captureEndTime"
        label="拍摄结束时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.captureEndTime) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('clarity')"
        prop="clarity"
        label="视频清晰度"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(videoClarityOptions, row.clarity) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('duration')"
        prop="duration"
        label="视频时长(毫秒)"
        width="140"
      >
        <template slot-scope="{ row }">
          {{ formatVideoDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('importantLevel')"
        prop="importantLevel"
        label="重要级别(平台)"
        width="140"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(mediaImportanceOptions, row.importantLevel) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('importantLevelRec')"
        prop="importantLevelRec"
        label="重要级别(设备)"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(mediaImportanceOptions, row.importantLevelRec) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('width')"
        prop="width"
        label="图片宽度"
        width="110"
      />
      <el-table-column
        v-if="isColumnVisible('height')"
        prop="height"
        label="图片高度"
        width="110"
      />
      <el-table-column
        v-if="isColumnVisible('isNonEnforcementMedia')"
        prop="isNonEnforcementMedia"
        label="是否执法媒体"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="row.isNonEnforcementMedia === 0 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ selectDictLabel(isNonEnforcementMediaOptions, row.isNonEnforcementMedia) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('comments')"
        prop="comments"
        label="标注内容"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('sequence')"
        prop="sequence"
        label="视频序列标识"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('enforcementTypeName')"
        prop="enforcementTypeName"
        label="执法类型名称"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('isLocked')"
        prop="isLocked"
        label="是否锁定"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="row.isLocked === 1 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ selectDictLabel(isLockedOptions, row.isLocked) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('expiryTime')"
        prop="expiryTime"
        label="过期时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{
            parseTime(row.expiryTime) === "2999-01-01 08:00:00"
              ? "永久"
              : parseTime(row.expiryTime)
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('lifecycleStatus')"
        prop="lifecycleStatus"
        label="生命周期状态"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="lifecycleStatusTagType(row.lifecycleStatus)"
            size="small"
            effect="dark"
          >
            {{ lifecycleStatusText(row.lifecycleStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('archiveCode')"
        prop="archiveCode"
        label="档案编号"
        width="140"
      />
      <el-table-column
        v-if="isColumnVisible('isArchive')"
        prop="isArchived"
        label="是否归档"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="row.isArchived === 1 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ selectDictLabel(isArchivedOptions, row.isArchived) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('archiveDate')"
        prop="archivedAt"
        label="归档时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.archivedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('fileIdentity')"
        prop="fileIdentity"
        label="文件标识"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('fileName')"
        prop="fileName"
        label="文件名称"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('fileSize')"
        prop="fileSize"
        label="文件大小"
        width="140"
      >
        <template slot-scope="{ row }">
          {{ formatFileSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('fileMd5')"
        prop="fileMd5"
        label="文件MD5"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('fileType')"
        prop="fileType"
        label="文件类型"
        width="120"
      />
      <el-table-column
        v-if="isColumnVisible('filePath')"
        prop="filePath"
        label="存储路径"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('collectSiteNo')"
        prop="collectSiteNo"
        label="采集站编号"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('collectSiteName')"
        prop="collectSiteName"
        label="采集站名称"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('storageSiteNo')"
        prop="storageSiteNo"
        label="存储服务器编号"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('storageSiteName')"
        prop="storageSiteName"
        label="存储服务器名称"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('storageSiteIp')"
        prop="storageSiteIp"
        label="存储服务器IP地址"
        min-width="180"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('storageSiteUrl')"
        prop="storageSiteUrl"
        label="存储服务器HTTP地址"
        min-width="220"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('storageType')"
        prop="storageType"
        label="存储方式"
        width="130"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(storageTypeOptions, row.storageType) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('isSendToStorage')"
        prop="isSendToStorage"
        label="上传至存储"
        width="150"
      >
        <template slot-scope="{ row }">
          {{ formatSendStatus(row.isSendToStorage) }}
        </template>
        <template slot-scope="{ row }">
          <el-tag
            :type="row.isSendToStorage === 1 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ selectDictLabel(isSendToStorageOptions, row.isSendToStorage) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('isNoticeSend')"
        prop="isNoticeSend"
        label="通知发送"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ formatYesNo(row.isNoticeSend) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('policeNo')"
        prop="policeNo"
        label="人员编号"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column v-if="isColumnVisible('policeName')" label="人员姓名" width="120">
        <template slot-scope="{ row }">
          {{ formatPoliceName(row) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('policeIdCard')"
        prop="policeIdCard"
        label="人员身份证号"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgCode')"
        prop="orgCode"
        label="单位编码"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column v-if="isColumnVisible('orgName')" label="单位名称" min-width="160">
        <template slot-scope="{ row }">
          {{ formatOrgName(row) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('orgFullName')"
        prop="orgFullName"
        label="单位全称"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('orgJc')"
        prop="orgJc"
        label="单位简称"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('terminalType')"
        prop="terminalType"
        label="终端类型"
        width="130"
      >
        <template slot-scope="{ row }">
          {{ selectDictLabel(terminalTypeOptions, row.terminalType) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('recorderNo')"
        prop="recorderNo"
        label="执法仪编号"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('incidentCode')"
        prop="incidentCode"
        label="警情号"
        min-width="160"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.incidentCode"
            type="text"
            size="mini"
            @click="handleViewIncident(row)"
          >{{ row.incidentCode }}</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('isAssociated')"
        prop="isIncidentAssociated"
        label="是否关联"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag
            :type="row.isIncidentAssociated === 1 ? 'success' : 'info'"
            size="small"
            effect="dark"
          >
            {{ selectDictLabel(relationStatusOptions, row.isIncidentAssociated) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('associateTime')"
        prop="incidentAssociatedAt"
        label="关联时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.incidentAssociatedAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('requestIdentity')"
        prop="requestIdentity"
        label="请求标识"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('authKey')"
        prop="authKey"
        label="认证码"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('traceCode')"
        prop="traceCode"
        label="追溯码"
        min-width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('uploadTime')"
        prop="uploadTime"
        label="上传时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.uploadTime) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('acquisitionTime')"
        prop="acquisitionTime"
        label="接收时间"
        width="180"
      >
        <template slot-scope="{ row }">
          {{ parseTime(row.acquisitionTime) }}
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

    <!-- 媒体详情对话框 -->
    <MediaDetailDialog
      :visible.sync="viewMediaOpen"
      :media-data="viewMediaData"
    />

    <!-- 警情详情对话框 -->
    <el-dialog
      title="警情详情"
      :visible.sync="viewIncidentOpen"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
      custom-class="detail-dialog"
    >
      <el-descriptions :column="2" border class="section-descriptions">
        <el-descriptions-item label="警情编号">{{
          viewIncidentData.incidentCode || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="报警人">{{
          viewIncidentData.incidentName || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="处警人" :span="2">{{
          viewIncidentData.incedentProcessPoliceNames || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="接警时间">{{
          parseTime(viewIncidentData.incidentReceiveTime) || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="报警内容" :span="2">{{
          viewIncidentData.incidentContext || "-"
        }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" class="action-btn tertiary" size="small" @click="viewIncidentOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMedia, getMedia } from '@/api/evidence/evidence_manage_query_api'
import { getEnforceTypeTree } from '@/api/admin/enforcetype'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import { getEquipmentBwcByManagerId } from '@/api/admin/equipment_manage_api'
import { selectDictLabel } from '@/utils/costum'
import MediaDetailDialog from '@/components/MediaDetailDialog'
import MediaQueryBar from '@/components/MediaQueryBar/index.vue'

export default {
  name: 'MediaSelector',
  components: { MediaDetailDialog, MediaQueryBar },
  props: {
    // 是否为选择模式（用于对话框中的媒体选择）
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
    // 自定义媒体列表API函数
    customListApi: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      selectedMedia: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multipleDisabled: true,
      // 总条数
      total: 0,
      // 媒体数据
      mediaList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        captureTimeStart: undefined,
        captureTimeEnd: undefined,
        orgId: undefined,
        policeId: undefined,
        includeSubUnits: true,
        mediaCate: undefined,
        uploadTimeStart: undefined,
        uploadTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforceType: undefined,
        mediaName: undefined,
        isArchived: undefined,
        isNonEnforcementMedia: undefined,
        isLocked: undefined,
        terminalType: undefined,
        incidentCode: undefined,
        recorderNo: undefined,
        importantLevel: undefined,
        importantLevelRec: undefined
      },
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 执法仪选项
      bwcOptions: [],
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储方式选项
      storageTypeOptions: [],
      // 执法类型选项
      enforceTypeOptions: [],
      // 是否归档选项
      isArchivedOptions: [],
      // 是否上传至存储选项
      isSendToStorageOptions: [],
      // 是否锁定选项
      isLockedOptions: [],
      // 终端类型选项
      terminalTypeOptions: [],
      // 是否执法媒体选项
      isNonEnforcementMediaOptions: [],
      // 视频清晰度选项
      videoClarityOptions: [],
      mediaImportanceOptions: [],
      // 关联状态选项
      relationStatusOptions: [],
      // 媒体详情对话框
      viewMediaOpen: false,
      // 媒体详情数据
      viewMediaData: {},
      // 警情详情对话框
      viewIncidentOpen: false,
      // 警情详情数据
      viewIncidentData: {},
      // 列配置选项
      columnOptions: [
        {
          prop: 'mediaName',
          label: '媒体名称',
          fixed: true,
          defaultVisible: true
        },
        { prop: 'mediaCate', label: '媒体类型', defaultVisible: true },
        { prop: 'mediaSuffix', label: '媒体后缀', defaultVisible: false },
        { prop: 'captureTime', label: '拍摄时间', defaultVisible: true },
        {
          prop: 'captureEndTime',
          label: '拍摄结束时间',
          defaultVisible: false
        },
        { prop: 'clarity', label: '视频清晰度', defaultVisible: false },
        {
          prop: 'duration',
          label: '视频时长(毫秒)',
          defaultVisible: false
        },
        {
          prop: 'importantLevel',
          label: '重要级别(平台)',
          defaultVisible: false
        },
        {
          prop: 'importantLevelRec',
          label: '重要级别(设备)',
          defaultVisible: false
        },
        { prop: 'width', label: '图片宽度', defaultVisible: false },
        { prop: 'height', label: '图片高度', defaultVisible: false },
        {
          prop: 'isNonEnforcementMedia',
          label: '是否执法媒体',
          defaultVisible: true
        },
        { prop: 'comments', label: '标注内容', defaultVisible: false },
        { prop: 'sequence', label: '视频序列标识', defaultVisible: false },
        {
          prop: 'enforcementTypeName',
          label: '执法类型名称',
          defaultVisible: false
        },
        { prop: 'isLocked', label: '是否锁定', defaultVisible: false },
        { prop: 'expiryTime', label: '过期时间', defaultVisible: false },
        { prop: 'lifecycleStatus', label: '生命周期状态', defaultVisible: false },
        { prop: 'archiveCode', label: '档案编号', defaultVisible: false },
        { prop: 'isArchive', label: '是否归档', defaultVisible: false },
        { prop: 'archiveDate', label: '归档时间', defaultVisible: false },
        { prop: 'fileIdentity', label: '文件标识', defaultVisible: false },
        { prop: 'fileName', label: '文件名称', defaultVisible: false },
        { prop: 'fileSize', label: '文件大小(KB)', defaultVisible: false },
        { prop: 'filePath', label: '存储路径', defaultVisible: false },
        { prop: 'fileMd5', label: '文件MD5', defaultVisible: false },
        { prop: 'fileType', label: '文件类型', defaultVisible: false },
        { prop: 'contentType', label: 'MIME类型', defaultVisible: false },
        { prop: 'collectSiteNo', label: '采集站编号', defaultVisible: false },
        { prop: 'collectSiteName', label: '采集站名称', defaultVisible: false },
        { prop: 'storageSiteNo', label: '存储服务器编号', defaultVisible: false },
        { prop: 'storageSiteName', label: '存储服务器名称', defaultVisible: false },
        { prop: 'storageSiteIp', label: '存储服务器IP地址', defaultVisible: false },
        { prop: 'storageSiteUrl', label: '存储服务器HTTP地址', defaultVisible: false },
        { prop: 'storageType', label: '存储方式', defaultVisible: false },
        {
          prop: 'isSendToStorage',
          label: '是否上传至存储',
          defaultVisible: false
        },
        { prop: 'isNoticeSend', label: '是否通知发送', defaultVisible: false },
        { prop: 'policeNo', label: '人员编号', defaultVisible: false },
        { prop: 'policeName', label: '人员姓名', defaultVisible: true },
        { prop: 'policeIdCard', label: '人员身份证号', defaultVisible: false },
        { prop: 'orgCode', label: '单位编码', defaultVisible: false },
        { prop: 'orgName', label: '单位名称', defaultVisible: true },
        { prop: 'orgFullName', label: '单位全称', defaultVisible: false },
        { prop: 'orgJc', label: '单位简称', defaultVisible: false },
        { prop: 'terminalType', label: '终端类型', defaultVisible: false },
        { prop: 'recorderNo', label: '执法仪编号', defaultVisible: false },
        { prop: 'incidentCode', label: '警情号', defaultVisible: false },
        {
          prop: 'isAssociated',
          label: '是否关联',
          fixed: true,
          defaultVisible: true
        },
        { prop: 'associateTime', label: '关联时间', defaultVisible: false },
        { prop: 'requestIdentity', label: '请求标识', defaultVisible: false },
        { prop: 'authKey', label: '认证码', defaultVisible: false },
        { prop: 'traceCode', label: '追溯码', defaultVisible: false },
        { prop: 'uploadTime', label: '上传时间', defaultVisible: true },
        { prop: 'acquisitionTime', label: '接收时间', defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],

      selectedMediaMap: {},
      isRestoringSelection: false,
      order: '' // 当前排序字段，用于追踪排序状态
    }
  },
  watch: {
    'queryParams.orgId': function(newVal) {
      // 当组织选择变化时，清空人员选择并重新加载该组织的人员列表
      if (newVal) {
        this.queryParams.policeId = undefined
        this.getUserListByOrgId(newVal)
      } else {
        // 如果清空组织选择，则清空人员列表
        this.userOptions = []
        this.queryParams.policeId = undefined
      }
    },
    'queryParams.policeId': function(newVal) {
      // 当人员选择变化时，清空执法仪选择并重新加载该人员管理的执法仪列表
      if (newVal) {
        this.queryParams.recorderId = undefined
        this.getBwcListByPoliceId(newVal)
      } else {
        // 如果清空人员选择，则清空执法仪列表
        this.bwcOptions = []
        this.queryParams.recorderId = undefined
      }
    }
  },
  created() {
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery }
    this.initVisibleColumns()
    this.getOrgTreeSelect()
    this.getUserList()
    this.getBwcList()
    this.getEnforceTypeTree()

    // 使用Promise.all等待所有字典加载完成
    Promise.all([
      this.getDicts('evidence_media_type'),
      this.getDicts('evidence_storage_type'),
      this.getDicts('is_archived'),
      this.getDicts('relation_status'),
      this.getDicts('is_send_to_storage'),
      this.getDicts('is_locked'),
      this.getDicts('terminal_type'),
      this.getDicts('is_non_enforcement_media'),
      this.getDicts('video_clarity'),
      this.getDicts('media_important_level')
    ])
      .then(
        ([
          mediaCateRes,
          storageTypeRes,
          isArchivedRes,
          relationStatusRes,
          isSendToStorageRes,
          isLockedRes,
          terminalTypeRes,
          isNonEnforcementMediaRes,
          videoClarityRes,
          mediaImportanceRes
        ]) => {
          this.mediaCateOptions = mediaCateRes.data
          this.storageTypeOptions = storageTypeRes.data
          this.isArchivedOptions = isArchivedRes.data
          this.relationStatusOptions = relationStatusRes.data
          this.isSendToStorageOptions = isSendToStorageRes.data
          this.isLockedOptions = isLockedRes.data
          this.terminalTypeOptions = terminalTypeRes.data
          this.isNonEnforcementMediaOptions = isNonEnforcementMediaRes.data
          this.videoClarityOptions = videoClarityRes.data
          this.mediaImportanceOptions = mediaImportanceRes.data

          console.log('[MediaSelector] 字典加载完成')
          // 字典加载完成后再加载列表
          this.getList()
        }
      )
      .catch((error) => {
        console.error('[MediaSelector] 字典加载失败:', error)
        // 即使字典加载失败,也要加载列表
        this.getList()
      })
  },
  methods: {
    selectDictLabel,

    getRowKey(row) {
      return row && row.mediaId
    },

    /** 组织选择事件 */
    /* handleOrgSelect(node) {
      if (node) {
        listUser({ orgId: "/" + node.id + "/" }).then((response) => {
          this.userOptions = response.data.list || [];
        });
      }
    },*/

    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.mediaTable) return
      if (!this.mediaList || !this.mediaList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.mediaList.forEach((row) => {
            const id = row && row.mediaId
            if (!id) return
            if (this.selectedMediaMap[id]) {
              this.$refs.mediaTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
    },
    /** 默认可见列 */
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
    },

    /** 初始化列显示配置 */
    initVisibleColumns() {
      const saved = localStorage.getItem('media_selector_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
          return
        } catch (error) {
          console.warn('解析列显示配置失败，使用默认列', error)
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns()
    },

    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    /** 列显示变更 */
    handleColumnChange(value) {
      this.visibleColumns = value
      localStorage.setItem(
        'media_selector_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
    },

    /** 重置列显示 */
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      localStorage.setItem(
        'media_selector_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'captureTimeStart' ||
            key === 'captureTimeEnd' ||
            key === 'uploadTimeStart' ||
            key === 'uploadTimeEnd') &&
          typeof value === 'string'
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString()
          }
        }
      })
      return query
    },

    /** 查询媒体列表 */
    getList() {
      this.loading = true
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listMedia
      const apiFunc = this.customListApi || listMedia
      const query = this.normalizeQueryParams(this.queryParams)
      apiFunc(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.mediaList = response.data.list || []
            this.total = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.mediaList = []
            this.total = 0
            this.msgError(response.msg || '查询媒体失败')
          }
        })
        .catch((error) => {
          this.mediaList = []
          this.total = 0
          this.msgError('查询媒体失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 获取组织树 */
    getOrgTreeSelect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },

    /** 获取用户列表 */
    getUserList() {
      /* listUser().then((response) => {
        this.userOptions = response.data || [];
      });*/
      this.userOptions = []
    },

    /** 获取执法仪列表（根据人员ID） */
    getBwcListByPoliceId(policeId) {
      if (!policeId) {
        this.bwcOptions = []
        return
      }
      console.log('policeId:', policeId)
      getEquipmentBwcByManagerId(policeId).then((response) => {
        // 判断返回数据的结构
        if (Array.isArray(response.data)) {
          // 如果 response.data 是数组，直接使用
          this.bwcOptions = response.data
        } else if (response.data && Array.isArray(response.data.list)) {
          // 如果 response.data.list 是数组，使用 list
          this.bwcOptions = response.data.list
        } else {
          // 其他情况，设置为空数组
          this.bwcOptions = []
        }
      })
    },

    /** 获取执法仪列表（全部） */
    getBwcList() {
      // 初始化时不加载执法仪列表，等待用户选择人员后再加载
      this.bwcOptions = []
    },

    /** 获取执法类型树 */
    getEnforceTypeTree() {
      getEnforceTypeTree().then((response) => {
        this.enforceTypeOptions = response.data || []
      })
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedMediaMap = {}
      // 向父组件发送数据变化事件
      this.$emit(
        'selection-change',
        Object.values(this.selectedMediaMap).filter(Boolean)
      )
      this.$nextTick(() => {
        if (this.$refs.mediaTable) {
          this.$refs.mediaTable.clearSelection()
        }
      })
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

    /** 重置按钮操作 */
    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      const isSelected = selection.some((item) => item.mediaId === row.mediaId)
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit('select', row)
      }
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      // Boolean 是 JavaScript 内置函数，它会过滤掉数组中的假值（false、0、""、null、undefined、NaN）
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.mediaId).filter(Boolean)
      );

      (this.mediaList || []).forEach((row) => {
        const id = row && row.mediaId
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedMediaMap[id] = row
        } else {
          delete this.selectedMediaMap[id]
        }
      })

      // 向父组件发送“全量已选”的数据变化事件
      this.$emit(
        'selection-change',
        Object.values(this.selectedMediaMap).filter(Boolean)
      )
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

    /** 组织选择事件 */
    /* handleOrgSelect(node) {
      if (node) {
        this.getUserListByOrgId(node.id);
      }
    },*/

    /** 根据组织获取用户列表 */
    getUserListByOrgId(orgId) {
      const params = { orgId: '/' + orgId + '/' }
      listUser(params).then((response) => {
        this.userOptions = response.data.list || []
      })
    },

    /** 格式化人员名称 */
    formatPoliceName(row) {
      return row.policeName || row.userName || '-'
    },

    /** 格式化组织名称 */
    formatOrgName(row) {
      return row.orgFullName || row.orgName || '-'
    },

    /** 执法类型数据格式化 */
    normalizeEnforceType(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || '未知',
        children: node.children
      }
    },

    /** 视频时长（毫秒）格式化为 HH:MM:SS */
    formatVideoDuration(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const totalSeconds = Math.floor(Number(value) / 1000)
      const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, '0')
      const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0')
      const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },

    /** 生命周期状态文本映射 */
    lifecycleStatusText(status) {
      const map = {
        active: '活跃',
        expiring: '即将过期',
        expired: '已过期',
        pending_deletion: '待删除',
        deletion_blocked: '删除阻塞',
        soft_deleted: '已软删除',
        physical_deleted: '已物理删除'
      }
      return map[status] || status || '-'
    },

    /** 生命周期状态标签颜色映射 */
    lifecycleStatusTagType(status) {
      const map = {
        active: 'success',
        expiring: 'warning',
        expired: 'danger',
        pending_deletion: 'danger',
        deletion_blocked: 'warning',
        soft_deleted: 'info',
        physical_deleted: 'info'
      }
      return map[status] || 'info'
    },

    /** 通用 是/否 */
    formatYesNo(value) {
      if (value === 1) return '是'
      if (value === 0) return '否'
      return '-'
    },

    /** 文件大小（KB）转换 */
    formatFileSize(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const size = Number(value) * 1024 // 转换为字节
      if (!size) return '-'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let index = 0
      let current = size
      while (current >= 1024 && index < units.length - 1) {
        current /= 1024
        index++
      }
      return `${current.toFixed(2)} ${units[index]}`
    },

    /** 删除按钮操作 */
    handleDelete() {
      this.$emit('delete', this.selectedMedia)
    },

    /** 浏览媒体详情 */
    handleViewMedia(row) {
      getMedia(row.mediaId)
        .then((response) => {
          this.viewMediaData = response.data
          this.viewMediaOpen = true
        })
        .catch(() => {
          // API调用失败时降级使用列表数据
          this.viewMediaData = row
          this.viewMediaOpen = true
        })
    },

    /** 浏览警情详情 */
    handleViewIncident(row) {
      this.viewIncidentData = row
      this.viewIncidentOpen = true
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      // 添加安全检查,防止row为空
      if (!row) {
        return
      }

      // 处理浏览操作
      if (action === 'view') {
        this.handleViewMedia(row)
        return
      }
      this.$emit('operation', row, action)
    },

    /** 获取选中的媒体数据 */
    getSelectedMedia() {
      return this.selectedMedia
    },

    /** 刷新列表 */
    refreshList() {
      this.getList()
    },

    /** 清空跨分页选中（供父组件调用） */
    clearSelection() {
      this.selectedMediaMap = {}
      this.$emit('selection-change', [])
      this.$nextTick(() => {
        if (this.$refs.mediaTable) {
          this.$refs.mediaTable.clearSelection()
        }
      })
    },

    /** 全选/取消全选（供父组件调用） */
    toggleAllSelection() {
      if (this.$refs.mediaTable) {
        this.$refs.mediaTable.toggleAllSelection()
      }
    },

    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表（这些字段可能被用户清空）
      const quickSearchFields = [
        'mediaName',
        'captureTimeStart',
        'captureTimeEnd',
        'mediaCate',
        'isArchived',
        'incidentCode'
      ]

      // 高级筛选中的时间范围字段列表
      const timeRangeFields = [
        'captureTimeStart', 'captureTimeEnd',
        'uploadTimeStart', 'uploadTimeEnd'
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

      this.handleQuery()
    },

    handleQuickSearchReset() {
      // 重置所有筛选条件（与全局重置保持一致）
      this.handleFilterReset()
    },

    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'today') {
        // 今日媒体
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.captureTimeStart = today.toISOString()
        delete this.queryParams.captureTimeEnd
      } else if (filterData.filterType === 'archived') {
        // 已归档
        this.queryParams.isArchived = 1
      } else if (filterData.filterType === 'nonEnforcement') {
        // 非执法视频
        this.queryParams.isNonEnforcementMedia = 1
      } else if (filterData.filterType === 'locked') {
        // 已锁定
        this.queryParams.isLocked = 1
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数（移除 filterType，只保留实际的查询条件）
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        // 删除被清空的时间范围字段
        const timeRangeFields = [
          'captureTimeStart', 'captureTimeEnd',
          'uploadTimeStart', 'uploadTimeEnd'
        ]
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.captureTimeStart
        delete this.queryParams.captureTimeEnd
        delete this.queryParams.isArchived
        delete this.queryParams.isNonEnforcementMedia
        delete this.queryParams.isLocked
      }
      this.handleQuery()
    },

    handleFilterReset() {
      // 重置所有筛选条件到初始值
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        captureTimeStart: undefined,
        captureTimeEnd: undefined,
        orgId: undefined,
        policeId: undefined,
        includeSubUnits: true,
        mediaCate: undefined,
        uploadTimeStart: undefined,
        uploadTimeEnd: undefined,
        recorderId: undefined,
        storageType: undefined,
        enforceType: undefined,
        mediaName: undefined,
        isArchived: undefined,
        isNonEnforcementMedia: undefined,
        isLocked: undefined,
        terminalType: undefined,
        incidentCode: undefined,
        recorderNo: undefined
      }
      this.handleQuery()
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
.search-section {
  margin-bottom: 16px;
}
</style>
