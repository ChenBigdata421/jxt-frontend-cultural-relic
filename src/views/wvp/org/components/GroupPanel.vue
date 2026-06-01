<template>
  <div class="group-panel">
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
          placeholder="搜索通道名称/编号"
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
        <el-button size="small" type="success" icon="el-icon-plus" @click="$emit('add-click')">添加通道</el-button>
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
        ref="channelTable"
        v-loading="loading"
        :data="channelList"
        border
        size="small"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="gbName" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="gbDeviceId" label="编号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="gbManufacturer" label="厂家" min-width="100" show-overflow-tooltip />
        <el-table-column label="状态" min-width="80" align="center">
          <template v-slot:default="{ row }">
            <el-tag size="small" :type="row.gbStatus === 'ON' ? 'success' : 'danger'">
              {{ row.gbStatus === 'ON' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && channelList.length === 0"
        description="当前分组下暂无通道"
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
import { getGroupPath, getParentList } from '@/api/wvp/channel'

export default {
  name: 'GroupPanel',
  props: {
    selectedNode: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      breadcrumbs: [],
      channelList: [],
      searchStr: '',
      online: '',
      currentPage: 1,
      count: 15,
      total: 0,
      loading: false,
      multipleSelection: [],
      selectedNodeId: '',
      selectedBusinessGroup: '',
      tableHeight: 'calc(100vh - 290px)'
    }
  },
  watch: {
    selectedNode: {
      handler(node) {
        if (!node || !node.deviceId) {
          this.channelList = []
          this.breadcrumbs = []
          this.multipleSelection = []
          this.total = 0
          this.selectedNodeId = ''
          return
        }
        this.loadSeq = (this.loadSeq || 0) + 1
        const seq = this.loadSeq
        this.selectedNodeId = node.deviceId
        this.selectedBusinessGroup = node.businessGroup || ''
        this.currentPage = 1
        this.multipleSelection = []
        this.loadBreadcrumbs(seq)
        this.loadChannels(seq)
      },
      immediate: true
    }
  },
  methods: {
    loadBreadcrumbs(seq) {
      if (!this.selectedNodeId) {
        this.breadcrumbs = []
        return
      }
      getGroupPath({ deviceId: this.selectedNodeId, businessGroup: this.selectedBusinessGroup }).then(response => {
        if (seq !== undefined && seq !== this.loadSeq) return
        const data = response.data || []
        const pathList = Array.isArray(data) ? data.map(item => item.name || '') : []
        const bgName = this.selectedNode && this.selectedNode.businessGroupName
        if (bgName && (pathList.length === 0 || pathList[0] !== bgName)) {
          pathList.unshift(bgName)
        }
        this.breadcrumbs = pathList
      }).catch(() => {
        if (seq !== undefined && seq !== this.loadSeq) return
        this.breadcrumbs = []
      })
    },

    loadChannels(seq) {
      if (!this.selectedNodeId) return
      this.loading = true
      const params = {
        page: this.currentPage,
        count: this.count,
        groupDeviceId: this.selectedNodeId
      }
      if (this.searchStr) {
        params.query = this.searchStr
      }
      if (this.online !== '') {
        params.online = this.online
      }
      getParentList(params).then(response => {
        if (seq !== this.loadSeq) return
        const data = response.data || {}
        this.total = data.total || 0
        this.channelList = data.list || []
      }).catch(error => {
        if (seq !== this.loadSeq) return
        this.$message.error('查询通道失败: ' + (error.message || error))
      }).finally(() => {
        if (seq !== this.loadSeq) return
        this.loading = false
      })
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    handleSearch() {
      this.currentPage = 1
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadSeq = (this.loadSeq || 0) + 1
      this.loadChannels(this.loadSeq)
    },

    handleRemoveSelected() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请先选择要移除的通道')
        return
      }
      const channelIds = this.multipleSelection.map(item => item.gbId || item.id).filter(Boolean)
      this.$emit('remove-channels', channelIds)
    },

    // Public: called by parent after add/remove
    reload() {
      if (this.selectedNodeId) {
        this.loadSeq = (this.loadSeq || 0) + 1
        this.loadChannels(this.loadSeq)
      }
    }
  }
}
</script>

<style scoped>
.group-panel {
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
</style>
