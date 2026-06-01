<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form
          ref="queryForm"
          :model="queryParams"
          :inline="true"
          label-width="72px"
        >
          <el-form-item label="租户编码" prop="code">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入租户编码"
              clearable
              size="small"
              style="width: 200px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入租户名称"
              clearable
              size="small"
              style="width: 200px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              size="small"
              style="width: 160px"
            >
              <el-option label="已激活" value="active" />
              <el-option label="未激活" value="inactive" />
              <el-option label="已暂停" value="suspended" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              icon="el-icon-refresh"
              size="mini"
              @click="resetQuery"
            >重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['platform:tenants:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['platform:tenants:edit']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="!selectedId"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['platform:tenants:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="selectedIds.length === 0"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
        </el-row>

        <el-table
          ref="table"
          v-loading="loading"
          :data="list"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column
            label="租户编码"
            prop="code"
            min-width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="名称"
            prop="name"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="状态" prop="status" width="120" />
          <el-table-column
            label="联系人"
            prop="contactName"
            min-width="120"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="邮箱"
            prop="contactEmail"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="电话"
            prop="contactPhone"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="更新时间"
            prop="updatedAt"
            width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="操作" width="220" class-name="small-padding fixed-width" :fixed="actionFixed ? 'right' : false">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['platform:tenants:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >编辑</el-button>
                <el-button
                  v-permisaction="['platform:tenants:status']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handlePrecheck(scope.row)"
                >检查</el-button>
                <el-dropdown
                  trigger="click"
                  @command="(command) => handleTenantCommand(scope.row, command)"
                >
                  <el-button
                    size="small"
                    type="text"
                    class="action-btn tertiary"
                  >
                    更多<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-permisaction="['platform:tenants:status']"
                      icon="el-icon-circle-check"
                      command="activate"
                      :disabled="scope.row && scope.row.status === 'active'"
                    >激活</el-dropdown-item>
                    <el-dropdown-item
                      v-permisaction="['platform:tenants:status']"
                      icon="el-icon-refresh"
                      command="status"
                    >状态</el-dropdown-item>
                    <el-dropdown-item
                      v-permisaction="['platform:tenants:config']"
                      icon="el-icon-setting"
                      command="config"
                    >配置</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
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

        <el-dialog
          :title="dialogTitle"
          :visible.sync="open"
          width="760px"
          :close-on-click-modal="false"
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="110px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="租户编码" prop="code">
                  <el-input
                    v-model="form.code"
                    placeholder="请输入租户编码（必填，唯一）"
                    :disabled="dialogTitle === '修改租户'"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="租户名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入租户名称" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="状态">
                  <el-select
                    v-model="form.status"
                    placeholder="创建后默认 inactive（配置完毕后请先【检查】再【激活】）"
                    style="width: 100%"
                    disabled
                  >
                    <el-option label="已激活" value="active" />
                    <el-option label="未激活" value="inactive" />
                    <el-option label="已暂停" value="suspended" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="联系人" prop="contactName">
                  <el-input v-model="form.contactName" placeholder="可选" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人邮箱" prop="contactEmail">
                  <el-input v-model="form.contactEmail" placeholder="可选" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="联系人电话" prop="contactPhone">
                  <el-input v-model="form.contactPhone" placeholder="可选" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计费方案" prop="billingPlan">
                  <el-input v-model="form.billingPlan" placeholder="可选" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="配额(quotaJson)" prop="quotaJson">
                  <el-input
                    v-model="form.quotaJson"
                    type="textarea"
                    :rows="3"
                    placeholder="可选"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input
                    v-model="form.remark"
                    type="textarea"
                    :rows="3"
                    placeholder="可选"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <el-drawer
          :title="tenantConfigTitle"
          :visible.sync="configOpen"
          size="60%"
          :with-header="true"
          :wrapper-closable="false"
        >
          <div style="padding: 0 16px">
            <el-tabs v-model="configActiveTab" type="border-card">
              <el-tab-pane label="Domain" name="domain">
                <el-form
                  v-loading="configLoading"
                  :model="tenantDomainForm"
                  label-width="120px"
                >
                  <el-form-item label="主域名">
                    <el-input
                      v-model="tenantDomainForm.primary"
                      placeholder="例如: example.com"
                    />
                  </el-form-item>
                  <el-form-item label="别名">
                    <el-input
                      v-model="tenantDomainForm.aliases"
                      type="textarea"
                      :rows="4"
                      placeholder="每行一个别名，例如：\nwww.example.com\napi.example.com\n\n保存时会自动转换为后端需要的 JSON 数组格式"
                    />
                  </el-form-item>
                  <el-form-item label="内部域名">
                    <el-input
                      v-model="tenantDomainForm.internal"
                      placeholder="例如: internal.example.com (可选)"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      size="mini"
                      :loading="configSaving"
                      @click="saveTenantDomain"
                    >保存</el-button>
                    <el-button
                      size="mini"
                      :disabled="configSaving"
                      @click="loadTenantDomain"
                    >刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="Database" name="database">
                <ServiceDatabaseConfig :tenant-id="configTenantId" />
              </el-tab-pane>

              <el-tab-pane label="FTP" name="ftp">
                <MultiFtpConfig :tenant-id="configTenantId" />
              </el-tab-pane>

              <el-tab-pane label="Storage" name="storage">
                <el-form
                  v-loading="configLoading"
                  :model="tenantStorageForm"
                  label-width="150px"
                >
                  <el-form-item label="上传配额（GB）">
                    <el-input-number
                      v-model="tenantStorageForm.uploadQuotaGb"
                      :min="-1"
                      placeholder="默认 100，-1 表示不限制"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item label="最大文件大小（MB）">
                    <el-input-number
                      v-model="tenantStorageForm.maxFileSizeMb"
                      :min="1"
                      placeholder="默认 1024"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item label="最大并发上传数">
                    <el-input-number
                      v-model="tenantStorageForm.maxConcurrentUploads"
                      :min="1"
                      placeholder="默认 10"
                      style="width: 100%"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      size="mini"
                      :loading="configSaving"
                      @click="saveTenantStorage"
                    >保存</el-button>
                    <el-button
                      size="mini"
                      :disabled="configSaving"
                      @click="loadTenantStorage"
                    >刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-drawer>

        <el-dialog
          title="激活前检查"
          :visible.sync="precheckOpen"
          width="760px"
          :close-on-click-modal="false"
        >
          <div v-loading="precheckLoading">
            <el-alert
              v-if="precheckError"
              type="error"
              :title="precheckError"
              :closable="false"
              style="margin-bottom: 12px"
            />
            <div v-if="precheckResult">
              <el-row :gutter="12" style="margin-bottom: 12px">
                <el-col :span="12">
                  <el-tag
                    :type="precheckResult.canActivate ? 'success' : 'danger'"
                  >
                    {{ precheckResult.canActivate ? "可激活" : "不可激活" }}
                  </el-tag>
                </el-col>
                <el-col :span="12" style="text-align: right">
                  <span
                    v-if="precheckResult.checkTime"
                  >检查时间：{{ precheckResult.checkTime }}</span>
                </el-col>
              </el-row>

              <el-table
                v-if="
                  precheckResult.checkedItems &&
                    precheckResult.checkedItems.length
                "
                :data="precheckResult.checkedItems"
                border
                size="mini"
                style="margin-bottom: 12px"
              >
                <el-table-column label="检查项" prop="item" width="140" />
                <el-table-column label="状态" prop="status" width="120" />
                <el-table-column label="说明" prop="message" />
              </el-table>

              <div v-if="precheckResult.errors && precheckResult.errors.length">
                <div style="margin-bottom: 6px; font-weight: 600">错误：</div>
                <el-table
                  :data="precheckResult.errors"
                  border
                  size="mini"
                  style="margin-bottom: 12px"
                >
                  <el-table-column label="字段" prop="field" width="220" />
                  <el-table-column label="错误码" prop="code" width="220" />
                  <el-table-column label="说明" prop="message" />
                </el-table>
              </div>

              <div v-else>
                <el-alert
                  type="success"
                  title="未发现必需项错误"
                  :closable="false"
                />
              </div>
            </div>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="precheckOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listTenants,
  createTenant,
  updateTenant,
  deleteTenants,
  updateTenantStatus,
  getTenantDomain,
  updateTenantDomain,
  getTenantStorage,
  updateTenantStorage,
  getTenantPrecheck,
  updateTenantCode,
  getTenantByCode
} from '@/api/platform/tenants'
import ServiceDatabaseConfig from './ServiceDatabaseConfig.vue'
import MultiFtpConfig from './MultiFtpConfig.vue'
import actionColumnMixin from '@/mixins/actionColumnMixin'

export default {
  name: 'PlatformTenants',
  mixins: [actionColumnMixin],
  components: {
    ServiceDatabaseConfig,
    MultiFtpConfig
  },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      selectedIds: [],
      open: false,
      dialogTitle: '',
      form: {},
      configOpen: false,
      configActiveTab: 'hosts',
      configSaving: false,
      configLoading: false,
      configTenantId: null,
      configTenantName: '',
      tenantDomainForm: {
        primary: '',
        aliases: '',
        internal: ''
      },
      tenantStorageForm: {
        uploadQuotaGb: 100,
        maxFileSizeMb: 1024,
        maxConcurrentUploads: 10
      },
      precheckOpen: false,
      precheckLoading: false,
      precheckError: '',
      precheckResult: null,
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        name: undefined,
        code: undefined,
        status: undefined
      },
      rules: {
        code: [
          { required: true, message: '租户编码不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 32,
            message: '长度在 2 到 32 个字符',
            trigger: 'blur'
          },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: '只能包含字母、数字、下划线和连字符',
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '租户名称不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    selectedId() {
      return this.selectedIds.length === 1 ? this.selectedIds[0] : null
    },
    tenantConfigTitle() {
      if (!this.configTenantId) return '租户配置'
      return `租户配置：${this.configTenantName}（ID: ${this.configTenantId}）`
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 操作列下拉命令路由 */
    handleTenantCommand(row, command) {
      switch (command) {
        case 'activate':
          this.handleActivate(row)
          break
        case 'status':
          this.handleChangeStatus(row)
          break
        case 'config':
          this.openTenantConfig(row)
          break
      }
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
    async getList() {
      this.loading = true
      try {
        const query = this.normalizeQueryParams(this.queryParams)
        const resp = await listTenants(query)
        if (resp && resp.code === 200 && resp.data) {
          this.list = resp.data.list || []
          this.total = resp.data.count || 0
        } else {
          this.list = []
          this.total = 0
          this.msgError((resp && resp.msg) || '获取租户列表失败')
        }
      } catch (e) {
        this.list = []
        this.total = 0
        this.msgError('获取租户列表失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
        this.scheduleCheckActionFixed()
      }
    },
    handleSelectionChange(selection) {
      this.selectedIds = (selection || [])
        .map((r) => r && r.id)
        .filter(Boolean)
    },
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.selectedIds = []
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        name: undefined,
        code: undefined,
        status: undefined
      }
      this.selectedIds = []
      this.getList()
    },
    handleAdd() {
      this.form = { status: 'inactive', code: undefined }
      this.dialogTitle = '新增租户'
      this.open = true
    },
    handleUpdate() {
      const row = (this.list || []).find((x) => x && x.id === this.selectedId)
      if (!row) {
        this.msgError('请选择要编辑的数据')
        return
      }
      this.form = { ...row }
      this.dialogTitle = '修改租户'
      this.open = true
    },
    async handleChangeStatus(row) {
      if (!row || !row.id) {
        this.msgError('数据不完整')
        return
      }
      try {
        const { value } = await this.$prompt(
          '请输入状态（active/inactive/suspended）',
          '修改状态',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: row.status || 'active'
          }
        )
        const status = (value || '').trim()
        if (!status) {
          this.msgError('状态不能为空')
          return
        }
        const resp = await updateTenantStatus(row.id, { status })
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '修改成功')
          this.getList()
        } else {
          this.msgError((resp && resp.msg) || '修改失败')
        }
      } catch (e) {
        if (e !== 'cancel') {
          this.msgError('修改失败：' + (e.message || '未知错误'))
        }
      }
    },
    openTenantConfig(row) {
      if (!row || !row.id) {
        this.msgError('请选择租户')
        return
      }
      this.configTenantId = row.id
      this.configTenantName = row.name || ''
      this.configActiveTab = 'domain'
      this.configOpen = true
      this.loadTenantDomain()
      this.loadTenantStorage()
    },
    safeStringify(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') return value
      try {
        return JSON.stringify(value, null, 2)
      } catch (e) {
        return String(value)
      }
    },
    safeParse(jsonText) {
      const text = (jsonText || '').trim()
      if (!text) return {}
      try {
        return JSON.parse(text)
      } catch (e) {
        return text
      }
    },
    async loadTenantDomain() {
      if (!this.configTenantId) return
      this.configLoading = true
      try {
        const resp = await getTenantDomain(this.configTenantId)
        if (resp && resp.code === 200 && resp.data) {
          this.tenantDomainForm.primary = resp.data.primary || ''
          this.tenantDomainForm.internal = resp.data.internal || ''
          // 处理 aliases JSON 数组
          if (Array.isArray(resp.data.aliases)) {
            this.tenantDomainForm.aliases = resp.data.aliases.join('\n')
          } else if (typeof resp.data.aliases === 'string') {
            try {
              const parsed = JSON.parse(resp.data.aliases)
              this.tenantDomainForm.aliases = Array.isArray(parsed)
                ? parsed.join('\n')
                : ''
            } catch (e) {
              this.tenantDomainForm.aliases = ''
            }
          } else {
            this.tenantDomainForm.aliases = ''
          }
        } else {
          this.msgError((resp && resp.msg) || '获取域名配置失败')
        }
      } catch (e) {
        this.msgError('获取域名配置失败：' + (e.message || '未知错误'))
      } finally {
        this.configLoading = false
      }
    },
    async saveTenantDomain() {
      if (!this.configTenantId) return
      this.configSaving = true
      try {
        // 验证主域名
        const primary = (this.tenantDomainForm.primary || '').trim()
        if (!primary) {
          this.msgError('请输入主域名')
          this.configSaving = false
          return
        }
        // 处理别名：将多行文本转换为 JSON 数组（直接发送数组，不转为字符串）
        const aliasesText = (this.tenantDomainForm.aliases || '')
          .trim()
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line)
        const internal = (this.tenantDomainForm.internal || '').trim()
        const data = {
          primary: primary,
          aliases: aliasesText, // 直接发送数组，后端会处理
          internal: internal || null
        }
        const resp = await updateTenantDomain(this.configTenantId, data)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '保存成功')
          this.loadTenantDomain()
        } else {
          this.msgError((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.msgError('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.configSaving = false
      }
    },
    async loadTenantStorage() {
      if (!this.configTenantId) return
      this.configLoading = true
      try {
        const resp = await getTenantStorage(this.configTenantId)
        if (resp && resp.code === 200 && resp.data) {
          // 从后端 JSON 提取数据填充表单
          this.tenantStorageForm.uploadQuotaGb = resp.data.uploadQuotaGb || 100
          this.tenantStorageForm.maxFileSizeMb =
            resp.data.maxFileSizeMb || 1024
          this.tenantStorageForm.maxConcurrentUploads =
            resp.data.maxConcurrentUploads || 10
        } else {
          this.msgError((resp && resp.msg) || '获取 storage 失败')
        }
      } catch (e) {
        this.msgError('获取 storage 失败：' + (e.message || '未知错误'))
      } finally {
        this.configLoading = false
      }
    },
    async saveTenantStorage() {
      if (!this.configTenantId) return
      this.configSaving = true
      try {
        // 将表单数据转换为后端需要的 JSON 格式
        const data = {
          uploadQuotaGb: this.tenantStorageForm.uploadQuotaGb || 100,
          maxFileSizeMb: this.tenantStorageForm.maxFileSizeMb || 1024,
          maxConcurrentUploads:
            this.tenantStorageForm.maxConcurrentUploads || 10
        }
        const resp = await updateTenantStorage(this.configTenantId, data)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '保存成功')
          this.loadTenantStorage()
        } else {
          this.msgError((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.msgError('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.configSaving = false
      }
    },
    async handlePrecheck(row) {
      if (!row || !row.id) {
        this.msgError('请选择租户')
        return
      }
      this.precheckOpen = true
      this.precheckLoading = true
      this.precheckError = ''
      this.precheckResult = null
      try {
        const resp = await getTenantPrecheck(row.id)
        if (resp && resp.code === 200) {
          this.precheckResult = resp.data
        } else {
          this.precheckError = (resp && resp.msg) || '检查失败'
        }
      } catch (e) {
        this.precheckError = '检查失败：' + (e.message || '未知错误')
      } finally {
        this.precheckLoading = false
      }
    },
    async handleActivate(row) {
      if (!row || !row.id) {
        this.msgError('请选择租户')
        return
      }
      if (row.status === 'active') {
        this.msgSuccess('租户已处于 active')
        return
      }
      try {
        const confirm = await this.$confirm(
          '激活前将执行检查，确认继续激活该租户吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        if (!confirm) return
      } catch (e) {
        return
      }

      this.precheckOpen = true
      this.precheckLoading = true
      this.precheckError = ''
      this.precheckResult = null
      try {
        const pre = await getTenantPrecheck(row.id)
        if (pre && pre.code === 200) {
          this.precheckResult = pre.data
        } else {
          this.precheckError = (pre && pre.msg) || '检查失败'
          return
        }
        if (!this.precheckResult || this.precheckResult.canActivate !== true) {
          this.msgError('检查未通过，无法激活')
          return
        }
        const resp = await updateTenantStatus(row.id, { status: 'active' })
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '激活成功')
          this.precheckOpen = false
          this.getList()
        } else {
          this.msgError((resp && resp.msg) || '激活失败')
        }
      } catch (e) {
        this.msgError('激活失败：' + (e.message || '未知错误'))
      } finally {
        this.precheckLoading = false
      }
    },
    cancel() {
      this.open = false
      this.form = {}
    },
    submitForm() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) return
        try {
          const payload = {
            code: this.form.code,
            name: this.form.name,
            contactName: this.form.contactName,
            contactEmail: this.form.contactEmail,
            contactPhone: this.form.contactPhone,
            billingPlan: this.form.billingPlan,
            quotaJson: this.form.quotaJson,
            remark: this.form.remark
          }
          if (this.dialogTitle === '修改租户') {
            // 编辑时：不发送 code（code 通过单独接口修改）
            const resp = await updateTenant(this.form.id, payload)
            if (resp && resp.code === 200) {
              this.msgSuccess(resp.msg || '修改成功')
              this.open = false
              this.getList()
            } else {
              this.msgError((resp && resp.msg) || '修改失败')
            }
          } else {
            // 创建时：发送 code
            const resp = await createTenant(payload)
            if (resp && resp.code === 200) {
              this.msgSuccess(resp.msg || '新增成功')
              this.open = false
              this.getList()
            } else {
              this.msgError((resp && resp.msg) || '新增失败')
            }
          }
        } catch (e) {
          this.msgError('提交失败：' + (e.message || '未知错误'))
        }
      })
    },
    async handleDelete() {
      if (!this.selectedIds.length) {
        this.msgError('请选择要删除的数据')
        return
      }
      try {
        await this.$confirm(
          `确认删除选中的 ${this.selectedIds.length} 条租户吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const resp = await deleteTenants({ ids: this.selectedIds })
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '删除成功')
          this.selectedIds = []
          this.getList()
        } else {
          this.msgError((resp && resp.msg) || '删除失败')
        }
      } catch (e) {
        if (e !== 'cancel') {
          this.msgError('删除失败：' + (e.message || '未知错误'))
        }
      }
    }
  }
}
</script>

<style scoped>
.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.password-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #409eff;
  line-height: 1.5;
}

.el-divider {
  margin: 16px 0;
}
</style>
