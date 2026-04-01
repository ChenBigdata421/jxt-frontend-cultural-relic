<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <CaseQueryBar
          ref="queryBar"
          :case-type-options="caseTypeOptions"
          :relation-status-options="caseRelationStatusOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @filter-change="handleFilterChange"
          @filter-reset="handleFilterReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedCaseRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['case:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增案件
            </el-button>
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-button
              v-permisaction="['case:bwc:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['case:bwc:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedCaseRecords.length === 0"
              @click="handleBatchDeleteSelected"
            >
              删除
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover
              ref="columnSettingsPopover"
              placement="bottom-end"
              width="300"
              trigger="click"
              popper-class="column-settings-popover"
              :visible-arrow="true"
              @after-enter="handleColumnSettingsOpen"
              @after-leave="handleColumnSettingsClose"
            >
              <div
                role="dialog"
                aria-label="列显示设置"
                class="column-settings"
              >
                <div class="column-settings-header">
                  <span class="column-settings-title">列显示设置</span>
                  <el-button
                    type="text"
                    size="small"
                    class="column-settings-reset"
                    @click="resetColumns"
                  >
                    重置
                  </el-button>
                </div>
                <el-checkbox-group
                  v-model="visibleColumns"
                  @change="handleColumnChange"
                >
                  <div
                    v-for="col in columnOptions"
                    :key="col.prop"
                    class="column-item"
                  >
                    <el-checkbox
                      :label="col.prop"
                      :disabled="col.fixed"
                      :aria-label="col.fixed ? `${col.label}（必须显示）` : col.label"
                    >
                      {{ col.label }}
                      <el-tooltip
                        v-if="col.fixed"
                        content="此列必须显示，不能隐藏"
                        placement="top"
                      >
                        <i class="el-icon-info column-item-icon" />
                      </el-tooltip>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button
                slot="reference"
                size="small"
                icon="el-icon-setting"
                type="text"
                class="action-btn tertiary"
                aria-label="打开列设置"
                aria-haspopup="dialog"
              >
                列设置
              </el-button>
            </el-popover>
          </div>
        </div>

        <!-- 案件列表 -->
        <el-table
          ref="caseTable"
          v-loading="loading"
          :data="caseList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            v-if="isColumnVisible('caseCode')"
            label="案件编号"
            align="center"
            prop="caseCode"
            width="150"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('caseName')"
            label="案件名称"
            align="center"
            prop="caseName"
            width="200"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('caseType')"
            label="案件类型"
            align="center"
            prop="caseType"
            width="120"
          >
            <template slot-scope="scope">
              {{ caseTypeFormatter(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('caseFlow')"
            label="案件流程"
            align="center"
            prop="caseFlow"
            width="120"
          >
            <template slot-scope="scope">
              {{ caseFlowFormatter(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('caseTime')"
            label="案发时间"
            align="center"
            prop="caseTime"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.caseTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('caseAddress')"
            label="案发地址"
            align="center"
            prop="caseAddress"
            width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('caseOrgName')"
            label="办案单位"
            align="center"
            prop="caseOrgName"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('procOrgPaths')"
            label="处警单位"
            align="center"
            prop="procOrgPaths"
            width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('processPoliceNames')"
            label="处警人员"
            align="center"
            prop="processPoliceNames"
            width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('procTime')"
            label="处警时间"
            align="center"
            prop="procTime"
            width="150"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.procTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('isRelation')"
            label="是否关联"
            align="center"
            prop="isRelation"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.isRelation === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ relationStatusFormatter(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('createdAt')"
            label="创建时间"
            align="center"
            prop="createdAt"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="300"
            class-name="small-padding fixed-width"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['case:view']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['case:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['case:remove']"
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-button
                  v-permisaction="['case:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleAnnotate(scope.row)"
                >
                  标注
                </el-button>
              </div>
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
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="800px"
        :close-on-click-modal="false"
        append-to-body
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules">
          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">{{ basicFieldCount }}项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="案件名称" prop="caseName">
                    <el-input
                      v-model="form.caseName"
                      placeholder="请输入案件名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="案件类型" prop="caseType">
                    <el-select
                      v-model="form.caseType"
                      placeholder="请选择案件类型"
                      class="full-width"
                      @change="handleCaseTypeChange"
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
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="案件流程" prop="caseFlow">
                    <el-select
                      v-model="form.caseFlow"
                      placeholder="请选择案件流程"
                      class="full-width"
                    >
                      <el-option
                        v-for="dict in formCaseFlowOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="parseInt(dict.value)"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="办案单位" prop="caseOrgId">
                    <treeselect
                      v-model="form.caseOrgId"
                      :options="orgOptions"
                      placeholder="请选择办案单位"
                      :editable="false"
                      :append-to-body="true"
                      :z-index="9999"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="处警单位" prop="procOrgId">
                    <treeselect
                      v-model="form.procOrgId"
                      :options="orgOptions"
                      placeholder="请选择处警单位"
                      :editable="false"
                      :append-to-body="true"
                      :z-index="9999"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="处警人员">
                    <el-select
                      v-model="form.processPoliceIds"
                      placeholder="请选择处警人员"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      class="full-width"
                    >
                      <el-option
                        v-for="item in formUserOptions"
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
                  <el-form-item label="接警编号" prop="receiptIncidentRecordNum">
                    <el-input
                      v-model="form.receiptIncidentRecordNum"
                      placeholder="请输入接警编号"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="处警编号" prop="disposalIncidentRecordNum">
                    <el-input
                      v-model="form.disposalIncidentRecordNum"
                      placeholder="请输入处警编号"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="案发地址" prop="caseAddress">
                    <el-input
                      v-model="form.caseAddress"
                      placeholder="请输入案发地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="接警内容" prop="incidentRecordContext">
                    <el-input
                      v-model="form.incidentRecordContext"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入接警内容"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="处警过程描述" prop="procResult">
                    <el-input
                      v-model="form.procResult"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入处警过程描述"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 时间信息 - 带时间线可视化 -->
            <el-collapse-item name="timeline" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-time section-icon" />
                  <span class="section-title">时间流程</span>
                  <span class="section-badge">{{ timelineFieldCount }}项</span>
                </div>
              </template>

              <!-- 时间线可视化 -->
              <div class="timeline-preview">
                <div class="timeline-item" :class="{ active: form.caseTime }">
                  <span class="timeline-dot" />
                  <span class="timeline-label">案发</span>
                </div>
                <div class="timeline-line" />
                <div class="timeline-item" :class="{ active: form.procTime }">
                  <span class="timeline-dot" />
                  <span class="timeline-label">处警</span>
                </div>
              </div>

              <el-row :gutter="20" class="time-inputs">
                <el-col :span="12">
                  <el-form-item label="案发时间" prop="caseTime">
                    <el-date-picker
                      v-model="form.caseTime"
                      type="datetime"
                      placeholder="选择案发时间"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="处警时间" prop="procTime">
                    <el-date-picker
                      v-model="form.procTime"
                      type="datetime"
                      placeholder="选择处警时间"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="tertiary" size="small" @click="cancel">取 消</el-button>
          <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 案件标注对话框 -->
      <el-dialog
        title="案件标注"
        :visible.sync="annotateOpen"
        width="500px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form
          ref="annotateForm"
          :model="annotateForm"
          :rules="annotateRules"
          label-width="100px"
        >
          <el-form-item label="案件流程" prop="caseFlow">
            <el-select
              v-model="annotateForm.caseFlow"
              placeholder="请选择案件流程"
              class="full-width"
            >
              <el-option
                v-for="dict in annotateCaseFlowOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="tertiary" size="small" @click="cancelAnnotate">取 消</el-button>
          <el-button type="primary" size="small" @click="submitAnnotate">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 详情对话框 -->
      <el-dialog
        title="案件详情"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="detail-dialog"
      >
        <el-collapse v-model="activeDetailSections" class="form-collapse">

          <!-- 基础信息 -->
          <el-collapse-item name="basic" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-document section-icon" />
                <span class="section-title">基础信息</span>
                <span class="section-badge">{{ detailBasicFieldCount }}项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="案件编号">
                <span class="nowrap-text">{{ viewData.caseCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="案件名称">
                {{ viewData.caseName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="案件类型">
                {{ caseTypeFormatter(viewData) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="案件流程">
                {{ caseFlowFormatter(viewData) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="案发地址" :span="2">
                {{ viewData.caseAddress || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="接警内容" :span="2">
                {{ viewData.incidentRecordContext || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警过程描述" :span="2">
                {{ viewData.procResult || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 时间流程 - 带时间线可视化 -->
          <el-collapse-item name="timeline" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-time section-icon" />
                <span class="section-title">时间流程</span>
                <span class="section-badge">{{ detailTimelineFieldCount }}项</span>
              </div>
            </template>

            <!-- 时间线可视化 -->
            <div class="timeline-preview">
              <div class="timeline-item" :class="{ active: viewData.caseTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">案发</span>
              </div>
              <div class="timeline-line" />
              <div class="timeline-item" :class="{ active: viewData.procTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">处警</span>
              </div>
            </div>

            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="案发时间">
                {{ parseTime(viewData.caseTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警时间">
                {{ parseTime(viewData.procTime) || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 组织与人员 -->
          <el-collapse-item name="organization" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-office-building section-icon" />
                <span class="section-title">组织与人员</span>
                <span class="section-badge">{{ detailOrganizationFieldCount }}项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="办案单位">
                {{ viewData.caseOrgName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警单位">
                {{ viewData.procOrgName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警人员">
                {{ viewData.processPoliceNames || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 编号信息 -->
          <el-collapse-item name="numbers" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-tickets section-icon" />
                <span class="section-title">编号信息</span>
                <span class="section-badge">{{ detailNumbersFieldCount }}项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="接警编号">
                <span class="nowrap-text">{{ viewData.receiptIncidentRecordNum || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="处警编号">
                <span class="nowrap-text">{{ viewData.disposalIncidentRecordNum || "-" }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 状态与操作 -->
          <el-collapse-item name="status" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">状态与操作</span>
                <span class="section-badge">{{ detailStatusFieldCount }}项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="是否关联">
                <el-tag
                  :type="viewData.isRelation === 1 ? 'success' : 'info'"
                  size="small"
                  effect="dark"
                >
                  {{ relationStatusFormatter(viewData) || "-" }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ parseTime(viewData.createdAt) || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listCases,
  addCase,
  updateCase,
  delCase,
  batchDelCases,
  updateCaseFlow
} from '@/api/evidence/case_api'
import { orgTreeselect } from '@/api/admin/sys-organization'
import { listUser } from '@/api/admin/sys-user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import { formatJson } from '@/utils'
import CaseQueryBar from '@/components/CaseQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'

export default {
  name: 'CaseManage',
  components: {
    BasicLayout,
    Treeselect,
    Pagination,
    CaseQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 案件表格数据
      caseList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示标注对话框
      annotateOpen: false,
      // 是否显示详情对话框
      viewOpen: false,
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 详情对话框折叠状态 (默认展开: 基础信息、时间流程)
      activeDetailSections: ['basic', 'timeline'],
      // 组织树选项
      orgOptions: [],
      // 用户选项
      userOptions: [],
      // 案件类型字典
      caseTypeOptions: [],
      // 查询表单的案件流程字典
      adminCaseProcessOptions: [],
      criminalCaseProcessOptions: [],
      // 添加/修改表单的案件流程字典
      formCaseFlowOptions: [],
      // 标注对话框的案件流程字典
      annotateCaseFlowOptions: [],
      // 关联状态字典
      caseRelationStatusOptions: [],
      // 添加/修改表单的用户选项
      formUserOptions: [],
      // 首次加载标志
      firstLoad: true,
      // 使用 Map 存储所有选中的项（跨分页）
      selectedCaseMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的案件记录
      selectedCaseRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        caseOrgId: undefined,
        caseFlow: undefined,
        isRelation: undefined,
        // 高级筛选字段
        caseAddress: undefined,
        processPoliceIds: undefined,
        // 时间范围字段
        caseTimeStart: undefined,
        caseTimeEnd: undefined,
        procTimeStart: undefined,
        procTimeEnd: undefined,
        // 快捷筛选字段
        caseTimeRangeStart: undefined,
        caseTimeRangeEnd: undefined,
        createUserId: undefined
      },
      // 表单参数
      form: {},
      // 标注表单
      annotateForm: {},
      // 详情数据
      viewData: {},
      // 表单校验
      rules: {
        caseName: [
          { required: true, message: '案件名称不能为空', trigger: 'blur' }
        ],
        caseType: [
          { required: true, message: '案件类型不能为空', trigger: 'change' }
        ],
        caseOrgId: [
          { required: true, message: '办案单位不能为空', trigger: 'change' }
        ],
        caseTime: [
          { required: true, message: '案发时间不能为空', trigger: 'change' }
        ]
      },
      // 标注表单校验
      annotateRules: {
        caseFlow: [
          { required: true, message: '案件流程不能为空', trigger: 'change' }
        ]
      },
      // 列配置选项
      columnOptions: [
        { prop: 'caseCode', label: '案件编号', fixed: true, defaultVisible: true },
        { prop: 'caseName', label: '案件名称', defaultVisible: true },
        { prop: 'caseType', label: '案件类型', defaultVisible: true },
        { prop: 'caseFlow', label: '案件流程', defaultVisible: true },
        { prop: 'caseTime', label: '案发时间', defaultVisible: true },
        { prop: 'caseAddress', label: '案发地址', defaultVisible: true },
        { prop: 'caseOrgName', label: '办案单位', defaultVisible: true },
        { prop: 'procOrgPaths', label: '处警单位', defaultVisible: false },
        { prop: 'processPoliceNames', label: '处警人员', defaultVisible: true },
        { prop: 'procTime', label: '处警时间', defaultVisible: true },
        { prop: 'isRelation', label: '是否关联', defaultVisible: true },
        { prop: 'createdAt', label: '创建时间', defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      processingInstance: null, // Element UI全局加载动画的实例
      previousCursor: null // 记录鼠标状态
    }
  },
  computed: {
    // 基础信息分组字段数量
    basicFieldCount() {
      // 案件名称、案件类型、案件流程、办案单位、处警单位、处警人员、接警编号、处警编号、案发地址、接警内容、处警过程描述
      return 11
    },
    // 时间流程分组字段数量
    timelineFieldCount() {
      // 案发时间、处警时间
      return 2
    },
    // 详情对话框 - 基础信息字段数量
    detailBasicFieldCount() {
      // 案件编号、案件名称、案件类型、案件流程、案发地址、接警内容、处警过程描述
      return 7
    },
    // 详情对话框 - 时间流程字段数量
    detailTimelineFieldCount() {
      // 案发时间、处警时间
      return 2
    },
    // 详情对话框 - 组织与人员字段数量
    detailOrganizationFieldCount() {
      // 办案单位、处警单位、处警人员
      return 3
    },
    // 详情对话框 - 编号信息字段数量
    detailNumbersFieldCount() {
      // 接警编号、处警编号
      return 2
    },
    // 详情对话框 - 状态与操作字段数量
    detailStatusFieldCount() {
      // 是否关联、创建时间
      return 2
    }
  },
  watch: {
    'form.procOrgId': function(newVal) {
      // 当处警单位更新时，加载该单位的用户
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空处警人员
          this.form.processPoliceIds = []
        }
        this.firstLoad = false
        this.getFormUser()
      }
    }
  },
  created() {
    this.initVisibleColumns()
    this.getOrgTree()
    this.getUserList()
    Promise.all([
      this.getDicts('case_type'),
      this.getDicts('admin_case_process'),
      this.getDicts('criminal_case_process'),
      this.getDicts('relation_status')
    ])
      .then(
        ([
          caseTypeRes,
          adminCaseProcessRes,
          criminalCaseProcessRes,
          relationStatusRes
        ]) => {
          this.caseTypeOptions = caseTypeRes.data
          this.adminCaseProcessOptions = adminCaseProcessRes.data
          this.criminalCaseProcessOptions = criminalCaseProcessRes.data
          this.caseRelationStatusOptions = relationStatusRes.data
          this.getList()
        }
      )
      .catch((error) => {
        console.error('[CaseQuery] 字典加载失败:', error)
        this.getList()
      })
  },
  methods: {
    // 案件类型字典翻译
    caseTypeFormatter(row) {
      return this.selectDictLabel(this.caseTypeOptions, row.caseType)
    },
    // 案件流程字典翻译
    caseFlowFormatter(row) {
      return this.getCaseFlowLabel(row.caseFlow, row.caseType)
    },
    // 关联状态字典翻译
    relationStatusFormatter(row) {
      return this.selectDictLabel(
        this.caseRelationStatusOptions,
        row.isRelation
      )
    },

    /** 查询案件列表 */
    getList() {
      this.loading = true

      const query = this.normalizeQueryParams(this.queryParams)

      listCases(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.caseList = response.data.list || []
            this.total = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.caseList = []
            this.total = 0
            this.msgError(response.msg || '获取案件列表失败')
          }
        })
        .catch((error) => {
          this.caseList = []
          this.total = 0
          this.msgError('获取案件列表失败:' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 获取组织树 */
    getOrgTree() {
      orgTreeselect().then((response) => {
        this.orgOptions = response.data
      })
    },
    /** 获取用户列表 */
    getUserList() {
      listUser({ pageIndex: 1, pageSize: 1000 }).then((response) => {
        this.userOptions = response.data.list || []
      })
    },
    /** 获取表单中处警单位的用户列表 */
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.form.procOrgId + '/' })
          .then((response) => {
            this.formUserOptions = response.data.list || []
            resolve('true')
          })
          .catch((error) => {
            console.error('获取用户失败:', error)
            this.formUserOptions = []
            reject(error)
          })
      })
    },

    /** 获取案件流程标签 - 用于详情显示 */
    getCaseFlowLabel(value, caseType) {
      // 根据案件类型确定字典类型
      if (this.caseTypeOptions && this.caseTypeOptions.length > 0) {
        const caseTypeDict = this.caseTypeOptions.find(
          (item) => item.value === caseType || item.value === String(caseType)
        )
        if (caseTypeDict) {
          if (caseTypeDict.label.includes('行政')) {
            return this.selectDictLabel(this.adminCaseProcessOptions, value)
          } else if (caseTypeDict.label.includes('刑事')) {
            return this.selectDictLabel(this.criminalCaseProcessOptions, value)
          }
        }
      }
      return value
    },
    /** 查询表单案件类型变更时，加载对应的流程字典 */
    handleQueryCaseTypeChange(value) {
      // 清空案件流程
      this.queryParams.caseFlow = undefined
      // 根据案件类型加载对应的流程字典
      this.loadCaseFlowDict(value, 'query')
    },
    /** 添加/修改表单案件类型变更时，加载对应的流程字典 */
    handleCaseTypeChange(value) {
      // 清空案件流程
      this.form.caseFlow = undefined
      // 根据案件类型加载对应的流程字典
      this.loadCaseFlowDict(value, 'form')
    },
    /** 加载案件流程字典 */
    loadCaseFlowDict(caseTypeValue, target) {
      // 根据案件类型加载对应的流程字典
      // 行政案件 -> admin_case_process
      // 刑事案件 -> criminal_case_process
      const caseTypeDict = this.caseTypeOptions.find(
        (item) =>
          item.value === caseTypeValue || item.value === String(caseTypeValue)
      )
      if (caseTypeDict) {
        if (caseTypeDict.label.includes('行政')) {
          if (target === 'query') {
            this.caseFlowOptions = this.adminCaseProcessOptions
          } else if (target === 'form') {
            this.formCaseFlowOptions = this.adminCaseProcessOptions
          } else if (target === 'annotate') {
            this.annotateCaseFlowOptions = this.adminCaseProcessOptions
          }
        } else if (caseTypeDict.label.includes('刑事')) {
          if (target === 'query') {
            this.caseFlowOptions = this.criminalCaseProcessOptions
          } else if (target === 'form') {
            this.formCaseFlowOptions = this.criminalCaseProcessOptions
          } else if (target === 'annotate') {
            this.annotateCaseFlowOptions = this.criminalCaseProcessOptions
          }
        }
      }
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedCaseMap = {}
      this.selectedCaseRecords = []
    },

    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
    },

    handleQuery() {
      this.resetSelected()
      this.resetPage()
      this.getList()
    },
    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表（这些字段可能被用户清空）
      const quickSearchFields = ['caseCode', 'caseName', 'caseType', 'isRelation']

      // 高级筛选中的时间范围字段列表
      const timeRangeFields = [
        'caseTimeStart', 'caseTimeEnd',
        'procTimeStart', 'procTimeEnd'
      ]

      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的快速搜索字段
      quickSearchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      // 删除被清空的时间范围字段
      timeRangeFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      this.handleQuery()
    },

    handleQuickSearchReset() {
      // 重置所有筛选条件（与全局重置保持一致）
      this.handleFilterReset()
    },

    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'today') {
        // 今日案件
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.caseTimeStart = today.toISOString()
        delete this.queryParams.caseTimeEnd
      } else if (filterData.filterType === 'mine') {
        // 我的案件 - 需要从 store 获取当前用户
        const currentUser = this.$store.state.user && this.$store.state.user.user
        if (currentUser && currentUser.userId) {
          this.queryParams.createUserId = currentUser.userId
        }
      } else if (filterData.filterType === 'pending') {
        // 待处理
        this.queryParams.caseFlow = 0
      } else if (filterData.filterType === 'archived') {
        // 已归档
        this.queryParams.caseFlow = 3
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数（移除 filterType，只保留实际的查询条件）
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        // 删除被清空的时间范围字段
        const timeRangeFields = [
          'caseTimeStart', 'caseTimeEnd',
          'procTimeStart', 'procTimeEnd'
        ]
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.caseTimeStart
        delete this.queryParams.caseTimeEnd
        delete this.queryParams.createUserId
        delete this.queryParams.caseFlow
      }
      this.handleQuery()
    },

    handleFilterReset() {
      // 重置所有筛选条件到初始值
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        caseOrgId: undefined,
        caseFlow: undefined,
        isRelation: undefined,
        // 清空高级筛选的字段
        caseAddress: undefined,
        processPoliceIds: undefined,
        // 清空时间范围
        caseTimeStart: undefined,
        caseTimeEnd: undefined,
        procTimeStart: undefined,
        procTimeEnd: undefined,
        // 清空快捷筛选的字段
        createUserId: undefined
      }
      this.handleQuery()
    },

    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.caseTable.toggleAllSelection()
    },

    handleBatchDeleteSelected() {
      // 删除选中的案件记录
      this.handleDelete()
    },

    handleRefresh() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 列设置对话框打开后的焦点管理 */
    handleColumnSettingsOpen() {
      // 等待 DOM 更新后将焦点移到第一个复选框
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },

    /** 列设置对话框关闭后的焦点管理 */
    handleColumnSettingsClose() {
      // 焦点自动返回触发按钮，无需额外处理
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'caseTimeStart' ||
            key === 'caseTimeEnd' ||
            key === 'procTimeStart' ||
            key === 'procTimeEnd') &&
          typeof value === 'string'
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString()
          }
        }
      })
      return query
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      // 鼠标切换为等待状态
      this.previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      // 恢复鼠标状态
      document.body.style.cursor = this.previousCursor
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.caseList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedCaseMap[id] = row
        } else {
          delete this.selectedCaseMap[id]
        }
      })
      this.selectedCaseRecords = Object.values(this.selectedCaseMap).filter(
        Boolean
      )

      // 更新全选状态
      const totalCount = this.caseList.length
      const selectedCount = this.selectedCaseRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    handleSortChang(column, prop, order) {
      prop = column.prop
      order = column.order
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }

      this.getList()
    },

    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.caseTable) return
      if (!this.caseList || !this.caseList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.caseList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedCaseMap[id]) {
              this.$refs.caseTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.firstLoad = true
      this.formUserOptions = []
      this.formCaseFlowOptions = []
      this.open = true
      this.title = '添加案件'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedCaseRecords[0]
          ? { ...this.selectedCaseRecords[0] }
          : {}
      }
      this.open = true
      this.title = '修改案件'
      // 加载对应的流程字典
      if (this.form.caseType) {
        this.loadCaseFlowDict(this.form.caseType, 'form')
      }
      // 加载对应的用户列表
      if (this.form.procOrgId) {
        this.getFormUser()
      }
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row
      this.viewOpen = true
    },
    /** 标注按钮操作 */
    handleAnnotate(row) {
      this.annotateForm = {
        id: row.id,
        caseType: row.caseType,
        caseFlow: row.caseFlow
      }
      // 加载对应的流程字典
      if (row.caseType) {
        this.loadCaseFlowDict(row.caseType, 'annotate')
      }
      this.annotateOpen = true
    },
    /** 提交标注 */
    submitAnnotate() {
      this.$refs['annotateForm'].validate((valid) => {
        if (valid) {
          updateCaseFlow(this.annotateForm.id, {
            caseFlow: this.annotateForm.caseFlow
          }).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('标注成功')
              this.annotateOpen = false
              this.getList()
            }
          })
        }
      })
    },
    /** 取消标注 */
    cancelAnnotate() {
      this.annotateOpen = false
      this.annotateForm = {}
    },
    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem('case_query_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions
            .filter(item => item.defaultVisible !== false)
            .map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions
          .filter(item => item.defaultVisible !== false)
          .map((item) => item.prop)
      }
    },
    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    /** 列显示变更 */
    handleColumnChange(value) {
      localStorage.setItem('case_query_visible_columns', JSON.stringify(value))
    },
    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.columnOptions
        .filter(item => item.defaultVisible !== false)
        .map((item) => item.prop)
      localStorage.setItem(
        'case_query_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },
    /** 将 form 对象中的时间字段转换为国际标准格式 */
    convertFormTimeToISO(formData = {}) {
      const form = { ...formData }
      const timeFields = ['caseTime', 'procTime']

      timeFields.forEach((key) => {
        const value = form[key]
        if (value && typeof value === 'string') {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            form[key] = date.toISOString()
          }
        }
      })

      return form
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            this.startProcessing('正在修改案件...')
            const formData = this.convertFormTimeToISO(this.form)
            updateCase(formData, formData.id)
              .then(async(response) => {
                if (response.code === 200) {
                  // 延迟2秒后刷新媒体列表
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.open = false
                  this.msgSuccess('修改案件成功')
                } else {
                  this.msgError(response.msg || '修改案件失败')
                }
              })
              .catch((error) => {
                this.msgError('修改案件失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建案件...')
            const formData = this.convertFormTimeToISO(this.form)
            addCase(formData)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess('创建案件成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '创建案件失败')
                }
              })
              .catch((error) => {
                this.msgError('创建案件失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        } else {
          this.$message.warning('请完善必填项后再提交')
        }
      })
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var caseIds
        if (row && row.id !== undefined) {
          caseIds = row.id
        } else {
          const values = Object.values(this.selectedCaseMap).filter(Boolean)
          caseIds = values.map((item) => item.id)
        }

        // 计算删除数量，优化确认消息
        const count = Array.isArray(caseIds) ? caseIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条案件记录？此操作不可恢复。`
          : `是否确认删除此条案件记录？此操作不可恢复。`

        await this.$confirm(
          confirmMessage,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.startProcessing('正在删除案件...')
        var response = null
        if (Array.isArray(caseIds)) {
          response = await batchDelCases({ ids: caseIds })
        } else {
          response = await delCase(caseIds)
        }
        if (response.code === 200) {
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除案件成功')
        } else {
          this.msgError(response.msg || '删除案件失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除案件失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        caseName: undefined,
        caseType: undefined,
        caseFlow: undefined,
        caseOrgId: undefined,
        caseTime: undefined,
        receiptIncidentRecordNum: undefined,
        disposalIncidentRecordNum: undefined,
        caseAddress: undefined,
        procOrgId: undefined,
        procTime: undefined,
        processPoliceIds: [],
        incidentRecordContext: undefined,
        procResult: undefined
      }
      this.resetForm('form')
    },
    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedCaseRecords) &&
          this.selectedCaseRecords.length > 0

        const count = hasSelection ? this.selectedCaseRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条案件数据？`
          : '是否确认导出所有案件数据项？'

        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })

        const columnOptions = Array.isArray(this.columnOptions)
          ? this.columnOptions
          : []
        const visibleColumns = Array.isArray(this.visibleColumns)
          ? this.visibleColumns
          : []
        const exportColumns = columnOptions.filter((c) =>
          visibleColumns.includes(c.prop)
        )

        if (!exportColumns.length) {
          this.msgError('当前未选择任何可导出的列')
          return
        }

        const tHeader = exportColumns.map((c) => c.label)
        const filterVal = exportColumns.map((c) => c.prop)

        let list = []
        if (hasSelection) {
          list = this.selectedCaseRecords
        } else {
          const baseQueryParams = { ...(this.queryParams || {}) }

          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listCases(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询案件列表失败')
            }

            const pageList = (resp.data && resp.data.list) || []
            total = (resp.data && resp.data.count) || 0
            list = list.concat(pageList)

            if (!pageList.length) {
              break
            }
            pageIndex += 1
          }
        }

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row }
          output.caseType = this.caseTypeFormatter(row)
          output.caseFlow = this.caseFlowFormatter(row)
          output.isRelation = this.relationStatusFormatter(row)
          output.caseTime = this.parseTime(row.caseTime)
          output.procTime = this.parseTime(row.procTime)
          output.createdAt = this.parseTime(row.createdAt)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出（会弹出另存为对话框）
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '案件列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>
