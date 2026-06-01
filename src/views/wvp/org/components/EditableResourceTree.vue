<template>
  <div class="editable-tree-container">
    <div v-if="contextOperations === 'device'" class="tree-toolbar">
      <el-switch v-model="showCode" active-text="显示编号" inactive-text="" size="mini" />
    </div>
    <ResourceTree
      ref="tree"
      :api-type="apiType"
      :has-channel="false"
      :show-code="showCode"
      @node-click="onNodeClick"
      @node-contextmenu="handleContextMenu"
    />
    <ContextMenu ref="contextMenu" />
  </div>
</template>

<script>
import ResourceTree from '@/views/wvp/map/components/ResourceTree'
import ContextMenu from '@/components/ContextMenu'

export default {
  name: 'EditableResourceTree',
  components: { ResourceTree, ContextMenu },
  props: {
    apiType: { type: String, required: true },
    contextOperations: { type: String, default: 'device' }
  },
  data() {
    return { showCode: false }
  },
  methods: {
    onNodeClick(data) {
      this.$emit('nodeSelect', data)
    },
    handleContextMenu(event, data, node) {
      if (data.type !== 0) return
      event.preventDefault()
      event.stopPropagation()
      const isRoot = node.level === 1
      const isBusinessGroup = node.level <= 2
      const ops = this.contextOperations
      const items = [
        { label: '刷新节点', icon: 'el-icon-refresh', onClick: () => this.refreshNode(node) },
        { label: '新建节点', icon: 'el-icon-plus', onClick: () => this.$emit('context-add-node', data, node) },
        { label: '编辑节点', icon: 'el-icon-edit', disabled: isRoot, onClick: () => this.$emit('context-edit-node', data, node) },
        { label: '删除节点', icon: 'el-icon-delete', disabled: isRoot, divided: true, onClick: () => this.$emit('context-delete-node', data, node) }
      ]
      if (ops === 'device') {
        items.push(
          { label: '导入子区划', icon: 'el-icon-download', divided: true, onClick: () => this.$emit('context-import-region', data, node) }
        )
      } else {
        items.push(
          { label: '添加通道', icon: 'el-icon-plus', disabled: isBusinessGroup, divided: true, onClick: () => this.$emit('context-add-channel', data, node) },
          { label: '移除通道', icon: 'el-icon-delete', disabled: isBusinessGroup, onClick: () => this.$emit('context-remove-channel', data, node) }
        )
      }
      this.$refs.contextMenu.show(event, items)
    },
    refreshNode(node) {
      const treeEl = this.$refs.tree
      if (!treeEl) return
      const data = node.data
      // 根节点 treeId 固定为 'root'，不适用 getTreeId 规则
      const id = data && data.treeId === 'root' ? 'root' : (data ? this.getTreeId(data) : 'root')
      treeEl.refresh(id)
    },
    refresh(id) {
      if (this.$refs.tree) this.$refs.tree.refresh(id)
    },
    getTreeId(data) {
      return this.apiType + '_' + (data.deviceId || data.id)
    }
  }
}
</script>

<style scoped>
.editable-tree-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
.tree-toolbar { margin-bottom: 4px; padding: 0 4px; }
</style>
