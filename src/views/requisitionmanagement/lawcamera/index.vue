<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="执法仪编号" prop="No">
            <el-input
              v-model="queryParams.no"
              placeholder="请输入执法仪编号"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="执法仪名称" prop="Name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入执法仪名称"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="管理组织" prop="managerOrgId">
            <treeselect
              v-model="queryParams.managerOrgId"
              :options="orgOptions"
              placeholder="请选择管理组织"
              style="width: 170px;"
            />
          </el-form-item>
          <el-form-item label="管理人员">
            <el-select
              v-model="queryParams.managerId"
              placeholder="请选择管理人员"
              style="width: 170px;"
              clearable
              @change="$forceUpdate()"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="使用状态">
            <el-select v-model="queryParams.useState" placeholder="使用状态" clearable style="width: 170px;">
              <el-option
                v-for="dict in useStatusOptions"
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
        <!--orgList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          v-loading="loading"
          :data="lawcameraRequisitionList"
          row-key="id"
          default-expand-all
          border
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column prop="no" label="编号" width="80" />
          <el-table-column prop="name" label="名称" width="100" />
          <el-table-column prop="managerName" label="管理人员" width="80" />
          <el-table-column prop="managerOrgFullName" label="管理组织" width="300" />
          <el-table-column prop="useState" label="领用状态" width="80">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.useState === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ useStatusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="requisitionerName" label="领用者" width="80" />
          <el-table-column prop="requisitionerOrgFullName" label="领用者组织" width="300" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="250"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.useState === 0"
                v-permisaction="['lawcamera:requisition']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleRequisition(scope.row)"
              >领用</el-button>
              <el-button
                v-if="scope.row.useState !== 0 && userId === scope.row.requisitionerId"
                v-permisaction="['lawcamera:return']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                style="color: #ff0000;"
                @click="handleReturn(scope.row)"
              >退还</el-button>
              <el-button
                v-permisaction="['lawcamera:info']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >执法仪信息</el-button>
              <el-button
                v-permisaction="['lawcamera:requisitionrecord']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="requisitionLog(scope.row.no)"
              >领用记录</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--展示领用记录-->
        <el-dialog :title="title" :visible.sync="requisitionLogOpen" width="800px" :close-on-click-modal="false">
          <el-table
            v-loading="loading"
            :data="requisitionLogList"
            row-key="id"
            default-expand-all
            border
          >
            <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
            <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
            <el-table-column prop="lawcameraNo" label="执法仪编号" width="100" />
            <el-table-column prop="lawcameraName" label="执法仪名称" width="100" />
            <el-table-column prop="requisitionerName" label="领用人" width="100" />
            <el-table-column prop="requisitionerOrgName" label="领用人组织" width="250" />
            <el-table-column prop="requisitionStartTime" label="领用开始时间" width="100" />
            <el-table-column prop="requisitionEndTime" label="领用结束时间" width="100" />
          </el-table>
        </el-dialog>
        <!--显示详情-->
        <el-dialog :title="title" :visible.sync="ViewOpen" width="593px" :close-on-click-modal="false">
          <el-table
            v-loading="loading"
            :data="AttributeValueList"
            border
          >
            <el-table-column prop="AttributeName" label="属性" width="100" align="center" />
            <el-table-column prop="Value" label="值" width="450" align="center" />
          </el-table>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getLawcameraRequisitionList, getLawCameraLogList, lawcameraRequisition, lawcameraReturn } from '@/api/admin/lawcamera_requisition_manage_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listUser } from '@/api/admin/sys-user'
export default {
  name: 'LawCaremaRequisition',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 执法仪数据
      lawcameraRequisitionList: [],
      // 领用记录数据
      requisitionLogList: [],
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加执法仪对话框
      open: false,
      ViewOpen: false,
      // 是否显示领用记录对话框
      requisitionLogOpen: false,
      // 状态数据字典
      stateOptions: [],
      // 是否可用数据字典
      useStatusOptions: [],
      // 查询参数
      queryParams: {
        name: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        useState: undefined
      },
      AttributeValueList: [],
      ColumnNameConvert: new Map([
        ['no', '编号'],
        ['name', '名称'],
        ['cpu', 'CPU'],
        ['memory', '内存(G)'],
        ['disk', '存储(G)'],
        ['networkCard', '网卡'],
        ['usbNum', 'USB数量'],
        ['system', '操作系统'],
        ['version', '版本'],
        ['buyTime', '购买时间'],
        ['remark', '备注']
      ]),
      // 表单参数
      form: {
      },
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ]
      }

    }
  },
  computed: {
    userId() {
      return this.$store.state.user.userid
    },
    orgId() {
      return this.$store.state.user.orgid
    }
  },
  watch: {
    'queryParams.managerOrgId': function(newVal) {
      // 当 queryParams.managerOrgId 更新时，调用 getQueryUser
      if (newVal) {
        this.queryParams.managerId = null // 清空管理人员选择
        this.getQueryUser()
      }
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
    this.getDicts('lawcamera_state').then(response => {
      this.stateOptions = response.data
    })
    this.getDicts('collect_status').then(response => {
      this.useStatusOptions = response.data
    })
  },
  methods: {
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then(response => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },
    /** 查询执法仪列表 */
    getList() {
      this.loading = true
      getLawcameraRequisitionList(this.queryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根组织的信息（其中孩子又是一个数组，包含若干个对象，即若干个子组织）}]
        this.lawcameraRequisitionList = response.data.list
        this.loading = false
      })
    },
    handleRequisition(row) {
      lawcameraRequisition({ id: row.id }).then(response => {
        if (response.msg === '领用成功') {
          this.$confirm('领用成功！', '信息', {
            confirmButtonText: '确定',
            type: 'info'
          }).then(this.getList())
        }
      })
    },
    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(response => {
        this.userOptions = response.data.list
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleReturn(row) {
      lawcameraReturn({ id: row.id }).then(response => {
        if (response.msg === '退还成功') {
          this.$confirm('退还成功！', '信息', {
            confirmButtonText: '确定',
            type: 'info'
          }).then(this.getList())
        }
      })
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.AttributeValueList = []
      Object.keys(row).forEach(key => {
        const attributeValue = {
          AttributeName: this.ColumnNameConvert.get(key),
          Value: row[key]
        }
        if (attributeValue.AttributeName !== undefined) {
          this.AttributeValueList.push(attributeValue)
        }
      })
      this.ViewOpen = true
      this.title = '执法仪信息'
    },

    /** 查询领用记录 */
    getRequisitionLog(no) {
      this.loading = true
      getLawCameraLogList({ no: no }).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根组织的信息（其中孩子又是一个数组，包含若干个对象，即若干个子组织）}]
        this.requisitionLogList = response.data.list
        this.loading = false
      })
    },
    // 表单重置
    reset() {
      this.form = {
        no: undefined,
        org_id: undefined,
        police_id: undefined,
        alias: undefined,
        enable_use: '0',
        state: '0',
        brand_id: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        usb_num: undefined,
        system: undefined,
        version: undefined,
        remark: undefined
      }
    },
    // 字典状态字典翻译
    useStatusFormat(row) {
      return this.selectDictLabel(this.useStatusOptions, parseInt(row.useState))
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 查看领用记录 */
    requisitionLog(no) {
      this.title = '领用记录'
      this.requisitionLogOpen = true
      this.getRequisitionLog(no)
    }
  }
}
</script>
