<template>
  <div class="login-container">
    <div id="particles-js" />
    <div class="login-weaper animated bounceInDown">
      <div class="login-left">
        <div class="login-time" v-text="currentTime" />
        <img :src="logoUrl" alt="logo" class="img">
        <p class="title" v-text="appName" />
      </div>
      <div class="login-border">
        <div class="login-main">
          <div class="login-title">用户登录</div>
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            autocomplete="on"
            label-position="left"
          >
            <el-form-item prop="userName">
              <span class="svg-container">
                <i class="el-icon-user" />
              </span>
              <el-input
                ref="userName"
                v-model="loginForm.userName"
                placeholder="用户名"
                name="userName"
                type="text"
                tabindex="1"
                autocomplete="on"
              />
            </el-form-item>

            <el-tooltip
              v-model="capsTooltip"
              content="Caps lock is On"
              placement="right"
              manual
            >
              <el-form-item prop="password">
                <span class="svg-container">
                  <svg-icon icon-class="password" />
                </span>
                <el-input
                  :key="passwordType"
                  ref="password"
                  v-model="loginForm.password"
                  :type="passwordType"
                  placeholder="密码"
                  name="password"
                  tabindex="2"
                  autocomplete="on"
                  @keyup.native="checkCapslock"
                  @blur="capsTooltip = false"
                  @keyup.enter.native="handleLogin"
                />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon
                    :icon-class="
                      passwordType === 'password' ? 'eye' : 'eye-open'
                    "
                  />
                </span>
              </el-form-item>
            </el-tooltip>
            <el-form-item prop="code" style="width: 66%; float: left">
              <span class="svg-container">
                <svg-icon icon-class="validCode" />
              </span>
              <el-input
                ref="userName"
                v-model="loginForm.code"
                placeholder="验证码"
                name="userName"
                type="text"
                tabindex="3"
                maxlength="5"
                autocomplete="off"
                style="width: 75%"
                @keyup.enter.native="handleLogin"
              />
            </el-form-item>
            <div
              class="login-code"
              style="
                cursor: pointer;
                width: 30%;
                height: 48px;
                float: right;
                background-color: #f0f1f5;
              "
            >
              <img
                style="
                  height: 48px;
                  width: 100%;
                  border: 1px solid rgba(0, 0, 0, 0.1);
                  border-radius: 5px;
                "
                :src="codeUrl"
                @click="getCode"
              >
            </div>

            <el-button
              :loading="loading"
              type="primary"
              style="width: 100%; padding: 12px 20px; margin-bottom: 30px"
              @click.native.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form>
        </div>
      </div>
    </div>

    <el-dialog
      title="Or connect with"
      :visible.sync="showDialog"
      :close-on-click-modal="false"
    >
      Can not be simulated on local, so please combine you own business
      simulation! ! !
      <br><br><br>
      <social-sign />
    </el-dialog>

    <div
      id="bottom_layer"
      class="s-bottom-layer s-isindex-wrap"
      style="visibility: visible; width: 100%"
    >
      <div class="s-bottom-layer-content">
        <div class="lh">
          <a
            class="text-color"
            href="https://beian.miit.gov.cn"
            target="_blank"
          >沪ICP备XXXXXXXXX号-1</a>
        </div>
        <div class="open-content-info">
          <div class="tip-hover-panel" style="top: -18px; right: -12px">
            <div class="rest_info_tip">
              <div class="tip-wrapper">
                <div class="lh tip-item" style="display: none">
                  <a
                    class="text-color"
                    href="https://beian.miit.gov.cn"
                    target="_blank"
                  >沪ICP备XXXXXXXXX号-1</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from '@/api/login'
import moment from 'moment'
import SocialSign from './components/SocialSignin'

export default {
  name: 'Login',
  components: { SocialSign },
  data() {
    return {
      codeUrl: '',
      cookiePassword: '',
      refreshParticles: true,
      loginForm: {
        userName: 'admin',
        password: '123456',
        rememberMe: false,
        code: '',
        uuid: ''
      },
      loginRules: {
        userName: [
          { required: true, trigger: 'blur', message: '用户名不能为空' }
        ],
        password: [
          { required: true, trigger: 'blur', message: '密码不能为空' }
        ],
        code: [
          { required: true, trigger: 'change', message: '验证码不能为空' }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      currentTime: null,
      sysInfo: {}
    }
  },
  computed: {
    // 根据构建模式选择 Logo 键名
    logoUrl() {
      if (process.env.VUE_APP_MODE === 'platform') {
        return this.sysInfo.console_app_logo || ''
      } else {
        return this.sysInfo.sys_app_logo || ''
      }
    },
    // 根据构建模式选择系统名称键名
    appName() {
      if (process.env.VUE_APP_MODE === 'platform') {
        return this.sysInfo.console_app_name || ''
      } else {
        return this.sysInfo.sys_app_name || ''
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCurrentTime()
    this.getSystemSetting()
  },
  mounted() {
    if (this.loginForm.userName === '') {
      this.$refs.userName.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
    window.addEventListener('resize', () => {
      this.refreshParticles = false
      this.$nextTick(() => (this.refreshParticles = true))
    })
  },
  destroyed() {
    clearInterval(this.timer)
    window.removeEventListener('resize', () => {})
  },
  methods: {
    getSystemSetting() {
      this.$store.dispatch('system/settingDetail').then((ret) => {
        this.sysInfo = ret || {}
        // 根据模式设置页面标题
        if (process.env.VUE_APP_MODE === 'platform') {
          document.title = ret.console_app_name || '平台管控'
        } else {
          document.title = ret.sys_app_name || '业务管理'
        }
      })
    },
    getCurrentTime() {
      this.timer = setInterval((_) => {
        this.currentTime = moment().format('YYYY-MM-DD HH时mm分ss秒')
      }, 1000)
    },
    getCode() {
      getCodeImg().then((res) => {
        if (res !== undefined) {
          this.codeUrl = res.data
          this.loginForm.uuid = res.id
        }
      })
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && key >= 'a' && key <= 'z') ||
          (!shiftKey && key >= 'A' && key <= 'Z')
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router
                .push({ path: this.redirect || '/', query: this.otherQuery })
                .catch(() => {})
            })
            .catch(() => {
              this.loading = false
              this.getCode()
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
// 导入设计系统变量
@import "@/styles/tokens/index.scss";

// ============================================
// JXT 数字证据管理平台 - 登录页样式
// ============================================

// 底部备案信息
#bottom_layer {
  visibility: hidden;
  width: 3000px;
  position: fixed;
  z-index: 302;
  bottom: 0;
  left: 0;
  height: 39px;
  padding-top: 1px;
  zoom: 1;
  margin: 0;
  line-height: 39px;
}

#bottom_layer .lh {
  display: inline-block;
  margin-right: 14px;
}

#bottom_layer .lh .emphasize {
  text-decoration: underline;
  font-weight: 700;
}

#bottom_layer .lh:last-child {
  margin-left: -2px;
  margin-right: 0;
}

#bottom_layer .lh.activity {
  font-weight: 700;
  text-decoration: underline;
}

#bottom_layer a {
  font-size: 12px;
  text-decoration: none;
}

#bottom_layer .text-color {
  color: rgba(255, 255, 255, 0.65);
}

#bottom_layer .aria-img {
  width: 49px;
  height: 20px;
  margin-bottom: -5px;
}

#bottom_layer a:hover {
  color: #fff;
}

#bottom_layer .s-bottom-layer-content {
  margin: 0 17px;
  text-align: center;
}

#bottom_layer .s-bottom-layer-content .auto-transform-line {
  display: inline;
}

#bottom_layer .s-bottom-layer-content .auto-transform-line:first-child {
  margin-right: 14px;
}

.s-bottom-space {
  position: static;
  width: 100%;
  height: 40px;
  margin: 23px auto 12px;
}

#bottom_layer .open-content-info a:hover {
  color: #fff;
}

#bottom_layer .open-content-info .text-color {
  color: rgba(255, 255, 255, 0.65);
}

.open-content-info {
  position: relative;
  display: inline-block;
  width: 20px;
}

.open-content-info > span {
  cursor: pointer;
  font-size: 14px;
}

.open-content-info > span:hover {
  color: #fff;
}

.open-content-info .tip-hover-panel {
  position: absolute;
  display: none;
  padding-bottom: 18px;
}

.open-content-info .tip-hover-panel .rest_info_tip {
  max-width: 560px;
  padding: 8px 12px 8px 12px;
  background: #fff;
  border-radius: $radius-md;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: $shadow-md;
  text-align: left;
}

.open-content-info .tip-hover-panel .rest_info_tip .tip-wrapper {
  white-space: nowrap;
  line-height: 20px;
}

.open-content-info .tip-hover-panel .rest_info_tip .tip-wrapper .tip-item {
  height: 20px;
  line-height: 20px;
}

.open-content-info
  .tip-hover-panel
  .rest_info_tip
  .tip-wrapper
  .tip-item:last-child {
  margin-right: 0;
}

@media screen and (max-width: 515px) {
  .open-content-info {
    width: 16px;
  }
  .open-content-info .tip-hover-panel {
    right: -16px !important;
  }
}

// ============================================
// 登录容器
// ============================================
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  background: linear-gradient(135deg, $law-login-bg-start 0%, $law-login-bg-end 100%);
  background-size: cover;
  background-position: 50%;
}

#particles-js {
  z-index: 1;
  width: 100%;
  height: 100%;
  position: absolute;
}

// ============================================
// 登录卡片
// ============================================
.login-weaper {
  margin: 0 auto;
  width: 1000px;
  max-width: 90%;
  border-radius: $radius-lg;
  box-shadow: $shadow-login-card;
  z-index: 1000;
  display: flex;
  overflow: hidden;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================
// 左侧品牌区
// ============================================
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 500px;
  padding: $spacing-10;
  background: rgba(26, 95, 122, 0.25);
  backdrop-filter: blur(10px);
  color: #fff;

  .login-time {
    position: absolute;
    left: $spacing-6;
    top: $spacing-6;
    @include text-base;
    color: #fff;
    opacity: 0.9;
    font-weight: $font-weight-medium;
  }

  .img {
    width: 240px;
    height: 90px;
    border-radius: $radius-sm;
    object-fit: contain;
    margin-bottom: $spacing-6;
  }

  .title {
    @include text-base;
    text-align: center;
    color: #fff;
    letter-spacing: 2px;
    font-weight: $font-weight-semibold;
  }
}

// ============================================
// 右侧登录表单区
// ============================================
.login-border {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 500px;
  background: $law-login-card-bg;
  backdrop-filter: blur(20px);
  padding: $spacing-10;
}

.login-main {
  margin: 0 auto;
  width: 75%;
}

.login-title {
  @include text-2xl;
  color: var(--law-gray-800, $law-gray-800);
  margin-bottom: $spacing-10;
  font-weight: $font-weight-semibold;
  text-align: center;
  letter-spacing: 4px;
}

// ============================================
// 表单样式
// ============================================
.login-container {
  ::v-deep .el-input {
    display: inline-block;
    height: 48px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: var(--law-gray-700, $law-gray-700);
      height: 48px;
      caret-color: var(--law-primary, $law-primary);
      @include text-base;
      transition: $transition-color;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px #fff inset !important;
        -webkit-text-fill-color: var(--law-gray-700, $law-gray-700) !important;
      }

      &::placeholder {
        color: var(--law-gray-400, $law-gray-400);
      }

      &:focus {
        outline: none;
      }
    }
  }

  .el-form-item {
    border: 1px solid var(--law-gray-300, $law-gray-300);
    background: rgba(255, 255, 255, 0.9);
    border-radius: $radius-sm;
    margin-bottom: $spacing-5;
    transition: $transition-base;

    &:hover {
      border-color: var(--law-gray-400, $law-gray-400);
    }

    &.is-error {
      border-color: var(--law-danger, $law-danger);
      background: var(--law-danger-bg, $law-danger-bg);
    }

    .el-form-item__error {
      position: absolute;
      bottom: -20px;
      left: 0;
      @include text-caption;
      color: var(--law-danger, $law-danger);
    }
  }
}

// ============================================
// 图标容器
// ============================================
.svg-container {
  padding: 12px 5px 12px 15px;
  color: var(--law-gray-500, $law-gray-500);
  vertical-align: middle;
  width: 40px;
  display: inline-block;
  transition: $transition-color;

  i,
  svg {
    font-size: 18px;
  }
}

// ============================================
// 密码显示/隐藏按钮
// ============================================
.show-pwd {
  position: absolute;
  right: 15px;
  top: 12px;
  font-size: 16px;
  color: var(--law-gray-500, $law-gray-500);
  cursor: pointer;
  user-select: none;
  transition: $transition-color;

  &:hover {
    color: var(--law-primary, $law-primary);
  }
}

// ============================================
// 验证码
// ============================================
.login-code {
  cursor: pointer;
  width: 30%;
  height: 48px;
  float: right;
  background-color: var(--law-gray-100, $law-gray-100);
  border-radius: $radius-sm;
  overflow: hidden;
  transition: $transition-base;

  &:hover {
    background-color: var(--law-gray-200, $law-gray-200);
  }

  img {
    height: 48px;
    width: 100%;
    border: 1px solid var(--law-gray-300, $law-gray-300);
    border-radius: $radius-sm;
    display: block;
  }
}

// ============================================
// 登录按钮
// ============================================
.login-container {
  ::v-deep .el-button {
    width: 100%;
    height: 48px;
    padding: $button-padding-lg;
    margin-top: $spacing-4;
    margin-bottom: $spacing-8;
    border-radius: $radius-sm;
    @include text-base;
    font-weight: $font-weight-medium;
    border: none;
    background: var(--law-primary, $law-primary);
    color: var(--law-primary-contrast, $law-primary-contrast);
    transition: $transition-button;

    &:hover,
    &:focus {
      background: var(--law-primary-light, $law-primary-light);
      transform: translateY(-1px);
      box-shadow: $shadow-button-hover;
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }

    &.is-loading {
      opacity: 0.8;
      pointer-events: none;
    }

    &.is-disabled {
      background: var(--law-gray-400, $law-gray-400);
      opacity: 0.6;
    }
  }
}

// ============================================
// 响应式设计
// ============================================
@media only screen and (max-width: 768px) {
  .login-weaper {
    width: 100%;
    max-width: 100%;
    padding: 0;
    box-sizing: border-box;
    box-shadow: none;
    border-radius: 0;
  }

  .login-main {
    width: 85%;
  }

  .login-left {
    display: none !important;
  }

  .login-border {
    width: 100%;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.98);
  }
}
</style>
