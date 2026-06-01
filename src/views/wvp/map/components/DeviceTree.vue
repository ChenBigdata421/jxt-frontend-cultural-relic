<template>
  <div class="device-tree-container" aria-label="设备树">
    <div class="device-tree-header">
      <div class="header-title">通道列表</div>
      <div class="header-switch">
        <el-switch
          v-model="showRegion"
          active-color="#13ce66"
          inactive-color="rgb(64, 158, 255)"
          active-text="行政区划"
          inactive-text="业务分组"
        />
      </div>
    </div>
    <div class="tree-content">
      <ResourceTree
        ref="resourceTree"
        :api-type="showRegion ? 'region' : 'group'"
        :show-position="showPosition"
        :has-channel="true"
        @clickEvent="treeNodeClickEvent"
      />
    </div>
  </div>
</template>

<script>
import ResourceTree from './ResourceTree.vue'

export default {
  name: 'DeviceTree',
  components: { ResourceTree },
  props: {
    showPosition: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showRegion: true
    }
  },
  methods: {
    treeNodeClickEvent(id) {
      this.$emit('clickEvent', id)
    },
    refresh(id) {
      this.$refs.resourceTree && this.$refs.resourceTree.refresh(id)
    }
  }
}
</script>

<style scoped>
.device-tree-container {
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 15px;
  overflow: hidden;
}
.device-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 30px;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
}
.tree-content {
  flex: 1;
  overflow: hidden;
  width: 100%;
}
</style>
