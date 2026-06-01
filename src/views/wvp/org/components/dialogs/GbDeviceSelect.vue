<template>
  <el-dialog
    title="选择设备"
    width="60%"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form :inline="true" size="small" @submit.native.prevent="search">
      <el-form-item label="关键词">
        <el-input
          v-model="searchQuery"
          placeholder="设备名称/编号"
          clearable
          style="width: 200px"
          @keyup.enter.native="search"
        />
      </el-form-item>
      <el-form-item label="在线状态">
        <el-select v-model="searchOnline" placeholder="全部" clearable style="width: 120px">
          <el-option label="在线" value="true" />
          <el-option label="离线" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="deviceTable"
      v-loading="loading"
      :data="deviceList"
      border
      size="small"
      max-height="400"
      row-key="deviceId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="name" label="设备名称" min-width="140" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.customName || row.name || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="deviceId" label="设备编号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="channelCount" label="通道数" width="80" align="center" />
      <el-table-column prop="manufacturer" label="厂家" min-width="100" show-overflow-tooltip />
      <el-table-column prop="online" label="状态" width="80" align="center">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="row.onLine ? 'success' : 'danger'">
            {{ row.onLine ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 12px; text-align: right"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalCount"
      layout="total, sizes, prev, pager, next"
      :page-sizes="[15, 25, 35, 50]"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <div slot="footer">
      <span style="margin-right: auto; font-size: 13px; color: #909399;">已选 {{ selectedDevices.length }} 项</span>
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button size="small" type="primary" :disabled="selectedDevices.length === 0" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { queryDevices, queryDevicesByCivilCode } from '@/api/wvp/device'

export default {
  name: 'GbDeviceSelect',
  data() {
    return {
      visible: false,
      loading: false,
      deviceList: [],
      selectedDevices: [],
      existingIds: {},
      searchQuery: '',
      searchOnline: null,
      currentPage: 1,
      pageSize: 15,
      totalCount: 0
    }
  },
  methods: {
    openDialog(civilCode) {
      this.visible = true
      this.searchQuery = ''
      this.searchOnline = null
      this.currentPage = 1
      this.selectedDevices = []
      this.existingIds = {}
      this.loading = true
      this.loadExistingIds(civilCode).then(() => {
        this.loadSeq = (this.loadSeq || 0) + 1
        this.loadDevices(this.loadSeq)
      })
    },

    loadExistingIds(civilCode) {
      if (!civilCode) return Promise.resolve()
      const ids = {}
      const loadPage = (page) => {
        return queryDevicesByCivilCode({ civilCode, page, count: 100 }).then(res => {
          const data = res.data || {}
          const list = data.list || []
          list.forEach(d => { ids[d.deviceId] = true })
          if (list.length >= 100 && data.total > page * 100) {
            return loadPage(page + 1)
          }
          this.existingIds = ids
        })
      }
      return loadPage(1).catch(() => {})
    },

    loadDevices(seq) {
      this.loading = true
      const params = {
        page: this.currentPage,
        count: this.pageSize
      }
      if (this.searchQuery) {
        params.query = this.searchQuery
      }
      if (this.searchOnline !== null && this.searchOnline !== '') {
        params.online = this.searchOnline
      }
      return queryDevices(params).then(response => {
        if (seq !== undefined && seq !== this.loadSeq) return
        const data = response.data || {}
        const list = data.list || []
        this.deviceList = list.filter(d => !this.existingIds[d.deviceId])
        this.totalCount = data.total || 0
      }).catch(error => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.$message.error('查询设备失败: ' + error)
      }).finally(() => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.loading = false
      })
    },

    search() {
      this.currentPage = 1
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadDevices(this.loadSeq)
    },

    handleSelectionChange(selection) {
      this.selectedDevices = selection
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadDevices(this.loadSeq)
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadDevices(this.loadSeq)
    },

    handleSubmit() {
      if (this.selectedDevices.length === 0) {
        this.$message.warning('请至少选择一个设备')
        return
      }
      this.$emit('submit', this.selectedDevices)
      this.visible = false
    }
  }
}
</script>
