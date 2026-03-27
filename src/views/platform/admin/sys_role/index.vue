<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #title>
            <div style="line-height: 1.6;">
              <strong>平台角色说明</strong><br>
              此处管理的是平台控制台的角色权限，用于控制平台管理员的访问权限。<br>
              <span style="color: #E6A23C;">⚠️ 注意：租户业务系统的角色请在各租户系统中独立管理。</span>
            </div>
          </template>
        </el-alert>
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="权限字符" prop="roleKey">
            <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="角色状态" clearable size="small" style="width: 160px">
              <el-option label="启用" value="2" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysRole:add']" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysRole:update']" type="success" icon="el-icon-edit" size="mini" :disabled="!selectedId" @click="handleUpdate">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-permisaction="['admin:sysRole:remove']" type="danger" icon="el-icon-delete" size="mini" :disabled="selectedIds.length === 0" @click="handleDelete">删除</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="roleId" width="90" />
          <el-table-column label="名称" prop="roleName" min-width="160" :show-overflow-tooltip="true" />
          <el-table-column label="权限字符" prop="roleKey" min-width="160" :show-overflow-tooltip="true" />
          <el-table-column label="排序" prop="roleSort" width="100" />
          <el-table-column label="状态" width="90">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-value="2" inactive-value="1" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createdAt" width="160" :show-overflow-tooltip="true" />
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageIndex" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <el-dialog :title="dialogTitle" :visible.sync="open" width="560px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="权限字符" prop="roleKey">
              <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
            </el-form-item>
            <el-form-item label="排序" prop="roleSort">
              <el-input-number v-model="form.roleSort" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="2" />
                <el-option label="停用" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
            </el-form-item>
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
import { listRole, getRole, addRole, updateRole, delRole, changeRoleStatus } from '@/api/platform/admin/sys-role'

export default {
  name: 'PlatformSysRoleManage',
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
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      rules: {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }]
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
        const resp = await listRole(this.normalizeQueryParams(this.queryParams))
        if (resp && resp.code === 200 && resp.data) {
          this.list = resp.data.list || []
          this.total = resp.data.count || 0
        } else {
          this.list = []
          this.total = 0
          this.msgError((resp && resp.msg) || '获取角色列表失败')
        }
      } catch (e) {
        this.list = []
        this.total = 0
        this.msgError('获取角色列表失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(selection) {
      this.selectedIds = (selection || []).map((r) => r && r.roleId).filter(Boolean)
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
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      }
      this.selectedIds = []
      this.getList()
    },
    handleAdd() {
      this.form = { status: '2', roleSort: 0 }
      this.dialogTitle = '新增角色'
      this.open = true
    },
    async handleUpdate() {
      if (!this.selectedId) {
        this.msgError('请选择要编辑的角色')
        return
      }
      try {
        const resp = await getRole(this.selectedId)
        if (resp && resp.code === 200) {
          this.form = resp.data || {}
          this.dialogTitle = '修改角色'
          this.open = true
        } else {
          this.msgError((resp && resp.msg) || '获取角色详情失败')
        }
      } catch (e) {
        this.msgError('获取角色详情失败：' + (e.message || '未知错误'))
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
          if (this.form && this.form.roleId) {
            resp = await updateRole(this.form, this.form.roleId)
          } else {
            resp = await addRole(this.form)
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
        this.msgError('请选择要删除的角色')
        return
      }
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedIds.length} 个角色吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const resp = await delRole({ ids: this.selectedIds })
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
    handleStatusChange(row) {
      const roleId = row && row.roleId
      const status = row && row.status
      if (!roleId) return
      changeRoleStatus(roleId, status).then((resp) => {
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '更新成功')
        } else {
          this.msgError((resp && resp.msg) || '更新失败')
        }
      }).catch((e) => {
        this.msgError('更新失败：' + (e.message || '未知错误'))
      })
    }
  }
}
</script>
