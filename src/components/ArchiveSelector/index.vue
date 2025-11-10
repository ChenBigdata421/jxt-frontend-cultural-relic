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
      <el-row :gutter="10" type="flex">
        <slot name="toolbar"></slot>
      </el-row>
    </div>

    <!-- 档案列表 -->
    <el-table
      v-loading="loading"
      :data="archiveList"
      border
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="archiveCode"
        label="档案编号"
        width="180"
        align="center"
        sortable="custom"
      />
      <el-table-column
        prop="archiveTitle"
        label="档案标题"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="archiveType"
        label="档案类型"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag disable-transitions>{{ archiveTypeFormat(scope.row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="orgName"
        label="管理部门"
        width="150"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="storageDuration"
        label="保存期限(月)"
        width="120"
        align="center"
      />
      <el-table-column
        prop="expirationTime"
        label="过期时间"
        width="160"
        align="center"
      />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="getStatusType(scope.row.status)"
            disable-transitions
          >
            {{ statusFormat(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createUserName"
        label="录入人员"
        width="120"
        align="center"
      />
      <el-table-column
        prop="createdAt"
        label="录入时间"
        width="160"
        align="center"
      />

      <!-- 操作列 (仅在非选择模式下显示) -->
      <el-table-column
        v-if="!selectionMode"
        label="操作"
        width="180"
        align="center"
        fixed="right"
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
import { listArchives } from '@/api/evidence/archive_api'
import { getOrgList } from '@/api/admin/sys-organization'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'ArchiveSelector',
  components: { Treeselect },
  props: {
    // 是否为选择模式（用于对话框中的档案选择）
    selectionMode: {
      type: Boolean,
      default: false
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true
    },
    // 初始查询参数
    initialQuery: {
      type: Object,
      default: () => ({})
    },
    // 自定义档案列表API函数
    customListApi: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      selectedArchives: [],
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
        isAsc: 'desc'
      },
      // 组织树选项
      orgOptions: [],
      // 档案类型选项
      archiveTypeOptions: [
        { label: '案件档案', value: 1 },
        { label: '证据档案', value: 2 },
        { label: '执法档案', value: 3 },
        { label: '其他档案', value: 4 }
      ],
      // 状态选项
      statusOptions: [
        { label: '正常', value: 0 },
        { label: '异常', value: 1 },
        { label: '其他', value: 2 }
      ]
    }
  },
  created() {
    // 合并初始查询参数
    this.queryParams = { ...this.queryParams, ...this.initialQuery }
    this.getList()
    this.getOrgTree()
  },
  methods: {
    /** 查询档案列表 */
    getList() {
      this.loading = true
      // 如果提供了自定义API函数,使用自定义API,否则使用默认的listArchives
      const apiFunc = this.customListApi || listArchives
      apiFunc(this.queryParams)
        .then((response) => {
          if (response.code === 200) {
            this.archiveList = response.data.list || []
            this.total = response.data.total || 0
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /** 查询组织树结构 */
    getOrgTree() {
      getOrgList().then((response) => {
        if (response.code === 200) {
          this.orgOptions = this.handleTree(response.data, 'orgId', 'parentId')
        }
      })
    },

    /** 转换组织数据为树形结构 */
    handleTree(data, id, parentId, children) {
      const config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
      }

      const childrenListMap = {}
      const nodeIds = {}
      const tree = []

      for (const d of data) {
        const parentId = d[config.parentId]
        if (childrenListMap[parentId] == null) {
          childrenListMap[parentId] = []
        }
        nodeIds[d[config.id]] = d
        childrenListMap[parentId].push(d)
      }

      for (const d of data) {
        const parentId = d[config.parentId]
        if (nodeIds[parentId] == null) {
          tree.push(d)
        }
      }

      for (const t of tree) {
        adaptToChildrenList(t)
      }

      function adaptToChildrenList(o) {
        if (childrenListMap[o[config.id]] !== null) {
          o[config.childrenList] = childrenListMap[o[config.id]]
        }
        if (o[config.childrenList]) {
          for (const c of o[config.childrenList]) {
            adaptToChildrenList(c)
          }
        }
      }
      return tree
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        archiveCode: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        orgId: undefined,
        status: undefined,
        orderByColumn: undefined,
        isAsc: 'desc',
        ...this.initialQuery
      }
      this.handleQuery()
    },

    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      const isSelected = selection.some((item) => item.archiveId === row.archiveId)
      if (isSelected) {
        // 向父组件发送被选中的行
        this.$emit('select', row)
      }
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      // 向父组件发送选中数据变化事件
      this.$emit('selection-change', selection)
    },

    /** 排序回调函数 */
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order === 'ascending' ? 'asc' : 'desc'
      this.getList()
    },

    /** 档案类型格式化 */
    archiveTypeFormat(row) {
      const type = this.archiveTypeOptions.find(
        (item) => item.value === row.archiveType
      )
      return type ? type.label : row.archiveType
    },

    /** 状态格式化 */
    statusFormat(row) {
      const status = this.statusOptions.find((item) => item.value === row.status)
      return status ? status.label : row.status
    },

    /** 获取状态标签类型 */
    getStatusType(status) {
      const typeMap = {
        0: 'success',
        1: 'danger',
        2: 'info'
      }
      return typeMap[status] || 'info'
    },

    // 以下方法仅在非选择模式下使用
    /** 新增按钮操作 */
    handleAdd() {
      this.$emit('add')
    },

    /** 修改按钮操作 */
    handleUpdate() {
      this.$emit('update', this.selectedArchives[0])
    },

    /** 删除按钮操作 */
    handleDelete() {
      this.$emit('delete', this.selectedArchives)
    },

    /** 操作按钮 */
    handleOperation(row, action) {
      this.$emit('operation', row, action)
    },

    /** 获取选中的档案数据 */
    getSelectedArchives() {
      return this.selectedArchives
    },

    /** 刷新列表 */
    refresh() {
      this.getList()
    }
  }
}
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
</style>
