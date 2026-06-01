<template>
  <el-dialog
    title="异常挂载通道 — 业务分组"
    width="70%"
    top="6vh"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :destroy-on-close="true"
    @close="onClose"
  >
    <el-form :inline="true" size="mini">
      <el-form-item label="搜索">
        <el-input
          v-model="query"
          style="width: auto;"
          placeholder="关键字"
          prefix-icon="el-icon-search"
          clearable
          @input="onSearch"
        />
      </el-form-item>
      <el-form-item label="在线状态">
        <el-select
          v-model="online"
          style="width: 8rem;"
          placeholder="请选择"
          default-first-option
          @change="onSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="在线" value="true" />
          <el-option label="离线" value="false" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table
      ref="table"
      v-loading="loading"
      size="small"
      :data="list"
      height="420"
      style="width: 100%; font-size: 12px;"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column prop="gbName" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="gbDeviceId" label="编号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="gbManufacturer" label="厂家" min-width="100" show-overflow-tooltip />
      <el-table-column prop="parentId" label="父节点" min-width="140" show-overflow-tooltip />
      <el-table-column label="类型" min-width="100">
        <template v-slot:default="scope">
          <el-tag size="medium" effect="plain">{{ channelTypeMap[scope.row.dataType] || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="80">
        <template v-slot:default="scope">
          <el-tag v-if="scope.row.gbStatus === 'ON'" size="medium">在线</el-tag>
          <el-tag v-else size="medium" type="info">离线</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align: right; margin-top: 10px;"
      :current-page="currentPage"
      :page-size="count"
      :page-sizes="[15, 25, 35, 50]"
      layout="total, sizes, prev, pager, next"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin-top: 10px;"
      title="清除后通道可正常添加到分组节点"
    />

    <div slot="footer">
      <el-button size="small" :disabled="selected.length === 0" @click="clearSelected">清除所选</el-button>
      <el-button size="small" type="danger" @click="clearAll">清除本页</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  getUnusualParentList,
  clearUnusualParentList
} from '@/api/wvp/channel'

const channelTypeMap = { 1: '国标设备', 2: '推流设备', 3: '拉流代理', 200: '部标设备' }

export default {
  name: 'UnusualGroupChannel',
  data() {
    return {
      visible: false,
      loading: false,
      query: '',
      online: '',
      list: [],
      selected: [],
      currentPage: 1,
      count: 15,
      total: 0,
      channelTypeMap
    }
  },
  methods: {
    openDialog() {
      this.visible = true
      this.query = ''
      this.online = ''
      this.currentPage = 1
      this.total = 0
      this.selected = []
      this.loadList()
    },
    onClose() {
      this.list = []
      this.selected = []
    },
    loadList() {
      this.loading = true
      getUnusualParentList({
        page: this.currentPage,
        count: this.count,
        query: this.query,
        online: this.online
      }).then(res => {
        const data = res.data || res
        this.total = data.total
        this.list = data.list || []
      }).catch(err => {
        this.$message.error('加载异常通道列表失败: ' + (err.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    onSearch() {
      this.currentPage = 1
      this.total = 0
      this.loadList()
    },
    onSelectionChange(rows) {
      this.selected = rows
    },
    handlePageChange(val) {
      this.currentPage = val
      this.loadList()
    },
    handleSizeChange(val) {
      this.count = val
      this.loadList()
    },
    clearSelected() {
      if (this.selected.length === 0) return
      const ids = this.selected.map(item => item.gbId || item.id).filter(Boolean)
      if (ids.length === 0) {
        this.$message.warning('未找到有效的通道ID')
        return
      }
      this.$confirm('确认清除所选通道的分组关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return clearUnusualParentList(ids)
      }).then(() => {
        this.$message.success('清除成功')
        this.loadList()
      }).catch(err => {
        if (err !== 'cancel') {
          this.$message.error('清除失败: ' + (err.message || '未知错误'))
        }
      })
    },
    clearAll() {
      this.$confirm('确认清除全部异常通道的分组关联?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.list.map(item => item.gbId || item.id).filter(Boolean)
        return clearUnusualParentList(ids)
      }).then(() => {
        this.$message.success('本页清除成功')
        this.loadList()
      }).catch(err => {
        if (err !== 'cancel') {
          this.$message.error('清除失败: ' + (err.message || '未知错误'))
        }
      })
    }
  }
}
</script>
