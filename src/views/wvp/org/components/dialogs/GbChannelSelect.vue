<template>
  <el-dialog
    title="选择通道"
    width="70%"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form :inline="true" size="small" @submit.native.prevent="search">
      <el-form-item label="关键词">
        <el-input
          v-model="searchQuery"
          placeholder="通道名称/编号"
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
      <el-form-item label="通道类型">
        <el-select v-model="searchChannelType" placeholder="全部" clearable style="width: 140px">
          <el-option
            v-for="item in channelTypeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="channelTable"
      v-loading="loading"
      :data="channelList"
      border
      size="small"
      max-height="400"
      row-key="gbDeviceId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="gbName" label="通道名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="gbDeviceId" label="通道编号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="gbManufacturer" label="厂家" min-width="100" show-overflow-tooltip />
      <el-table-column prop="dataType" label="通道类型" width="110" align="center">
        <template slot-scope="{ row }">
          <el-tag size="small" type="info">
            {{ getChannelTypeName(row.dataType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="gbStatus" label="状态" width="80" align="center">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="row.gbStatus === 'ON' ? 'success' : 'danger'">
            {{ row.gbStatus === 'ON' ? '在线' : '离线' }}
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
      <span style="margin-right: auto; font-size: 13px; color: #909399;">已选 {{ selectedChannels.length }} 项</span>
      <el-button size="small" @click="visible = false">取 消</el-button>
      <el-button size="small" type="primary" :disabled="selectedChannels.length === 0" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getParentList, getCivilCodeList } from '@/api/wvp/channel'

const channelTypeMap = {
  1: { id: 1, name: '国标设备' },
  2: { id: 2, name: '推流设备' },
  3: { id: 3, name: '拉流代理' },
  200: { id: 200, name: '部标设备' }
}

export default {
  name: 'GbChannelSelect',
  props: {
    dataType: {
      type: String,
      default: 'group'
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      channelList: [],
      selectedChannels: [],
      channelTypeOptions: Object.values(channelTypeMap),
      searchQuery: '',
      searchOnline: null,
      searchChannelType: null,
      currentPage: 1,
      pageSize: 15,
      totalCount: 0
    }
  },
  methods: {
    openDialog() {
      this.visible = true
      this.searchQuery = ''
      this.searchOnline = null
      this.searchChannelType = null
      this.currentPage = 1
      this.selectedChannels = []
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    loadChannels(seq) {
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
      if (this.searchChannelType !== null && this.searchChannelType !== '') {
        params.channelType = this.searchChannelType
      }
      const api = this.dataType === 'region' ? getCivilCodeList : getParentList
      api(params).then(response => {
        if (seq !== undefined && seq !== this.loadSeq) return
        const data = response.data || {}
        this.channelList = data.list || []
        this.totalCount = data.total || 0
      }).catch(error => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.$message.error('查询通道失败: ' + error)
      }).finally(() => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.loading = false
      })
    },

    getChannelTypeName(dataType) {
      const typeInfo = channelTypeMap[dataType]
      return typeInfo ? typeInfo.name : '--'
    },

    search() {
      this.currentPage = 1
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    handleSelectionChange(selection) {
      this.selectedChannels = selection
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    handleSubmit() {
      if (this.selectedChannels.length === 0) {
        this.$message.warning('请至少选择一个通道')
        return
      }
      this.$emit('submit', this.selectedChannels)
      this.visible = false
    }
  }
}
</script>
