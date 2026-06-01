<template>
  <div class="org-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="行政区划" name="region">
        <div class="org-layout">
          <div class="org-tree-panel">
            <EditableResourceTree
              ref="regionTree"
              api-type="region"
              context-operations="device"
              @nodeSelect="handleRegionNodeSelect"
              @context-add-node="handleAddRegionNode"
              @context-edit-node="handleEditRegionNode"
              @context-delete-node="handleDeleteRegionNode"
              @context-import-region="handleImportRegion"
            />
          </div>
          <RegionPanel
            ref="regionPanel"
            :selected-node="selectedRegionNode"
            @add-click="handleAddDevice"
            @unusual-click="handleUnusualRegion"
            @remove-devices="handleRemoveDevicesFromRegion"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="业务分组" name="group">
        <div class="org-layout">
          <div class="org-tree-panel">
            <EditableResourceTree
              ref="groupTree"
              api-type="group"
              context-operations="channel"
              @nodeSelect="handleGroupNodeSelect"
              @context-add-node="handleAddGroupNode"
              @context-edit-node="handleEditGroupNode"
              @context-delete-node="handleDeleteGroupNode"
              @context-add-channel="handleAddChannel"
              @context-remove-channel="handleRemoveChannel"
            />
          </div>
          <GroupPanel
            ref="groupPanel"
            :selected-node="selectedGroupNode"
            @add-click="handleAddGroupChannel"
            @unusual-click="handleUnusualGroup"
            @remove-channels="handleRemoveChannelsFromGroup"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <RegionEdit ref="regionEdit" @saved="onRegionSaved" />
    <RegionCode ref="regionCodeImport" @imported="onRegionImported" />
    <GroupEdit ref="groupEdit" @saved="onGroupSaved" />
    <GbDeviceSelect ref="gbDeviceSelect" @submit="onDeviceSelected" />
    <GbChannelSelect ref="gbChannelSelect" data-type="group" @submit="onChannelSelected" />
    <UnusualRegionChannel ref="unusualRegionChannel" />
    <UnusualGroupChannel ref="unusualGroupChannel" />
  </div>
</template>

<script>
import EditableResourceTree from './components/EditableResourceTree.vue'
import RegionPanel from './components/RegionPanel.vue'
import GroupPanel from './components/GroupPanel.vue'
import RegionEdit from './components/dialogs/RegionEdit.vue'
import RegionCode from './components/dialogs/RegionCode.vue'
import GroupEdit from './components/dialogs/GroupEdit.vue'
import GbDeviceSelect from './components/dialogs/GbDeviceSelect.vue'
import GbChannelSelect from './components/dialogs/GbChannelSelect.vue'
import UnusualRegionChannel from './components/dialogs/UnusualRegionChannel.vue'
import UnusualGroupChannel from './components/dialogs/UnusualGroupChannel.vue'

import { deleteRegion } from '@/api/wvp/region'
import { deleteGroup } from '@/api/wvp/group'
import {
  addDeviceToRegion,
  deleteDeviceFromRegion,
  addToGroup,
  deleteFromGroup
} from '@/api/wvp/channel'

export default {
  name: 'WvpOrgIndex',
  components: {
    EditableResourceTree,
    RegionPanel,
    GroupPanel,
    RegionEdit,
    RegionCode,
    GroupEdit,
    GbDeviceSelect,
    GbChannelSelect,
    UnusualRegionChannel,
    UnusualGroupChannel
  },
  data() {
    return {
      activeTab: 'region',
      selectedRegionNode: null,
      selectedGroupNode: null,
      importTargetNode: null,
      regionParentNode: null,
      groupParentNode: null,
      addTargetGroupNode: null,
      removeTargetGroupNode: null
    }
  },

  methods: {
    handleRegionNodeSelect(data) {
      this.selectedRegionNode = data
    },

    handleGroupNodeSelect(data) {
      this.selectedGroupNode = data
    },

    handleAddRegionNode(data, node) {
      this.regionParentNode = node
      this.$refs.regionEdit.openDialog(null, data.deviceId, data.id)
    },

    handleEditRegionNode(data, node) {
      this.regionParentNode = node.parent
      this.$refs.regionEdit.openDialog(data)
    },

    handleDeleteRegionNode(data, node) {
      this.$confirm('确定删除该区划节点吗？删除后不可恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteRegion({ id: data.id })
      }).then(() => {
        this.$message.success('删除成功')
        node.parent.loaded = false
        node.parent.expand()
        if (this.selectedRegionNode &&
            this.selectedRegionNode.deviceId === data.deviceId) {
          this.selectedRegionNode = null
        }
      }).catch(err => {
        if (err === 'cancel' || err === 'close') return
        this.$message.error('删除失败: ' + (err.message || '未知错误'))
      })
    },

    handleImportRegion(data, node) {
      this.importTargetNode = node
      this.$refs.regionCodeImport.openDialog(data.deviceId, true)
    },

    onRegionImported() {
      if (this.importTargetNode) {
        this.$refs.regionTree.refreshNode(this.importTargetNode)
        this.importTargetNode = null
      }
    },

    onRegionSaved() {
      if (this.regionParentNode) {
        this.regionParentNode.loaded = false
        this.regionParentNode.isLeaf = false
        this.regionParentNode.expand()
        this.regionParentNode = null
      }
      if (this.$refs.regionPanel) this.$refs.regionPanel.reload()
    },

    handleAddDevice() {
      if (!this.selectedRegionNode || !this.selectedRegionNode.deviceId) {
        this.$message.warning('请先选择区划节点')
        return
      }
      this.$refs.gbDeviceSelect.openDialog(this.selectedRegionNode.deviceId)
    },

    onDeviceSelected(devices) {
      if (!devices || devices.length === 0) return
      if (!this.selectedRegionNode || !this.selectedRegionNode.deviceId) {
        this.$message.warning('请先选择区划节点')
        return
      }
      const deviceIds = devices.map(d => d.id)
      addDeviceToRegion({
        civilCode: this.selectedRegionNode.deviceId,
        deviceIds: deviceIds
      }).then(() => {
        if (this._isDestroyed) return
        this.$message.success('添加设备成功')
        if (this.$refs.regionPanel) {
          this.$refs.regionPanel.reload()
        }
      }).catch(err => {
        if (this._isDestroyed) return
        this.$message.error('添加设备失败: ' + (err.message || '未知错误'))
      })
    },

    handleRemoveDevicesFromRegion(deviceIds) {
      if (!deviceIds || deviceIds.length === 0) return
      this.$confirm('确定将所选设备从当前区划移除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteDeviceFromRegion({
          civilCode: this.selectedRegionNode.deviceId,
          deviceIds: deviceIds
        })
      }).then(() => {
        if (this._isDestroyed) return
        this.$message.success('移除成功')
        if (this.$refs.regionPanel) {
          this.$refs.regionPanel.reload()
        }
      }).catch(err => {
        if (this._isDestroyed) return
        if (err === 'cancel' || err === 'close') return
        this.$message.error('移除失败: ' + (err.message || '未知错误'))
      })
    },

    handleUnusualRegion() {
      this.$refs.unusualRegionChannel.openDialog()
    },

    handleAddGroupNode(data, node) {
      this.groupParentNode = node
      this.$refs.groupEdit.openDialog(null, {
        parentId: data.id,
        parentDeviceId: node.level > 2 ? data.deviceId : '',
        businessGroup: node.level > 2 ? (data.businessGroup || '') : data.deviceId
      })
    },

    handleEditGroupNode(data, node) {
      this.groupParentNode = node.parent
      this.$refs.groupEdit.openDialog(data)
    },

    handleDeleteGroupNode(data, node) {
      this.$confirm('确定删除该分组节点吗？删除后不可恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteGroup({ id: data.id })
      }).then(() => {
        if (this._isDestroyed) return
        this.$message.success('删除成功')
        node.parent.loaded = false
        node.parent.expand()
        if (this.selectedGroupNode &&
            this.selectedGroupNode.deviceId === data.deviceId) {
          this.selectedGroupNode = null
        }
      }).catch(err => {
        if (this._isDestroyed) return
        if (err === 'cancel' || err === 'close') return
        this.$message.error('删除失败: ' + (err.message || '未知错误'))
      })
    },

    onGroupSaved() {
      if (this.groupParentNode) {
        this.groupParentNode.loaded = false
        this.groupParentNode.isLeaf = false
        this.groupParentNode.expand()
        this.groupParentNode = null
      }
      if (this.$refs.groupPanel) this.$refs.groupPanel.reload()
    },

    handleAddGroupChannel() {
      if (!this.selectedGroupNode || !this.selectedGroupNode.deviceId) {
        this.$message.warning('请先选择分组节点')
        return
      }
      this.addTargetGroupNode = this.selectedGroupNode
      this.$refs.gbChannelSelect.openDialog()
    },

    handleAddChannel(data, node) {
      this.addTargetGroupNode = node
      this.$refs.gbChannelSelect.openDialog()
    },

    onChannelSelected(channels) {
      if (!channels || channels.length === 0) return
      const targetNode = this.addTargetGroupNode
      if (!targetNode) {
        this.$message.warning('未选择目标分组节点')
        return
      }
      const nodeData = targetNode.data || targetNode
      const parentId = nodeData.deviceId || nodeData.id
      const businessGroup = nodeData.businessGroup || ''
      const channelIds = channels.map(c => c.gbId || c.id).filter(Boolean)
      addToGroup({
        parentId: parentId,
        businessGroup: businessGroup,
        channelIds: channelIds
      }).then(() => {
        if (this._isDestroyed) return
        this.$message.success('添加通道成功')
        if (this.$refs.groupPanel) {
          this.$refs.groupPanel.reload()
        }
      }).catch(err => {
        if (this._isDestroyed) return
        this.$message.error('添加通道失败: ' + (err.message || '未知错误'))
      }).finally(() => {
        this.addTargetGroupNode = null
      })
    },

    handleRemoveChannel(data, node) {
      this.removeTargetGroupNode = node
      const nodeDeviceId = (node.data && (node.data.deviceId || node.data.id)) || (data.deviceId || data.id)
      const currentNodeId = this.selectedGroupNode && (this.selectedGroupNode.deviceId || this.selectedGroupNode.id)
      if (nodeDeviceId !== currentNodeId) {
        this.$message.info('请先点击选中该分组节点，再选择要移除的通道')
        return
      }
      const groupPanel = this.$refs.groupPanel
      if (groupPanel && groupPanel.multipleSelection && groupPanel.multipleSelection.length > 0) {
        const channelIds = groupPanel.multipleSelection
          .map(item => item.gbId || item.id)
          .filter(Boolean)
        if (channelIds.length > 0) {
          this.$confirm('确定将所选通道从当前分组移除吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            return deleteFromGroup({ parentId: nodeDeviceId, channelIds })
          }).then(() => {
            if (this._isDestroyed) return
            this.$message.success('移除成功')
            if (this.$refs.groupTree) this.$refs.groupTree.refreshNode(node)
            if (groupPanel) groupPanel.reload()
          }).catch(err => {
            if (this._isDestroyed) return
            if (err === 'cancel' || err === 'close') return
            this.$message.error('移除失败: ' + (err.message || '未知错误'))
          })
          return
        }
      }
      this.$message.info('请先在右侧面板中选择要移除的通道，或使用面板中的"移除所选"按钮')
    },

    handleRemoveChannelsFromGroup(channelIds) {
      if (!channelIds || channelIds.length === 0) return
      if (!this.selectedGroupNode || !this.selectedGroupNode.deviceId) {
        this.$message.warning('请先选择分组节点')
        return
      }
      this.$confirm('确定将所选通道从当前分组移除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteFromGroup({
          parentId: this.selectedGroupNode.deviceId,
          channelIds: channelIds
        })
      }).then(() => {
        if (this._isDestroyed) return
        this.$message.success('移除成功')
        // 工具栏路径: 使用 selectedGroupNode 刷新树节点
        const refreshTarget = this.removeTargetGroupNode || { data: this.selectedGroupNode }
        if (this.$refs.groupTree) {
          this.$refs.groupTree.refreshNode(refreshTarget)
        }
        this.removeTargetGroupNode = null
        if (this.$refs.groupPanel) {
          this.$refs.groupPanel.reload()
        }
      }).catch(err => {
        if (this._isDestroyed) return
        if (err === 'cancel' || err === 'close') return
        this.$message.error('移除失败: ' + (err.message || '未知错误'))
      })
    },

    handleUnusualGroup() {
      this.$refs.unusualGroupChannel.openDialog()
    }
  }
}
</script>

<style scoped>
.org-container {
  height: calc(100vh - 118px);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.org-container ::v-deep .el-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.org-container ::v-deep .el-tabs__content {
  flex: 1;
  min-height: 0;
}

.org-container ::v-deep .el-tab-pane {
  height: 100%;
}

.org-layout {
  display: grid;
  grid-template-columns: 400px auto;
  height: 100%;
}

.org-tree-panel {
  border-right: 1px solid #e4e7ed;
  padding: 12px;
  overflow: auto;
}
</style>
