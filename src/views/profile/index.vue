<template>
  <BasicLayout>
    <template #wrapper>
      <el-row :gutter="10">
        <el-col :span="6" :xs="24">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>个人信息</span>
            </div>
            <div>
              <div class="text-center">
                <userAvatar :user="user" @avatar-updated="handleAvatarUpdated" />
              </div>
              <ul class="list-group list-group-striped">
                <li class="list-group-item">
                  <svg-icon icon-class="user" />用户名称
                  <div class="pull-right">{{ user.userName }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="phone" />手机号码
                  <div class="pull-right">{{ user.phone }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="email" />用户邮箱
                  <div class="pull-right">{{ user.email }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="tree" />所属组织
                  <div class="pull-right">{{ user.orgFullName || user.orgName }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="peoples" />所属角色
                  <div class="pull-right">{{ user.roleName }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="skill" />所在岗位
                  <div class="pull-right">{{ user.postName || '暂无' }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="date" />创建日期
                  <div class="pull-right">{{ parseTime(user.createdAt) }}</div>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col>
        <el-col :span="18" :xs="24">
          <el-card>
            <div slot="header" class="clearfix">
              <span>基本资料</span>
            </div>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本资料" name="userinfo">
                <userInfo :user="user" />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="resetPwd">
                <resetPwd :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </BasicLayout>
</template>

<script>
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUser } from '@/api/admin/sys-user'

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      activeTab: 'userinfo'
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      // 从 Vuex store 获取当前用户 ID
      const userId = this.$store.state.user.userid
      console.log('[Profile] Fetching user data for userId:', userId)

      getUser(userId).then(response => {
        console.log('[Profile] User data response:', response)

        if (response.code === 200 && response.data) {
          this.user = response.data

          // 处理性别字段：将数字转换为字符串（1=男，2=女）
          const sexValue = this.user.sex
          if (sexValue === 1) {
            this.$set(this.user, 'sex', '1')
          } else if (sexValue === 2) {
            this.$set(this.user, 'sex', '2')
          } else {
            // sex为0、undefined、null或其他值时，默认设为"1"（男）
            this.$set(this.user, 'sex', '1')
          }

          // 确保昵称有值
          if (!this.user.nickName && this.user.userName) {
            this.$set(this.user, 'nickName', this.user.userName)
          }

          console.log('[Profile] User data loaded:', {
            userName: this.user.userName,
            orgFullName: this.user.orgFullName,
            roleName: this.user.roleName,
            postName: this.user.postName,
            sex: this.user.sex
          })

          // 同步更新 Vuex store 中的头像
          if (this.user.avatar) {
            this.$store.commit('user/SET_AVATAR', this.user.avatar)
          }
        }
      }).catch(error => {
        console.error('[Profile] Failed to fetch user data:', error)
        this.$message.error('获取用户信息失败')
      })
    },
    handleAvatarUpdated(newAvatarPath) {
      console.log('[Profile] Avatar updated event received:', newAvatarPath)
      // 使用 $set 确保响应式更新
      this.$set(this.user, 'avatar', newAvatarPath)
      // 同步更新 Vuex store
      this.$store.commit('user/SET_AVATAR', newAvatarPath)
    }
  }
}
</script>

<style lang="scss" scoped>
  .list-group-item{
    padding: 18px 0;
  }
  .svg-icon{
    margin-right: 5px;
  }
</style>
