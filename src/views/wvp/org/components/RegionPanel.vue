<template>
  <div class="region-panel">
    <el-empty v-if="!selectedNode || !selectedNode.deviceId" description="请选择左侧树节点" />

    <template v-else>
      <el-breadcrumb v-if="breadcrumbs.length > 0" separator="/" class="panel-breadcrumb">
        <el-breadcrumb-item v-for="(crumb, idx) in breadcrumbs" :key="idx">
          {{ crumb }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <div class="panel-toolbar">
        <el-input
          v-model="searchStr"
          size="small"
          placeholder="搜索设备名称/编号"
          prefix-icon="el-icon-search"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleSearch"
        />
        <el-select
          v-model="online"
          size="small"
          placeholder="在线状态"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="在线" :value="1" />
          <el-option label="离线" :value="0" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button size="small" type="success" icon="el-icon-plus" @click="$emit('add-click')">添加设备</el-button>
        <el-button
          size="small"
          type="danger"
          icon="el-icon-delete"
          :disabled="multipleSelection.length === 0"
          @click="handleRemoveSelected"
        >移除所选</el-button>
        <el-button size="small" type="warning" icon="el-icon-warning" @click="$emit('unusual-click')">异常</el-button>
      </div>

      <el-table
        ref="deviceTable"
        v-loading="loading"
        :data="deviceList"
        border
        size="small"
        :height="tableHeight"
        row-key="deviceId"
        @selection-change="handleSelectionChange"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column type="expand">
          <template slot-scope="{ row }">
            <div v-loading="expandedChannels[row.deviceId] && expandedChannels[row.deviceId].loading">
              <div
                v-for="channel in (expandedChannels[row.deviceId] && expandedChannels[row.deviceId].list || [])"
                :key="channel.deviceId"
                class="channel-row"
              >
                <i class="el-icon-video-camera" style="margin-right: 6px" />
                <span>{{ channel.name || channel.channelName || '--' }}</span>
                <el-tag
                  size="mini"
                  :type="channel.status === 'ON' ? 'success' : 'danger'"
                  style="margin-left: 8px"
                >{{ channel.status === 'ON' ? '在线' : '离线' }}</el-tag>
              </div>
              <div
                v-if="expandedChannels[row.deviceId] && expandedChannels[row.deviceId].list && expandedChannels[row.deviceId].list.length === 0 && !expandedChannels[row.deviceId].loading"
                class="channel-row"
                style="color: #909399"
              >暂无通道</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="140" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.customName || row.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceId" label="设备编号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="manufacturer" label="厂家" min-width="100" show-overflow-tooltip />
        <el-table-column prop="model" label="型号" min-width="100" show-overflow-tooltip />
        <el-table-column prop="channelCount" label="通道数" width="80" align="center" />
        <el-table-column prop="online" label="状态" width="80" align="center">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="row.onLine ? 'success' : 'danger'">
              {{ row.onLine ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && deviceList.length === 0"
        description="当前区划下暂无设备"
        style="margin-top: 40px"
      />

      <el-pagination
        v-if="total > 0"
        style="margin-top: 12px; text-align: right"
        :current-page="currentPage"
        :page-size="count"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </template>
  </div>
</template>

<script>
import { getRegionPath } from '@/api/wvp/channel'
import { queryDevicesByCivilCode, queryChannels } from '@/api/wvp/device'

export default {
  name: 'RegionPanel',
  props: {
    selectedNode: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      breadcrumbs: [],
      deviceList: [],
      expandedChannels: {},
      multipleSelection: [],
      searchStr: '',
      online: '',
      currentPage: 1,
      count: 15,
      total: 0,
      loading: false,
      selectedNodeId: '',
      tableHeight: 'calc(100vh - 290px)'
    }
  },
  watch: {
    selectedNode: {
      handler(node) {
        if (!node || !node.deviceId) {
          this.deviceList = []
          this.breadcrumbs = []
          this.expandedChannels = {}
          this.multipleSelection = []
          this.total = 0
          this.selectedNodeId = ''
          return
        }
        this.loadSeq = (this.loadSeq || 0) + 1
        const seq = this.loadSeq
        this.selectedNodeId = node.deviceId
        this.currentPage = 1
        this.expandedChannels = {}
        this.multipleSelection = []
        this.loadBreadcrumbs(node.deviceId, seq)
        this.loadDevices(seq)
      },
      immediate: true
    }
  },
  methods: {
    loadBreadcrumbs(deviceId, seq) {
      if (!deviceId) {
        this.breadcrumbs = []
        return
      }
      getRegionPath(deviceId).then(response => {
        if (seq !== undefined && seq !== this.loadSeq) return
        const data = response.data || []
        this.breadcrumbs = data.map(item => item.name || '')
      }).catch(() => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.breadcrumbs = []
      })
    },

    loadDevices(seq) {
      if (!this.selectedNodeId) return
      this.loading = true
      const params = {
        page: this.currentPage,
        count: this.count,
        civilCode: this.selectedNodeId
      }
      if (this.searchStr) {
        params.query = this.searchStr
      }
      if (this.online !== '') {
        params.online = this.online
      }
      queryDevicesByCivilCode(params).then(response => {
        // Race condition guard: discard stale responses
        if (seq !== this.loadSeq) return
        const data = response.data || {}
        this.deviceList = data.list || []
        this.total = data.total || 0
      }).catch(error => {
        if (seq !== this.loadSeq) return
        this.$message.error('查询设备失败: ' + (error.message || error))
      }).finally(() => {
        if (seq !== this.loadSeq) return
        this.loading = false
      })
    },

    loadChannelsForDevice(deviceId) {
      if (!deviceId) return
      this.$set(this.expandedChannels, deviceId, { list: [], loading: true })
      queryChannels(deviceId, { page: 1, count: 100 }).then(response => {
        const data = response.data || {}
        this.$set(this.expandedChannels, deviceId, {
          list: data.list || [],
          loading: false
        })
      }).catch(() => {
        this.$set(this.expandedChannels, deviceId, { list: [], loading: false })
      })
    },

    handleExpandChange(row, expandedRows) {
      if (expandedRows.some(r => r.deviceId === row.deviceId)) {
        if (!this.expandedChannels[row.deviceId] || !this.expandedChannels[row.deviceId].list) {
          this.loadChannelsForDevice(row.deviceId)
        }
      }
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    handleSearch() {
      this.currentPage = 1
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadDevices(this.loadSeq)
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadDevices(this.loadSeq)
    },

    handleRemoveSelected() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择要移除的设备')
        return
      }
      const deviceIds = this.multipleSelection.map(item => item.id)
      this.$emit('remove-devices', deviceIds)
    },

    // Public: called by parent after add/remove
    reload() {
      if (this.selectedNodeId) {
        this.loadSeq = (this.loadSeq || 0) + 1
        this.loadDevices(this.loadSeq)
      }
    }
  }
}
</script>

<style scoped>
.region-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}
.panel-breadcrumb {
  margin-bottom: 12px;
}
.panel-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.channel-row {
  padding: 4px 0 4px 48px;
  font-size: 13px;
  color: #606266;
}
</style>
