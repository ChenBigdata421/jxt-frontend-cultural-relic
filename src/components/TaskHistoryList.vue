<template>
  <div class="task-history-list">
    <!-- 任务处理历史 -->
    <div v-if="taskHistory && taskHistory.length > 0" class="history-timeline">
      <div
        v-for="(history, index) in taskHistory"
        :key="index"
        class="timeline-item"
      >
        <div class="timeline-dot" :class="`status-${history.result === '通过' || history.result === '完成' ? 'approved' : 'rejected'}`" />
        <div class="timeline-content">
          <div class="timeline-card">
            <div class="timeline-header">
              <div class="timeline-title">
                <span class="timeline-number">{{ index + 1 }}</span>
                <span class="timeline-name">{{ history.taskName }}</span>
              </div>
              <span
                :class="['status-badge', `status-${history.result === '通过' || history.result === '完成' ? 'approved' : 'rejected'}`]"
              >
                {{ history.result }}
              </span>
            </div>

            <!-- 时间戳 -->
            <div v-if="history.completedAt" class="timeline-timestamp">
              <i class="el-icon-time" />
              {{ history.completedAt }}
            </div>

            <!-- 处理意见 -->
            <div v-if="history.comment" class="timeline-comment">
              <div class="comment-label">处理意见</div>
              <div class="comment-content">{{ history.comment }}</div>
            </div>

            <!-- 表单字段数据 -->
            <div v-if="history.output && Object.keys(history.output).length > 0" class="timeline-output">
              <div class="output-label">提交信息</div>
              <div class="output-grid">
                <div
                  v-for="(value, key) in history.output"
                  :key="key"
                  class="output-item"
                >
                  <span class="output-item-label">{{ getFieldLabel(key) }}</span>
                  <span class="output-item-value">
                    <!-- 媒体名称字段：显示为可点击链接 -->
                    <template v-if="isMediaNameField(key)">
                      <el-button
                        type="text"
                        class="media-link"
                        @click="handleMediaNameClick(value)"
                      >
                        {{ value || "-" }}
                      </el-button>
                    </template>
                    <!-- 布尔类型字段 -->
                    <template v-else-if="typeof value === 'boolean'">
                      <span :class="['boolean-badge', value ? 'true' : 'false']">
                        {{ value ? '是' : '否' }}
                      </span>
                    </template>
                    <!-- 默认文本显示 -->
                    <template v-else>
                      {{ value }}
                    </template>
                  </span>
                </div>
              </div>
            </div>

            <!-- 处理人信息 -->
            <div class="timeline-footer">
              <span class="footer-item">
                <i class="el-icon-user" />
                {{ getUserDisplayName(history.assignee) }}
              </span>
              <span class="footer-item">
                <i class="el-icon-office-building" />
                {{ getUserOrgName(history.assignee) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import workflowMixin from '@/mixins/workflowMixin'
import { getUser } from '@/api/admin/sys-user'
import { GetMediaByName } from '@/api/evidence/evidence_manage_query_api'

export default {
  name: 'TaskHistoryList',
  mixins: [workflowMixin],
  props: {
    // 任务历史数据
    taskHistory: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userCache: {}, // 用户信息缓存，避免重复请求
      // 媒体详情相关
      mediaDetailDialogVisible: false,
      currentMediaData: {}
    }
  },
  methods: {
    /**
     * 获取用户显示名称
     */
    getUserDisplayName(userId) {
      if (!userId) return '自动'
      if (this.userCache[userId]) {
        return this.userCache[userId].userName || '未知'
      }
      // 异步加载用户信息
      this.fetchUserInfo(userId)
      return '加载中...'
    },

    /**
     * 获取用户组织名称
     */
    getUserOrgName(userId) {
      if (!userId) return '自动'
      if (this.userCache[userId]) {
        return this.userCache[userId].orgFullName || '未知'
      }
      return '加载中...'
    },

    /**
     * 异步获取用户信息
     */
    async fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) {
        return
      }

      try {
        const response = await getUser(userId)
        if (response && response.code === 200 && response.data) {
          this.$set(this.userCache, userId, {
            userName: response.data.userName || '未知',
            orgFullName: response.data.orgFullName || '未知'
          })
          // 触发重新渲染
          this.$forceUpdate()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$set(this.userCache, userId, {
          userName: '获取失败',
          orgFullName: '获取失败'
        })
      }
    },

    /**
     * 处理媒体名称点击事件
     * @param {String} mediaName - 媒体名称
     */
    async handleMediaNameClick(mediaName) {
      if (!mediaName) {
        this.$message.warning('媒体名称不存在')
        return
      }

      try {
        // 根据媒体名称获取完整媒体数据
        const response = await GetMediaByName(mediaName)

        if (response.code === 200 && response.data) {
          this.currentMediaData = response.data
          // 触发父组件显示媒体详情对话框
          this.$emit('show-media-detail', response.data)
        } else {
          this.$message.warning(response.msg || '获取媒体详情失败')
        }
      } catch (error) {
        console.error('获取媒体详情失败:', error)
        this.$message.error('获取媒体详情失败')
      }
    },

    /**
     * 判断是否为媒体名称字段
     */
    isMediaNameField(key) {
      return key === 'mediaName' || key === 'media_name'
    }
  }
}
</script>

<style scoped>
/* ==================== 历史时间线 ==================== */
.history-timeline {
  position: relative;
  padding-left: 32px;
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -32px;
  top: 20px;
  width: 2px;
  height: calc(100% + 4px);
  background: #E2E8F0;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #F8FAFC;
  z-index: 1;
}

.timeline-dot.status-approved {
  background: #22C55E;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

.timeline-dot.status-rejected {
  background: #EF4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
}

.timeline-content {
  flex: 1;
}

.timeline-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #CBD5E1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #0F172A;
  color: #F8FAFC;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.timeline-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.status-badge.status-approved {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* ==================== 时间线内容 ==================== */
.timeline-timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 16px;
}

.timeline-timestamp i {
  font-size: 14px;
  color: #94A3B8;
}

.timeline-comment,
.timeline-output {
  margin-bottom: 16px;
}

.comment-label,
.output-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comment-content {
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 8px;
  color: #475569;
  line-height: 1.6;
  border-left: 3px solid #0369A1;
}

.output-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.output-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.output-item:hover {
  background: #F1F5F9;
}

.output-item-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
}

.output-item-value {
  font-size: 14px;
  color: #0F172A;
  word-break: break-word;
}

.boolean-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.boolean-badge.true {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.boolean-badge.false {
  background: rgba(148, 163, 184, 0.1);
  color: #64748B;
}

.media-link {
  padding: 0;
  color: #0369A1;
  font-weight: 500;
  transition: color 0.2s ease;
}

.media-link:hover {
  color: #075985;
  text-decoration: underline;
}

.timeline-footer {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
}

.footer-item i {
  font-size: 14px;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .output-grid {
    grid-template-columns: 1fr;
  }

  .timeline-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
