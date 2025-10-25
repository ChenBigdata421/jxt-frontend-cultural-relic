/**
 * WebSocket 客户端服务
 * 用于接收实时任务通知
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.messageHandlers = []
    this.isConnecting = false
    this.userID = null
  }

  /**
   * 连接WebSocket
   * @param {string} userID - 用户ID
   */
  connect(userID) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('[WebSocket] Already connected or connecting')
      return
    }

    this.userID = userID
    this.isConnecting = true

    // 构建WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws?user_id=${userID}`

    console.log('[WebSocket] Connecting to:', wsUrl)

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected successfully')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.notifyHandlers({ type: 'connected' })
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('[WebSocket] Received message:', message)
          this.notifyHandlers(message)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason)
        this.isConnecting = false
        this.ws = null
        this.notifyHandlers({ type: 'disconnected' })

        // 尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          this.reconnectTimer = setTimeout(() => {
            this.connect(this.userID)
          }, this.reconnectDelay)
        } else {
          console.log('[WebSocket] Max reconnect attempts reached')
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to create WebSocket:', error)
      this.isConnecting = false
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.reconnectAttempts = 0
    this.isConnecting = false
    console.log('[WebSocket] Disconnected')
  }

  /**
   * 发送消息
   * @param {object} message - 消息对象
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send message, not connected')
    }
  }

  /**
   * 添加消息处理器
   * @param {function} handler - 消息处理函数
   * @returns {function} 取消订阅函数
   */
  onMessage(handler) {
    this.messageHandlers.push(handler)

    // 返回取消订阅函数
    return () => {
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) {
        this.messageHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有消息处理器
   * @param {object} message - 消息对象
   */
  notifyHandlers(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('[WebSocket] Handler error:', error)
      }
    })
  }

  /**
   * 检查连接状态
   * @returns {boolean} 是否已连接
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// 创建单例
const websocketService = new WebSocketService()

export default websocketService

