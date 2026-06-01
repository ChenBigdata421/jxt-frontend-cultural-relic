<template>
  <div
    ref="container"
    style="width:100%; height: 100%; background-color: #000000;margin:0 auto;position: relative;"
    @dblclick="fullscreenSwich"
  >
    <div style="width:100%; padding-top: 56.25%; position: relative;" />
    <div ref="buttonsBox" class="buttons-box">
      <div class="buttons-box-left">
        <i v-if="!playing" class="el-icon-video-play jessibuca-btn" @click="playBtnClick" />
        <i v-if="playing" class="el-icon-video-pause jessibuca-btn" @click="pause" />
        <i class="el-icon-switch-button jessibuca-btn" @click="stop" />
        <template v-if="hasAudio">
          <i v-if="isNotMute" class="el-icon-microphone jessibuca-btn" @click="mute()" />
          <i v-if="!isNotMute" class="el-icon-turn-off-microphone jessibuca-btn" @click="cancelMute()" />
        </template>
        <span v-else class="jessibuca-badge">无音频</span>
      </div>
      <div class="buttons-box-right">
        <span class="jessibuca-btn">{{ kBps }} kb/s</span>
        <i
          class="el-icon-camera jessibuca-btn"
          style="font-size: 1rem !important"
          @click="screenshot"
        />
        <i class="el-icon-refresh jessibuca-btn" @click="playBtnClick" />
        <i class="el-icon-full-screen jessibuca-btn" @click="fullscreenSwich" />
      </div>
    </div>
  </div>
</template>

<script>
let instanceCounter = 0
const jessibucaPlayer = {}

export default {
  name: 'JessibucaPlayer',
  props: {
    videoUrl: { type: String, default: '' },
    hasAudio: { type: Boolean, default: true }
  },
  data() {
    return {
      instanceId: 'jessibuca_' + (instanceCounter++),
      playing: false,
      isNotMute: true,
      fullscreen: false,
      loaded: false,
      kBps: 0,
      currentUrl: ''
    }
  },
  destroyed() {
    if (jessibucaPlayer[this.instanceId]) {
      jessibucaPlayer[this.instanceId].destroy()
      delete jessibucaPlayer[this.instanceId]
    }
    this.playing = false
    this.loaded = false
  },
  methods: {
    _player() {
      return jessibucaPlayer[this.instanceId]
    },
    create() {
      if (typeof window.Jessibuca === 'undefined') {
        console.error('Jessibuca library not loaded')
        this.$emit('playerError', '播放器组件加载失败，请刷新页面重试')
        return
      }
      if (this._player()) {
        this._player().destroy()
      }
      if (this.$refs.container.getAttribute('data-jessibuca')) {
        this.$refs.container.removeAttribute('data-jessibuca')
      }

      const options = {
        container: this.$refs.container,
        videoBuffer: 0,
        isResize: true,
        useMSE: false,
        useWCS: false,
        text: '',
        controlAutoHide: true,
        debug: false,
        hotKey: true,
        decoder: '/static/js/jessibuca/decoder.js',
        isNotMute: true,
        timeout: 10,
        recordType: 'mp4',
        isFlv: false,
        forceNoOffscreen: true,
        hasAudio: this.hasAudio,
        heartTimeout: 5,
        heartTimeoutReplay: true,
        heartTimeoutReplayTimes: 3,
        hiddenAutoPause: false,
        isFullResize: false,
        keepScreenOn: true,
        loadingText: '请稍等, 视频加载中...',
        loadingTimeout: 10,
        loadingTimeoutReplay: true,
        loadingTimeoutReplayTimes: 3,
        operateBtns: {
          fullscreen: false,
          screenshot: false,
          play: false,
          audio: false,
          recorder: false
        },
        showBandwidth: false,
        supportDblclickFullscreen: false,
        useWebFullSreen: true,
        wasmDecodeErrorReplay: true,
        wcsUseVideoRender: true
      }

      jessibucaPlayer[this.instanceId] = new window.Jessibuca(options)

      const player = this._player()
      player.on('pause', () => {
        this.playing = false
        this.$emit('playStatusChange', false)
      })
      player.on('play', () => {
        this.playing = true
        this.$emit('playStatusChange', true)
      })
      player.on('fullscreen', (msg) => {
        this.fullscreen = msg
      })
      player.on('mute', (msg) => {
        this.isNotMute = !msg
      })
      player.on('kBps', (kBps) => {
        this.kBps = Math.round(kBps)
      })
      player.on('error', (msg) => {
        console.error('Jessibuca error:', msg)
        this.$emit('playerError', msg)
      })
      player.on('timeout', (msg) => {
        console.warn('Jessibuca timeout:', msg)
        this.$emit('playerTimeout', msg)
      })
    },
    playBtnClick() {
      if (this.currentUrl) {
        this.play(this.currentUrl)
      }
    },
    play(url) {
      if (!url) return
      this.currentUrl = url
      if (!this._player()) {
        this.create()
      }
      this._player().play(url)
    },
    pause() {
      if (this._player()) {
        this._player().pause()
      }
      this.playing = false
    },
    stop() {
      if (this._player()) {
        this._player().pause()
        this._player().clearView()
      }
      this.playing = false
    },
    screenshot() {
      if (this._player()) {
        this._player().screenshot()
      }
    },
    mute() {
      if (this._player()) {
        this._player().mute()
      }
    },
    cancelMute() {
      if (this._player()) {
        this._player().cancelMute()
      }
    },
    destroy() {
      if (this._player()) {
        this._player().destroy()
        delete jessibucaPlayer[this.instanceId]
      }
      this.playing = false
    },
    fullscreenSwich() {
      if (this._player()) {
        const isFull = document.fullscreenElement ||
          document.msFullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement || false
        this._player().setFullscreen(!isFull)
        this.fullscreen = !isFull
      }
    }
  }
}
</script>

<style scoped>
.buttons-box {
  width: 100%;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.7);
  position: absolute;
  display: flex;
  align-items: center;
  left: 0;
  bottom: 0;
  user-select: none;
  z-index: 10;
}

.jessibuca-btn {
  min-width: 44px;
  min-height: 44px;
  color: rgb(255, 255, 255);
  line-height: 36px;
  margin: 0 4px;
  padding: 0 8px;
  cursor: pointer;
  text-align: center;
  font-size: 0.9rem !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.jessibuca-badge {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  margin-left: 8px;
}

.buttons-box-right {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
}
</style>
