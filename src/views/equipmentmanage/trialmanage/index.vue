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
            status: true
          }"
          :labels="{
            no: '场地编号',
            name: '场地名称'
          }"
          :field-mapping="{
            no: 'trialNo',
            name: 'trialName'
          }"
          :org-options="orgOptions"
          :user-options="userOptions"
          :brand-options="brandOptions"
          :status-options="statusOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @org-change="handleOrgChange"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedTrialRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['equipment:trial:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增场地
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
              v-permisaction="['equipment:trial:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['equipment:trial:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedTrialRecords.length === 0"
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

        <!-- 场地列表 -->
        <el-table
          ref="trialTable"
          v-loading="loading"
          :data="equipmentTrialList"
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
            fixed="left"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['equipment:trial:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['equipment:trial:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['equipment:trial:remove']"
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
            prop="trialNo"
            sortable="custom"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            label="名称"
            align="center"
            prop="trialName"
            sortable="custom"
            min-width="140"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            label="品牌名称"
            align="center"
            prop="brandName"
            min-width="140"
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
            v-if="isColumnVisible('trialIp')"
            label="IP"
            align="center"
            prop="trialIp"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            label="地址"
            align="center"
            prop="address"
            min-width="160"
          />
          <el-table-column
            v-if="isColumnVisible('trialUrl')"
            label="播放地址"
            align="center"
            prop="trialUrl"
            min-width="160"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            label="购置时间"
            align="center"
            prop="purchaseDate"
            width="180"
            sortable="custom"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('version')"
            label="版本号"
            align="center"
            prop="version"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            label="状态"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
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
                  <el-form-item label="编号" prop="trialNo">
                    <el-input v-model="form.trialNo" placeholder="请输入编号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="名称" prop="trialName">
                    <el-input v-model="form.trialName" placeholder="请输入名称" />
                  </el-form-item>
                </el-col>
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

            <!-- 网络信息 -->
            <el-collapse-item name="network" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-connection section-icon" />
                  <span class="section-title">网络信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="IP" prop="trialIp">
                    <el-input v-model="form.trialIp" placeholder="请输入IP" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="地址" prop="address">
                    <el-input v-model="form.address" placeholder="请输入地址" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 扩展信息 -->
            <el-collapse-item name="extend" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-more section-icon" />
                  <span class="section-title">扩展信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="播放地址" prop="trialUrl">
                    <el-input
                      v-model="form.trialUrl"
                      placeholder="请输入播放地址"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="密钥" prop="authKey">
                    <el-input v-model="form.authKey" placeholder="请输入密钥" />
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
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="版本号" prop="version">
                    <el-input v-model="form.version" placeholder="请输入版本号" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 状态与备注 -->
            <el-collapse-item name="status" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">状态与备注</span>
                  <span class="section-badge">3项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
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
                <el-col :span="12">
                  <el-form-item label="购置时间">
                    <el-date-picker
                      v-model="form.purchaseDate"
                      type="datetime"
                      placeholder="选择购置时间"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="备注">
                    <el-input
                      v-model="form.remark"
                      type="textarea"
                      placeholder="请输入内容"
                    />
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

      <!-- 浏览试验场对话框 -->
      <el-dialog
        title="浏览试验场"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="detail-dialog"
      >
        <el-collapse v-model="activeViewSections" class="form-collapse">

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
              <el-descriptions-item label="试验场编号">
                <span class="nowrap-text">{{ viewData.trialNo || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="试验场名称">
                {{ viewData.trialName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="品牌">
                {{ viewData.brandName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="管理组织">
                {{ viewData.managerOrgFullName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="管理人员">
                {{ viewData.managerName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag
                  v-if="viewData.status !== undefined"
                  :type="viewData.status === 1 ? 'success' : 'danger'"
                  size="small"
                  effect="dark"
                >{{ selectDictLabel(statusOptions, viewData.status) }}</el-tag>
                <span v-else>-</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 网络配置 -->
          <el-collapse-item name="network" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-link section-icon" />
                <span class="section-title">网络配置</span>
                <span class="section-badge">4项</span>
              </div>
            </template>
            <el-descriptions :column="1" border class="section-descriptions">
              <el-descriptions-item label="IP 地址">
                {{ viewData.trialIp || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="播放地址">
                {{ viewData.trialUrl || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="密钥">
                {{ viewData.authKey || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="物理地址">
                {{ viewData.address || "-" }}
              </el-descriptions-item>
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
              <el-descriptions-item label="版本号">
                {{ viewData.version || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="购置时间">
                {{ viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 其他信息 -->
          <el-collapse-item name="other" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">其他信息</span>
                <span class="section-badge">1项</span>
              </div>
            </template>
            <el-descriptions :column="1" border class="section-descriptions">
              <el-descriptions-item label="备注">
                {{ viewData.remark || "无" }}
              </el-descriptions-item>
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
  listEquipmentTrial,
  delEquipmentTrial,
  addEquipmentTrial,
  updateEquipmentTrial,
  listEquipmentBrand
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'

export default {
  name: 'Trial',
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
      equipmentTrialList: [],
      statusOptions: [],
      selectedTrialMap: {},
      isRestoringSelection: false,
      selectedTrialRecords: [],
      isAllSelected: false,
      isSelectionIndeterminate: false,
      columnOptions: [
        { prop: 'no', field: 'trialNo', label: '编号', fixed: true, defaultVisible: true },
        { prop: 'name', field: 'trialName', label: '名称', fixed: true, defaultVisible: true },
        { prop: 'brandName', label: '品牌名称', fixed: false, defaultVisible: true },
        { prop: 'managerName', label: '管理员', fixed: false, defaultVisible: true },
        { prop: 'managerOrgFullName', label: '管理员所在组织', fixed: false, defaultVisible: true },
        { prop: 'trialIp', label: 'IP', fixed: false, defaultVisible: true },
        { prop: 'address', label: '地址', fixed: false, defaultVisible: true },
        { prop: 'trialUrl', label: '播放地址', fixed: false, defaultVisible: false },
        { prop: 'purchaseDate', label: '购置时间', fixed: false, defaultVisible: false },
        { prop: 'version', label: '版本号', fixed: false, defaultVisible: false },
        { prop: 'status', label: '状态', fixed: false, defaultVisible: true },
        { prop: 'remark', label: '备注', fixed: false, defaultVisible: false }
      ],
      visibleColumns: [],
      title: '',
      open: false,
      viewOpen: false,
      viewData: {},
      activeViewSections: ['basic', 'network'],
      activeFormSections: ['manage', 'basic', 'network'],
      orgOptions: [],
      userOptions: [],
      brandOptions: [],
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        trialName: undefined,
        trialNo: undefined,
        status: undefined,
        brandId: undefined,
        managerOrgId: undefined,
        managerId: undefined
      },
      form: {
        status: undefined
      },
      rules: {
        trialNo: [{ required: true, message: '编号不能为空', trigger: 'blur' }],
        trialName: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
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
    this.getDicts('trial_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
    },
    initVisibleColumns() {
      const saved = localStorage.getItem('trial_manage_visible_columns')
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
      localStorage.setItem('trial_manage_visible_columns', JSON.stringify(this.visibleColumns))
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      localStorage.setItem('trial_manage_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
    },
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listEquipmentTrial(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.equipmentTrialList = response.data.list
            this.total = response.data.count
            this.restoreSelection()
          } else {
            this.equipmentTrialList = []
            this.total = 0
            this.msgError(response.msg || '获取trial列表失败')
          }
        })
        .catch((error) => {
          this.equipmentTrialList = []
          this.total = 0
          this.msgError('获取trial列表失败：' + (error.message || '未知错误'))
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
        trialNo: undefined,
        trialName: undefined,
        trialIp: undefined,
        address: undefined,
        trialUrl: undefined,
        authKey: undefined,
        purchaseDate: undefined,
        version: undefined,
        remark: undefined,
        brandName: undefined,
        brandId: undefined,
        status: undefined
      }
      this.resetForm('form')
    },
    resetSelected() {
      this.selectedTrialMap = {}
      this.selectedTrialRecords = []
    },
    resetPage() {
      this.queryParams.pageIndex = 1
    },
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      const quickSearchFields = ['trialNo', 'trialName', 'managerOrgId', 'managerId', 'brandId', 'status']
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
        trialName: undefined,
        trialNo: undefined,
        status: undefined,
        brandId: undefined,
        managerOrgId: undefined,
        managerId: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    handleOrgChange(orgId) {
      // 组织变化时处理
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
      ;(this.equipmentTrialList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedTrialMap[id] = row
        } else {
          delete this.selectedTrialMap[id]
        }
      })
      this.selectedTrialRecords = Object.values(this.selectedTrialMap).filter(Boolean)
      const totalCount = this.equipmentTrialList.length
      const selectedCount = this.selectedTrialRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.trialTable.toggleAllSelection()
    },
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.trialTable) return
      if (!this.equipmentTrialList || !this.equipmentTrialList.length) return
      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.equipmentTrialList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedTrialMap[id]) {
              this.$refs.trialTable.toggleRowSelection(row, true)
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
      this.title = '添加场地'
    },
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedTrialRecords[0] ? { ...this.selectedTrialRecords[0] } : {}
      }
      this.title = '修改场地'
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
            this.startProcessing('正在修改场地...')
            updateEquipmentTrial(this.form, this.form.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('修改场地失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建场地...')
            addEquipmentTrial(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('新增场地失败：' + (error.message || '未知错误'))
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
        var trialIds = []
        var trialNos = []
        if (row && row.id !== undefined) {
          trialIds = [row.id]
          trialNos = [row.trialNo]
        } else {
          trialIds = this.selectedTrialRecords.map((item) => item.id)
          trialNos = this.selectedTrialRecords.map((item) => item.trialNo)
        }
        await this.$confirm(
          '是否确认删除场地编号为"' + trialNos + '"的数据项?',
          '信息',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        this.startProcessing('正在删除场地...')
        const response = await delEquipmentTrial({ ids: trialIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetSelected()
          this.resetPage()
          this.getList()
          this.msgSuccess(response.msg || '删除场地成功')
        } else {
          this.msgError(response.msg || '删除场地失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除场地失败：' + (error.message || '未知错误'))
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
        const hasSelection = this.selectedTrialRecords.length > 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedTrialRecords.length} 条场地数据？`
          : '是否确认导出所有场地数据项？'
        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
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
          list = this.selectedTrialRecords
        } else {
          const baseQueryParams = this.normalizeQueryParams(this.queryParams || {})
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity
          while (list.length < total) {
            const query = { ...baseQueryParams, pageIndex, pageSize }
            const resp = await listEquipmentTrial(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询场地列表失败')
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
          output.purchaseDate = this.parseTime(row.purchaseDate)
          return output
        })
        const data = formatJson(filterVal, normalizeList)
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '场地列表',
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
  - src/styles/components/dialogs.scss: .edit-dialog, .detail-dialog, .form-collapse, .detail-collapse
  - src/styles/components/forms.scss: .section-header, .section-descriptions, .detail-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
