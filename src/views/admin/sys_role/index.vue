<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <RoleQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedRoleRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysRole:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增角色
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
              v-permisaction="['admin:sysRole:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['admin:sysRole:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedRoleRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 角色列表 -->
        <el-table
          ref="roleTable"
          v-loading="loading"
          :data="roleList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="280"
            fixed="left"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:sysRole:update']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-if="scope.row.roleKey!=='admin'"
                  v-permisaction="['admin:sysRole:update']"
                  size="small"
                  type="text"
                  icon="el-icon-circle-check"
                  class="action-btn tertiary"
                  @click="handleDataScope(scope.row)"
                >
                  数据权限
                </el-button>
                <el-button
                  v-if="scope.row.roleKey!=='admin'"
                  v-permisaction="['admin:sysRole:remove']"
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
            label="角色编号"
            align="center"
            prop="roleId"
            sortable="custom"
            width="100"
          />
          <el-table-column
            label="角色名称"
            align="center"
            prop="roleName"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="权限字符"
            align="center"
            prop="roleKey"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="排序"
            align="center"
            prop="roleSort"
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
              <el-switch
                v-model="row.status"
                active-value="2"
                inactive-value="1"
                @change="handleStatusChange(row)"
              />
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

      <!-- 新增/修改角色配置对话框 -->
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
                  <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="form.roleName" placeholder="请输入角色名称" :disabled="isEdit" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="权限字符" prop="roleKey">
                    <el-input v-model="form.roleKey" placeholder="请输入权限字符" :disabled="isEdit" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="角色顺序" prop="roleSort">
                    <el-input-number
                      v-model="form.roleSort"
                      controls-position="right"
                      :min="0"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="角色状态" prop="status">
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

            <!-- 菜单权限 -->
            <el-collapse-item name="menu" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-menu section-icon" />
                  <span class="section-title">菜单权限</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="菜单权限" prop="menuIds">
                    <el-tree
                      ref="menuTree"
                      :data="menuOptions"
                      show-checkbox
                      node-key="id"
                      :empty-text="menuOptionsAlert"
                      class="menu-tree"
                    />
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

      <!-- 分配角色数据权限对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="openDataScope"
        width="600px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form ref="dataScopeForm" :model="form" label-width="100px">

          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeDataScopeSections" class="form-collapse">

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
                  <el-form-item label="角色名称">
                    <el-input v-model="form.roleName" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="权限字符">
                    <el-input v-model="form.roleKey" :disabled="true" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 数据权限 -->
            <el-collapse-item name="dataScope" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-lock section-icon" />
                  <span class="section-title">数据权限</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="权限范围" prop="dataScope">
                    <el-select v-model="form.dataScope" style="width: 100%">
                      <el-option
                        v-for="item in dataScopeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 自定义数据权限 -->
            <el-collapse-item v-show="form.dataScope == 2" name="custom" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-office-building section-icon" />
                  <span class="section-title">组织权限</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="数据权限">
                    <el-tree
                      ref="org"
                      :data="orgOptions"
                      show-checkbox
                      default-expand-all
                      node-key="id"
                      empty-text="加载中，请稍后"
                      :props="defaultProps"
                      class="org-tree"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="cancelDataScope">取 消</el-button>
          <el-button type="primary" size="small" @click="submitDataScope">确 定</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import RoleQueryBar from '@/components/RoleQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import { listRole, getRole, delRole, addRole, updateRole, dataScope, changeRoleStatus } from '@/api/admin/sys-role'
import { menuTreeselect } from '@/api/admin/sys-menu'
import { orgTreeselect } from '@/api/admin/sys-organization'
import { formatJson } from '@/utils'

export default {
  name: 'SysRoleManage',
  components: {
    BasicLayout,
    Pagination,
    RoleQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      isEdit: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'menu', 'other'],
      activeDataScopeSections: ['basic', 'dataScope', 'custom'],
      // 状态数据字典
      statusOptions: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: '1',
          label: '全部数据权限'
        },
        {
          value: '2',
          label: '自定数据权限'
        },
        {
          value: '3',
          label: '本组织数据权限'
        },
        {
          value: '4',
          label: '本组织及以下数据权限'
        },
        {
          value: '5',
          label: '仅本人数据权限'
        }
      ],
      // 菜单列表
      menuOptions: [],
      menuList: [],
      // 单位列表
      orgOptions: [],
      menuOptionsAlert: '加载中，请稍后',
      // 使用 Map 存储所有选中的项（跨分页）
      selectedRoleMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的角色记录
      selectedRoleRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        sysMenu: []
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ],
        roleSort: [
          { required: true, message: '角色顺序不能为空', trigger: 'blur' }
        ]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.getList()
    this.getMenuTreeselect()
    this.getOrgTreeselect()
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data.map((item) => ({
        ...item,
        value: parseInt(item.value, 10)
      }))
    })
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true
      listRole(this.queryParams).then((response) => {
        if (response.code === 200 && response.data) {
          this.roleList = response.data.list.map((item) => ({
            ...item,
            status: String(item.status)
          }))
          this.total = response.data.count || 0
          // 分页/查询后回显跨分页选择
          this.restoreSelection()
        } else {
          this.roleList = []
          this.total = 0
          this.msgError(response.msg || '获取角色列表失败')
        }
      })
        .catch((error) => {
          this.msgError('查询角色列表失败：' + (error.message || '未知错误'))
          this.roleList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.roleTable) return
      if (!this.roleList || !this.roleList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.roleList.forEach((row) => {
            const roleId = row && row.roleId
            if (!roleId) return
            if (this.selectedRoleMap[roleId]) {
              this.$refs.roleTable.toggleRowSelection(row, true)
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
        (selection || []).map((item) => item && item.roleId).filter(Boolean)
      )

      ;(this.roleList || []).forEach((row) => {
        const roleId = row && row.roleId
        if (!roleId) return
        if (selectedIdSet.has(roleId)) {
          this.selectedRoleMap[roleId] = row
        } else {
          delete this.selectedRoleMap[roleId]
        }
      })

      // 使用 Object.values 确保响应式更新
      this.selectedRoleRecords = Object.values(this.selectedRoleMap).filter(Boolean)

      // 更新全选状态
      const totalCount = this.roleList.length
      const selectedCount = this.selectedRoleRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.roleTable.toggleAllSelection()
    },

    /** 重置按钮操作 */
    resetSelected() {
      this.selectedRoleMap = {}
      this.selectedRoleRecords = []
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
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = response.data
        this.menuList = this.menuOptions
      })
    },

    /** 查询单位树结构 */
    getOrgTreeselect() {
      orgTreeselect().then(response => {
        this.orgOptions = response.data
      })
    },

    /** 所有菜单节点数据 */
    getMenuAllCheckedKeys() {
      // 目前半选中的菜单节点（部分子节点被选中，但自身未直接选中）
      const halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys()
      // 完全被选中的菜单节点
      const checkedKeys = this.$refs.menuTree.getCheckedKeys()

      // 合并完全选中的节点和半选中的节点
      const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]
      return allCheckedKeys
    },

    /** 所有单位节点数据 */
    getOrgAllCheckedKeys() {
      // 目前被选中的单位节点
      const checkedKeys = this.$refs.org.getCheckedKeys()
      return checkedKeys
    },

    /** 根据角色ID设置菜单树结构 */
    getRoleMenuTreeselect(row, checkedKeys) {
      if (row.roleKey === 'admin') {
        this.menuOptionsAlert = '系统超级管理员无需此操作'
        this.menuOptions = []
      } else {
        this.$nextTick(() => {
          this.$refs.menuTree.setCheckedKeys(checkedKeys)
        })
      }
    },

    /** 根据角色ID查询单位树结构 */
    getRoleOrgTreeselect(checkedKeys) {
      this.$nextTick(() => {
        this.$refs.org.setCheckedKeys(checkedKeys)
      })
    },

    /** 角色状态修改 */
    handleStatusChange(row) {
      const text = row.status === '2' ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeRoleStatus(row.roleId, row.status)
      }).then((res) => {
        this.msgSuccess(res.msg)
      }).catch(() => {
        row.status = row.status === '2' ? '1' : '2'
      })
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加角色'
      this.isEdit = false
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const roleId = row && row.roleId
        ? row.roleId
        : (this.selectedRoleRecords[0] && this.selectedRoleRecords[0].roleId)

      if (!roleId) {
        this.msgError('请选择要修改的角色')
        return
      }

      getRole(roleId).then(response => {
        if (response.code === 200) {
          this.form = response.data
          this.form.status = String(this.form.status)
          this.title = '修改角色'
          this.isEdit = true
          this.open = true
          this.getRoleMenuTreeselect(row || this.selectedRoleRecords[0], response.data.menuIds)
        } else {
          this.msgError(response.msg || '获取角色信息失败')
        }
      }).catch((error) => {
        this.msgError('获取角色信息失败：' + (error.message || '未知错误'))
      })
    },

    /** 分配数据权限操作 */
    handleDataScope(row) {
      this.reset()
      getRole(row.roleId).then(response => {
        if (response.code === 200) {
          this.form = response.data
          this.openDataScope = true
          this.title = '分配数据权限'
          this.getRoleOrgTreeselect(response.data.orgIds)
        } else {
          this.msgError(response.msg || '获取角色信息失败')
        }
      }).catch((error) => {
        this.msgError('获取角色信息失败：' + (error.message || '未知错误'))
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.roleId != null) {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            this.startProcessing('正在修改角色...')
            updateRole(this.form, this.form.roleId)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改角色成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改角色失败')
                }
              })
              .catch((error) => {
                this.msgError('修改角色失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys()
            this.startProcessing('正在创建角色...')
            addRole(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增角色成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增角色失败')
                }
              })
              .catch((error) => {
                this.msgError('新增角色失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },

    /** 提交按钮（数据权限） */
    submitDataScope() {
      if (this.form.roleId !== undefined) {
        this.form.orgIds = this.getOrgAllCheckedKeys()
        dataScope(this.form).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
            this.openDataScope = false
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        }).catch((error) => {
          this.msgError('分配数据权限失败：' + (error.message || '未知错误'))
        })
      }
    },

    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var roleIds
        var roleNames
        if (row && row.roleId !== undefined) {
          roleIds = [row.roleId]
          roleNames = row.roleName
        } else {
          roleIds = this.selectedRoleRecords.map((item) => item.roleId)
          roleNames = this.selectedRoleRecords.map((item) => item.roleName).join(', ')
        }

        const count = Array.isArray(roleIds) ? roleIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条角色记录？此操作不可恢复。`
          : `是否确认删除角色"${roleNames}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除角色...')
        const response = await delRole({ ids: roleIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除角色成功')
        } else {
          this.msgError(response.msg || '删除角色失败')
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
      this.menuOptions = this.menuList
      if (this.$refs.menuTree !== undefined) {
        this.$refs.menuTree.setCheckedKeys([])
      }
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '2',
        menuIds: [],
        orgIds: [],
        sysMenu: [],
        remark: undefined
      }
      this.resetForm('form')
    },

    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },

    /** 取消按钮（数据权限） */
    cancelDataScope() {
      this.openDataScope = false
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
          Array.isArray(this.selectedRoleRecords) &&
          this.selectedRoleRecords.length > 0

        const count = hasSelection ? this.selectedRoleRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条角色数据？`
          : '是否确认导出所有角色数据项？'

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
          list = this.selectedRoleRecords
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
            const resp = await listRole(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询角色列表失败')
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
          filename: '角色列表',
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
<style lang="scss" scoped>
.menu-tree,
.org-tree {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}
</style>
