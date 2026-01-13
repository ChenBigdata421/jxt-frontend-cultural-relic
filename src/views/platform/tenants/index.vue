<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="72px">
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
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small" style="width: 160px">
              <el-option label="active" value="active" />
              <el-option label="inactive" value="inactive" />
              <el-option label="suspended" value="suspended" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:tenants:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:tenants:edit']" type="success" icon="el-icon-edit" size="mini" :disabled="!selectedId" @click="handleUpdate">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:tenants:remove']" type="danger" icon="el-icon-delete" size="mini" :disabled="selectedIds.length === 0" @click="handleDelete">删除</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column label="名称" prop="name" min-width="200" :show-overflow-tooltip="true" />
          <el-table-column label="状态" prop="status" width="120" />
          <el-table-column label="联系人" prop="contactName" min-width="120" :show-overflow-tooltip="true" />
          <el-table-column label="邮箱" prop="contactEmail" min-width="160" :show-overflow-tooltip="true" />
          <el-table-column label="电话" prop="contactPhone" min-width="140" :show-overflow-tooltip="true" />
          <el-table-column label="更新时间" prop="updatedAt" width="160" :show-overflow-tooltip="true" />
          <el-table-column label="操作" width="220" fixed="right">
            <template slot-scope="scope">
              <el-button v-permisaction="['platform:tenants:status']" size="mini" type="text" icon="el-icon-view" @click="handlePrecheck(scope.row)">检查</el-button>
              <el-button v-permisaction="['platform:tenants:status']" size="mini" type="text" icon="el-icon-circle-check" :disabled="scope.row && scope.row.status === 'active'" @click="handleActivate(scope.row)">激活</el-button>
              <el-button v-permisaction="['platform:tenants:status']" size="mini" type="text" icon="el-icon-refresh" @click="handleChangeStatus(scope.row)">状态</el-button>
              <el-button v-permisaction="['platform:tenants:config']" size="mini" type="text" icon="el-icon-setting" @click="openTenantConfig(scope.row)">配置</el-button>
              <el-button v-permisaction="['platform:tenants:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <el-dialog :title="dialogTitle" :visible.sync="open" width="760px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="110px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="租户ID" prop="id">
                  <el-input v-model="form.id" placeholder="请输入租户ID" :disabled="dialogTitle === '修改租户'" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="租户名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入租户名称" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="状态">
                  <el-select v-model="form.status" placeholder="创建后默认 inactive（配置完毕后请先【检查】再【激活】）" style="width: 100%" disabled>
                    <el-option label="active" value="active" />
                    <el-option label="inactive" value="inactive" />
                    <el-option label="suspended" value="suspended" />
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
                  <el-input v-model="form.quotaJson" type="textarea" :rows="3" placeholder="可选" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <el-drawer :title="tenantConfigTitle" :visible.sync="configOpen" size="60%" :with-header="true" :wrapper-closable="false">
          <div style="padding: 0 16px;">
            <el-tabs v-model="configActiveTab" type="border-card">
              <el-tab-pane label="Hosts" name="hosts">
                <el-form :model="tenantHostsForm" label-width="120px" v-loading="configLoading">
                  <el-form-item label="域名列表">
                    <el-input v-model="tenantHostsForm.text" type="textarea" :rows="12" placeholder="每行一个域名，例如：\n1.1.com\napi.1.1.com\nwww.example.com\n\n保存时会自动转换为后端需要的 JSON 格式" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" size="mini" :loading="configSaving" @click="saveTenantHosts">保存</el-button>
                    <el-button size="mini" :disabled="configSaving" @click="loadTenantHosts">刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="Database" name="database">
                <el-form :model="tenantDatabaseForm" label-width="150px" v-loading="configLoading">
                  <el-form-item label="数据库驱动">
                    <el-select v-model="tenantDatabaseForm.driver" placeholder="请选择数据库驱动" style="width: 100%">
                      <el-option label="PostgreSQL" value="postgres" />
                      <el-option label="MySQL" value="mysql" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="连接字符串">
                    <el-input v-model="tenantDatabaseForm.source" type="textarea" :rows="3" placeholder="示例（PostgreSQL）：host=localhost port=5432 user=tenant_user password=xxx dbname=tenant_db sslmode=disable\n示例（MySQL）：tenant_user:xxx@tcp(localhost:3306)/tenant_db?charset=utf8mb4&parseTime=True" />
                  </el-form-item>
                  <el-form-item label="最大连接数">
                    <el-input-number v-model="tenantDatabaseForm.maxOpenConns" :min="1" :max="100" placeholder="默认 10" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="最大空闲连接数">
                    <el-input-number v-model="tenantDatabaseForm.maxIdleConns" :min="1" :max="50" placeholder="默认 5" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="空闲超时（秒）">
                    <el-input-number v-model="tenantDatabaseForm.connMaxIdleTime" :min="0" placeholder="默认 300" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="连接最大生命周期（秒）">
                    <el-input-number v-model="tenantDatabaseForm.connMaxLifeTime" :min="0" placeholder="默认 3600" style="width: 100%" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" size="mini" :loading="configSaving" @click="saveTenantDatabase">保存</el-button>
                    <el-button size="mini" :disabled="configSaving" @click="loadTenantDatabase">刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="FTP" name="ftp">
                <el-form :model="tenantFtpForm" label-width="120px" v-loading="configLoading">
                  <el-form-item label="FTP 用户名">
                    <el-input v-model="tenantFtpForm.username" placeholder="请输入 FTP 用户名" />
                  </el-form-item>
                  <el-form-item label="FTP 密码">
                    <el-input v-model="tenantFtpForm.password" type="password" show-password placeholder="请输入 FTP 密码" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" size="mini" :loading="configSaving" @click="saveTenantFtp">保存</el-button>
                    <el-button size="mini" :disabled="configSaving" @click="loadTenantFtp">刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="Storage" name="storage">
                <el-form :model="tenantStorageForm" label-width="150px" v-loading="configLoading">
                  <el-form-item label="上传配额（GB）">
                    <el-input-number v-model="tenantStorageForm.uploadQuotaGb" :min="-1" placeholder="默认 100，-1 表示不限制" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="最大文件大小（MB）">
                    <el-input-number v-model="tenantStorageForm.maxFileSizeMb" :min="1" placeholder="默认 1024" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="最大并发上传数">
                    <el-input-number v-model="tenantStorageForm.maxConcurrentUploads" :min="1" placeholder="默认 10" style="width: 100%" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" size="mini" :loading="configSaving" @click="saveTenantStorage">保存</el-button>
                    <el-button size="mini" :disabled="configSaving" @click="loadTenantStorage">刷新</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-drawer>

        <el-dialog title="激活前检查" :visible.sync="precheckOpen" width="760px" :close-on-click-modal="false">
          <div v-loading="precheckLoading">
            <el-alert v-if="precheckError" type="error" :title="precheckError" :closable="false" style="margin-bottom: 12px;" />
            <div v-if="precheckResult">
              <el-row :gutter="12" style="margin-bottom: 12px;">
                <el-col :span="12">
                  <el-tag :type="precheckResult.canActivate ? 'success' : 'danger'">
                    {{ precheckResult.canActivate ? '可激活' : '不可激活' }}
                  </el-tag>
                </el-col>
                <el-col :span="12" style="text-align: right;">
                  <span v-if="precheckResult.checkTime">检查时间：{{ precheckResult.checkTime }}</span>
                </el-col>
              </el-row>

              <el-table v-if="precheckResult.checkedItems && precheckResult.checkedItems.length" :data="precheckResult.checkedItems" border size="mini" style="margin-bottom: 12px;">
                <el-table-column label="检查项" prop="item" width="140" />
                <el-table-column label="状态" prop="status" width="120" />
                <el-table-column label="说明" prop="message" />
              </el-table>

              <div v-if="precheckResult.errors && precheckResult.errors.length">
                <div style="margin-bottom: 6px; font-weight: 600;">错误：</div>
                <el-table :data="precheckResult.errors" border size="mini" style="margin-bottom: 12px;">
                  <el-table-column label="字段" prop="field" width="220" />
                  <el-table-column label="错误码" prop="code" width="220" />
                  <el-table-column label="说明" prop="message" />
                </el-table>
              </div>

              <div v-else>
                <el-alert type="success" title="未发现必需项错误" :closable="false" />
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
  getTenantHosts,
  updateTenantHosts,
  getTenantDatabase,
  updateTenantDatabase,
  getTenantFtp,
  updateTenantFtp,
  getTenantStorage,
  updateTenantStorage,
  getTenantPrecheck
} from '@/api/platform/tenants'

export default {
  name: 'PlatformTenants',
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
      tenantHostsForm: { text: '' },
      tenantDatabaseForm: {
        driver: 'postgres',
        source: '',
        maxOpenConns: 10,
        maxIdleConns: 5,
        connMaxIdleTime: 300,
        connMaxLifeTime: 3600
      },
      tenantFtpForm: {
        username: '',
        password: ''
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
        status: undefined
      },
      rules: {
        id: [{ required: true, message: '租户ID不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '租户名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
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
      }
    },
    handleSelectionChange(selection) {
      this.selectedIds = (selection || []).map((r) => r && r.id).filter(Boolean)
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
        status: undefined
      }
      this.selectedIds = []
      this.getList()
    },
    handleAdd() {
      this.form = { status: 'inactive' }
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
        const { value } = await this.$prompt('请输入状态（active/inactive/suspended）', '修改状态', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: row.status || 'active'
        })
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
      this.configActiveTab = 'hosts'
      this.configOpen = true
      this.loadTenantHosts()
      this.loadTenantDatabase()
      this.loadTenantFtp()
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
    normalizeHostsPayload(input) {
      // 后端期望：{ hosts: [{ host, hostType(frontend|api), isPrimary }] }
      // 兼容：用户仅输入 "1.1.com" 或输入多行域名
      if (input && typeof input === 'object' && Array.isArray(input.hosts)) {
        return input
      }
      if (typeof input === 'string') {
        const lines = input
          .split(/\r?\n/)
          .map((x) => (x || '').trim())
          .filter(Boolean)
        if (!lines.length) return null
        const hosts = lines.map((h, idx) => ({
          host: h,
          hostType: 'frontend',
          isPrimary: idx === 0
        }))
        return { hosts }
      }
      return null
    },
    async loadTenantHosts() {
      if (!this.configTenantId) return
      this.configLoading = true
      try {
        const resp = await getTenantHosts(this.configTenantId)
        console.log('loadTenantHosts 响应:', resp)
        if (resp && resp.code === 200) {
          // 从后端 JSON 提取域名列表，转换为纯文本显示
          let hosts = []
          if (resp.data) {
            // 尝试多种可能的数据结构
            if (Array.isArray(resp.data.hosts)) {
              hosts = resp.data.hosts
            } else if (Array.isArray(resp.data)) {
              hosts = resp.data
            } else if (typeof resp.data === 'string') {
              // 如果是字符串，尝试解析 JSON
              try {
                const parsed = JSON.parse(resp.data)
                hosts = parsed.hosts || []
              } catch (e) {
                console.error('解析 hosts JSON 失败:', e)
              }
            }
          }
          console.log('提取的 hosts:', hosts)
          const hostList = hosts.map(h => {
            if (typeof h === 'string') return h
            if (h && h.host) return h.host
            return ''
          }).filter(h => h)
          console.log('转换后的域名列表:', hostList)
          this.tenantHostsForm.text = hostList.join('\n')
        } else {
          this.msgError((resp && resp.msg) || '获取 hosts 失败')
        }
      } catch (e) {
        console.error('loadTenantHosts 错误:', e)
        this.msgError('获取 hosts 失败：' + (e.message || '未知错误'))
      } finally {
        this.configLoading = false
      }
    },
    async saveTenantHosts() {
      if (!this.configTenantId) return
      this.configSaving = true
      try {
        // 将纯文本域名列表转换为后端需要的 JSON 格式
        const text = (this.tenantHostsForm.text || '').trim()
        if (!text) {
          this.msgError('请至少输入一个域名')
          this.configSaving = false
          return
        }
        const lines = text.split('\n').map(line => line.trim()).filter(line => line)
        if (lines.length === 0) {
          this.msgError('请至少输入一个域名')
          this.configSaving = false
          return
        }
        const hosts = lines.map((host, idx) => ({
          host: host,
          hostType: 'frontend',
          isPrimary: idx === 0
        }))
        const data = { hosts }
        const resp = await updateTenantHosts(this.configTenantId, data)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '保存成功')
          this.loadTenantHosts()
        } else {
          this.msgError((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.msgError('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.configSaving = false
      }
    },
    async loadTenantDatabase() {
      if (!this.configTenantId) return
      this.configLoading = true
      try {
        const resp = await getTenantDatabase(this.configTenantId)
        if (resp && resp.code === 200 && resp.data) {
          // 从后端 JSON 提取数据填充表单
          this.tenantDatabaseForm.driver = resp.data.driver || 'postgres'
          this.tenantDatabaseForm.source = resp.data.source || ''
          this.tenantDatabaseForm.maxOpenConns = resp.data.maxOpenConns || 10
          this.tenantDatabaseForm.maxIdleConns = resp.data.maxIdleConns || 5
          this.tenantDatabaseForm.connMaxIdleTime = resp.data.connMaxIdleTime || 300
          this.tenantDatabaseForm.connMaxLifeTime = resp.data.connMaxLifeTime || 3600
        } else {
          this.msgError((resp && resp.msg) || '获取 database 失败')
        }
      } catch (e) {
        this.msgError('获取 database 失败：' + (e.message || '未知错误'))
      } finally {
        this.configLoading = false
      }
    },
    async saveTenantDatabase() {
      if (!this.configTenantId) return
      this.configSaving = true
      try {
        // 验证必填字段
        if (!this.tenantDatabaseForm.driver) {
          this.msgError('请选择数据库驱动')
          this.configSaving = false
          return
        }
        if (!this.tenantDatabaseForm.source) {
          this.msgError('请输入连接字符串')
          this.configSaving = false
          return
        }
        // 将表单数据转换为后端需要的 JSON 格式
        const data = {
          driver: this.tenantDatabaseForm.driver,
          source: this.tenantDatabaseForm.source,
          maxOpenConns: this.tenantDatabaseForm.maxOpenConns || 10,
          maxIdleConns: this.tenantDatabaseForm.maxIdleConns || 5,
          connMaxIdleTime: this.tenantDatabaseForm.connMaxIdleTime || 300,
          connMaxLifeTime: this.tenantDatabaseForm.connMaxLifeTime || 3600
        }
        const resp = await updateTenantDatabase(this.configTenantId, data)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '保存成功')
          this.loadTenantDatabase()
        } else {
          this.msgError((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.msgError('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.configSaving = false
      }
    },
    async loadTenantFtp() {
      if (!this.configTenantId) return
      this.configLoading = true
      try {
        const resp = await getTenantFtp(this.configTenantId)
        if (resp && resp.code === 200 && resp.data) {
          // 从后端 JSON 提取数据填充表单
          this.tenantFtpForm.username = resp.data.username || ''
          this.tenantFtpForm.password = resp.data.password || ''
        } else {
          this.msgError((resp && resp.msg) || '获取 ftp 失败')
        }
      } catch (e) {
        this.msgError('获取 ftp 失败：' + (e.message || '未知错误'))
      } finally {
        this.configLoading = false
      }
    },
    async saveTenantFtp() {
      if (!this.configTenantId) return
      this.configSaving = true
      try {
        // 验证必填字段
        if (!this.tenantFtpForm.username) {
          this.msgError('请输入 FTP 用户名')
          this.configSaving = false
          return
        }
        if (!this.tenantFtpForm.password) {
          this.msgError('请输入 FTP 密码')
          this.configSaving = false
          return
        }
        // 将表单数据转换为后端需要的 JSON 格式
        const data = {
          username: this.tenantFtpForm.username,
          password: this.tenantFtpForm.password
        }
        const resp = await updateTenantFtp(this.configTenantId, data)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '保存成功')
          this.loadTenantFtp()
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
          this.tenantStorageForm.maxFileSizeMb = resp.data.maxFileSizeMb || 1024
          this.tenantStorageForm.maxConcurrentUploads = resp.data.maxConcurrentUploads || 10
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
          maxConcurrentUploads: this.tenantStorageForm.maxConcurrentUploads || 10
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
        const confirm = await this.$confirm('激活前将执行检查，确认继续激活该租户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
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
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        try {
          const payload = {
            id: this.form.id,
            name: this.form.name,
            contactName: this.form.contactName,
            contactEmail: this.form.contactEmail,
            contactPhone: this.form.contactPhone,
            billingPlan: this.form.billingPlan,
            quotaJson: this.form.quotaJson,
            remark: this.form.remark
          }
          if (this.form && this.form.id && this.dialogTitle === '修改租户') {
            const resp = await updateTenant(this.form.id, payload)
            if (resp && resp.code === 200) {
              this.msgSuccess(resp.msg || '修改成功')
              this.open = false
              this.getList()
            } else {
              this.msgError((resp && resp.msg) || '修改失败')
            }
          } else {
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
        await this.$confirm(`确认删除选中的 ${this.selectedIds.length} 条租户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
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
