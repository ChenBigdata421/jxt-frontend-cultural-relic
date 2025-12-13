<template>
  <div class="media-selector">
    <!-- 查询条件 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      class="demo-form-inline"
      size="small"
    >
      <el-form-item label="拍摄时间">
        <el-date-picker
          v-model="queryParams.captureTimeStart"
          type="datetime"
          placeholder="请选择时间"
          value-format="yyyy-MM-ddTHH:mm:ssZ"
        >
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.captureTimeEnd"
          type="datetime"
          placeholder="请选择时间"
          value-format="yyyy-MM-ddTHH:mm:ssZ"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="单位组织">
        <div class="horizontal-container">
          <treeselect
            v-model="queryParams.orgId"
            :options="orgOptions"
            placeholder="请选择单位组织"
            style="width: 200px"
            clearable
            @select="handleOrgSelect"
          />
          <el-checkbox v-model="queryParams.includeSubUnits"
            >包含下级</el-checkbox
          >
        </div>
      </el-form-item>

      <el-form-item label="拍摄警员">
        <el-select
          v-model="queryParams.policeId"
          placeholder="请选择拍摄警员"
          clearable
          style="width: 200px"
          @change="handlePoliceSelect"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="default"
          icon="el-icon-more"
          size="mini"
          @click="toggleMore"
          >更多</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >查询</el-button
        >
        <el-button
          type="default"
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>

      <!-- 更多查询条件 -->
      <el-form-item label="媒体类型" prop="mediaCate">
        <el-select
          v-model="queryParams.mediaCate"
          placeholder="媒体类型"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in mediaCateOptions"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="导入时间">
        <el-date-picker
          v-model="queryParams.uploadTimeStart"
          type="datetime"
          placeholder="请选择时间"
          value-format="yyyy-MM-ddTHH:mm:ssZ"
        >
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.uploadTimeEnd"
          type="datetime"
          placeholder="请选择时间"
          value-format="yyyy-MM-ddTHH:mm:ssZ"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item v-if="showMore" label="执法仪编号">
        <el-input
          v-model="queryParams.recorderId"
          placeholder="请输入执法仪编号"
        />
      </el-form-item>

      <el-form-item v-if="showMore" label="数据来源">
        <el-select v-model="queryParams.dataSource" placeholder="请选择">
          <el-option label="采集站" value="0" />
          <el-option label="采集客户端" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="存储方式" prop="storageType">
        <el-select
          v-model="queryParams.storageType"
          placeholder="存储方式"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in storageTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="执法类型">
        <treeselect
          v-model="queryParams.enforceType"
          :options="enforcementTypeOptions"
          :normalizer="normalizeEnforcementType"
          placeholder="请选择执法类型"
          style="width: 200px"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showMore" label="媒体名称">
        <el-input
          v-model="queryParams.mediaName"
          placeholder="请输入媒体名称"
        />
      </el-form-item>
    </el-form>

    <!-- 自定义工具栏插槽 -->
    <div class="toolbar-container">
      <el-row :gutter="10" type="flex" justify="space-between">
        <el-col :span="20">
          <slot name="toolbar"></slot>
        </el-col>
        <el-col :span="4" class="column-settings-trigger">
          <el-popover placement="bottom-end" width="300" trigger="click">
            <div class="column-settings">
              <div class="column-settings-header">
                <span>列显示设置</span>
                <el-button type="text" size="mini" @click="resetColumns"
                  >重置</el-button
                >
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
                  <el-checkbox :label="col.prop" :disabled="col.fixed">
                    {{ col.label }}
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            <el-button slot="reference" size="mini" icon="el-icon-setting"
              >列设置</el-button
            >
          </el-popover>
        </el-col>
      </el-row>
    </div>

    <!-- 媒体列表 -->
    <el-table
      v-loading="loading"
      :data="mediaList"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="260"
        align="center"
        fixed="left"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'edit')"
            >一键归档</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'view')"
            >浏览</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'play')"
            >播放</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'copy')"
            >复制地址</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'delete')"
            >删除</el-button
          >
          <el-button
            v-if="isVideoMedia(scope.row)"
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'track')"
            >视频轨迹</el-button
          >
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('mediaName')"
        prop="mediaName"
        label="媒体名称"
        min-width="160"
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
      />
      <el-table-column
        v-if="isColumnVisible('importantLevelRec')"
        prop="importantLevelRec"
        label="重要级别(设备)"
        width="150"
      />
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
            {{
              selectDictLabel(
                isNonEnforcementMediaOptions,
                row.isNonEnforcementMedia
              )
            }}
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
        v-if="isColumnVisible('enforceTypeName')"
        prop="enforceTypeName"
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
          {{ parseTime(row.expiryTime) }}
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
        v-if="isColumnVisible('contentType')"
        prop="contentType"
        label="MIME类型"
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
        v-if="isColumnVisible('collectSiteUrl')"
        prop="collectSiteUrl"
        label="采集站地址"
        min-width="200"
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
        label="警员编号"
        min-width="160"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        v-if="isColumnVisible('policeName')"
        label="警员姓名"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ formatPoliceName(row) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('policeIdCard')"
        prop="policeIdCard"
        label="警员身份证号"
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
      <el-table-column
        v-if="isColumnVisible('orgName')"
        label="单位名称"
        min-width="160"
      >
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
      />
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
            {{
              selectDictLabel(relationStatusOptions, row.isIncidentAssociated)
            }}
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
  </div>
</template>

<script>
import {
  listMedia,
  getEnforcementTypeTree,
} from "@/api/evidence/evidence_manage_query_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { selectDictLabel } from "@/utils/costum";

export default {
  name: "MediaSelector",
  components: { Treeselect },
  props: {
    // 是否为选择模式（用于对话框中的媒体选择）
    selectionMode: {
      type: Boolean,
      default: false,
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true,
    },
    // 初始查询参数
    initialQuery: {
      type: Object,
      default: () => ({}),
    },
    // 自定义媒体列表API函数
    customListApi: {
      type: Function,
      default: null,
    },
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
      multiple: true,
      // 总条数
      total: 0,
      // 媒体数据
      mediaList: [],
      // 是否显示更多查询条件
      showMore: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        captureTimeStart: undefined,
        captureTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        uploadTimeStart: undefined,
        uploadTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforceType: undefined,
        mediaName: undefined,
        orderBy: undefined,
        isDesc: true,
      },
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储方式选项
      storageTypeOptions: [],
      // 执法类型选项
      enforcementTypeOptions: [],
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
      // 列配置选项
      columnOptions: [
        {
          prop: "mediaName",
          label: "媒体名称",
          fixed: true,
          defaultVisible: true,
        },
        { prop: "mediaCate", label: "媒体类型", defaultVisible: true },
        { prop: "mediaSuffix", label: "媒体后缀", defaultVisible: false },
        { prop: "captureTime", label: "拍摄时间", defaultVisible: true },
        { prop: "captureEndTime", label: "拍摄结束时间", defaultVisible: false },
        { prop: "clarity", label: "视频清晰度", defaultVisible: false },
        {
          prop: "duration",
          label: "视频时长(毫秒)",
          defaultVisible: false,
        },
        {
          prop: "importantLevel",
          label: "重要级别(平台)",
          defaultVisible: false,
        },
        {
          prop: "importantLevelRec",
          label: "重要级别(设备)",
          defaultVisible: false,
        },
        { prop: "width", label: "图片宽度", defaultVisible: false },
        { prop: "height", label: "图片高度", defaultVisible: false },
        {
          prop: "isNonEnforcementMedia",
          label: "是否执法媒体",
          defaultVisible: true,
        },
        { prop: "comments", label: "标注内容", defaultVisible: false },
        { prop: "sequence", label: "视频序列标识", defaultVisible: false },
        {
          prop: "enforceTypeName",
          label: "执法类型名称",
          defaultVisible: false,
        },
        { prop: "isLocked", label: "是否锁定", defaultVisible: false },
        { prop: "expiryTime", label: "过期时间", defaultVisible: false },
        { prop: "archiveCode", label: "档案编号", defaultVisible: false },
        { prop: "isArchive", label: "是否归档", defaultVisible: false },
        { prop: "archiveDate", label: "归档时间", defaultVisible: false },
        { prop: "fileIdentity", label: "文件标识", defaultVisible: false },
        { prop: "fileName", label: "文件名称", defaultVisible: false },
        { prop: "fileSize", label: "文件大小(KB)", defaultVisible: false },
        { prop: "fileMd5", label: "文件MD5", defaultVisible: false },
        { prop: "fileType", label: "文件类型", defaultVisible: false },
        { prop: "contentType", label: "MIME类型", defaultVisible: false },
        { prop: "collectSiteNo", label: "采集站编号", defaultVisible: false },
        { prop: "collectSiteName", label: "采集站名称", defaultVisible: false },
        { prop: "collectSiteUrl", label: "采集站地址", defaultVisible: false },
        { prop: "storageType", label: "存储方式", defaultVisible: false },
        {
          prop: "isSendToStorage",
          label: "是否上传至存储",
          defaultVisible: false,
        },
        { prop: "isNoticeSend", label: "是否通知发送", defaultVisible: false },
        { prop: "policeNo", label: "警员编号", defaultVisible: false },
        { prop: "policeName", label: "警员姓名", defaultVisible: true },
        { prop: "policeIdCard", label: "警员身份证号", defaultVisible: false },
        { prop: "orgCode", label: "单位编码", defaultVisible: false },
        { prop: "orgName", label: "单位名称", defaultVisible: true },
        { prop: "orgFullName", label: "单位全称", defaultVisible: false },
        { prop: "orgJc", label: "单位简称", defaultVisible: false },
        { prop: "terminalType", label: "终端类型", defaultVisible: false },
        { prop: "recorderNo", label: "执法仪编号", defaultVisible: false },
        { prop: "incidentCode", label: "警情号", defaultVisible: false },
        {
          prop: "isAssociated",
          label: "是否关联",
          fixed: true,
          defaultVisible: true,
        },
        { prop: "associateTime", label: "关联时间", defaultVisible: false },
        { prop: "requestIdentity", label: "请求标识", defaultVisible: false },
        { prop: "authKey", label: "认证码", defaultVisible: false },
        { prop: "traceCode", label: "追溯码", defaultVisible: false },
        { prop: "uploadTime", label: "上传时间", defaultVisible: true },
        { prop: "acquisitionTime", label: "接收时间", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
    };
  },
  created() {
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery };
    this.initVisibleColumns();
    this.getOrgTreeSelect();
    this.getUserList();
    this.getEnforcementTypeTree();

    // 使用Promise.all等待所有字典加载完成
    Promise.all([
      this.getDicts("evidence_media_type"),
      this.getDicts("evidence_storage_type"),
      this.getDicts("is_archived"),
      this.getDicts("relation_status"),
      this.getDicts("is_send_to_storage"),
      this.getDicts("is_locked"),
      this.getDicts("terminal_type"),
      this.getDicts("is_non_enforcement_media"),
      this.getDicts("video_clarity"),
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
        ]) => {
          this.mediaCateOptions = mediaCateRes.data;
          this.storageTypeOptions = storageTypeRes.data;
          this.isArchivedOptions = isArchivedRes.data;
          this.relationStatusOptions = relationStatusRes.data;
          this.isSendToStorageOptions = isSendToStorageRes.data;
          this.isLockedOptions = isLockedRes.data;
          this.terminalTypeOptions = terminalTypeRes.data;
          this.isNonEnforcementMediaOptions = isNonEnforcementMediaRes.data;
          this.videoClarityOptions = videoClarityRes.data;

          // 字典加载完成后再加载列表
          this.getList();
        }
      )
      .catch((error) => {
        console.error("[MediaSelector] 字典加载失败:", error);
        // 即使字典加载失败,也要加载列表
        this.getList();
      });
  },
  methods: {
    /** 默认可见列 */
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop);
    },

    /** 初始化列显示配置 */
    initVisibleColumns() {
      const saved = localStorage.getItem("media_selector_visible_columns");
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved);
          return;
        } catch (error) {
          console.warn("解析列显示配置失败，使用默认列", error);
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns();
    },

    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },

    /** 列显示变更 */
    handleColumnChange(value) {
      this.visibleColumns = value;
      localStorage.setItem(
        "media_selector_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
    },

    /** 重置列显示 */
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns();
      localStorage.setItem(
        "media_selector_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },

    /** 查询媒体列表 */
    getList() {
      this.loading = true;
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listMedia
      const apiFunc = this.customListApi || listMedia;

      apiFunc(this.queryParams)
        .then((response) => {
          // 兼容不同的数据结构
          if (Array.isArray(response.data)) {
            // 情况1: response.data 直接是数组 (旧版API)
            this.mediaList = response.data;
            this.total = response.data.length;
          } else if (response.data.list) {
            // 情况2: response.data.list 是数组 (标准格式)
            this.mediaList = response.data.list;
            // 优先使用 count,其次 total,最后使用 list.length
            this.total =
              response.data.count ||
              response.data.total ||
              response.data.list.length;

            // 调试日志：查看第一条数据的isArchived和isIncidentAssociated字段
            if (this.mediaList.length > 0) {
              console.log(
                "[MediaSelector] 第一条数据的isArchived:",
                this.mediaList[0].isArchived,
                "类型:",
                typeof this.mediaList[0].isArchived
              );
              console.log(
                "[MediaSelector] 第一条数据的isIncidentAssociated:",
                this.mediaList[0].isIncidentAssociated,
                "类型:",
                typeof this.mediaList[0].isIncidentAssociated
              );
            }
          } else {
            // 情况3: 其他情况
            this.mediaList = [];
            this.total = 0;
          }

          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    /** 获取组织树 */
    getOrgTreeSelect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data;
      });
    },

    /** 获取用户列表 */
    getUserList() {
      listUser().then((response) => {
        this.userOptions = response.data || [];
      });
    },

    /** 获取执法类型树 */
    getEnforcementTypeTree() {
      getEnforcementTypeTree().then((response) => {
        this.enforcementTypeOptions = response.data || [];
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        captureTimeStart: undefined,
        captureTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        uploadTimeStart: undefined,
        uploadTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforceType: undefined,
        mediaName: undefined,
        orderBy: undefined,
        isDesc: true,
        ...this.initialQuery,
      };
      this.handleQuery();
    },

    /** 切换更多查询条件 */
    toggleMore() {
      this.showMore = !this.showMore;
    },

    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      const isSelected = selection.some((item) => item.mediaId === row.mediaId);
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit("select", row);
      }
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      // 向父组件发送选中数据变化事件
      this.$emit("selection-change", selection);
    },

    /** 排序回调函数 */
    handleSortChange(column, prop, order) {
      prop = column.prop;
      order = column.order;
      if (this.order !== "" && this.order !== prop + "Order") {
        this.queryParams[this.order] = undefined;
      }
      if (order === "descending") {
        this.queryParams[prop + "Order"] = "desc";
        this.order = prop + "Order";
      } else if (order === "ascending") {
        this.queryParams[prop + "Order"] = "asc";
        this.order = prop + "Order";
      } else {
        this.queryParams[prop + "Order"] = undefined;
      }
      this.getList();
    },

    /** 组织选择事件 */
    handleOrgSelect(node) {
      if (node) {
        this.getUserListByOrg(node.id);
      }
    },

    /** 警员选择事件 */
    handlePoliceSelect() {
      // 可以在这里添加警员选择后的逻辑
    },

    /** 根据组织获取用户列表 */
    getUserListByOrg(orgId) {
      const params = { orgId };
      listUser(params).then((response) => {
        this.userOptions = response.data || [];
      });
    },

    /** 格式化警员名称 */
    formatPoliceName(row) {
      return row.policeName || row.userName || "-";
    },

    /** 格式化组织名称 */
    formatOrgName(row) {
      return row.orgFullName || row.orgName || "-";
    },

    /** 执法类型数据格式化 */
    normalizeEnforcementType(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || "未知",
        children: node.children,
      };
    },

    /** 视频时长（毫秒）格式化为 HH:MM:SS */
    formatVideoDuration(value) {
      if (value === null || value === undefined) {
        return "-";
      }
      const totalSeconds = Math.floor(Number(value) / 1000);
      const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },

    /** 通用 是/否 */
    formatYesNo(value) {
      if (value === 1) return "是";
      if (value === 0) return "否";
      return "-";
    },

    /** 文件大小（KB）转换 */
    formatFileSize(value) {
      if (value === null || value === undefined) {
        return "-";
      }
      const size = Number(value) * 1024; // 转换为字节
      if (!size) return "-";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let index = 0;
      let current = size;
      while (current >= 1024 && index < units.length - 1) {
        current /= 1024;
        index++;
      }
      return `${current.toFixed(2)} ${units[index]}`;
    },

    // 以下方法仅在非选择模式下使用
    /** 新增按钮操作 */
    handleAdd() {
      this.$emit("add");
    },

    /** 修改按钮操作 */
    handleUpdate() {
      this.$emit("update", this.selectedMedia[0]);
    },

    /** 删除按钮操作 */
    handleDelete() {
      this.$emit("delete", this.selectedMedia);
    },

    isVideoMedia(row) {
      // 使用字典查找替代format函数
      // 添加安全检查,防止mediaCateOptions未初始化或row为空
      if (!row || row.mediaCate === null || row.mediaCate === undefined) {
        return false;
      }
      if (!this.mediaCateOptions || !Array.isArray(this.mediaCateOptions)) {
        return false;
      }
      // 使用宽松相等(==)支持数字和字符串类型的匹配
      const option = this.mediaCateOptions.find(
        (item) => item.value == row.mediaCate
      );
      return option ? option.label === "视频" : false;
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      // 添加安全检查,防止row为空
      if (!row) {
        return;
      }
      // 使用字典查找替代format函数
      // 添加安全检查,防止mediaCateOptions未初始化
      const mediaCateOption =
        this.mediaCateOptions &&
        Array.isArray(this.mediaCateOptions) &&
        row.mediaCate !== null &&
        row.mediaCate !== undefined
          ? this.mediaCateOptions.find(
              (item) =>
                item.value == row.mediaCate ||
                item.value === String(row.mediaCate)
            )
          : null;

      var newRow = {
        ...row,
        mediaCate: mediaCateOption ? mediaCateOption.label : row.mediaCate,
        orgFullName: this.formatOrgName(row),
      };
      this.$emit("operation", newRow, action);
    },

    /** 获取选中的媒体数据 */
    getSelectedMedia() {
      return this.selectedMedia;
    },

    /** 刷新列表 */
    refresh() {
      this.getList();
    },
  },
};
</script>

<style scoped>
.toolbar-container {
  margin-bottom: 10px;
  padding: 10px 0;
}

.toolbar-container .el-row {
  flex-wrap: wrap;
}

.toolbar-container .el-col {
  margin-bottom: 5px;
}

.column-settings-trigger {
  text-align: right;
}

.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-item .el-checkbox {
  width: 100%;
}

.horizontal-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
