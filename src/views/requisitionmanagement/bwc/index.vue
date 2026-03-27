<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="执法仪编号" prop="bwcNo">
            <el-input
              v-model="queryParams.bwcNo"
              placeholder="请输入执法仪编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="执法仪名称" prop="bwcName">
            <el-input
              v-model="queryParams.bwcName"
              placeholder="请输入执法仪名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="管理组织" prop="managerOrgId">
            <treeselect
              v-model="queryParams.managerOrgId"
              :options="orgOptions"
              placeholder="请选择管理组织"
              style="width: 170px"
            />
          </el-form-item>
          <el-form-item label="管理人员">
            <el-select
              v-model="queryParams.managerId"
              placeholder="请选择管理人员"
              style="width: 170px"
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
          <el-form-item label="使用状态" prop="useState">
            <el-select
              v-model="queryParams.useState"
              placeholder="使用状态"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in requisitionStatusOptions"
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
          :data="bwcRequisitionList"
          row-key="id"
          default-expand-all
          border
          @sort-change="handleSortChang"
        >
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="250"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.useState === 2"
                v-permisaction="['bwc:requisition']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleRequisition(scope.row)"
              >领用</el-button>
              <el-button
                v-if="
                  scope.row.useState === 1 &&
                    userId === scope.row.requisitionerId
                "
                v-permisaction="['bwc:return']"
                size="mini"
                type="text"
                icon="el-icon-setting"
                style="color: #ff0000"
                @click="handleReturn(scope.row)"
              >退还</el-button>
              <el-button
                v-permisaction="['bwc:info']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >执法仪信息</el-button>
              <el-button
                v-permisaction="['bwc:requisitionrecord']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="requisitionLog(scope.row.bwcNo)"
              >领用记录</el-button>
            </template>
          </el-table-column>
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column
            prop="bwcNo"
            label="编号"
            width="80"
            sortable="custom"
          />
          <el-table-column
            prop="bwcName"
            label="名称"
            width="100"
            sortable="custom"
          />
          <el-table-column prop="managerName" label="管理人员" width="80" />
          <el-table-column
            prop="managerOrgFullName"
            label="管理组织"
            width="300"
          />
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
          <el-table-column
            prop="requisitionerOrgFullName"
            label="领用者组织"
            width="300"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
        <!--展示领用记录-->
        <el-dialog
          :title="title"
          :visible.sync="requisitionLogOpen"
          width="1200px"
          :close-on-click-modal="false"
          append-to-body
        >
          <RequisitionLogSelector :bwc-no="currentBwcNo" />
        </el-dialog>
        <!-- 浏览执法仪对话框 -->
        <el-dialog
          title="执法仪信息"
          :visible.sync="ViewOpen"
          width="800px"
          append-to-body
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="执法仪编号">{{
              viewData.bwcNo || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="执法仪名称">{{
              viewData.bwcName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{
              viewData.brandName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="管理组织">{{
              viewData.managerOrgFullName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="管理人员">{{
              viewData.managerName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="是否可用">{{
              selectDictLabel(enableUseOptions, viewData.enableUse) || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{
              selectDictLabel(stateOptions, viewData.status) || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="CPU">{{
              viewData.cpu || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="内存(G)">{{
              viewData.memory || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="存储(G)">{{
              viewData.disk || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="网卡">{{
              viewData.networkCard || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="USB数量">{{
              viewData.usbNum || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{
              viewData.system || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{
              viewData.version || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="购买时间">{{
              viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="领用状态">{{
              selectDictLabel(requisitionStatusOptions, viewData.useState) ||
                "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="领用者">{{
              viewData.requisitionerName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="领用者组织">{{
              viewData.requisitionerOrgFullName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{
              viewData.remark || "无"
            }}</el-descriptions-item>
          </el-descriptions>
          <div slot="footer" class="dialog-footer">
            <el-button @click="ViewOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  getBwcRequisitionList,
  bwcRequisition,
  bwcReturn
} from '@/api/admin/bwc_requisition_manage_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listUser } from '@/api/admin/sys-user'
import RequisitionLogSelector from '@/components/RequisitionLogSelector'
export default {
  name: 'LawCaremaRequisition',
  components: { Treeselect, RequisitionLogSelector },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 分页总条数
      total: 0,
      // 执法仪数据
      bwcRequisitionList: [],
      // 当前查看的执法仪编号
      currentBwcNo: undefined,
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
      enableUseOptions: [],
      // 领用状态数据字典
      requisitionStatusOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        useState: undefined
      },
      // 浏览数据
      viewData: {},
      // 表单参数
      form: {},
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: '编号不能为空', trigger: 'blur' }]
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
      } else {
        this.userOptions = []
        this.queryParams.managerId = undefined
      }
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
    this.getDicts('bwc_status').then((response) => {
      this.stateOptions = response.data
    })
    this.getDicts('enableuse_state').then((response) => {
      this.enableUseOptions = response.data
    })
    this.getDicts('requisition_status').then((response) => {
      this.requisitionStatusOptions = response.data
    })
  },
  methods: {
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },
    /** 查询执法仪列表 */
    getList() {
      this.loading = true
      getBwcRequisitionList(this.queryParams).then((response) => {
        this.bwcRequisitionList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },
    handleRequisition(row) {
      bwcRequisition({ id: row.id }).then((response) => {
        if (response.msg === '领用成功') {
          this.$confirm('领用成功！', '信息', {
            confirmButtonText: '确定',
            type: 'info'
          }).then(this.getList())
        }
      })
    },
    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list
        }
      )
    },
    /** 重置按钮操作
     * resetForm() 清空表单字段时，managerOrgId 的变化触发了 watch 监听器，watch 会异步清空 managerId 和 userOptions。
     * 但 resetQuery() 中的 handleQuery() 是同步执行的，导致查询时数据还未完全清空，需要再点一次才能获取完整数据。
     * $nextTick() 包装 handleQuery()，确保表单重置和 watch 监听器完全执行后再进行查询*/
    resetQuery() {
      this.resetForm('queryForm')
      this.$nextTick(() => {
        this.handleQuery()
      })
    },
    handleReturn(row) {
      bwcReturn({ id: row.id }).then((response) => {
        if (response.msg === '退还成功') {
          this.$confirm('退还成功！', '信息', {
            confirmButtonText: '确定',
            type: 'info'
          }).then(this.getList())
        }
      })
    },

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

    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row
      this.ViewOpen = true
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
      return this.selectDictLabel(this.requisitionStatusOptions, row.useState)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 查看领用记录 */
    requisitionLog(bwcNo) {
      this.title = '领用记录'
      // 先清空 currentBwcNo，然后在 $nextTick 中设置新值
      // 这样可以确保即使点击同一个执法仪多次，也会触发 watch 监听器
      this.currentBwcNo = undefined
      this.$nextTick(() => {
        this.currentBwcNo = bwcNo
        this.requisitionLogOpen = true
      })
    }
  }
}
</script>
