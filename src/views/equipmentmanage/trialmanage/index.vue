<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="场地编号" prop="trialNo">
            <el-input
              v-model="queryParams.trialNo"
              placeholder="请输入场地编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="场地名称" prop="trialName">
            <el-input
              v-model="queryParams.trialName"
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
          <el-form-item label="管理人员" prop="managerId">
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
          <el-form-item label="品牌" prop="brandId">
            <el-select
              v-model="queryParams.brandId"
              placeholder="请选择品牌"
              style="width: 170px"
              clearable
            >
              <el-option
                v-for="item in brandOptions"
                :key="item.id"
                :label="item.brandName"
                :value="item.id"
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
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
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
                  :disabled="selectedTrialRecords.length !== 1"
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
                  :disabled="selectedTrialRecords.length === 0"
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
          ref="trialTable"
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
            v-if="isColumnVisible('trialNo')"
            label="编号"
            sortable="custom"
            prop="trialNo"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('trialName')"
            label="名称"
            sortable="custom"
            prop="trialName"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            label="品牌名称"
            prop="brandName"
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
            v-if="isColumnVisible('trialIp')"
            label="IP"
            prop="trialIp"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            label="地址"
            prop="address"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('trialUrl')"
            label="播放地址"
            prop="trialUrl"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            label="购置时间"
            prop="purchaseDate"
            width="180"
            sortable="custom"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('version')"
            label="版本号"
            prop="version"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            label="状态"
            width="120"
          >
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
                >{{ StateFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('remark')"
            label="备注"
            prop="remark"
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
                <el-form-item label="编号" prop="trialNo">
                  <el-input v-model="form.trialNo" placeholder="请输入编号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称" prop="trialName">
                  <el-input v-model="form.trialName" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌">
                  <el-select v-model="form.brandId" placeholder="请选择">
                    <el-option
                      v-for="item in brandOptions"
                      :key="item.id"
                      :label="item.brandName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 网络信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="IP" prop="trialIp">
                  <el-input v-model="form.trialIp" placeholder="请输入IP" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址" prop="address">
                  <el-input v-model="form.address" placeholder="请输入地址" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 扩展信息 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="播放地址" prop="trialUrl">
                  <el-input
                    v-model="form.trialUrl"
                    placeholder="请输入播放地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="密钥" prop="authKey">
                  <el-input v-model="form.authKey" placeholder="请输入密钥" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 系统信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="版本号" prop="version">
                  <el-input v-model="form.version" placeholder="请输入版本号" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 状态与备注 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.status">
                    <el-radio
                      v-for="dict in statusOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购置时间" label-width="100px">
                  <el-date-picker
                    v-model="form.purchaseDate"
                    type="datetime"
                    placeholder="选择购置时间"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    class="full-width"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input
                    v-model="form.remark"
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

        <!-- 浏览试验场对话框 -->
        <el-dialog
          title="浏览试验场"
          :visible.sync="viewOpen"
          width="800px"
          append-to-body
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="试验场编号">{{
              viewData.trialNo || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="试验场名称">{{
              viewData.trialName || "-"
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
            <el-descriptions-item label="状态">{{
              selectDictLabel(statusOptions, viewData.status) || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="IP 地址">{{
              viewData.trialIp || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="播放地址">{{
              viewData.trialUrl || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="密钥">{{
              viewData.authKey || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="物理地址" :span="2">{{
              viewData.address || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="版本号">{{
              viewData.version || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="购置时间">{{
              viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{
              viewData.remark || "无"
            }}</el-descriptions-item>
          </el-descriptions>
          <div slot="footer" class="dialog-footer">
            <el-button @click="viewOpen = false">关 闭</el-button>
          </div>
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
  listEquipmentBrand,
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
      selectedTrialRecords: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedTrialMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 总条数
      total: 0,
      // 角色表格数据
      equipmentTrialList: [],
      // 列配置
      columnOptions: [
        { prop: "trialNo", label: "编号", defaultVisible: true },
        { prop: "trialName", label: "名称", defaultVisible: true },
        { prop: "brandName", label: "品牌名称", defaultVisible: true },
        { prop: "managerName", label: "管理员", defaultVisible: true },
        {
          prop: "managerOrgFullName",
          label: "管理员所在组织",
          defaultVisible: true,
        },
        { prop: "trialIp", label: "IP", defaultVisible: true },
        { prop: "address", label: "地址", defaultVisible: true },
        { prop: "trialUrl", label: "播放地址", defaultVisible: false },
        { prop: "purchaseDate", label: "购置时间", defaultVisible: false },
        { prop: "version", label: "版本号", defaultVisible: false },
        { prop: "status", label: "状态", defaultVisible: true },
        { prop: "remark", label: "备注", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      viewOpen: false,
      // 浏览数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      brandOptions: undefined,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      isEdit: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        trialName: undefined,
        trialNo: undefined,
        status: undefined,
        brandName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
      },
      // 表单参数
      form: {
        status: undefined,
      },
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 表单校验
      rules: {
        trialNo: [{ required: true, message: "编号不能为空", trigger: "blur" }],
        trialName: [
          { required: true, message: "名称不能为空", trigger: "blur" },
        ],
      },
      exporting: false,
      blurWhileExport: false, //标记页面失去焦点的状态
      processingInstance: null, //Element UI全局加载动画的实例
      focusListener: null, //页面获焦点事件的 (focus）的监听器
      previousCursor: null, //记录鼠标状态
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
    this.getFormBrand();
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
      const query = this.normalizeQueryParams(this.queryParams);
      listEquipmentTrial(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.equipmentTrialList = response.data.list;
            this.total = response.data.count;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.equipmentTrialList = [];
            this.total = 0;
            this.msgError(response.msg || "获取trial列表失败");
          }
        })
        .catch((error) => {
          this.equipmentTrialList = [];
          this.total = 0;
          this.msgError("获取trial列表失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
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
        trialNo: undefined,
        trialName: undefined,
        trialIp: undefined,
        address: undefined,
        trialUrl: undefined,
        authKey: undefined,
        purchaseDate: undefined,
        version: undefined,
        remark: undefined,
        brandName: undefined,
        brandId: undefined,
        status: undefined,
      };
      this.resetForm("form");
    },
    // 字典翻译
    StateFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
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

    getFormBrand() {
      listEquipmentBrand().then((response) => {
        this.brandOptions = response.data.list;
      });
    },

    getQueryUser() {
      listUser({ orgId: "/" + this.queryParams.managerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list;
        }
      );
    },
    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedTrialMap = {};
      this.selectedTrialRecords = [];
    },

    //pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    //每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1;
    },

    handleQuery() {
      this.resetSelected();
      this.resetPage();
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });
      // 鼠标切换为等待状态
      this.previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close();
        this.processingInstance = null;
      }
      // 恢复鼠标状态
      document.body.style.cursor = this.previousCursor;
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return;
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.equipmentTrialList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedTrialMap[id] = row;
        } else {
          delete this.selectedTrialMap[id];
        }
      });
      this.selectedTrialRecords = Object.values(this.selectedTrialMap).filter(
        Boolean
      );
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.trialTable) return;
      if (!this.equipmentTrialList || !this.equipmentTrialList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.equipmentTrialList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedTrialMap[id]) {
              this.$refs.trialTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
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
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row };
      } else {
        this.form = this.selectedTrialRecords[0]
          ? { ...this.selectedTrialRecords[0] }
          : {};
      }
      this.title = "修改场地";
      this.isEdit = true;
      this.open = true;
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row;
      this.viewOpen = true;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing("正在修改场地...");
            updateEquipmentTrial(this.form, this.form.id)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(1000);
                  this.resetSelected();
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("修改场地失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建场地...");
            addEquipmentTrial(this.form)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(1000);
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("新增场地失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          }
        }
      });
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var trialIds = [];
        var trialNos = [];
        if (row && row.id !== undefined) {
          trialIds = [row.id];
          trialNos = [row.trialNo];
        } else {
          trialIds = this.selectedTrialRecords.map((item) => item.id);
          trialNos = this.selectedTrialRecords.map((item) => item.trialNo);
        }
        await this.$confirm(
          '是否确认删除场地编号为"' + trialNos + '"的数据项?',
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );
        this.startProcessing("正在删除场地...");
        const response = await delEquipmentTrial({ ids: trialIds });
        if (response.code === 200) {
          await this.delay(1000);
          this.resetSelected();
          this.resetPage();
          this.getList();
          this.msgSuccess(response.msg || "删除场地成功");
        } else {
          this.msgError(response.msg || "删除场地失败");
        }
        this.stopProcessing();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除场地失败：" + (error.message || "未知错误"));
        }
      }
    },
    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        }
      });
      return query;
    },
    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedTrialRecords) &&
          this.selectedTrialRecords.length > 0;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedTrialRecords.length} 条场地数据？`
          : "是否确认导出所有场地数据项？";

        await this.$confirm(confirmText, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        });

        const columnOptions = Array.isArray(this.columnOptions)
          ? this.columnOptions
          : [];
        const visibleColumns = Array.isArray(this.visibleColumns)
          ? this.visibleColumns
          : [];
        const exportColumns = columnOptions.filter((c) =>
          visibleColumns.includes(c.prop)
        );

        if (!exportColumns.length) {
          this.msgError("当前未选择任何可导出的列");
          return;
        }

        const tHeader = exportColumns.map((c) => c.label);
        const filterVal = exportColumns.map((c) => c.field || c.prop);

        let list = [];
        if (hasSelection) {
          list = this.selectedTrialRecords;
        } else {
          const baseQueryParams = this.normalizeQueryParams(
            this.queryParams || {}
          );
          const pageSize = 1000;
          let pageIndex = 1;
          let total = Infinity;

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize,
            };
            const resp = await listEquipmentTrial(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询场地列表失败");
            }

            const pageList = (resp.data && resp.data.list) || [];
            total = (resp.data && resp.data.count) || 0;
            list = list.concat(pageList);

            if (!pageList.length) {
              break;
            }
            pageIndex += 1;
          }
        }

        const formatDateTime = (value) => {
          if (!value) return "-";
          try {
            return this.parseTime ? this.parseTime(value) : value;
          } catch (error) {
            return value;
          }
        };

        const formatStatus = (value) => {
          const option = (this.statusOptions || []).find(
            (item) => String(item.value) === String(value)
          );
          return option ? option.label : value;
        };

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row };
          output.status = formatStatus(row.status);
          output.purchaseDate = formatDateTime(row.purchaseDate);
          return output;
        });

        const data = formatJson(filterVal, normalizeList);
        // 标记导出开始
        this.exporting = true;
        this.blurWhileExport = true; //弹出“另存为”对话框时，页面将失焦

        // 注册 focus 事件：当用户从“另存为”对话框返回时
        this.focusListener = () => {
          if (this.exporting && this.blurWhileExport) {
            this.blurWhileExport = false;
            console.log(
              "[导出] 页面获焦，用户已从另存为对话框返回，启动 loading"
            );
          }
        };

        window.addEventListener("focus", this.focusListener);

        // 触发导出（会弹出另存为对话框）
        const excel = await import("@/vendor/Export2Excel");
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "场地列表",
          autoWidth: true,
          bookType: "xlsx",
        });
        // 等待用户从“另存为”对话框返回
        while (this.blurWhileExport) {
          await this.delay(100);
        }
        this.startProcessing("正在导出...");
        await this.delay(3000);
        this.resetSelected();
        this.getList();
        this.msgSuccess("导出场地成功");
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("导出失败：" + (error.message || "未知错误"));
        }
      } finally {
        this.stopProcessing();
        this.exporting = false;
        this.cleanupExportListeners();
      }
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
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
