<template>
  <div id="ChannelEdit" v-loading="loading" style="width: 100%">
    <div class="page-header">
      <div class="page-title">
        <el-page-header content="编辑通道" @back="close" />
      </div>
    </div>
    <CommonChannelEdit :id="id" ref="commonChannelEdit" :showCancel="true" @submitSuccess="close" @cancel="close" />
  </div>
</template>

<script>
import CommonChannelEdit from '../device/components/CommonChannelEdit.vue'

export default {
  name: 'ChannelEdit',
  components: { CommonChannelEdit },
  props: ['id', 'closeEdit'],
  data() {
    return { loading: false }
  },
  methods: {
    close() {
      if (typeof this.closeEdit === 'function') {
        this.closeEdit()
      } else {
        this.$router.back()
      }
    }
  }
}
</script>
