<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <UserQueryBar
          ref="queryBar"
          :sex-options="sexOptions"
          :status-options="statusOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @filter-change="handleFilterChange"
          @filter-reset="handleFilterReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedUserRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysUser:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增用户
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
              v-permisaction="['admin:sysUser:import']"
              icon="el-icon-upload"
              size="small"
              class="action-btn secondary"
              @click="handleImport"
            >
              导入
            </el-button>
            <el-button
              v-permisaction="['admin:sysUser:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['admin:sysUser:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedUserRecords.length === 0"
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="300"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
              @after-enter="handleColumnSettingsOpen"
              @after-leave="handleColumnSettingsClose"
            >
              <div
                role="dialog"
                aria-label="列显示设置"
                class="column-settings"
              >
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
                      :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
                    >
                      {{ col.label }}
                      <el-tooltip
                        v-if="col.fixed"
                        content="此列必须显示，不能隐藏"
                        placement="top"
                      >
                        <i class="el-icon-info column-item-icon" />
                      </el-tooltip>
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
                aria-label="打开列设置"
                aria-haspopup="dialog"
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <!-- 用户列表 -->
        <el-table
          ref="userTable"
          v-loading="loading"
          :data="userList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
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
                  v-permisaction="['admin:sysUser:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-if="scope.row.userId !== 1"
                  v-permisaction="['admin:sysUser:remove']"
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-button
                  v-permisaction="['admin:sysUser:resetPassword']"
                  size="small"
                  type="text"
                  icon="el-icon-key"
                  class="action-btn tertiary"
                  @click="handleResetPwd(scope.row)"
                >
                  重置密码
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('policeNo')"
            label="警号"
            align="center"
            prop="policeNo"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('userName')"
            label="登录名"
            align="center"
            prop="userName"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('sex')"
            label="性别"
            align="center"
            prop="sex"
          >
            <template slot-scope="scope">
              {{ sexFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('orgName')"
            label="组织"
            align="center"
            prop="orgName"
          />
          <el-table-column
            v-if="isColumnVisible('orgFullName')"
            label="组织全称"
            align="center"
            prop="orgFullName"
            min-width="150"
          />
          <el-table-column
            v-if="isColumnVisible('roleName')"
            label="角色"
            align="center"
            prop="roleName"
          />
          <el-table-column
            v-if="isColumnVisible('postName')"
            label="岗位"
            align="center"
            prop="postName"
          />
          <el-table-column
            v-if="isColumnVisible('phone')"
            label="手机号"
            align="center"
            prop="phone"
          />
          <el-table-column
            v-if="isColumnVisible('email')"
            label="邮箱"
            align="center"
            prop="email"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            label="状态"
            align="center"
            prop="status"
            sortable="custom"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="2"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
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
        width="700px"
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
                  <span class="section-badge">6项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="警号" prop="policeNo">
                    <el-input v-model="form.policeNo" placeholder="请输入警号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="归属单位" prop="orgId">
                    <treeselect
                      v-model="form.orgId"
                      :options="orgOptions"
                      placeholder="请选择归属单位"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名称" prop="userName">
                    <el-input v-model="form.userName" placeholder="请输入用户名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    v-if="form.userId == undefined"
                    label="用户密码"
                    prop="password"
                  >
                    <el-input
                      v-model="form.password"
                      placeholder="请输入用户密码"
                      type="password"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机号码" prop="phone">
                    <el-input
                      v-model="form.phone"
                      placeholder="请输入手机号码"
                      maxlength="11"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户性别">
                    <el-select v-model="form.sex" placeholder="请选择" class="full-width">
                      <el-option
                        v-for="dict in sexOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
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

            <!-- 岗位角色 -->
            <el-collapse-item name="role" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-user section-icon" />
                  <span class="section-title">岗位角色</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="岗位">
                    <el-select
                      v-model="form.postId"
                      placeholder="请选择岗位"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in postOptions"
                        :key="item.postId"
                        :label="item.postName"
                        :value="item.postId"
                        :disabled="item.status == 1"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="角色">
                    <el-select
                      v-model="form.roleId"
                      placeholder="请选择角色"
                      class="full-width"
                    >
                      <el-option
                        v-for="item in roleOptions"
                        :key="item.roleId"
                        :label="item.roleName"
                        :value="item.roleId"
                        :disabled="item.status == 1"
                      />
                    </el-select>
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
                  <el-form-item label="备注">
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

      <!-- 用户导入对话框 -->
      <el-dialog
        :title="upload.title"
        :visible.sync="upload.open"
        width="400px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            <el-link
              type="info"
              style="font-size: 12px"
              @click="importTemplate"
            >下载模板</el-link>
          </div>
          <div slot="tip" class="el-upload__tip" style="color: red">
            提示:仅允许导入"xls"或"xlsx"格式文件!
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="upload.open = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submitFileForm">确 定</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import UserQueryBar from '@/components/UserQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate
} from '@/api/admin/sys-user'
import { getToken } from '@/utils/auth'
import { listPost } from '@/api/admin/sys-post'
import { listRole } from '@/api/admin/sys-role'
import { orgTreeselect } from '@/api/admin/sys-organization'
import { formatJson } from '@/utils'

export default {
  name: 'SysUserManage',
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    UserQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 组织树选项
      orgOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'role'],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 默认密码
      initPassword: undefined,
      // 用户导入参数
      upload: {
        open: false,
        title: '',
        isUploading: false,
        updateSupport: 0,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/api/v1/user/importuser'
      },
      // 使用 Map 存储所有选中的项（跨分页）
      selectedUserMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的用户记录
      selectedUserRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 列配置选项
      columnOptions: [
        { prop: 'policeNo', label: '警号', fixed: true, defaultVisible: true },
        { prop: 'userName', label: '登录名', fixed: true, defaultVisible: true },
        { prop: 'sex', label: '性别', fixed: false, defaultVisible: true },
        { prop: 'orgName', label: '组织', fixed: false, defaultVisible: true },
        { prop: 'orgFullName', label: '组织全称', fixed: false, defaultVisible: false },
        { prop: 'roleName', label: '角色', fixed: false, defaultVisible: true },
        { prop: 'postName', label: '岗位', fixed: false, defaultVisible: true },
        { prop: 'phone', label: '手机号', fixed: false, defaultVisible: true },
        { prop: 'email', label: '邮箱', fixed: false, defaultVisible: true },
        { prop: 'status', label: '状态', fixed: false, defaultVisible: true },
        { prop: 'createdAt', label: '创建时间', fixed: false, defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        userName: undefined,
        policeNo: undefined,
        sex: undefined,
        phone: undefined,
        status: undefined,
        orgId: undefined,
        roleId: undefined,
        postId: undefined,
        email: undefined,
        createdAtStart: undefined,
        createdAtEnd: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        policeNo: [{ required: true, message: '警号不能为空', trigger: 'blur' }],
        orgId: [{ required: true, message: '归属单位不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getTreeselect()
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then((response) => {
      this.sexOptions = response.data
    })
    this.getConfigKey('sys_user_initPassword').then((response) => {
      this.initPassword = response.data.configValue
    })
    listPost({ pageSize: 1000 }).then((response) => {
      this.postOptions = response.data.list
    })
    listRole({ pageSize: 1000 }).then((response) => {
      this.roleOptions = response.data.list
    })
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listUser(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            // 使用 map 创建新对象，确保 Vue 响应式更新
            this.userList = (response.data.list || []).map((item) => ({ ...item }))
            this.total = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.userList = []
            this.total = 0
            this.msgError(response.msg || '获取用户列表失败')
          }
        })
        .catch((error) => {
          this.msgError('查询用户列表失败：' + (error.message || '未知错误'))
          this.userList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    sexFormat(row) {
      return this.selectDictLabel(this.sexOptions, row.sex)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeselect().then((response) => {
        this.orgOptions = response.data
      })
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'createdAtStart' || key === 'createdAtEnd') &&
          typeof value === 'string'
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString()
          }
        }
      })
      return query
    },

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.userTable) return
      if (!this.userList || !this.userList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.userList.forEach((row) => {
            const userId = row && row.userId
            if (!userId) return
            if (this.selectedUserMap[userId]) {
              this.$refs.userTable.toggleRowSelection(row, true)
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
        (selection || []).map((item) => item && item.userId).filter(Boolean)
      )

      ;(this.userList || []).forEach((row) => {
        const userId = row && row.userId
        if (!userId) return
        if (selectedIdSet.has(userId)) {
          this.selectedUserMap[userId] = row
        } else {
          delete this.selectedUserMap[userId]
        }
      })
      this.selectedUserRecords = Object.values(this.selectedUserMap).filter(Boolean)

      // 更新全选状态
      const totalCount = this.userList.length
      const selectedCount = this.selectedUserRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.userTable.toggleAllSelection()
    },

    /** 用户状态修改 */
    async handleStatusChange(row) {
      try {
        const text = this.statusFormat(row)
        await this.$confirm('确认要"' + text + '""' + row.userName + '"用户吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const response = await changeUserStatus(row)
        if (response.code === 200) {
          this.msgSuccess(text + '成功')
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('操作失败：' + (error.message || '未知错误'))
        }
        row.status = row.status === 2 ? 1 : 2
      }
    },

    /** 重置按钮操作 */
    resetSelected() {
      this.selectedUserMap = {}
      this.selectedUserRecords = []
    },

    /** 重置分页 */
    resetPage() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表
      const quickSearchFields = ['userName', 'policeNo', 'phone', 'sex', 'status']

      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的快速搜索字段
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      // 删除被清空的时间范围字段
      const timeRangeFields = ['createdAtStart', 'createdAtEnd']
      timeRangeFields.forEach(field => {
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

    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'normal') {
        // 正常用户
        this.queryParams.status = 2
      } else if (filterData.filterType === 'disabled') {
        // 禁用用户
        this.queryParams.status = 1
      } else if (filterData.filterType === 'today') {
        // 今日新增
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.createdAtStart = today.toISOString()
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        // 删除被清空的时间范围字段
        const timeRangeFields = ['createdAtStart', 'createdAtEnd']
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.status
        delete this.queryParams.createdAtStart
        delete this.queryParams.createdAtEnd
      }

      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        userName: undefined,
        policeNo: undefined,
        sex: undefined,
        phone: undefined,
        status: undefined,
        orgId: undefined,
        roleId: undefined,
        postId: undefined,
        email: undefined,
        createdAtStart: undefined,
        createdAtEnd: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加用户'
      this.form.password = this.initPassword
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      if (row && row.userId !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedUserRecords[0] ? { ...this.selectedUserRecords[0] } : {}
      }
      this.title = '修改用户'
      this.open = true
    },

    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            if (response.code === 200) {
              this.msgSuccess(response.msg)
            } else {
              this.msgError(response.msg)
            }
          })
        })
        .catch(() => {})
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.userId != null) {
            this.startProcessing('正在修改用户...')
            updateUser(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改用户成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改用户失败')
                }
              })
              .catch((error) => {
                this.msgError('修改用户失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建用户...')
            addUser(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增用户成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增用户失败')
                }
              })
              .catch((error) => {
                this.msgError('新增用户失败：' + (error.message || '未知错误'))
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
        var userIds
        var userCodes
        if (row && row.userId !== undefined) {
          userIds = [row.userId]
          userCodes = row.policeNo
        } else {
          userIds = this.selectedUserRecords.map((item) => item.userId)
          userCodes = this.selectedUserRecords.map((item) => item.policeNo)
        }

        const count = Array.isArray(userIds) ? userIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条用户记录？此操作不可恢复。`
          : `是否确认删除用户"${userCodes}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除用户...')
        const response = await delUser({ ids: userIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除用户成功')
        } else {
          this.msgError(response.msg || '删除用户失败')
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
        userId: undefined,
        orgId: undefined,
        userName: undefined,
        policeNo: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        sex: undefined,
        status: 2,
        remark: undefined,
        postId: undefined,
        roleId: undefined
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
      const saved = localStorage.getItem('sys_user_visible_columns')
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
      localStorage.setItem('sys_user_visible_columns', JSON.stringify(value))
    },

    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
      localStorage.setItem('sys_user_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
    },

    /** 列设置对话框打开后的焦点管理 */
    handleColumnSettingsOpen() {
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },

    /** 列设置对话框关闭后的焦点管理 */
    handleColumnSettingsClose() {
      // 焦点自动返回触发按钮
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedUserRecords) &&
          this.selectedUserRecords.length > 0

        const count = hasSelection ? this.selectedUserRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条用户数据？`
          : '是否确认导出所有用户数据项？'

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
          list = this.selectedUserRecords
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
            const resp = await listUser(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询用户列表失败')
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
          output.sex = this.sexFormat(row)
          output.status = this.statusFormat(row)
          output.createdAt = this.parseTime(row.createdAt)
          // 处理角色、岗位、单位字段
          if (!output.roleName && row.role) {
            output.roleName = row.role.roleName || ''
          }
          if (!output.postName && row.post) {
            output.postName = row.post.postName || ''
          }
          if (!output.orgFullName && row.org) {
            output.orgFullName = row.org.orgFullName || ''
          }
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '用户列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },

    /** 下载模板操作 */
    importTemplate() {
      importTemplate()
        .then((response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = '用户管理模板.xlsx'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
        .catch((error) => {
          console.error(error)
        })
    },

    /** 文件上传中处理 */
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },

    /** 文件上传成功处理 */
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },

    /** 提交上传文件 */
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .detail-dialog, .form-collapse
  - src/styles/components/forms.scss: .section-header, .section-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
