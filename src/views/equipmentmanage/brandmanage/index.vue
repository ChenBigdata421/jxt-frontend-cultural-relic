<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="Name">
            <el-input
              v-model="queryParams.Name"
              placeholder="请输入品牌名称"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="硬件设备" prop="OrgName">
            <el-input
              v-model="queryParams.Hardware"
              placeholder="请输入硬件设备"
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

        <el-table
          v-loading="loading"
          :data="equipmentBrandList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" prop="Id" width="80" />
          <el-table-column label="名称" prop="Name" width="80" />
          <el-table-column label="硬件设备" prop="Hardware" width="80" />
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
          <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updatedAt) }}</span>
            </template>
          </el-table-column>
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
            <el-form-item label="名称" prop="Name">
              <el-input v-model="form.Name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="硬件设备" prop="Hardware">
              <el-input v-model="form.Hardware" placeholder="请输入硬件设备" />
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
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listEquipmentBrand, getEquipmentBrand, delEquipmentBrand, addEquipmentBrand, updateEquipmentBrand } from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'

export default {
  name: 'Brand',
  components: {

  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      BrandIds: [],
      // 可否修改
      UpdateDisabled: true,
      // 可否删除
      DeleteDisabled: true,
      // 总条数
      total: 0,
      // 角色表格数据
      equipmentBrandList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        Name: undefined,
        Hardware: undefined,
        State: undefined
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('brand_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询trial列表 */
    getList() {
      this.loading = true
      listEquipmentBrand(this.queryParams).then(
        response => {
          this.equipmentBrandList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
      console.log(this.equipmentBrandList)
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
        Hardware: undefined,
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
      this.BrandIds = selection.map(item => item.Id)
      this.UpdateDisabled = selection.length !== 1
      this.DeleteDisabled = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // this.getMenuTreeselect(0)
      this.open = true
      this.title = '添加品牌'
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
      const BrandIds = row.Id || this.BrandIds
      getEquipmentBrand(BrandIds).then(response => {
        this.form = response.data
        this.form.State = String(this.form.State)
        this.title = '修改品牌'
        this.isEdit = true
        this.open = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.State = parseInt(this.form.State)
          if (this.form.Id !== undefined) {
            updateEquipmentBrand(this.form, this.form.Id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addEquipmentBrand(this.form).then(response => {
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
      const BrandIds = (row.Id && [row.Id]) || this.BrandIds
      this.$confirm('是否确认删除品牌编号为"' + BrandIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delEquipmentBrand({ 'ids': BrandIds })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有品牌数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['ID', '名称', '硬件设备', '状态', '创建时间', '更新时间']
          const filterVal = ['Id', 'Name', 'Hardware', 'State', 'CreatedAt', 'UpdatedAt']
          const list = this.equipmentBrandList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '品牌列表',
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
