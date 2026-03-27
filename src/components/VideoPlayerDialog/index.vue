<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="video-player-container">
      <!-- 视频播放区域 -->
      <div class="video-section" :style="{ minHeight: isAudio ? '120px' : '500px' }">
        <div v-if="!isPlaying" class="video-placeholder">
          <i :class="placeholderIcon" class="placeholder-icon" />
          <p class="placeholder-text">点击播放按钮开始播放</p>
        </div>
        <div v-show="isPlaying" class="video-wrapper">
          <component
            :is="playerTag"
            ref="player"
            class="custom-video-player"
            controls
            preload="auto"
            width="100%"
            :height="playerHeight"
            controlslist="nodownload"
          >
            <source :src="videoUrl" :type="mediaMime">
            您的浏览器不支持HTML5媒体播放。
          </component>
        </div>
      </div>

      <!-- 播放信息 -->
      <div v-if="isPlaying" class="video-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="播放地址">
            {{ videoUrl }}
          </el-descriptions-item>
          <el-descriptions-item label="播放状态">
            <el-tag :type="playerState === 'playing' ? 'success' : 'info'" size="small">
              {{ playerStateText }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button v-if="!isPlaying" type="primary" icon="el-icon-video-play" @click="handlePlay">播 放</el-button>
      <el-button v-else type="warning" @click="handleStop">停止播放</el-button>
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
// 注意：如果需要使用Video.js，请先安装: npm install video.js --save
// import videojs from 'video.js'
// import 'video.js/dist/video-js.css'

export default {
  name: 'VideoPlayerDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 媒体类型：1=照片 2=音频 3=视频
    mediaCate: {
      type: [Number, String],
      default: 3
    },
    // 初始视频URL
    initialUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      videoUrl: '',
      isPlaying: false,
      player: null,
      playerState: 'stopped', // stopped, playing, paused, loading
      errorMessage: '',
      isDestroying: false, // 标志位：是否正在销毁播放器
      errorHandler: null, // 保存错误处理函数引用，以便移除
      playerListeners: null // 保存播放器事件监听器引用，便于移除
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    isAudio() {
      return parseInt(this.mediaCate) === 2
    },
    playerTag() {
      return this.isAudio ? 'audio' : 'video'
    },
    dialogTitle() {
      return this.isAudio ? '音频播放' : '视频播放'
    },
    placeholderIcon() {
      return this.isAudio ? 'el-icon-headset' : 'el-icon-video-camera'
    },
    playerHeight() {
      return this.isAudio ? 80 : 500
    },
    mediaMime() {
      return this.getMediaMime(this.videoUrl)
    },
    playerStateText() {
      const stateMap = {
        stopped: '已停止',
        playing: '播放中',
        paused: '已暂停',
        loading: '加载中',
        error: '播放错误'
      }
      return stateMap[this.playerState] || '未知'
    }
  },
  watch: {
    visible(val) {
      if (val && this.initialUrl) {
        this.videoUrl = this.initialUrl

        // 打开弹窗后自动播放
        this.$nextTick(() => {
          if (!this.isPlaying) {
            this.handlePlay()
          }
        })
      }
    },
    // 监听 initialUrl 变化，当父组件异步获取到播放地址后自动填充
    initialUrl(val) {
      if (val && this.visible) {
        this.videoUrl = val

        // 播放地址异步到达后自动播放
        this.$nextTick(() => {
          if (!this.isPlaying) {
            this.handlePlay()
          }
        })
      }
    }
  },
  beforeDestroy() {
    this.destroyPlayer()
  },
  methods: {
    /** 播放视频 */
    handlePlay() {
      // 防止连续点击“播放”导致重复 init/重复绑定事件
      // 若正在播放，先停止再重新播放（相当于重载）
      if (this.isPlaying) {
        this.handleStop()
      }

      if (!this.videoUrl) {
        this.$message.warning('请输入播放URL')
        return
      }

      // 验证URL格式
      if (!this.isValidUrl(this.videoUrl)) {
        this.$message.error('请输入有效的HTTP URL')
        return
      }

      this.isPlaying = true
      this.playerState = 'loading'

      // 等待DOM更新后初始化播放器
      this.$nextTick(() => {
        this.initPlayer()
      })
    },

    /** 停止播放 */
    handleStop() {
      this.destroyPlayer()
      this.isPlaying = false
      this.playerState = 'stopped'
    },

    /** 初始化HTML5视频播放器 */
    initPlayer() {
      try {
        const videoElement = this.$refs.player

        if (!videoElement) {
          console.error('视频元素未找到')
          return
        }

        // 初始化前先移除旧监听器（避免重复绑定）
        this.removePlayerListeners()

        // 设置视频源并显式 load（部分浏览器对动态 source 更敏感）
        videoElement.src = this.videoUrl
        if (typeof videoElement.load === 'function') {
          videoElement.load()
        }

        // 保存播放器引用
        this.player = videoElement

        // 监听播放器事件（使用可移除的函数引用，避免重复绑定）
        this.playerListeners = {
          loadstart: () => {
            this.playerState = 'loading'
          },
          loadeddata: () => {
            this.playerState = 'playing'
          },
          play: () => {
            this.playerState = 'playing'
          },
          pause: () => {
            this.playerState = 'paused'
          },
          ended: () => {
            this.playerState = 'stopped'
            this.isPlaying = false
          }
        }
        videoElement.addEventListener('loadstart', this.playerListeners.loadstart)
        videoElement.addEventListener('loadeddata', this.playerListeners.loadeddata)
        videoElement.addEventListener('play', this.playerListeners.play)
        videoElement.addEventListener('pause', this.playerListeners.pause)
        videoElement.addEventListener('ended', this.playerListeners.ended)

        // 错误处理函数（保持单例引用，destroy 时可移除）
        this.errorHandler = () => {
          // 如果正在销毁播放器，不显示错误信息
          if (this.isDestroying) {
            return
          }
          this.playerState = 'error'
          const error = videoElement.error
          console.error('视频播放错误:', error)

          let errorMsg = '视频播放失败'
          if (error) {
            switch (error.code) {
              case 1:
                errorMsg = '视频加载被中止'
                break
              case 2:
                errorMsg = '网络错误，无法加载视频'
                break
              case 3:
                errorMsg = '视频解码失败'
                break
              case 4:
                errorMsg = '不支持的视频格式或URL无效'
                break
              default:
                errorMsg = `播放错误 (代码: ${error.code})`
            }
          }

          this.$message.error(errorMsg)
        }
        videoElement.addEventListener('error', this.errorHandler)

        // 输出关键信息，便于定位 Edge NotSupportedError
        try {
          console.log('[VideoPlayerDialog] playUrl:', this.videoUrl)
          console.log('[VideoPlayerDialog] mime:', this.getMediaMime(this.videoUrl))
        } catch (e) {
        }

        // 尝试播放
        const playPromise = videoElement.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('视频开始播放')
            })
            .catch(error => {
              console.error('自动播放失败:', error)
              this.$message.warning('自动播放失败，请手动点击播放按钮')
            })
        }
      } catch (error) {
        console.error('初始化播放器失败:', error)
        this.$message.error('初始化播放器失败: ' + error.message)
        this.playerState = 'error'
      }
    },

    removePlayerListeners() {
      if (!this.player || !this.playerListeners) {
        return
      }
      try {
        this.player.removeEventListener('loadstart', this.playerListeners.loadstart)
        this.player.removeEventListener('loadeddata', this.playerListeners.loadeddata)
        this.player.removeEventListener('play', this.playerListeners.play)
        this.player.removeEventListener('pause', this.playerListeners.pause)
        this.player.removeEventListener('ended', this.playerListeners.ended)
      } catch (e) {
      } finally {
        this.playerListeners = null
      }
    },

    /** 销毁播放器 */
    destroyPlayer() {
      if (this.player) {
        try {
          // 设置销毁标志
          this.isDestroying = true

          // 先移除事件监听器，避免 stop/清空 src 时触发回调
          this.removePlayerListeners()
          if (this.errorHandler) {
            this.player.removeEventListener('error', this.errorHandler)
            this.errorHandler = null
          }

          // 暂停播放
          this.player.pause()

          // 清空源（避免浏览器继续尝试加载/播放）
          // 使用 removeAttribute 更彻底，且在移除 error 监听后不会刷屏
          this.player.removeAttribute('src')
          if (typeof this.player.load === 'function') {
            this.player.load()
          }

          this.player = null
          this.isDestroying = false
        } catch (error) {
          console.error('销毁播放器失败:', error)
          this.isDestroying = false
        }
      }
    },

    /** 关闭对话框 */
    handleClose() {
      this.destroyPlayer()
      this.isPlaying = false
      this.playerState = 'stopped'
      this.videoUrl = ''
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /** 验证URL格式 */
    isValidUrl(url) {
      try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch (e) {
        return false
      }
    },

    /** 根据URL获取视频类型 */
    getVideoType(url) {
      const extension = url.split('.').pop().split('?')[0].toLowerCase()
      const typeMap = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'flv': 'video/x-flv',
        'm3u8': 'application/x-mpegURL',
        'ts': 'video/MP2T'
      }
      return typeMap[extension] || 'video/mp4'
    },
    /** 根据URL推断媒体MIME（用于 <source type> 提升兼容性） */
    getMediaMime(url) {
      if (!url) {
        return this.isAudio ? 'audio/mpeg' : 'video/mp4'
      }
      const extension = url.split('.').pop().split('?')[0].toLowerCase()

      if (this.isAudio) {
        const audioMap = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          m4a: 'audio/mp4',
          aac: 'audio/aac',
          ogg: 'audio/ogg'
        }
        return audioMap[extension] || 'audio/mpeg'
      }

      const videoMap = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        ogg: 'video/ogg',
        flv: 'video/x-flv',
        m3u8: 'application/x-mpegURL',
        ts: 'video/MP2T'
      }
      return videoMap[extension] || 'video/mp4'
    }
  }
}
</script>

<style scoped>
.video-player-container {
  padding: 10px;
}

.video-section {
  margin-bottom: 20px;
  min-height: 500px;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.placeholder-icon {
  font-size: 80px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.placeholder-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.video-wrapper {
  width: 100%;
  height: 100%;
}

.video-info {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
  padding: 10px 0;
}

/* 自定义视频播放器样式 */
.custom-video-player {
  width: 100%;
  height: 500px;
  background: #000;
  outline: none;
}

.custom-video-player::-webkit-media-controls-panel {
  background-color: rgba(0, 0, 0, 0.8);
}

.custom-video-player::-webkit-media-controls-play-button {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}
</style>

