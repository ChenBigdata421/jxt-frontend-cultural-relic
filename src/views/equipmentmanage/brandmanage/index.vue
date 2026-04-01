<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏 -->
        <BrandQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedBrandRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['equipment:brand:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增品牌
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
              v-permisaction="['equipment:brand:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['equipment:brand:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedBrandRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="280"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
            >
              <div class="column-settings">
                <div class="column-settings-header">
                  <span class="column-settings-title">列显示设置</span>
                  <el-button
                    type="text"
                    size="small"
                    class="column-settings-reset"
                    @click="resetColumns"
                  >
                    重置
                  </el-button>
                </div>
                <el-checkbox-group
                  v-model="visibleColumns"
                  @change="handleColumnChange"
                >
                  <div
                    v-for="col in columnOptions"
                    :key="col.prop"
                    class="column-item"
                  >
                    <el-checkbox
                      :label="col.prop"
                      :disabled="col.fixed"
                    >
                      {{ col.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button
                slot="reference"
                size="small"
                icon="el-icon-setting"
                type="text"
                class="action-btn tertiary"
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <!-- 品牌列表 -->
        <el-table
          ref="brandTable"
          v-loading="loading"
          :data="equipmentBrandList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['equipment:brand:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['equipment:brand:remove']"
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
            v-if="isColumnVisible('brandName')"
            label="名称"
            align="center"
            prop="brandName"
            sortable="custom"
            min-width="140"
          />
          <el-table-column
            v-if="isColumnVisible('hardware')"
            label="硬件设备"
            align="center"
            prop="hardware"
            sortable="custom"
            min-width="140"
          />
          <el-table-column
            v-if="isColumnVisible('state')"
            label="状态"
            align="center"
            prop="state"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.state === 1 ? 'success' : 'danger'"
                disable-transitions
              >
                {{ stateFormat(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('createdAt')"
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
            v-if="isColumnVisible('updatedAt')"
            label="更新时间"
            align="center"
            prop="updatedAt"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updatedAt) }}</span>
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
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="名称" prop="brandName">
                    <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="硬件设备" prop="hardware">
                    <el-input v-model="form.hardware" placeholder="请输入硬件设备" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 状态信息 -->
            <el-collapse-item name="status" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">状态信息</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="状态">
                    <el-radio-group v-model="form.state">
                      <el-radio
                        v-for="dict in statusOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
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
import BrandQueryBar from '@/components/BrandQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listEquipmentBrand,
  delEquipmentBrand,
  addEquipmentBrand,
  updateEquipmentBrand
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'

export default {
  name: 'Brand',
  components: {
    BasicLayout,
    Pagination,
    BrandQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 品牌表格数据
      equipmentBrandList: [],
      // 状态数据字典
      statusOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'status'],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedBrandMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的品牌记录
      selectedBrandRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 列配置选项
      columnOptions: [
        { prop: 'brandName', label: '名称', fixed: true, defaultVisible: true },
        { prop: 'hardware', label: '硬件设备', fixed: false, defaultVisible: true },
        { prop: 'state', label: '状态', fixed: false, defaultVisible: true },
        { prop: 'createdAt', label: '创建时间', fixed: false, defaultVisible: false },
        { prop: 'updatedAt', label: '更新时间', fixed: false, defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        brandName: undefined,
        hardware: undefined,
        state: undefined
      },
      // 表单参数
      form: {
        state: undefined
      },
      // 表单校验
      rules: {
        brandName: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getDicts('brand_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listEquipmentBrand(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.equipmentBrandList = response.data.list
            this.total = response.data.count
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.equipmentBrandList = []
            this.total = 0
            this.msgError(response.msg || '获取品牌列表失败')
          }
        })
        .catch((error) => {
          this.equipmentBrandList = []
          this.total = 0
          this.msgError('获取品牌列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.state)
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

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.brandTable) return
      if (!this.equipmentBrandList || !this.equipmentBrandList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.equipmentBrandList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedBrandMap[id]) {
              this.$refs.brandTable.toggleRowSelection(row, true)
            }
          })
        } finally {
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
    handleSortChang(column, prop, order) {
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

      ;(this.equipmentBrandList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedBrandMap[id] = row
        } else {
          delete this.selectedBrandMap[id]
        }
      })
      this.selectedBrandRecords = Object.values(this.selectedBrandMap).filter(Boolean)

      // 更新全选状态
      const totalCount = this.equipmentBrandList.length
      const selectedCount = this.selectedBrandRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.brandTable.toggleAllSelection()
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的快速搜索字段
      const quickSearchFields = ['brandName', 'hardware', 'state']
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    handleQuickSearchReset() {
      this.handleFilterReset()
    },

    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        brandName: undefined,
        hardware: undefined,
        state: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 重置按钮操作 */
    resetSelected() {
      this.selectedBrandMap = {}
      this.selectedBrandRecords = []
    },

    /** 重置分页 */
    resetPage() {
      this.queryParams.pageIndex = 1
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加品牌'
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedBrandRecords[0] ? { ...this.selectedBrandRecords[0] } : {}
      }
      this.title = '修改品牌'
      this.open = true
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing('正在修改品牌...')
            updateEquipmentBrand(this.form, this.form.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改品牌成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改品牌失败')
                }
              })
              .catch((error) => {
                this.msgError('修改品牌失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建品牌...')
            addEquipmentBrand(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增品牌成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增品牌失败')
                }
              })
              .catch((error) => {
                this.msgError('新增品牌失败：' + (error.message || '未知错误'))
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
        var brandIds = []
        var brandNames = []
        if (row && row.id !== undefined) {
          brandIds = [row.id]
          brandNames = [row.brandName]
        } else {
          brandIds = this.selectedBrandRecords.map((item) => item.id)
          brandNames = this.selectedBrandRecords.map((item) => item.brandName)
        }

        const count = Array.isArray(brandIds) ? brandIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条品牌记录？此操作不可恢复。`
          : `是否确认删除品牌"${brandNames}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除品牌...')
        const response = await delEquipmentBrand({ ids: brandIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除品牌成功')
        } else {
          this.msgError(response.msg || '删除品牌失败')
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
        brandName: undefined,
        hardware: undefined,
        state: undefined
      }
      this.resetForm('form')
    },

    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },

    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem('brand_manage_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions
            .filter((item) => item.defaultVisible !== false)
            .map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions
          .filter((item) => item.defaultVisible !== false)
          .map((item) => item.prop)
      }
    },

    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    /** 列显示变更 */
    handleColumnChange(value) {
      localStorage.setItem('brand_manage_visible_columns', JSON.stringify(value))
    },

    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
      localStorage.setItem('brand_manage_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedBrandRecords) &&
          this.selectedBrandRecords.length > 0

        const count = hasSelection ? this.selectedBrandRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条品牌数据？`
          : '是否确认导出所有品牌数据项？'

        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })

        const tHeader = ['名称', '硬件设备', '状态', '创建时间', '更新时间']
        const filterVal = ['brandName', 'hardware', 'state', 'createdAt', 'updatedAt']

        let list = []
        if (hasSelection) {
          list = this.selectedBrandRecords
        } else {
          const baseQueryParams = this.normalizeQueryParams(this.queryParams || {})
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listEquipmentBrand(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询品牌列表失败')
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
          output.state = this.stateFormat(row)
          output.createdAt = this.parseTime(row.createdAt)
          output.updatedAt = this.parseTime(row.updatedAt)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '品牌列表',
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
  - src/styles/components/forms.scss: .section-header
  - src/styles/components/buttons.scss: .action-btn
-->
