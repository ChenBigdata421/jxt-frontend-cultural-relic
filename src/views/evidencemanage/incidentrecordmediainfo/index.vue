<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询条件 -->
        <el-form
          ref="queryForm"
          :inline="true"
          :model="queryParams"
          class="demo-form-inline"
          size="small"
        >
          <el-form-item label="拍摄时间">
            <el-date-picker
              v-model="queryParams.shotTimeStart"
              type="datetime"
              placeholder="开始时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 200px"
            />
            <span style="margin: 0 5px">至</span>
            <el-date-picker
              v-model="queryParams.shotTimeEnd"
              type="datetime"
              placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="上传时间">
            <el-date-picker
              v-model="queryParams.importTimeStart"
              type="datetime"
              placeholder="开始时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 200px"
            />
            <span style="margin: 0 5px">至</span>
            <el-date-picker
              v-model="queryParams.importTimeEnd"
              type="datetime"
              placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
            >查询</el-button>
            <el-button
              type="default"
              icon="el-icon-refresh"
              size="mini"
              @click="resetQuery"
            >重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 数据表格 -->
        <el-table
          v-loading="loading"
          :data="dataList"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="mediaName"
            label="媒体名称"
            width="150"
            align="center"
          />
          <el-table-column
            prop="mediaCate"
            label="媒体类型"
            width="120"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="policeNo"
            label="人员编号"
            width="120"
            align="center"
          />
          <el-table-column
            prop="orgFullName"
            label="组织"
            width="150"
            align="center"
          />
          <el-table-column
            prop="fileType"
            label="文件分类"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              {{ fileTypeFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="incidentRecordCode"
            label="警情号"
            width="150"
            align="center"
          />
          <el-table-column
            prop="typical"
            label="是否典型"
            width="100"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ selectDictLabel(typicalOptions, row.typical) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="typicalContext"
            label="典型分类"
            width="120"
            align="center"
          >
            <template slot-scope="scope">
              {{ typicalContextFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="note"
            label="描述"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="address"
            label="地点说明"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="caseType"
            label="事件类型"
            width="120"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ selectDictLabel(caseTypeOptions, row.caseType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="caseLevel"
            label="事件等级"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              {{ caseLevelFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="expiryTime"
            label="保存截至时间"
            width="170"
            align="center"
          />
          <el-table-column
            label="操作"
            width="100"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                @click="handleEntry(scope.row)"
              >录入</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 录入对话框 -->
        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          width="800px"
          :close-on-click-modal="false"
        >
          <el-form
            ref="entryForm"
            :model="entryForm"
            :rules="entryRules"
            label-width="140px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="警情号：" prop="incidentRecordCode">
                  <el-input
                    v-model="entryForm.incidentRecordCode"
                    placeholder="请输入警情号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文件分类：" prop="fileType">
                  <el-select
                    v-model="entryForm.fileType"
                    placeholder="请选择文件分类"
                    class="full-width"
                  >
                    <el-option
                      v-for="dict in fileTypeOptions"
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
                <el-form-item label="是否典型：" prop="typical">
                  <el-select
                    v-model="entryForm.typical"
                    placeholder="请选择是否典型"
                    class="full-width"
                  >
                    <el-option
                      v-for="dict in typicalOptions"
                      :key="dict.value"
                      :label="dict.label"
                      :value="parseInt(dict.value)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="典型分类：" prop="typicalContext">
                  <el-select
                    v-model="entryForm.typicalContext"
                    placeholder="请选择典型分类"
                    class="full-width"
                  >
                    <el-option
                      v-for="dict in typicalContextOptions"
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
                <el-form-item label="事件类型：" prop="caseType">
                  <el-select
                    v-model="entryForm.caseType"
                    placeholder="请选择事件类型"
                    class="full-width"
                  >
                    <el-option
                      v-for="dict in caseTypeOptions"
                      :key="dict.value"
                      :label="dict.label"
                      :value="parseInt(dict.value)"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="事件等级：" prop="caseLevel">
                  <el-select
                    v-model="entryForm.caseLevel"
                    placeholder="请选择事件等级"
                    class="full-width"
                  >
                    <el-option
                      v-for="dict in caseLevelOptions"
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
                <el-form-item label="保存截至时间：" prop="expiryTime">
                  <el-date-picker
                    v-model="entryForm.expiryTime"
                    type="datetime"
                    placeholder="请选择保存截至时间"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    class="full-width"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="地点说明：" prop="address">
                  <el-input
                    v-model="entryForm.address"
                    placeholder="请输入地点说明"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="描述：" prop="note">
                  <el-input
                    v-model="entryForm.note"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getIncidentRecordMediaInfos } from '@/api/evidence/evidence_manage_query_api'
import {
  addIncidentRecordMediaInfo,
  updateIncidentRecordMediaInfo
} from '@/api/evidence/evidence_manage_command_api'

export default {
  name: 'IncidentRecordMediaInfo',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 数据列表
      dataList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined
      },
      // 对话框标题
      dialogTitle: '',
      // 是否显示对话框
      dialogVisible: false,
      // 录入表单
      entryForm: {
        id: undefined,
        mediaId: undefined,
        incidentRecordCode: '',
        fileType: undefined,
        typical: undefined,
        typicalContext: undefined,
        note: '',
        address: '',
        caseType: undefined,
        caseLevel: undefined,
        expiryTime: undefined
      },
      // 表单验证规则
      entryRules: {
        fileType: [
          { required: true, message: '请选择文件分类', trigger: 'change' }
        ],
        typical: [
          { required: true, message: '请选择是否典型', trigger: 'change' }
        ]
      },
      // 字典选项
      mediaCateOptions: [],
      fileTypeOptions: [],
      typicalOptions: [],
      typicalContextOptions: [],
      caseTypeOptions: [],
      caseLevelOptions: []
    }
  },
  created() {
    this.loadDictionaries()
    this.getList()
  },
  methods: {
    /** 加载所有字典数据 */
    async loadDictionaries() {
      try {
        await Promise.all([
          this.getDicts('evidence_media_type').then((response) => {
            this.mediaCateOptions = response.data || []
          }),
          this.getDicts('file_type').then((response) => {
            this.fileTypeOptions = response.data || []
          }),
          this.getDicts('media_typical').then((response) => {
            this.typicalOptions = response.data || []
          }),
          this.getDicts('typical_context').then((response) => {
            this.typicalContextOptions = response.data || []
          }),
          this.getDicts('case_type').then((response) => {
            this.caseTypeOptions = response.data || []
          }),
          this.getDicts('case_level').then((response) => {
            this.caseLevelOptions = response.data || []
          })
        ])
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },

    /** 查询列表 */
    getList() {
      this.loading = true
      getIncidentRecordMediaInfos(this.queryParams)
        .then((response) => {
          if (response && response.data) {
            this.dataList = response.data.list || []
            this.total = response.data.count || 0
          } else {
            this.dataList = []
            this.total = 0
          }
          this.loading = false
        })
        .catch((error) => {
          console.error('查询警情媒体信息失败:', error)
          this.dataList = []
          this.total = 0
          this.loading = false
        })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined
      }
      this.handleQuery()
    },

    /** 录入按钮操作 */
    handleEntry(row) {
      this.resetEntryForm()

      // 填充表单数据
      this.entryForm = {
        id: row.id || undefined,
        mediaId: row.mediaId || undefined,
        incidentRecordCode: row.incidentRecordCode || '',
        fileType: row.fileType !== undefined ? row.fileType : undefined,
        typical: row.typical !== undefined ? row.typical : undefined,
        typicalContext:
          row.typicalContext !== undefined ? row.typicalContext : undefined,
        note: row.note || '',
        address: row.address || '',
        caseType: row.caseType !== undefined ? row.caseType : undefined,
        caseLevel: row.caseLevel !== undefined ? row.caseLevel : undefined,
        expiryTime: row.expiryTime || undefined
      }

      this.dialogTitle = row.id ? '编辑警情媒体信息' : '新增警情媒体信息'
      this.dialogVisible = true
    },

    /** 提交表单 */
    handleSubmit() {
      this.$refs.entryForm.validate((valid) => {
        if (valid) {
          if (this.entryForm.id !== '00000000-0000-0000-0000-000000000000') {
            // 修改
            updateIncidentRecordMediaInfo(this.entryForm, this.entryForm.id)
              .then((response) => {
                this.msgSuccess('修改成功')
                this.dialogVisible = false
                setTimeout(() => {
                  this.getList()
                }, 2000)
              })
              .catch((error) => {
                this.msgError('修改失败：' + (error.message || '未知错误'))
              })
          } else {
            // 新增
            addIncidentRecordMediaInfo(this.entryForm)
              .then((response) => {
                this.msgSuccess('新增成功')
                this.dialogVisible = false
                setTimeout(() => {
                  this.getList()
                }, 2000)
              })
              .catch((error) => {
                this.msgError('新增失败：' + (error.message || '未知错误'))
              })
          }
        }
      })
    },

    /** 重置录入表单 */
    resetEntryForm() {
      this.entryForm = {
        id: undefined,
        mediaId: undefined,
        incidentRecordCode: '',
        fileType: undefined,
        typical: undefined,
        typicalContext: undefined,
        note: '',
        address: '',
        caseType: undefined,
        caseLevel: undefined,
        expiryTime: undefined
      }
      this.$nextTick(() => {
        if (this.$refs.entryForm) {
          this.$refs.entryForm.clearValidate()
        }
      })
    },

    /** 文件分类格式化 */
    fileTypeFormat(row) {
      try {
        if (!row || row.fileType === undefined || row.fileType === null) {
          return '-'
        }
        if (!this.fileTypeOptions || this.fileTypeOptions.length === 0) {
          return '-'
        }
        if (typeof this.selectDictLabel === 'function') {
          return (
            this.selectDictLabel(
              this.fileTypeOptions,
              parseInt(row.fileType)
            ) || '-'
          )
        }
        const option = this.fileTypeOptions.find(
          (item) => item.value === String(row.fileType)
        )
        return option ? option.label : '-'
      } catch (error) {
        console.error('fileTypeFormat error:', error)
        return '-'
      }
    },

    /** 典型分类格式化 */
    typicalContextFormat(row) {
      try {
        if (
          !row ||
          row.typicalContext === undefined ||
          row.typicalContext === null
        ) {
          return '-'
        }
        if (
          !this.typicalContextOptions ||
          this.typicalContextOptions.length === 0
        ) {
          return '-'
        }
        if (typeof this.selectDictLabel === 'function') {
          return (
            this.selectDictLabel(
              this.typicalContextOptions,
              parseInt(row.typicalContext)
            ) || '-'
          )
        }
        const option = this.typicalContextOptions.find(
          (item) => item.value === String(row.typicalContext)
        )
        return option ? option.label : '-'
      } catch (error) {
        console.error('typicalContextFormat error:', error)
        return '-'
      }
    },

    /** 事件等级格式化 */
    caseLevelFormat(row) {
      try {
        if (!row || row.caseLevel === undefined || row.caseLevel === null) {
          return '-'
        }
        if (!this.caseLevelOptions || this.caseLevelOptions.length === 0) {
          return '-'
        }
        if (typeof this.selectDictLabel === 'function') {
          return (
            this.selectDictLabel(
              this.caseLevelOptions,
              parseInt(row.caseLevel)
            ) || '-'
          )
        }
        const option = this.caseLevelOptions.find(
          (item) => item.value === String(row.caseLevel)
        )
        return option ? option.label : '-'
      } catch (error) {
        console.error('caseLevelFormat error:', error)
        return '-'
      }
    }
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
