<template>
  <el-dialog
    :title="isEdit ? '编辑区划' : '新建区划'"
    width="65rem"
    top="5vh"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="onClose"
  >
    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane name="0">
        <span slot="label">
          <span class="tab-code-preview">{{ provinceCode || '--' }}</span>
          <span>省级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <el-radio
            v-for="item in regionList"
            :key="item.code"
            v-model="provinceCode"
            :label="item.code"
            class="region-radio"
            @change="onSelect(0, item)"
          >
            {{ item.name }} - {{ item.code }}
          </el-radio>
        </div>
      </el-tab-pane>

      <el-tab-pane name="1">
        <span slot="label">
          <span class="tab-code-preview">{{ cityCode || '--' }}</span>
          <span>市级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <div v-if="!provinceCode" class="empty-tip">请先选择省级编码</div>
          <template v-else>
            <el-radio
              v-model="cityCode"
              label=""
              class="region-radio"
              @change="onSelect(1, null)"
            >
              不添加
            </el-radio>
            <el-radio
              v-for="item in regionList"
              :key="item.code"
              v-model="cityCode"
              :label="item.code.substring(2)"
              class="region-radio"
              @change="onSelect(1, item)"
            >
              {{ item.name }} - {{ item.code.substring(2) }}
            </el-radio>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane name="2">
        <span slot="label">
          <span class="tab-code-preview">{{ districtCode || '--' }}</span>
          <span>区级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <div v-if="!cityCode" class="empty-tip">请先选择市级编码</div>
          <template v-else>
            <el-radio
              v-model="districtCode"
              label=""
              class="region-radio"
              @change="onSelect(2, null)"
            >
              不添加
            </el-radio>
            <el-radio
              v-for="item in regionList"
              :key="item.code"
              v-model="districtCode"
              :label="item.code.substring(4)"
              class="region-radio"
              @change="onSelect(2, item)"
            >
              {{ item.name }} - {{ item.code.substring(4) }}
            </el-radio>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane name="3">
        <span slot="label">
          <span class="tab-code-preview">{{ baseCode || '--' }}</span>
          <span>基层接入单位编码</span>
        </span>
        <div class="tab-content">
          <p class="manual-hint">请手动输入基层接入单位编码（两位数字）</p>
          <el-input
            v-model="baseCode"
            placeholder="请输入两位数字"
            maxlength="2"
            show-word-limit
            @input="onBaseInput"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      class="edit-form"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="编号" prop="deviceId">
        <el-input v-model="form.deviceId" autocomplete="off" />
      </el-form-item>
      <el-form-item class="edit-form-actions">
        <div class="action-buttons">
          <el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
          <el-button @click="visible = false">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { addRegion, updateRegion, getRegionBaseChildList } from '@/api/wvp/region'

export default {
  name: 'RegionEdit',
  data() {
    return {
      visible: false,
      isEdit: false,
      saving: false,
      loading: false,
      activeTab: '0',
      provinceCode: '',
      cityCode: '',
      districtCode: '',
      baseCode: '',
      regionList: [],
      form: {
        id: undefined,
        name: '',
        deviceId: '',
        parentDeviceId: '',
        parentId: undefined
      },
      rules: {
        name: [{ required: true, message: '请输入区划名称', trigger: 'blur' }],
        deviceId: [{ required: true, message: '请生成区划编号', trigger: 'blur' }]
      }
    }
  },
  methods: {
    openDialog(region, parentDeviceId, parentId) {
      this.visible = true
      this.activeTab = '0'
      this.regionList = []
      this.provinceCode = ''
      this.cityCode = ''
      this.districtCode = ''
      this.baseCode = ''

      if (region && region.id) {
        this.isEdit = true
        this.form = {
          id: region.id,
          name: region.name || '',
          deviceId: region.deviceId || '',
          parentDeviceId: region.parentDeviceId || '',
          parentId: region.parentId || undefined
        }
        if (this.form.deviceId) {
          const code = this.form.deviceId
          if (code.length >= 2) this.provinceCode = code.substring(0, 2)
          if (code.length >= 4) { this.cityCode = code.substring(2, 4); this.activeTab = '1' }
          if (code.length >= 6) { this.districtCode = code.substring(4, 6); this.activeTab = '2' }
          if (code.length >= 8) { this.baseCode = code.substring(6, 8); this.activeTab = '3' }
        }
      } else {
        this.isEdit = false
        this.form = {
          id: undefined,
          name: '',
          deviceId: '',
          parentDeviceId: parentDeviceId || '',
          parentId: parentId || undefined
        }
        if (this.form.parentDeviceId) {
          const pCode = this.form.parentDeviceId
          if (pCode.length >= 2) { this.provinceCode = pCode.substring(0, 2); this.activeTab = '1' }
          if (pCode.length >= 4) { this.cityCode = pCode.substring(2, 4); this.activeTab = '2' }
          if (pCode.length >= 6) { this.districtCode = pCode.substring(4, 6); this.activeTab = '3' }
        }
      }

      this.loadRegionList()
    },

    loadRegionList() {
      const tab = parseInt(this.activeTab)
      if (tab === 3) {
        this.regionList = []
        return
      }
      let parent = ''
      if (tab === 0) parent = ''
      else if (tab === 1) parent = this.provinceCode
      else if (tab === 2) parent = this.provinceCode + this.cityCode

      if (tab > 0 && !parent) {
        this.$message.error('请先选择上级行政区划')
        this.regionList = []
        return
      }
      this.loading = true
      getRegionBaseChildList(parent).then(res => {
        const list = res.data || res || []
        this.regionList = list.map(item => ({
          code: item.code || item.deviceId || item.id,
          name: item.name
        }))
      }).catch(() => {
        this.regionList = []
      }).finally(() => {
        this.loading = false
      })
    },

    onTabChange() {
      this.loadRegionList()
    },

    onSelect(tabIndex, item) {
      if (tabIndex <= 0) { this.cityCode = '' }
      if (tabIndex <= 1) { this.districtCode = '' }
      if (tabIndex <= 2) { this.baseCode = '' }
      this.assembleCode()
      if (item) {
        this.form.name = item.name
      }
    },

    onBaseInput() {
      this.baseCode = this.baseCode.replace(/[^\d]/g, '')
      this.assembleCode()
    },

    assembleCode() {
      let code = this.provinceCode || ''
      if (this.cityCode) {
        code += this.cityCode
        if (this.districtCode) {
          code += this.districtCode
          if (this.baseCode) {
            code += this.baseCode
          }
        }
      }
      this.form.deviceId = code
    },

    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.saving = true
        const payload = {
          name: this.form.name,
          deviceId: this.form.deviceId,
          parentDeviceId: this.form.parentDeviceId,
          parentId: this.form.parentId
        }
        const action = this.isEdit
          ? updateRegion({ ...payload, id: this.form.id })
          : addRegion(payload)

        action.then(() => {
          this.$message.success(this.isEdit ? '修改成功' : '添加成功')
          this.$emit('saved')
          this.visible = false
        }).catch(err => {
          this.$message.error((this.isEdit ? '修改失败' : '添加失败') + ': ' + (err.message || err || '未知错误'))
        }).finally(() => {
          this.saving = false
        })
      })
    },

    onClose() {
      if (this.$refs.form) this.$refs.form.resetFields()
      this.form = { id: undefined, name: '', deviceId: '', parentDeviceId: '', parentId: undefined }
      this.provinceCode = ''
      this.cityCode = ''
      this.districtCode = ''
      this.baseCode = ''
      this.regionList = []
    }
  }
}
</script>

<style scoped>
.tab-code-preview {
  display: block;
  text-align: center;
  font-size: 1.5rem;
  line-height: 1.2;
}
.tab-content {
  min-height: 120px;
  max-height: 360px;
  overflow-y: auto;
}
.region-radio {
  line-height: 2rem;
}
.empty-tip {
  color: #909399;
  text-align: center;
  padding: 40px 0;
}
.manual-hint {
  margin-bottom: 12px;
  color: #606266;
}
.edit-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 2rem 0;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}
.edit-form-actions {
  margin-top: 22px;
  margin-bottom: 0;
}
.action-buttons {
  float: right;
}
</style>
