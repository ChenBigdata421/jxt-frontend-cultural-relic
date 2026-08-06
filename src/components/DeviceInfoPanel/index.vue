<template>
  <el-collapse v-model="activeSections">
    <!-- Basic Info -->
    <el-collapse-item title="基础信息" name="basic">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="设备名称">{{ device.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ device.deviceNo }}</el-descriptions-item>
        <el-descriptions-item label="资产编号">{{ device.assetNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ device.vendor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ device.model || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ device.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <!-- Status Info -->
    <el-collapse-item title="状态信息" name="status">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="生命周期状态">
          <device-status-tag type="lifecycle" :value="device.lifecycleStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="可用性">
          <device-status-tag type="operability" :value="device.operabilityStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="分配状态">
          <device-status-tag type="assignment" :value="device.assignmentStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="运行状态">
          <device-status-tag type="runtime" :value="device.runtimeStatus" />
        </el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <!-- Management -->
    <el-collapse-item title="管理信息" name="management">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="管理人">{{ device.managerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="管理人组织">{{ device.managerOrgName || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <!-- BWC Extension (only for BWC devices) -->
    <el-collapse-item v-if="device.deviceType === '标准'" title="执法仪扩展信息" name="bwcExt">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="执法仪类型">
          {{ bwcTypeLabel }}
        </el-descriptions-item>
        <el-descriptions-item label="存储容量">
          {{ device.storageCapacity ? device.storageCapacity + ' GB' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="摄像头分辨率">{{ device.cameraResolution || '-' }}</el-descriptions-item>
        <el-descriptions-item label="固件版本">{{ device.firmwareVersion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="质保到期日">{{ device.warrantyExpiry || '-' }}</el-descriptions-item>
        <el-descriptions-item label="购买日期">{{ device.purchaseDate || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <!-- GB28181 Identity (only for 5G BWC devices with identity mappings) -->
    <el-collapse-item v-if="gb28181Mapping" title="GB28181 身份信息" name="gb28181">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="SIP 设备编号">{{ gb28181Mapping.identityValue || '-' }}</el-descriptions-item>
        <el-descriptions-item label="平台类型">{{ gb28181Mapping.platformType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="身份状态">{{ gb28181Mapping.status || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions v-if="gb28181Mapping.terminalExt" :column="2" border size="small" title="终端配置" style="margin-top: 12px">
        <el-descriptions-item label="字符编码">{{ gb28181Mapping.terminalExt.charset || '-' }}</el-descriptions-item>
        <el-descriptions-item label="流传输模式">{{ gb28181Mapping.terminalExt.streamMode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="SDP 流接收 IP">{{ gb28181Mapping.terminalExt.sdpIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="流媒体服务器 ID">{{ gb28181Mapping.terminalExt.mediaServerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="SSRC 校验">{{ gb28181Mapping.terminalExt.ssrcCheck ? '启用' : '未启用' }}</el-descriptions-item>
        <el-descriptions-item label="地理坐标系">{{ gb28181Mapping.terminalExt.geoCoordSys || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作为消息通道">{{ gb28181Mapping.terminalExt.asMessageChannel ? '启用' : '未启用' }}</el-descriptions-item>
        <el-descriptions-item label="应答后推广播">{{ gb28181Mapping.terminalExt.broadcastPushAfterAck ? '启用' : '未启用' }}</el-descriptions-item>
        <el-descriptions-item label="心跳间隔 (秒)">{{ gb28181Mapping.terminalExt.heartbeatInterval || '-' }}</el-descriptions-item>
        <el-descriptions-item label="心跳超时次数">{{ gb28181Mapping.terminalExt.heartbeatCount || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <!-- Timestamps -->
    <el-collapse-item title="时间信息" name="timestamps">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="创建时间">{{ device.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ device.updatedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退役时间">{{ device.retiredAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="吊销时间">{{ device.revokedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="吊销原因">{{ device.revokedReason || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import DeviceStatusTag from '@/components/DeviceStatusTag/index.vue'

export default {
  name: 'DeviceInfoPanel',
  components: { DeviceStatusTag },
  props: {
    device: {
      type: Object,
      required: true
    },
    expandedSections: {
      type: Array,
      default: () => ['basic', 'status', 'management', 'bwcExt', 'gb28181', 'timestamps']
    }
  },
  data() {
    return {
      activeSections: this.expandedSections
    }
  },
  computed: {
    bwcTypeLabel() {
      return this.device.bwcType || this.device.deviceType || '-'
    },
    gb28181Mapping() {
      if (!this.device.identityMappings || !this.device.identityMappings.length) return null
      return this.device.identityMappings.find(function(m) { return m.identityType === 'GB28181_ID' }) || null
    }
  }
}
</script>
