<template>
  <div class="archive-selector">
    <!-- 查询条件 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      class="demo-form-inline"
      size="small"
    >
      <el-form-item label="档案编号" prop="archiveCode">
        <el-input
          v-model="queryParams.archiveCode"
          placeholder="请输入档案编号"
          clearable
          style="width: 170px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="档案标题" prop="archiveTitle">
        <el-input
          v-model="queryParams.archiveTitle"
          placeholder="请输入档案标题"
          clearable
          style="width: 170px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="档案类型" prop="archiveType">
        <el-select
          v-model="queryParams.archiveType"
          placeholder="请选择档案类型"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="dict in archiveTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="管理部门" prop="orgId">
        <treeselect
          v-model="queryParams.orgId"
          :options="orgOptions"
          placeholder="请选择管理部门"
          style="width: 170px"
          clearable
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="dict in statusOptions"
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
          >查询</el-button
        >
        <el-button
          type="default"
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <!-- 自定义工具栏插槽 -->
    <div v-if="!selectionMode" class="toolbar-container">
      <el-row :gutter="10" type="flex" justify="space-between">
        <el-col :span="20">
          <slot name="toolbar"></slot>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-popover placement="bottom-end" width="300" trigger="click">
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
            <el-button slot="reference" size="mini" icon="el-icon-setting">
              列设置
            </el-button>
          </el-popover>
        </el-col>
      </el-row>
    </div>

    <!-- 档案列表 -->
    <el-table
      ref="archiveTable"
      v-loading="loading"
      :data="archiveList"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 (单选和多选都使用checkbox) -->
      <el-table-column type="selection" width="55" align="center" />
      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="250"
        align="center"
        fixed="left"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'edit')"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'delete')"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'view')"
            >详情</el-button
          >
          <!-- 自定义操作按钮插槽 -->
          <slot name="operation" :row="scope.row"></slot>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('archiveCode')"
        prop="archiveCode"
        label="档案编号"
        width="180"
        align="center"
        sortable="custom"
      />
      <el-table-column
        v-if="isColumnVisible('archiveTitle')"
        prop="archiveTitle"
        label="档案标题"
        width="200"
        :resizable="false"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('archiveType')"
        prop="archiveType"
        label="档案类型"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag disable-transitions>{{
            archiveTypeFormat(scope.row)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('description')"
        prop="description"
        label="档案描述"
        width="220"
        :resizable="false"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('orgName')"
        prop="orgName"
        label="管理部门"
        width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('orgJc')"
        prop="orgJc"
        label="管理部门简称"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('orgCode')"
        prop="orgCode"
        label="管理部门编码"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('orgId')"
        prop="orgId"
        label="管理部门ID"
        width="140"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('storageDuration')"
        prop="storageDuration"
        label="保存期限(月)"
        width="120"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('expirationTime')"
        prop="expirationTime"
        label="过期时间"
        width="160"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('status')"
        prop="status"
        label="状态"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" disable-transitions>
            {{ statusFormat(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColumnVisible('createUserName')"
        prop="createUserName"
        label="录入人员"
        width="120"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('createUserNo')"
        prop="createUserNo"
        label="录入人编号"
        width="160"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('updateUserName')"
        prop="updateUserName"
        label="更新人员"
        width="120"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('updateUserNo')"
        prop="updateUserNo"
        label="更新人编号"
        width="160"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('remarks')"
        prop="remarks"
        label="备注信息"
        width="220"
        :resizable="false"
        show-overflow-tooltip
      />
      <el-table-column
        v-if="isColumnVisible('createdAt')"
        prop="createdAt"
        label="录入时间"
        width="160"
        align="center"
      />
      <el-table-column
        v-if="isColumnVisible('updatedAt')"
        prop="updatedAt"
        label="更新时间"
        width="160"
        align="center"
      />
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listArchives } from "@/api/evidence/archive_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "ArchiveSelector",
  components: { Treeselect },
  props: {
    // 是否为选择模式（用于对话框中的档案选择）
    selectionMode: {
      type: Boolean,
      default: false,
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true,
    },
    // 初始查询参数
    initialQuery: {
      type: Object,
      default: () => ({}),
    },
    // 自定义档案列表API函数
    customListApi: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      // 遮罩层
      loading: true,

      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 档案数据
      archiveList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        orgId: undefined,
        status: undefined,
        orderByColumn: undefined,
        isAsc: "desc",
      },
      // 组织树选项
      orgOptions: [],
      // 档案类型选项
      archiveTypeOptions: [
        { label: "案件档案", value: 1 },
        { label: "证据档案", value: 2 },
        { label: "执法档案", value: 3 },
        { label: "其他档案", value: 4 },
      ],
      // 状态选项
      statusOptions: [
        { label: "正常", value: 0 },
        { label: "异常", value: 1 },
        { label: "其他", value: 2 },
      ],
      // 列配置选项
      columnOptions: [
        { prop: "archiveCode", label: "档案编号", fixed: true },
        { prop: "archiveTitle", label: "档案标题", fixed: false },
        { prop: "archiveType", label: "档案类型", fixed: false },
        { prop: "description", label: "档案描述", fixed: false },
        { prop: "orgName", label: "管理部门", fixed: false },
        { prop: "orgJc", label: "管理部门简称", fixed: false },
        { prop: "orgCode", label: "管理部门编码", fixed: false },
        { prop: "storageDuration", label: "保存期限(月)", fixed: false },
        { prop: "expirationTime", label: "过期时间", fixed: false },
        { prop: "status", label: "状态", fixed: false },
        { prop: "createUserName", label: "录入人员", fixed: false },
        { prop: "createUserNo", label: "录入人编号", fixed: false },
        { prop: "updateUserName", label: "更新人员", fixed: false },
        { prop: "updateUserNo", label: "更新人编号", fixed: false },
        { prop: "remarks", label: "备注信息", fixed: false },
        { prop: "createdAt", label: "录入时间", fixed: false },
        { prop: "updatedAt", label: "更新时间", fixed: false },
      ],
      // 可见列（默认全部显示）
      visibleColumns: [],
      selectedArchiveMap: {},
      isRestoringSelection: false,
    };
  },
  created() {
    // 初始化可见列
    this.initVisibleColumns();
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery };
    this.getList();
    this.getOrgTree();
  },
  methods: {
    /** 查询档案列表 */
    getList() {
      this.loading = true;
      const query = { ...this.queryParams };
      Object.keys(query).forEach((key) => {
        if (query[key] === "" || query[key] === null) {
          delete query[key];
        }
      });
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listArchives
      const apiFunc = this.customListApi || listArchives;
      apiFunc(query)
        .then((response) => {
          if (response.code === 200) {
            this.archiveList = response.data.list || [];
            this.total = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.msgError(response.msg || "查询档案失败");
          }
          this.loading = false;
        })
        .catch((error) => {
          this.msgError("查询档案失败：" + (error.message || "未知错误"));
          this.loading = false;
        });
    },

    /** 获取组织树 */
    getOrgTree() {
      orgTreeSelect()
        .then((response) => {
          if (response.code === 200) {
            this.orgOptions = response.data;
          } else {
            this.msgError(response.msg || "获取组织树失败");
          }
        })
        .catch((error) => {
          this.msgError("获取组织树失败：" + (error.message || "未知错误"));
          this.orgOptions = [];
        });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        orgId: undefined,
        status: undefined,
        orderByColumn: undefined,
        isAsc: "desc",
        ...this.initialQuery,
      };
      this.handleQuery();
    },

    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      const isSelected = selection.some(
        (item) => item.archiveId === row.archiveId
      );
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit("select", row);
      }
    },

    /** 单个选择框点击事件 - 实现单选逻辑 */
    handleSelect(selection, row) {
      // 如果是单选模式,清空其他选择,只保留当前选中的行
      if (!this.multiple) {
        this.$refs.archiveTable.clearSelection();
        this.$refs.archiveTable.toggleRowSelection(row, true);
      }
      // 触发select事件
      this.$emit("select", row);
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      // 向父组件发送选中数据变化事件
      if (this.isRestoringSelection) {
        return;
      }
      //Boolean 是 JavaScript 内置函数，它会过滤掉数组中的假值（false、0、""、null、undefined、NaN）
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.archiveId).filter(Boolean)
      );

      (this.archiveList || []).forEach((row) => {
        const id = row && row.archiveId;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedArchiveMap[id] = row;
        } else {
          delete this.selectedArchiveMap[id];
        }
      });
      // 向父组件发送“全量已选”的数据变化事件
      this.$emit(
        "selection-change",
        Object.values(this.selectedArchiveMap).filter(Boolean)
      );
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.archiveTable) return;
      if (!this.archiveList || !this.archiveList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.archiveList.forEach((row) => {
            const id = row && row.archiveId;
            if (!id) return;
            if (this.selectedArchiveMap[id]) {
              this.$refs.archiveTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
    },

    /** 排序回调函数 */
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order === "ascending" ? "asc" : "desc";
      this.getList();
    },

    /** 档案类型格式化 */
    archiveTypeFormat(row) {
      const type = this.archiveTypeOptions.find(
        (item) => item.value === row.archiveType
      );
      return type ? type.label : row.archiveType;
    },

    /** 状态格式化 */
    statusFormat(row) {
      const status = this.statusOptions.find(
        (item) => item.value === row.status
      );
      return status ? status.label : row.status;
    },

    /** 获取状态标签类型 */
    getStatusType(status) {
      const typeMap = {
        0: "success",
        1: "danger",
        2: "info",
      };
      return typeMap[status] || "info";
    },

    // 以下方法仅在非选择模式下使用
    /** 新增按钮操作 */
    handleAdd() {
      this.$emit("add");
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      this.$emit("operation", row, action);
    },

    /** 刷新列表 */
    refresh() {
      this.selectedArchiveMap = {};
      this.getList();
    },

    /** 初始化可见列 */
    initVisibleColumns() {
      // 从localStorage读取用户配置
      const savedColumns = localStorage.getItem("archive_visible_columns");
      if (savedColumns) {
        try {
          this.visibleColumns = JSON.parse(savedColumns);
        } catch (e) {
          // 如果解析失败，使用默认配置
          this.visibleColumns = this.columnOptions.map((col) => col.prop);
        }
      } else {
        // 默认显示所有列
        this.visibleColumns = this.columnOptions.map((col) => col.prop);
      }
    },

    /** 判断列是否可见 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },

    /** 列显示变化处理 */
    handleColumnChange(value) {
      // 保存到localStorage
      localStorage.setItem("archive_visible_columns", JSON.stringify(value));
    },

    /** 重置列显示 */
    resetColumns() {
      this.visibleColumns = this.columnOptions.map((col) => col.prop);
      localStorage.setItem(
        "archive_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
  },
};
</script>

<style scoped>
.toolbar-container {
  margin-bottom: 10px;
  padding: 10px 0;
}

.toolbar-container .el-row {
  flex-wrap: wrap;
}

.toolbar-container .el-col {
  margin-bottom: 5px;
}

.mb8 {
  margin-bottom: 8px;
}

/* 列设置样式 */
.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-item .el-checkbox {
  width: 100%;
}
</style>
