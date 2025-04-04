<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="Name">
            <el-input
              v-model="queryParams.Name"
              placeholder="请输入场地名称"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="归属单位" prop="OrgName">
            <el-input
              v-model="queryParams.OrgName"
              placeholder="请输入归属单位"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="State">
            <el-select
              v-model="queryParams.State"
              placeholder="角色状态"
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
          <!-- <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:update']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出</el-button>
          </el-col>
        </el-row>

        <el-table
          v-loading="loading"
          :data="equipmentTrialList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="编号" sortable="true" prop="No" width="80" />
          <el-table-column label="名称" sortable="true" prop="Name" width="80" />
          <el-table-column label="品牌名称" prop="BrandName" width="80" />
          <el-table-column label="IP" prop="Ip" :show-overflow-tooltip="true" width="80" />
          <el-table-column label="地址" prop="Address" width="80" />
          <el-table-column label="管理员" prop="AdminPoliceName" width="80" />
          <el-table-column label="归属单位" prop="OrgName" width="80" />
          <el-table-column label="版本号" prop="Version" width="80" />
          <el-table-column label="状态" width="80">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                disable-transitions
              >{{ StateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="Remark" width="80" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="150"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >浏览</el-button>
              <el-button
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-permisaction="['admin:sysRole:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--v-show和v-if都是Vue的指令，用于控制元素的显示与隐藏。主要区别在于v-show是简单地控制元素的display样式
  属性来显示或隐藏元素，元素始终会被渲染到DOM中；而v-if是根据条件动态地添加或移除元素，如果条件为假，
  则元素不会被渲染到DOM中。
page.sync和v-model都用于实现双向绑定，但是page.sync是一种自定义的props传递方式，通常用于子组件向
父组件传递数据，而v-model是Vue提供的指令，用于在表单元素和组件上创建双向数据绑定。v-model更适用于
表单元素的双向绑定，而page.sync通常用于自定义组件间的数据传递。-->
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog v-if="open" :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="编号" prop="No">
              <el-input v-model="form.No" placeholder="请输入编号" />
            </el-form-item>
            <el-form-item label="名称" prop="Name">
              <el-input v-model="form.Name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="IP" prop="Ip">
              <el-input v-model="form.Ip" placeholder="请输入IP" />
            </el-form-item>
            <el-form-item label="地址" prop="Address">
              <el-input v-model="form.Address" placeholder="请输入地址" />
            </el-form-item>
            <el-form-item label="播放地址" prop="Http">
              <el-input v-model="form.Http" placeholder="请输入播放地址" />
            </el-form-item>
            <el-form-item label="密钥" prop="SecretKey">
              <el-input v-model="form.SecretKey" placeholder="请输入密钥" />
            </el-form-item>
            <el-form-item label="管理员" prop="AdminPoliceName">
              <el-input v-model="form.AdminPoliceName" placeholder="请输入管理员" />
            </el-form-item>
            <el-form-item label="归属单位" prop="OrgName">
              <el-input v-model="form.OrgName" placeholder="请输入归属单位" />
            </el-form-item>
            <el-form-item label="版本号" prop="Version">
              <el-input v-model="form.Version" placeholder="请输入版本号" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.State">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.Remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
            <el-form-item label="品牌名称" prop="BrandName">
              <el-input v-model="form.BrandName" placeholder="请输入品牌名称" />
            </el-form-item>
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
import { listEquipmentTrial, getEquipmentTrial, delEquipmentTrial, addEquipmentTrial, updateEquipmentTrial } from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'

export default {
  name: 'Trial',
  components: {

  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      trialIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 角色表格数据
      equipmentTrialList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      ViewOpen: false,
      AttributeValueList: [],
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      isEdit: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        Name: undefined,
        OrgName: undefined,
        State: undefined
      },
      // 表单参数
      form: {
      },
      ColumnNameConvert: new Map([
        ['Id', 'ID:'],
        ['Name', '名称:'],
        ['No', '编号:'],
        ['Ip', 'IP:'],
        ['Address', '地址:'],
        ['Http', '播放地址:'],
        ['SecretKey', '密钥:'],
        ['AdminPoliceName', '管理员:'],
        ['OrgName', '归属单位:'],
        ['BuyTime', '购置时间:'],
        ['Version', '版本号:'],
        ['State', '状态:'],
        ['Remark', '备注:'],
        ['BrandName', '品牌名称:']
      ]),
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        No: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ],
        Name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        AdminPoliceName: [
          { required: true, message: '管理员不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('trial_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询trial列表 */
    getList() {
      this.loading = true
      listEquipmentTrial(this.queryParams).then(
        response => {
          this.equipmentTrialList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        No: undefined,
        Name: undefined,
        Ip: undefined,
        Address: undefined,
        Http: undefined,
        SecretKey: undefined,
        AdminPoliceName: undefined,
        OrgName: undefined,
        BuyTime: undefined,
        Version: undefined,
        Remark: undefined,
        BrandName: undefined,
        State: '1'
      }
      this.resetForm('form')
    },
    // 字典翻译
    StateFormat(row) {
      return this.selectDictLabel(this.statusOptions, parseInt(row.State))
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.trialIds = selection.map(item => item.Id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // this.getMenuTreeselect(0)
      this.open = true
      this.title = '添加场地'
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
      console.log(this.queryParams)
      this.getList()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const trialId = row.Id || this.trialIds
      getEquipmentTrial(trialId).then(response => {
        this.form = response.data
        this.form.State = String(this.form.State)
        this.title = '修改场地'
        this.isEdit = true
        this.open = true
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
        this.AttributeValueList.push(attributeValue)
      })
      this.ViewOpen = true
      this.title = '场地信息'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.State = parseInt(this.form.State)
          if (this.form.Id !== undefined) {
            updateEquipmentTrial(this.form, this.form.Id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addEquipmentTrial(this.form).then(response => {
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
    /** 删除按钮操作
     * row.Id && [row.Id]，用于根据条件设置roleIds变量的值。如果row.Id存在且不为null或undefined，则roleIds为[row.Id]，否则roleIds为this.ids的值。
    */
    handleDelete(row) {
      const trialIds = (row.Id && [row.Id]) || this.trialIds
      this.$confirm('是否确认删除场地编号为"' + trialIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delEquipmentTrial({ 'ids': trialIds })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有场地数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['编号', '名称', 'IP', '地址', '播放地址', '密钥', '管理员', '归属单位', '购置时间', '版本号', '状态', '备注', '品牌名称']
          const filterVal = ['No', 'Name', 'Ip', 'Address', 'Http', 'SecretKey', 'AdminPoliceName', 'OrgName', 'BuyTime', 'Version', 'State', 'Remark', 'BrandName']
          const list = this.equipmentTrialList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '场地列表',
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
