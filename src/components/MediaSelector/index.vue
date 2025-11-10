<template>
  <div class="media-selector">
    <!-- 查询条件 -->
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      class="demo-form-inline"
      size="small"
    >
      <el-form-item label="拍摄时间">
        <el-date-picker
          v-model="queryParams.shotTimeStart"
          type="datetime"
          placeholder="请选择时间"
        >
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.shotTimeEnd"
          type="datetime"
          placeholder="请选择时间"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="单位组织">
        <div class="horizontal-container">
          <treeselect
            v-model="queryParams.orgId"
            :options="orgOptions"
            placeholder="请选择单位组织"
            style="width: 200px"
            clearable
            @select="handleOrgSelect"
          />
          <el-checkbox v-model="queryParams.includeSubUnits"
            >包含下级</el-checkbox
          >
        </div>
      </el-form-item>

      <el-form-item label="拍摄警员">
        <el-select
          v-model="queryParams.policeId"
          placeholder="请选择拍摄警员"
          clearable
          style="width: 200px"
          @change="handlePoliceSelect"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="default"
          icon="el-icon-more"
          size="mini"
          @click="toggleMore"
          >更多</el-button
        >
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

      <!-- 更多查询条件 -->
      <el-form-item label="媒体类型" prop="mediaCate">
        <el-select
          v-model="queryParams.mediaCate"
          placeholder="媒体类型"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in mediaCateOptions"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="导入时间">
        <el-date-picker
          v-model="queryParams.importTimeStart"
          type="datetime"
          placeholder="请选择时间"
        >
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.importTimeEnd"
          type="datetime"
          placeholder="请选择时间"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item v-if="showMore" label="执法仪编号">
        <el-input
          v-model="queryParams.recorderId"
          placeholder="请输入执法仪编号"
        />
      </el-form-item>

      <el-form-item v-if="showMore" label="数据来源">
        <el-select v-model="queryParams.dataSource" placeholder="请选择">
          <el-option label="采集站" value="0" />
          <el-option label="采集客户端" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="存储方式" prop="storageType">
        <el-select
          v-model="queryParams.storageType"
          placeholder="存储方式"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in storageTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="showMore" label="执法类型">
        <treeselect
          v-model="queryParams.enforType"
          :options="enforcementTypeOptions"
          :normalizer="normalizeEnforcementType"
          placeholder="请选择执法类型"
          style="width: 200px"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showMore" label="媒体名称">
        <el-input
          v-model="queryParams.mediaName"
          placeholder="请输入媒体名称"
        />
      </el-form-item>
    </el-form>

    <!-- 自定义工具栏插槽 -->
    <div v-if="!selectionMode" class="toolbar-container">
      <el-row :gutter="10" type="flex">
        <slot name="toolbar"></slot>
      </el-row>
    </div>

    <!-- 媒体列表 -->
    <el-table
      v-loading="loading"
      :data="mediaList"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        v-show="false"
        prop="mediaName"
        label="媒体名称"
        align="center"
        sortable="custom"
      />
      <el-table-column prop="isAssociated" label="关联状态" width="100">
        <template slot-scope="scope">
          <el-tag disable-transitions>{{
            relationStatusFormat(scope.row)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mediaCate" label="类别" width="100">
        <template slot-scope="scope">
          <el-tag disable-transitions>{{ mediaCateFormat(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="警员" align="center" width="100">
        <template slot-scope="{ row }">
          {{ formatPoliceName(row) }}
        </template>
      </el-table-column>

      <el-table-column label="单位组织" align="center" width="150">
        <template slot-scope="{ row }">
          {{ formatOrgName(row) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="isNonEnforcementMedia"
        label="是否执法媒体"
        width="100"
      >
        <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
        <template slot-scope="scope">
          <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
          <el-tag
            :type="scope.row.isNonEnforcementMedia === 0 ? 'success' : 'danger'"
            disable-transitions
          >
            {{ scope.row.isNonEnforcementMedia === 0 ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-show="false"
        prop="mediaSuffix"
        label="媒体后缀"
        align="center"
        sortable="custom"
      />
      <el-table-column
        prop="shotTimeStart"
        label="拍摄开始时间"
        width="170"
        align="center"
        sortable="custom"
      />
      <el-table-column
        prop="shotTime"
        label="拍摄结束时间"
        width="170"
        align="center"
        sortable="custom"
      />
      <el-table-column
        v-show="false"
        prop="createdAt"
        label="导入时间"
        width="170"
        align="center"
        sortable="custom"
      />

      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="260"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'edit')"
            >一键归档</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'view')"
            >浏览</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'play')"
            >播放</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'copy')"
            >复制地址</el-button
          >
          <el-button
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'delete')"
            >删除</el-button
          >
          <el-button
            v-if="isVideoMedia(scope.row)"
            size="mini"
            type="text"
            @click="handleOperation(scope.row, 'track')"
            >视频轨迹</el-button
          >
        </template>
      </el-table-column>
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
import {
  listMedia,
  getEnforcementTypeTree,
} from "@/api/evidence/evidence_manage_query_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "MediaSelector",
  components: { Treeselect },
  props: {
    // 是否为选择模式（用于对话框中的媒体选择）
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
    // 自定义媒体列表API函数
    customListApi: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      selectedMedia: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 媒体数据
      mediaList: [],
      // 是否显示更多查询条件
      showMore: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforType: undefined,
        mediaName: undefined,
        orderBy: undefined,
        isDesc: true,
      },
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储方式选项
      storageTypeOptions: [],
      // 执法类型选项
      enforcementTypeOptions: [],
    };
  },
  created() {
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery };
    this.getList();
    this.getOrgTreeSelect();
    this.getUserList();
    this.getEnforcementTypeTree();
    this.getDicts("evidence_media_type").then((response) => {
      this.mediaCateOptions = response.data;
    });
    this.getDicts("evidence_storage_type").then((response) => {
      this.storageTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询媒体列表 */
    getList() {
      this.loading = true;
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listMedia
      const apiFunc = this.customListApi || listMedia;
      apiFunc(this.queryParams)
        .then((response) => {
          this.mediaList = response.data.list || response.data;
          this.total = response.data.total || response.data.length;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    /** 获取组织树 */
    getOrgTreeSelect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data;
      });
    },

    /** 获取用户列表 */
    getUserList() {
      listUser().then((response) => {
        this.userOptions = response.data || [];
      });
    },

    /** 获取执法类型树 */
    getEnforcementTypeTree() {
      getEnforcementTypeTree().then((response) => {
        this.enforcementTypeOptions = response.data || [];
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
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforType: undefined,
        mediaName: undefined,
        orderBy: undefined,
        isDesc: true,
        ...this.initialQuery,
      };
      this.handleQuery();
    },

    /** 切换更多查询条件 */
    toggleMore() {
      this.showMore = !this.showMore;
    },

    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      const isSelected = selection.some((item) => item.mediaId === row.mediaId);
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit("select", row);
      }
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      // 向父组件发送选中数据变化事件
      this.$emit("selection-change", selection);
    },

    /** 排序回调函数 */
    handleSortChange(column, prop, order) {
      prop = column.prop;
      order = column.order;
      if (this.order !== "" && this.order !== prop + "Order") {
        this.queryParams[this.order] = undefined;
      }
      if (order === "descending") {
        this.queryParams[prop + "Order"] = "desc";
        this.order = prop + "Order";
      } else if (order === "ascending") {
        this.queryParams[prop + "Order"] = "asc";
        this.order = prop + "Order";
      } else {
        this.queryParams[prop + "Order"] = undefined;
      }
      this.getList();
    },

    /** 组织选择事件 */
    handleOrgSelect(node) {
      if (node) {
        this.getUserListByOrg(node.id);
      }
    },

    /** 警员选择事件 */
    handlePoliceSelect() {
      // 可以在这里添加警员选择后的逻辑
    },

    /** 根据组织获取用户列表 */
    getUserListByOrg(orgId) {
      const params = { orgId };
      listUser(params).then((response) => {
        this.userOptions = response.data || [];
      });
    },

    /** 格式化警员名称 */
    formatPoliceName(row) {
      return row.policeName || row.userName || "-";
    },

    /** 格式化组织名称 */
    formatOrgName(row) {
      return row.orgFullName || row.orgName || "-";
    },

    /** 格式化关联状态 */
    relationStatusFormat(row) {
      return row.isAssociated ? "已关联" : "未关联";
    },

    // 字典状态字典翻译
    mediaCateFormat(row) {
      return this.selectDictLabel(
        this.mediaCateOptions,
        parseInt(row.mediaCate)
      );
    },
    /** 执法类型数据格式化 */
    normalizeEnforcementType(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || "未知",
        children: node.children,
      };
    },

    // 以下方法仅在非选择模式下使用
    /** 新增按钮操作 */
    handleAdd() {
      this.$emit("add");
    },

    /** 修改按钮操作 */
    handleUpdate() {
      this.$emit("update", this.selectedMedia[0]);
    },

    /** 删除按钮操作 */
    handleDelete() {
      this.$emit("delete", this.selectedMedia);
    },

    isVideoMedia(row) {
      return this.mediaCateFormat(row) === "视频";
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      var newRow = {
        ...row,
        mediaCate: this.mediaCateFormat(row),
        orgFullName: this.formatOrgName(row),
      };
      this.$emit("operation", newRow, action);
    },

    /** 获取选中的媒体数据 */
    getSelectedMedia() {
      return this.selectedMedia;
    },

    /** 刷新列表 */
    refresh() {
      this.getList();
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

.horizontal-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
