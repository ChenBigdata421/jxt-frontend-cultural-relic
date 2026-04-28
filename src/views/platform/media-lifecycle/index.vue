<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
          <template #title>
            <div style="line-height: 1.6;">
              <strong>媒体维护 - 生命周期配置管理</strong><br>
              管理 <code>lifecycle.yml</code> 配置文件。修改配置并保存后，系统将自动重新加载配置并重启定时调度器。
            </div>
          </template>
        </el-alert>

        <div v-loading="loading">
          <el-form ref="configForm" :model="form" label-position="right">
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
                  <el-col :span="12">
                    <el-form-item label="启用调度器" prop="enabled">
                      <el-switch v-model="form.enabled" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 档案生命周期 -->
              <el-collapse-item name="archive" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-folder section-icon" />
                    <span class="section-title">档案生命周期</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="保留天数" prop="archive.grace_period_days">
                      <el-input-number v-model="form.archive.grace_period_days" :min="0" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="批量大小" prop="archive.scan_batch_size">
                      <el-input-number v-model="form.archive.scan_batch_size" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="预警天数" prop="archive.warning_days">
                      <warning-days-input v-model="form.archive.warning_days" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 媒体生命周期 -->
              <el-collapse-item name="media" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-video-camera section-icon" />
                    <span class="section-title">媒体生命周期</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="保留天数" prop="media.grace_period_days">
                      <el-input-number v-model="form.media.grace_period_days" :min="0" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="批量大小" prop="media.scan_batch_size">
                      <el-input-number v-model="form.media.scan_batch_size" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="预警天数" prop="media.warning_days">
                      <warning-days-input v-model="form.media.warning_days" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="跳过已锁定" prop="media.skip_locked">
                      <el-switch v-model="form.media.skip_locked" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="跳过已关联" prop="media.skip_associated">
                      <el-switch v-model="form.media.skip_associated" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 物理删除 -->
              <el-collapse-item name="physicalDelete" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-delete section-icon" />
                    <span class="section-title">物理删除</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="启用物理删除" prop="physical_delete.enabled">
                      <el-switch v-model="form.physical_delete.enabled" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="软删后保留天数" prop="physical_delete.retention_days_after_soft_delete">
                      <el-input-number v-model="form.physical_delete.retention_days_after_soft_delete" :min="0" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="批量大小" prop="physical_delete.batch_size">
                      <el-input-number v-model="form.physical_delete.batch_size" :min="1" controls-position="right" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 调度器 Cron 配置 -->
              <el-collapse-item name="scheduler" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-time section-icon" />
                    <span class="section-title">调度器 Cron 配置</span>
                  </div>
                </template>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="时区" prop="scheduler.timezone">
                      <el-input v-model="form.scheduler.timezone" placeholder="如 Asia/Shanghai" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="含秒字段" prop="scheduler.cron_with_seconds">
                      <el-switch v-model="form.scheduler.cron_with_seconds" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider content-position="left">档案任务</el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="到期前预警扫描" prop="scheduler.archive_expiring_scan_cron">
                      <cron-picker v-model="form.scheduler.archive_expiring_scan_cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="已到期扫描" prop="scheduler.archive_expired_scan_cron">
                      <cron-picker v-model="form.scheduler.archive_expired_scan_cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="软删除" prop="scheduler.archive_soft_delete_cron">
                      <cron-picker v-model="form.scheduler.archive_soft_delete_cron" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider content-position="left">媒体任务</el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="到期前预警扫描" prop="scheduler.media_expiring_scan_cron">
                      <cron-picker v-model="form.scheduler.media_expiring_scan_cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="已到期扫描" prop="scheduler.media_expired_scan_cron">
                      <cron-picker v-model="form.scheduler.media_expired_scan_cron" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="软删除" prop="scheduler.media_soft_delete_cron">
                      <cron-picker v-model="form.scheduler.media_soft_delete_cron" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-divider content-position="left">物理删除</el-divider>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="物理删除" prop="scheduler.physical_delete_cron">
                      <cron-picker v-model="form.scheduler.physical_delete_cron" />
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
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getLifecycleConfig, updateLifecycleConfig } from '@/api/platform/media-lifecycle'
import CronPicker from '@/components/CronPicker'

// 预警天数标签输入子组件（使用 render 函数，兼容 runtime-only 构建）
const WarningDaysInput = {
  name: 'WarningDaysInput',
  props: {
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      inputValue: ''
    }
  },
  methods: {
    handleClose(tag) {
      const newVal = this.value.filter(v => v !== tag)
      this.$emit('input', newVal)
    },
    handleInputConfirm() {
      const val = parseInt(this.inputValue, 10)
      if (!isNaN(val) && val > 0 && !this.value.includes(val)) {
        const newVal = [...this.value, val].sort((a, b) => b - a)
        this.$emit('input', newVal)
      }
      this.inputValue = ''
    }
  },
  render(h) {
    const tags = this.value.map(tag =>
      h('el-tag', {
        key: tag,
        props: { closable: true, size: 'small' },
        on: { close: () => this.handleClose(tag) }
      }, [tag + '天'])
    )
    const input = h('el-input', {
      props: {
        value: this.inputValue,
        size: 'mini',
        placeholder: '天数'
      },
      style: { width: '80px' },
      on: {
        input: (val) => { this.inputValue = val },
        'keyup-enter-native': this.handleInputConfirm,
        blur: this.handleInputConfirm
      },
      nativeOn: {
        keyup: (e) => {
          if (e.key === 'Enter') this.handleInputConfirm()
        }
      }
    })
    return h('div', {
      style: 'display: flex; flex-wrap: wrap; align-items: center; gap: 4px;'
    }, [...tags, input])
  }
}

function defaultForm() {
  return {
    enabled: true,
    system_operator_id: 0,
    archive: {
      grace_period_days: 30,
      scan_batch_size: 100,
      warning_days: [30, 7]
    },
    media: {
      grace_period_days: 7,
      scan_batch_size: 200,
      warning_days: [30, 7],
      skip_locked: false,
      skip_associated: false
    },
    physical_delete: {
      enabled: false,
      retention_days_after_soft_delete: 90,
      batch_size: 100
    },
    scheduler: {
      timezone: 'Asia/Shanghai',
      cron_with_seconds: false,
      archive_expiring_scan_cron: '',
      archive_expired_scan_cron: '',
      archive_soft_delete_cron: '',
      media_expiring_scan_cron: '',
      media_expired_scan_cron: '',
      media_soft_delete_cron: '',
      physical_delete_cron: ''
    }
  }
}

export default {
  name: 'MediaLifecycle',
  components: { WarningDaysInput, CronPicker },
  data() {
    return {
      loading: false,
      saving: false,
      activeNames: ['basic', 'archive', 'media', 'physicalDelete', 'scheduler'],
      form: defaultForm()
    }
  },
  created() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      this.loading = true
      try {
        const resp = await getLifecycleConfig()
        if (resp && resp.code === 200 && resp.data) {
          const d = resp.data
          this.form = {
            enabled: d.enabled !== undefined ? d.enabled : true,
            system_operator_id: d.system_operator_id !== undefined ? d.system_operator_id : 0,
            archive: {
              grace_period_days: (d.archive && d.archive.grace_period_days !== undefined) ? d.archive.grace_period_days : 30,
              scan_batch_size: (d.archive && d.archive.scan_batch_size) || 100,
              warning_days: (d.archive && d.archive.warning_days) || [30, 7]
            },
            media: {
              grace_period_days: (d.media && d.media.grace_period_days !== undefined) ? d.media.grace_period_days : 7,
              scan_batch_size: (d.media && d.media.scan_batch_size) || 200,
              warning_days: (d.media && d.media.warning_days) || [30, 7],
              skip_locked: (d.media && d.media.skip_locked) || false,
              skip_associated: (d.media && d.media.skip_associated) || false
            },
            physical_delete: {
              enabled: (d.physical_delete && d.physical_delete.enabled) || false,
              retention_days_after_soft_delete: (d.physical_delete && d.physical_delete.retention_days_after_soft_delete !== undefined) ? d.physical_delete.retention_days_after_soft_delete : 90,
              batch_size: (d.physical_delete && d.physical_delete.batch_size) || 100
            },
            scheduler: {
              timezone: (d.scheduler && d.scheduler.timezone) || 'Asia/Shanghai',
              cron_with_seconds: (d.scheduler && d.scheduler.cron_with_seconds) || false,
              archive_expiring_scan_cron: (d.scheduler && d.scheduler.archive_expiring_scan_cron) || '',
              archive_expired_scan_cron: (d.scheduler && d.scheduler.archive_expired_scan_cron) || '',
              archive_soft_delete_cron: (d.scheduler && d.scheduler.archive_soft_delete_cron) || '',
              media_expiring_scan_cron: (d.scheduler && d.scheduler.media_expiring_scan_cron) || '',
              media_expired_scan_cron: (d.scheduler && d.scheduler.media_expired_scan_cron) || '',
              media_soft_delete_cron: (d.scheduler && d.scheduler.media_soft_delete_cron) || '',
              physical_delete_cron: (d.scheduler && d.scheduler.physical_delete_cron) || ''
            }
          }
        } else {
          this.msgError((resp && resp.msg) || '获取配置失败')
        }
      } catch (e) {
        this.msgError('获取配置失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      this.saving = true
      try {
        const resp = await updateLifecycleConfig(this.form)
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '配置保存成功，调度器已重启')
        } else {
          this.msgError((resp && resp.msg) || '保存失败')
        }
      } catch (e) {
        this.msgError('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },
    resetForm() {
      this.loadConfig()
    }
  }
}
</script>
