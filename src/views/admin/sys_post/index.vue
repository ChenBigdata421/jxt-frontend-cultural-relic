<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <PostQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedPostRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysPost:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增岗位
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
              v-permisaction="['admin:sysPost:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['admin:sysPost:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedPostRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 岗位列表 -->
        <el-table
          ref="postTable"
          v-loading="loading"
          :data="postList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="岗位编号"
            align="center"
            prop="postId"
            sortable="custom"
            width="100"
          />
          <el-table-column
            label="岗位编码"
            align="center"
            prop="postCode"
            sortable="custom"
          />
          <el-table-column
            label="岗位名称"
            align="center"
            prop="postName"
            sortable="custom"
          />
          <el-table-column
            label="岗位排序"
            align="center"
            prop="sort"
            sortable="custom"
            width="100"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="status"
            sortable="custom"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag
                :type="row.status === 2 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ selectDictLabel(statusOptions, row.status) }}
              </el-tag>
            </template>
          </el-table-column>
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
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="180"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:sysPost:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['admin:sysPost:remove']"
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
                  <span class="section-badge">3项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="岗位名称" prop="postName">
                    <el-input v-model="form.postName" placeholder="请输入岗位名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="岗位编码" prop="postCode">
                    <el-input v-model="form.postCode" placeholder="请输入岗位编码" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="岗位顺序" prop="sort">
                    <el-input-number
                      v-model="form.sort"
                      controls-position="right"
                      :min="0"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="岗位状态" prop="status">
                    <el-radio-group v-model="form.status">
                      <el-radio
                        v-for="dict in statusOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >
                        {{ dict.label }}
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 其他信息 -->
            <el-collapse-item name="other" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">其他信息</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注" prop="remark">
                    <el-input
                      v-model="form.remark"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入备注"
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
import PostQueryBar from '@/components/PostQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listPost,
  delPost,
  addPost,
  updatePost
} from '@/api/admin/sys-post'
import { formatJson } from '@/utils'

export default {
  name: 'SysPostManage',
  components: {
    BasicLayout,
    Pagination,
    PostQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      postList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'other'],
      // 状态数据字典
      statusOptions: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedPostMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的岗位记录
      selectedPostRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        postName: [
          { required: true, message: '岗位名称不能为空', trigger: 'blur' }
        ],
        postCode: [
          { required: true, message: '岗位编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '岗位顺序不能为空', trigger: 'blur' }
        ]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data.map((item) => ({
        ...item,
        value: parseInt(item.value, 10)
      }))
    })
  },
  methods: {
    /** 查询岗位列表 */
    getList() {
      this.loading = true
      listPost(this.queryParams).then((response) => {
        if (response.code === 200 && response.data) {
          this.postList = response.data.list.map((item) => ({
            ...item,
            status: Number(item.status)
          }))
          this.total = response.data.count || 0
          // 分页/查询后回显跨分页选择
          this.restoreSelection()
        } else {
          this.postList = []
          this.total = 0
          this.msgError(response.msg || '获取岗位列表失败')
        }
      })
        .catch((error) => {
          this.msgError('查询岗位列表失败：' + (error.message || '未知错误'))
          this.postList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.postTable) return
      if (!this.postList || !this.postList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.postList.forEach((row) => {
            const postId = row && row.postId
            if (!postId) return
            if (this.selectedPostMap[postId]) {
              this.$refs.postTable.toggleRowSelection(row, true)
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
        (selection || []).map((item) => item && item.postId).filter(Boolean)
      )

      ;(this.postList || []).forEach((row) => {
        const postId = row && row.postId
        if (!postId) return
        if (selectedIdSet.has(postId)) {
          this.selectedPostMap[postId] = row
        } else {
          delete this.selectedPostMap[postId]
        }
      })

      // 使用 Object.values 确保响应式更新
      this.selectedPostRecords = Object.values(this.selectedPostMap).filter(Boolean)

      // 更新全选状态
      const totalCount = this.postList.length
      const selectedCount = this.selectedPostRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.postTable.toggleAllSelection()
    },

    /** 重置按钮操作 */
    resetSelected() {
      this.selectedPostMap = {}
      this.selectedPostRecords = []
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
        postCode: undefined,
        postName: undefined,
        status: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加岗位'
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      if (row && row.postId !== undefined) {
        this.form = { ...row }
        this.form.status = Number(this.form.status)
      } else {
        this.form = this.selectedPostRecords[0] ? { ...this.selectedPostRecords[0] } : {}
      }
      this.title = '修改岗位'
      this.open = true
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.postId != null) {
            this.startProcessing('正在修改岗位...')
            updatePost(this.form, this.form.postId)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改岗位成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改岗位失败')
                }
              })
              .catch((error) => {
                this.msgError('修改岗位失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建岗位...')
            addPost(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增岗位成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增岗位失败')
                }
              })
              .catch((error) => {
                this.msgError('新增岗位失败：' + (error.message || '未知错误'))
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
        var postIds
        var postCodes
        if (row && row.postId !== undefined) {
          postIds = [row.postId]
          postCodes = row.postCode
        } else {
          postIds = this.selectedPostRecords.map((item) => item.postId)
          postCodes = this.selectedPostRecords.map((item) => item.postCode)
        }

        const count = Array.isArray(postIds) ? postIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条岗位记录？此操作不可恢复。`
          : `是否确认删除岗位"${postCodes}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除岗位...')
        const response = await delPost({ ids: postIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除岗位成功')
        } else {
          this.msgError(response.msg || '删除岗位失败')
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
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        sort: 0,
        status: 2,
        remark: undefined
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
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedPostRecords) &&
          this.selectedPostRecords.length > 0

        const count = hasSelection ? this.selectedPostRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条岗位数据？`
          : '是否确认导出所有岗位数据项？'

        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })

        const columnOptions = Array.isArray(this.columnOptions)
          ? this.columnOptions
          : []
        const visibleColumns = Array.isArray(this.visibleColumns)
          ? this.visibleColumns
          : []
        const exportColumns = columnOptions.filter((c) =>
          visibleColumns.includes(c.prop)
        )

        if (!exportColumns.length) {
          this.msgError('当前未选择任何可导出的列')
          return
        }

        const tHeader = exportColumns.map((c) => c.label)
        const filterVal = exportColumns.map((c) => c.prop)

        let list = []
        if (hasSelection) {
          list = this.selectedPostRecords
        } else {
          const baseQueryParams = { ...(this.queryParams || {}) }

          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listPost(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询岗位列表失败')
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
          output.status = this.selectDictLabel(this.statusOptions, row.status)
          output.createdAt = this.parseTime(row.createdAt)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '岗位列表',
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
  - src/styles/components/dialogs.scss: .edit-dialog, .form-collapse
  - src/styles/components/forms.scss: .section-header, .section-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
