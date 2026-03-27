<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-row :gutter="20">
          <!--用户数据-->
          <el-col :span="24">
            <el-form
              ref="queryForm"
              :model="queryParams"
              :inline="true"
              label-width="68px"
            >
              <el-form-item label="用户名称" prop="userName">
                <el-input
                  v-model="queryParams.userName"
                  placeholder="请输入用户名称"
                  clearable
                  size="small"
                  style="width: 160px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="性别" prop="sex">
                <el-select
                  v-model="queryParams.sex"
                  placeholder="请选择"
                  clearable
                  size="small"
                  style="width: 160px"
                >
                  <el-option
                    v-for="dict in sexOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="queryParams.phone"
                  placeholder="请输入手机号码"
                  clearable
                  size="small"
                  style="width: 160px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="角色" prop="roleId">
                <el-select
                  v-model="queryParams.roleId"
                  placeholder="请选择角色"
                  clearable
                  @change="$forceUpdate()"
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
              <el-form-item label="岗位" prop="postId">
                <el-select
                  v-model="queryParams.postId"
                  placeholder="请选择岗位"
                  clearable
                  @change="$forceUpdate()"
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
              <el-form-item label="组织" prop="orgId">
                <treeselect
                  v-model="queryParams.orgId"
                  :options="orgOptions"
                  placeholder="请选择组织"
                  style="width: 170px"
                  clearable
                />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="queryParams.status"
                  placeholder="用户状态"
                  clearable
                  size="small"
                  style="width: 160px"
                >
                  <el-option
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  size="mini"
                  @click="handleQuery"
                >搜索</el-button>
                <el-button
                  icon="el-icon-refresh"
                  size="mini"
                  @click="resetQuery"
                >重置</el-button>
              </el-form-item>
            </el-form>

            <div
              style="display: flex; align-items: center; margin-bottom: 8px; gap: 10px"
            >
              <el-button
                v-permisaction="['admin:sysUser:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新增</el-button>
              <el-button
                v-permisaction="['admin:sysUser:edit']"
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="selectedUserRecords.length !== 1"
                @click="handleUpdate"
              >修改</el-button>
              <el-button
                v-permisaction="['admin:sysUser:remove']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedUserRecords.length === 0"
                @click="handleDelete"
              >删除</el-button>
              <el-button
                v-permisaction="['admin:sysUser:import']"
                type="warning"
                icon="el-icon-upload"
                size="mini"
                @click="handleImport"
              >导入</el-button>
              <el-button
                v-permisaction="['admin:sysUser:export']"
                type="warning"
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
              >导出</el-button>
              <div style="flex: 1" />
              <div class="column-settings-trigger">
                <el-popover placement="bottom-end" width="300" trigger="click">
                  <div class="column-settings">
                    <div class="column-settings-header">
                      <span>列显示设置</span>
                      <el-button
                        type="text"
                        size="mini"
                        @click="resetColumns"
                      >重置</el-button>
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
                        <el-checkbox :label="col.prop" :disabled="col.fixed">
                          {{ col.label }}
                        </el-checkbox>
                      </div>
                    </el-checkbox-group>
                  </div>
                  <el-button
                    slot="reference"
                    size="mini"
                    icon="el-icon-setting"
                  >列设置</el-button>
                </el-popover>
              </div>
            </div>

            <div style="overflow-x: auto">
              <el-table
                ref="userTable"
                v-loading="loading"
                :data="userList"
                border
                style="min-width: 100%"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChang"
              >
                <el-table-column type="selection" width="50" align="center" />
                <el-table-column
                  label="操作"
                  min-width="180"
                  fix="right"
                  class-name="small-padding fixed-width"
                >
                  <template slot-scope="scope">
                    <el-button
                      v-permisaction="['admin:sysUser:edit']"
                      size="mini"
                      type="text"
                      icon="el-icon-edit"
                      @click="handleUpdate(scope.row)"
                    >修改</el-button>
                    <el-button
                      v-if="scope.row.userId !== 1"
                      v-permisaction="['admin:sysUser:remove']"
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      @click="handleDelete(scope.row)"
                    >删除</el-button>
                    <el-button
                      v-permisaction="['admin:sysUser:resetPassword']"
                      size="mini"
                      type="text"
                      icon="el-icon-key"
                      @click="handleResetPwd(scope.row)"
                    >重置</el-button>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="isColumnVisible('policeNo')"
                  label="警号"
                  prop="policeNo"
                  sortable="custom"
                  min-width="100"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('userName')"
                  label="登录名"
                  prop="userName"
                  sortable="custom"
                  min-width="100"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('sex')"
                  label="性别"
                  prop="sex"
                  min-width="80"
                >
                  <template slot-scope="scope">
                    {{ sexFormat(scope.row) }}
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="isColumnVisible('orgName')"
                  label="组织"
                  prop="orgName"
                  min-width="100"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('orgFullName')"
                  label="组织全称"
                  prop="orgFullName"
                  min-width="120"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('roleName')"
                  label="角色"
                  prop="roleName"
                  min-width="100"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('postName')"
                  label="岗位"
                  prop="postName"
                  min-width="100"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('phone')"
                  label="手机号"
                  prop="phone"
                  min-width="120"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('email')"
                  label="邮箱"
                  prop="email"
                  min-width="120"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  v-if="isColumnVisible('status')"
                  label="状态"
                  min-width="80"
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
                  prop="createdAt"
                  sortable="custom"
                  min-width="140"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createdAt) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <pagination
              v-show="total > 0"
              :total="total"
              :page.sync="queryParams.pageIndex"
              :limit.sync="queryParams.pageSize"
              @pagination="getList"
            />
          </el-col>
        </el-row>
      </el-card>
      <!-- 添加或修改参数配置对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
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
            <el-col :span="12">
              <el-form-item label="用户性别">
                <el-select v-model="form.sex" placeholder="请选择">
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

            <el-col :span="12">
              <el-form-item label="岗位">
                <el-select
                  v-model="form.postId"
                  placeholder="请选择岗位"
                  @change="$forceUpdate()"
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
                  @change="$forceUpdate()"
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
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  placeholder="请输入内容"
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
      <!-- 用户导入对话框 -->
      <el-dialog
        :title="upload.title"
        :visible.sync="upload.open"
        width="400px"
        :close-on-click-modal="false"
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
              @click="importTemplate0"
            >下载模板</el-link>
          </div>
          <div slot="tip" class="el-upload__tip" style="color: red">
            提示:仅允许导入“xls”或“xlsx”格式文件!
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listUser,
  getUser,
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

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysUserManage',
  /* components: { Treeselect } 是 Vue 组件的一个部分，表示在当前组件中注册了一个名为 Treeselect 的子组件。这样做的目的是为了在模板中使用 Treeselect 组件。*/
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 单位树选项
      orgOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 单位名称
      orgName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/api/v1/user/importuser'
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        userName: undefined,
        sex: undefined,
        phone: undefined,
        status: undefined,
        orgId: undefined,
        roleId: undefined,
        postId: undefined
      },
      // 使用 Map 存储所有选中的项（跨分页）
      selectedUserMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的文书记录
      selectedUserRecords: [],
      // 导出相关
      processingInstance: null,
      previousCursor: null,
      // 列配置选项
      columnOptions: [
        { prop: 'policeNo', label: '警号', fixed: true },
        { prop: 'userName', label: '登录名', fixed: false },
        { prop: 'sex', label: '性别', fixed: false },
        { prop: 'orgName', label: '组织', fixed: false },
        { prop: 'orgFullName', label: '组织全称', fixed: false },
        { prop: 'roleName', label: '角色', fixed: false },
        { prop: 'postName', label: '岗位', fixed: false },
        { prop: 'phone', label: '手机号', fixed: false },
        { prop: 'email', label: '邮箱', fixed: false },
        { prop: 'status', label: '状态', fixed: false },
        { prop: 'createdAt', label: '创建时间', fixed: false }
      ],
      // 可见列
      visibleColumns: [],
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
            message: "'请输入正确的邮箱地址",
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
      }
    }
  },
  watch: {
    // 根据名称筛选单位树，调用了filterNode，就无需调用this.$refs.tree.filter
    orgName(val) {
      // this.$refs.tree.filter(val)
    }
  },
  created() {
    // 初始化可见列
    this.initVisibleColumns()
    this.getList()
    this.getTreeselect()
    this.getDicts('sys_normal_disable').then((response) => {
      // 将字典数据的value统一转换为整型
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then((response) => {
      // 将字典数据的value统一转换为整型
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
            this.userList = response.data.list
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
    /** 查询单位下拉树结构 */
    getTreeselect() {
      orgTreeselect().then((response) => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(单位名称):  children []]})，这里将返回所有单位
      })
    },
    /* 筛选节点，el-tree 组件会在每次输入orgName更新时自动调用 filterNode 方法，并将当前的搜索词（value）和每个节点的数据（data）作为参数传递给该方法。
    filterNode 方法会检查节点的 label 是否包含搜索词，如果包含则返回 true 以显示该节点，否则返回 false 以隐藏该节点。*/
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
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
          this.isRestoringSelection = false
        }
      })
    },
    /** 转换菜单数据结构 ，目前没有使用，暂时保留*/
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.label,
        children: node.children
      }
    },
    /** 排序回调函数 ，第一次点击列头则升序排列；第二次点击列头则降序排列，第三次点击列头则默认排序*/
    handleSortChang(column, prop, order) {
      prop = column.prop
      order = column.order
      if (this.order !== '' && this.order !== prop + 'Order') {
        this.queryParams[this.order] = undefined
      }
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
        this.order = prop + 'Order'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
        this.order = prop + 'Order'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }
      this.getList()
    },
    // 用户状态修改
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
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 搜索按钮操作
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedUserMap = {}
      this.selectedUserRecords = []
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.userId).filter(Boolean)
      );

      (this.userList || []).forEach((row) => {
        const userId = row && row.userId
        if (!userId) return
        if (selectedIdSet.has(userId)) {
          this.selectedUserMap[userId] = row
        } else {
          delete this.selectedUserMap[userId]
        }
      })
      this.selectedUserRecords = Object.values(this.selectedUserMap).filter(Boolean)
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()

      this.open = true
      this.title = '添加用户'
      this.form.password = this.initPassword
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      // 使用对象展开运算符创建新对象
      if (row && row.userId !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedUserRecords[0] ? { ...this.selectedUserRecords[0] } : {}
      }
      this.title = '修改用户'
      this.open = true
      listPost({ pageSize: 1000 }).then((response) => {
        this.postOptions = response.data.list
      })
      listRole({ pageSize: 1000 }).then((response) => {
        this.roleOptions = response.data.list
      })
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
    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      // 鼠标切换为等待状态
      this.previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      // 恢复鼠标状态
      document.body.style.cursor = this.previousCursor
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

        await this.$confirm(
          '是否确认删除用户编号为"' + userCodes + '"的数据项?',
          '信息',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        this.startProcessing('正在删除用户...')
        const response = await delUser({ ids: userIds })
        if (response.code === 200) {
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
          this.msgError('删除用户失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem('sys_user_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions.map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions.map((item) => item.prop)
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
      this.visibleColumns = this.columnOptions.map((item) => item.prop)
      localStorage.setItem(
        'sys_user_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },
    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
    },
    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
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

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedUserRecords) && this.selectedUserRecords.length > 0

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedUserRecords.length} 条用户数据？`
          : '是否确认导出所有用户数据项？'

        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        const columnOptions = Array.isArray(this.columnOptions) ? this.columnOptions : []
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

        const formatDateTime = (value) => {
          if (!value) return '-'
          try {
            return this.parseTime ? this.parseTime(value) : value
          } catch (error) {
            return value
          }
        }

        const formatStatus = (value) => {
          return this.selectDictLabel(this.statusOptions || [], value) || value
        }

        const formatSex = (value) => {
          return this.selectDictLabel(this.sexOptions || [], value) || value
        }

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row }
          output.sex = formatSex(row.sex)
          output.status = formatStatus(row.status)
          output.createdAt = formatDateTime(row.createdAt)
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
      } finally {
      }
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate0() {
      importTemplate()
        .then((response) => {
          // 创建 file对象
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          // 创建一个链接
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = '用户管理模板.xlsx' // 文件名
          document.body.appendChild(link)
          link.click() // 触发下载
          document.body.removeChild(link) // 下载后将链接移除
        })
        .catch((error) => {
          console.error(error)
        })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理,response就是后端返回的响应消息
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles() // 清除上传组件中的文件列表
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style scoped>
.column-settings-trigger {
  text-align: right;
}

.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.column-item {
  padding: 5px 0;
}

::v-deep .el-table {
  width: 100% !important;
  table-layout: auto !important;
}

::v-deep .el-table__body-wrapper {
  width: 100% !important;
}

::v-deep .el-table__header-wrapper {
  width: 100% !important;
}

::v-deep .el-table th {
  background-color: #f5f7fa;
}
</style>
