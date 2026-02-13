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
        <el-form-item prop="captureTimeStart">
          <el-date-picker
            v-model="queryParams.captureTimeStart"
            type="datetime"
            placeholder="请选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <span>至</span>
        <el-form-item prop="captureTimeEnd">
          <el-date-picker
            v-model="queryParams.captureTimeEnd"
            type="datetime"
            placeholder="请选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
      </el-form-item>

      <el-form-item label="单位组织" prop="orgId">
        <div class="horizontal-container">
          <treeselect
            v-model="queryParams.orgId"
            :options="orgOptions"
            placeholder="请选择单位组织"
            style="width: 200px"
            clearable
            @select="handleOrgSelect"
          />
          <el-checkbox v-model="queryParams.includeSubUnits">包含下级</el-checkbox>
        </div>
      </el-form-item>

      <el-form-item label="拍摄警员" prop="policeId">
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
        <el-button type="default" icon="el-icon-more" size="mini" @click="toggleMore"
          >更多</el-button
        >
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery"
          >查询</el-button
        >
        <el-button type="default" icon="el-icon-refresh" size="mini" @click="resetQuery"
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
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="导入时间">
        <el-form-item prop="uploadTimeStart">
          <el-date-picker
            v-model="queryParams.uploadTimeStart"
            type="datetime"
            placeholder="请选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <span>至</span>
        <el-form-item prop="uploadTimeEnd">
          <el-date-picker
            v-model="queryParams.uploadTimeEnd"
            type="datetime"
            placeholder="请选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
      </el-form-item>

      <el-form-item v-if="showMore" label="执法仪" prop="recorderId">
        <el-select
          v-model="queryParams.recorderId"
          placeholder="请选择执法仪"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in bwcOptions"
            :key="item.id"
            :label="item.bwcNo"
            :value="item.id"
          />
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

      <el-form-item v-if="showMore" label="执法类型" prop="enforceType">
        <treeselect
          v-model="queryParams.enforceType"
          :options="enforceTypeOptions"
          :normalizer="normalizeEnforceType"
          placeholder="请选择执法类型"
          style="width: 200px"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showMore" label="媒体名称" prop="mediaName">
        <el-input
          v-model="queryParams.mediaName"
          placeholder="请输入媒体名称"
          clearable
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
                <el-button type="text" size="mini" @click="resetColumns">重置</el-button>
              </div>
              <el-checkbox-group v-model="visibleColumns" @change="handleColumnChange">
                <div v-for="col in columnOptions" :key="col.prop" class="column-item">
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
        width="55"
        align="center"
        :reserve-selection="true"
      />
      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="260"
        align="center"
        fixed="left"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleOperation(scope.row, 'edit')"
            >一键归档</el-button
          >
          <el-button size="mini" type="text" @click="handleOperation(scope.row, 'view')"
            >浏览</el-button
          >
          <el-button size="mini" type="text" @click="handleOperation(scope.row, 'play')"
            >播放</el-button
          >
          <el-button size="mini" type="text" @click="handleOperation(scope.row, 'copy')"
            >复制地址</el-button
          >
          <el-button size="mini" type="text" @click="handleOperation(scope.row, 'delete')"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'download')"
            >下载</el-button
          >
          <el-button
            v-if="scope.row.mediaCate === 3"
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
          {{
            parseTime(row.expiryTime) === "2999-01-01 08:00:00"
              ? "永久"
              : parseTime(row.expiryTime)
          }}
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
      <el-table-column v-if="isColumnVisible('policeName')" label="警员姓名" width="120">
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
            >{{ row.incidentCode }}</el-button
          >
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
    >
      <el-descriptions :column="2" border>
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
        <el-button @click="viewIncidentOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMedia } from "@/api/evidence/evidence_manage_query_api";
import { getEnforceTypeTree } from "@/api/admin/enforcetype";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import { getEquipmentBwcByManagerId } from "@/api/admin/equipment_manage_api";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { selectDictLabel } from "@/utils/costum";
import MediaDetailDialog from "@/components/MediaDetailDialog";

export default {
  name: "MediaSelector",
  components: { Treeselect, MediaDetailDialog },
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
        policeId: undefined,
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
          prop: "mediaName",
          label: "媒体名称",
          fixed: true,
          defaultVisible: true,
        },
        { prop: "mediaCate", label: "媒体类型", defaultVisible: true },
        { prop: "mediaSuffix", label: "媒体后缀", defaultVisible: false },
        { prop: "captureTime", label: "拍摄时间", defaultVisible: true },
        {
          prop: "captureEndTime",
          label: "拍摄结束时间",
          defaultVisible: false,
        },
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
        { prop: "filePath", label: "存储路径", defaultVisible: false },
        { prop: "fileMd5", label: "文件MD5", defaultVisible: false },
        { prop: "fileType", label: "文件类型", defaultVisible: false },
        { prop: "contentType", label: "MIME类型", defaultVisible: false },
        { prop: "collectSiteNo", label: "采集站编号", defaultVisible: false },
        { prop: "collectSiteName", label: "采集站名称", defaultVisible: false },
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

      selectedMediaMap: {},
      isRestoringSelection: false,
      order: "", // 当前排序字段，用于追踪排序状态
    };
  },
  watch: {
    "queryParams.orgId": function (newVal) {
      // 当组织选择变化时，清空人员选择并重新加载该组织的人员列表
      if (newVal) {
        this.queryParams.policeId = undefined;
        this.getUserListByOrgId(newVal);
      } else {
        // 如果清空组织选择，则清空人员列表
        this.userOptions = [];
        this.queryParams.policeId = undefined;
      }
    },
    "queryParams.policeId": function (newVal) {
      // 当警员选择变化时，清空执法仪选择并重新加载该警员管理的执法仪列表
      if (newVal) {
        this.queryParams.recorderId = undefined;
        this.getBwcListByPoliceId(newVal);
      } else {
        // 如果清空警员选择，则清空执法仪列表
        this.bwcOptions = [];
        this.queryParams.recorderId = undefined;
      }
    },
  },
  created() {
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery };
    this.initVisibleColumns();
    this.getOrgTreeSelect();
    this.getUserList();
    this.getBwcList();
    this.getEnforceTypeTree();

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
      this.getDicts("media_importance"),
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
          mediaImportanceRes,
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
          this.mediaImportanceOptions = mediaImportanceRes.data;

          console.log("[MediaSelector] 字典加载完成");
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
    getRowKey(row) {
      return row && row.mediaId;
    },

    /** 组织选择事件 */
    /*handleOrgSelect(node) {
      if (node) {
        listUser({ orgId: "/" + node.id + "/" }).then((response) => {
          this.userOptions = response.data.list || [];
        });
      }
    },*/

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.mediaTable) return;
      if (!this.mediaList || !this.mediaList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.mediaList.forEach((row) => {
            const id = row && row.mediaId;
            if (!id) return;
            if (this.selectedMediaMap[id]) {
              this.$refs.mediaTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
    },
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

    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        } else if (
          (key === "captureTimeStart" ||
            key === "captureTimeEnd" ||
            key === "uploadTimeStart" ||
            key === "uploadTimeEnd") &&
          typeof value === "string"
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString();
          }
        }
      });
      return query;
    },

    /** 查询媒体列表 */
    getList() {
      this.loading = true;
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listMedia
      const apiFunc = this.customListApi || listMedia;
      const query = this.normalizeQueryParams(this.queryParams);
      apiFunc(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.mediaList = response.data.list || [];
            this.total = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.mediaList = [];
            this.total = 0;
            this.msgError(response.msg || "查询媒体失败");
          }
        })
        .catch((error) => {
          this.mediaList = [];
          this.total = 0;
          this.msgError("查询媒体失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
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
      /*listUser().then((response) => {
        this.userOptions = response.data || [];
      });*/
      this.userOptions = [];
    },

    /** 获取执法仪列表（根据警员ID） */
    getBwcListByPoliceId(policeId) {
      if (!policeId) {
        this.bwcOptions = [];
        return;
      }
      console.log("policeId:", policeId);
      getEquipmentBwcByManagerId(policeId).then((response) => {
        // 判断返回数据的结构
        if (Array.isArray(response.data)) {
          // 如果 response.data 是数组，直接使用
          this.bwcOptions = response.data;
        } else if (response.data && Array.isArray(response.data.list)) {
          // 如果 response.data.list 是数组，使用 list
          this.bwcOptions = response.data.list;
        } else {
          // 其他情况，设置为空数组
          this.bwcOptions = [];
        }
      });
    },

    /** 获取执法仪列表（全部） */
    getBwcList() {
      // 初始化时不加载执法仪列表，等待用户选择警员后再加载
      this.bwcOptions = [];
    },

    /** 获取执法类型树 */
    getEnforceTypeTree() {
      getEnforceTypeTree().then((response) => {
        this.enforceTypeOptions = response.data || [];
      });
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedMediaMap = {};
      // 向父组件发送数据变化事件
      this.$emit(
        "selection-change",
        Object.values(this.selectedMediaMap).filter(Boolean)
      );
      this.$nextTick(() => {
        if (this.$refs.mediaTable) {
          this.$refs.mediaTable.clearSelection();
        }
      });
    },

    //pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    //每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1;
    },

    handleQuery() {
      this.resetPage();
      this.resetSelected();
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
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
      if (this.isRestoringSelection) {
        return;
      }
      //Boolean 是 JavaScript 内置函数，它会过滤掉数组中的假值（false、0、""、null、undefined、NaN）
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.mediaId).filter(Boolean)
      );

      (this.mediaList || []).forEach((row) => {
        const id = row && row.mediaId;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedMediaMap[id] = row;
        } else {
          delete this.selectedMediaMap[id];
        }
      });

      // 向父组件发送“全量已选”的数据变化事件
      this.$emit(
        "selection-change",
        Object.values(this.selectedMediaMap).filter(Boolean)
      );
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
    /*handleOrgSelect(node) {
      if (node) {
        this.getUserListByOrgId(node.id);
      }
    },*/

    /** 警员选择事件 */
    handlePoliceSelect(policeId) {
      // 当警员选择变化时，通过 watch 自动触发获取执法仪列表
      // 这里可以添加其他需要的逻辑
    },

    /** 根据组织获取用户列表 */
    getUserListByOrgId(orgId) {
      const params = { orgId: "/" + orgId + "/" };
      listUser(params).then((response) => {
        this.userOptions = response.data.list || [];
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
    normalizeEnforceType(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.enforceTypeName || node.label || "未知",
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

    /** 删除按钮操作 */
    handleDelete() {
      this.$emit("delete", this.selectedMedia);
    },

    /** 浏览媒体详情 */
    handleViewMedia(row) {
      this.viewMediaData = row;
      this.viewMediaOpen = true;
    },

    /** 浏览警情详情 */
    handleViewIncident(row) {
      this.viewIncidentData = row;
      this.viewIncidentOpen = true;
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      // 添加安全检查,防止row为空
      if (!row) {
        return;
      }

      // 处理浏览操作
      if (action === "view") {
        this.handleViewMedia(row);
        return;
      }
      this.$emit("operation", row, action);
    },

    /** 获取选中的媒体数据 */
    getSelectedMedia() {
      return this.selectedMedia;
    },

    /** 刷新列表 */
    refreshList() {
      this.getList();
    },

    /** 清空跨分页选中（供父组件调用） */
    clearSelection() {
      this.selectedMediaMap = {};
      this.$emit("selection-change", []);
      this.$nextTick(() => {
        if (this.$refs.mediaTable) {
          this.$refs.mediaTable.clearSelection();
        }
      });
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
