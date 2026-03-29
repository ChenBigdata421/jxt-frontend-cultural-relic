<template>
  <div class="requisition-log-selector">
    <!-- 查询栏组件 -->
    <RequisitionLogQueryBar
      ref="queryBar"
      :org-options="orgOptions"
      :user-options="userOptions"
      @search="handleSearch"
      @quick-search-reset="handleQuickSearchReset"
      @filter-change="handleFilterChange"
      @filter-reset="handleFilterReset"
      @org-change="handleOrgChange"
    />

    <!-- 数据表格 -->
    <el-table
      ref="requisitionLogTable"
      v-loading="loading"
      :data="requisitionLogList"
      border
      class="data-table"
    >
      <el-table-column prop="bwcNo" label="执法仪编号" width="120" align="center" />
      <el-table-column prop="bwcName" label="执法仪名称" width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="requisitionerName" label="领用人" width="120" align="center" />
      <el-table-column
        prop="requisitionerOrgName"
        label="领用人组织"
        min-width="180"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="requisitionStartTime"
        label="领用开始时间"
        width="180"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.requisitionStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="requisitionEndTime"
        label="领用结束时间"
        width="180"
        align="center"
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
import { getBwcLogList } from '@/api/admin/bwc_requisition_manage_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import RequisitionLogQueryBar from '@/components/RequisitionLogQueryBar/index.vue'

export default {
  name: 'RequisitionLogSelector',
  components: { RequisitionLogQueryBar },
  props: {
    bwcNo: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      loading: false,
      requisitionLogList: [],
      total: 0,
      orgOptions: [],
      userOptions: [],
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        bwcNo: undefined,
        requisitionerId: undefined,
        requisitionerOrgId: undefined,
        requisitionStartTimeBegin: undefined,
        requisitionStartTimeEnd: undefined,
        requisitionEndTimeBegin: undefined,
        requisitionEndTimeEnd: undefined
      }
    }
  },
  watch: {
    bwcNo: {
      handler(newVal) {
        this.queryParams.bwcNo = newVal
        this.resetQueryParams()
        if (newVal) {
          this.getList()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getOrgTree()
  },
  mounted() {
    if (this.bwcNo) {
      this.getList()
    }
  },
  methods: {
    getOrgTree() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data
      })
    },
    getUserList() {
      if (!this.queryParams.requisitionerOrgId) return
      listUser({ orgId: '/' + this.queryParams.requisitionerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list || []
        }
      )
    },
    async getList() {
      this.loading = true
      try {
        const query = this.normalizeQueryParams(this.queryParams)
        const response = await getBwcLogList(query)
        const data = (response && response.data) || {}
        this.requisitionLogList = data.list || []
        this.total = data.count || 0
      } catch (error) {
        this.$message.error(
          '查询领用记录失败：' +
            (error && error.message ? error.message : '未知错误')
        )
      } finally {
        this.loading = false
      }
    },
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      this.resetPage()
      this.getList()
    },
    handleQuickSearchReset() {
      this.handleFilterReset()
    },
    handleFilterChange(filterData) {
      // 处理高级筛选
      if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })
      }

      this.resetPage()
      this.getList()
    },
    handleFilterReset() {
      this.resetQueryParams()
      this.resetPage()
      this.getList()
    },
    handleOrgChange(orgId) {
      if (orgId) {
        this.queryParams.requisitionerOrgId = orgId
        this.queryParams.requisitionerId = undefined
        this.getUserList()
      } else {
        this.userOptions = []
        this.queryParams.requisitionerOrgId = undefined
        this.queryParams.requisitionerId = undefined
      }
    },
    resetQueryParams() {
      this.queryParams.pageIndex = 1
      this.queryParams.requisitionerId = undefined
      this.queryParams.requisitionerOrgId = undefined
      this.queryParams.requisitionStartTimeBegin = undefined
      this.queryParams.requisitionStartTimeEnd = undefined
      this.queryParams.requisitionEndTimeBegin = undefined
      this.queryParams.requisitionEndTimeEnd = undefined
    },
    resetPage() {
      this.queryParams.pageIndex = 1
    },
    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'requisitionStartTimeBegin' ||
            key === 'requisitionStartTimeEnd' ||
            key === 'requisitionEndTimeBegin' ||
            key === 'requisitionEndTimeEnd') &&
          typeof value === 'string'
        ) {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString()
          }
        }
      })
      return query
    }
  }
}
</script>

<style scoped>
.requisition-log-selector {
  padding: 10px;
}

.data-table {
  margin-top: 10px;
}
</style>
