<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="执法仪别名">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入执法仪别名"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="归属部门">
            <treeselect
              v-model="queryParams.managerDeptId"
              :options="deptOptions"
              placeholder="请选择归属部门"
              style="width: 170px;"
            />
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
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >搜索</el-button>
          </el-form-item>
        </el-form>
        <!--deptList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          v-loading="loading"
          :data="lawcameraCollectList"
          row-key="id"
          default-expand-all
          border
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column prop="no" label="编号" width="80" />
          <el-table-column prop="name" label="名称" width="100" />
          <el-table-column prop="managerName" label="管理员" width="80" />
          <el-table-column prop="managerDeptAllName" label="管理员部门" width="150" />
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
          <el-table-column prop="collectorName" label="领用者" width="80" />
          <el-table-column prop="collectorDeptAllName" label="领用者部门" width="150" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="250"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.useState === 0"
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleCollect(scope.row)"
              >领用</el-button>
              <el-button
                v-if="scope.row.useState !== 0 && userId === scope.row.collectorId"
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                style="color: #ff0000;"
                @click="handleReturn(scope.row)"
              >退还</el-button>
              <el-button
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >执法仪信息</el-button>
              <el-button
                v-permisaction="['admin:sysRole:remove']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="collectLog(scope.row.no)"
              >领用记录</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--展示领用记录-->
        <el-dialog :title="title" :visible.sync="collectLogOpen" width="1000px" :close-on-click-modal="false">
          <el-table
            v-loading="loading"
            :data="collectLogList"
            row-key="id"
            default-expand-all
            border
          >
            <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
            <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
            <el-table-column prop="no" label="执法仪编号" width="100" />
            <el-table-column prop="name" label="执法仪名称" width="100" />
            <el-table-column prop="collectorName" label="领用人" width="100" />
            <el-table-column prop="collectorDeptAllName" label="领用人部门" width="150" />
            <el-table-column prop="collectStartTime" label="领用开始时间" width="100" />
            <el-table-column prop="collectEndTime" label="领用结束时间" width="100" />
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
import { getLawcameraCollectList, getLawCameraLogList, lawcameraCollect, lawcameraReturn } from '@/api/admin/lawcamera_collect_manage_api'
import { deptTreeselect } from '@/api/admin/sys-dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'LawCaremaCollect',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 执法仪数据
      lawcameraCollectList: [],
      // 领用记录数据
      collectLogList: [],
      // 部门树选项
      deptOptions: undefined,
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加执法仪对话框
      open: false,
      ViewOpen: false,
      // 是否显示领用记录对话框
      collectLogOpen: false,
      // 状态数据字典
      stateOptions: [],
      // 是否可用数据字典
      useStatusOptions: [],
      // 查询参数
      queryParams: {
        name: undefined,
        managerDeptId: undefined,
        useState: undefined
      },
      tempQueryParams: {
        name: undefined,
        managerDeptId: undefined,
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
    deptId() {
      return this.$store.state.user.deptid
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
    /** 查询部门下拉树结构 */
    getTreeselect() {
      deptTreeselect().then(response => {
        this.deptOptions = response.data // 返回数组类型；[id:    label(部门名称):  children []]})，这里将返回所有部门
      })
    },
    /** 查询执法仪列表 */
    getList() {
      this.loading = true
      this.setTempQueryParams()
      getLawcameraCollectList(this.tempQueryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根部门的信息（其中孩子又是一个数组，包含若干个对象，即若干个子部门）}]
        this.lawcameraCollectList = response.data.list
        this.loading = false
      })
    },
    setTempQueryParams() { // 因为queryParams与treeselect绑定，为了不影响treeselect，所以引入一个临时变量tempQueryParams
      this.tempQueryParams.name = this.queryParams.name
      if (this.queryParams.managerDeptId !== undefined) {
        this.tempQueryParams.managerDeptId = '/' + this.queryParams.managerDeptId + '/'
      }
      this.tempQueryParams.useState = this.queryParams.useState
    },
    handleCollect(row) {
      lawcameraCollect({ id: row.id }).then(response => {
        if (response.msg === '领用成功') {
          this.$confirm('领用成功！', '信息', {
            confirmButtonText: '确定',
            type: 'info'
          }).then(this.getList())
        }
      })
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
    getCollectLog(no) {
      this.loading = true
      getLawCameraLogList({ no: no }).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根部门的信息（其中孩子又是一个数组，包含若干个对象，即若干个子部门）}]
        this.collectLogList = response.data.list
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
    collectLog(no) {
      this.title = '领用记录'
      this.collectLogOpen = true
      this.getCollectLog(no)
    }
  }
}
</script>
