<template>
  <div class="task-notification">
    <!-- 通知图标 -->
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
      <el-button
        icon="el-icon-bell"
        circle
        @click="showNotifications"
      />
    </el-badge>

    <!-- 通知列表对话框 -->
    <el-dialog
      title="任务通知"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleClose"
    >
      <div class="notification-list">
        <el-empty v-if="notifications.length === 0" description="暂无通知" />

        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)" :style="{ color: getNotificationColor(notification.type) }" />
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ getNotificationTitle(notification) }}</div>
            <div class="notification-desc">{{ getNotificationDesc(notification) }}</div>
            <div class="notification-time">{{ notification.timestamp }}</div>
          </div>
          <div class="notification-actions">
            <el-button
              v-if="!notification.read"
              type="text"
              size="small"
              @click.stop="markAsRead(notification)"
            >
              标记已读
            </el-button>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="markAllAsRead">全部标记为已读</el-button>
        <el-button @click="clearAll">清空通知</el-button>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import websocketService from '@/utils/websocket'

export default {
  name: 'TaskNotification',
  data() {
    return {
      dialogVisible: false,
      notifications: [],
      unsubscribe: null
    }
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.read).length
    }
  },
  mounted() {
    // 从localStorage加载通知
    this.loadNotifications()

    // 订阅WebSocket消息
    this.unsubscribe = websocketService.onMessage(this.handleWebSocketMessage)
  },
  beforeDestroy() {
    // 取消订阅
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  methods: {
    handleWebSocketMessage(message) {
      console.log('[TaskNotification] Received message:', message)

      // 处理不同类型的消息
      switch (message.type) {
        case 'task_created':
          this.addNotification({
            type: 'task_created',
            data: message.data,
            timestamp: message.timestamp,
            read: false
          })
          this.showToast('新任务', `您有新的待办任务：${message.data.task_name}`)
          break

        case 'task_assigned':
          this.addNotification({
            type: 'task_assigned',
            data: message.data,
            timestamp: message.timestamp,
            read: false
          })
          this.showToast('任务分配', `任务已分配给您：${message.data.task_name}`)
          break

        case 'task_completed':
          this.addNotification({
            type: 'task_completed',
            data: message.data,
            timestamp: message.timestamp,
            read: false
          })
          break

        case 'workflow_completed':
          this.addNotification({
            type: 'workflow_completed',
            data: message.data,
            timestamp: message.timestamp,
            read: false
          })
          this.showToast('流程完成', '工作流已完成')
          break

        case 'connected':
          console.log('[TaskNotification] WebSocket connected')
          break

        case 'disconnected':
          console.log('[TaskNotification] WebSocket disconnected')
          break
      }
    },

    addNotification(notification) {
      notification.id = Date.now() + Math.random()
      this.notifications.unshift(notification)

      // 限制通知数量
      if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50)
      }

      this.saveNotifications()
    },

    showNotifications() {
      this.dialogVisible = true
    },

    handleClose() {
      this.dialogVisible = false
    },

    handleNotificationClick(notification) {
      // 标记为已读
      this.markAsRead(notification)

      // 根据通知类型跳转
      if (notification.type === 'task_created' || notification.type === 'task_assigned') {
        this.$router.push('/processmanage/tasktodo')
      }
    },

    markAsRead(notification) {
      notification.read = true
      this.saveNotifications()
    },

    markAllAsRead() {
      this.notifications.forEach(n => {
        n.read = true
      })
      this.saveNotifications()
    },

    clearAll() {
      this.notifications = []
      this.saveNotifications()
    },

    getNotificationIcon(type) {
      const icons = {
        task_created: 'el-icon-document-add',
        task_assigned: 'el-icon-user',
        task_completed: 'el-icon-circle-check',
        workflow_completed: 'el-icon-success'
      }
      return icons[type] || 'el-icon-bell'
    },

    getNotificationColor(type) {
      const colors = {
        task_created: '#409EFF',
        task_assigned: '#E6A23C',
        task_completed: '#67C23A',
        workflow_completed: '#67C23A'
      }
      return colors[type] || '#909399'
    },

    getNotificationTitle(notification) {
      const titles = {
        task_created: '新任务',
        task_assigned: '任务分配',
        task_completed: '任务完成',
        workflow_completed: '流程完成'
      }
      return titles[notification.type] || '通知'
    },

    getNotificationDesc(notification) {
      const { type, data } = notification
      switch (type) {
        case 'task_created':
          return `您有新的待办任务：${data.task_name}`
        case 'task_assigned':
          return `任务已分配给您：${data.task_name}`
        case 'task_completed':
          return `任务已完成：${data.task_name}`
        case 'workflow_completed':
          return '工作流已完成'
        default:
          return '您有新的通知'
      }
    },

    showToast(title, message) {
      this.$notify({
        title: title,
        message: message,
        type: 'info',
        duration: 3000,
        position: 'top-right'
      })
    },

    loadNotifications() {
      try {
        const saved = localStorage.getItem('task_notifications')
        if (saved) {
          this.notifications = JSON.parse(saved)
        }
      } catch (error) {
        console.error('[TaskNotification] Failed to load notifications:', error)
      }
    },

    saveNotifications() {
      try {
        localStorage.setItem('task_notifications', JSON.stringify(this.notifications))
      } catch (error) {
        console.error('[TaskNotification] Failed to save notifications:', error)
      }
    }
  }
}
</script>

<style scoped>
.task-notification {
  display: inline-block;
}

.notification-badge {
  cursor: pointer;
}

.notification-list {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #F5F7FA;
}

.notification-item.unread {
  background-color: #ECF5FF;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.notification-desc {
  color: #606266;
  margin-bottom: 5px;
  font-size: 14px;
}

.notification-time {
  color: #909399;
  font-size: 12px;
}

.notification-actions {
  flex-shrink: 0;
  margin-left: 10px;
}
</style>

