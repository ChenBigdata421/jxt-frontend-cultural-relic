<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="采集站编号" prop="No">
            <el-input
              v-model="queryParams.No"
              placeholder="请输入采集站编号"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="采集站名称" prop="Name">
            <el-input
              v-model="queryParams.Name"
              placeholder="请输入采集站名称"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="管理员" prop="AdminPoliceName">
            <el-input
              v-model="queryParams.AdminPoliceName"
              placeholder="请输入管理员"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="归属单位" prop="OrgName">
            <el-input
              v-model="queryParams.OrgName"
              placeholder="请输入归属单位"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="State">
            <el-select v-model="queryParams.State" placeholder="状态" clearable style="width: 170px;">
              <el-option
                v-for="dict in stateOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px;"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌名称" prop="BrandName">
            <el-input
              v-model="queryParams.BrandName"
              placeholder="请输入品牌名称"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
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
              :disabled="UpdateDisabled"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="DeleteDisabled"
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
          :data="SiteList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="Name" label="名称" width="100" />
          <el-table-column prop="No" label="编号" width="100" />
          <el-table-column prop="BrandName" label="品牌名称" width="100" />
          <el-table-column prop="Ip" label="Ip" width="100" />
          <el-table-column prop="AdminPoliceName" label="管理员" width="100" />
          <el-table-column prop="OrgName" label="归属单位" width="100" />
          <el-table-column prop="State" label="状态" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                disable-transitions
              >{{ stateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="System" label="操作系统" width="100" />
          <el-table-column prop="Version" label="版本" width="60" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="180"
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
        <el-dialog :title="title" :visible.sync="open" width="700px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="名称" prop="Name" label-width="100px">
                  <el-input v-model="form.Name" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编号" prop="No" label-width="100px">
                  <el-input v-model="form.No" placeholder="请输入编号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- prop="deptName" 告诉 Element UI 的表单验证系统，这个表单项应该使用 rules 对象中定义的 deptName 规则进行校验。-->
                <el-form-item label="品牌名称" prop="BrandName" label-width="100px">
                  <el-input v-model="form.BrandName" placeholder="请输入品牌名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="IP" prop="Ip" label-width="100px">
                  <el-input v-model="form.Ip" placeholder="请输入IP" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址" prop="Address" label-width="100px">
                  <el-input v-model="form.Address" placeholder="请输入品牌地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- prop="deptName" 告诉 Element UI 的表单验证系统，这个表单项应该使用 rules 对象中定义的 deptName 规则进行校验。-->
                <el-form-item label="播放地址" prop="Http" label-width="100px">
                  <el-input v-model="form.Http" placeholder="请输入播放地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- prop="deptName" 告诉 Element UI 的表单验证系统，这个表单项应该使用 rules 对象中定义的 deptName 规则进行校验。-->
                <el-form-item label="密钥" prop="SecretKey" label-width="100px">
                  <el-input v-model="form.SecretKey" placeholder="请输入密钥" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- prop="deptName" 告诉 Element UI 的表单验证系统，这个表单项应该使用 rules 对象中定义的 deptName 规则进行校验。-->
                <el-form-item label="管理员" prop="AdminPoliceName" label-width="100px">
                  <el-input v-model="form.AdminPoliceName" placeholder="请输入管理员" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="归属单位" prop="OrgName" label-width="100px">
                  <el-input v-model="form.OrgName" placeholder="请输入归属单位" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" label-width="100px">
                  <!--当用户选择一个单选按钮时，form.status 的值将被更新为该按钮的 label（或者更准确地说是 :label 绑定的值）。-->
                  <el-radio-group v-model="form.State">
                    <el-radio
                      v-for="dict in stateOptions"
                      :key="dict.value"
                      :label="dict.value"
                    >{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="在线总时长" label-width="100px">
                  <el-input-number v-model="form.OnlineTimeTotal" placeholder="请输入在线总时长" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="CPU" label-width="100px">
                  <el-input v-model="form.Cpu" placeholder="请输入CPU" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存(G)" label-width="100px">
                  <el-input-number v-model="form.Memory" placeholder="请输入内存大小" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="存储(G)" label-width="100px">
                  <el-input-number v-model="form.Disk" placeholder="请输入磁盘大小" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购置时间" label-width="100px">
                  <el-input v-model="form.BuyTime" placeholder="请输入购置时间" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="USB数量" label-width="100px">
                  <el-input-number v-model="form.UsbNum" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="操作系统" label-width="100px">
                  <el-input v-model="form.System" placeholder="操作系统" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本" label-width="100px">
                  <el-input v-model="form.Version" placeholder="版本" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注" label-width="100px">
                  <el-input v-model="form.Remark" />
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

        <!--显示详情-->
        <el-dialog :title="title" :visible.sync="ViewOpen" width="593px" :close-on-click-modal="false">
          <el-tabs v-model="ActiveLab">
            <el-tab-pane label="采集站信息" name="first">
              <el-table
                v-loading="loading"
                :data="AttributeValueList"
                border
              >
                <el-table-column prop="AttributeName" label="属性" width="100" align="center" />
                <el-table-column prop="Value" label="值" width="450" align="center" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="采集站配置" name="second">
              <el-table
                v-loading="loading"
                :data="AttributeValueConfigList"
                border
              >
                <el-table-column prop="AttributeName" label="属性" width="200" align="center" />
                <el-table-column prop="Value" label="值" width="350" align="center" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listEquipmentSite, delEquipmentSite, getEquipmentSite, getEquipmentSiteConfig, addEquipmentSite, updateEquipmentSite } from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'

export default {
  name: 'LawCarema',
  components: {

  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      SiteIds: [],
      // 可否修改
      UpdateDisabled: true,
      // 可否删除
      DeleteDisabled: true,
      // 总条数
      total: 0,
      // 执法仪数据
      SiteList: [],
      // 状态数据字典
      stateOptions: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加采集站对话框
      open: false,
      // 是否显示查看采集站详情对话框
      ViewOpen: false,
      ActiveLab: 'first',
      SelectedRow: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        No: undefined,
        Name: undefined,
        AdminPoliceName: undefined,
        OrgName: undefined,
        State: undefined,
        BrandName: undefined
      },
      AttributeValueList: [],
      AttributeValueConfigList: [],
      // 表单参数
      form: {
        State: '1'
      },
      ColumnNameConvert: new Map([
        ['Id', 'ID:'],
        ['Name', '名称:'],
        ['No', '编号:'],
        ['BrandName', '品牌名称:'],
        ['Ip', 'IP:'],
        ['Address', '地址:'],
        ['Http', '播放地址:'],
        ['SecretKey', '密钥:'],
        ['AdminPoliceName', '管理员:'],
        ['OrgName', '归属单位:'],
        ['State', '状态:'],
        ['OnlineTimeTotal', '在线总时长:'],
        ['Cpu', 'CPU:'],
        ['Memory', '内存(G):'],
        ['Disk', '磁盘(G):'],
        ['BuyTime', '购置时间:'],
        ['UsbNum', 'USB数量:'],
        ['System', '操作系统:'],
        ['Version', '版本:'],
        ['Remark', '备注:']
      ]),
      ColumnNameConfigConvert: new Map([
        ['Id', '主键ID'],
        ['Name', '采集站名称'],
        ['HeartBeatTimeSpace', '采集站心跳包间隔时间'],
        ['FileRootPath', '采集站文件保存路径'],
        ['StorageName', '存储服务器'],
        ['UploadSpeed', '采集站上传文件速率'],
        ['UploadTime', '采集站上传文件时间']
      ]),
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ]
      }

    }
  },
  created() {
    this.getList()
    this.getDicts('site_status').then(response => {
      this.stateOptions = response.data
    })
  },
  methods: {
    /** 查询执法仪列表 */
    getList() {
      this.loading = true
      listEquipmentSite(this.queryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.SiteList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },

    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, parseInt(row.State))
    },

    // 表单重置
    reset() {
      this.form = {
        Name: undefined,
        No: undefined,
        BrandName: undefined,
        Ip: undefined,
        Address: undefined,
        Http: undefined,
        SecretKey: undefined,
        AdminPoliceName: undefined,
        OrgName: undefined,
        State: '1',
        OnlineTimeTotal: undefined,
        Cpu: undefined,
        Memory: undefined,
        Disk: undefined,
        BuyTime: undefined,
        UsbNum: undefined,
        System: undefined,
        Version: undefined,
        Remark: undefined
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
      this.SiteIds = selection.map(item => item.Id)
      this.UpdateDisabled = selection.length !== 1
      this.DeleteDisabled = !selection.length
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加采集站'
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
    /** 修改按钮操作 ,该函数可以优化，没有必要从服务端获取数据。查询到的所有记录都缓存在了前端*/
    handleUpdate(row) {
      this.reset()
      const SiteId = row.Id || this.SiteIds
      getEquipmentSite(SiteId).then(response => {
        this.form = response.data
        this.form.State = String(this.form.State)
        this.title = '修改采集站'
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
      this.AttributeValueConfigList = []
      getEquipmentSiteConfig(row.Id).then(response => {
        Object.keys(response.data).forEach(key => {
          const attributeValue = {
            AttributeName: this.ColumnNameConfigConvert.get(key),
            Value: response.data[key]
          }
          this.AttributeValueConfigList.push(attributeValue)
        })
      })
      this.ViewOpen = true
      this.title = ''
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.State = parseInt(this.form.State)
          if (this.form.Id !== undefined) {
            updateEquipmentSite(this.form, this.form.Id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addEquipmentSite(this.form).then(response => {
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
      const SiteId = (row.Id && [row.Id]) || this.SiteIds
      this.$confirm('是否确认删除采集站编号为"' + SiteId + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delEquipmentSite({ 'ids': SiteId })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有采集站数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['名称', '编号', '品牌名称', 'Ip', '地址', '播放地址', '密钥', '管理员', '归属单位', '状态', '在线总时长', 'CPU', '内存', '存储', 'USB数量', '操作系统', '购置时间', '版本', '备注']
          const filterVal = ['Name', 'No', 'BrandName', 'Ip', 'Address', 'Http', 'SecretKey', 'AdminPoliceName', 'OrgName', 'State', 'OnlineTimeTotal', 'Cpu', 'Memory', 'Disk', 'UsbNum', 'System', 'BuyTime', 'Version', 'Remark']
          const list = this.SiteList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '采集站列表',
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
