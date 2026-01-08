<template>
  <div class="requisition-log-selector">
    <!-- 查询条件 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="领用人组织" prop="requisitionerOrgId">
        <treeselect
          v-model="queryParams.requisitionerOrgId"
          :options="orgOptions"
          placeholder="请选择领用人组织"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="领用人" prop="requisitionerId">
        <el-select
          v-model="queryParams.requisitionerId"
          placeholder="请选择领用人"
          style="width: 200px"
          clearable
          filterable
        >
          <el-option
            v-for="user in userOptions"
            :key="user.userId"
            :label="user.userName"
            :value="user.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领用开始时间">
        <el-date-picker
          v-model="requisitionStartTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item label="领用结束时间">
        <el-date-picker
          v-model="requisitionEndTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="requisitionLogList"
      border
      style="margin-top: 10px"
    >
      <el-table-column prop="bwcNo" label="执法仪编号" width="120" />
      <el-table-column prop="bwcName" label="执法仪名称" width="120" />
      <el-table-column prop="requisitionerName" label="领用人" width="100" />
      <el-table-column
        prop="requisitionerOrgName"
        label="领用人组织"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="requisitionStartTime"
        label="领用开始时间"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requisitionStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="requisitionEndTime"
        label="领用结束时间"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requisitionEndTime) }}</span>
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
import { getBwcLogList } from "@/api/admin/bwc_requisition_manage_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "RequisitionLogSelector",
  components: { Treeselect },
  props: {
    // 执法仪编号（可选，如果传入则只查询该执法仪的记录）
    bwcNo: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 领用记录列表
      requisitionLogList: [],
      // 总条数
      total: 0,
      // 组织树选项
      orgOptions: [],
      // 用户选项
      userOptions: [],
      // 领用开始时间范围
      requisitionStartTimeRange: null,
      // 领用结束时间范围
      requisitionEndTimeRange: null,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined, // 执法仪编号
        requisitionerId: undefined, // 领用人ID
        requisitionerOrgId: undefined, // 领用人组织ID
        requisitionStartTimeBegin: undefined, // 领用开始时间-开始
        requisitionStartTimeEnd: undefined, // 领用开始时间-结束
        requisitionEndTimeBegin: undefined, // 领用结束时间-开始
        requisitionEndTimeEnd: undefined, // 领用结束时间-结束
      },
    };
  },
  watch: {
    // 监听执法仪编号变化
    bwcNo: {
      handler(newVal) {
        this.queryParams.bwcNo = newVal;
        // 重置分页和查询条件
        this.queryParams.pageIndex = 1;
        this.requisitionStartTimeRange = null;
        this.requisitionEndTimeRange = null;
        this.queryParams.requisitionerId = undefined;
        this.queryParams.requisitionerOrgId = undefined;
        this.queryParams.requisitionStartTimeBegin = undefined;
        this.queryParams.requisitionStartTimeEnd = undefined;
        this.queryParams.requisitionEndTimeBegin = undefined;
        this.queryParams.requisitionEndTimeEnd = undefined;
        if (newVal) {
          this.getList();
        }
      },
      immediate: true,
    },
    // 监听组织变化，加载该组织下的用户
    "queryParams.requisitionerOrgId": function (newVal) {
      if (newVal) {
        this.queryParams.requisitionerId = undefined;
        this.getUserList();
      } else {
        this.userOptions = [];
        this.queryParams.requisitionerId = undefined;
      }
    },
  },
  created() {
    this.getOrgTree();
  },
  mounted() {
    // 组件挂载时，如果已有 bwcNo，立即查询
    if (this.bwcNo) {
      this.getList();
    }
  },
  methods: {
    /** 查询组织树 */
    getOrgTree() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data;
      });
    },
    /** 查询用户列表 */
    getUserList() {
      if (!this.queryParams.requisitionerOrgId) return;
      listUser({ orgId: "/" + this.queryParams.requisitionerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list || [];
        }
      );
    },
    /** 查询领用记录列表 */
    async getList() {
      this.loading = true;
      try {
        // 处理时间范围
        if (
          this.requisitionStartTimeRange &&
          this.requisitionStartTimeRange.length === 2
        ) {
          this.queryParams.requisitionStartTimeBegin =
            this.requisitionStartTimeRange[0];
          this.queryParams.requisitionStartTimeEnd =
            this.requisitionStartTimeRange[1];
        } else {
          this.queryParams.requisitionStartTimeBegin = undefined;
          this.queryParams.requisitionStartTimeEnd = undefined;
        }

        if (
          this.requisitionEndTimeRange &&
          this.requisitionEndTimeRange.length === 2
        ) {
          this.queryParams.requisitionEndTimeBegin =
            this.requisitionEndTimeRange[0];
          this.queryParams.requisitionEndTimeEnd =
            this.requisitionEndTimeRange[1];
        } else {
          this.queryParams.requisitionEndTimeBegin = undefined;
          this.queryParams.requisitionEndTimeEnd = undefined;
        }
        const query = this.normalizeQueryParams(this.queryParams);
        const response = await getBwcLogList(query);
        const data = (response && response.data) || {};
        this.requisitionLogList = data.list || [];
        this.total = data.count || 0;
      } catch (error) {
        this.$message.error(
          "查询领用记录失败：" +
            (error && error.message ? error.message : "未知错误")
        );
      } finally {
        this.loading = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.requisitionStartTimeRange = null;
      this.requisitionEndTimeRange = null;
      this.resetForm("queryForm");
      this.$nextTick(() => {
        this.handleQuery();
      });
    },
    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        } else if (
          (key === "requisitionStartTimeBegin" ||
            key === "requisitionStartTimeEnd" ||
            key === "requisitionEndTimeBegin" ||
            key === "requisitionEndTimeEnd") &&
          typeof value === "string"
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString();
          }
        }
      });
      return query;
    },
  },
};
</script>

<style scoped>
.requisition-log-selector {
  padding: 10px;
}
</style>
