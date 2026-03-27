<template>
  <el-dialog
    title="文本预览"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="text-viewer-container">
      <div class="toolbar">
        <el-button
          type="primary"
          size="small"
          :disabled="!textUrl"
          @click="handleOpenOriginal"
        >
          查看原文件
        </el-button>
        <el-button size="small" :disabled="!loadError" @click="handleRetry">
          重试
        </el-button>
      </div>

      <div class="text-section">
        <div class="text-wrapper">
          <pre class="text-content">{{ textContent }}</pre>

          <div v-if="loading" class="text-overlay">
            <div class="text-loading">
              <i class="el-icon-loading" />
              <span class="loading-text">加载中...</span>
            </div>
          </div>

          <div v-else-if="loadError" class="text-overlay">
            <div class="text-error">
              <i class="el-icon-warning-outline" />
              <span class="error-text">{{ errorText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'TextViewerDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      textUrl: '',
      loading: false,
      loadError: false,
      errorText: '内容加载失败',
      textContent: '',
      retryKey: 0
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
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.setTextUrl(this.initialUrl)
      } else {
        this.resetState()
      }
    },
    initialUrl(val) {
      if (this.visible) {
        this.setTextUrl(val)
      }
    }
  },
  methods: {
    setTextUrl(url) {
      this.textUrl = url || ''
      this.textContent = ''
      this.loadError = false
      this.errorText = '内容加载失败'

      if (!this.textUrl) {
        this.loading = false
        return
      }

      this.loading = true
      this.loadText()
    },
    async loadText() {
      if (!this.textUrl) {
        return
      }

      const currentUrl = this.textUrl
      try {
        const resp = await request({
          url: currentUrl,
          method: 'get',
          responseType: 'text',
          transformResponse: [
            (data) => {
              return data
            }
          ]
        })

        if (currentUrl !== this.textUrl) {
          return
        }

        this.textContent = resp || ''
        this.loading = false
        this.loadError = false
      } catch (e) {
        if (currentUrl !== this.textUrl) {
          return
        }

        this.loading = false
        this.loadError = true
        const msg = e?.message || ''
        this.errorText = msg ? `内容加载失败：${msg}` : '内容加载失败'
      }
    },
    handleRetry() {
      if (!this.textUrl) {
        return
      }
      this.loading = true
      this.loadError = false
      this.errorText = '内容加载失败'
      this.retryKey += 1
      const sep = this.textUrl.includes('?') ? '&' : '?'
      this.textUrl = this.textUrl
        .split('#')[0]
        .replace(/([?&])_t=\d+(&?)/, '$1')
        .replace(/\?$/, '')
      this.textUrl = `${this.textUrl}${sep}_t=${Date.now()}_${this.retryKey}`
      this.loadText()
    },
    handleOpenOriginal() {
      if (!this.textUrl) {
        return
      }
      window.open(this.textUrl, '_blank')
    },
    resetState() {
      this.textUrl = ''
      this.loading = false
      this.loadError = false
      this.errorText = '内容加载失败'
      this.textContent = ''
      this.retryKey = 0
    },
    handleClose() {
      this.resetState()
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.text-viewer-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.text-section {
  width: 100%;
}

.text-wrapper {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #0b0f14;
  min-height: 420px;
  max-height: 60vh;
  overflow: auto;
}

.text-content {
  margin: 0;
  padding: 12px;
  color: #e5e7eb;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}

.text-loading,
.text-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
}

.loading-text,
.error-text {
  font-size: 14px;
}
</style>
