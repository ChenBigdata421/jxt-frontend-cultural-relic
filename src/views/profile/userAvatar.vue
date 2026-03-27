<template>
  <div>
    <img :src="options.img" title="点击上传头像" class="img-circle img-lg" @click="editCropper()">
    <el-dialog :title="title" :visible.sync="open" width="800px" :close-on-click-modal="false">
      <el-row>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            @realTime="realTime"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img">
          </div>
        </el-col>
      </el-row>
      <br>
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button size="small">
              上传
              <i class="el-icon-upload el-icon--right" />
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{span: 1, offset: 2}" :md="2">
          <el-button icon="el-icon-plus" size="small" @click="changeScale(1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()" />
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2">
          <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()" />
        </el-col>
        <el-col :lg="{span: 2, offset: 6}" :md="2">
          <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store'
import { VueCropper } from 'vue-cropper'
import { uploadAvatar } from '@/api/admin/sys-user'

export default {
  components: { VueCropper },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    user: { type: Object }
  },
  data() {
    return {
      // 是否显示弹出层
      open: false,
      // 弹出层标题
      title: '修改头像',
      options: {
        img: undefined, // 裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true // 固定截图框大小 不允许改变
      },
      previews: {},
      // 标志位：防止上传后被 watch 覆盖
      justUploaded: false,
      // 记录上传后的 avatar 值
      uploadedAvatar: null
    }
  },
  watch: {
    user: {
      immediate: true,
      deep: true, // 深度监听 user 对象的变化
      handler(newVal, oldVal) {
        console.log('[userAvatar] watch triggered')
        console.log('[userAvatar] justUploaded:', this.justUploaded)
        console.log('[userAvatar] uploadedAvatar:', this.uploadedAvatar)
        console.log('[userAvatar] newVal:', newVal)
        console.log('[userAvatar] oldVal:', oldVal)

        // 如果刚刚上传过头像，且新值与上传的值不同，则不更新
        if (this.justUploaded && this.uploadedAvatar) {
          if (newVal && newVal.avatar !== this.uploadedAvatar) {
            console.log('[userAvatar] Preventing watch from overwriting uploaded avatar')
            return
          }
          // 如果新值与上传的值相同，则清除标志位
          if (newVal && newVal.avatar === this.uploadedAvatar) {
            console.log('[userAvatar] Avatar synced, clearing flags')
            this.justUploaded = false
            this.uploadedAvatar = null
          }
        }

        if (newVal && newVal.avatar) {
          const avatarUrl = this.getAvatarUrl(newVal.avatar)
          console.log('[userAvatar] Setting options.img to:', avatarUrl)
          // 只有当 avatar 真正改变时才更新
          if (!oldVal || oldVal.avatar !== newVal.avatar) {
            this.options.img = avatarUrl
          }
        }
      }
    }
  },

  methods: {
    // 获取完整的头像 URL
    getAvatarUrl(avatarPath) {
      if (!avatarPath) return ''

      // 如果已经是完整的 URL，直接返回
      if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath
      }

      // 获取 API 基础路径
      let baseApi = process.env.VUE_APP_BASE_API || ''

      // 如果 baseApi 为空或未定义，使用当前页面的 origin
      if (!baseApi || baseApi === '' || baseApi === '/') {
        baseApi = window.location.origin
      }

      // 拼接 URL
      const fullUrl = baseApi + avatarPath
      console.log('[userAvatar] getAvatarUrl:', { avatarPath, baseApi, fullUrl })
      return fullUrl
    },
    // 编辑头像
    editCropper() {
      this.open = true
    },
    // 覆盖默认的上传行为
    requestUpload() {
    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft()
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight()
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1
      this.$refs.cropper.changeScale(num)
    },
    // 上传预处理
    beforeUpload(file) {
      if (file.type.indexOf('image/') === -1) {
        this.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
      } else {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.options.img = reader.result
        }
      }
    },
    // 上传图片
    uploadImg() {
      this.$refs.cropper.getCropBlob(data => {
        const formData = new FormData()
        formData.append('upload[]', data)
        uploadAvatar(formData).then(response => {
          console.log('[userAvatar] Upload response:', response)
          if (response.code === 200) {
            this.open = false
            const serverAvatarPath = response.data
            const newAvatarUrl = this.getAvatarUrl(serverAvatarPath)

            console.log('[userAvatar] Server avatar path:', serverAvatarPath)
            console.log('[userAvatar] Full avatar URL:', newAvatarUrl)
            console.log('[userAvatar] Before update - user.avatar:', this.user?.avatar)

            // 设置标志位，防止 watch 覆盖
            this.justUploaded = true
            this.uploadedAvatar = serverAvatarPath

            // 直接设置图片 URL
            this.options.img = newAvatarUrl

            // 同步更新 Vuex store 中的头像状态
            this.$store.commit('user/SET_AVATAR', serverAvatarPath)
            console.log('[userAvatar] Updated store avatar:', this.$store.state.user.avatar)

            // 触发父组件更新 user 对象的 avatar（使用 $set 确保响应式）
            if (this.user) {
              this.$set(this.user, 'avatar', serverAvatarPath)
              console.log('[userAvatar] Updated user.avatar via $set:', this.user.avatar)
            }

            // 通知父组件刷新用户信息
            this.$emit('avatar-updated', serverAvatarPath)

            this.msgSuccess(response.msg)
          } else {
            this.msgError(response.msg)
          }
          this.$refs.cropper.clearCrop()
        })
      })
    },
    // 实时预览
    realTime(data) {
      this.previews = data
    }
  }
}
</script>
