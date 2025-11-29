<template>
  <el-dialog
    title="视频播放"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="video-player-container">
      <!-- URL输入区域 -->
      <div class="url-input-section">
        <el-form :inline="true" size="small">
          <el-form-item label="播放地址:">
            <el-input
              v-model="videoUrl"
              placeholder="请输入视频文件的HTTP URL"
              style="width: 500px"
              clearable
            >
              <el-button
                slot="append"
                icon="el-icon-video-play"
                @click="handlePlay"
              >
                播放
              </el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 视频播放区域 -->
      <div class="video-section">
        <div v-if="!isPlaying" class="video-placeholder">
          <i class="el-icon-video-camera placeholder-icon"></i>
          <p class="placeholder-text">请输入视频URL并点击播放按钮</p>
        </div>
        <div v-show="isPlaying" class="video-wrapper">
          <video
            ref="videoPlayer"
            class="custom-video-player"
            controls
            preload="auto"
            width="100%"
            height="500"
            controlslist="nodownload"
          >
            您的浏览器不支持HTML5视频播放。
          </video>
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
      <el-button @click="handleClose">关 闭</el-button>
      <el-button v-if="isPlaying" type="warning" @click="handleStop">停止播放</el-button>
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
      errorMessage: ''
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
      }
    }
  },
  beforeDestroy() {
    this.destroyPlayer()
  },
  methods: {
    /** 播放视频 */
    handlePlay() {
      if (!this.videoUrl) {
        this.$message.warning('请输入视频URL')
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
        const videoElement = this.$refs.videoPlayer

        if (!videoElement) {
          console.error('视频元素未找到')
          return
        }

        // 设置视频源
        videoElement.src = this.videoUrl

        // 保存播放器引用
        this.player = videoElement

        // 监听播放器事件
        videoElement.addEventListener('loadstart', () => {
          this.playerState = 'loading'
        })

        videoElement.addEventListener('canplay', () => {
        })

        videoElement.addEventListener('playing', () => {
          this.playerState = 'playing'
        })

        videoElement.addEventListener('pause', () => {
          this.playerState = 'paused'
        })

        videoElement.addEventListener('ended', () => {
          this.playerState = 'stopped'
        })

        videoElement.addEventListener('error', (e) => {
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
        })

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

    /** 销毁播放器 */
    destroyPlayer() {
      if (this.player) {
        try {
          // 暂停播放
          this.player.pause()
          // 清空源
          this.player.src = ''
          this.player.load()
          this.player = null
        } catch (error) {
          console.error('销毁播放器失败:', error)
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
    }
  }
}
</script>

<style scoped>
.video-player-container {
  padding: 10px;
}

.url-input-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
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

