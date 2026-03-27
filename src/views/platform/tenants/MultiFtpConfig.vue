<template>
  <div class="multi-ftp-config">
    <!-- Header Section -->
    <div class="ftp-header">
      <div class="ftp-header-left">
        <div class="ftp-title-group">
          <h3 class="ftp-title">FTP 配置</h3>
          <span class="ftp-count">{{ ftpList.length }} 个配置</span>
        </div>
        <p class="ftp-subtitle">为当前租户配置多个 FTP 账号，用于文件上传和下载</p>
      </div>
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="medium"
        class="create-btn"
        @click="openCreateDialog"
      >
        新增配置
      </el-button>
    </div>

    <!-- FTP Table -->
    <div v-loading="loading" class="ftp-table-wrapper">
      <el-table
        :data="ftpList"
        border
        stripe
        class="ftp-table"
        :empty-text="emptyText"
      >
        <el-table-column type="index" label="#" width="50" align="center" />

        <el-table-column label="用户名" min-width="160">
          <template slot-scope="scope">
            <div class="username-cell">
              <i class="el-icon-user username-icon" />
              <span class="username-text">{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="200">
          <template slot-scope="scope">
            <span class="description-text">{{ scope.row.description || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="active"
              inactive-value="inactive"
              :loading="scope.row.statusChanging"
              class="status-switch"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <span class="time-text">{{ formatTime(scope.row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-tooltip content="测试连接" placement="top">
                <el-button
                  type="text"
                  icon="el-icon-circle-check"
                  class="action-btn test-btn"
                  :loading="scope.row.testing"
                  @click="handleTestConnection(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="编辑" placement="top">
                <el-button
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn edit-btn"
                  @click="openEditDialog(scope.row)"
                />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn delete-btn"
                  @click="handleDelete(scope.row)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!loading && ftpList.length === 0" class="empty-state">
        <i class="el-icon-folder-opened empty-icon" />
        <p class="empty-text">暂无 FTP 配置</p>
        <p class="empty-hint">点击上方"新增配置"按钮创建第一个 FTP 账号</p>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :before-close="handleDialogClose"
      width="500px"
      class="ftp-dialog"
      append-to-body
      :modal-append-to-body="true"
    >
      <el-form
        ref="ftpForm"
        :model="formData"
        :rules="formRules"
        label-width="90px"
        class="ftp-form"
      >
        <!-- Username -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入 FTP 用户名（3-64字符）"
            :maxlength="64"
            :disabled="dialogMode === 'edit'"
            clearable
          >
            <template slot="prefix">
              <i class="el-icon-user input-icon" />
            </template>
          </el-input>
          <div v-if="dialogMode === 'edit'" class="form-tip">用户名创建后不可修改</div>
        </el-form-item>

        <!-- Password (only show when creating) -->
        <el-form-item v-if="dialogMode !== 'edit'" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            placeholder="请输入 FTP 密码（至少6字符）"
            :maxlength="64"
          >
            <template slot="prefix">
              <i class="el-icon-lock input-icon" />
            </template>
          </el-input>
        </el-form-item>

        <!-- Change Password Section (only show when editing) -->
        <el-form-item v-else label="修改密码">
          <el-checkbox v-model="formData.changePassword">修改密码</el-checkbox>
          <el-input
            v-if="formData.changePassword"
            v-model="formData.password"
            type="password"
            show-password
            placeholder="请输入新密码（至少6字符）"
            :maxlength="64"
            class="password-input"
          >
            <template slot="prefix">
              <i class="el-icon-lock input-icon" />
            </template>
          </el-input>
          <div v-if="!formData.changePassword" class="form-tip">
            密码已加密存储，留空则不修改
          </div>
        </el-form-item>

        <!-- Description -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息（可选）"
            :maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <!-- Status (only show when editing) -->
        <el-form-item v-if="dialogMode === 'edit'" label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">
              <span class="status-radio-label">
                <i class="el-icon-circle-check" />
                活跃
              </span>
            </el-radio>
            <el-radio label="inactive">
              <span class="status-radio-label">
                <i class="el-icon-circle-close" />
                禁用
              </span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="handleDialogClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          size="medium"
          @click="handleSubmit"
        >
          {{ dialogMode === 'edit' ? '保存' : '创建' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- Delete Confirm Dialog -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      :close-on-click-modal="false"
      width="400px"
      class="delete-dialog"
      append-to-body
      :modal-append-to-body="true"
    >
      <div class="delete-content">
        <i class="el-icon-warning-outline delete-icon" />
        <p class="delete-text">确定要删除 FTP 配置 <strong>"{{ deletingItem && deletingItem.username }}"</strong> 吗？</p>
        <p class="delete-hint">删除后将无法恢复，请谨慎操作</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="medium" @click="deleteDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="deleting"
          size="medium"
          @click="confirmDelete"
        >
          确认删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTenantFtpConfigs,
  createTenantFtpConfig,
  updateTenantFtpConfig,
  deleteTenantFtpConfig,
  testTenantFtpConfig
} from '@/api/platform/tenants'

export default {
  name: 'MultiFtpConfig',
  props: {
    tenantId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      ftpList: [],
      emptyText: '暂无数据',

      // Dialog state
      dialogVisible: false,
      dialogMode: 'create', // 'create' or 'edit'
      submitting: false,

      // Form data
      formData: {
        username: '',
        password: '',
        description: '',
        status: 'active',
        changePassword: false
      },

      // Form validation rules
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 64, message: '用户名长度在 3 到 64 个字符', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: '用户名只能包含字母、数字、下划线和连字符',
            trigger: 'blur'
          }
        ],
        password: [{ validator: this.validatePassword, trigger: 'blur' }],
        description: [
          { max: 255, message: '描述最多 255 个字符', trigger: 'blur' }
        ]
      },

      // Delete dialog
      deleteDialogVisible: false,
      deletingItem: null,
      deleting: false
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'create' ? '新增 FTP 配置' : '编辑 FTP 配置'
    }
  },
  watch: {
    tenantId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadFtpList()
        }
      }
    }
  },
  methods: {
    // Custom validation for password
    validatePassword(rule, value, callback) {
      const isEditing = this.dialogMode === 'edit'
      if (!isEditing && !value) {
        callback(new Error('密码不能为空'))
      } else if (value && value.length < 6) {
        callback(new Error('密码至少需要6个字符'))
      } else {
        callback()
      }
    },

    // Load FTP configuration list
    async loadFtpList() {
      if (!this.tenantId) return

      this.loading = true
      try {
        const resp = await listTenantFtpConfigs(this.tenantId)
        if (resp && resp.code === 200 && resp.data) {
          this.ftpList = (resp.data.items || []).map(item => ({
            ...item,
            statusChanging: false
          }))
        } else {
          this.ftpList = []
          this.$message.error((resp && resp.msg) || '获取 FTP 配置失败')
        }
      } catch (e) {
        this.ftpList = []
        this.$message.error('获取 FTP 配置失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    // Open create dialog
    openCreateDialog() {
      this.dialogMode = 'create'
      this.dialogVisible = true
      this.resetForm()
      this.$nextTick(() => {
        if (this.$refs.ftpForm) {
          this.$refs.ftpForm.clearValidate()
        }
      })
    },

    // Open edit dialog
    openEditDialog(row) {
      this.dialogMode = 'edit'
      this.dialogVisible = true
      this.formData = {
        username: row.username,
        password: '',
        description: row.description || '',
        status: row.status,
        changePassword: false
      }
      this.$nextTick(() => {
        if (this.$refs.ftpForm) {
          this.$refs.ftpForm.clearValidate()
        }
      })
    },

    // Handle dialog close
    handleDialogClose() {
      this.dialogVisible = false
      this.resetForm()
    },

    // Reset form
    resetForm() {
      this.formData = {
        username: '',
        password: '',
        description: '',
        status: 'active',
        changePassword: false
      }
    },

    // Handle form submit
    handleSubmit() {
      this.$refs.ftpForm.validate(async(valid) => {
        if (!valid) return

        this.submitting = true
        try {
          if (this.dialogMode === 'edit') {
            await this.updateFtpConfig()
          } else {
            await this.createFtpConfig()
          }
        } finally {
          this.submitting = false
        }
      })
    },

    // Create FTP config
    async createFtpConfig() {
      const data = {
        username: this.formData.username,
        password: this.formData.password,
        description: this.formData.description
      }

      const resp = await createTenantFtpConfig(this.tenantId, data)
      if (resp && resp.code === 200) {
        this.$message.success(resp.msg || '创建成功')
        this.dialogVisible = false
        this.loadFtpList()
      } else {
        this.$message.error((resp && resp.msg) || '创建失败')
      }
    },

    // Update FTP config
    async updateFtpConfig() {
      const row = this.ftpList.find(
        item => item.username === this.formData.username
      )
      if (!row) {
        this.$message.error('找不到要更新的配置')
        return
      }

      const data = {
        description: this.formData.description,
        status: this.formData.status
      }

      // Only include password if user wants to change it
      if (this.formData.changePassword && this.formData.password) {
        data.password = this.formData.password
      }

      const resp = await updateTenantFtpConfig(
        this.tenantId,
        row.id,
        data
      )
      if (resp && resp.code === 200) {
        this.$message.success(resp.msg || '保存成功')
        this.dialogVisible = false
        this.loadFtpList()
      } else {
        this.$message.error((resp && resp.msg) || '保存失败')
      }
    },

    // Handle status change (inline switch)
    async handleStatusChange(row) {
      row.statusChanging = true
      try {
        const resp = await updateTenantFtpConfig(this.tenantId, row.id, {
          status: row.status
        })
        if (resp && resp.code === 200) {
          this.$message.success(resp.msg || '状态已更新')
        } else {
          // Revert status on failure
          row.status = row.status === 'active' ? 'inactive' : 'active'
          this.$message.error((resp && resp.msg) || '状态更新失败')
        }
      } catch (e) {
        // Revert status on error
        row.status = row.status === 'active' ? 'inactive' : 'active'
        this.$message.error('状态更新失败：' + (e.message || '未知错误'))
      } finally {
        row.statusChanging = false
      }
    },

    // Handle test connection
    async handleTestConnection(row) {
      row.testing = true
      try {
        const resp = await testTenantFtpConfig(this.tenantId, row.id)
        if (resp && resp.code === 200 && resp.data) {
          const result = resp.data
          if (result.success) {
            this.$notify({
              title: '测试成功',
              message: result.message || 'FTP 配置有效',
              type: 'success',
              duration: 3000
            })
          } else {
            this.$notify({
              title: '测试失败',
              message: result.message || 'FTP 配置无效',
              type: 'warning',
              duration: 3000
            })
          }
        } else {
          this.$message.error((resp && resp.msg) || '测试失败')
        }
      } catch (e) {
        this.$message.error('测试失败：' + (e.message || '未知错误'))
      } finally {
        row.testing = false
      }
    },

    // Handle delete button click
    handleDelete(row) {
      this.deletingItem = row
      this.deleteDialogVisible = true
    },

    // Confirm delete
    async confirmDelete() {
      if (!this.deletingItem) return

      this.deleting = true
      try {
        const resp = await deleteTenantFtpConfig(
          this.tenantId,
          this.deletingItem.id
        )
        if (resp && resp.code === 200) {
          this.$message.success(resp.msg || '删除成功')
          this.deleteDialogVisible = false
          this.loadFtpList()
        } else {
          this.$message.error((resp && resp.msg) || '删除失败')
        }
      } catch (e) {
        this.$message.error('删除失败：' + (e.message || '未知错误'))
      } finally {
        this.deleting = false
      }
    },

    // Format time
    formatTime(timeStr) {
      if (!timeStr) return '-'
      try {
        const date = new Date(timeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } catch (e) {
        return timeStr
      }
    }
  }
}
</script>

<style>
/* Important: not scoped to ensure dialog z-index works correctly */
/* Ensure dialog appears above drawer */
.multi-ftp-config .el-dialog__wrapper {
  z-index: 9999 !important;
}

.multi-ftp-config .v-modal {
  z-index: 9998 !important;
}
</style>

<style scoped>
.multi-ftp-config {
  width: 100%;
}

/* Header Section */
.ftp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.ftp-header-left {
  flex: 1;
}

.ftp-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.ftp-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.ftp-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.ftp-subtitle {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.create-btn {
  flex-shrink: 0;
}

/* Table Section */
.ftp-table-wrapper {
  position: relative;
  min-height: 200px;
}

.ftp-table {
  width: 100%;
}

.ftp-table ::v-deep .el-table__header-wrapper {
  background: #f5f7fa;
}

.ftp-table ::v-deep .el-table__header th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-size: 13px;
}

/* Username Cell */
.username-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-icon {
  color: #909399;
  font-size: 14px;
}

.username-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.description-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.time-text {
  font-size: 12px;
  color: #909399;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* Status Switch */
.status-switch ::v-deep .el-switch__core {
  height: 18px;
  min-width: 36px;
}

.status-switch ::v-deep .el-switch__core:after {
  width: 14px;
  height: 14px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.15);
}

.edit-btn {
  color: #409eff;
}

.edit-btn:hover {
  color: #66b1ff;
  background: rgba(64, 158, 255, 0.1);
}

.test-btn {
  color: #67c23a;
}

.test-btn:hover {
  color: #85ce61;
  background: rgba(103, 194, 58, 0.1);
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f78989;
  background: rgba(245, 108, 108, 0.1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.empty-text {
  margin: 0 0 8px;
  font-size: 14px;
  color: #606266;
}

.empty-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* Dialog Styles */
.ftp-dialog ::v-deep .el-dialog__header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

.ftp-dialog ::v-deep .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.ftp-dialog ::v-deep .el-dialog__body {
  padding: 20px;
}

.ftp-dialog ::v-deep .el-dialog__footer {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

/* Form Styles */
.ftp-form ::v-deep .el-form-item__label {
  color: #606266;
  font-weight: 500;
}

.ftp-form ::v-deep .el-input__inner,
.ftp-form ::v-deep .el-textarea__inner {
  border-radius: 4px;
}

.ftp-form ::v-deep .el-input__prefix {
  left: 8px;
}

.ftp-form ::v-deep .el-input__inner {
  padding-left: 32px;
}

.input-icon {
  color: #c0c4cc;
}

.password-input {
  margin-top: 10px;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* Status Radio */
.status-radio-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-radio-label i {
  font-size: 14px;
}

.status-radio-label:nth-child(1) i {
  color: #67c23a;
}

.status-radio-label:nth-child(2) i {
  color: #909399;
}

/* Delete Dialog */
.delete-dialog ::v-deep .el-dialog__body {
  padding: 20px;
}

.delete-content {
  text-align: center;
  padding: 20px 0;
}

.delete-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 16px;
}

.delete-text {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.delete-text strong {
  color: #f56c6c;
}

.delete-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ftp-header {
  animation: fadeIn 0.3s ease-out;
}

.ftp-table-wrapper {
  animation: fadeIn 0.4s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .ftp-header {
    flex-direction: column;
    gap: 12px;
  }

  .ftp-header-left {
    width: 100%;
  }

  .create-btn {
    width: 100%;
  }

  .ftp-table ::v-deep .el-table__body-wrapper {
    overflow-x: auto;
  }
}
</style>
