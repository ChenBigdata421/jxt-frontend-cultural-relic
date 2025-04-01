<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-row :gutter="20">
          <!--部门数据-->
          <el-col :span="4" :xs="24">
            <div class="head-container">
              <el-input
                v-model="orgName"
                placeholder="请输入单位名称"
                clearable
                size="small"
                prefix-icon="el-icon-search"
                style="margin-bottom: 20px"
              />
            </div>
            <div class="head-container">
              <el-tree
                ref="tree"
                :data="orgOptions"
                :props="defaultProps"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                default-expand-all
                @node-click="handleNodeClick"
              />
            </div>
          </el-col>
          <!--用户数据-->
          <el-col :span="20" :xs="24">
            <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
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
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:add']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                >新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="no_single"
                  @click="handleUpdate"
                >修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="zero"
                  @click="handleDelete"
                >删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:import']"
                  type="warning"
                  icon="el-icon-upload"
                  size="mini"
                  @click="handleImport"
                >导入</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:export']"
                  type="info"
                  icon="el-icon-download"
                  size="mini"
                  @click="handleExport"
                >导出</el-button>
              </el-col>
            </el-row>

            <el-table
              v-loading="loading"
              :data="userList"
              border
              @selection-change="handleSelectionChange"
              @sort-change="handleSortChang"
            >
              <el-table-column type="selection" width="45" align="center" />
              <el-table-column label="编号" width="75" prop="userId" sortable="custom" />
              <el-table-column label="登录名" width="105" prop="userName" sortable="custom" :show-overflow-tooltip="true" />
              <el-table-column label="昵称" prop="nickName" :show-overflow-tooltip="true" />
              <el-table-column label="性别" prop="sexName" />
              <el-table-column label="单位" prop="orgName" :show-overflow-tooltip="true" />
              <el-table-column label="角色" prop="roleName" :show-overflow-tooltip="true" />
              <el-table-column label="岗位" prop="postName" :show-overflow-tooltip="true" />
              <el-table-column label="手机号" prop="phone" width="108" />
              <el-table-column label="邮箱" prop="email" width="108" />
              <el-table-column label="状态" width="80" sortable="custom">
                <template slot-scope="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="2"
                    inactive-value="1"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="创建时间"
                prop="createdAt"
                sortable="custom"
                width="155"
              >
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createdAt) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="160"

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
            </el-table>

            <pagination
              v-show="total>0"
              :total="total"
              :page.sync="queryParams.pageIndex"
              :limit.sync="queryParams.pageSize"
              @pagination="getList"
            />
          </el-col>
        </el-row>
      </el-card>
      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
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
                <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
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
              <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
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
                <el-select v-model="form.postId" placeholder="请选择" @change="$forceUpdate()">
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
                <el-select v-model="form.roleId" placeholder="请选择" @change="$forceUpdate()">
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
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" :close-on-click-modal="false">
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
            <el-link type="info" style="font-size:12px" @click="importTemplate0">下载模板</el-link>
          </div>
          <div slot="tip" class="el-upload__tip" style="color:red">提示:仅允许导入“xls”或“xlsx”格式文件!</div>
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
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus, importTemplate } from '@/api/admin/sys-user'
import { getToken } from '@/utils/auth'

import { listPost } from '@/api/admin/sys-post'
import { listRole } from '@/api/admin/sys-role'
import { orgTreeselect } from '@/api/admin/sys-organization'
import { formatJson } from '@/utils'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysUserManage',
  /*components: { Treeselect } 是 Vue 组件的一个部分，表示在当前组件中注册了一个名为 Treeselect 的子组件。这样做的目的是为了在模板中使用 Treeselect 组件。*/
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      no_single: true,
      // 非多个禁用
      zero: true,
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
        phone: undefined,
        status: undefined,
        orgId: undefined
      },
      // 表单校验
      rules: {
        userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        orgId: [{ required: true, message: '归属单位不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          { type: 'email', message: "'请输入正确的邮箱地址", trigger: ['blur', 'change'] }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
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
    this.getList()
    this.getTreeselect()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then(response => {
      this.sexOptions = response.data
    })
    this.getConfigKey('sys_user_initPassword').then(response => {
      this.initPassword = response.data.configValue
    })
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.data.list.map(item => {
          return {
            ...item,
            roleName: item.role ? item.role.roleName : '',
            postName: item.post ? item.post.postName : '',
            statusName: this.status_format(item.status),
            sexName: this.sex_format(item.sex)
          }
        })
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    /** 查询单位下拉树结构 */
    getTreeselect() {
      orgTreeselect().then(response => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(单位名称):  children []]})，这里将返回所有单位
      })
    },
    /* 筛选节点，el-tree 组件会在每次输入deptName更新时自动调用 filterNode 方法，并将当前的搜索词（value）和每个节点的数据（data）作为参数传递给该方法。
    filterNode 方法会检查节点的 label 是否包含搜索词，如果包含则返回 true 以显示该节点，否则返回 false 以隐藏该节点。*/
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = '/' + data.id + '/'// 比如：/0/1/7/，/0/1/7/8，通过搜索/7/，就可以将该部门以及它的下级部门都搜索出来
      this.getList()
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
    handleStatusChange(row) {
      const text = row.status === '2' ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.userName + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeUserStatus(row)
      }).then(() => {
        this.msgSuccess(text + '成功')
      }).catch(function() {
        row.status = row.status === '2' ? '1' : '2'
      })
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
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        sex: undefined,
        status: '2',
        remark: undefined,
        postIds: undefined,
        roleIds: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.deptId = ''
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.no_single = selection.length !== 1
      this.zero = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()

      listPost({ pageSize: 1000 }).then(response => {
        this.postOptions = response.data.list
      })
      listRole({ pageSize: 1000 }).then(response => {
        this.roleOptions = response.data.list
      })
      this.open = true
      this.title = '添加用户'
      this.form.password = this.initPassword
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()

      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改用户'
        this.form.password = ''
      })
      listPost({ pageSize: 1000 }).then(response => {
        this.postOptions = response.data.list
      })
      listRole({ pageSize: 1000 }).then(response => {
        this.roleOptions = response.data.list
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
          } else {
            this.msgError(response.msg)
          }
        })
      }).catch(() => {})
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.userId !== undefined) {
            updateUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    // 字典翻译
    sex_format(value) {
      return this.selectDictLabel(this.sexOptions, parseInt(value))
    },
    status_format(value) {
      return this.selectDictLabel(this.statusOptions, parseInt(value))
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const Ids = (row.userId && [row.userId]) || this.ids
      this.$confirm('是否确认删除用户编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delUser({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有用户数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['用户编号', '登录名', '昵称', '性别', '部门', '角色', '岗位', '手机', '邮箱', '状态', '创建时间']
          const filterVal = ['userId', 'userName', 'nickName', 'sexName', 'deptName', 'roleName', 'postName', 'phone', 'email', 'statusName', 'createdAt']
          const list = this.userList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '用户管理',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate0() {
      importTemplate().then(response => {
        // 创建 file对象
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        // 创建一个链接
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = '用户管理模板.xlsx' // 文件名
        document.body.appendChild(link)
        link.click() // 触发下载
        document.body.removeChild(link) // 下载后将链接移除
      }).catch((error) => {
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
      this.$refs.upload.clearFiles()// 清除上传组件中的文件列表
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
