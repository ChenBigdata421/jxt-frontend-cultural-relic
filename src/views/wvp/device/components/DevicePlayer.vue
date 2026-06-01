<template>
  <el-dialog
    :title="'视频播放 - ' + (channelName || channelId)"
    top="5vh"
    append-to-body
    width="720px"
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    :aria-label="'视频播放 - ' + (channelName || channelId)"
    custom-class="device-player-dialog"
    @close="handleClose"
  >
    <!-- Loading state -->
    <div v-if="playerState === 'loading'" v-loading="true" element-loading-text="正在连接..." style="height: 405px; background: #000;" />

    <!-- Playing state -->
    <div v-else-if="playerState === 'playing'" style="position: relative;">
      <jessibuca-player
        ref="player"
        :has-audio="hasAudio"
        style="height: 405px"
        @playStatusChange="onPlayStatusChange"
        @playerError="onPlayerError"
        @playerTimeout="onPlayerTimeout"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="playerState === 'error'" style="height: 405px; background: #000; display: flex; align-items: center; justify-content: center;">
      <el-result icon="error" :title="errorMessage" sub-title="请检查设备状态后重试">
        <template slot="extra">
          <el-button type="primary" size="small" @click="retryPlay">重新连接</el-button>
          <el-button size="small" @click="dialogVisible = false">关闭</el-button>
        </template>
      </el-result>
    </div>

    <!-- Collapsible URL display -->
    <div style="margin-top: 0.5rem;">
      <el-link type="info" :underline="false" @click="urlExpanded = !urlExpanded">
        <i :class="urlExpanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" />
        链路信息
      </el-link>
      <div v-if="urlExpanded && videoUrl" style="margin-top: 4px; display: flex; align-items: center;">
        <span style="font-family: monospace; font-size: 0.8rem; word-break: break-all; flex: 1; color: #909399;">{{ videoUrl }}</span>
        <i class="el-icon-document-copy" style="cursor: pointer; margin-left: 8px; color: #909399;" title="复制" @click="copyUrl" />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import JessibucaPlayer from '@/components/JessibucaPlayer/index.vue'
import { startPlay, stopPlay } from '@/api/wvp/play'
import { playChannel, stopPlayChannel } from '@/api/wvp/channel'
import { handleStreamResponse } from '@/utils/stream'

export default {
  name: 'DevicePlayer',
  components: { JessibucaPlayer },
  data() {
    return {
      dialogVisible: false,
      deviceId: '',
      channelId: '',
      channelName: '',
      videoUrl: '',
      hasAudio: false,
      streamInfo: null,
      playerState: 'idle',
      errorMessage: '',
      urlExpanded: false,
      isClosing: false,
      playMode: 'device'
    }
  },
  beforeDestroy() {
    this._isDestroyed = true
    this.cleanupPlayer()
    if (this.playerState !== 'idle') {
      if (this.playMode === 'channel' && this.channelId) {
        stopPlayChannel(this.channelId).catch(() => {})
      } else if (this.deviceId && this.channelId) {
        stopPlay(this.deviceId, this.channelId).catch(() => {})
      }
    }
  },
  methods: {
    _applyStream(streamInfo, onError) {
      if (!streamInfo) {
        this.errorMessage = '未获取到流地址'
        this.playerState = 'error'
        this.$emit('error', this.errorMessage)
        if (onError) onError()
        return false
      }
      this.streamInfo = streamInfo
      this.hasAudio = streamInfo.hasAudio || false
      this.videoUrl = handleStreamResponse(streamInfo)
      if (!this.videoUrl) {
        this.errorMessage = '未获取到流地址'
        this.playerState = 'error'
        this.$emit('error', this.errorMessage)
        if (onError) onError()
        return false
      }
      return true
    },
    _startPlaying() {
      this.playerState = 'playing'
      this.$nextTick(() => {
        if (this.$refs.player && this.videoUrl) {
          this.$refs.player.play(this.videoUrl)
        }
      })
    },
    open(deviceId, channelId, channelName) {
      if (this.isClosing) return

      this.deviceId = deviceId
      this.channelId = channelId
      this.channelName = channelName || ''
      this.videoUrl = ''
      this.streamInfo = null
      this.hasAudio = false
      this.errorMessage = ''
      this.urlExpanded = false
      this.playMode = 'device'
      this.playerState = 'loading'
      this.dialogVisible = true

      startPlay(deviceId, channelId).then(res => {
        if (!this._applyStream(res.data)) return
        this._startPlaying()
        this.$emit('opened')
      }).catch(err => {
        this.errorMessage = '开始播放失败: ' + (err.message || '未知错误')
        this.playerState = 'error'
        this.$emit('error', this.errorMessage)
      })
    },
    openChannel(channelId, channelName) {
      if (this.isClosing) return

      this.deviceId = ''
      this.channelId = channelId
      this.channelName = channelName || ''
      this.videoUrl = ''
      this.streamInfo = null
      this.hasAudio = false
      this.errorMessage = ''
      this.urlExpanded = false
      this.playMode = 'channel'
      this.playerState = 'loading'
      this.dialogVisible = true

      playChannel(channelId).then(res => {
        if (this._isDestroyed) return
        if (!this._applyStream(res.data)) return
        this._startPlaying()
        this.$emit('opened')
      }).catch(err => {
        if (this._isDestroyed) return
        this.errorMessage = '开始播放失败: ' + (err.message || '未知错误')
        this.playerState = 'error'
        this.$emit('error', this.errorMessage)
      })
    },
    close() {
      this.handleClose()
    },
    handleClose() {
      this.isClosing = true
      this.cleanupPlayer()
      if (this.playMode === 'channel' && this.channelId) {
        stopPlayChannel(this.channelId).catch(err => {
          console.error('停止推流失败:', err)
          this.$message.warning('停止推流失败，请联系管理员')
        }).finally(() => {
          this.isClosing = false
        })
      } else if (this.deviceId && this.channelId) {
        stopPlay(this.deviceId, this.channelId).catch(err => {
          console.error('停止推流失败:', err)
          this.$message.warning('停止推流失败，请联系管理员')
        }).finally(() => {
          this.isClosing = false
        })
      } else {
        this.isClosing = false
      }
      this.dialogVisible = false
      this.playerState = 'idle'
      this.videoUrl = ''
      this.streamInfo = null
    },
    cleanupPlayer() {
      if (this.$refs.player) {
        this.$refs.player.destroy()
      }
    },
    onPlayStatusChange() {
    },
    onPlayerError(msg) {
      this.errorMessage = '播放器错误: ' + (msg || '未知错误')
      this.playerState = 'error'
    },
    onPlayerTimeout() {
      this.errorMessage = '连接已断开'
      this.playerState = 'error'
    },
    retryPlay() {
      const doRetry = (apiPromise) => {
        this.playerState = 'loading'
        apiPromise.then(res => {
          if (this._isDestroyed) return
          if (!this._applyStream(res.data)) return
          this._startPlaying()
        }).catch(err => {
          if (this._isDestroyed) return
          this.errorMessage = '重连失败: ' + (err.message || '未知错误')
          this.playerState = 'error'
          this.$emit('error', this.errorMessage)
        })
      }
      if (this.playMode === 'channel' && this.channelId) {
        doRetry(playChannel(this.channelId))
      } else if (this.deviceId && this.channelId) {
        doRetry(startPlay(this.deviceId, this.channelId))
      }
    },
    copyUrl() {
      if (!this.videoUrl) return
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.videoUrl).then(() => {
          this.$message.success('已复制到剪贴板')
        })
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = this.videoUrl
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        this.$message.success('已复制到剪贴板')
      }
    }
  }
}
</script>

<style>
.device-player-dialog {
  min-width: 480px;
}
.device-player-dialog .el-dialog__body {
  padding: 10px 20px;
}
@media (max-width: 768px) {
  .device-player-dialog {
    margin-top: 0 !important;
    width: 100% !important;
  }
}
</style>
