<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <OrgQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          :user-options="allUserOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysOrg:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增组织
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
          </div>
        </div>
        <!--orgList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 orgId
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          v-loading="loading"
          :data="orgList"
          row-key="orgId"
          default-expand-all
          border
          style="width: 100%"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <!-- 组织名称列（包含展开/折叠功能，固定在左侧） -->
          <el-table-column prop="orgName" label="组织名称" min-width="200" fixed="left">
            <template slot-scope="scope">
              <span>{{ scope.row.orgName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orgCode" label="组织编码" width="120" />
          <el-table-column prop="leader" label="负责人" width="150" />
          <el-table-column prop="status" label="状态" width="120">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="2"
                :inactive-value="1"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdAt" width="200">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <!-- 操作列（最后一列，固定在右侧） -->
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="260" fixed="right">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:sysOrg:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['admin:sysOrg:add']"
                  size="small"
                  type="text"
                  icon="el-icon-plus"
                  class="action-btn tertiary"
                  @click="handleAdd(scope.row)"
                >
                  新增
                </el-button>
                <el-button
                  v-permisaction="['admin:sysOrg:remove']"
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

        <!-- 添加或修改组织对话框 -->
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
                  <el-col :span="24">
                    <el-form-item label="上级组织" prop="parentId">
                      <treeselect
                        v-model="form.parentId"
                        :options="orgOptions"
                        :normalizer="normalizer"
                        :show-count="true"
                        placeholder="选择上级组织"
                        :disabled="isEdit"
                        @input="handleParentOrgChange"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="组织名称" prop="orgName">
                      <el-input v-model="form.orgName" placeholder="请输入组织名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="组织编码" prop="orgCode">
                      <el-input v-model="form.orgCode" placeholder="请输入组织编码" :disabled="title !== '添加组织'" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="显示排序" prop="sort">
                      <el-input-number v-model="form.sort" controls-position="right" :min="0" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="负责人" prop="leaderId">
                      <el-select
                        v-model="form.leaderId"
                        placeholder="请选择负责人"
                        clearable
                        filterable
                        class="full-width"
                      >
                        <el-option
                          v-for="user in userOptions"
                          :key="user.userId"
                          :label="user.userName"
                          :value="user.userId"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 联系信息 -->
              <el-collapse-item name="contact" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-phone section-icon" />
                    <span class="section-title">联系信息</span>
                    <span class="section-badge">2项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone">
                      <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
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
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getOrgList, getOrg, delOrg, addOrg, updateOrg, changeOrgStatus } from '@/api/admin/sys-organization'
import { listUser } from '@/api/admin/sys-user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import OrgQueryBar from '@/components/OrgQueryBar/index.vue'

export default {
  name: 'SysOrgManage',
  components: { Treeselect, OrgQueryBar },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      orgList: [],
      // 组织树选项
      orgOptions: [],
      // 用户选项（对话框中使用）
      userOptions: [],
      // 全部用户选项（查询表单中使用）
      allUserOptions: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示弹出层
      open: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'contact'],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        orgName: undefined,
        status: undefined,
        leaderId: undefined
      },
      // 表单参数
      form: {
      },
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        parentId: [
          { required: true, message: '上级组织不能为空', trigger: 'blur' }
        ],
        orgName: [
          { required: true, message: '组织名称不能为空', trigger: 'blur' }
        ],
        orgCode: [
          { required: true, message: '组织编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '菜单顺序不能为空', trigger: 'blur' }
        ],
        leaderId: [
          { required: true, message: '负责人不能为空', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data.map(item => ({
        ...item,
        value: Number(item.value)
      }))
    })
    this.getAllUsers()
  },
  methods: {
    /** 查询组织列表 */
    getList() {
      this.loading = true
      getOrgList(this.queryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根组织的信息（其中孩子又是一个数组，包含若干个对象，即若干个子组织）}]
        this.orgList = response.data
        this.loading = false
      })
    },
    /* 在 Vue.js 应用中，当使用如 Treeselect 这样的树形选择组件时，通常需要将原始数据转换成
    组件所需的特定格式。normalizer 方法就是用来进行这种转换的。例如，后端可能返回的数据结构与
    前端组件要求的结构不完全匹配，通过这种方法可以确保数据的一致性和正确性。 */
    /* 虽然 normalizer 函数本身不包含递归逻辑，但如果它被用在一个自动处理树形数据的组件中，
    如 Treeselect，它会被组件自动多次调用，每次处理一个节点。这样的设计允许函数保持简单和专注于
    单个节点的处理，而复杂的遍历逻辑由组件内部管理。 */
    /** 转换组织数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.orgId,
        label: node.orgName,
        children: node.children
      }
    },
    /** 查询组织下拉树结构 */
    getTreeselect(e) {
      getOrgList().then(response => {
        this.orgOptions = []

        if (e === 'update') {
          const org = { orgId: 0, orgName: '主类目', children: [], isDisabled: true }
          org.children = response.data
          this.orgOptions.push(org)
        } else {
          const org = { orgId: 0, orgName: '主类目', children: [] }
          org.children = response.data
          this.orgOptions.push(org)
        }
      })
    },
    // 字典状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: undefined,
        parentId: undefined,
        orgName: undefined,
        orgCode: undefined,
        sort: 10,
        leaderId: undefined,
        phone: undefined,
        email: undefined,
        status: 2
      }
    },
    /** 刷新列表 */
    handleRefresh() {
      this.getList()
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表
      const quickSearchFields = ['orgName', 'status', 'leaderId']

      // 合并搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的快速搜索字段
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          this.queryParams[field] = undefined
        }
      })

      this.getList()
    },

    handleQuickSearchReset() {
      // 重置查询参数
      this.queryParams = {
        orgName: undefined,
        status: undefined,
        leaderId: undefined
      }
      this.getList()
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.getTreeselect('add')
      if (row !== undefined) {
        this.form.parentId = row.orgId
        // 新增时，加载上级组织的人员列表
        this.getUserListByOrgId(row.orgId)
      } else {
        // 如果没有指定上级组织，加载全体人员
        this.userOptions = this.allUserOptions
      }
      this.open = true
      this.title = '添加组织'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect('update')
      // 修改时，加载本部门的人员列表
      this.getUserListByOrgId(row.orgId)

      getOrg(row.orgId).then(response => {
        this.form = response.data// 只返回一个组织的信息，则是一个对象类型，如果返回的是多个组织信息，则为数组类型
        this.form.sort = String(this.form.sort)
        this.open = true
        this.title = '修改组织'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.sort = parseInt(this.form.sort)
          if (this.form.orgId !== undefined) {
            updateOrg(this.form, this.form.orgId).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addOrg(this.form).then(response => {
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
    /** 删除按钮操作 */
    /* 这种写法在 JavaScript 中是一种常见的技巧，用于根据条件简洁地设置变量值。
    如果 row.orgId 存在且其值为真值（truthy，即不是 null、undefined、0、NaN、"" 或 false），
    则整个表达式的结果将是 [row.orgId]，这是一个只包含 row.orgId 的数组 ，Ids 将被赋值为该数组
    如果 row.orgId 不存在或其为假值（falsy），则(row.orgId && [row.orgId]) 表达式的结果将是 false，
    此时Ids 将被赋值为 this.ids*/
    handleDelete(row) {
      const Ids = (row.orgId && [row.orgId]) || this.ids
      this.$confirm(
        '是否确认删除名称为"' + row.orgName + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delOrg({ 'ids': Ids })
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
    // 组织状态修改
    handleStatusChange(row) {
      const text = row.status === 2 ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.orgName + '"组织吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeOrgStatus(row.orgId, row.status)
      }).then((res) => {
        this.msgSuccess(res.msg)
      }).catch(function() {
        row.status = row.status === 2 ? 1 : 2
      })
    },
    /** 获取全体人员列表（用于查询表单） */
    getAllUsers() {
      listUser({ pageIndex: 1, pageSize: 10000 })
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.allUserOptions = response.data.list || []
          } else {
            console.error('获取全体人员列表失败，响应码:', response.code)
            this.allUserOptions = []
          }
        })
        .catch((error) => {
          console.error('获取全体人员列表失败:', error)
          this.allUserOptions = []
        })
    },
    /** 根据组织ID获取人员列表 */
    getUserListByOrgId(orgId) {
      // 如果是主类目（orgId为0），加载全体人员
      if (orgId === 0) {
        this.userOptions = [...this.allUserOptions]
        return
      }

      listUser({ orgId: '/' + orgId + '/', pageIndex: 1, pageSize: 10000 })
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.userOptions = response.data.list || []
          } else {
            console.error('获取组织人员列表失败，响应码:', response.code)
            this.userOptions = []
          }
        })
        .catch((error) => {
          console.error('获取组织人员列表失败:', error)
          this.userOptions = []
        })
    },
    /** 上级组织变更时的处理（仅在新增时生效） */
    handleParentOrgChange(orgId) {
      if (!this.isEdit && orgId !== undefined) {
        // 清空已选择的负责人
        this.form.leaderId = undefined

        // 加载新选择的上级组织的人员列表
        this.getUserListByOrgId(orgId)
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
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
