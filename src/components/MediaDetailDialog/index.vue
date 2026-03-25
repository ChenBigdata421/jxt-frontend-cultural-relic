<template>
  <el-dialog
    title="媒体详情"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
    :close-on-click-modal="false"
    custom-class="detail-dialog"
    @close="handleClose"
  >
    <div class="media-detail-container">
      <!-- 媒体预览/播放区域 -->
      <div v-if="showPreviewArea" class="media-preview-section">
        <!-- 图片预览 -->
        <div v-if="mediaCate === 1" class="image-preview-wrapper">
          <div v-if="!imageUrl" class="preview-placeholder">
            <i class="el-icon-picture placeholder-icon" />
            <p>点击下方按钮加载图片</p>
          </div>
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="媒体预览"
            class="media-preview-image"
            @error="handleImageError"
          >
        </div>

        <!-- 视频/音频播放器 -->
        <div v-else-if="isVideoOrAudio" class="video-preview-wrapper">
          <div v-if="!isPlaying" class="preview-placeholder">
            <i
              :class="mediaCate === 2 ? 'el-icon-headset' : 'el-icon-video-camera'"
              class="placeholder-icon"
            />
            <p>{{ mediaCate === 2 ? "音频" : "视频" }}预览</p>
          </div>
          <div v-show="isPlaying" class="player-wrapper">
            <component
              :is="playerTag"
              ref="mediaPlayer"
              class="media-player"
              controls
              preload="auto"
              width="100%"
              :height="playerHeight"
              controlslist="nodownload"
            >
              <source :src="mediaUrl" :type="mediaMime">
              您的浏览器不支持HTML5媒体播放。
            </component>
          </div>
        </div>
      </div>

      <div v-if="showPlayButton" class="play-button-area">
        <el-button
          type="primary"
          size="small"
          :icon="isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"
          :loading="isLoadingPlayUrl"
          @click="handlePlay"
        >
          {{ isLoadingPlayUrl ? "加载中..." : isPlaying ? "停止播放" : "播放预览" }}
        </el-button>
      </div>

      <!-- 媒体详情信息 - 使用可折叠分组 -->
      <el-collapse v-model="activeSections" class="form-collapse">

        <!-- 基础信息 -->
        <el-collapse-item name="basic" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-document section-icon" />
              <span class="section-title">基础信息</span>
              <span class="section-badge">{{ basicFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="媒体名称">
              {{ mediaData.mediaName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="媒体类型">
              {{ selectDictLabel(mediaCateOptions, mediaData.mediaCate) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="媒体后缀">
              {{ mediaData.mediaSuffix || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="拍摄时间">
              {{ parseTime(mediaData.captureTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="拍摄结束时间">
              {{ parseTime(mediaData.captureEndTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="视频时长(秒)">
              {{ formatDuration(mediaData.duration) }}
            </el-descriptions-item>
            <el-descriptions-item label="视频清晰度">
              {{ selectDictLabel(videoClarityOptions, mediaData.clarity) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item v-if="mediaData.width || mediaData.height" label="图片尺寸">
              {{ mediaData.width }} × {{ mediaData.height }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 执法信息 -->
        <el-collapse-item name="enforcement" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-user section-icon" />
              <span class="section-title">执法信息</span>
              <span class="section-badge">{{ enforcementFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="执法类型">
              {{ mediaData.enforcementTypeName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否执法媒体">
              {{ selectDictLabel(isNonEnforcementMediaOptions, mediaData.isNonEnforcementMedia) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="重要级别(平台)">
              {{ selectDictLabel(mediaImportanceOptions, mediaData.importantLevel) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="重要级别(设备)">
              {{ selectDictLabel(mediaImportanceOptions, mediaData.importantLevelRec) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否锁定">
              {{ selectDictLabel(isLockedOptions, mediaData.isLocked) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="过期时间">
              {{ formatExpiryTime(mediaData.expiryTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="标注内容" :span="2">
              {{ mediaData.comments || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="视频序列标识">
              {{ mediaData.sequence || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 档案信息 -->
        <el-collapse-item name="archive" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-folder section-icon" />
              <span class="section-title">档案信息</span>
              <span class="section-badge">{{ archiveFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="档案编号">
              {{ mediaData.archiveCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否归档">
              {{ selectDictLabel(isArchivedOptions, mediaData.isArchived) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="归档时间" :span="2">
              {{ parseTime(mediaData.archivedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 文件信息 -->
        <el-collapse-item name="file" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-document section-icon" />
              <span class="section-title">文件信息</span>
              <span class="section-badge">{{ fileFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="文件标识">
              {{ mediaData.fileIdentity || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="文件名称">
              {{ mediaData.fileName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ formatFileSize(mediaData.fileSize) }}
            </el-descriptions-item>
            <el-descriptions-item label="文件类型">
              {{ mediaData.fileType || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="MIME类型">
              {{ mediaData.contentType || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="文件MD5">
              {{ mediaData.fileMd5 || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="存储路径" :span="2">
              {{ mediaData.filePath || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 存储信息 -->
        <el-collapse-item name="storage" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-cloudy section-icon" />
              <span class="section-title">存储信息</span>
              <span class="section-badge">{{ storageFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="存储方式">
              {{ selectDictLabel(storageTypeOptions, mediaData.storageType) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否上传至存储">
              {{ selectDictLabel(isSendToStorageOptions, mediaData.isSendToStorage) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="采集站编号">
              {{ mediaData.collectSiteNo || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="采集站名称">
              {{ mediaData.collectSiteName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否通知发送">
              {{ formatYesNo(mediaData.isNoticeSend) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 人员组织 -->
        <el-collapse-item name="personnel" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-user-solid section-icon" />
              <span class="section-title">人员组织</span>
              <span class="section-badge">{{ personnelFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="警员编号">
              {{ mediaData.policeNo || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="警员姓名">
              {{ mediaData.policeName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="警员身份证号">
              {{ mediaData.policeIdCard || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="单位编码">
              {{ mediaData.orgCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="单位名称">
              {{ mediaData.orgName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="单位简称">
              {{ mediaData.orgJc || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="单位全称" :span="2">
              {{ mediaData.orgFullName || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 关联信息 -->
        <el-collapse-item name="relation" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-link section-icon" />
              <span class="section-title">关联信息</span>
              <span class="section-badge">{{ relationFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="警情号">
              {{ mediaData.incidentCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="是否关联">
              {{ selectDictLabel(relationStatusOptions, mediaData.isIncidentAssociated) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="关联时间">
              {{ parseTime(mediaData.incidentAssociatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <!-- 系统信息 -->
        <el-collapse-item name="system" class="detail-section">
          <template slot="title">
            <div class="section-header">
              <i class="el-icon-setting section-icon" />
              <span class="section-title">系统信息</span>
              <span class="section-badge">{{ systemFieldCount }}项</span>
            </div>
          </template>
          <el-descriptions :column="2" border class="section-descriptions">
            <el-descriptions-item label="终端类型">
              {{ selectDictLabel(terminalTypeOptions, mediaData.terminalType) || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="执法仪编号">
              {{ mediaData.recorderNo || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="请求标识">
              {{ mediaData.requestIdentity || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="认证码">
              {{ mediaData.authKey || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="追溯码">
              {{ mediaData.traceCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="上传时间">
              {{ parseTime(mediaData.uploadTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="接收时间">
              {{ parseTime(mediaData.acquisitionTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

      </el-collapse>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="text" class="action-btn tertiary" size="small" @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getMediaPlayURL } from '@/api/evidence/evidence_manage_query_api'
import { selectDictLabel } from '@/utils/costum'

export default {
  name: 'MediaDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mediaData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 折叠面板状态（默认展开基础信息和执法信息）
      activeSections: ['basic', 'enforcement'],
      // 预览/播放相关
      imageUrl: '',
      mediaUrl: '',
      isPlaying: false,
      isLoadingPlayUrl: false,
      errorHandler: null,
      playerListeners: null,
      isDestroying: false,

      // 字典数据（组件内部管理）
      mediaCateOptions: [],
      videoClarityOptions: [],
      isNonEnforcementMediaOptions: [],
      isLockedOptions: [],
      isArchivedOptions: [],
      isSendToStorageOptions: [],
      storageTypeOptions: [],
      terminalTypeOptions: [],
      relationStatusOptions: [],
      mediaImportanceOptions: []
    }
  },
  computed: {
    // 基础信息分组字段数量
    basicFieldCount() {
      return 8
    },
    // 执法信息分组字段数量
    enforcementFieldCount() {
      return 9
    },
    // 档案信息分组字段数量
    archiveFieldCount() {
      return 3
    },
    // 文件信息分组字段数量
    fileFieldCount() {
      return 7
    },
    // 存储信息分组字段数量
    storageFieldCount() {
      return 5
    },
    // 人员组织分组字段数量
    personnelFieldCount() {
      return 7
    },
    // 关联信息分组字段数量
    relationFieldCount() {
      return 3
    },
    // 系统信息分组字段数量
    systemFieldCount() {
      return 7
    },
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    mediaCate() {
      return this.mediaData.mediaCate
    },
    // 是否是图片
    isImage() {
      return parseInt(this.mediaCate) === 1
    },
    // 是否是视频或音频
    isVideoOrAudio() {
      const cate = parseInt(this.mediaCate)
      return cate === 2 || cate === 3
    },
    // 是否显示预览区域
    showPreviewArea() {
      return this.isImage || this.isVideoOrAudio
    },
    // 是否显示播放按钮
    showPlayButton() {
      return this.isImage || this.isVideoOrAudio
    },
    playerTag() {
      return parseInt(this.mediaCate) === 2 ? 'audio' : 'video'
    },
    playerHeight() {
      return parseInt(this.mediaCate) === 2 ? 120 : 400
    },
    mediaMime() {
      return this.getMediaMime(this.mediaUrl)
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.reset()
      }
    }
  },
  created() {
    this.loadDictionaryOptions()
  },
  beforeDestroy() {
    this.destroyPlayer()
  },
  methods: {
    selectDictLabel,

    /** 加载字典数据 */
    async loadDictionaryOptions() {
      try {
        const [
          mediaCateRes,
          videoClarityRes,
          isNonEnforcementMediaRes,
          isLockedRes,
          isArchivedRes,
          isSendToStorageRes,
          storageTypeRes,
          terminalTypeRes,
          relationStatusRes,
          mediaImportanceRes
        ] = await Promise.all([
          this.getDicts('evidence_media_type'),
          this.getDicts('video_clarity'),
          this.getDicts('is_non_enforcement_media'),
          this.getDicts('is_locked'),
          this.getDicts('is_archived'),
          this.getDicts('is_send_to_storage'),
          this.getDicts('evidence_storage_type'),
          this.getDicts('terminal_type'),
          this.getDicts('relation_status'),
          this.getDicts('media_importance')
        ])

        this.mediaCateOptions = mediaCateRes.data || []
        this.videoClarityOptions = videoClarityRes.data || []
        this.isNonEnforcementMediaOptions = isNonEnforcementMediaRes.data || []
        this.isLockedOptions = isLockedRes.data || []
        this.isArchivedOptions = isArchivedRes.data || []
        this.isSendToStorageOptions = isSendToStorageRes.data || []
        this.storageTypeOptions = storageTypeRes.data || []
        this.terminalTypeOptions = terminalTypeRes.data || []
        this.relationStatusOptions = relationStatusRes.data || []
        this.mediaImportanceOptions = mediaImportanceRes.data || []
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },

    // 播放/预览按钮
    handlePlay() {
      if (this.isPlaying) {
        this.handleStop()
        return
      }

      const mediaId = this.mediaData?.mediaId
      if (!mediaId) {
        this.$message.warning('无法获取媒体ID')
        return
      }

      this.isLoadingPlayUrl = true

      getMediaPlayURL(mediaId)
        .then((response) => {
          if (response.code === 200 && response.data) {
            const playUrl = response.data.playUrl || response.data

            if (this.isImage) {
              this.imageUrl = playUrl
            } else if (this.isVideoOrAudio) {
              this.mediaUrl = playUrl
              this.initPlayer()
            }

            this.isPlaying = true
          } else {
            this.$message.warning(response.msg || '获取播放地址失败')
          }
        })
        .catch((error) => {
          console.error('获取播放地址异常:', error)
          this.$message.error('获取播放地址异常')
        })
        .finally(() => {
          this.isLoadingPlayUrl = false
        })
    },

    // 停止播放
    handleStop() {
      this.destroyPlayer()
      this.isPlaying = false
      this.imageUrl = ''
      this.mediaUrl = ''
    },

    // 初始化播放器
    initPlayer() {
      try {
        const mediaElement = this.$refs.mediaPlayer

        if (!mediaElement) {
          console.error('媒体元素未找到')
          return
        }

        this.removePlayerListeners()

        mediaElement.src = this.mediaUrl
        if (typeof mediaElement.load === 'function') {
          mediaElement.load()
        }

        this.playerListeners = {
          loadstart: () => console.log('媒体开始加载'),
          loadeddata: () => console.log('媒体数据加载完成'),
          play: () => console.log('媒体开始播放'),
          pause: () => console.log('媒体暂停'),
          ended: () => {
            console.log('媒体播放结束')
            this.isPlaying = false
          },
          error: () => {
            if (this.isDestroying) return
            const error = mediaElement.error
            console.error('媒体播放错误:', error)
            this.$message.error('媒体播放失败')
          }
        }

        Object.keys(this.playerListeners).forEach((event) => {
          mediaElement.addEventListener(event, this.playerListeners[event])
        })

        this.errorHandler = this.playerListeners.error

        const playPromise = mediaElement.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('自动播放失败:', error)
            this.$message.warning('自动播放失败，请手动点击播放')
          })
        }
      } catch (error) {
        console.error('初始化播放器失败:', error)
        this.$message.error('初始化播放器失败')
      }
    },

    removePlayerListeners() {
      if (!this.$refs.mediaPlayer || !this.playerListeners) {
        return
      }
      try {
        Object.keys(this.playerListeners).forEach((event) => {
          this.$refs.mediaPlayer.removeEventListener(event, this.playerListeners[event])
        })
      } catch (e) {
        // Ignore cleanup errors
      } finally {
        this.playerListeners = null
      }
    },

    destroyPlayer() {
      if (!this.$refs.mediaPlayer) {
        return
      }
      try {
        this.isDestroying = true
        this.removePlayerListeners()

        const player = this.$refs.mediaPlayer
        player.pause()
        player.removeAttribute('src')
        if (typeof player.load === 'function') {
          player.load()
        }

        this.isDestroying = false
      } catch (error) {
        console.error('销毁播放器失败:', error)
        this.isDestroying = false
      }
    },

    reset() {
      this.handleStop()
    },

    handleClose() {
      this.reset()
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    handleImageError() {
      this.$message.error('图片加载失败')
    },

    formatFileSize(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const size = Number(value) * 1024
      if (!size) return '-'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let index = 0
      let current = size
      while (current >= 1024 && index < units.length - 1) {
        current /= 1024
        index++
      }
      return `${current.toFixed(2)} ${units[index]}`
    },

    formatYesNo(value) {
      if (value === 1) return '是'
      if (value === 0) return '否'
      return '-'
    },

    formatDuration(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const durationMs = Number(value)
      if (!durationMs) return '-'
      const seconds = Math.floor(durationMs / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
      }
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
    },

    formatExpiryTime(value) {
      const timeStr = this.parseTime(value)
      if (timeStr === '2999-01-01 08:00:00' || timeStr === '2999-01-01 00:00:00') {
        return '永久'
      }
      return timeStr
    },

    getMediaMime(url) {
      if (!url) {
        return parseInt(this.mediaCate) === 2 ? 'audio/mpeg' : 'video/mp4'
      }
      const extension = url.split('.').pop().split('?')[0].toLowerCase()

      if (parseInt(this.mediaCate) === 2) {
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
.media-detail-container {
  display: flex;
  flex-direction: column;
}

.media-preview-section {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview-wrapper {
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.media-preview-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.video-preview-wrapper {
  background: #000;
  min-height: 300px;
}

.player-wrapper {
  width: 100%;
}

.media-player {
  width: 100%;
  background: #000;
  outline: none;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.placeholder-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.preview-placeholder p {
  margin: 0;
  font-size: 14px;
}

.play-button-area {
  margin: -10px 0 20px;
  text-align: center;
}

/* 移除 .media-descriptions 和 .dialog-footer 样式，使用全局样式 */
/* 这些样式已在 src/styles/components/dialogs.scss 和 forms.scss 中统一定义 */
</style>
