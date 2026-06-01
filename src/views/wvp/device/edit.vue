<template>
  <div id="deviceEdit" v-loading="isLoging">
    <el-dialog
      title="设备编辑"
      width="40%"
      top="2rem"
      :close-on-click-modal="false"
      :visible.sync="showDialog"
      :destroy-on-close="true"
      @close="close()"
    >
      <div id="shared" style="margin-right: 50px;">
        <el-form ref="form" :rules="rules" :model="form" label-width="100px">
          <el-form-item label="设备编号" prop="deviceId">
            <el-input v-if="isEdit" v-model="form.deviceId" disabled />
            <el-input v-if="!isEdit" v-model="form.deviceId" clearable />
          </el-form-item>
          <el-form-item label="设备名称" prop="name">
            <el-input v-model="form.name" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" clearable />
          </el-form-item>
          <el-form-item label="收流IP" prop="sdpIp">
            <el-input v-model="form.sdpIp" type="sdpIp" clearable />
          </el-form-item>
          <el-form-item label="流媒体ID" prop="mediaServerId">
            <el-select v-model="form.mediaServerId" style="float: left; width: 100%">
              <el-option key="auto" label="自动负载最小" value="auto" />
              <el-option v-for="item in mediaServerList" :key="item.id" :label="item.id" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="字符集" prop="charset">
            <el-select v-model="form.charset" style="float: left; width: 100%">
              <el-option key="GB2312" label="GB2312" value="gb2312" />
              <el-option key="UTF-8" label="UTF-8" value="utf-8" />
            </el-select>
          </el-form-item>
          <el-form-item label="坐标系" prop="geoCoordSys">
            <el-select v-model="form.geoCoordSys" style="float: left; width: 100%">
              <el-option key="WGS84" label="WGS84" value="WGS84" />
              <el-option key="GCJ02" label="GCJ02" value="GCJ02" />
            </el-select>
          </el-form-item>
          <el-form-item label="其他选项">
            <el-checkbox v-model="form.ssrcCheck" label="SSRC校验" style="float: left" />
            <el-checkbox v-model="form.asMessageChannel" label="作为消息通道" style="float: left" />
            <el-checkbox v-model="form.broadcastPushAfterAck" label="收到ACK后发流" style="float: left" />
          </el-form-item>
          <el-form-item>
            <div style="float: right;">
              <el-button type="primary" @click="onSubmit">确认</el-button>
              <el-button @click="close">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateDevice, addDevice } from '@/api/wvp/device'
import { getOnlineMediaServerList } from '@/api/wvp/server'

export default {
  name: 'DeviceEdit',
  props: {
    listChangeCallback: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      showDialog: false,
      isEdit: false,
      isLoging: false,
      form: {
        deviceId: undefined,
        name: undefined,
        password: undefined,
        sdpIp: undefined,
        mediaServerId: 'auto',
        charset: 'gb2312',
        geoCoordSys: 'WGS84',
        ssrcCheck: false,
        asMessageChannel: false,
        broadcastPushAfterAck: false
      },
      rules: {
        deviceId: [
          { required: true, message: '请输入设备编号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ]
      },
      mediaServerList: [],
      localCallback: null
    }
  },
  methods: {
    openDialog(row, callback) {
      this.showDialog = true
      this.localCallback = callback || null
      this.getMediaServerList()
      if (row) {
        this.isEdit = true
        this.form = {
          deviceId: row.deviceId,
          name: row.name,
          password: row.password,
          sdpIp: row.sdpIp,
          mediaServerId: row.mediaServerId || 'auto',
          charset: row.charset || 'gb2312',
          geoCoordSys: row.geoCoordSys || 'WGS84',
          ssrcCheck: row.ssrcCheck || false,
          asMessageChannel: row.asMessageChannel || false,
          broadcastPushAfterAck: row.broadcastPushAfterAck || false
        }
      } else {
        this.isEdit = false
        this.form = {
          deviceId: undefined,
          name: undefined,
          password: undefined,
          sdpIp: undefined,
          mediaServerId: 'auto',
          charset: 'gb2312',
          geoCoordSys: 'WGS84',
          ssrcCheck: false,
          asMessageChannel: false,
          broadcastPushAfterAck: false
        }
      }
    },
    getMediaServerList() {
      getOnlineMediaServerList().then(res => {
        this.mediaServerList = res.data || []
      })
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.isLoging = true
          if (this.isEdit) {
            updateDevice(this.form).then(() => {
              this.isLoging = false
              this.$message.success('修改成功')
              if (this.localCallback) this.localCallback()
              else this.listChangeCallback()
              this.close()
            }).catch(() => {
              this.isLoging = false
            })
          } else {
            addDevice(this.form).then(() => {
              this.isLoging = false
              this.$message.success('添加成功')
              if (this.localCallback) this.localCallback()
              else this.listChangeCallback()
              this.close()
            }).catch(() => {
              this.isLoging = false
            })
          }
        }
      })
    },
    close() {
      this.showDialog = false
      this.$refs.form.resetFields()
      this.form = {
        deviceId: undefined,
        name: undefined,
        password: undefined,
        sdpIp: undefined,
        mediaServerId: 'auto',
        charset: 'gb2312',
        geoCoordSys: 'WGS84',
        ssrcCheck: false,
        asMessageChannel: false,
        broadcastPushAfterAck: false
      }
    }
  }
}
</script>
