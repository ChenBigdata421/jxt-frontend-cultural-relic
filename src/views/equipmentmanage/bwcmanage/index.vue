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
          <el-form-item prop="brandId" label="品牌">
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
                v-for="dict in stateOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="enableUse" label="是否可用">
            <el-select
              v-model="queryParams.enableUse"
              placeholder="是否可用"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in enableUseOptions"
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
                  v-permisaction="['equipment:bwc:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:bwc:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="selectedBwcRecords.length !== 1"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:bwc:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="selectedBwcRecords.length === 0"
                  @click="handleDelete"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:bwc:export']"
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
          ref="bwcTable"
          v-loading="loading"
          :data="bwcList"
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
            width="200"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:bwc:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['equipment:bwc:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['equipment:bwc:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('no')"
            prop="bwcNo"
            label="编号"
            width="120"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            prop="bwcName"
            label="名称"
            width="140"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            prop="brandName"
            label="品牌"
            width="140"
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
            width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('enableUse')"
            prop="enableUse"
            label="是否可用"
            width="120"
          >
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.enableUse === 1 ? 'success' : 'danger'"
                disable-transitions
                >{{ enableUseFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('state')"
            prop="status"
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
                >{{ stateFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('cpu')"
            prop="cpu"
            label="CPU"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            prop="memory"
            label="内存(G)"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('disk')"
            prop="disk"
            label="存储(G)"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('networkCard')"
            prop="networkCard"
            label="网卡"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('usbNum')"
            prop="usbNum"
            label="USB数量"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('system')"
            prop="system"
            label="操作系统"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            prop="version"
            label="版本"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('buyTime')"
            prop="purchaseDate"
            label="购买时间"
            width="180"
            sortable="custom"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
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
          width="600px"
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
                <el-form-item label="名称" prop="bwcName">
                  <el-input v-model="form.bwcName" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编号" prop="bwcNo">
                  <el-input
                    v-model="form.bwcNo"
                    placeholder="请输入编号"
                    :disabled="title === '修改执法仪'"
                  />
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

            <!-- 状态信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否可用">
                  <el-radio-group v-model="form.enableUse">
                    <el-radio
                      v-for="dict in enableUseOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.status">
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

            <!-- 硬件配置 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="CPU">
                  <el-input v-model="form.cpu" placeholder="请输入CPU" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存(G)">
                  <el-input-number
                    v-model="form.memory"
                    placeholder="请输入内存大小"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="存储(G)">
                  <el-input-number
                    v-model="form.disk"
                    placeholder="请输入磁盘大小"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网卡">
                  <el-input
                    v-model="form.networkCard"
                    placeholder="请输入网卡型号"
                  />
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
                  <el-input
                    v-model="form.system"
                    placeholder="操作系统"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本">
                  <el-input
                    v-model="form.version"
                    placeholder="版本"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 备注 -->
            <el-row>
              <el-col :span="12">
                <el-form-item label="购置时间">
                  <el-date-picker
                    v-model="form.purchaseDate"
                    type="datetime"
                    placeholder="请输入购置时间"
                    format="yyyy-MM-dd HH:mm:ss"
                    value-format="yyyy-MM-dd HH:mm:ss"
                  />
                </el-form-item>
              </el-col>
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

        <!-- 浏览执法仪对话框 -->
        <el-dialog
          title="浏览执法仪"
          :visible.sync="viewOpen"
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
            <el-descriptions-item label="备注" :span="2">{{
              viewData.remark || "无"
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              viewData.createdAt ? parseTime(viewData.createdAt) : "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              viewData.updatedAt ? parseTime(viewData.updatedAt) : "-"
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
  getEquipmentBwcList,
  delEquipmentBwc,
  addEquipmentBwc,
  updateEquipmentBwc,
  listEquipmentBrand,
} from "@/api/admin/equipment_manage_api";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { listUser } from "@/api/admin/sys-user";
export default {
  name: "LawCarema",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      BwcIds: [],
      // 总条数
      total: 0,
      // 执法仪数据
      bwcList: [],
      // 状态数据字典
      stateOptions: [],
      // 是否可用数据字典
      enableUseOptions: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedBwcMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      //所有选中的警情记录
      selectedBwcRecords: [],
      // 列配置
      columnOptions: [
        { prop: "no", field: "bwcNo", label: "编号", defaultVisible: true },
        { prop: "name", field: "bwcName", label: "名称", defaultVisible: true },
        { prop: "managerName", label: "管理员", defaultVisible: true },
        {
          prop: "managerOrgFullName",
          label: "管理员所在组织",
          defaultVisible: true,
        },
        { prop: "brandName", label: "品牌", defaultVisible: true },
        { prop: "enableUse", label: "是否可用", defaultVisible: true },
        { prop: "state", field: "status", label: "状态", defaultVisible: true },
        { prop: "cpu", label: "CPU", defaultVisible: false },
        { prop: "memory", label: "内存(G)", defaultVisible: false },
        { prop: "disk", label: "存储(G)", defaultVisible: false },
        { prop: "networkCard", label: "网卡", defaultVisible: false },
        { prop: "usbNum", label: "USB数量", defaultVisible: false },
        { prop: "system", label: "操作系统", defaultVisible: false },
        { prop: "version", label: "版本", defaultVisible: false },
        {
          prop: "buyTime",
          field: "purchaseDate",
          label: "购买时间",
          defaultVisible: false,
        },
        { prop: "remark", label: "备注", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: "",
      isEdit: false,
      // 是否显示增加执法仪对话框
      open: false,
      viewOpen: false,
      // 浏览数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      brandOptions: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        status: undefined,
        enableUse: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: "编号不能为空", trigger: "blur" }],
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
    this.getDicts("bwc_status").then((response) => {
      this.stateOptions = response.data;
    });
    this.getDicts("enableuse_state").then((response) => {
      this.enableUseOptions = response.data;
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
      const saved = localStorage.getItem("bwc_manage_visible_columns");
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
        "bwc_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns();
      localStorage.setItem(
        "bwc_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 查询执法仪列表 */
    getList() {
      this.loading = true;
      const query = this.normalizeQueryParams(this.queryParams);
      getEquipmentBwcList(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.bwcList = response.data.list;
            this.total = response.data.count;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.bwcList = [];
            this.total = 0;
            this.msgError(response.msg || "获取执法仪列表失败");
          }
        })
        .catch((error) => {
          this.bwcList = [];
          this.total = 0;
          this.msgError("查询执法仪列表失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    //当用户在页面中清除查询条件后，有些查询条件可能被置为空串或者空，这样在随后的restful 请求中仍会被携带
    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null) {
          delete query[key];
        }
      });
      return query;
    },
    getFormBrand() {
      listEquipmentBrand().then((response) => {
        this.brandOptions = response.data.list;
      });
    },
    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, row.status);
    },
    // 字典状态字典翻译
    enableUseFormat(row) {
      return this.selectDictLabel(this.enableUseOptions, row.enableUse);
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
        bwcName: undefined,
        bwcNo: undefined,
        enableUse: undefined,
        state: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        networkCard: undefined,
        usbNum: undefined,
        system: undefined,
        version: undefined,
        purchaseDate: undefined,
        remark: undefined,
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
    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedBwcMap = {};
      this.selectedBwcRecords = [];
    },

    //pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    //每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1;
    },

    handleQuery() {
      this.resetPage();
      this.resetSelected();
      this.getList();
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

      (this.bwcList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedBwcMap[id] = row;
        } else {
          delete this.selectedBwcMap[id];
        }
      });
      this.selectedBwcRecords = Object.values(this.selectedBwcMap).filter(
        Boolean
      );
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset();
      this.open = true;
      this.title = "添加执法仪";
      this.isEdit = false;
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.bwcTable) return;
      if (!this.bwcList || !this.bwcList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.bwcList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedBwcMap[id]) {
              this.$refs.bwcTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
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
        this.form = this.selectedBwcRecords[0]
          ? { ...this.selectedBwcRecords[0] }
          : {};
      }
      this.title = "修改执法仪";
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
            this.startProcessing("正在修改执法仪...");
            updateEquipmentBwc(this.form, this.form.id)
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
                this.msgError(
                  "修改执法仪失败：" + (error.message || "未知错误")
                );
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建执法仪...");
            addEquipmentBwc(this.form)
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
                this.msgError(
                  "新增执法仪失败：" + (error.message || "未知错误")
                );
              })
              .finally(() => {
                this.stopProcessing();
              });
          }
        }
      });
    },

    async handleDelete(row) {
      try {
        var bwcIds = [];
        var bwcNos = [];
        if (row && row.id !== undefined) {
          bwcIds = append(bwcIds, row.id);
          bwcNos = append(bwcCodes, row.bwcNo);
        } else {
          bwcIds = this.selectedBwcRecords.map((item) => item.id);
          bwcNos = this.selectedBwcRecords.map((item) => item.bwcNo);
        }
        await this.$confirm(
          '是否确认删除执法仪编号为"' + bwcNos + '"的数据项?',
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );

        this.startProcessing("正在删除执法仪...");
        const response = await delEquipmentBwc({ ids: bwcIds });
        if (response.code === 200) {
          await this.delay(1000);
          this.resetSelected();
          this.resetPage();
          this.getList();
          this.msgSuccess(response.msg || "删除执法仪成功");
        } else {
          this.msgError(response.msg || "删除执法仪失败");
        }
        this.stopProcessing();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除执法仪失败：" + (error.message || "未知错误"));
        }
      }
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

    /** 清理导出事件监听 */
    cleanupExportListeners() {
      if (this.focusListener) {
        window.removeEventListener("focus", this.focusListener);
        this.focusListener = null;
      }
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection = this.selectedBwcRecords.length > 0;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedBwcRecords.length} 条执法仪数据？`
          : "是否确认导出所有执法仪数据项？";

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
          list = this.selectedBwcRecords;
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
            const resp = await getEquipmentBwcList(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询执法仪列表失败");
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
          const option = (this.stateOptions || []).find(
            (item) => String(item.value) === String(value)
          );
          return option ? option.label : value;
        };

        const formatEnableUseOptions = (value) => {
          const option = (this.enableUseOptions || []).find(
            (item) => String(item.value) === String(value)
          );
          return option ? option.label : value;
        };

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row };
          output.status = formatStatus(row.status);
          output.enableUse = formatEnableUseOptions(row.enableUse);
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
          filename: "执法仪列表",
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
        this.msgSuccess("导出执法仪成功");
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("导出失败：" + (error.message || "未知错误"));
        }
      } finally {
        // 清理状态和事件监听
        this.exporting = false;
        this.stopProcessing();
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
