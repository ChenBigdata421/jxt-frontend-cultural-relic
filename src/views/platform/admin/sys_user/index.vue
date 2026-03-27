<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #title>
            <div style="line-height: 1.6;">
              <strong>平台管理员说明</strong><br>
              此处管理的是平台控制台的管理员账号，用于管理租户和平台配置。<br>
              <span style="color: #E6A23C;">⚠️ 注意：租户业务系统的用户请在各租户系统中独立管理。</span>
            </div>
          </template>
        </el-alert>
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="登录名" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入登录名" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable size="small" style="width: 160px">
              <el-option label="启用" :value="2" />
              <el-option label="停用" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysUser:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysUser:edit']" type="success" icon="el-icon-edit" size="mini" :disabled="!selectedId" @click="handleUpdate">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysUser:remove']" type="danger" icon="el-icon-delete" size="mini" :disabled="selectedIds.length === 0" @click="handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysUser:import']" type="warning" icon="el-icon-download" size="mini" @click="downloadTemplate">模板</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="userId" width="90" />
          <el-table-column label="登录名" prop="userName" min-width="140" :show-overflow-tooltip="true" />
          <el-table-column label="警号" prop="policeNo" min-width="120" :show-overflow-tooltip="true" />
          <el-table-column label="手机号" prop="phone" min-width="140" :show-overflow-tooltip="true" />
          <el-table-column label="邮箱" prop="email" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column label="状态" prop="status" width="90" />
          <el-table-column label="创建时间" prop="createdAt" width="160" :show-overflow-tooltip="true" />
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <el-dialog :title="dialogTitle" :visible.sync="open" width="640px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="90px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="登录名" prop="userName">
                  <el-input v-model="form.userName" placeholder="请输入登录名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="警号" prop="policeNo">
                  <el-input v-model="form.policeNo" placeholder="请输入警号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                    <el-option label="启用" :value="2" />
                    <el-option label="停用" :value="1" />
                  </el-select>
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
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listUser, getUser, addUser, updateUser, delUser, importTemplate } from '@/api/platform/admin/sys-user'

export default {
  name: 'PlatformSysUserManage',
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
        userName: undefined,
        phone: undefined,
        status: undefined
      },
      rules: {
        userName: [{ required: true, message: '登录名不能为空', trigger: 'blur' }]
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
        const resp = await listUser(this.normalizeQueryParams(this.queryParams))
        if (resp && resp.code === 200 && resp.data) {
          this.list = resp.data.list || []
          this.total = resp.data.count || 0
        } else {
          this.list = []
          this.total = 0
          this.msgError((resp && resp.msg) || '获取用户列表失败')
        }
      } catch (e) {
        this.list = []
        this.total = 0
        this.msgError('获取用户列表失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(selection) {
      this.selectedIds = (selection || []).map((r) => r && r.userId).filter(Boolean)
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
        userName: undefined,
        phone: undefined,
        status: undefined
      }
      this.selectedIds = []
      this.getList()
    },
    handleAdd() {
      this.form = { status: 2 }
      this.dialogTitle = '新增用户'
      this.open = true
    },
    async handleUpdate() {
      if (!this.selectedId) {
        this.msgError('请选择要编辑的用户')
        return
      }
      try {
        const resp = await getUser(this.selectedId)
        if (resp && resp.code === 200) {
          this.form = resp.data || {}
          this.dialogTitle = '修改用户'
          this.open = true
        } else {
          this.msgError((resp && resp.msg) || '获取用户详情失败')
        }
      } catch (e) {
        this.msgError('获取用户详情失败：' + (e.message || '未知错误'))
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
          let resp
          if (this.form && this.form.userId) {
            resp = await updateUser(this.form)
          } else {
            resp = await addUser(this.form)
          }
          if (resp && resp.code === 200) {
            this.msgSuccess(resp.msg || '操作成功')
            this.open = false
            this.getList()
          } else {
            this.msgError((resp && resp.msg) || '操作失败')
          }
        } catch (e) {
          this.msgError('提交失败：' + (e.message || '未知错误'))
        }
      })
    },
    async handleDelete() {
      if (!this.selectedIds.length) {
        this.msgError('请选择要删除的用户')
        return
      }
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const resp = await delUser({ ids: this.selectedIds })
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
    },
    async downloadTemplate() {
      try {
        const blobData = await importTemplate()
        const blob = new Blob([blobData], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '用户导入模板.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (e) {
        this.msgError('下载失败：' + (e.message || '未知错误'))
      }
    }
  }
}
</script>
