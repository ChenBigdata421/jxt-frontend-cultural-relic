<template>
  <div id="WvpLive" class="live-container">
    <div class="live-layout" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <div class="sidebar-wrapper">
        <DeviceTree ref="deviceTree" @clickEvent="onTreeChannelClick" />
      </div>
      <div class="video-wrapper">
        <div class="control-bar">
          <div class="split-controls">
            分屏:
            <span class="split-btn" :class="{active: splitIndex === 0}" @click="changeSplit(0)">1</span>
            <span class="split-btn" :class="{active: splitIndex === 1}" @click="changeSplit(1)">4</span>
            <span class="split-btn" :class="{active: splitIndex === 2}" @click="changeSplit(2)">6</span>
            <span class="split-btn" :class="{active: splitIndex === 3}" @click="changeSplit(3)">9</span>
          </div>
          <div class="fullscreen-control">
            <i class="el-icon-full-screen btn" title="全屏" @click="fullScreen" />
          </div>
        </div>
        <div ref="playBox" class="player-container">
          <div class="play-grid" :style="gridStyle">
            <div
              v-for="i in layouts[splitIndex].count"
              :key="i"
              class="play-box"
              :class="getSlotClass(i - 1)"
              :style="getSlotStyle(i - 1)"
              @click="activeSlot = i - 1"
            >
              <div v-if="!slots[i-1].videoUrl" class="no-signal">
                <template v-if="slots[i-1].loading">
                  <i class="el-icon-loading" style="font-size: 24px; display: block; margin-bottom: 6px;" />
                  <span>{{ slots[i-1].tip }}</span>
                </template>
                <template v-else-if="slots[i-1].tip && slots[i-1].channelId">
                  <span style="color: #F56C6C;">{{ slots[i-1].tip }}</span>
                  <el-button size="mini" type="text" style="color: #409EFF; margin-top: 8px;" @click.stop="retrySlot(i - 1)">重试</el-button>
                </template>
                <template v-else-if="i - 1 === activeSlot && !slots[i-1].channelId">
                  <i class="el-icon-video-camera" style="font-size: 24px; display: block; margin-bottom: 6px;" />
                  <span style="font-size: 12px;">点击左侧通道开始监控</span>
                </template>
                <template v-else>无信号</template>
              </div>
              <template v-else>
                <JessibucaPlayer
                  :ref="'player' + (i - 1)"
                  :has-audio="slots[i-1].hasAudio"
                />
                <div class="slot-label">{{ slots[i-1].channelName }}</div>
                <i class="el-icon-close slot-close" title="停止" @click.stop="closeSlot(i - 1)" />
              </template>
            </div>
          </div>
        </div>
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
  </div>
</template>

<script>
import JessibucaPlayer from '@/components/JessibucaPlayer/index.vue'
import DeviceTree from '@/views/wvp/map/components/DeviceTree.vue'
import screenfull from 'screenfull'
import { playChannel, stopPlayChannel, queryOne } from '@/api/wvp/channel'

export default {
  name: 'WvpLive',
  components: { JessibucaPlayer, DeviceTree },
  data() {
    return {
      sidebarVisible: true,
      // 视频网格
      slots: Array(9).fill(null).map(() => ({
        channelId: null,
        channelName: '',
        videoUrl: '',
        tip: '无信号',
        loading: false,
        hasAudio: false
      })),
      activeSlot: 0,
      splitIndex: 2,

      // 分屏布局
      layouts: [
        { count: 1, columns: '1fr', rows: '1fr' },
        { count: 4, columns: '1fr 1fr', rows: '1fr 1fr' },
        { count: 6, columns: '1fr 1fr 1fr', rows: '1fr 1fr 1fr' },
        { count: 9, columns: '1fr 1fr 1fr', rows: '1fr 1fr 1fr' }
      ]
    }
  },
  computed: {
    gridStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: this.layouts[this.splitIndex].columns,
        gridTemplateRows: this.layouts[this.splitIndex].rows,
        gap: this.splitIndex === 3 ? '2px' : '4px',
        backgroundColor: '#000'
      }
    }
  },
  created() {
    this._isDestroyed = false
  },
  mounted() {
    if (window.innerWidth < 768) {
      this.splitIndex = 0
    }
  },
  beforeDestroy() {
    this._isDestroyed = true
    this.stopAllSlots()
  },
  methods: {
    onTreeChannelClick(gbId) {
      const idx = this.activeSlot

      // 停旧流
      const stopOld = this.slots[idx].channelId
        ? stopPlayChannel(this.slots[idx].channelId).catch(() => {})
        : Promise.resolve()

      stopOld.finally(() => {
        if (this._isDestroyed) return
        this.$set(this.slots, idx, { ...this.slots[idx], loading: true, tip: '正在获取通道信息...', videoUrl: '' })

        queryOne(gbId).then(res => {
          if (this._isDestroyed) return
          const ch = res.data || res
          if (ch.gbStatus !== 'ON') {
            this.$set(this.slots, idx, { ...this.slots[idx], tip: '通道离线', loading: false, videoUrl: '' })
            return
          }
          this.playChannelToSlot(idx, ch.gbId, ch.gbName)
        }).catch(err => {
          if (this._isDestroyed) return
          this.$set(this.slots, idx, { ...this.slots[idx], tip: '查询失败: ' + (err.message || '未知错误'), loading: false, videoUrl: '' })
        })
      })
    },

    playChannelToSlot(idx, gbId, channelName) {
      this.$set(this.slots, idx, { ...this.slots[idx], loading: true, tip: '正在拉流...', videoUrl: '' })

      playChannel(gbId).then(res => {
        if (this._isDestroyed) return
        const streamInfo = res.data || res
        if (!streamInfo || (!streamInfo.ws_flv && !streamInfo.wss_flv)) {
          this.$set(this.slots, idx, { ...this.slots[idx], tip: '未获取到流地址', loading: false, videoUrl: '' })
          return
        }
        const videoUrl = location.protocol === 'https:' ? streamInfo.wss_flv : streamInfo.ws_flv
        this.handleStreamPlay(idx, gbId, channelName, videoUrl)
      }).catch(err => {
        if (this._isDestroyed) return
        this.$set(this.slots, idx, { ...this.slots[idx], tip: '播放失败: ' + (err.message || '未知错误'), loading: false, videoUrl: '' })
      })
    },

    changeSplit(newIndex) {
      const oldCount = this.layouts[this.splitIndex].count
      const newCount = this.layouts[newIndex].count
      if (newCount < oldCount) {
        for (let i = newCount; i < oldCount; i++) {
          const slot = this.slots[i]
          if (slot.channelId) {
            stopPlayChannel(slot.channelId).catch(() => {})
            this.$set(this.slots, i, {
              channelId: null, channelName: '', videoUrl: '', tip: '无信号', loading: false, hasAudio: false
            })
          }
        }
      }
      this.splitIndex = newIndex
      if (this.activeSlot >= newCount) {
        this.activeSlot = 0
      }
    },

    getSlotClass(idx) {
      return { active: idx === this.activeSlot }
    },
    getSlotStyle(idx) {
      if (this.splitIndex === 2) {
        const positions = [
          { gridColumn: '1 / span 2', gridRow: '1 / span 2' },
          { gridColumn: '3', gridRow: '1' },
          { gridColumn: '3', gridRow: '2' },
          { gridColumn: '1', gridRow: '3' },
          { gridColumn: '2', gridRow: '3' },
          { gridColumn: '3', gridRow: '3' }
        ]
        return positions[idx] || {}
      }
      return {}
    },

    fullScreen() {
      if (screenfull.isEnabled && this.$refs.playBox) {
        screenfull.toggle(this.$refs.playBox)
      }
    },

    handleStreamPlay(idx, channelId, channelName, videoUrl) {
      this.$set(this.slots, idx, {
        channelId, channelName, videoUrl, tip: '', loading: false, hasAudio: false
      })
      this.autoAdvanceSlot()
      this.$nextTick(() => {
        const playerRef = this.$refs['player' + idx]
        const player = Array.isArray(playerRef) ? playerRef[0] : playerRef
        if (player && videoUrl) {
          player.play(videoUrl)
        }
      })
    },

    closeSlot(idx) {
      const slot = this.slots[idx]
      if (slot.channelId) {
        stopPlayChannel(slot.channelId).catch(() => {})
      }
      this.$set(this.slots, idx, {
        channelId: null, channelName: '', videoUrl: '', tip: '无信号', loading: false, hasAudio: false
      })
    },

    retrySlot(idx) {
      const slot = this.slots[idx]
      if (!slot.channelId) return
      this.activeSlot = idx
      const channelId = slot.channelId
      const channelName = slot.channelName
      this.$set(this.slots, idx, { ...this.slots[idx], tip: '正在拉流...', loading: true, videoUrl: '' })
      playChannel(channelId).then(res => {
        if (this._isDestroyed) return
        const streamInfo = res.data || res
        if (!streamInfo || (!streamInfo.ws_flv && !streamInfo.wss_flv)) {
          this.$set(this.slots, idx, { ...this.slots[idx], tip: '未获取到流地址', loading: false, videoUrl: '' })
          return
        }
        const videoUrl = location.protocol === 'https:' ? streamInfo.wss_flv : streamInfo.ws_flv
        this.handleStreamPlay(idx, channelId, channelName, videoUrl)
      }).catch(err => {
        if (this._isDestroyed) return
        this.$set(this.slots, idx, { ...this.slots[idx], tip: '播放失败: ' + (err.message || '未知错误'), loading: false, videoUrl: '' })
      })
    },

    autoAdvanceSlot() {
      const maxSlots = this.layouts[this.splitIndex].count
      for (let i = 0; i < maxSlots; i++) {
        if (!this.slots[i].videoUrl && !this.slots[i].loading) {
          this.activeSlot = i
          return
        }
      }
    },

    stopAllSlots() {
      this.slots.forEach(slot => {
        if (slot.channelId) {
          stopPlayChannel(slot.channelId).catch(() => {})
        }
      })
    }
  }
}
</script>

<style scoped>
.live-container {
  height: calc(100vh - 124px);
  width: 100%;
  position: relative;
}
.live-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 360px auto;
  transition: grid-template-columns 0.3s ease;
}
.live-layout.sidebar-collapsed {
  grid-template-columns: 0px auto;
}
.sidebar-wrapper {
  overflow: hidden;
  height: 100%;
}
.video-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 折叠按钮 */
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

/* 控制栏 */
.control-bar {
  height: 40px;
  min-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  background-color: #fff;
}
.split-controls {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}
.split-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.split-btn:hover {
  color: #409EFF;
  border-color: #C6E2FF;
  background-color: #ECF5FF;
}
.split-btn.active {
  color: #fff;
  background-color: #409EFF;
  border-color: #409EFF;
}
.fullscreen-control { text-align: right; }
.btn {
  margin: 0 6px;
  cursor: pointer;
  font-size: 18px;
  color: #909399;
}
.btn:hover { color: #409EFF; }

/* 播放区域 */
.player-container {
  flex: 1;
  padding: 4px;
  overflow: hidden;
}
.play-grid {
  width: 100%;
  height: 100%;
}
.play-box {
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
  position: relative;
}
.play-box.active { border-color: #409EFF; }
.no-signal {
  color: #fff;
  font-size: 14px;
  user-select: none;
  text-align: center;
}
.slot-label {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
  z-index: 10;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.slot-close {
  position: absolute;
  top: 4px;
  right: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  padding: 4px;
  display: none;
}
.play-box:hover .slot-close { display: block; }
.slot-close:hover { color: #fff; }
.no-signal .el-icon-loading {
  animation: rotating 1.5s linear infinite;
}
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .live-layout {
    grid-template-columns: 100%;
    grid-template-rows: auto 1fr;
  }
  .sidebar-toggle-btn { display: none; }
  .btn { padding: 12px; margin: 0 2px; font-size: 20px; }
}
</style>
