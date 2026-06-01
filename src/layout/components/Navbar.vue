<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb v-if="!topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="topNav" id="topmenu-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <system-clock id="system-clock" class="right-menu-item" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <task-notification id="task-notification" class="right-menu-item" />

      </template>

      <el-dropdown class="user-dropdown-container right-menu-item hover-effect" trigger="hover" @command="handleCommand">
        <el-tooltip :content="`组织：${orgName || '未知组织'}`" placement="left" :disabled="!orgName">
          <div class="user-dropdown-wrapper">
            <img :src="userAvatar" class="user-avatar">
            <span class="user-name">{{ userName }}</span>
            <i class="el-icon-caret-bottom dropdown-arrow" />
          </div>
        </el-tooltip>
        <el-dropdown-menu slot="dropdown" class="user-dropdown-menu">
          <el-dropdown-item command="profile">
            <svg-icon icon-class="user" class="menu-icon" />
            <span>个人中心</span>
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <svg-icon icon-class="exit" class="menu-icon" />
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import TaskNotification from '@/components/TaskNotification'
import SystemClock from '@/components/SystemClock'
import { getOrg } from '@/api/admin/sys-org'

export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    TaskNotification,
    SystemClock
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'appInfo',
      'name'
    ]),
    ...mapState('user', ['orgid']),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  data() {
    return {
      // 用户信息
      userName: '',
      userDept: '',
      userAvatar: '',
      orgName: ''
    }
  },
  mounted() {
    this.getUserInfo()
    this.loadOrgInfo()
  },
  methods: {
    getUserInfo() {
      // 从 store 获取用户信息
      const user = this.$store.state.user
      this.userName = user?.name || user?.userName || '管理员'
      this.userDept = user?.dept || user?.deptName || '系统管理员'
      // 优先使用 store 中的 avatar，如果没有则使用默认头像
      this.userAvatar = this.avatar || require('@/assets/logo/logo-1.png')
    },
    loadOrgInfo() {
      if (this.orgid) {
        getOrg(this.orgid)
          .then((response) => {
            if (response && response.code === 200 && response.data) {
              this.orgName = response.data.orgFullName || '未知组织'
            }
          })
          .catch((error) => {
            console.error('[Navbar] Failed to load org info:', error)
            this.orgName = '未知组织'
          })
      }
    },
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/profile/index')
          break
        case 'logout':
          this.logout()
          break
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('user/LogOut').then(() => {
          location.reload()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// 导入设计系统变量
@import "@/styles/tokens/index.scss";

// ============================================
// JXT 数字证据管理平台 - 顶部导航栏样式
// ============================================

.navbar {
  height: $law-nav-height;
  overflow: hidden;
  position: relative;
  background: var(--law-bg-card, $law-bg-card);
  border-bottom: 1px solid var(--law-nav-border, $law-nav-border);
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  padding: 0 $layout-padding;
  // 防止导航栏内容换行
  flex-wrap: nowrap;
  white-space: nowrap;
  min-width: 0;

  // ============================================
  // 汉堡菜单按钮
  // ============================================
  .hamburger-container {
    line-height: $law-nav-height;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: $transition-fast;
    -webkit-tap-highlight-color: transparent;
    width: 48px;
    margin-left: -$spacing-2;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  // ============================================
  // 面包屑导航
  // ============================================
  .breadcrumb-container {
    display: inline-flex;
    align-items: center;
    margin-left: $spacing-4;
    margin-right: $spacing-8; // 32px：确保菜单与右侧时间区域有足够的视觉间距
    // 防止换行
    white-space: nowrap;
    flex-shrink: 1;
    min-width: 0;
    // 限制最大宽度，留出右侧区域空间
    max-width: calc(100% - 480px);
    // 不使用 overflow: hidden，避免截断"更多菜单"文字
    // 可见菜单数量由 JS (setVisibleNumber) 动态控制
    overflow: visible;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  // ============================================
  // 右侧操作区
  // ============================================
  .right-menu {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: auto;
    gap: $spacing-2; // 按钮之间的间距
    // 防止右侧操作区换行
    flex-wrap: nowrap;
    white-space: nowrap;
    // 不允许收缩，确保图标始终可见
    flex-shrink: 0;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      height: 100%;
      min-width: 48px;
      width: auto;
      font-size: 18px;
      color: var(--law-nav-text, $law-nav-text);
      transition: $transition-fast;
      position: relative;

      // 确保图标按钮有足够的点击区域
      & > * {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.hover-effect {
        cursor: pointer;
        border-radius: $radius-sm;

        &:hover {
          background: var(--law-nav-hover-bg, $law-nav-hover-bg);
          color: var(--law-nav-text-hover, $law-nav-text-hover);
        }

        &:active {
          background: rgba(0, 0, 0, 0.08);
        }
      }
    }

    // ============================================
    // 用户下拉菜单（方案一：专业政务风格）
    // ============================================
    .user-dropdown-container {
      margin-left: $spacing-4;
      margin-right: 0;

      .user-dropdown-wrapper {
        display: flex;
        align-items: center;
        gap: $spacing-3;
        padding: $spacing-2 $spacing-3;
        cursor: pointer;
        transition: $transition-fast;
        border-radius: $radius-sm;
        min-width: auto;

        &:hover {
          background: var(--law-nav-hover-bg, $law-nav-hover-bg);

          .user-avatar {
            border-color: var(--law-primary, $law-primary);
          }

          .dropdown-arrow {
            color: var(--law-nav-text-hover, $law-nav-text-hover);
          }
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: $radius-sm; // 矩形圆角（8px）
          border: 2px solid var(--law-gray-300, $law-gray-300);
          object-fit: cover;
          transition: $transition-fast;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: $font-weight-medium;
          color: #1A5F7A;
          line-height: 1.2;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;

          .user-name {
            font-size: 13px;
            font-weight: $font-weight-medium;
            color: #1A5F7A;
            line-height: 1.2;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .user-dept {
            @include text-caption;
            color: var(--law-gray-500, $law-gray-500);
            line-height: 1.2;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .dropdown-arrow {
          font-size: 12px;
          color: var(--law-gray-600, $law-gray-600);
          transition: $transition-fast;
          flex-shrink: 0;
          margin-left: auto;
        }
      }
    }
  }
}

// ============================================
// 下拉菜单样式覆盖
// ============================================
::v-deep .el-dropdown-menu {
  margin-top: $spacing-3;
  padding: 0;
  border: 1px solid var(--law-gray-200, $law-gray-200);
  border-radius: $radius-md;
  box-shadow: $shadow-dropdown;
  background: var(--law-bg-card, $law-bg-card);
  min-width: 160px;
  overflow: hidden;

  .el-dropdown-menu__item {
    padding: $spacing-3 $spacing-4;
    border-radius: 0;
    @include text-base;
    color: var(--law-gray-700, $law-gray-700);
    transition: $transition-fast;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .menu-icon {
      font-size: 16px;
      color: var(--law-gray-600, $law-gray-600);
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }

    &:hover {
      background: var(--law-nav-hover-bg, $law-nav-hover-bg);
      color: var(--law-nav-text-active, $law-nav-text-active);

      .menu-icon {
        color: var(--law-primary, $law-primary);
      }
    }

    &.is-divided {
      margin-top: 0;
      border-top: 1px solid var(--law-gray-200, $law-gray-200);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: var(--law-gray-200, $law-gray-200);
      }
    }
  }
}
</style>
