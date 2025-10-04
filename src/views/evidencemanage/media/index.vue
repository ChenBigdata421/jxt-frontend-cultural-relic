<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用媒体选择器组件 -->
        <MediaSelector
          ref="mediaSelector"
          :selection-mode="false"
          @add="handleAdd"
          @update="handleUpdate"
          @delete="handleDelete"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-col :span="1.5">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增媒体</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="single"
                @click="handleUpdate"
              >修改</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
              >删除</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-edit" type="primary" size="mini" @click="onSmartMark">智能标注</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-document" type="success" size="mini" @click="onManualMark">手动标注</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-close" type="danger" size="mini" @click="onNoMark">标注不是执法视频</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-setting" size="mini" @click="onLog">日志管理</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-show="showDownload"
                icon="el-icon-download"
                type="warning"
                size="mini"
                @click="onDownload"
              >下载</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button v-show="showTransfer" icon="el-icon-s-custom" size="mini" @click="onTransfer">移交</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-save" size="mini" @click="onSaveCols">保存列头</el-button>
            </el-col>
          </template>
        </MediaSelector>

        <!-- 下载类型选择对话框 -->
        <el-dialog title="选择下载类型" :visible.sync="downloadDialogVisible">
          <el-form ref="downloadForm">
            <el-form-item label="文件类型">
              <el-radio-group v-model="downloadForm.fileType">
                <el-radio label="3">FLV文件</el-radio>
                <el-radio label="2">MP4文件</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="downloadDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmitDownload">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 添加或修改媒体对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="750px" :close-on-click-modal="false">
          <div class="form-container">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
              <!-- 基础信息 -->
              <div class="form-section">
                <div class="form-section-title">基础信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="媒体名称：" prop="mediaName">
                      <el-input v-model="form.mediaName" placeholder="请输入媒体名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="媒体类型：" prop="mediaCate">
                      <el-select v-model="form.mediaCate" placeholder="请选择媒体类型" class="full-width">
                        <el-option
                          v-for="dict in mediaCateOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="parseInt(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="单位组织：" prop="orgId">
                      <treeselect
                        v-model="form.orgId"
                        :options="orgOptions"
                        placeholder="请选择单位组织"
                        @select="handleFormOrgSelect"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="拍摄警员：" prop="policeId">
                      <el-select
                        v-model="form.policeId"
                        placeholder="请选择拍摄警员"
                        clearable
                        class="full-width"
                        @change="handleFormPoliceSelect"
                      >
                        <el-option
                          v-for="item in userOptions"
                          :key="item.userId"
                          :label="item.userName"
                          :value="item.userId"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="执法仪：" prop="recorderId">
                      <el-select v-model="form.recorderId" placeholder="请选择执法仪" clearable class="full-width">
                        <el-option
                          v-for="item in lawcameraOptions"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="存储方式：" prop="storageType">
                      <el-select v-model="form.storageType" placeholder="请选择存储方式" class="full-width">
                        <el-option
                          v-for="dict in storageTypeOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="parseInt(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="数据来源：" prop="dataSource">
                      <el-select v-model="form.dataSource" placeholder="请选择数据来源" class="full-width">
                        <el-option label="采集站" value="0" />
                        <el-option label="采集客户端" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="执法类型：" prop="enforType">
                      <treeselect
                        v-model="form.enforType"
                        :options="enforcementTypeLabel"
                        :normalizer="normalizeEnforcementType"
                        placeholder="请选择执法类型"
                        style="width: 200px;"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="认证码：" prop="authKey">
                      <el-input v-model="form.authKey" placeholder="请输认证码" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="媒体后缀：" prop="mediaSuffix">
                      <el-input v-model="form.mediaSuffix" placeholder="请输媒体后缀" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 时间信息 -->
              <div class="form-section">
                <div class="form-section-title">时间信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="拍摄开始时间：" prop="shotTimeStart">
                      <el-date-picker
                        v-model="form.shotTimeStart"
                        type="datetime"
                        placeholder="选择拍摄开始时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="拍摄结束时间：" prop="shotTime">
                      <el-date-picker
                        v-model="form.shotTime"
                        type="datetime"
                        placeholder="选择拍摄结束时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="导入开始时间：" prop="importTimeStart">
                      <el-date-picker
                        v-model="form.importTimeStart"
                        type="datetime"
                        placeholder="选择导入开始时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="导入结束时间：" prop="importTimeEnd">
                      <el-date-picker
                        v-model="form.importTimeEnd"
                        type="datetime"
                        placeholder="选择导入结束时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="submitForm">确 定</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { delMedia, addMedia, updateMedia, batchDelMedia } from '@/api/evidence/evidence_manage_command_api'
import { getMedia, getEnforcementTypeTree } from '@/api/evidence/evidence_manage_query_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import { getEquipmentLawcameraList } from '@/api/admin/equipment_manage_api'
import MediaSelector from '@/components/MediaSelector'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'MediaManage',
  components: {
    MediaSelector,
    Treeselect
  },
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 是否显示下载文件类型选择对话框
      downloadDialogVisible: false,
      downloadForm: {
        fileType: ''
      },
      showDownload: false,
      showTransfer: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 执法仪选项
      lawcameraOptions: [],
      // 媒体类型数据字典
      mediaCateOptions: [],
      // 表单校验
      rules: {
        mediaName: [
          { required: true, message: '媒体名称不能为空', trigger: 'blur' }
        ],
        mediaCate: [
          { required: true, message: '媒体类型不能为空', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'form.orgId': function(newVal) {
      // 当表单中的组织ID变化时，自动获取该组织的用户列表
      if (newVal) {
        this.handleFormOrgSelect({ id: newVal })
      }
    }
  },
  created() {
    this.getTreeselect()
    this.getEnforcementTypeTreeselect()
    this.getDicts('evidence_media_type').then(response => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('evidence_storage_type').then(response => {
      this.storageTypeOptions = response.data
    })
    this.getDicts('relation_status').then(response => {
      this.mediaRelationStatusOptions = response.data
    })
  },
  methods: {

   // 字典状态字典翻译
    relationStatusFormat(row) {
      return this.selectDictLabel(this.mediaRelationStatusOptions, parseInt(row.isAssociated))
    },

    /** 获取执法类型树形数据 */
    getEnforcementTypeTreeselect() {
      getEnforcementTypeTree().then(response => {
        this.enforcementTypeLabel = response.data.list || response.data || []
      }).catch(() => {
        // 如果树形接口不存在，设置为空数组
        this.enforcementTypeLabel = []
      })
    },

    /** 执法类型数据结构转换 当你的数据格式与 vue-treeselect 默认期望的格式不一致时，使用 normalizer 进行格式转换*/
    normalizeEnforcementType(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id, // 将你数据中的 node.id 映射为 vue-treeselect 的id
        label: node.enforcementTypeName || node.label || '未知', // 将你数据中的 node.enforcementTypeName 映射为 vue-treeselect 的label
        children: node.children // 将你的数据中的 children 映射为 children
      }
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.mediaId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    onSmartMark() {
      // 智能标注逻辑
    },
    onManualMark() {
      // 手动标注逻辑
    },
    onNoMark() {
      // 标注不是执法视频逻辑
    },
    onLog() {
      // 日志管理逻辑
    },
    onDownload() {
      this.downloadDialogVisible = true
    },
    onTransfer() {
      // 移交逻辑
    },
    onSaveCols() {
      // 保存列头逻辑
    },
    onSubmitDownload() {
      // 提交下载逻辑
      this.downloadDialogVisible = false
    },

    // 表单重置
    reset() {
      this.form = {
        mediaName: undefined,
        mediaCate: undefined,
        policeId: undefined,
        orgId: undefined,
        recorderId: undefined,
        storageType: undefined,
        dataSource: undefined,
        enforType: undefined,
        mediaSuffix: undefined,
        shotTimeStart: undefined,
        shotTime: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined
      }
      // 重置下拉选项
      this.userOptions = []
      this.lawcameraOptions = []
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加媒体'
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const mediaId = row.id || this.ids[0]
      getMedia(mediaId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改媒体'
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateMedia(this.form, this.form.id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.$refs.mediaSelector.refresh()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addMedia(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.$refs.mediaSelector.refresh()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      var mediaIds
      if (this.ids.length > 1) {
        mediaIds = this.ids
      } else {
        mediaIds = row.id || this.ids[0]
      }

      const confirmMessage = Array.isArray(mediaIds)
        ? `是否确认删除选中的${mediaIds.length}条媒体数据项?`
        : '是否确认删除选中的媒体数据项?'

      this.$confirm(confirmMessage, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (Array.isArray(mediaIds)) {
          return batchDelMedia({ 'ids': mediaIds })
        } else {
          return delMedia(mediaIds)
        }
      }).then((response) => {
        setTimeout(() => {
          this.$refs.mediaSelector.refresh()
        }, 2000)
        this.msgSuccess(response.msg)
      }).catch(() => { })
    },

    handleOperation(row) {
      // 操作按钮逻辑
      console.log('操作', row)
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then(response => {
        this.orgOptions = response.data
      })
    },

    /** 查询条件-组织选择事件 */
    handleOrgSelect(node) {
      if (node) {
        listUser({ orgId: '/' + node.id + '/' }).then(response => {
          this.userOptions = response.data.list
        })
      } else {
        this.userOptions = []
      }
    },

    /** 表单-组织选择事件 */
    handleFormOrgSelect(node) {
      if (node) {
        listUser({ orgId: '/' + node.id + '/' }).then(response => {
          this.userOptions = response.data.list
        })
        // 清空警员和执法仪选择
        this.form.policeId = undefined
        this.form.recorderId = undefined
        this.lawcameraOptions = []
      } else {
        this.userOptions = []
        this.form.policeId = undefined
        this.form.recorderId = undefined
        this.lawcameraOptions = []
      }
    },

    /** 表单-警员选择事件 */
    handleFormPoliceSelect(policeId) {
      if (policeId) {
        // 根据警员ID获取其管理的执法仪列表
        getEquipmentLawcameraList({ managerId: policeId }).then(response => {
          this.lawcameraOptions = response.data.list || []
        })
        // 清空执法仪选择
        this.form.recorderId = undefined
      } else {
        this.lawcameraOptions = []
        this.form.recorderId = undefined
      }
    }
  }
}
</script>

<style scoped>
.video-management {
  padding: 20px;
}

.head-bars {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.horizontal-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-container {
  padding: 10px 20px;
}

.form-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.form-section-title {
  font-size: 16px;
  color: #409EFF;
  margin-bottom: 15px;
  font-weight: bold;
}

.el-form-item {
  margin-bottom: 18px;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  text-align: right;
  padding: 20px;
  border-top: 1px solid #e6e6e6;
}

/* Treeselect组件样式 */
.vue-treeselect {
  width: 100%;
}

.vue-treeselect__control {
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.vue-treeselect__placeholder {
  color: #c0c4cc;
}

.vue-treeselect__single-value {
  color: #606266;
}
</style>
