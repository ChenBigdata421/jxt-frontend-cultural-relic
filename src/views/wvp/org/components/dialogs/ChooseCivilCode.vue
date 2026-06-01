<template>
  <el-dialog
    title="选择行政区划"
    width="400px"
    :close-on-click-modal="false"
    :visible.sync="showDialog"
    :destroy-on-close="true"
    @close="close"
  >
    <div class="civil-code-tree">
      <ResourceTree
        ref="tree"
        api-type="region"
        :has-channel="false"
        @node-click="handleNodeClick"
      />
    </div>
  </el-dialog>
</template>

<script>
import ResourceTree from '@/views/wvp/map/components/ResourceTree'

export default {
  name: 'ChooseCivilCode',
  components: { ResourceTree },
  data() {
    return {
      showDialog: false
    }
  },
  methods: {
    openDialog() {
      this.showDialog = true
    },
    handleNodeClick(data) {
      if (data.treeId === 'root') return
      if (data.type !== 0) return
      this.$emit('select', { deviceId: data.deviceId, name: data.name })
      this.close()
    },
    close() {
      this.showDialog = false
    }
  }
}
</script>

<style scoped>
.civil-code-tree {
  height: 400px;
  overflow: auto;
}
</style>
