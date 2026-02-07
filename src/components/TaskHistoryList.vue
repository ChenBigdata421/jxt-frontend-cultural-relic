<template>
  <div>
    <!-- 任务处理历史 -->
    <div v-if="taskHistory && taskHistory.length > 0" style="margin-bottom: 20px">
      <el-timeline>
        <el-timeline-item
          v-for="(history, index) in taskHistory"
          :key="index"
          :timestamp="history.completedAt"
          placement="top"
        >
          <el-card shadow="hover" style="margin-bottom: 10px">
            <div
              slot="header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span style="font-weight: bold; font-size: 16px">
                {{ index + 1 }}. {{ history.taskName }}
              </span>
              <el-tag
                :type="
                  history.result === '通过' || history.result === '完成'
                    ? 'success'
                    : 'danger'
                "
                size="small"
              >
                {{ history.result }}
              </el-tag>
            </div>

            <!-- 处理意见 -->
            <div v-if="history.comment" style="margin-bottom: 15px">
              <div style="color: #909399; font-size: 12px; margin-bottom: 5px">
                处理意见：
              </div>
              <div
                style="
                  padding: 10px;
                  background-color: #f5f7fa;
                  border-radius: 4px;
                  color: #606266;
                "
              >
                {{ history.comment }}
              </div>
            </div>

            <!-- 表单字段数据 -->
            <div v-if="history.output && Object.keys(history.output).length > 0">
              <div style="color: #909399; font-size: 12px; margin-bottom: 5px">
                提交信息：
              </div>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item
                  v-for="(value, key) in history.output"
                  :key="key"
                  :label="getFieldLabel(key)"
                >
                  <template v-if="typeof value === 'boolean'">
                    <el-tag v-if="value" type="success">是</el-tag>
                    <el-tag v-else type="info">否</el-tag>
                  </template>
                  <template v-else>
                    {{ value }}
                  </template>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 处理人信息 -->
            <div style="margin-top: 10px; color: #909399; font-size: 12px">
              处理人：{{ getUserDisplayName(history.assignee) }}
              <span style="margin-left: 24px">
                部门：{{ getUserOrgName(history.assignee) }}
              </span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import workflowMixin from "@/mixins/workflowMixin";
import { getUser } from "@/api/admin/sys-user";

export default {
  name: "TaskHistoryList",
  mixins: [workflowMixin],
  props: {
    // 任务历史数据
    taskHistory: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      userCache: {}, // 用户信息缓存，避免重复请求
    };
  },
  methods: {
    /**
     * 获取用户显示名称
     */
    getUserDisplayName(userId) {
      if (!userId) return "自动";
      if (this.userCache[userId]) {
        return this.userCache[userId].userName || "未知";
      }
      // 异步加载用户信息
      this.fetchUserInfo(userId);
      return "加载中...";
    },

    /**
     * 获取用户组织名称
     */
    getUserOrgName(userId) {
      if (!userId) return "自动";
      if (this.userCache[userId]) {
        return this.userCache[userId].orgFullName || "未知";
      }
      return "加载中...";
    },

    /**
     * 异步获取用户信息
     */
    async fetchUserInfo(userId) {
      if (!userId || this.userCache[userId]) {
        return;
      }

      try {
        const response = await getUser(userId);
        if (response && response.code === 200 && response.data) {
          this.$set(this.userCache, userId, {
            userName: response.data.userName || "未知",
            orgFullName: response.data.orgFullName || "未知",
          });
          // 触发重新渲染
          this.$forceUpdate();
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.$set(this.userCache, userId, {
          userName: "获取失败",
          orgFullName: "获取失败",
        });
      }
    },
  },
};
</script>

<style scoped>
.el-timeline {
  padding-left: 0;
}
</style>
