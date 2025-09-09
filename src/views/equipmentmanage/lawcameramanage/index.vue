<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="执法仪编号" prop="no">
            <el-input
              v-model="queryParams.no"
              placeholder="请输入执法仪编号"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="执法仪名称" prop="name">
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
          <el-form-item label="状态" prop="state">
            <el-select v-model="queryParams.state" placeholder="状态" clearable style="width: 170px;">
              <el-option
                v-for="dict in stateOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px;"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否可用">
            <el-select v-model="queryParams.enableUse" placeholder="是否可用" clearable style="width: 170px;">
              <el-option
                v-for="dict in enableUseOptions"
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
              v-permisaction="['equipment:lawcamera:create']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:lawcamera:edit']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:lawcamera:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:lawcamera:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出</el-button>
          </el-col>
        </el-row>
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
          :data="lawCameraList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="no" label="编号" width="80" />
          <el-table-column prop="name" label="名称" width="100" />
          <el-table-column prop="managerName" label="管理员" width="80" />
          <el-table-column prop="managerOrgFullName" label="管理员所在组织" width="150" />
          <el-table-column prop="enableUse" label="是否可用" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.enableUse === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ enableUseFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="状态" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                disable-transitions
              >{{ stateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cpu" label="Cpu" width="100" />
          <el-table-column prop="memory" label="内存(G)" width="100" />
          <el-table-column prop="disk" label="存储(G)" width="100" />
          <el-table-column prop="system" label="操作系统" width="100" />
          <el-table-column prop="version" label="版本" width="100" />
          <el-table-column prop="remark" label="备注" width="100" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="150"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:lawcamera:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >浏览</el-button>
              <el-button
                v-permisaction="['equipment:lawcamera:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-permisaction="['equipment:lawcamera:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
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
        <!-- 添加或修改执法仪对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <!-- 管理信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="管理组织" prop="managerOrgId">
                  <treeselect
                    v-model="form.managerOrgId"
                    :options="orgOptions"
                    placeholder="请选择管理组织"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="管理人员">
                  <el-select v-model="form.managerId" placeholder="请选择" @change="$forceUpdate()">
                    <el-option
                      v-for="item in userOptions"
                      :key="item.userId"
                      :label="item.userName"
                      :value="item.userId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 基础信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" prop="Name">
                  <el-input v-model="form.name" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编号" prop="No">
                  <el-input v-model="form.no" placeholder="请输入编号" :disabled="title === '修改执法仪'" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 状态信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否可用">
                  <el-radio-group v-model="form.enableUse">
                    <el-radio
                      v-for="dict in enableUseOptions"
                      :key="parseInt(dict.value)"
                      :label="parseInt(dict.value)"
                    >{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.state">
                    <el-radio
                      v-for="dict in stateOptions"
                      :key="parseInt(dict.value)"
                      :label="parseInt(dict.value)"
                    >{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 硬件配置 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="CPU">
                  <el-input v-model="form.cpu" placeholder="请输入CPU" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存(G)">
                  <el-input-number v-model="form.memory" placeholder="请输入内存大小" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="存储(G)">
                  <el-input-number v-model="form.disk" placeholder="请输入磁盘大小" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网卡">
                  <el-input v-model="form.networkCard" placeholder="请输入网卡型号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="USB数量">
                  <el-input-number v-model="form.usbNum" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 系统信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="操作系统">
                  <el-input v-model="form.system" placeholder="操作系统" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本">
                  <el-input v-model="form.version" placeholder="版本" maxlength="20" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 备注 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="form.remark" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
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
import { getEquipmentLawcameraList, getEquipmentLawcamera, delEquipmentLawcamera, addEquipmentLawcamera, updateEquipmentLawcamera } from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listUser } from '@/api/admin/sys-user'
export default {
  name: 'LawCarema',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      LawCameraIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 执法仪数据
      lawCameraList: [],
      // 状态数据字典
      stateOptions: [],
      // 是否可用数据字典
      enableUseOptions: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加执法仪对话框
      open: false,
      ViewOpen: false,
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        Name: undefined,
        managerOrgId: undefined,
        managerId: undefined
      },
      AttributeValueList: [],
      ColumnNameConvert: new Map([
        ['no', '编号'],
        ['name', '名称'],
        ['managerName','管理员'],
        ['managerOrgFullName','管理员所在组织'],
        ['enableUse','是否可用'],
        ['state','状态'],
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
  watch: {
    'form.managerOrgId': function(newVal) {
      // 当 form.managerOrgId 更新时，调用 getUser
      if (newVal) {
        if (this.firstLoad !== true) { // 首次打开对话框，不需要清空管理人员
          this.form.managerId = null // 清空管理人员选择
        }
        this.firstLoad = false
        this.getFormUser()
      }
    },
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
    this.getDicts('enableuse_state').then(response => {
      this.enableUseOptions = response.data
    })
  },
  methods: {
    /** 查询执法仪列表 */
    getList() {
      this.loading = true
      getEquipmentLawcameraList(this.queryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.lawCameraList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },

    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, parseInt(row.state))
    },
    // 字典状态字典翻译
    enableUseFormat(row) {
      return this.selectDictLabel(this.enableUseOptions, parseInt(row.enableUse))
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then(response => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },
    getFormUser() {
      listUser({ orgId: '/' + this.form.managerOrgId + '/' }).then(response => {
        this.userOptions = response.data.list
      })
    },

    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(response => {
        this.userOptions = response.data.list
      })
    },

    // 表单重置
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
        requisitionorOrgId: undefined,
        requisitionorId: undefined,
        name: undefined,
        no: undefined,
        enableUse: undefined,
        state: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        networkCard: undefined,
        usbNum: undefined,
        system: undefined,
        version: undefined,
        buyTime: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.LawCameraIds = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加执法仪'
      this.isEdit = false
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

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      const LawCameraId = row.id || this.LawCameraIds
      getEquipmentLawcamera(LawCameraId).then(response => {
        this.form = response.data
        this.title = '修改执法仪'
        this.isEdit = true
        this.open = true
      })
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.AttributeValueList = []
      Object.keys(row).forEach(key => {
        var attributeName = this.ColumnNameConvert.get(key)
        var value = row[key]
        if (key === 'state') {
            value = this.stateFormat(row)
        }
        if (key === 'enableUse') {
            value = this.enableUseFormat(row)
        }
        const attributeValue = {
          AttributeName: attributeName,
          Value: value
        }
        if (attributeValue.AttributeName !== undefined) {
          this.AttributeValueList.push(attributeValue)
        }
      })
      this.ViewOpen = true
      this.title = '执法仪信息'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.state = parseInt(this.form.state)
          this.form.enableUse = parseInt(this.form.enableUse)
          if (this.form.id !== undefined) {
            updateEquipmentLawcamera(this.form, this.form.id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addEquipmentLawcamera(this.form).then(response => {
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

    handleDelete(row) {
      const LawCameraId = (row.id && [row.id]) || this.LawCameraIds
      this.$confirm('是否确认删除执法仪编号为"' + LawCameraId + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delEquipmentLawcamera({ 'ids': LawCameraId })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有执法仪数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['工程ID', '编号', '名称', 'CPU', '内存', '存储', '网卡', 'USB数量', '操作系统', '购置时间', '版本', '备注']
          const filterVal = ['FactoryId', 'No', 'Name', 'Cpu', 'Memory', 'Disk', 'NetworkCard', 'UsbNum', 'System', 'BuyTime', 'Version', 'Remark']
          const list = this.lawCameraList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '执法仪列表',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    }
  }
}
</script>
