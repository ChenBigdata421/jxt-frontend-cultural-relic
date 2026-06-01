<template>
  <el-dialog
    :title="isEdit ? '编辑分组' : '新建分组'"
    width="500px"
    :close-on-click-modal="false"
    :visible.sync="showDialog"
    :destroy-on-close="true"
    @close="close"
  >
    <el-form ref="form" :rules="rules" :model="form" label-width="100px">
      <el-form-item label="节点编号" prop="deviceId">
        <el-input v-model="form.deviceId" :disabled="isEdit" clearable>
          <template v-if="!isEdit" #append>
            <el-button @click="generateId">生成</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="节点名称" prop="name">
        <el-input v-model="form.name" clearable />
      </el-form-item>
      <el-form-item label="行政区划" prop="civilCode">
        <el-input v-model="form.civilCodeName" readonly>
          <template #append>
            <el-button @click="openCivilCodeDialog">选择</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">保存</el-button>
    </div>
    <ChooseCivilCode ref="chooseCivilCode" @select="onCivilCodeSelect" />
  </el-dialog>
</template>

<script>
import { addGroup, updateGroup } from '@/api/wvp/group'
import ChooseCivilCode from './ChooseCivilCode'

export default {
  name: 'GroupEdit',
  components: { ChooseCivilCode },
  data() {
    return {
      showDialog: false,
      isEdit: false,
      submitting: false,
      form: {
        id: undefined,
        deviceId: '',
        name: '',
        civilCode: '',
        civilCodeName: '',
        parentId: undefined,
        parentDeviceId: '',
        businessGroup: ''
      },
      rules: {
        deviceId: [{ required: true, message: '请输入节点编号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    openDialog(group, parentInfo) {
      this.showDialog = true
      if (group && group.id) {
        this.isEdit = true
        this.form = {
          id: group.id,
          deviceId: group.deviceId || '',
          name: group.name || '',
          civilCode: group.civilCode || '',
          civilCodeName: group.civilCodeName || group.civilCode || '',
          parentId: group.parentId || undefined,
          parentDeviceId: group.parentDeviceId || '',
          businessGroup: group.businessGroup || ''
        }
      } else {
        this.isEdit = false
        this.form = {
          id: undefined,
          deviceId: '',
          name: '',
          civilCode: '',
          civilCodeName: '',
          parentId: parentInfo ? parentInfo.parentId : undefined,
          parentDeviceId: parentInfo ? parentInfo.parentDeviceId : '',
          businessGroup: parentInfo ? parentInfo.businessGroup : ''
        }
      }
    },
    generateId() {
      // GB28181 20-digit: civilCode(8) + industry(2) + type(3) + network(1) + serial(6)
      const civil = (this.form.civilCode || '34020000').padEnd(8, '0').substring(0, 8)
      const typeCode = this.form.businessGroup ? '216' : '215'
      const serial = String(Math.floor(Math.random() * 900000) + 100000)
      this.form.deviceId = civil + '00' + typeCode + '7' + serial
    },
    openCivilCodeDialog() {
      this.$refs.chooseCivilCode.openDialog()
    },
    onCivilCodeSelect(node) {
      this.form.civilCode = node.deviceId
      this.form.civilCodeName = node.name
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.submitting = true
        const payload = {
          deviceId: this.form.deviceId,
          name: this.form.name,
          civilCode: this.form.civilCode,
          parentId: this.form.parentId,
          parentDeviceId: this.form.parentDeviceId,
          businessGroup: this.form.businessGroup
        }
        const request = this.isEdit
          ? updateGroup({ ...payload, id: this.form.id })
          : addGroup(payload)
        request.then(() => {
          this.$message.success(this.isEdit ? '修改成功' : '添加成功')
          this.$emit('saved')
          this.close()
        }).catch(err => {
          this.$message.error((this.isEdit ? '修改失败' : '添加失败') + ': ' + (err.message || err || '未知错误'))
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    close() {
      this.showDialog = false
      if (this.$refs.form) this.$refs.form.resetFields()
      this.form = {
        id: undefined,
        deviceId: '',
        name: '',
        civilCode: '',
        civilCodeName: '',
        parentId: undefined,
        parentDeviceId: '',
        businessGroup: ''
      }
    }
  }
}
</script>
