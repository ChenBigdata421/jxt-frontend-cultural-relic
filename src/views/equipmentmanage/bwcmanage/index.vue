<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏 -->
        <EquipmentQueryBar
          ref="queryBar"
          :fields="{
            no: true,
            name: true,
            org: true,
            user: true,
            brand: true,
            status: true,
            enableUse: true
          }"
          :labels="{
            no: '执法仪编号',
            name: '执法仪名称'
          }"
          :field-mapping="{
            no: 'bwcNo',
            name: 'bwcName'
          }"
          :org-options="orgOptions"
          :user-options="userOptions"
          :brand-options="brandOptions"
          :status-options="statusOptions"
          :enable-use-options="enableUseOptions"
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
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="260"
            fixed="right"
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
          <el-table-column
            v-if="isColumnVisible('no')"
            label="编号"
            align="center"
            prop="bwcNo"
            sortable="custom"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            label="名称"
            align="center"
            prop="bwcName"
            sortable="custom"
            min-width="140"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            label="品牌"
            align="center"
            prop="brandName"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('managerName')"
            label="管理员"
            align="center"
            prop="managerName"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('managerOrgFullName')"
            label="管理员所在组织"
            align="center"
            prop="managerOrgFullName"
            min-width="180"
          />
          <el-table-column
            v-if="isColumnVisible('enableUse')"
            label="是否可用"
            align="center"
            prop="enableUse"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.enableUse === 1 ? 'success' : 'danger'"
                disable-transitions
              >
                {{ enableUseFormat(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('state')"
            label="状态"
            align="center"
            prop="status"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
              >
                {{ statusFormat(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('cpu')"
            label="CPU"
            align="center"
            prop="cpu"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            label="内存(G)"
            align="center"
            prop="memory"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('disk')"
            label="存储(G)"
            align="center"
            prop="disk"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('networkCard')"
            label="网卡"
            align="center"
            prop="networkCard"
            min-width="160"
          />
          <el-table-column
            v-if="isColumnVisible('usbNum')"
            label="USB数量"
            align="center"
            prop="usbNum"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('system')"
            label="操作系统"
            align="center"
            prop="system"
            min-width="160"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            label="版本"
            align="center"
            prop="version"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('buyTime')"
            label="购买时间"
            align="center"
            prop="purchaseDate"
            width="180"
            sortable="custom"
          >
            <template slot-scope="scope">
              {{ parseTime(scope.row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('remark')"
            label="备注"
            align="center"
            prop="remark"
            min-width="160"
          />
        </el-table>

        <!-- 分页 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="700px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">

          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">

            <!-- 管理信息 -->
            <el-collapse-item name="manage" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-user section-icon" />
                  <span class="section-title">管理信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="管理组织" prop="managerOrgId">
                    <treeselect
                      v-model="form.managerOrgId"
                      :options="orgOptions"
                      placeholder="请选择管理组织"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="管理人员">
                    <el-select
                      v-model="form.managerId"
                      placeholder="请选择"
                      @change="$forceUpdate()"
                    >
                      <el-option
                        v-for="item in userOptions"
                        :key="item.userId"
                        :label="item.userName"
                        :value="item.userId"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">3项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="名称" prop="bwcName">
                    <el-input v-model="form.bwcName" placeholder="请输入名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="编号" prop="bwcNo">
                    <el-input
                      v-model="form.bwcNo"
                      placeholder="请输入编号"
                      :disabled="title === '修改执法仪'"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="品牌">
                    <el-select v-model="form.brandId" placeholder="请选择">
                      <el-option
                        v-for="item in brandOptions"
                        :key="item.id"
                        :label="item.brandName"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 状态信息 -->
            <el-collapse-item name="status" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">状态信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="是否可用">
                    <el-radio-group v-model="form.enableUse">
                      <el-radio
                        v-for="dict in enableUseOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                      <el-radio
                        v-for="dict in statusOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 硬件配置 -->
            <el-collapse-item name="hardware" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-setting section-icon" />
                  <span class="section-title">硬件配置</span>
                  <span class="section-badge">5项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="CPU">
                    <el-input v-model="form.cpu" placeholder="请输入CPU" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="内存(G)">
                    <el-input-number
                      v-model="form.memory"
                      placeholder="请输入内存大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="存储(G)">
                    <el-input-number
                      v-model="form.disk"
                      placeholder="请输入磁盘大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="网卡">
                    <el-input
                      v-model="form.networkCard"
                      placeholder="请输入网卡型号"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="USB数量">
                    <el-input-number v-model="form.usbNum" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 系统信息 -->
            <el-collapse-item name="system" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-monitor section-icon" />
                  <span class="section-title">系统信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="操作系统">
                    <el-input
                      v-model="form.system"
                      placeholder="操作系统"
                      maxlength="20"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本">
                    <el-input
                      v-model="form.version"
                      placeholder="版本"
                      maxlength="20"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 其他信息 -->
            <el-collapse-item name="other" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-more section-icon" />
                  <span class="section-title">其他信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="购置时间">
                    <el-date-picker
                      v-model="form.purchaseDate"
                      type="datetime"
                      placeholder="请输入购置时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注">
                    <el-input v-model="form.remark" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="cancel">取 消</el-button>
          <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 浏览对话框 -->
      <el-dialog
        title="浏览执法仪"
        :visible.sync="viewOpen"
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
                <span class="section-badge">5项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="执法仪编号">{{
                viewData.bwcNo || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="执法仪名称">{{
                viewData.bwcName || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{
                viewData.brandName || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="管理组织">{{
                viewData.managerOrgFullName || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="管理人员">{{
                viewData.managerName || '-'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 状态信息 -->
          <el-collapse-item name="status" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-star-on section-icon" />
                <span class="section-title">状态信息</span>
                <span class="section-badge">2项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="是否可用">{{
                selectDictLabel(enableUseOptions, viewData.enableUse) || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{
                selectDictLabel(statusOptions, viewData.status) || '-'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 硬件配置 -->
          <el-collapse-item name="hardware" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-setting section-icon" />
                <span class="section-title">硬件配置</span>
                <span class="section-badge">5项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="CPU">{{
                viewData.cpu || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="内存(G)">{{
                viewData.memory || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="存储(G)">{{
                viewData.disk || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="网卡">{{
                viewData.networkCard || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="USB数量">{{
                viewData.usbNum || '-'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 系统信息 -->
          <el-collapse-item name="system" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-monitor section-icon" />
                <span class="section-title">系统信息</span>
                <span class="section-badge">2项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="操作系统">{{
                viewData.system || '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="版本">{{
                viewData.version || '-'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 其他信息 -->
          <el-collapse-item name="other" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">其他信息</span>
                <span class="section-badge">2项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="购买时间">{{
                viewData.purchaseDate ? parseTime(viewData.purchaseDate) : '-'
              }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{
                viewData.remark || '无'
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>
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
  delEquipmentBwc,
  addEquipmentBwc,
  updateEquipmentBwc,
  listEquipmentBrand
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'

export default {
  name: 'LawCarema',
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    EquipmentQueryBar,
    BatchActionBar
  },
  data() {
    return {
      loading: true,
      firstLoad: null,
      total: 0,
      bwcList: [],
      statusOptions: [],
      enableUseOptions: [],
      selectedBwcMap: {},
      isRestoringSelection: false,
      selectedBwcRecords: [],
      isAllSelected: false,
      isSelectionIndeterminate: false,
      columnOptions: [
        { prop: 'no', field: 'bwcNo', label: '编号', fixed: true, defaultVisible: true },
        { prop: 'name', field: 'bwcName', label: '名称', fixed: true, defaultVisible: true },
        { prop: 'managerName', label: '管理员', fixed: false, defaultVisible: true },
        { prop: 'managerOrgFullName', label: '管理员所在组织', fixed: false, defaultVisible: true },
        { prop: 'brandName', label: '品牌', fixed: false, defaultVisible: true },
        { prop: 'enableUse', label: '是否可用', fixed: false, defaultVisible: true },
        { prop: 'state', field: 'status', label: '状态', fixed: false, defaultVisible: true },
        { prop: 'cpu', label: 'CPU', fixed: false, defaultVisible: false },
        { prop: 'memory', label: '内存(G)', fixed: false, defaultVisible: false },
        { prop: 'disk', label: '存储(G)', fixed: false, defaultVisible: false },
        { prop: 'networkCard', label: '网卡', fixed: false, defaultVisible: false },
        { prop: 'usbNum', label: 'USB数量', fixed: false, defaultVisible: false },
        { prop: 'system', label: '操作系统', fixed: false, defaultVisible: false },
        { prop: 'version', label: '版本', fixed: false, defaultVisible: false },
        { prop: 'buyTime', field: 'purchaseDate', label: '购买时间', fixed: false, defaultVisible: false },
        { prop: 'remark', label: '备注', fixed: false, defaultVisible: false }
      ],
      visibleColumns: [],
      title: '',
      open: false,
      viewOpen: false,
      viewData: {},
      activeFormSections: ['manage', 'basic', 'status'],
      activeDetailSections: ['basic', 'status'],
      orgOptions: [],
      userOptions: [],
      brandOptions: [],
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        status: undefined,
        enableUse: undefined
      },
      form: {},
      rules: {
        no: [{ required: true, message: '编号不能为空', trigger: 'blur' }]
      },
      processingInstance: null,
      previousCursor: null
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
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getTreeselect()
    this.getFormBrand()
    this.getDicts('bwc_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('enableuse_state').then((response) => {
      this.enableUseOptions = response.data
    })
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
    },
    initVisibleColumns() {
      const saved = localStorage.getItem('bwc_manage_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
          return
        } catch (error) {
          console.warn('解析列配置失败，使用默认列', error)
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns()
    },
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    handleColumnChange(value) {
      this.visibleColumns = value
      localStorage.setItem('bwc_manage_visible_columns', JSON.stringify(this.visibleColumns))
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      localStorage.setItem('bwc_manage_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
    },
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      getEquipmentBwcList(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.bwcList = response.data.list
            this.total = response.data.count
            this.restoreSelection()
          } else {
            this.bwcList = []
            this.total = 0
            this.msgError(response.msg || '获取执法仪列表失败')
          }
        })
        .catch((error) => {
          this.bwcList = []
          this.total = 0
          this.msgError('查询执法仪列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
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
    getFormBrand() {
      listEquipmentBrand().then((response) => {
        this.brandOptions = response.data.list
      })
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    enableUseFormat(row) {
      return this.selectDictLabel(this.enableUseOptions, row.enableUse)
    },
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },
    getFormUser() {
      listUser({ orgId: '/' + this.form.managerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list
        }
      )
    },
    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list
        }
      )
    },
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
        bwcName: undefined,
        bwcNo: undefined,
        enableUse: undefined,
        status: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        networkCard: undefined,
        usbNum: undefined,
        system: undefined,
        version: undefined,
        purchaseDate: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },
    resetSelected() {
      this.selectedBwcMap = {}
      this.selectedBwcRecords = []
    },
    resetPage() {
      this.queryParams.pageIndex = 1
    },
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      const quickSearchFields = ['bwcNo', 'bwcName', 'managerOrgId', 'managerId', 'brandId', 'status', 'enableUse']
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    handleQuickSearchReset() {
      this.handleFilterReset()
    },
    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        status: undefined,
        enableUse: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    handleOrgChange(orgId) {
      // 组织变化时，可以在这里处理相关逻辑
    },
    handleRefresh() {
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
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      )
      ;(this.bwcList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedBwcMap[id] = row
        } else {
          delete this.selectedBwcMap[id]
        }
      })
      this.selectedBwcRecords = Object.values(this.selectedBwcMap).filter(Boolean)
      const totalCount = this.bwcList.length
      const selectedCount = this.selectedBwcRecords.length
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
      this.$nextTick(() => {
        try {
          this.bwcList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedBwcMap[id]) {
              this.$refs.bwcTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          setTimeout(() => {
            this.isRestoringSelection = false
          }, 0)
        }
      })
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加执法仪'
    },
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedBwcRecords[0] ? { ...this.selectedBwcRecords[0] } : {}
      }
      this.title = '修改执法仪'
      this.open = true
    },
    handleView(row) {
      this.viewData = row
      this.viewOpen = true
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing('正在修改执法仪...')
            updateEquipmentBwc(this.form, this.form.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改执法仪成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改执法仪失败')
                }
              })
              .catch((error) => {
                this.msgError('修改执法仪失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建执法仪...')
            addEquipmentBwc(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增执法仪成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增执法仪失败')
                }
              })
              .catch((error) => {
                this.msgError('新增执法仪失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },
    async handleDelete(row) {
      try {
        var bwcIds = []
        var bwcNos = []
        if (row && row.id !== undefined) {
          bwcIds = [row.id]
          bwcNos = [row.bwcNo]
        } else {
          bwcIds = this.selectedBwcRecords.map((item) => item.id)
          bwcNos = this.selectedBwcRecords.map((item) => item.bwcNo)
        }
        const count = Array.isArray(bwcIds) ? bwcIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条执法仪记录？此操作不可恢复。`
          : `是否确认删除执法仪编号为"${bwcNos}"？此操作不可恢复。`
        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.startProcessing('正在删除执法仪...')
        const response = await delEquipmentBwc({ ids: bwcIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetSelected()
          this.resetPage()
          this.getList()
          this.msgSuccess(response.msg || '删除执法仪成功')
        } else {
          this.msgError(response.msg || '删除执法仪失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },
    cancel() {
      this.open = false
      this.reset()
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    async handleExport() {
      try {
        const hasSelection = this.selectedBwcRecords.length > 0
        const count = hasSelection ? this.selectedBwcRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条执法仪数据？`
          : '是否确认导出所有执法仪数据项？'
        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })
        const columnOptions = Array.isArray(this.columnOptions) ? this.columnOptions : []
        const visibleColumns = Array.isArray(this.visibleColumns) ? this.visibleColumns : []
        const exportColumns = columnOptions.filter((c) => visibleColumns.includes(c.prop))
        if (!exportColumns.length) {
          this.msgError('当前未选择任何可导出的列')
          return
        }
        const tHeader = exportColumns.map((c) => c.label)
        const filterVal = exportColumns.map((c) => c.field || c.prop)
        let list = []
        if (hasSelection) {
          list = this.selectedBwcRecords
        } else {
          const baseQueryParams = this.normalizeQueryParams(this.queryParams || {})
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity
          while (list.length < total) {
            const query = { ...baseQueryParams, pageIndex, pageSize }
            const resp = await getEquipmentBwcList(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询执法仪列表失败')
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
        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row }
          output.status = this.statusFormat(row)
          output.enableUse = this.enableUseFormat(row)
          output.purchaseDate = this.parseTime(row.purchaseDate)
          return output
        })
        const data = formatJson(filterVal, normalizeList)
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
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
