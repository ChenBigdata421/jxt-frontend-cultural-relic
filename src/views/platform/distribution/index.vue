<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-row :gutter="10" class="mb8">
          <el-col :span="24">
            <el-alert
              title="配置分发（etcd）"
              type="info"
              :closable="false"
              description="用于手动触发配置/租户信息刷新到 etcd，并查看 etcd 可用状态。"
              show-icon
            />
          </el-col>
        </el-row>

        <el-row :gutter="10" class="mb8">
          <el-col :span="6">
            <el-card shadow="never">
              <div style="display:flex;align-items:center;gap:10px;">
                <div>etcd 状态：</div>
                <el-tag :type="availableTagType">{{ availableText }}</el-tag>
                <el-button size="mini" icon="el-icon-refresh" @click="loadStatus">刷新状态</el-button>
              </div>
            </el-card>
          </el-col>

          <el-col :span="18">
            <el-card shadow="never">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <el-select v-model="refreshType" placeholder="请选择刷新类型" style="width: 220px;">
                  <el-option label="all（默认）" value="all" />
                  <el-option label="configs" value="configs" />
                  <el-option label="tenants" value="tenants" />
                </el-select>

                <el-button v-permisaction="['platform:distribution:refresh']" type="primary" size="mini" icon="el-icon-refresh" :loading="refreshLoading" @click="doRefresh">
                  手动刷新
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { refreshDistribution, getDistributionStatus } from '@/api/platform/distribution'

export default {
  name: 'PlatformDistribution',
  data() {
    return {
      available: null,
      refreshType: 'all',
      loading: false,
      refreshLoading: false
    }
  },
  computed: {
    availableText() {
      if (this.available === true) return 'available'
      if (this.available === false) return 'unavailable'
      return 'unknown'
    },
    availableTagType() {
      if (this.available === true) return 'success'
      if (this.available === false) return 'danger'
      return 'info'
    }
  },
  created() {
    this.loadStatus()
  },
  methods: {
    async loadStatus() {
      this.loading = true
      try {
        const resp = await getDistributionStatus()
        if (resp && resp.code === 200 && resp.data) {
          this.available = resp.data.available
        } else {
          this.available = null
          this.msgError((resp && resp.msg) || '获取状态失败')
        }
      } catch (e) {
        this.available = null
        this.msgError('获取状态失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    async doRefresh() {
      try {
        this.refreshLoading = true
        const resp = await refreshDistribution({ type: this.refreshType })
        if (resp && resp.code === 200) {
          this.msgSuccess(resp.msg || '刷新完成')
          this.loadStatus()
        } else {
          this.msgError((resp && resp.msg) || '刷新失败')
        }
      } catch (e) {
        this.msgError('刷新失败：' + (e.message || '未知错误'))
      } finally {
        this.refreshLoading = false
      }
    }
  }
}
</script>
