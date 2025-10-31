<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询表单 -->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="档案编号" prop="archiveCode">
            <el-input
              v-model="queryParams.archiveCode"
              placeholder="请输入档案编号"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="档案标题" prop="archiveTitle">
            <el-input
              v-model="queryParams.archiveTitle"
              placeholder="请输入档案标题"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="档案类型" prop="archiveType">
            <el-select v-model="queryParams.archiveType" placeholder="请选择档案类型" clearable style="width: 170px;">
              <el-option
                v-for="dict in archiveTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="管理部门" prop="orgId">
            <treeselect
              v-model="queryParams.orgId"
              :options="orgOptions"
              placeholder="请选择管理部门"
              style="width: 170px;"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 170px;">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <el-row :gutter="10" class="mb8">
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
        </el-row>

        <!-- 数据表格 -->
        <el-table
          ref="archiveTable"
          v-loading="loading"
          :data="archiveList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column prop="archiveCode" label="档案编号" width="180" sortable="custom" />
          <el-table-column prop="archiveTitle" label="档案标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="archiveType" label="档案类型" width="120" :formatter="archiveTypeFormatter" />
          <el-table-column prop="orgName" label="管理部门" width="150" show-overflow-tooltip />
          <el-table-column prop="storageDuration" label="保存期限(月)" width="120" align="center" />
          <el-table-column prop="expirationTime" label="过期时间" width="160" :formatter="dateFormatter" />
          <el-table-column prop="status" label="状态" width="100" :formatter="statusFormatter">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ statusFormatter(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createUserName" label="录入人员" width="120" />
          <el-table-column prop="createdAt" label="录入时间" width="160" :formatter="dateFormatter" />
          <el-table-column label="操作" align="center" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['archive:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-permisaction="['archive:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                v-permisaction="['archive:view']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
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
import { listArchives, getArchive, addArchive, updateArchive, delArchive, batchDelArchives } from '@/api/evidence/archive_api'
import { getOrgList } from '@/api/admin/sys-organization'
import BasicLayout from '@/layout/BasicLayout'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Pagination from '@/components/Pagination'

export default {
  name: 'Archive',
  components: {
    BasicLayout,
    Treeselect,
    Pagination
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 档案表格数据
      archiveList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示详情弹出层
      viewOpen: false,
      // 详情数据
      viewData: {},
      // 组织树选项
      orgOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        orgId: undefined,
        status: undefined
      },
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
    this.getList()
    this.getOrgTree()
  },
  methods: {
    /** 查询档案列表 */
    getList() {
      this.loading = true
      listArchives(this.queryParams).then(response => {
        if (response.code === 200) {
          this.archiveList = response.data.list || []
          this.total = response.data.total || 0
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 查询组织树结构 */
    getOrgTree() {
      getOrgList().then(response => {
        if (response.code === 200) {
          this.orgOptions = this.handleTree(response.data, 'orgId', 'parentId')
        }
      })
    },
    /** 转换组织数据为树形结构 */
    handleTree(data, id, parentId, children) {
      const config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
      }

      const childrenListMap = {}
      const nodeIds = {}
      const tree = []

      for (const d of data) {
        const parentId = d[config.parentId]
        if (childrenListMap[parentId] == null) {
          childrenListMap[parentId] = []
        }
        nodeIds[d[config.id]] = d
        childrenListMap[parentId].push(d)
      }

      for (const d of data) {
        const parentId = d[config.parentId]
        if (nodeIds[parentId] == null) {
          tree.push(d)
        }
      }

      for (const t of tree) {
        adaptToChildrenList(t)
      }

      function adaptToChildrenList(o) {
        if (childrenListMap[o[config.id]] !== null) {
          o[config.childrenList] = childrenListMap[o[config.id]]
        }
        if (o[config.childrenList]) {
          for (const c of o[config.childrenList]) {
            adaptToChildrenList(c)
          }
        }
      }
      return tree
    },
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.archiveId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order === 'ascending' ? 'asc' : 'desc'
      this.getList()
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
      const archiveId = row.archiveId || this.ids[0]
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
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.archiveId) {
            updateArchive(this.form, this.form.archiveId).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              }
            })
          } else {
            addArchive(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const archiveIds = row.archiveId ? [row.archiveId] : this.ids
      const archiveTitles = row.archiveTitle ? row.archiveTitle : this.archiveList.filter(item => archiveIds.includes(item.archiveId)).map(item => item.archiveTitle).join('、')

      this.$confirm('是否确认删除档案"' + archiveTitles + '"？', '警告', {
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
          this.getList()
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


