<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #title>
            <div style="line-height: 1.6;">
              <strong>统计配置 - 预聚合刷新管理</strong><br>
              修改配置并保存后，系统将自动重新加载配置并重启定时调度器。
            </div>
          </template>
        </el-alert>

        <!-- 配置编辑表单 -->
        <div v-loading="configLoading">
          <el-form ref="configForm" :model="form" label-position="right" label-width="100px">
            <el-collapse v-model="activeNames" class="form-collapse">
              <!-- 基本设置 -->
              <el-collapse-item name="basic" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-setting section-icon" />
                    <span class="section-title">基本设置</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="启用状态" prop="enabled">
                      <el-switch v-model="form.enabled" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 增量刷新 -->
              <el-collapse-item name="refresh" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-refresh section-icon" />
                    <span class="section-title">增量刷新</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Cron 表达式" prop="refresh.cron">
                      <cron-picker v-model="form.refresh.cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="窗口天数" prop="refresh.window_days">
                      <el-input-number v-model="form.refresh.window_days" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 兜底刷新 -->
              <el-collapse-item name="backfill" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-time section-icon" />
                    <span class="section-title">兜底刷新</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Cron 表达式" prop="backfill.cron">
                      <cron-picker v-model="form.backfill.cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="窗口天数" prop="backfill.window_days">
                      <el-input-number v-model="form.backfill.window_days" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 启动回填 -->
              <el-collapse-item name="startup" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-upload2 section-icon" />
                    <span class="section-title">启动回填</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-form-item label="回填天数" prop="startup.backfill_days">
                      <el-input-number v-model="form.startup.backfill_days" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-form>

          <div style="text-align: center; margin-top: 24px;">
            <el-button type="primary" icon="el-icon-check" :loading="saving" @click="submitForm">确 定</el-button>
            <el-button icon="el-icon-refresh-left" @click="resetForm">重 置</el-button>
          </div>
        </div>

        <el-divider />

        <!-- 手动刷新 + 刷新状态 -->
        <el-row :gutter="20">
          <!-- 手动刷新 -->
          <el-col :span="12">
            <el-card shadow="never" class="inner-card">
              <div slot="header" class="inner-card-header">
                <span><i class="el-icon-refresh" /> 手动刷新</span>
              </div>
              <el-form label-width="80px" size="small">
                <el-form-item label="日期范围">
                  <el-date-picker
                    v-model="refreshDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    style="width: 100%;"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    icon="el-icon-refresh"
                    :loading="refreshing"
                    :disabled="refreshing || !refreshDateRange"
                    @click="handleRefresh"
                  >
                    {{ refreshing ? '刷新中...' : '立即刷新' }}
                  </el-button>
                </el-form-item>
              </el-form>
              <el-alert type="warning" :closable="false" show-icon>
                <template slot="title">
                  手动刷新将遍历所有租户重建预聚合数据，耗时较长
                </template>
              </el-alert>
            </el-card>
          </el-col>

          <!-- 刷新状态 -->
          <el-col :span="12">
            <el-card shadow="never" class="inner-card">
              <div slot="header" class="inner-card-header">
                <span><i class="el-icon-info" /> 刷新状态</span>
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-refresh"
                  @click="loadRefreshStatus"
                >
                  刷新
                </el-button>
              </div>
              <div v-loading="statusLoading">
                <template v-if="refreshStatus">
                  <el-descriptions :column="1" border size="small">
                    <el-descriptions-item label="当前状态">
                      <el-tag :type="statusTagType" size="mini">
                        {{ statusLabel }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="最后刷新时间">
                      {{ refreshStatus.lastRefreshAt || '—' }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="refreshStatus.error" label="错误信息">
                      <span class="error-text">{{ refreshStatus.error }}</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </template>
                <el-empty v-else-if="!statusLoading" description="暂无刷新记录" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getStatsConfig, updateStatsConfig, triggerStatsRefresh, getRefreshStatus } from '@/api/platform/stats-config'
import CronPicker from '@/components/CronPicker'

/**
 * 将后端 6 位 cron（含秒）转为 CronPicker 5 位 cron
 * "0 0 * * * *" → "0 * * * *"
 * "0 0 3 ? * 0"  → "0 3 * * 0"（? 替换为 *，等效）
 */
function cronToPicker(val) {
  if (!val) return ''
  const parts = val.trim().split(/\s+/)
  if (parts.length === 6) {
    // 跳过秒字段，将 ? 替换为 *
    return parts.slice(1).map(p => (p === '?' ? '*' : p)).join(' ')
  }
  return val
}

/**
 * 将 CronPicker 5 位 cron 转为后端 6 位 cron（前补秒 "0"）
 * "0 * * * *" → "0 0 * * * *"
 */
function cronToBackend(val) {
  if (!val) return ''
  return '0 ' + val
}

function defaultForm() {
  return {
    enabled: true,
    refresh: {
      cron: '',
      window_days: 3
    },
    backfill: {
      cron: '',
      window_days: 30
    },
    startup: {
      backfill_days: 90
    }
  }
}

export default {
  name: 'PlatformStatsConfig',
  components: { CronPicker },
  data() {
    return {
      configLoading: false,
      saving: false,
      activeNames: ['basic', 'refresh', 'backfill', 'startup'],
      form: defaultForm(),
      // 手动刷新
      refreshDateRange: null,
      refreshing: false,
      // 刷新状态
      statusLoading: false,
      refreshStatus: null,
      statusPolling: null
    }
  },
  computed: {
    statusTagType() {
      if (!this.refreshStatus) return 'info'
      switch (this.refreshStatus.status) {
        case 'running': return 'warning'
        case 'success': return 'success'
        case 'failed': return 'danger'
        default: return 'info'
      }
    },
    statusLabel() {
      if (!this.refreshStatus) return '未知'
      switch (this.refreshStatus.status) {
        case 'idle': return '空闲'
        case 'running': return '运行中'
        case 'success': return '成功'
        case 'failed': return '失败'
        default: return this.refreshStatus.status
      }
    }
  },
  created() {
    this.loadConfig()
    this.loadRefreshStatus()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    // ==================== 配置加载与保存 ====================

    async loadConfig() {
      this.configLoading = true
      try {
        const res = await getStatsConfig()
        const d = res.data || res
        if (d) {
          this.form = {
            enabled: d.enabled !== undefined ? d.enabled : true,
            refresh: {
              cron: cronToPicker((d.refresh && d.refresh.cron) || ''),
              window_days: (d.refresh && d.refresh.window_days) || 3
            },
            backfill: {
              cron: cronToPicker((d.backfill && d.backfill.cron) || ''),
              window_days: (d.backfill && d.backfill.window_days) || 30
            },
            startup: {
              backfill_days: (d.startup && d.startup.backfill_days) || 90
            }
          }
        }
      } catch (err) {
        console.error('加载配置失败:', err)
        this.$message.error('加载配置失败')
      } finally {
        this.configLoading = false
      }
    },

    async submitForm() {
      this.saving = true
      try {
        const payload = {
          enabled: this.form.enabled,
          refresh: {
            cron: cronToBackend(this.form.refresh.cron),
            window_days: this.form.refresh.window_days
          },
          backfill: {
            cron: cronToBackend(this.form.backfill.cron),
            window_days: this.form.backfill.window_days
          },
          startup: {
            backfill_days: this.form.startup.backfill_days
          }
        }
        const resp = await updateStatsConfig(payload)
        if (resp && resp.code === 200) {
          this.$message.success(resp.msg || '配置保存成功，调度器已重启')
          this.loadConfig()
        } else {
          this.$message.error((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.$message.error('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },

    resetForm() {
      this.loadConfig()
    },

    // ==================== 手动刷新 ====================

    handleRefresh() {
      if (!this.refreshDateRange || this.refreshDateRange.length !== 2) {
        this.$message.warning('请选择日期范围')
        return
      }
      this.$confirm(
        `确认刷新 ${this.refreshDateRange[0]} 至 ${this.refreshDateRange[1]} 的预聚合数据？`,
        '手动刷新确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.doRefresh()
      }).catch(() => {})
    },
    async doRefresh() {
      this.refreshing = true
      try {
        await triggerStatsRefresh({
          startDate: this.refreshDateRange[0],
          endDate: this.refreshDateRange[1]
        })
        this.$message.success('刷新任务已提交')
        this.startPolling()
        this.loadRefreshStatus()
      } catch (err) {
        const msg = (err.response && err.response.data && err.response.data.msg) || err.message || '刷新失败'
        this.$message.error(msg)
      } finally {
        this.refreshing = false
      }
    },

    // ==================== 刷新状态 ====================

    async loadRefreshStatus() {
      this.statusLoading = true
      try {
        const res = await getRefreshStatus()
        this.refreshStatus = res.data || res
        if (this.refreshStatus && this.refreshStatus.isRefreshing) {
          this.startPolling()
        } else {
          this.stopPolling()
        }
      } catch (err) {
        console.error('加载刷新状态失败:', err)
      } finally {
        this.statusLoading = false
      }
    },

    startPolling() {
      if (this.statusPolling) return
      this.statusPolling = setInterval(() => {
        this.loadRefreshStatus()
      }, 3000)
    },
    stopPolling() {
      if (this.statusPolling) {
        clearInterval(this.statusPolling)
        this.statusPolling = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.inner-card {
  .inner-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    i {
      margin-right: 6px;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 8px;
  color: #409eff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

code {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.error-text {
  color: #f56c6c;
  font-size: 13px;
  word-break: break-all;
}

::v-deep {
  .el-divider__text {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
  }
}
</style>
