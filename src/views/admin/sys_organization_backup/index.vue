<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form :inline="true">
          <el-form-item label="组织名称">
            <el-input
              v-model="queryParams.orgName"
              placeholder="请输入组织名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="组织状态" clearable size="small">
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
              class="filter-item"
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >搜索</el-button>
            <el-button
              v-permisaction="['admin:sysOrg:add']"
              class="filter-item"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-form-item>
        </el-form>
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
          row-key="Id"
          default-expand-all
          border
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column prop="orgName" label="组织名称" />
          <!--<el-table-column prop="status" label="状态" :formatter="statusFormat" width="100">在<template slot-scope="scope">中已经调用了statusFormat，这里就不需要了-->
          <el-table-column prop="xtZxbz" label="状态" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.XtZxbz === 1 ? 'danger' : 'success'"
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdAt" width="200">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysOrg:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-permisaction="['admin:sysOrg:add']"
                size="mini"
                type="text"
                icon="el-icon-plus"
                @click="handleAdd(scope.row)"
              >新增</el-button>
              <!--v-if="scope.row.p_id != 0",这个属性注释掉，因为p_id根本不存在-->
              <el-button
                v-permisaction="['admin:sysOrg:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加或修改组织对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="上级组织" prop="parentId">
                  <treeselect
                    v-model="form.sjdwdmId"
                    :options="orgOptions"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="选择上级组织"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- prop="orgName" 告诉 Element UI 的表单验证系统，这个表单项应该使用 rules 对象中定义的 orgName 规则进行校验。-->
                <el-form-item label="组织名称" prop="orgName">
                  <el-input v-model="form.orgName" placeholder="请输入组织名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组织等级" prop="orgLevel">
                  <el-input v-model="form.orgLevel" placeholder="请输入组织等级" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组织简称" prop="orgJc">
                  <el-input v-model="form.orgJc" placeholder="请输入组织简称" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="警种属性" prop="jzSx">
                  <el-input v-model="form.jzSx" placeholder="请输入警种属性" maxlength="11" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组织状态">
                  <!--当用户选择一个单选按钮时，form.status 的值将被更新为该按钮的 label（或者更准确地说是 :label 绑定的值）。-->
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
          </el-form>
          <div slot="footer" class="dialog-footer">
            <!--primary 类型通常具有一个更明显的样式，比如蓝色背景-->
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getOrgList, getOrg, delOrg, addOrg, updateOrg } from '@/api/admin/sys-organization'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysOrganizationManage',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      orgList: [],
      // 组织树选项
      orgOptions: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        orgName: undefined,
        status: undefined
      },
      // 表单参数
      form: {
      },
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        sjdwdmId: [
          { required: true, message: '上级组织不能为空', trigger: 'blur' }
        ],
        orgName: [
          { required: true, message: '组织名称不能为空', trigger: 'blur' }
        ],
        orgLevel: [
          { required: true, message: '组织等级不能为空', trigger: 'blur' }
        ],
        jzSx: [
          { required: true, message: '警种属性不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
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
    getTreeselect() {
      getOrgList().then(response => {
        this.orgOptions = []
        /* isDisabled: true，这个属性通常用于控制节点的可交互性。设置为 true 表示这个节点在
        用户界面上不能被选择或操作。 在这里，根节点不可被操作，也即整个组织树是不可被操作的.既然<treeselect>组件使用了disabled属性，这里就没有必要再做特殊处理了
        if (e === 'update') {
          const org = { orgId: 0, orgName: '主类目', children: [], isDisabled: true }
          org.children = response.data
          this.orgOptions.push(org)
        } else {
          const org = { orgId: 0, orgName: '主类目', children: [] }
          org.children = response.data
          this.orgOptions.push(org)
        }*/
        const org = { id: 0, orgName: '主类目', children: [] }
        org.children = response.data
        this.orgOptions.push(org)
      })
    },
    // 字典状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, parseInt(row.status))
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        sjdwdmId: undefined,
        orgName: undefined,
        orgLevel: undefined,
        orgJc: undefined,
        jzSx: undefined,
        xtZxbz: '2'
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row !== undefined) {
        this.form.id = row.id
      }
      this.open = true
      this.title = '添加组织'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()

      getOrg(row.id).then(response => {
        this.form = response.data// 只返回一个组织的信息，则是一个对象类型，如果返回的是多个组织信息，则为数组类型
        this.form.status = String(this.form.status)
        this.open = true
        this.title = '修改组织'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.status = parseInt(this.form.status)
          if (this.form.id !== undefined) {
            updateOrg(this.form, this.form.id).then(response => {
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
      const Ids = (row.id && [row.id]) || this.ids
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
    }
  }
}
</script>
