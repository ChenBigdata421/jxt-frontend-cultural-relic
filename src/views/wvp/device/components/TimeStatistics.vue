<template>
  <div id="timeStatistics" v-loading="loading">
    <el-dialog
      :title="title"
      width="60%"
      top="2rem"
      :close-on-click-modal="false"
      :visible.sync="showDialog"
      :destroy-on-close="true"
      @close="close"
    >
      <div style="margin-right: 20px;">
        <el-row type="flex" justify="end" align="middle" style="margin-bottom: 12px;">
          <el-button icon="el-icon-refresh" size="mini" @click="fetchData" style="margin-right: 12px;">刷新</el-button>
          <el-form :inline="true" size="mini">
            <el-form-item label="数量">
              <el-input-number v-model="count" :min="1" :max="500" @change="fetchData" />
            </el-form-item>
          </el-form>
        </el-row>

        <el-table
          :data="tableData"
          border
          stripe
          size="mini"
          height="400px"
          style="width: 100%;"
        >
          <el-table-column prop="time" label="时间" min-width="180" />
          <el-table-column prop="timeDiff" label="间隔(秒)" min-width="120" />
        </el-table>
      </div>
      <div style="margin-top: 12px; text-align: right;">
        <span>最大波动：{{ timeDiffDelta }} 秒</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getKeepaliveTimeStatistics, getRegisterTimeStatistics } from '@/api/wvp/device'

const apiMap = {
  'device/getKeepaliveTimeStatistics': getKeepaliveTimeStatistics,
  'device/getRegisterTimeStatistics': getRegisterTimeStatistics
}

export default {
  name: 'TimeStatistics',
  data() {
    return {
      title: null,
      url: null,
      deviceId: null,
      count: 50,
      showDialog: false,
      loading: false,
      list: []
    }
  },
  computed: {
    tableData() {
      return this.list.slice().reverse()
    },
    timeDiffDelta() {
      if (!this.list.length) return 0
      const nums = this.list
        .map(item => Number(item.timeDiff))
        .filter(v => !Number.isNaN(v))
      if (!nums.length) return 0
      const max = Math.max(...nums)
      const min = Math.min(...nums)
      return (max - min).toFixed(2)
    }
  },
  methods: {
    openDialog(title, url, deviceId, count = 50) {
      this.title = title
      this.url = url
      this.deviceId = deviceId
      this.count = count
      this.showDialog = true
      this.fetchData()
    },
    fetchData() {
      console.log(this.url)
      if (!this.url || !this.deviceId) return
      const apiFn = apiMap[this.url]
      if (!apiFn) return
      this.loading = true
      apiFn(this.deviceId, this.count).then(res => {
        this.list = res.data || res
      }).catch((error) => {
        this.$message.error({
          showClose: true,
          message: error.message || error
        })
      }).finally(() => {
        this.loading = false
      })
    },
    close() {
      this.title = null
      this.url = null
      this.deviceId = null
      this.list = []
      this.showDialog = false
      this.loading = false
    }
  }
}
</script>
