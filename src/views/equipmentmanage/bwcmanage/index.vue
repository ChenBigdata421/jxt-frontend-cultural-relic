<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏 -->
        <EquipmentQueryBar
          ref="queryBar"
          :fields="{
            keyword: true,
            org: true,
            user: true,
            lifecycleStatus: true,
            operabilityStatus: true,
            assignmentStatus: true,
            bwcType: true,
            vendor: true
          }"
          :labels="{ keyword: '关键词' }"
          :field-mapping="{ keyword: 'keyword' }"
          :org-options="orgOptions"
          :user-options="userOptions"
          :lifecycle-status-options="lifecycleStatusOptions"
          :operability-status-options="operabilityStatusOptions"
          :assignment-status-options="assignmentStatusOptions"
          :runtime-status-options="runtimeStatusOptions"
          :bwc-type-options="bwcTypeOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @org-change="handleOrgChange"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedBwcRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['equipment:bwc:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增执法仪
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
              v-permisaction="['equipment:bwc:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['equipment:bwc:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedBwcRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="280"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
            >
              <div class="column-settings">
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
                    <el-checkbox :label="col.prop" :disabled="col.fixed">
                      {{ col.label }}
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
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <!-- Batch Lifecycle Toolbar -->
        <div v-if="selectedBwcRecords.length > 0" class="batch-lifecycle-toolbar">
          <el-alert
            v-if="ineligibleCount > 0"
            :title="'已选中 ' + selectedBwcRecords.length + ' 项，其中 ' + ineligibleCount + ' 项为终态不可操作'"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 8px"
          />
          <el-button size="mini" type="warning" :loading="batchLoading" :disabled="!canBatchRetire" @click="openBatchDialog('retire')">批量退役</el-button>
          <el-button size="mini" type="danger" :loading="batchLoading" :disabled="!canBatchRevoke" @click="openBatchDialog('revoke')">批量吊销</el-button>
          <el-button size="mini" type="warning" :loading="batchLoading" :disabled="!canBatchRepair" @click="openBatchDialog('repair')">批量报修</el-button>
          <el-button size="mini" type="success" :loading="batchLoading" :disabled="!canBatchRepairComplete" @click="openBatchDialog('repairComplete')">批量修复完成</el-button>
        </div>

        <!-- 执法仪列表 -->
        <el-table
          ref="bwcTable"
          v-loading="loading"
          :data="bwcList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column v-if="isColumnVisible('deviceNo')" label="设备编号" align="center" prop="deviceNo" sortable="custom" min-width="120" :show-overflow-tooltip="true" />
          <el-table-column v-if="isColumnVisible('deviceName')" label="设备名称" align="center" prop="deviceName" sortable="custom" min-width="140" :show-overflow-tooltip="true" />
          <el-table-column v-if="isColumnVisible('bwcType')" label="执法仪类型" align="center" prop="bwcType" min-width="120">
            <template slot-scope="scope">
              {{ scope.row.bwcType || scope.row.deviceType || '-' }}
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('vendor')" label="供应商" align="center" prop="vendor" min-width="120" :show-overflow-tooltip="true" />
          <el-table-column v-if="isColumnVisible('model')" label="型号" align="center" prop="model" min-width="120" :show-overflow-tooltip="true" />
          <el-table-column v-if="isColumnVisible('lifecycleStatus')" label="生命周期" align="center" prop="lifecycleStatus" width="100">
            <template slot-scope="scope">
              <device-status-tag type="lifecycle" :value="scope.row.lifecycleStatus" />
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('operabilityStatus')" label="可用性" align="center" prop="operabilityStatus" width="100">
            <template slot-scope="scope">
              <device-status-tag type="operability" :value="scope.row.operabilityStatus" />
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('assignmentStatus')" label="分配状态" align="center" prop="assignmentStatus" width="100">
            <template slot-scope="scope">
              <device-status-tag type="assignment" :value="scope.row.assignmentStatus" />
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('runtimeStatus')" label="运行状态" align="center" prop="runtimeStatus" width="100">
            <template slot-scope="scope">
              <device-status-tag type="runtime" :value="scope.row.runtimeStatus" />
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('managerName')" label="管理人" align="center" prop="managerName" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column v-if="isColumnVisible('managerOrgName')" label="管理人组织" align="center" prop="managerOrgName" min-width="160" show-overflow-tooltip />
          <el-table-column v-if="isColumnVisible('storageCapacity')" label="存储(GB)" align="center" prop="storageCapacity" width="100">
            <template slot-scope="scope">
              {{ scope.row.storageCapacity || '-' }}
            </template>
          </el-table-column>
          <el-table-column v-if="isColumnVisible('remark')" label="备注" align="center" prop="remark" min-width="120" show-overflow-tooltip />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="260"
            :fixed="actionFixed ? 'right' : false"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['equipment:bwc:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['equipment:bwc:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['equipment:bwc:remove']"
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

        <!-- 分页 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>

      <!-- Batch Lifecycle Dialog -->
      <el-dialog :title="batchDialogTitle" :visible.sync="batchDialogVisible" width="400px" append-to-body @opened="onBatchDialogOpened">
        <el-form>
          <el-form-item label="原因" :required="batchDialogReasonRequired">
            <el-input ref="batchReasonInput" v-model="batchDialogReason" type="textarea" :rows="3" :placeholder="batchDialogReasonRequired ? '请输入原因' : '选填'" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="batchDialogReasonRequired && !batchDialogReason" @click="executeBatchAction">确定</el-button>
        </div>
      </el-dialog>

      <!-- Batch Result Dialog -->
      <el-dialog title="批量操作结果" :visible.sync="batchResultDialogVisible" width="500px" append-to-body>
        <div v-if="batchResult">
          <p>成功: {{ batchResult.successIds ? batchResult.successIds.length : 0 }} 项</p>
          <div v-if="batchResult.failedItems && batchResult.failedItems.length > 0">
            <p>失败: {{ batchResult.failedItems.length }} 项</p>
            <el-table :data="batchResult.failedItems" size="small">
              <el-table-column prop="id" label="设备ID" width="100" />
              <el-table-column prop="reason" label="失败原因" />
            </el-table>
          </div>
        </div>
        <div slot="footer">
          <el-button type="primary" @click="batchResultDialogVisible = false">确定</el-button>
        </div>
      </el-dialog>

      <!-- 新增/修改对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="open" :width="form.bwcType === '5G' ? '800px' : '700px'" append-to-body :close-on-click-modal="false" custom-class="edit-dialog">
        <el-form ref="form" :model="form" :rules="formRules" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备名称" prop="deviceName">
                <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备编号" prop="deviceNo">
                <el-input v-model="form.deviceNo" placeholder="请输入设备编号" :disabled="dialogStatus === 'update'" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="资产编号">
                <el-input v-model="form.assetNo" placeholder="请输入资产编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商">
                <el-input v-model="form.vendor" placeholder="请输入供应商" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="型号">
                <el-input v-model="form.model" placeholder="请输入型号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执法仪类型" prop="bwcType">
                <el-radio-group v-model="form.bwcType" :disabled="dialogStatus === 'update'">
                  <el-radio v-for="opt in bwcTypeOptions" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="存储容量(GB)">
                <el-input-number v-model="form.storageCapacity" :min="1" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="摄像头分辨率">
                <el-input v-model="form.cameraResolution" placeholder="请输入摄像头分辨率" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="固件版本">
                <el-input v-model="form.firmwareVersion" placeholder="请输入固件版本" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="质保到期日">
                <el-date-picker v-model="form.warrantyExpiry" type="date" value-format="yyyy-MM-dd" placeholder="请选择" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="购买日期">
                <el-date-picker v-model="form.purchaseDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="管理组织" prop="managerOrgId">
                <treeselect v-model="form.managerOrgId" :options="orgOptions" placeholder="请选择管理组织" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="管理人员">
                <el-select v-model="form.managerId" placeholder="请选择管理人员" filterable>
                  <el-option v-for="item in userOptions" :key="item.userId" :label="item.userName || item.nickName" :value="item.userId" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- GB28181 终端配置 (仅 5G 设备) -->
          <el-collapse-transition>
            <div v-if="form.bwcType === '5G'">
              <el-row :gutter="20">
                <el-col :span="24">
                  <div class="section-header" style="margin: 12px 0 8px 120px; font-weight: 600; color: #303133;">
                    GB28181 终端配置
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SIP 设备编号" prop="gb28181Id">
                    <el-input v-model="form.gb28181Id" placeholder="20 位数字 SIP 设备编号" maxlength="20" :disabled="dialogStatus === 'update'" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SIP 认证密码" prop="sipPassword">
                    <el-input
                      v-model="form.sipPassword"
                      type="password"
                      show-password
                      :disabled="dialogStatus === 'update'"
                      placeholder="留空则自动生成密码"
                      maxlength="128"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <div style="margin: 4px 0 8px 120px; font-size: 13px; color: #909399;">基础设置</div>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="字符编码">
                    <el-select v-model="form.terminalExt.charset" style="width: 100%">
                      <el-option v-for="opt in charsetOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="流传输模式">
                    <el-select v-model="form.terminalExt.streamMode" style="width: 100%">
                      <el-option v-for="opt in streamModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SDP 流接收 IP">
                    <el-input v-model="form.terminalExt.sdpIp" placeholder="可选，如 192.168.1.100" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="流媒体服务器 ID">
                    <el-input v-model="form.terminalExt.mediaServerId" placeholder="默认 auto" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <div style="margin: 4px 0 8px 120px; font-size: 13px; color: #909399;">高级设置</div>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SSRC 校验">
                    <el-checkbox v-model="form.terminalExt.ssrcCheck">启用</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="地理坐标系">
                    <el-select v-model="form.terminalExt.geoCoordSys" style="width: 100%">
                      <el-option v-for="opt in geoCoordSysOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="作为消息通道">
                    <el-checkbox v-model="form.terminalExt.asMessageChannel">启用</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="应答后推广播">
                    <el-checkbox v-model="form.terminalExt.broadcastPushAfterAck">启用</el-checkbox>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="心跳间隔 (秒)">
                    <el-input-number v-model="form.terminalExt.heartbeatInterval" :min="1" :max="3600" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="心跳超时次数">
                    <el-input-number v-model="form.terminalExt.heartbeatCount" :min="1" :max="30" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-collapse-transition>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="cancel">取 消</el-button>
          <el-button type="primary" size="small" :loading="submitLoading" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 浏览对话框 -->
      <el-dialog title="设备详情" :visible.sync="viewOpen" width="800px" append-to-body :close-on-click-modal="false" custom-class="detail-dialog">
        <div v-loading="viewLoading">
          <device-info-panel v-if="viewData && viewData.deviceUid" :device="viewData" />
          <div v-else-if="!viewLoading" style="text-align:center;color:#999">未找到设备信息</div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import EquipmentQueryBar from '@/components/EquipmentQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  getEquipmentBwcList,
  getEquipmentBwc,
  addEquipmentBwc,
  updateEquipmentBwc,
  delEquipmentBwc,
  batchRetireBwc,
  batchRevokeBwc,
  batchRepairBwc,
  batchRepairCompleteBwc
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import {
  LifecycleStatusLabels,
  OperabilityStatusLabels,
  AssignmentStatusLabels,
  RuntimeStatusLabels,
  BWCType,
  BWCTypeLabels,
  enumToOptions,
  enumValueToOptions
} from '@/constants/deviceStatus'
import DeviceStatusTag from '@/components/DeviceStatusTag/index.vue'
import DeviceInfoPanel from '@/components/DeviceInfoPanel/index.vue'
import actionColumnMixin from '@/mixins/actionColumnMixin'

export default {
  name: 'LawCarema',
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    EquipmentQueryBar,
    BatchActionBar,
    DeviceStatusTag,
    DeviceInfoPanel
  },
  mixins: [actionColumnMixin],
  data() {
    return {
      loading: true,
      submitLoading: false,
      viewLoading: false,
      exportLoading: false,
      total: 0,
      bwcList: [],
      selectedBwcMap: {},
      isRestoringSelection: false,
      selectedBwcRecords: [],
      isAllSelected: false,
      isSelectionIndeterminate: false,

      // Status options from constants
      lifecycleStatusOptions: enumToOptions(LifecycleStatusLabels),
      operabilityStatusOptions: enumToOptions(OperabilityStatusLabels),
      assignmentStatusOptions: enumToOptions(AssignmentStatusLabels),
      runtimeStatusOptions: enumToOptions(RuntimeStatusLabels),
      bwcTypeOptions: enumValueToOptions(BWCType, BWCTypeLabels),
      charsetOptions: [
        { label: 'GB2312', value: 'GB2312' },
        { label: 'UTF-8', value: 'UTF-8' }
      ],
      streamModeOptions: [
        { label: 'TCP 被动', value: 'TCP-PASSIVE' },
        { label: 'UDP', value: 'UDP' },
        { label: 'TCP 主动', value: 'TCP-ACTIVE' }
      ],
      geoCoordSysOptions: [
        { label: 'WGS84', value: 'WGS84' },
        { label: 'GCJ02', value: 'GCJ02' }
      ],

      // Column options
      columnStorageKey: 'bwc_manage_visible_columns_v2',
      columnOptions: [
        { prop: 'deviceNo', field: 'deviceNo', label: '设备编号', fixed: true, defaultVisible: true },
        { prop: 'deviceName', field: 'deviceName', label: '设备名称', fixed: true, defaultVisible: true },
        { prop: 'bwcType', field: 'bwcType', label: '执法仪类型', fixed: false, defaultVisible: true },
        { prop: 'vendor', field: 'vendor', label: '供应商', fixed: false, defaultVisible: true },
        { prop: 'model', field: 'model', label: '型号', fixed: false, defaultVisible: true },
        { prop: 'lifecycleStatus', field: 'lifecycleStatus', label: '生命周期', fixed: false, defaultVisible: true },
        { prop: 'operabilityStatus', field: 'operabilityStatus', label: '可用性', fixed: false, defaultVisible: false },
        { prop: 'assignmentStatus', field: 'assignmentStatus', label: '分配状态', fixed: false, defaultVisible: true },
        { prop: 'runtimeStatus', field: 'runtimeStatus', label: '运行状态', fixed: false, defaultVisible: false },
        { prop: 'managerName', field: 'managerName', label: '管理人', fixed: false, defaultVisible: true },
        { prop: 'managerOrgName', field: 'managerOrgName', label: '管理人组织', fixed: false, defaultVisible: true },
        { prop: 'storageCapacity', field: 'storageCapacity', label: '存储(GB)', fixed: false, defaultVisible: false },
        { prop: 'remark', field: 'remark', label: '备注', fixed: false, defaultVisible: false }
      ],
      visibleColumns: [],

      // Dialog state
      dialogStatus: '',
      dialogTitle: '',
      open: false,
      viewOpen: false,
      viewData: {},
      orgOptions: [],
      userOptions: [],

      // Query params - match backend PhysicalDeviceGetPageReq
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceType: undefined,
        keyword: undefined,
        lifecycleStatus: undefined,
        operabilityStatus: undefined,
        assignmentStatus: undefined,
        runtimeStatus: undefined,
        vendor: undefined,
        bwcType: undefined,
        managerId: undefined,
        managerOrgId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },

      // Form
      form: {
        deviceName: undefined,
        deviceNo: undefined,
        deviceType: '标准',
        assetNo: undefined,
        vendor: undefined,
        model: undefined,
        managerId: undefined,
        managerOrgId: undefined,
        remark: undefined,
        bwcType: '标准',
        storageCapacity: undefined,
        cameraResolution: undefined,
        firmwareVersion: undefined,
        warrantyExpiry: undefined,
        purchaseDate: undefined,
        gb28181Id: '',
        sipPassword: '',
        terminalExt: {
          charset: 'GB2312',
          streamMode: 'TCP-PASSIVE',
          sdpIp: '',
          mediaServerId: 'auto',
          ssrcCheck: false,
          geoCoordSys: 'WGS84',
          asMessageChannel: false,
          broadcastPushAfterAck: false,
          heartbeatInterval: 60,
          heartbeatCount: 3
        }
      },

      // Batch operations
      batchDialogVisible: false,
      batchDialogTitle: '',
      batchDialogReason: '',
      batchDialogReasonRequired: false,
      batchDialogAction: null,
      batchResultDialogVisible: false,
      batchResult: null,
      batchLoading: false,

      processingInstance: null,
      previousCursor: null,
      firstLoad: null,
      // 操作列动态固定：覆盖 mixin 默认的 'table'
      tableRef: 'bwcTable'
    }
  },
  computed: {
    formRules: function() {
      var rules = {
        deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        deviceNo: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        bwcType: [{ required: true, message: '请选择执法仪类型', trigger: 'change' }]
      }
      if (this.form.bwcType === '5G') {
        rules.gb28181Id = [
          { required: true, message: '请输入 SIP 设备编号', trigger: 'blur' },
          { pattern: /^\d{20}$/, message: 'SIP 设备编号必须为 20 位数字', trigger: 'blur' }
        ]
        rules.sipPassword = [
          {
            validator: function(rule, value, callback) {
              if (!value) { callback(); return }
              if (value.length < 8 || value.length > 128) {
                callback(new Error('密码需 8-128 位字符'))
                return
              }
              if (!/^[\x00-\x7F]+$/.test(value)) {
                callback(new Error('密码仅支持 ASCII 字符'))
                return
              }
              if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
                callback(new Error('密码需同时包含字母和数字'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      }
      return rules
    },
    ineligibleCount() {
      var terminalStates = ['已回收', '已吊销']
      return this.selectedBwcRecords.filter(function(r) {
        return terminalStates.indexOf(r.lifecycleStatus) >= 0
      }).length
    },
    canBatchRetire() {
      var eligible = ['活动中', '修理中']
      return this.selectedBwcRecords.length > 0 && this.selectedBwcRecords.every(function(r) {
        return eligible.indexOf(r.lifecycleStatus) >= 0
      })
    },
    canBatchRevoke() {
      var eligible = ['活动中', '修理中']
      return this.selectedBwcRecords.length > 0 && this.selectedBwcRecords.every(function(r) {
        return eligible.indexOf(r.lifecycleStatus) >= 0
      })
    },
    canBatchRepair() {
      return this.selectedBwcRecords.length > 0 && this.selectedBwcRecords.every(function(r) {
        return r.lifecycleStatus === '活动中'
      })
    },
    canBatchRepairComplete() {
      return this.selectedBwcRecords.length > 0 && this.selectedBwcRecords.every(function(r) {
        return r.lifecycleStatus === '修理中'
      })
    }
  },
  watch: {
    'form.managerOrgId': function(newVal) {
      if (newVal) {
        if (this.firstLoad !== true) {
          this.form.managerId = null
        }
        this.firstLoad = false
        this.getFormUser()
      }
    },
    'queryParams.managerOrgId': function(newVal) {
      if (newVal) {
        this.queryParams.managerId = null
        this.getQueryUser()
      }
    },
    'form.bwcType': function(val) {
      if (val === '5G') {
        this.form.gb28181Id = ''
        this.form.sipPassword = ''
        this.form.terminalExt = {
          charset: 'GB2312',
          streamMode: 'TCP-PASSIVE',
          sdpIp: '',
          mediaServerId: 'auto',
          ssrcCheck: false,
          geoCoordSys: 'WGS84',
          asMessageChannel: false,
          broadcastPushAfterAck: false,
          heartbeatInterval: 60,
          heartbeatCount: 3
        }
      } else {
        this.form.gb28181Id = ''
        this.form.sipPassword = ''
        this.form.terminalExt = null
      }
      this.$nextTick(function() {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      }.bind(this))
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getTreeselect()
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter(function(item) { return item.defaultVisible !== false })
        .map(function(item) { return item.prop })
    },
    initVisibleColumns() {
      try {
        var saved = localStorage.getItem(this.columnStorageKey)
        if (saved) {
          this.visibleColumns = JSON.parse(saved)
          return
        }
      } catch (e) {
        console.warn('Column settings corrupted, using defaults')
      }
      this.visibleColumns = this.getDefaultVisibleColumns()
    },
    isColumnVisible(prop) {
      return this.visibleColumns.indexOf(prop) >= 0
    },
    handleColumnChange(value) {
      this.visibleColumns = value
      try {
        localStorage.setItem(this.columnStorageKey, JSON.stringify(this.visibleColumns))
      } catch (e) {
        // localStorage full or unavailable - ignore
      }
      this.refreshTableLayout()
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      try {
        localStorage.setItem(this.columnStorageKey, JSON.stringify(this.visibleColumns))
      } catch (e) {
        // ignore
      }
      this.$message.success('已重置为默认显示')
    },
    getList() {
      this.loading = true
      var query = this.normalizeQueryParams(this.queryParams)
      getEquipmentBwcList(query).then(function(response) {
        if (response.code === 200 && response.data) {
          this.bwcList = response.data.list || []
          this.total = response.data.count || response.data.total || 0
          this.restoreSelection()
        } else {
          this.bwcList = []
          this.total = 0
          this.msgError(response.msg || '获取列表失败')
        }
      }.bind(this)).catch(function(error) {
        this.bwcList = []
        this.total = 0
        this.msgError('查询失败：' + (error.message || '未知错误'))
      }.bind(this)).finally(function() {
        this.loading = false
        this.scheduleCheckActionFixed()
      }.bind(this))
    },
    normalizeQueryParams(params) {
      if (!params) params = {}
      var query = Object.assign({}, params)
      Object.keys(query).forEach(function(key) {
        var value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        }
      })
      return query
    },
    getTreeselect() {
      orgTreeSelect().then(function(response) {
        this.orgOptions = response.data
      }.bind(this))
    },
    getFormUser() {
      listUser({ orgId: '/' + this.form.managerOrgId + '/' }).then(function(response) {
        this.userOptions = response.data.list
      }.bind(this))
    },
    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(function(response) {
        this.userOptions = response.data.list
      }.bind(this))
    },
    resetSelected() {
      this.selectedBwcMap = {}
      this.selectedBwcRecords = []
    },
    handleSearch(searchData) {
      // Reset all query params to defaults first
      var resetParams = {
        keyword: undefined,
        lifecycleStatus: undefined,
        operabilityStatus: undefined,
        assignmentStatus: undefined,
        runtimeStatus: undefined,
        vendor: undefined,
        bwcType: undefined,
        managerId: undefined,
        managerOrgId: undefined
      }
      Object.assign(this.queryParams, resetParams)
      // Then apply search data
      Object.assign(this.queryParams, searchData)
      this.queryParams.pageNum = 1
      this.resetSelected()
      this.getList()
    },
    handleFilterReset() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        deviceType: undefined,
        keyword: undefined,
        lifecycleStatus: undefined,
        operabilityStatus: undefined,
        assignmentStatus: undefined,
        runtimeStatus: undefined,
        vendor: undefined,
        bwcType: undefined,
        managerId: undefined,
        managerOrgId: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
      this.resetSelected()
      this.getList()
    },
    handleQuickSearchReset() {
      this.handleFilterReset()
    },
    handleOrgChange(orgId) {
      if (orgId) {
        this.queryParams.managerId = null
        listUser({ orgId: '/' + orgId + '/' }).then(function(response) {
          this.userOptions = response.data.list || []
        }.bind(this))
      } else {
        this.userOptions = []
      }
    },
    handleRefresh() {
      this.getList()
    },
    handleSortChang(column) {
      var prop = column.prop
      var order = column.order
      if (order === 'descending') {
        this.queryParams.sortBy = prop
        this.queryParams.sortOrder = 'desc'
      } else if (order === 'ascending') {
        this.queryParams.sortBy = prop
        this.queryParams.sortOrder = 'asc'
      } else {
        this.queryParams.sortBy = 'createdAt'
        this.queryParams.sortOrder = 'desc'
      }
      this.getList()
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
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      var selectedIdSet = new Set(
        (selection || []).map(function(item) { return item && (item.deviceUid || item.id) }).filter(Boolean)
      )
      var self = this
      ;(this.bwcList || []).forEach(function(row) {
        var id = row && (row.deviceUid || row.id)
        if (!id) return
        if (selectedIdSet.has(id)) {
          self.selectedBwcMap[id] = row
        } else {
          delete self.selectedBwcMap[id]
        }
      })
      this.selectedBwcRecords = Object.values(this.selectedBwcMap).filter(Boolean)
      var totalCount = this.bwcList.length
      var selectedCount = this.selectedBwcRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.bwcTable.toggleAllSelection()
    },
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.bwcTable) return
      if (!this.bwcList || !this.bwcList.length) return
      this.isRestoringSelection = true
      var self = this
      this.$nextTick(function() {
        try {
          self.bwcList.forEach(function(row) {
            var id = row && (row.deviceUid || row.id)
            if (!id) return
            if (self.selectedBwcMap[id]) {
              self.$refs.bwcTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          setTimeout(function() {
            self.isRestoringSelection = false
          }, 0)
        }
      })
    },
    handleAdd() {
      this.resetFormData()
      this.dialogStatus = 'create'
      this.dialogTitle = '添加执法仪'
      this.open = true
    },
    handleUpdate(row) {
      this.resetFormData()
      this.firstLoad = true
      var source = (row && (row.deviceUid !== undefined || row.id !== undefined)) ? row : this.selectedBwcRecords[0]
      var self = this
      if (source) {
        var uid = source.deviceUid || source.id
        getEquipmentBwc(uid).then(function(response) {
          if (response.code === 200 && response.data) {
            self.form = Object.assign({ sipPassword: '' }, response.data)
          } else {
            self.form = Object.assign({ sipPassword: '' }, source)
          }
          self.dialogStatus = 'update'
          self.dialogTitle = '修改执法仪'
          self.open = true
        }).catch(function() {
          self.form = Object.assign({ sipPassword: '' }, source)
          self.dialogStatus = 'update'
          self.dialogTitle = '修改执法仪'
          self.open = true
        })
      } else {
        this.dialogStatus = 'update'
        this.dialogTitle = '修改执法仪'
        this.open = true
      }
    },
    handleView(row) {
      this.viewLoading = true
      this.viewData = {}
      this.viewOpen = true
      getEquipmentBwc(row.deviceUid || row.id).then(function(response) {
        if (response.code === 200 && response.data) {
          this.viewData = response.data
        }
      }.bind(this)).catch(function(error) {
        this.msgError('获取设备详情失败：' + (error.message || '未知错误'))
      }.bind(this)).finally(function() {
        this.viewLoading = false
      }.bind(this))
    },
    resetFormData() {
      this.form = {
        deviceName: undefined,
        deviceNo: undefined,
        deviceType: '标准',
        assetNo: undefined,
        vendor: undefined,
        model: undefined,
        managerId: undefined,
        managerOrgId: undefined,
        remark: undefined,
        bwcType: '标准',
        storageCapacity: undefined,
        cameraResolution: undefined,
        firmwareVersion: undefined,
        warrantyExpiry: undefined,
        purchaseDate: undefined,
        gb28181Id: '',
        sipPassword: '',
        terminalExt: {
          charset: 'GB2312',
          streamMode: 'TCP-PASSIVE',
          sdpIp: '',
          mediaServerId: 'auto',
          ssrcCheck: false,
          geoCoordSys: 'WGS84',
          asMessageChannel: false,
          broadcastPushAfterAck: false,
          heartbeatInterval: 60,
          heartbeatCount: 3
        }
      }
      this.$nextTick(function() {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      }.bind(this))
    },
    buildTerminalExtPayload() {
      var ext = this.form.terminalExt
      if (!ext) return undefined
      var defaults = {
        charset: 'GB2312',
        streamMode: 'TCP-PASSIVE',
        sdpIp: '',
        mediaServerId: 'auto',
        ssrcCheck: false,
        geoCoordSys: 'WGS84',
        asMessageChannel: false,
        broadcastPushAfterAck: false,
        heartbeatInterval: 60,
        heartbeatCount: 3
      }
      var result = {}
      var hasCustom = false
      var keys = Object.keys(defaults)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (ext[key] !== defaults[key]) {
          result[key] = ext[key]
          hasCustom = true
        }
      }
      return hasCustom ? result : undefined
    },
    submitForm() {
      this.$refs.form.validate(function(valid) {
        if (!valid) return
        this.submitLoading = true
        if (this.form.deviceUid || this.form.id) {
          var id = this.form.deviceUid || this.form.id
          updateEquipmentBwc(this.form, id).then(function(response) {
            if (response.code === 200) {
              this.getList()
              this.msgSuccess('修改成功')
              this.open = false
            } else {
              this.msgError(response.msg || '修改失败')
            }
          }.bind(this)).catch(function(error) {
            this.msgError('修改失败：' + (error.message || '未知错误'))
          }.bind(this)).finally(function() {
            this.submitLoading = false
          }.bind(this))
        } else {
          var payload = Object.assign({}, this.form)
          if (this.form.bwcType === '5G' && this.form.gb28181Id) {
            var mapping = {
              identityType: 'GB28181_ID',
              identityValue: this.form.gb28181Id,
              platformType: 'WVP',
              terminalExt: this.buildTerminalExtPayload()
            }
            if (this.form.sipPassword) {
              mapping.password = this.form.sipPassword
            }
            payload.identityMappings = [mapping]
          }
          delete payload.gb28181Id
          delete payload.sipPassword
          delete payload.terminalExt
          addEquipmentBwc(payload).then(function(response) {
            if (response.code === 200) {
              this.getList()
              var syncStatus = (response.data && response.data.syncStatus) || ''
              if (syncStatus === 'registered') {
                this.msgSuccess('新增成功，WVP 注册完成')
              } else if (syncStatus === 'pending_retry') {
                this.$message({ message: '新增成功，WVP 注册中，请稍后确认', type: 'warning', duration: 5000 })
              } else {
                this.msgSuccess('新增成功')
              }
              this.open = false
            } else {
              this.msgError(response.msg || '新增失败')
            }
          }.bind(this)).catch(function(error) {
            this.msgError('新增失败：' + (error.message || '未知错误'))
          }.bind(this)).finally(function() {
            this.submitLoading = false
          }.bind(this))
        }
      }.bind(this))
    },
    async handleDelete(row) {
      try {
        var ids = []
        if (row && (row.deviceUid || row.id)) {
          ids = [row.deviceUid || row.id]
        } else {
          ids = this.selectedBwcRecords.map(function(item) { return item.deviceUid || item.id })
        }
        var count = ids.length
        var confirmMessage = count > 1
          ? '是否确认删除选中的 ' + count + ' 条记录？此操作不可恢复。'
          : '是否确认删除该记录？此操作不可恢复。'
        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.startProcessing('正在删除...')
        var response = await delEquipmentBwc({ ids: ids })
        if (response.code === 200) {
          this.resetSelected()
          this.queryParams.pageNum = 1
          this.getList()
          this.msgSuccess('删除成功')
        } else {
          this.msgError(response.msg || '删除失败')
        }
        this.stopProcessing()
      } catch (error) {
        this.stopProcessing()
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },
    cancel() {
      this.open = false
      this.resetFormData()
    },
    delay(ms) {
      return new Promise(function(resolve) { setTimeout(resolve, ms) })
    },
    onBatchDialogOpened() {
      this.$nextTick(function() {
        if (this.$refs.batchReasonInput) {
          this.$refs.batchReasonInput.focus()
        }
      }.bind(this))
    },
    openBatchDialog(action) {
      var ids = this.selectedBwcRecords.map(function(r) { return r.deviceUid || r.id })
      var actions = {
        retire: { title: '批量退役', fn: batchRetireBwc, reasonRequired: false },
        revoke: { title: '批量吊销', fn: batchRevokeBwc, reasonRequired: true },
        repair: { title: '批量报修', fn: batchRepairBwc, reasonRequired: false },
        repairComplete: { title: '批量修复完成', fn: batchRepairCompleteBwc, reasonRequired: false }
      }
      var config = actions[action]
      if (!config) return
      this.batchDialogTitle = config.title
      this.batchDialogReason = ''
      this.batchDialogReasonRequired = config.reasonRequired
      var self = this
      this.batchDialogAction = function() {
        return config.fn({ ids: ids, reason: self.batchDialogReason || undefined })
      }
      this.batchDialogVisible = true
    },
    executeBatchAction() {
      if (!this.batchDialogAction) return
      this.batchLoading = true
      this.batchDialogAction().then(function(response) {
        this.batchDialogVisible = false
        if (response.code === 200) {
          this.batchResult = response.data
          this.batchResultDialogVisible = true
          this.getList()
          if (this.$refs.bwcTable) {
            this.$refs.bwcTable.clearSelection()
          }
        } else {
          this.msgError(response.msg || '批量操作失败')
        }
      }.bind(this)).catch(function(error) {
        this.msgError('批量操作失败：' + (error.message || '未知错误'))
      }.bind(this)).finally(function() {
        this.batchLoading = false
      }.bind(this))
    },
    async handleExport() {
      try {
        var hasSelection = this.selectedBwcRecords.length > 0
        var count = hasSelection ? this.selectedBwcRecords.length : 0
        var confirmText = hasSelection
          ? '是否确认导出已勾选的 ' + count + ' 条数据？'
          : '是否确认导出所有数据项？'
        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })
        var columnOptions = Array.isArray(this.columnOptions) ? this.columnOptions : []
        var visibleColumns = Array.isArray(this.visibleColumns) ? this.visibleColumns : []
        var exportColumns = columnOptions.filter(function(c) { return visibleColumns.indexOf(c.prop) >= 0 })
        if (!exportColumns.length) {
          this.msgError('当前未选择任何可导出的列')
          return
        }
        var tHeader = exportColumns.map(function(c) { return c.label })
        var filterVal = exportColumns.map(function(c) { return c.field || c.prop })
        var list = []
        if (hasSelection) {
          list = this.selectedBwcRecords
        } else {
          var baseQueryParams = this.normalizeQueryParams(this.queryParams || {})
          var pageSize = 1000
          var pageNum = 1
          var total = Infinity
          while (list.length < total) {
            var query = Object.assign({}, baseQueryParams, { pageNum: pageNum, pageSize: pageSize })
            var resp = await getEquipmentBwcList(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询失败')
            }
            var pageList = (resp.data && resp.data.list) || []
            total = (resp.data && resp.data.total) || 0
            list = list.concat(pageList)
            if (!pageList.length) break
            pageNum += 1
          }
        }
        var normalizeList = (Array.isArray(list) ? list : []).map(function(row) {
          var output = Object.assign({}, row)
          output.lifecycleStatus = LifecycleStatusLabels[row.lifecycleStatus] || row.lifecycleStatus
          output.operabilityStatus = OperabilityStatusLabels[row.operabilityStatus] || row.operabilityStatus
          output.assignmentStatus = AssignmentStatusLabels[row.assignmentStatus] || row.assignmentStatus
          output.runtimeStatus = RuntimeStatusLabels[row.runtimeStatus] || row.runtimeStatus
          output.bwcType = row.bwcType || row.deviceType
          return output
        })
        var data = formatJson(filterVal, normalizeList)
        var excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data: data,
          filename: '执法仪列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .form-collapse
  - src/styles/components/forms.scss: .section-header
  - src/styles/components/buttons.scss: .action-btn
-->
