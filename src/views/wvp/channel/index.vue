<template>
  <div id="channelList" class="app-container" style="height: calc(100vh - 124px);">
    <div v-if="!editId" style="height: 100%">
      <el-form :inline="true" size="mini">
        <el-form-item label="搜索">
          <el-input
            v-model="searchStr"
            style="margin-right: 1rem; width: auto;"
            placeholder="关键字"
            prefix-icon="el-icon-search"
            clearable
            @input="search"
          />
        </el-form-item>
        <el-form-item label="在线状态">
          <el-select
            v-model="online"
            style="width: 8rem; margin-right: 1rem;"
            placeholder="请选择"
            default-first-option
            @change="search"
          >
            <el-option label="全部" value="" />
            <el-option label="在线" value="true" />
            <el-option label="离线" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item style="float: right;">
          <el-button icon="el-icon-refresh-right" circle title="刷新表格" @click="refresh()" />
        </el-form-item>
      </el-form>
      <el-table
        ref="channelListTable"
        v-loading="loading"
        size="small"
        :data="channelList"
        height="calc(100% - 64px)"
        style="width: 100%; font-size: 12px;"
        header-row-class-name="table-header"
      >
        <el-table-column prop="gbName" label="名称" min-width="180" />
        <el-table-column prop="gbDeviceId" label="编号" min-width="180" />
        <el-table-column prop="gbManufacturer" label="厂家" min-width="100" />
        <el-table-column label="类型" min-width="100">
          <template v-slot:default="scope">
            <el-tag size="medium" effect="plain">
              {{ getChannelTypeName(scope.row.dataType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="位置信息" min-width="150">
          <template v-slot:default="scope">
            <span v-if="scope.row.gbLongitude && scope.row.gbLatitude">
              {{ scope.row.gbLongitude }}, {{ scope.row.gbLatitude }}
            </span>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="ptzTypeText" label="摄像头类型" min-width="100" />
        <el-table-column label="状态" min-width="100">
          <template v-slot:default="scope">
            <el-tag v-if="scope.row.gbStatus === 'ON'" size="medium">在线</el-tag>
            <el-tag v-else size="medium" type="info">离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="210" fixed="right">
          <template v-slot:default="scope">
            <el-button
              size="medium"
              :disabled="scope.row.gbStatus !== 'ON'"
              icon="el-icon-video-play"
              type="text"
              :loading="scope.row.playLoading"
              @click="sendDevicePush(scope.row)"
            >播放</el-button>
            <el-button
              v-if="!!scope.row.streamId"
              size="medium"
              icon="el-icon-switch-button"
              type="text"
              style="color: #f56c6c"
              @click="stopDevicePush(scope.row)"
            >停止</el-button>
            <el-divider direction="vertical" />
            <el-button
              size="medium"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-divider direction="vertical" />
            <el-dropdown @command="(command) => { moreClick(command, scope.row) }">
              <el-button size="medium" type="text">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu>
                <el-dropdown-item command="records" :disabled="scope.row.gbStatus !== 'ON'">
                  设备录像
                </el-dropdown-item>
                <el-dropdown-item command="cloudRecords" :disabled="scope.row.gbStatus !== 'ON'">
                  云端录像
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="text-align: right"
        :current-page="currentPage"
        :page-size="count"
        :page-sizes="[15, 25, 35, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="currentChange"
      />
    </div>

    <channel-edit v-if="editId" :id="editId" :close-edit="closeEdit" />
    <device-player ref="devicePlayer" @opened="onPlayerOpened" @error="onPlayerError" />

  </div>
</template>

<script>
import DevicePlayer from '../device/components/DevicePlayer.vue'
import Edit from './edit.vue'
import { getList, stopPlayChannel } from '@/api/wvp/channel'

// WVP $channelTypeList — maps dataType (1,2,3,200) to names
// getTypeList() API returns GB28181 encoding types, not channel data types
const channelTypeMap = {
  1: { id: 1, name: '国标设备' },
  2: { id: 2, name: '推流设备' },
  3: { id: 3, name: '拉流代理' },
  200: { id: 200, name: '部标设备' }
}

export default {
  name: 'ChannelList',
  components: {
    ChannelEdit: Edit,
    DevicePlayer
  },
  data() {
    return {
      channelList: [],
      loading: false,
      searchStr: '',
      channelType: '',
      online: '',
      currentPage: 1,
      count: 15,
      total: 0,
      editId: null,
      lastPlayRow: null,
      channelTypeOptions: Object.values(channelTypeMap)
    }
  },
  mounted() {
    this.getChannelList()
  },
  methods: {
    getChannelList() {
      this.channelList = []
      this.loading = true
      getList({
        page: this.currentPage,
        count: this.count,
        query: this.searchStr,
        online: this.online,
        channelType: this.channelType
      }).then(res => {
        const data = res.data || res
        this.total = data.total
        this.channelList = data.list || []
        this.channelList.forEach(e => {
          this.$set(e, 'playLoading', false)
        })
        this.$nextTick(() => {
          if (this.$refs.channelListTable) {
            this.$refs.channelListTable.doLayout()
          }
        })
      }).catch(err => {
        this.$message.error('加载通道列表失败: ' + (err.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    search() {
      this.currentPage = 1
      this.total = 0
      this.getChannelList()
    },
    refresh() {
      this.getChannelList()
    },
    currentChange(val) {
      this.currentPage = val
      this.getChannelList()
    },
    handleSizeChange(val) {
      this.count = val
      this.getChannelList()
    },
    sendDevicePush(itemData) {
      // Clear previous row's playLoading to prevent stuck spinner
      if (this.lastPlayRow) this.$set(this.lastPlayRow, 'playLoading', false)
      this.$set(itemData, 'playLoading', true)
      this.lastPlayRow = itemData
      this.$refs.devicePlayer.openChannel(itemData.gbId, itemData.gbName)
    },
    stopDevicePush(itemData) {
      stopPlayChannel(itemData.gbId).then(() => {
        this.getChannelList()
      }).catch((error) => {
        console.error('停止推流失败:', error)
        this.getChannelList()
      })
    },
    onPlayerOpened() {
      if (this.lastPlayRow) this.$set(this.lastPlayRow, 'playLoading', false)
    },
    onPlayerError() {
      if (this.lastPlayRow) this.$set(this.lastPlayRow, 'playLoading', false)
    },
    handleEdit(row) {
      this.editId = row.gbId
    },
    closeEdit() {
      this.editId = null
      this.getChannelList()
    },
    moreClick(command) {
      if (command === 'records') {
        this.$message.info('设备录像功能尚未迁移')
      } else if (command === 'cloudRecords') {
        this.$message.info('云端录像功能尚未迁移')
      }
    },
    getChannelTypeName(dataType) {
      return (channelTypeMap[dataType] || {}).name || '未知'
    }
  }
}
</script>
