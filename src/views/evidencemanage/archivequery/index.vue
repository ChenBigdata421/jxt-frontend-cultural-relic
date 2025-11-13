<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用档案选择器组件 -->
        <ArchiveSelector
          ref="archiveSelector"
          :selection-mode="false"
          @add="handleAdd"
          @update="handleUpdate"
          @delete="handleDelete"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:create']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:edit']"
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="single"
                @click="handleUpdate"
              >修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:remove']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
              >删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:export']"
                type="warning"
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
              >导出</el-button>
            </el-col>
          </template>
        </ArchiveSelector>
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="档案标题" prop="archiveTitle">
                <el-input v-model="form.archiveTitle" placeholder="请输入档案标题" maxlength="255" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="档案类型" prop="archiveType">
                <el-select v-model="form.archiveType" placeholder="请选择档案类型" style="width: 100%;">
                  <el-option
                    v-for="dict in archiveTypeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="保存期限(月)" prop="storageDuration">
                <el-input-number
                  v-model="form.storageDuration"
                  :min="1"
                  :max="9999"
                  placeholder="请输入保存期限"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
                  <el-option
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="档案描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入档案描述"
                  maxlength="1024"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注信息" prop="remarks">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                  maxlength="512"
                  show-word-limit
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

      <!-- 详情对话框 -->
      <el-dialog title="档案详情" :visible.sync="viewOpen" width="800px" append-to-body>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="档案编号">{{ viewData.archiveCode }}</el-descriptions-item>
          <el-descriptions-item label="档案标题">{{ viewData.archiveTitle }}</el-descriptions-item>
          <el-descriptions-item label="档案类型">{{ archiveTypeFormatter(viewData) }}</el-descriptions-item>
          <el-descriptions-item label="管理部门">{{ viewData.orgName }}</el-descriptions-item>
          <el-descriptions-item label="保存期限">{{ viewData.storageDuration }} 月</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ dateFormatter(viewData, null, viewData.expirationTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(viewData.status)">{{ statusFormatter(viewData) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="录入人员">{{ viewData.createUserName }}</el-descriptions-item>
          <el-descriptions-item label="录入时间">{{ dateFormatter(viewData, null, viewData.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新人员">{{ viewData.updateUserName }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ dateFormatter(viewData, null, viewData.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="档案描述" :span="2">{{ viewData.description }}</el-descriptions-item>
          <el-descriptions-item label="备注信息" :span="2">{{ viewData.remarks }}</el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import { getArchive, addArchive, updateArchive, delArchive, batchDelArchives } from '@/api/evidence/archive_api'
import BasicLayout from '@/layout/BasicLayout'
import ArchiveSelector from '@/components/ArchiveSelector'

export default {
  name: 'Archive',
  components: {
    BasicLayout,
    ArchiveSelector
  },
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示详情弹出层
      viewOpen: false,
      // 详情数据
      viewData: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        archiveTitle: [
          { required: true, message: '档案标题不能为空', trigger: 'blur' }
        ],
        archiveType: [
          { required: true, message: '档案类型不能为空', trigger: 'change' }
        ]
      },
      // 档案类型选项
      archiveTypeOptions: [
        { label: '案件档案', value: 1 },
        { label: '证据档案', value: 2 },
        { label: '执法档案', value: 3 },
        { label: '其他档案', value: 4 }
      ],
      // 状态选项
      statusOptions: [
        { label: '正常', value: 0 },
        { label: '异常', value: 1 },
        { label: '其他', value: 2 }
      ]
    }
  },
  created() {
    // 组件初始化时不需要调用getList，由ArchiveSelector组件自己处理
  },
  methods: {
    /** 档案类型格式化 */
    archiveTypeFormatter(row) {
      const type = this.archiveTypeOptions.find(item => item.value === row.archiveType)
      return type ? type.label : row.archiveType
    },
    /** 状态格式化 */
    statusFormatter(row) {
      const status = this.statusOptions.find(item => item.value === row.status)
      return status ? status.label : row.status
    },
    /** 获取状态标签类型 */
    getStatusType(status) {
      const typeMap = {
        0: 'success',
        1: 'danger',
        2: 'info'
      }
      return typeMap[status] || 'info'
    },
    /** 日期格式化 */
    dateFormatter(row, column, cellValue) {
      if (!cellValue) return '-'
      const date = new Date(cellValue)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.archiveId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加档案'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const archiveId = row ? row.archiveId : this.ids[0]
      getArchive(archiveId).then(response => {
        if (response.code === 200) {
          this.form = response.data
          this.open = true
          this.title = '修改档案'
        }
      })
    },
    /** 查看详情 */
    handleView(row) {
      const archiveId = row.archiveId
      getArchive(archiveId).then(response => {
        if (response.code === 200) {
          this.viewData = response.data
          this.viewOpen = true
        }
      })
    },
    /** 操作按钮处理 */
    handleOperation(row, action) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
        case 'view':
          this.handleView(row)
          break
        default:
          break
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.archiveId) {
            updateArchive(this.form, this.form.archiveId).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.$refs.archiveSelector.refresh()
              }
            })
          } else {
            addArchive(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.$refs.archiveSelector.refresh()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const archiveIds = row && row.archiveId ? [row.archiveId] : this.ids
      const confirmMessage = row && row.archiveTitle 
        ? `是否确认删除档案"${row.archiveTitle}"？`
        : `是否确认删除选中的${archiveIds.length}条档案数据？`

      this.$confirm(confirmMessage, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (archiveIds.length === 1) {
          return delArchive(archiveIds[0])
        } else {
          return batchDelArchives({ ids: archiveIds })
        }
      }).then((response) => {
        if (response.code === 200) {
          this.$refs.archiveSelector.refresh()
          this.msgSuccess('删除成功')
        }
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有档案数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.msgSuccess('导出功能开发中...')
      }).catch(() => {})
    },
    /** 表单重置 */
    reset() {
      this.form = {
        archiveId: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        description: undefined,
        storageDuration: 120,
        status: 0,
        remarks: undefined
      }
      this.resetForm('form')
    }
  }
}
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>


