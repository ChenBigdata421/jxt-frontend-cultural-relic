<template>
  <el-dialog
    :title="browseMode ? '导入子区划' : '生成区划编码'"
    width="700px"
    top="5vh"
    :append-to-body="true"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :destroy-on-close="true"
    :show-close="!importing"
    @close="onClose"
  >
    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane name="0">
        <span slot="label">
          <span class="tab-code-preview">{{ displaySegment(0) }}</span>
          <span>省级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <el-radio-group v-if="!browseMode" :value="tabValues[0]" @input="onRadioSelect(0, $event)">
            <el-radio
              v-for="item in regionList"
              :key="item.code"
              :label="item.code"
              class="region-radio"
            >
              {{ item.name }} - {{ item.code }}
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-else v-model="selectedCodes">
            <el-checkbox
              v-for="item in regionList"
              :key="item.code"
              :label="item.code"
            >
              {{ item.name }} - {{ item.code }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-tab-pane>

      <el-tab-pane name="1">
        <span slot="label">
          <span class="tab-code-preview">{{ displaySegment(1) }}</span>
          <span>市级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <div v-if="!tabValues[0]" class="empty-tip">请先选择省级编码</div>
          <template v-else>
            <el-radio-group v-if="!browseMode" :value="tabValues[1]" @input="onRadioSelect(1, $event)">
              <el-radio
                v-for="item in regionList"
                :key="item.code"
                :label="item.code"
                class="region-radio"
              >
                {{ item.name }} - {{ item.code }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-else v-model="selectedCodes">
              <el-checkbox
                v-for="item in regionList"
                :key="item.code"
                :label="item.code"
              >
                {{ item.name }} - {{ item.code }}
              </el-checkbox>
            </el-checkbox-group>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane name="2">
        <span slot="label">
          <span class="tab-code-preview">{{ displaySegment(2) }}</span>
          <span>区级编码</span>
        </span>
        <div v-loading="loading" class="tab-content">
          <div v-if="!tabValues[1]" class="empty-tip">请先选择市级编码</div>
          <template v-else>
            <el-radio-group v-if="!browseMode" :value="tabValues[2]" @input="onRadioSelect(2, $event)">
              <el-radio
                v-for="item in regionList"
                :key="item.code"
                :label="item.code"
                class="region-radio"
              >
                {{ item.name }} - {{ item.code }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-else v-model="selectedCodes">
              <el-checkbox
                v-for="item in regionList"
                :key="item.code"
                :label="item.code"
              >
                {{ item.name }} - {{ item.code }}
              </el-checkbox>
            </el-checkbox-group>
          </template>
        </div>
      </el-tab-pane>

      <el-tab-pane name="3">
        <span slot="label">
          <span class="tab-code-preview">{{ manualInput || displaySegment(3) }}</span>
          <span>基层接入单位编码</span>
        </span>
        <div class="tab-content">
          <template v-if="!browseMode">
            <p class="manual-hint">请手动输入基层接入单位编码（两位数字）</p>
            <el-input
              v-model="manualInput"
              placeholder="请输入两位数字"
              maxlength="2"
              show-word-limit
              @input="onManualInput"
            />
          </template>
          <template v-else>
            <div v-if="!tabValues[2]" class="empty-tip">请先选择区级编码</div>
            <div v-else v-loading="loading">
              <el-checkbox-group v-model="selectedCodes">
                <el-checkbox
                  v-for="item in regionList"
                  :key="item.code"
                  :label="item.code"
                >
                  {{ item.name }} - {{ item.code }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </template>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="dialog-footer-bar">
      <template v-if="!browseMode">
        <span class="assembled-code">
          当前编码：<strong>{{ assembledCode }}</strong>
          <span v-if="assembledName" class="assembled-name">（{{ assembledName }}）</span>
        </span>
        <el-button type="primary" :disabled="!assembledCode" @click="handleSelect">确认选择</el-button>
      </template>
      <template v-else>
        <span class="selected-count">{{ importing ? importProgress : '已选 ' + selectedCodes.length + ' 项' }}</span>
        <el-button type="primary" :disabled="selectedCodes.length === 0 || importing" @click="handleImport">导入选中</el-button>
      </template>
      <el-button :disabled="importing" @click="visible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getRegionBaseChildList, addRegionByCivilCode } from '@/api/wvp/region'

export default {
  name: 'RegionCode',
  data() {
    return {
      visible: false,
      browseMode: false,
      activeTab: '0',
      tabValues: ['', '', '', ''],
      tabNames: ['', '', '', ''],
      manualInput: '',
      regionList: [],
      selectedCodes: [],
      loading: false,
      codeNameMap: {},
      importing: false,
      importProgress: ''
    }
  },
  computed: {
    assembledCode() {
      if (this.browseMode) return ''
      const district = this.tabValues[2]
      if (!district) return ''
      return district + this.manualInput
    },
    assembledName() {
      const parts = this.tabNames.filter(n => n)
      return parts.join(' ') || ''
    }
  },
  methods: {
    openDialog(code, browseMode) {
      this.visible = true
      this.browseMode = !!browseMode
      this.selectedCodes = []
      this.codeNameMap = {}
      this.activeTab = '0'
      this.tabValues = ['', '', '', '']
      this.tabNames = ['', '', '', '']
      this.manualInput = ''
      if (code) {
        if (code.length >= 2) {
          this.tabValues[0] = code.substring(0, 2)
        }
        if (code.length >= 4) {
          this.tabValues[1] = code.substring(0, 4)
          this.activeTab = '1'
        }
        if (code.length >= 6) {
          this.tabValues[2] = code.substring(0, 6)
          this.activeTab = '2'
        }
        if (code.length >= 8) {
          this.manualInput = code.substring(6, 8)
          this.activeTab = '3'
        }
      }
      this.loadRegionList()
    },
    displaySegment(tabIndex) {
      const val = this.tabValues[tabIndex]
      if (!val) return ''
      return val.substring(tabIndex * 2)
    },
    loadRegionList() {
      const tabIndex = parseInt(this.activeTab)
      if (tabIndex === 3 && !this.browseMode) {
        this.regionList = []
        return
      }
      const parent = tabIndex === 0 ? '' : this.tabValues[tabIndex - 1]
      if (tabIndex > 0 && !parent) {
        this.regionList = []
        return
      }
      this.loading = true
      getRegionBaseChildList(parent).then(res => {
        const list = res.data || res || []
        this.regionList = list.map(item => {
          const code = item.code || item.deviceId || item.id
          if (code && item.name) {
            this.$set(this.codeNameMap, code, item.name)
          }
          return { code, name: item.name }
        })
      }).catch(() => {
        this.regionList = []
      }).finally(() => {
        this.loading = false
      })
    },
    onTabChange() {
      this.loadRegionList()
    },
    onRadioSelect(tabIndex, fullCode) {
      this.$set(this.tabValues, tabIndex, fullCode)
      for (let i = tabIndex + 1; i < 4; i++) {
        this.$set(this.tabValues, i, '')
        this.$set(this.tabNames, i, '')
      }
      this.manualInput = ''
      const matched = this.regionList.find(item => item.code === fullCode)
      if (matched) {
        this.$set(this.tabNames, tabIndex, matched.name)
      }
      if (tabIndex < 3) {
        this.activeTab = String(tabIndex + 1)
      }
    },
    onManualInput() {
      this.manualInput = this.manualInput.replace(/[^\d]/g, '')
    },
    handleSelect() {
      if (!this.assembledCode) return
      this.$emit('select', this.assembledCode)
      this.visible = false
    },
    async handleImport() {
      if (this.selectedCodes.length === 0 || this.importing) return
      this.importing = true
      // WVP 后端 addByCivilCode 不会递归补齐父链：父级不在 DB 时会返回
      // code:100 + "行政区划XXXXy已存在，但查询错误"。这里前端按 2/4/6/8
      // 长度展开每个所选编码的全部祖先，去重并保持层级顺序，逐级落库。
      const ordered = []
      const seen = new Set()
      for (const code of this.selectedCodes) {
        if (!code || code.length < 2) continue
        for (let len = 2; len <= code.length; len += 2) {
          const anc = code.substring(0, len)
          if (!seen.has(anc)) {
            seen.add(anc)
            ordered.push(anc)
          }
        }
      }
      let success = 0
      let skip = 0
      let fail = 0
      const total = ordered.length
      for (let i = 0; i < total; i++) {
        if (this._isDestroyed) return
        this.importProgress = '正在导入 ' + (i + 1) + '/' + total + '…'
        try {
          const res = await addRegionByCivilCode(ordered[i])
          if (res && res.code !== undefined && res.code !== 0) {
            const msg = res.msg || res.message || ''
            // WVP 后端把"已存在"和"父级缺失"混用同一种消息，因此父链按
            // 顺序补齐后，这里的"已存在"基本就是真·重复，按 skip 计。
            if (msg.indexOf('已存在') !== -1) {
              skip++
            } else {
              fail++
            }
          } else {
            success++
          }
        } catch (e) {
          fail++
        }
      }
      if (this._isDestroyed) return
      this.importing = false
      this.importProgress = ''
      const parts = []
      if (success > 0) parts.push('成功 ' + success + ' 项')
      if (skip > 0) parts.push('已存在跳过 ' + skip + ' 项')
      if (fail > 0) parts.push('失败 ' + fail + ' 项')
      if (fail > 0) {
        this.$message.warning('导入完成：' + parts.join('，'))
      } else if (success > 0) {
        this.$message.success('成功导入 ' + success + ' 项')
      } else if (skip > 0) {
        this.$message.info('所选区划已全部存在，跳过 ' + skip + ' 项')
      }
      this.$emit('imported')
      this.visible = false
    },
    onClose() {
      this.tabValues = ['', '', '', '']
      this.tabNames = ['', '', '', '']
      this.manualInput = ''
      this.regionList = []
      this.selectedCodes = []
      this.codeNameMap = {}
      this.importing = false
      this.importProgress = ''
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

.dialog-footer-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
  gap: 12px;
}

.assembled-code {
  margin-right: auto;
  font-size: 14px;
  color: #606266;
}

.assembled-name {
  color: #909399;
}

.selected-count {
  margin-right: auto;
  font-size: 14px;
  color: #606266;
}
</style>
