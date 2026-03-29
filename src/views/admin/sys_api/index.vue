<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <ApiQueryBar
          ref="queryBar"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedApiRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysApi:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增接口
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
              v-permisaction="['admin:sysApi:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedApiRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 接口列表 -->
        <el-table
          ref="apiTable"
          v-loading="loading"
          :data="apiList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="180"
            fixed="left"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:sysApi:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['admin:sysApi:remove']"
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
            label="标题"
            header-align="center"
            align="left"
            prop="title"
            sortable="custom"
            min-width="200"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.type === 'SYS' && scope.row.title" type="success">
                [{{ scope.row.type }}] {{ scope.row.title }}
              </el-tag>
              <el-tag v-else-if="scope.row.type !== 'SYS' && scope.row.title">
                [{{ scope.row.type }}] {{ scope.row.title }}
              </el-tag>
              <el-tag v-else type="danger">暂无</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="Request Info"
            header-align="center"
            align="left"
            prop="path"
            sortable="custom"
            min-width="300"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div class="request-info">
                <el-tag v-if="scope.row.action === 'GET'" size="small">{{ scope.row.action }}</el-tag>
                <el-tag v-else-if="scope.row.action === 'POST'" type="success" size="small">{{ scope.row.action }}</el-tag>
                <el-tag v-else-if="scope.row.action === 'PUT'" type="warning" size="small">{{ scope.row.action }}</el-tag>
                <el-tag v-else-if="scope.row.action === 'DELETE'" type="danger" size="small">{{ scope.row.action }}</el-tag>
                <span class="path-text">{{ scope.row.path }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Handle"
            align="center"
            prop="handle"
            sortable="custom"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="创建时间"
            align="center"
            prop="createdAt"
            width="180"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
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
        width="600px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">

          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">5项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="类型" prop="type">
                    <el-select
                      v-model="form.type"
                      placeholder="请选择类型"
                      style="width: 100%"
                    >
                      <el-option value="SYS">SYS</el-option>
                      <el-option value="BUS">BUS</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Method" prop="action">
                    <el-select
                      v-model="form.action"
                      placeholder="请选择方式"
                      style="width: 100%"
                    >
                      <el-option value="GET">GET</el-option>
                      <el-option value="POST">POST</el-option>
                      <el-option value="PUT">PUT</el-option>
                      <el-option value="DELETE">DELETE</el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="按钮ID" prop="parentId">
                    <el-input v-model="form.parentId" placeholder="请输入按钮ID" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="Handle" prop="handle">
                    <el-input v-model="form.handle" placeholder="请输入Handle" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="地址" prop="path">
                    <el-input
                      v-model="form.path"
                      :disabled="isEdit"
                      placeholder="请输入地址"
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
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import ApiQueryBar from '@/components/ApiQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listSysApi,
  getSysApi,
  delSysApi,
  addSysApi,
  updateSysApi
} from '@/api/admin/sys-api'

export default {
  name: 'SysApiManage',
  components: {
    BasicLayout,
    Pagination,
    ApiQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 接口表格数据
      apiList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedApiMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的接口记录
      selectedApiRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        title: undefined,
        path: undefined,
        type: undefined,
        action: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '地址不能为空', trigger: 'blur' }
        ],
        action: [
          { required: true, message: '方式不能为空', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '按钮ID不能为空', trigger: 'blur' }
        ]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询接口列表 */
    getList() {
      this.loading = true
      listSysApi(this.queryParams).then((response) => {
        if (response.code === 200 && response.data) {
          this.apiList = response.data.list || []
          this.total = response.data.count || 0
          // 分页/查询后回显跨分页选择
          this.restoreSelection()
        } else {
          this.apiList = []
          this.total = 0
          this.msgError(response.msg || '获取接口列表失败')
        }
      })
        .catch((error) => {
          this.msgError('查询接口列表失败：' + (error.message || '未知错误'))
          this.apiList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.apiTable) return
      if (!this.apiList || !this.apiList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.apiList.forEach((row) => {
            const apiId = row && row.id
            if (!apiId) return
            if (this.selectedApiMap[apiId]) {
              this.$refs.apiTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          // 使用 setTimeout 确保 toggleRowSelection 的事件处理完成
          setTimeout(() => {
            this.isRestoringSelection = false
          }, 0)
        }
      })
    },

    /** 开始执行操作 */
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

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      document.body.style.cursor = this.previousCursor
    },

    /** 刷新列表 */
    handleRefresh() {
      this.getList()
    },

    /** 排序回调函数 */
    handleSortChange(column, prop, order) {
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

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      )

      ;(this.apiList || []).forEach((row) => {
        const apiId = row && row.id
        if (!apiId) return
        if (selectedIdSet.has(apiId)) {
          this.selectedApiMap[apiId] = row
        } else {
          delete this.selectedApiMap[apiId]
        }
      })

      // 使用 Object.values 确保响应式更新
      this.selectedApiRecords = Object.values(this.selectedApiMap).filter(Boolean)

      // 更新全选状态
      const totalCount = this.apiList.length
      const selectedCount = this.selectedApiRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.apiTable.toggleAllSelection()
    },

    /** 重置按钮操作 */
    resetSelected() {
      this.selectedApiMap = {}
      this.selectedApiRecords = []
    },

    /** 重置分页 */
    resetPage() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    handleReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        title: undefined,
        path: undefined,
        type: undefined,
        action: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加接口'
      this.isEdit = false
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row && row.id
      if (id) {
        getSysApi(id).then((response) => {
          if (response.code === 200) {
            this.form = response.data
            this.title = '修改接口管理'
            this.open = true
            this.isEdit = true
          } else {
            this.msgError(response.msg || '获取接口信息失败')
          }
        }).catch((error) => {
          this.msgError('获取接口信息失败：' + (error.message || '未知错误'))
        })
      }
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            this.startProcessing('正在修改接口...')
            updateSysApi(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改接口成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改接口失败')
                }
              })
              .catch((error) => {
                this.msgError('修改接口失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建接口...')
            addSysApi(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增接口成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增接口失败')
                }
              })
              .catch((error) => {
                this.msgError('新增接口失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },

    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var apiIds
        var apiTitles
        if (row && row.id !== undefined) {
          apiIds = [row.id]
          apiTitles = row.title
        } else {
          apiIds = this.selectedApiRecords.map((item) => item.id)
          apiTitles = this.selectedApiRecords.map((item) => item.title).join(',')
        }

        const count = Array.isArray(apiIds) ? apiIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条接口记录？此操作不可恢复。`
          : `是否确认删除接口"${apiTitles}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除接口...')
        const response = await delSysApi({ ids: apiIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除接口成功')
        } else {
          this.msgError(response.msg || '删除接口失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        title: undefined,
        path: undefined,
        action: undefined,
        type: undefined,
        handle: undefined,
        parentId: undefined
      }
      this.resetForm('form')
    },

    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
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
  - src/styles/components/forms.scss: .section-header, .section-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->

<style lang="scss" scoped>
.request-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .path-text {
    font-size: 13px;
    color: #606266;
  }
}
</style>
