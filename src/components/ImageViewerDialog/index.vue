<template>
  <el-dialog
    title="图片预览"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="image-viewer-container">
      <div class="toolbar">
        <el-button
          type="primary"
          size="small"
          :disabled="!imageUrl"
          @click="handleOpenOriginal"
        >
          查看原图
        </el-button>
        <el-button
          size="small"
          :disabled="!loadError"
          @click="handleRetry"
        >
          重试
        </el-button>
      </div>

      <div class="image-section">
        <div class="image-wrapper">
          <img
            class="preview-image"
            :src="imageUrl"
            alt="图片预览"
            @load="handleImgLoad"
            @error="handleImgError"
          />

          <div v-if="loading" class="image-overlay">
            <div class="image-loading">
              <i class="el-icon-loading"></i>
              <span class="loading-text">加载中...</span>
            </div>
          </div>

          <div v-else-if="loadError" class="image-overlay">
            <div class="image-error">
              <i class="el-icon-warning-outline"></i>
              <span class="error-text">图片加载失败</span>
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
export default {
  name: "ImageViewerDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    initialUrl: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      imageUrl: "",
      loading: false,
      loadError: false,
      retryKey: 0,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      },
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.setImageUrl(this.initialUrl);
      } else {
        this.resetState();
      }
    },
    initialUrl(val) {
      if (this.visible) {
        this.setImageUrl(val);
      }
    },
  },
  methods: {
    setImageUrl(url) {
      this.imageUrl = url || "";
      this.loadError = false;
      this.loading = !!this.imageUrl;
    },
    handleImgLoad() {
      this.loading = false;
      this.loadError = false;
    },
    handleImgError() {
      this.loading = false;
      this.loadError = true;
    },
    handleRetry() {
      if (!this.imageUrl) {
        return;
      }
      this.loading = true;
      this.loadError = false;
      this.retryKey += 1;
      const sep = this.imageUrl.includes("?") ? "&" : "?";
      this.imageUrl = this.imageUrl.split("#")[0].replace(/([?&])_t=\d+(&?)/, "$1").replace(/\?$/, "");
      this.imageUrl = `${this.imageUrl}${sep}_t=${Date.now()}_${this.retryKey}`;
    },
    handleOpenOriginal() {
      if (!this.imageUrl) {
        return;
      }
      window.open(this.imageUrl, "_blank");
    },
    resetState() {
      this.imageUrl = "";
      this.loading = false;
      this.loadError = false;
      this.retryKey = 0;
    },
    handleClose() {
      this.resetState();
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.image-viewer-container {
  padding: 10px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.image-section {
  min-height: 520px;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-loading,
.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
}

.loading-text,
.error-text {
  font-size: 14px;
}

.image-wrapper {
  width: 100%;
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.dialog-footer {
  text-align: right;
  padding: 10px 0;
}
</style>
