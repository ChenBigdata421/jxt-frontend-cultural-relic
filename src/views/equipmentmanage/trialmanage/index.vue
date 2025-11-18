<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="场地编号" prop="No">
            <el-input
              v-model="queryParams.No"
              placeholder="请输入场地编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="场地名称" prop="Name">
            <el-input
              v-model="queryParams.Name"
              placeholder="请输入场地名称"
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
          <el-form-item label="状态" prop="State">
            <el-select
              v-model="queryParams.State"
              placeholder="状态"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in stateOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌名称" prop="BrandName">
            <el-input
              v-model="queryParams.BrandName"
              placeholder="请输入品牌名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              >搜索</el-button
            >
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
              >重置</el-button
            >
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
          <el-col :span="18">
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:trial:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:trial:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="single"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:trial:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="handleDelete"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:trial:export']"
                  type="warning"
                  icon="el-icon-download"
                  size="mini"
                  @click="handleExport"
                  >导出</el-button
                >
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="6" class="column-settings-trigger">
            <el-popover placement="bottom-end" width="280" trigger="click">
              <div class="column-settings">
                <div class="column-settings-header">
                  <span>列显示设置</span>
                  <el-button type="text" size="mini" @click="resetColumns"
                    >重置</el-button
                  >
                </div>
                <el-checkbox-group
                  v-model="visibleColumns"
                  @change="handleColumnChange"
                >
                  <div
                    v-for="col in columnOptions"
                    :key="col.prop"
                    class="column-item"
                  >
                    <el-checkbox :label="col.prop" :disabled="col.fixed">
                      {{ col.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button slot="reference" size="mini" icon="el-icon-setting"
                >列设置</el-button
              >
            </el-popover>
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
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="200"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:trial:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['equipment:trial:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['equipment:trial:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('No')"
            label="编号"
            sortable="true"
            prop="No"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('Name')"
            label="名称"
            sortable="true"
            prop="Name"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('BrandName')"
            label="品牌名称"
            prop="BrandName"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('managerName')"
            prop="managerName"
            label="管理员"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('managerOrgFullName')"
            prop="managerOrgFullName"
            label="管理员所在组织"
            min-width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('Ip')"
            label="IP"
            prop="Ip"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('Address')"
            label="地址"
            prop="Address"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('Http')"
            label="播放地址"
            prop="Http"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('BuyTime')"
            label="购置时间"
            prop="BuyTime"
            width="180"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.BuyTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('Version')"
            label="版本号"
            prop="Version"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('State')"
            label="状态"
            width="120"
          >
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag disable-transitions>{{ StateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('Remark')"
            label="备注"
            prop="Remark"
            min-width="160"
            :show-overflow-tooltip="true"
          />
        </el-table>
        <!--v-show和v-if都是Vue的指令，用于控制元素的显示与隐藏。主要区别在于v-show是简单地控制元素的display样式
  属性来显示或隐藏元素，元素始终会被渲染到DOM中；而v-if是根据条件动态地添加或移除元素，如果条件为假，
  则元素不会被渲染到DOM中。
page.sync和v-model都用于实现双向绑定，但是page.sync是一种自定义的props传递方式，通常用于子组件向
父组件传递数据，而v-model是Vue提供的指令，用于在表单元素和组件上创建双向数据绑定。v-model更适用于
表单元素的双向绑定，而page.sync通常用于自定义组件间的数据传递。-->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog
          v-if="open"
          :title="title"
          :visible.sync="open"
          width="500px"
          :close-on-click-modal="false"
        >
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
                  <el-select
                    v-model="form.managerId"
                    placeholder="请选择"
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
              </el-col>
            </el-row>

            <!-- 基础信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="编号" prop="No">
                  <el-input v-model="form.No" placeholder="请输入编号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称" prop="Name">
                  <el-input v-model="form.Name" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 网络信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="IP" prop="Ip">
                  <el-input v-model="form.Ip" placeholder="请输入IP" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址" prop="Address">
                  <el-input v-model="form.Address" placeholder="请输入地址" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 扩展信息 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="播放地址" prop="Http">
                  <el-input v-model="form.Http" placeholder="请输入播放地址" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="密钥" prop="SecretKey">
                  <el-input v-model="form.SecretKey" placeholder="请输入密钥" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 系统信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="版本号" prop="Version">
                  <el-input v-model="form.Version" placeholder="请输入版本号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌名称" prop="BrandName">
                  <el-input
                    v-model="form.BrandName"
                    placeholder="请输入品牌名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 状态与备注 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.State">
                    <el-radio
                      v-for="dict in statusOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input
                    v-model="form.Remark"
                    type="textarea"
                    placeholder="请输入内容"
                  />
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
        <el-dialog
          :title="title"
          :visible.sync="ViewOpen"
          width="593px"
          :close-on-click-modal="false"
        >
          <el-table v-loading="loading" :data="AttributeValueList" border>
            <el-table-column
              prop="AttributeName"
              label="属性"
              width="100"
              align="center"
            />
            <el-table-column
              prop="Value"
              label="值"
              width="450"
              align="center"
            />
          </el-table>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listEquipmentTrial,
  getEquipmentTrial,
  delEquipmentTrial,
  addEquipmentTrial,
  updateEquipmentTrial,
} from "@/api/admin/equipment_manage_api";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { listUser } from "@/api/admin/sys-user";
export default {
  name: "Trial",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
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
      // 列配置
      columnOptions: [
        { prop: "No", label: "编号", defaultVisible: true },
        { prop: "Name", label: "名称", defaultVisible: true },
        { prop: "BrandName", label: "品牌名称", defaultVisible: true },
        { prop: "managerName", label: "管理员", defaultVisible: true },
        {
          prop: "managerOrgFullName",
          label: "管理员所在组织",
          defaultVisible: true,
        },
        { prop: "Ip", label: "IP", defaultVisible: true },
        { prop: "Address", label: "地址", defaultVisible: true },
        { prop: "Http", label: "播放地址", defaultVisible: false },
        { prop: "BuyTime", label: "购置时间", defaultVisible: false },
        { prop: "Version", label: "版本号", defaultVisible: false },
        { prop: "State", label: "状态", defaultVisible: true },
        { prop: "Remark", label: "备注", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      ViewOpen: false,
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
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
        State: undefined,
      },
      // 表单参数
      form: {},
      ColumnNameConvert: new Map([
        ["Id", "ID:"],
        ["Name", "名称:"],
        ["No", "编号:"],
        ["Ip", "IP:"],
        ["Address", "地址:"],
        ["Http", "播放地址:"],
        ["SecretKey", "密钥:"],
        ["AdminPoliceName", "管理员:"],
        ["OrgName", "归属单位:"],
        ["BuyTime", "购置时间:"],
        ["Version", "版本号:"],
        ["State", "状态:"],
        ["Remark", "备注:"],
        ["BrandName", "品牌名称:"],
      ]),
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 表单校验
      rules: {
        No: [{ required: true, message: "编号不能为空", trigger: "blur" }],
        Name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        AdminPoliceName: [
          { required: true, message: "管理员不能为空", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    "form.managerOrgId": function (newVal) {
      // 当 form.managerOrgId 更新时，调用 getUser
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空管理人员
          this.form.managerId = null; // 清空管理人员选择
        }
        this.firstLoad = false;
        this.getFormUser();
      }
    },
    "queryParams.managerOrgId": function (newVal) {
      // 当 queryParams.managerOrgId 更新时，调用 getQueryUser
      if (newVal) {
        this.queryParams.managerId = null; // 清空管理人员选择
        this.getQueryUser();
      }
    },
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("trial_status").then((response) => {
      this.statusOptions = response.data;
    });
    this.initVisibleColumns();
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop);
    },
    initVisibleColumns() {
      const saved = localStorage.getItem("trial_manage_visible_columns");
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved);
          return;
        } catch (error) {
          console.warn("解析列配置失败，使用默认列", error);
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns();
    },
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },
    handleColumnChange(value) {
      this.visibleColumns = value;
      localStorage.setItem(
        "trial_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns();
      localStorage.setItem(
        "trial_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 查询trial列表 */
    getList() {
      this.loading = true;
      listEquipmentTrial(this.queryParams).then((response) => {
        this.equipmentTrialList = response.data.list;
        this.total = response.data.count;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
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
        State: "1",
      };
      this.resetForm("form");
    },
    // 字典翻译
    StateFormat(row) {
      return this.selectDictLabel(this.statusOptions, parseInt(row.State));
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data; // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      });
    },
    getFormUser() {
      listUser({ orgId: "/" + this.form.managerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list;
        }
      );
    },

    getQueryUser() {
      listUser({ orgId: "/" + this.queryParams.managerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.trialIds = selection.map((item) => item.Id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // this.getMenuTreeselect(0)
      this.open = true;
      this.title = "添加场地";
      this.isEdit = false;
    },
    handleSortChang(column, prop, order) {
      prop = column.prop;
      order = column.order;
      if (order === "descending") {
        this.queryParams[prop + "Order"] = "desc";
      } else if (order === "ascending") {
        this.queryParams[prop + "Order"] = "asc";
      } else {
        this.queryParams[prop + "Order"] = undefined;
      }
      this.getList();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.firstLoad = true;
      const trialId = row.Id || this.trialIds;
      getEquipmentTrial(trialId).then((response) => {
        this.form = response.data;
        this.form.State = String(this.form.State);
        this.title = "修改场地";
        this.isEdit = true;
        this.open = true;
      });
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.AttributeValueList = [];
      Object.keys(row).forEach((key) => {
        const attributeValue = {
          AttributeName: this.ColumnNameConvert.get(key),
          Value: row[key],
        };
        this.AttributeValueList.push(attributeValue);
      });
      this.ViewOpen = true;
      this.title = "场地信息";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.State = parseInt(this.form.State);
          if (this.form.Id !== undefined) {
            updateEquipmentTrial(this.form, this.form.Id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addEquipmentTrial(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作
     * row.Id && [row.Id]，用于根据条件设置roleIds变量的值。如果row.Id存在且不为null或undefined，则roleIds为[row.Id]，否则roleIds为this.ids的值。
     */
    handleDelete(row) {
      const trialIds = (row.Id && [row.Id]) || this.trialIds;
      this.$confirm(
        '是否确认删除场地编号为"' + trialIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delEquipmentTrial({ ids: trialIds });
        })
        .then((response) => {
          this.getList();
          this.msgSuccess(response.msg);
        })
        .catch(function () {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm("是否确认导出所有场地数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.downloadLoading = true;
        import("@/vendor/Export2Excel").then((excel) => {
          const tHeader = [
            "编号",
            "名称",
            "IP",
            "地址",
            "播放地址",
            "密钥",
            "管理员",
            "归属单位",
            "购置时间",
            "版本号",
            "状态",
            "备注",
            "品牌名称",
          ];
          const filterVal = [
            "No",
            "Name",
            "Ip",
            "Address",
            "Http",
            "SecretKey",
            "AdminPoliceName",
            "OrgName",
            "BuyTime",
            "Version",
            "State",
            "Remark",
            "BrandName",
          ];
          const list = this.equipmentTrialList;
          const data = formatJson(filterVal, list);
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: "场地列表",
            autoWidth: true, // Optional
            bookType: "xlsx", // Optional
          });
          this.downloadLoading = false;
        });
      });
    },
  },
};
</script>

<style scoped>
.column-settings-trigger {
  text-align: right;
}

.column-settings {
  max-height: 320px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.column-item {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-item .el-checkbox {
  width: 100%;
}
</style>
