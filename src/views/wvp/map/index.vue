<template>
  <div id="WvpMap" style="height: calc(100vh - 124px); width: 100%;">
    <div class="map-layout" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <div class="sidebar-wrapper">
        <DeviceTree ref="deviceTree" :show-position="true" @clickEvent="treeChannelClickEvent" />
      </div>
      <div class="map-wrapper" aria-label="电子地图">
        <!-- 加载状态 -->
        <div v-if="!mapReady" class="map-loading">
          <i class="el-icon-loading" style="font-size: 32px;" />
          <p>加载地图...</p>
        </div>
        <MapComponent
          ref="mapComponent"
          @loaded="onMapLoaded"
          @zoomChange="zoomChange"
        />
      </div>
    </div>

    <!-- 折叠/展开侧边栏按钮 -->
    <div
      class="sidebar-toggle-btn"
      :class="{ 'sidebar-collapsed': !sidebarVisible }"
      :title="sidebarVisible ? '收起侧边栏' : '展开侧边栏'"
      tabindex="0"
      role="button"
      @click="sidebarVisible = !sidebarVisible"
      @keydown.enter="sidebarVisible = !sidebarVisible"
    >
      <i :class="sidebarVisible ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" />
    </div>

    <!-- 摄像头加载提示 -->
    <div v-if="loadingMarkers" class="map-marker-loading">
      <i class="el-icon-loading" /> 加载摄像头位置...
    </div>

    <!-- 地图工具按钮 - 右下角 -->
    <div class="map-tool-box-bottom-right">
      <div class="map-tool-btn-group">
        <div
          class="map-tool-btn"
          tabindex="0"
          role="button"
          title="刷新"
          @click="refreshLayer"
          @keydown.enter="refreshLayer"
        >
          <i class="el-icon-refresh" />
        </div>
      </div>
      <div class="map-tool-btn-group">
        <div
          class="map-tool-btn"
          tabindex="0"
          role="button"
          title="放大"
          @click="zoomIn"
          @keydown.enter="zoomIn"
        >
          <i class="el-icon-plus" />
        </div>
        <div
          class="map-tool-btn"
          tabindex="0"
          role="button"
          title="缩小"
          @click="zoomOut"
          @keydown.enter="zoomOut"
        >
          <i class="el-icon-minus" />
        </div>
      </div>
    </div>

    <!-- 通道信息框 -->
    <div ref="infobox">
      <transition name="el-zoom-in-center">
        <div v-if="channel" class="infobox-content">
          <el-descriptions :title="channel.gbName" :column="1" :colon="true" size="mini" :label-style="labelStyle">
            <el-descriptions-item label="编号">{{ channel.gbDeviceId }}</el-descriptions-item>
            <el-descriptions-item label="生产厂商">{{ channel.gbManufacture || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="安装地址">{{ channel.gbAddress || '未知' }}</el-descriptions-item>
          </el-descriptions>
          <div style="padding-top: 10px; margin: 0 auto; width: fit-content;">
            <el-tooltip :disabled="channel.gbStatus === 'ON'" content="设备离线，无法播放" placement="top">
              <span>
                <el-button :disabled="channel.gbStatus !== 'ON'" type="primary" size="small" icon="el-icon-video-play" @click="play(channel)">播放</el-button>
              </span>
            </el-tooltip>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="edit(channel)">编辑</el-button>
          </div>
          <span
            class="infobox-close el-icon-close"
            tabindex="0"
            role="button"
            @click="closeInfoBox"
            @keydown.enter="closeInfoBox"
          />
        </div>
      </transition>
    </div>

    <!-- 复用已有组件 -->
    <DevicePlayer ref="devicePlayer" />

    <!-- 编辑弹窗：包裹 CommonChannelEdit -->
    <el-dialog
      title="编辑通道"
      :visible.sync="editDialogVisible"
      width="720px"
      append-to-body
      @close="onEditDialogClose"
    >
      <CommonChannelEdit
        v-if="editDialogVisible && editingChannel"
        :id="editingChannel.gbId"
        ref="channelEdit"
        :data-form="editingChannel"
        :show-cancel="true"
        @submitSuccess="onEditSuccess"
        @cancel="editDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import DeviceTree from './components/DeviceTree.vue'
import MapComponent from './components/MapComponent.vue'
import DevicePlayer from '../device/components/DevicePlayer.vue'
import CommonChannelEdit from '../device/components/CommonChannelEdit.vue'
import { getAllForMap, queryOne } from '@/api/wvp/channel'

let channelLayer = null

export default {
  name: 'WvpMap',
  components: {
    DeviceTree,
    MapComponent,
    DevicePlayer,
    CommonChannelEdit
  },
  data() {
    return {
      mapReady: false,
      loadingMarkers: false,
      sidebarVisible: true,
      channel: null,
      infoBoxId: null,
      editDialogVisible: false,
      editingChannel: null,
      labelStyle: { width: '56px' }
    }
  },
  watch: {
    sidebarVisible() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.mapComponent) {
            this.$refs.mapComponent.updateMapSize()
          }
        }, 350)
      })
    }
  },
  beforeDestroy() {
    this.closeInfoBox()
    if (this.$refs.mapComponent) {
      this.$refs.mapComponent.destroy()
    }
  },
  methods: {
    onMapLoaded() {
      this.mapReady = true
      this.initChannelLayer()
    },

    initChannelLayer() {
      this.closeInfoBox()

      const clickEvent = data => {
        this.closeInfoBox()
        this.$nextTick(() => {
          this.showChannelInfo(data[0])
        })
      }

      channelLayer = this.$refs.mapComponent.addPointLayer([], clickEvent, null)
      this.loadChannelMarkers()
    },

    loadChannelMarkers() {
      this.loadingMarkers = true
      getAllForMap().then(res => {
        if (this._isDestroyed) return
        const data = res.data || res
        const channels = Array.isArray(data) ? data : (data.list || [])
        const markers = []
        for (let i = 0; i < channels.length; i++) {
          const ch = channels[i]
          if (ch.gbLongitude && ch.gbLatitude && ch.gbLongitude > 0 && ch.gbLatitude > 0) {
            markers.push({
              id: ch.gbId,
              position: [ch.gbLongitude, ch.gbLatitude],
              data: ch,
              status: ch.gbStatus || 'OFF'
            })
          }
        }
        if (markers.length === 0) {
          this.$message.info('未找到带位置的通道')
        } else if (channelLayer) {
          this.$refs.mapComponent.updatePointLayer(channelLayer, markers)
        }
      }).catch(err => {
        console.error('加载地图通道数据失败:', err)
      }).finally(() => {
        this.loadingMarkers = false
      })
    },

    treeChannelClickEvent(id) {
      this.closeInfoBox()
      queryOne(id).then(res => {
        if (this._isDestroyed) return
        const data = res.data || res
        if (!data.gbLongitude || data.gbLongitude < 0 || !data.gbLatitude || data.gbLatitude < 0) {
          this.$message.warning('无位置信息')
          return
        }
        const zoomExtent = this.$refs.mapComponent.getZoomExtent()
        this.$refs.mapComponent.panTo([data.gbLongitude, data.gbLatitude], zoomExtent[1], () => {
          this.showChannelInfo(data)
        })
      }).catch(err => {
        if (this._isDestroyed) return
        this.$message.error('查询通道失败: ' + (err.message || '未知错误'))
      })
    },

    showChannelInfo(data) {
      this.channel = data
      const position = [data.gbLongitude, data.gbLatitude]
      const cameraData = {
        id: data.gbId,
        position: position,
        data: data,
        status: data.gbStatus
      }
      if (channelLayer) {
        this.$refs.mapComponent.addFeature(channelLayer, cameraData)
      }
      this.infoBoxId = this.$refs.mapComponent.openInfoBox(position, this.$refs.infobox, [0, -50])
    },

    closeInfoBox() {
      if (this.infoBoxId !== null) {
        this.$refs.mapComponent && this.$refs.mapComponent.closeInfoBox(this.infoBoxId)
      }
      this.channel = null
      this.infoBoxId = null
    },

    play(channel) {
      this.$refs.devicePlayer.openChannel(channel.gbId, channel.gbName)
    },

    edit(channel) {
      this.editingChannel = channel
      this.editDialogVisible = true
    },

    onEditSuccess() {
      this.editDialogVisible = false
      this.editingChannel = null
      this.$message.success('编辑成功')
    },

    onEditDialogClose() {
      this.editingChannel = null
    },

    zoomIn() {
      this.$refs.mapComponent.zoomIn()
    },
    zoomOut() {
      this.$refs.mapComponent.zoomOut()
    },
    refreshLayer() {
      this.closeInfoBox()
      this.loadChannelMarkers()
    },
    zoomChange() {}
  }
}
</script>

<style>
#WvpMap {
  position: relative;
}
.map-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 360px auto;
  transition: grid-template-columns 0.3s ease;
}
.map-layout.sidebar-collapsed {
  grid-template-columns: 0px auto;
}
.sidebar-wrapper {
  overflow: hidden;
  height: 100%;
}
.map-wrapper {
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.sidebar-toggle-btn {
  position: absolute;
  left: 360px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 15;
  width: 16px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  box-shadow: 2px 0 4px rgba(0,0,0,.08);
  transition: left 0.3s ease;
}
.sidebar-toggle-btn.sidebar-collapsed {
  left: 0px;
}
.sidebar-toggle-btn:hover,
.sidebar-toggle-btn:focus {
  background: #f5f7fa;
  color: #409EFF;
}
.map-loading {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  z-index: 10;
  color: #727272;  /* el-text-color-regular */
}
.map-marker-loading {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background: #FFFFFF;
  padding: 6px 12px;
  border-radius: 3px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, .15);
  color: #727272;  /* el-text-color-regular */
  font-size: 13px;
  z-index: 5;
}
.map-tool-box-bottom-right {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.map-tool-btn-group {
  background-color: #FFFFFF;
  border-radius: 3px;
  user-select: none;
  box-shadow: 0 2px 2px rgba(0, 0, 0, .15);
  margin-bottom: 10px;
  display: flex;
}
.map-tool-btn {
  border-bottom: 1px #dfdfdf solid;
  border-right: 1px #dfdfdf solid;
  width: fit-content;
  min-width: 33px;
  height: 36px;
  cursor: pointer;
  text-align: center;
  line-height: 36px;
  font-size: 14px;
  padding: 0 4px;
}
.map-tool-btn:hover,
.map-tool-btn:focus {
  background-color: #f5f7fa;
}
.infobox-content {
  width: 270px;
  max-width: 90vw;  /* 窄屏防溢出 */
  background-color: #FFFFFF;
  padding: 10px;
  border-radius: 4px;  /* 匹配 Element UI el-popover */
  border: 1px solid #EBEEF5;  /* el-border-color-light */
}
.infobox-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  color: #000000;
  cursor: pointer;
}
.el-descriptions__title {
  font-size: 1rem;
  font-weight: 700;
  padding: 20px 20px 0px 23px;
  text-align: center;
  width: 100%;
}

/* 覆盖 CommonChannelEdit 在 dialog 内的高度 */
.el-dialog .common-channel-edit-root {
  height: auto !important;
}

/* 响应式：768px 断点 */
@media (max-width: 768px) {
  .map-layout {
    grid-template-columns: 100%;
    grid-template-rows: auto 300px;
  }
  .sidebar-toggle-btn {
    display: none;
  }
}
</style>
