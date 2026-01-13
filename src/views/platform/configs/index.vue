<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #title>
            <div style="line-height: 1.6;">
              <strong>平台配置说明</strong><br>
              此处管理平台控制台的所有配置项，包括：<br>
              • <strong>控制台配置</strong>（console_*）：系统名称、logo、皮肤样式、初始密码等<br>
              • <strong>基础设施配置</strong>（infra_*）：etcd 地址、消息队列、数据库连接等<br>
              • <strong>默认配额</strong>（quota_*）：新租户的默认存储配额、并发数等<br>
              <span style="color: #E6A23C;">⚠️ 注意：租户的品牌配置（系统名称、logo等）应在各租户系统中独立管理。</span>
            </div>
          </template>
        </el-alert>
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="72px">
          <el-form-item label="名称" prop="configName">
            <el-input v-model="queryParams.configName" placeholder="请输入名称" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="键名" prop="configKey">
            <el-input v-model="queryParams.configKey" placeholder="请输入键名" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="类型" prop="configType">
            <el-input v-model="queryParams.configType" placeholder="请输入类型" clearable size="small" style="width: 160px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:configs:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:configs:edit']" type="success" icon="el-icon-edit" size="mini" :disabled="!selectedId" @click="handleUpdate">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['platform:configs:remove']" type="danger" icon="el-icon-delete" size="mini" :disabled="selectedIds.length === 0" @click="handleDelete">删除</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="id" width="80" />
          <el-table-column label="名称" prop="configName" min-width="160" :show-overflow-tooltip="true" />
          <el-table-column label="键名" prop="configKey" min-width="200" :show-overflow-tooltip="true" />
          <el-table-column label="类型" prop="configType" width="120" />
          <el-table-column label="前端可见" prop="isFrontend" width="100" />
          <el-table-column label="更新时间" prop="updatedAt" width="160" :show-overflow-tooltip="true" />
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <el-dialog :title="dialogTitle" :visible.sync="open" width="680px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="名称" prop="configName">
                  <el-input v-model="form.configName" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="键名" prop="configKey">
                  <el-input v-model="form.configKey" placeholder="请输入键名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="类型" prop="configType">
                  <el-input v-model="form.configType" placeholder="请输入类型" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="前端可见" prop="isFrontend">
                  <el-switch v-model="form.isFrontend" :active-value="1" :inactive-value="2" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="值" prop="configValue">
                  <el-input v-model="form.configValue" type="textarea" :rows="4" placeholder="请输入值" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listPlatformConfigs,
  createPlatformConfig,
  updatePlatformConfig,
  deletePlatformConfigs
} from '@/api/platform/configs'

export default {
  name: 'PlatformConfigs',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      selectedIds: [],
      open: false,
      dialogTitle: '',
      form: {},
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        configType: undefined,
        isFrontend: undefined
      },
      rules: {
        configName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        configKey: [{ required: true, message: '键名不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    selectedId() {
      return this.selectedIds.length === 1 ? this.selectedIds[0] : null
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
        const resp = await listPlatformConfigs(query)
        if (resp && resp.code === 200 && resp.data) {
          this.list = resp.data.list || []
          this.total = resp.data.count || 0
        } else {
          this.list = []
          this.total = 0
          this.msgError((resp && resp.msg) || '获取列表失败')
        }
      } catch (e) {
        this.list = []
        this.total = 0
        this.msgError('获取列表失败：' + (e.message || '未知错误'))
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
        configName: undefined,
        configKey: undefined,
        configType: undefined,
        isFrontend: undefined
      }
      this.selectedIds = []
      this.getList()
    },
    handleAdd() {
      this.form = { isFrontend: 2 }
      this.dialogTitle = '新增平台配置'
      this.open = true
    },
    handleUpdate() {
      const row = (this.list || []).find((x) => x && x.id === this.selectedId)
      if (!row) {
        this.msgError('请选择要编辑的数据')
        return
      }
      this.form = { ...row }
      this.dialogTitle = '修改平台配置'
      this.open = true
    },
    cancel() {
      this.open = false
      this.form = {}
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        try {
          if (this.form && this.form.id) {
            const resp = await updatePlatformConfig(this.form.id, this.form)
            if (resp && resp.code === 200) {
              this.msgSuccess(resp.msg || '修改成功')
              this.open = false
              this.getList()
            } else {
              this.msgError((resp && resp.msg) || '修改失败')
            }
          } else {
            const resp = await createPlatformConfig(this.form)
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
        await this.$confirm(`确认删除选中的 ${this.selectedIds.length} 条配置吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const resp = await deletePlatformConfigs({ ids: this.selectedIds })
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
