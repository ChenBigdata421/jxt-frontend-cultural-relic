<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="存储编号" prop="storageSiteNo">
            <el-input
              v-model="queryParams.storageSiteNo"
              placeholder="请输入存储编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="存储名称" prop="storageSiteName">
            <el-input
              v-model="queryParams.storageSiteName"
              placeholder="请输入存储名称"
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
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
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
          <el-form-item label="品牌名称" prop="brandName">
            <el-input
              v-model="queryParams.brandName"
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
                  v-permisaction="['equipment:storage:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:storage:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="UpdateDisabled"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:storage:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="DeleteDisabled"
                  @click="handleDelete"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:storage:export']"
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
          :data="StorageList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="180"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:storage:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['equipment:storage:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['equipment:storage:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('storageSiteName')"
            prop="storageSiteName"
            label="名称"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('storageSiteNo')"
            prop="storageSiteNo"
            label="编号"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            prop="brandName"
            label="品牌名称"
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
            v-if="isColumnVisible('storageSiteIp')"
            prop="storageSiteIp"
            label="IP地址"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            prop="status"
            label="状态"
            width="110"
          >
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag disable-transitions>{{ stateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('system')"
            prop="system"
            label="操作系统"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            prop="version"
            label="版本"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('storageSiteUrl')"
            prop="storageSiteUrl"
            label="播放地址"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            prop="address"
            label="详细地址"
            min-width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('cpu')"
            prop="cpu"
            label="CPU"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            prop="memory"
            label="内存(GB)"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            prop="purchaseDate"
            label="购置时间"
            width="180"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('disk')"
            prop="disk"
            label="磁盘(GB)"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('remark')"
            prop="remark"
            label="备注"
            min-width="160"
            :show-overflow-tooltip="true"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
        <!-- 添加或修改执法仪对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="750px"
          :close-on-click-modal="false"
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <!-- 管理信息 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item
                  label="管理组织"
                  prop="managerOrgId"
                  label-width="100px"
                >
                  <treeselect
                    v-model="form.managerOrgId"
                    :options="orgOptions"
                    placeholder="请选择管理组织"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="管理人员" label-width="100px">
                  <el-select
                    v-model="form.managerId"
                    placeholder="请选择"
                    class="full-width"
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
              </el-col>
            </el-row>

            <!-- 基础信息 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="名称" prop="storageSiteName" label-width="100px">
                  <el-input v-model="form.storageSiteName" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编号" prop="storageSiteNo" label-width="100px">
                  <el-input v-model="form.storageSiteNo" placeholder="请输入编号" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 设备信息 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item
                  label="品牌名称"
                  prop="brandName"
                  label-width="100px"
                >
                  <el-input
                    v-model="form.brandName"
                    placeholder="请输入品牌名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备状态" label-width="100px">
                  <el-radio-group v-model="form.status" class="radio-group">
                    <el-radio
                      v-for="dict in stateOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 网络配置 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="IP地址" prop="storageSiteIp" label-width="100px">
                  <el-input v-model="form.storageSiteIp" placeholder="请输入IP地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="物理地址"
                  prop="address"
                  label-width="100px"
                >
                  <el-input
                    v-model="form.address"
                    placeholder="请输入物理地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="播放地址" prop="storageSiteUrl" label-width="100px">
                  <el-input v-model="form.storageSiteUrl" placeholder="请输入播放地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密钥" prop="authKey" label-width="100px">
                  <el-input v-model="form.authKey" placeholder="请输入密钥" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 硬件配置 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="CPU型号" label-width="100px">
                  <el-input v-model="form.cpu" placeholder="请输入CPU型号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存容量" label-width="100px">
                  <el-input-number
                    v-model="form.memory"
                    placeholder="单位：GB"
                    :min="0"
                    controls-position="right"
                    class="full-width"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="存储容量" label-width="100px">
                  <el-input-number
                    v-model="form.disk"
                    placeholder="单位：GB"
                    :min="0"
                    controls-position="right"
                    class="full-width"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 系统信息 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="操作系统" label-width="100px">
                  <el-input
                    v-model="form.system"
                    placeholder="请输入系统名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统版本" label-width="100px">
                  <el-input v-model="form.version" placeholder="请输入版本号" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 其他信息 -->
            <el-row :gutter="15">
              <el-col :span="12">
                <el-form-item label="购置时间" label-width="100px">
                  <el-date-picker
                    v-model="form.purchaseDate"
                    type="datetime"
                    placeholder="选择购置时间"
                    value-format="yyyy-MM-ddTHH:mm:ssZ"
                    class="full-width"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注说明" label-width="100px">
                  <el-input
                    v-model="form.remark"
                    placeholder="请输入备注信息"
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
          <el-tabs v-model="ActiveLab">
            <el-tab-pane label="存储信息" name="first">
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
            </el-tab-pane>
            <el-tab-pane label="存储配置" name="second">
              <el-table
                v-loading="loading"
                :data="AttributeValueConfigList"
                border
              >
                <el-table-column
                  prop="AttributeName"
                  label="属性"
                  width="200"
                  align="center"
                />
                <el-table-column
                  prop="Value"
                  label="值"
                  width="350"
                  align="center"
                />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listEquipmentStorage,
  delEquipmentStorage,
  getEquipmentStorage,
  getEquipmentStorageConfig,
  addEquipmentStorage,
  updateEquipmentStorage,
} from "@/api/admin/equipment_manage_api";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { listUser } from "@/api/admin/sys-user";
export default {
  name: "Storage",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      StorageIds: [],
      // 可否修改
      UpdateDisabled: true,
      // 可否删除
      DeleteDisabled: true,
      // 总条数
      total: 0,
      // 执法仪数据
      StorageList: [],
      // 状态数据字典
      stateOptions: [],
      // 列配置
      columnOptions: [
        { prop: "storageSiteName", label: "名称", fixed: true, defaultVisible: true },
        { prop: "storageSiteNo", label: "编号", defaultVisible: true },
        { prop: "brandName", label: "品牌名称", defaultVisible: true },
        { prop: "managerName", label: "管理员", defaultVisible: true },
        {
          prop: "managerOrgFullName",
          label: "管理员所在组织",
          defaultVisible: true,
        },
        { prop: "storageSiteIp", label: "IP地址", defaultVisible: true },
        { prop: "status", label: "状态", defaultVisible: true },
        { prop: "system", label: "操作系统", defaultVisible: true },
        { prop: "version", label: "版本", defaultVisible: false },
        { prop: "storageSiteUrl", label: "播放地址", defaultVisible: false },
        { prop: "address", label: "详细地址", defaultVisible: false },
        { prop: "cpu", label: "CPU", defaultVisible: false },
        { prop: "memory", label: "内存(GB)", defaultVisible: false },
        { prop: "purchaseDate", label: "购置时间", defaultVisible: false },
        { prop: "disk", label: "磁盘(GB)", defaultVisible: false },
        { prop: "remark", label: "备注", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: "",
      isEdit: false,
      // 是否显示增加存储对话框
      open: false,
      // 是否显示查看存储详情对话框
      ViewOpen: false,
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      ActiveLab: "first",
      SelectedRow: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        storageSiteNo: undefined,
        storageSiteName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        status: undefined,
        brandName: undefined,
      },
      AttributeValueList: [],
      AttributeValueConfigList: [],
      // 表单参数
      form: {
        status: "1",
      },
      ColumnNameConvert: new Map([
        ["id", "主键ID"],
        ["storageSiteNo", "编号"],
        ["storageSiteName", "名称"],
        ["storageSiteIp", "IP地址"],
        ["storageSiteUrl", "播放地址"],
        ["address", "详细地址"],
        ["authKey", "密钥"],
        ["managerName", "管理员"],
        ["cpu", "CPU"],
        ["memory", "内存"],
        ["disk", "存储"],
        ["purchaseDate", "购置时间"],
        ["system", "操作系统"],
        ["version", "版本号"],
        ["remark", "备注"],
        ["brandName", "品牌名称"],
        ["managerOrgFullName", "归属单位"],
        ["status", "状态"],
      ]),
      ColumnNameConfigConvert: new Map([
        ["Id", "主键ID"],
        ["StorageName", "存储服务器名称"],
        ["FtpUsername", "FTP用户名"],
        ["FtpPassword", "FTP密码"],
        ["FtpPort", "FTP端口"],
        ["HeartBeatTimeSpace", "心跳包间隔时间"],
        ["FileRootPath", "文件保存路径"],
        ["UploadSpeed", "上传文件速率"],
        ["ExpiryTime", "到期时间"],
      ]),
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: "编号不能为空", trigger: "blur" }],
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
    this.getDicts("site_status").then((response) => {
      this.stateOptions = response.data;
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
      const saved = localStorage.getItem("storage_manage_visible_columns");
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
        "storage_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns();
      localStorage.setItem(
        "storage_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 查询存储列表 */
    getList() {
      this.loading = true;
      listEquipmentStorage(this.queryParams).then((response) => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.StorageList = response.data.list;
        this.total = response.data.count;
        this.loading = false;
      });
    },

    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, parseInt(row.status));
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

    // 表单重置
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
        storageSiteNo: undefined,
        storageSiteName: undefined,
        storageSiteIp: undefined,
        storageSiteUrl: undefined,
        address: undefined,
        authKey: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        purchaseDate: undefined,
        system: undefined,
        version: undefined,
        remark: undefined,
        brandName: undefined,
        status: "1",
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.StorageIds = selection.map((item) => item.id);
      this.UpdateDisabled = selection.length !== 1;
      this.DeleteDisabled = !selection.length;
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset();
      this.open = true;
      this.title = "添加存储";
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
    /** 修改按钮操作 ,该函数可以优化，没有必要从服务端获取数据。查询到的所有记录都缓存在了前端*/
    handleUpdate(row) {
      this.reset();
      this.firstLoad = true;
      const StorageId = row.id || this.StorageIds;
      getEquipmentStorage(StorageId).then((response) => {
        this.form = response.data;
        this.form.status = String(this.form.status);
        this.title = "修改存储";
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
      this.AttributeValueConfigList = [];
      getEquipmentStorageConfig(row.id).then((response) => {
        Object.keys(response.data).forEach((key) => {
          const attributeValue = {
            AttributeName: this.ColumnNameConfigConvert.get(key),
            Value: response.data[key],
          };
          this.AttributeValueConfigList.push(attributeValue);
        });
      });
      this.ViewOpen = true;
      this.title = "";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.status = parseInt(this.form.status);
          if (this.form.id !== undefined) {
            updateEquipmentStorage(this.form, this.form.id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addEquipmentStorage(this.form).then((response) => {
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

    handleDelete(row) {
      const StorageId = (row.id && [row.id]) || this.StorageIds;
      this.$confirm(
        '是否确认删除存储编号为"' + StorageId + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delEquipmentStorage({ ids: StorageId });
        })
        .then((response) => {
          this.getList();
          this.msgSuccess(response.msg);
        })
        .catch(function () {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$confirm("是否确认导出所有存储数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.downloadLoading = true;
        import("@/vendor/Export2Excel").then((excel) => {
          const tHeader = [
            "主键ID",
            "编号",
            "名称",
            "IP地址",
            "播放地址",
            "详细地址",
            "密钥",
            "管理员",
            "CPU",
            "内存",
            "存储",
            "购置时间",
            "操作系统",
            "版本号",
            "备注",
            "品牌名称",
            "归属单位",
            "状态",
          ];
          const filterVal = [
            "id",
            "storageSiteNo",
            "storageSiteName",
            "storageSiteIp",
            "storageSiteUrl",
            "address",
            "authKey",
            "managerName",
            "cpu",
            "memory",
            "disk",
            "purchaseDate",
            "system",
            "version",
            "remark",
            "brandName",
            "managerOrgFullName",
            "status",
          ];
          const list = this.StorageList;
          const data = formatJson(filterVal, list);
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: "存储列表",
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
