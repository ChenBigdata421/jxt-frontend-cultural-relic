<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <IncidentQueryBar
          ref="queryBar"
          :status-options="statusOptions"
          :relation-status-options="incidentRelationStatusOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @filter-change="handleFilterChange"
          @filter-reset="handleFilterReset"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
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
        <!--orgList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          ref="incidentRecordTable"
          :key="'incident-table-' + incidentRecordList.length"
          v-loading="loading"
          :data="incidentRecordList"
          border
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为"v-bind"或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="240"
            fixed="left"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['incidentrecord:bwc:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['incidentrecord:bwc:link']"
                  size="small"
                  type="text"
                  icon="el-icon-link"
                  class="action-btn tertiary"
                  @click="handleLinkMedia(scope.row)"
                >
                  已关联媒体
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('code')"
            prop="code"
            label="警情号"
            width="120"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            prop="name"
            label="报警人姓名"
            width="140"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('title')"
            prop="title"
            label="警情标题"
            min-width="160"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('tel')"
            prop="tel"
            label="报警电话"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            prop="address"
            label="警情地址"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('processPoliceNames')"
            prop="processPoliceNames"
            label="处警人"
            min-width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgPaths')"
            prop="orgPaths"
            label="处警组织"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('result')"
            prop="result"
            label="处警结果"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('context')"
            prop="context"
            label="报警内容"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('processCode')"
            prop="processCode"
            label="处警单编号"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('receiveCode')"
            prop="receiveCode"
            label="接警单编号"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('feedbackCode')"
            prop="feedbackCode"
            label="反馈单编号"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgName')"
            prop="orgName"
            label="组织名称"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgCode')"
            prop="orgCode"
            label="组织编码"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('orgJc')"
            prop="orgJc"
            label="组织简称"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('createUserName')"
            prop="createUserName"
            label="创建用户"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('createUserNo')"
            prop="createUserNo"
            label="创建用户警号"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('updateUserName')"
            prop="updateUserName"
            label="更新用户"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('updateUserNo')"
            prop="updateUserNo"
            label="更新用户警号"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('createTime')"
            prop="createTime"
            label="创建时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('reportTime')"
            prop="reportTime"
            label="报警时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.reportTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('receiveTime')"
            prop="receiveTime"
            label="接警时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.receiveTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('processTime')"
            prop="processTime"
            label="处警时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.processTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('endTime')"
            prop="endTime"
            label="结束时间"
            width="170"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('caseId')"
            prop="caseId"
            label="案件编号"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('archiveCode')"
            prop="archiveCode"
            label="归档编号"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('superviseType')"
            prop="superviseType"
            label="警情监督类型"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            prop="status"
            label="状态"
            width="120"
          >
            <template slot-scope="{ row }">
              <div class="status-cell">
                <span
                  class="status-dot"
                  :class="getStatusClass(row.status)"
                />
                <span class="status-text">{{ statusFormat(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('isRelation')"
            prop="isRelation"
            label="是否关联"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-tag
                :type="row.isRelation === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{
                  selectDictLabel(incidentRelationStatusOptions, row.isRelation)
                }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>

      <!-- 第一层抽屉：已关联媒体列表 -->
      <el-drawer
        :title="`警情【${
          currentIncidentRecord ? currentIncidentRecord.code : ''
        }】的关联媒体`"
        :visible.sync="showMediaDrawer"
        direction="rtl"
        size="60%"
        :before-close="handleCloseMediaDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-drawer"
      >
        <!-- 关联媒体操作按钮 -->
        <div class="drawer-content">
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleOpenMediaSelector"
              >关联新媒体</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnlinkMedia"
              >批量取消关联</el-button>
            </el-col>
          </el-row>

          <!-- 关联媒体列表 -->
          <el-table
            ref="mediaRelationsTable"
            v-loading="relationsLoading"
            :data="mediaRelationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              prop="incidentRecordCode"
              label="警情编号"
              align="center"
            />
            <el-table-column prop="mediaName" label="媒体名称" />
            <el-table-column prop="mediaCate" label="媒体类别" align="center">
              <template slot-scope="{ row }">
                {{ selectDictLabel(mediaCateOptions, row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column prop="policeName" label="关联人" align="center" />
            <el-table-column prop="orgFullName" label="关联人组织" />
            <el-table-column prop="createdAt" label="关联时间" align="center">
              <template slot-scope="{ row }">
                {{ parseTime(row.relationTime || row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="handleUnlinkMedia(scope.row)"
                >取消关联</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div
            v-if="!(mediaRelationsList && mediaRelationsList.length)"
            class="empty-data"
          >
            <el-empty description="暂无关联媒体" :image-size="100" />
          </div>
          <!-- 分页 -->
          <pagination
            v-show="relationTotal > 0"
            :total="relationTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadIncidentRecordMediaRelations"
          />
        </div>

        <!-- 底部操作栏 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseMediaDrawer()">关闭</el-button>
        </div>
      </el-drawer>

      <!-- 第二层抽屉：未关联媒体选择器 -->
      <el-drawer
        title="关联新媒体"
        :visible.sync="mediaSelectorDrawerOpen"
        direction="rtl"
        size="70%"
        :before-close="handleCloseSelectorDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-selector-drawer"
      >
        <div class="drawer-content">
          <!-- 媒体选择器 -->
          <MediaSelector
            ref="mediaSelector"
            :selection-mode="true"
            :multiple="true"
            :custom-list-api="getUnassociatedMediaListApi"
            @select="handleMediaSelect"
            @selection-change="handleMediaSelectionChange"
          />
        </div>

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseSelectorDrawer">取消</el-button>
          <el-button type="primary" size="small" @click="confirmLinkMedia">确定</el-button>
        </div>
      </el-drawer>

      <!--显示详情-->
      <el-dialog
        title="警情详情"
        :visible.sync="ViewOpen"
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
              <el-descriptions-item label="警情编号">
                <span class="nowrap-text">{{ viewData.code || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="警情标题" :span="2">
                {{ viewData.title || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="报警人姓名">
                {{ viewData.name || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="报警电话">
                <span class="nowrap-text">{{ viewData.tel || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="报警地址" :span="2">
                {{ viewData.address || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="报警内容" :span="2">
                {{ viewData.context || "-" }}
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
              <div class="timeline-item" :class="{ active: viewData.reportTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">报警</span>
              </div>
              <div class="timeline-line" />
              <div class="timeline-item" :class="{ active: viewData.receiveTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">接警</span>
              </div>
              <div class="timeline-line" />
              <div class="timeline-item" :class="{ active: viewData.processTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">处警</span>
              </div>
              <div class="timeline-line" />
              <div class="timeline-item" :class="{ active: viewData.endTime }">
                <span class="timeline-dot" />
                <span class="timeline-label">结束</span>
              </div>
            </div>

            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="报警时间">
                {{ parseTime(viewData.reportTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="接警时间">
                {{ parseTime(viewData.receiveTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警时间">
                {{ parseTime(viewData.processTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="结束时间">
                {{ parseTime(viewData.endTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2">
                {{ parseTime(viewData.createTime) || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 执法信息 -->
          <el-collapse-item name="enforcement" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-user section-icon" />
                <span class="section-title">执法信息</span>
                <span class="section-badge">{{ detailEnforcementFieldCount }}项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="处警单编号">
                <span class="nowrap-text">{{ viewData.processCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="接警单编号">
                <span class="nowrap-text">{{ viewData.receiveCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="反馈单编号">
                <span class="nowrap-text">{{ viewData.feedbackCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="警情监督类型">
                {{ viewData.superviseType || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="案件编号">
                <span class="nowrap-text">{{ viewData.caseId || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="归档编号">
                <span class="nowrap-text">{{ viewData.archiveCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="处警结果" :span="2">
                {{ viewData.result || "-" }}
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
              <el-descriptions-item label="处警组织路径" :span="2">
                {{ viewData.orgPaths || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警组织名称">
                {{ viewData.orgName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="组织编码">
                <span class="nowrap-text">{{ viewData.orgCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="组织简称">
                {{ viewData.orgJc || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="处警人员">
                {{ viewData.processPoliceNames || "-" }}
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
              <el-descriptions-item label="状态">
                <el-tag
                  :type="viewData.status === 1 ? 'success' : 'info'"
                  size="small"
                  effect="dark"
                >
                  {{ statusFormat(viewData) || "-" }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="是否关联">
                <el-tag
                  :type="viewData.isRelation === 1 ? 'success' : 'info'"
                  size="small"
                  effect="dark"
                >
                  {{ selectDictLabel(incidentRelationStatusOptions, viewData.isRelation) || "-" }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建用户">
                {{ viewData.createUserName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="创建用户警号">
                {{ viewData.createUserNo || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="更新用户">
                {{ viewData.updateUserName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="更新用户警号">
                {{ viewData.updateUserNo || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="ViewOpen = false">关闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>
<script>
import {
  addIncidentRecordMediaRelations,
  delIncidentRecordMediaRelations,
  batchDelIncidentRecordMediaRelations
} from '@/api/evidence/evidence_manage_command_api'
import {
  getIncidentRecordList,
  getIncidentRecordMediaRelationsByIncidentRecordId,
  getUnassociatedMediaByIncidentRecordId
} from '@/api/evidence/evidence_manage_query_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import MediaSelector from '@/components/MediaSelector'
import IncidentQueryBar from '@/components/IncidentQueryBar/index.vue'

export default {
  name: 'LawCarema',
  components: {
    MediaSelector,
    IncidentQueryBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 警情数据
      incidentRecordList: [],
      // 状态数据字典
      statusOptions: [],
      // 关联状态数据字典
      incidentRelationStatusOptions: [],
      // 详情对话框折叠状态 (默认展开: 基础信息、时间流程、状态与操作)
      activeDetailSections: ['basic', 'timeline', 'enforcement', 'organization', 'status'],
      // 当前选中的警情记录
      currentIncidentRecord: null,
      // 详情数据
      viewData: {},
      // 是否显示详情对话框
      ViewOpen: false,
      // 组织树选项
      orgOptions: undefined,
      // 选中的媒体数据
      selectedMediaData: [],
      // 警情媒体关联列表
      mediaRelationsList: [],
      // 媒体关联列表加载状态
      relationsLoading: false,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        title: undefined,
        orgId: undefined,
        processPoliceIds: undefined,
        status: undefined,
        isRelation: undefined
      },
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      relationTotal: 0,
      // 选中的媒体列表
      selectedMediaList: [],
      // 选中的已关联媒体列表（用于批量取消关联）
      selectedMediaRelations: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedMediaRelationMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringMediaRelationSelection: false,
      // 当前选中的警情记录（用于显示媒体关联列表）
      currentSelectedIncident: null,
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储类型选项
      storageTypeOptions: [],
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      // 列配置选项
      columnOptions: [
        { prop: 'code', label: '警情号', fixed: true, defaultVisible: true },
        { prop: 'name', label: '报警人姓名', defaultVisible: true },
        { prop: 'title', label: '警情标题', defaultVisible: true },
        { prop: 'tel', label: '报警电话', defaultVisible: true },
        { prop: 'context', label: '报警内容', defaultVisible: false },
        { prop: 'address', label: '警情地址', defaultVisible: true },
        { prop: 'processCode', label: '处警单编号', defaultVisible: false },
        { prop: 'receiveCode', label: '接警单编号', defaultVisible: false },
        { prop: 'feedbackCode', label: '反馈单编号', defaultVisible: false },
        { prop: 'processPoliceNames', label: '处警人', defaultVisible: true },
        { prop: 'orgPaths', label: '处警组织', defaultVisible: true },
        { prop: 'orgName', label: '组织名称', defaultVisible: false },
        { prop: 'orgCode', label: '组织编码', defaultVisible: false },
        { prop: 'orgJc', label: '组织简称', defaultVisible: false },
        { prop: 'createUserName', label: '创建用户', defaultVisible: false },
        { prop: 'createUserNo', label: '创建用户警号', defaultVisible: false },
        { prop: 'updateUserName', label: '更新用户', defaultVisible: false },
        { prop: 'updateUserNo', label: '更新用户警号', defaultVisible: false },
        { prop: 'createTime', label: '创建时间', defaultVisible: false },
        { prop: 'reportTime', label: '报警时间', defaultVisible: true },
        { prop: 'receiveTime', label: '接警时间', defaultVisible: true },
        { prop: 'processTime', label: '处警时间', defaultVisible: true },
        { prop: 'endTime', label: '结束时间', defaultVisible: false },
        { prop: 'result', label: '处警结果', defaultVisible: true },
        { prop: 'caseId', label: '案件编号', defaultVisible: false },
        { prop: 'archiveCode', label: '归档编号', defaultVisible: false },
        { prop: 'superviseType', label: '警情监督类型', defaultVisible: true },
        { prop: 'status', label: '状态', defaultVisible: true },
        { prop: 'isRelation', label: '是否关联', defaultVisible: true }
      ],
      // 可见列
      visibleColumns: []
    }
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentIncidentRecord || !this.currentIncidentRecord.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 }})
        }
      }
      return (query) => {
        return getUnassociatedMediaByIncidentRecordId(
          this.currentIncidentRecord.id,
          query
        )
      }
    },
    // 详情对话框 - 基础信息字段数量
    detailBasicFieldCount() {
      // 警情编号、警情标题、报警人姓名、报警电话、报警地址、报警内容
      return 6
    },
    // 详情对话框 - 时间流程字段数量
    detailTimelineFieldCount() {
      // 报警时间、接警时间、处警时间、结束时间、创建时间
      return 5
    },
    // 详情对话框 - 执法信息字段数量
    detailEnforcementFieldCount() {
      // 处警单编号、接警单编号、反馈单编号、警情监督类型、案件编号、归档编号、处警结果
      return 7
    },
    // 详情对话框 - 组织与人员字段数量
    detailOrganizationFieldCount() {
      // 处警组织路径、处警组织名称、组织编码、组织简称、处警人员
      return 5
    },
    // 详情对话框 - 状态与操作字段数量
    detailStatusFieldCount() {
      // 状态、是否关联、创建用户、创建用户警号、更新用户、更新用户警号
      return 6
    }
  },
  created() {
    this.initVisibleColumns()
    this.getTreeselect()

    // 使用Promise.all等待所有字典加载完成后再加载列表
    Promise.all([
      this.getDicts('incidentrecord_status'),
      this.getDicts('relation_status'),
      this.getDicts('evidence_media_type'),
      this.getDicts('evidence_storage_type')
    ])
      .then(([statusRes, relationStatusRes, mediaCateRes, storageTypeRes]) => {
        this.statusOptions = statusRes.data
        this.incidentRelationStatusOptions = relationStatusRes.data
        this.mediaCateOptions = mediaCateRes.data
        this.storageTypeOptions = storageTypeRes.data

        // 字典加载完成后再加载列表
        this.getList()
      })
      .catch((error) => {
        console.error('[IncidentRecordMediaRelation] 字典加载失败:', error)
        // 即使字典加载失败,也要加载列表
        this.getList()
      })
  },
  methods: {
    /** ----------------主界面--------------- */
    // 获取状态对应的样式类名
    getStatusClass(status) {
      const statusMap = {
        0: 'pending',
        1: 'processing',
        2: 'completed',
        3: 'archived'
      }
      return statusMap[status] || 'pending'
    },

    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表（这些字段可能被用户清空）
      const quickSearchFields = ['code', 'title', 'name', 'status', 'isRelation']

      // 高级筛选中的时间范围字段列表
      const timeRangeFields = [
        'reportTimeStart', 'reportTimeEnd',
        'receiveTimeStart', 'receiveTimeEnd',
        'processTimeStart', 'processTimeEnd',
        'endTimeStart', 'endTimeEnd'
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
      this.handleFilterReset()
    },

    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.reportTimeStart = today.toISOString()
        delete this.queryParams.reportTimeEnd
      } else if (filterData.filterType === 'mine') {
        const currentUser = this.$store.state.user && this.$store.state.user.user
        if (currentUser && currentUser.userId) {
          this.queryParams.createUserId = currentUser.userId
        }
      } else if (filterData.filterType === 'pending') {
        this.queryParams.status = 0
      } else if (filterData.filterType === 'archived') {
        this.queryParams.status = 3
      } else if (filterData.filterType === 'advanced') {
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        const timeRangeFields = [
          'reportTimeStart', 'reportTimeEnd',
          'receiveTimeStart', 'receiveTimeEnd',
          'processTimeStart', 'processTimeEnd',
          'endTimeStart', 'endTimeEnd'
        ]
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        delete this.queryParams.reportTimeStart
        delete this.queryParams.reportTimeEnd
        delete this.queryParams.createUserId
        delete this.queryParams.status
      }
      this.handleQuery()
    },

    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        title: undefined,
        orgId: undefined,
        processPoliceIds: undefined,
        status: undefined,
        isRelation: undefined,
        context: undefined,
        tel: undefined,
        reportTimeRangeStart: undefined,
        reportTimeRangeEnd: undefined,
        receiveTimeRangeStart: undefined,
        receiveTimeRangeEnd: undefined,
        processTimeRangeStart: undefined,
        processTimeRangeEnd: undefined,
        endTimeRangeStart: undefined,
        endTimeRangeEnd: undefined,
        reportTimeStart: undefined,
        reportTimeEnd: undefined,
        createUserId: undefined
      }
      this.handleQuery()
    },

    handleRefresh() {
      this.getList()
    },

    initVisibleColumns() {
      const saved = localStorage.getItem('incident_media_relation_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions.map((item) => item.prop)
        }
      } else {
        this.visibleColumns = this.columnOptions.map((item) => item.prop)
      }
    },

    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    handleColumnChange(val) {
      localStorage.setItem(
        'incident_media_relation_visible_columns',
        JSON.stringify(val)
      )
    },

    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop)
      localStorage.setItem(
        'incident_media_relation_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },

    handleColumnSettingsOpen() {
      this.$nextTick(() => {
        const firstCheckbox = document.querySelector(
          '.column-settings-popover .el-checkbox:first-child .el-checkbox__input'
        )
        if (firstCheckbox) {
          firstCheckbox.focus()
        }
      })
    },

    handleColumnSettingsClose() {
      // 焦点自动返回触发按钮，无需额外处理
    },

    /** 查询警情列表 */
    getList() {
      this.loading = true
      const query = { ...this.queryParams }
      Object.keys(query).forEach((key) => {
        if (query[key] === '' || query[key] === null) {
          delete query[key]
        }
      })
      getIncidentRecordList(query).then((response) => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.incidentRecordList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
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

    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = { ...(row || {}) }
      this.ViewOpen = true
      this.title = '警情信息'
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** --------第一层抽屉----------------- */

    /** 关联媒体按钮操作 - 打开第一层抽屉 */
    handleLinkMedia(row) {
      this.currentIncidentRecord = row
      this.showMediaDrawer = true
      this.loadIncidentRecordMediaRelations(row.id)
    },

    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false
      this.currentIncidentRecord = null
      this.mediaRelationsList = []
      if (done) {
        done()
      }
    },

    /** 加载警情媒体关联列表 */
    loadIncidentRecordMediaRelations() {
      this.relationsLoading = true
      getIncidentRecordMediaRelationsByIncidentRecordId(
        this.currentIncidentRecord.id,
        this.relationQueryParams
      )
        .then((response) => {
          // 必须检查response.code是否为200
          if (response.code === 200) {
            this.mediaRelationsList = response.data.list || []
            this.relationTotal = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreMediaRelationSelection()
          } else {
            console.error('加载媒体关联列表失败:', response.msg)
            this.msgError(response.msg || '加载媒体关联列表失败')
            this.mediaRelationsList = []
            this.relationTotal = 0
          }
        })
        .catch((error) => {
          console.error('加载媒体关联列表失败:', error)
          this.msgError(
            '加载媒体关联列表失败：' + (error.message || '未知错误')
          )
          this.mediaRelationsList = []
          this.relationTotal = 0
        })
        .finally(() => {
          this.relationsLoading = false
        })
    },

    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm('确认取消关联该媒体吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor
        document.body.style.cursor = 'wait'

        const loadingInstance = this.$loading({
          lock: true,
          text: '正在取消关联...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })

        try {
          const response = await delIncidentRecordMediaRelations(row.id)

          if (response.code === 200) {
            // 延迟2秒后刷新媒体关联列表
            await this.delay(2000)
            this.loadIncidentRecordMediaRelations(
              this.currentIncidentRecord.id
            )
            this.getList() // 刷新警情列表以更新关联状态

            this.msgSuccess(response.msg || '取消关联成功')
          } else {
            this.msgError(response.msg || '取消关联失败')
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor
          loadingInstance.close()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('取消关联失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 已关联媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      if (this.isRestoringMediaRelationSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.mediaRelationsList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedMediaRelationMap[id] = row
        } else {
          delete this.selectedMediaRelationMap[id]
        }
      })
      this.selectedMediaRelations = Object.values(
        this.selectedMediaRelationMap
      ).filter(Boolean)
    },

    /** 恢复已关联媒体的选中状态 */
    restoreMediaRelationSelection() {
      if (this.isRestoringMediaRelationSelection) return
      if (!this.$refs.mediaRelationsTable) return
      if (!this.mediaRelationsList || !this.mediaRelationsList.length) return

      this.isRestoringMediaRelationSelection = true
      this.$nextTick(() => {
        try {
          this.mediaRelationsList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedMediaRelationMap[id]) {
              this.$refs.mediaRelationsTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringMediaRelationSelection = false
        }
      })
    },

    /** 批量取消关联媒体 */
    async handleBatchUnlinkMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError('请选择要取消关联的媒体')
        return
      }

      try {
        await this.$confirm(
          `确认取消关联选中的 ${this.selectedMediaRelations.length} 个媒体吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor
        document.body.style.cursor = 'wait'

        const loadingInstance = this.$loading({
          lock: true,
          text: '正在批量取消关联...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })

        try {
          // 提取选中的关联ID列表
          const relationIds = this.selectedMediaRelations.map(
            (item) => item.id
          )

          const response = await batchDelIncidentRecordMediaRelations({
            relationIds: relationIds
          })

          if (response.code === 200) {
            // 延迟2秒后刷新媒体关联列表
            await this.delay(2000)
            this.selectedMediaRelationMap = {}
            this.selectedMediaRelations = []
            this.loadIncidentRecordMediaRelations(
              this.currentIncidentRecord.id
            )
            this.getList() // 刷新警情列表以更新关联状态

            this.msgSuccess(
              response.msg ||
                `成功取消关联 ${
                  response.data?.deletedCount || relationIds.length
                } 个媒体`
            )
          } else {
            this.msgError(response.msg || '批量取消关联失败')
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor
          loadingInstance.close()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('批量取消关联失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 打开第二层抽屉 - 关联新媒体 */
    handleOpenMediaSelector() {
      this.selectedMediaList = []
      this.mediaSelectorDrawerOpen = true
      // 等待抽屉打开后刷新媒体选择器
      this.$nextTick(() => {
        if (this.$refs.mediaSelector) {
          this.$refs.mediaSelector.clearSelection()
          this.$refs.mediaSelector.refreshList()
        }
      })
    },

    /** 关闭第二层抽屉 */
    handleCloseSelectorDrawer(done) {
      this.mediaSelectorDrawerOpen = false
      this.selectedMediaList = []
      if (done) {
        done()
      }
    },

    /** 检查媒体关联状态(单选时触发) */
    handleMediaSelect(row) {
      console.log(
        '[IncidentRecordMediaRelation] handleMediaSelect 触发, row:',
        JSON.stringify(row, null, 2)
      )
      // 检查媒体是否已经关联了警情（后端字段名是 incidentCode）
      const incidentCode = row.incidentCode || row.incidentRecordCode
      console.log('[IncidentRecordMediaRelation] incidentCode:', incidentCode)
      if (incidentCode) {
        // 如果关联的是当前警情
        if (
          this.currentIncidentRecord &&
          incidentCode === this.currentIncidentRecord.code
        ) {
          this.$confirm(
            `媒体"${row.mediaName}"已与当前警情"${incidentCode}"关联`,
            '提示',
            {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'information'
            }
          )
        } else {
          // 如果关联的是其他警情
          this.$confirm(
            `本次关联之前，媒体"${row.mediaName}"将自动先与警情"${incidentCode}"解除关联`,
            '提示',
            {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'warning'
            }
          )
        }
      }
    },

    /** 媒体选择变化 */
    handleMediaSelectionChange(selection) {
      this.selectedMediaList = selection
    },

    /** 确认关联媒体 */
    async confirmLinkMedia() {
      // 使用selectedMediaList而不是参数
      if (!this.selectedMediaList || this.selectedMediaList.length === 0) {
        this.msgError('请选择要关联的媒体')
        return
      }

      // 过滤掉已经与该警情关联的媒体（后端字段名是 incidentCode）
      const selectedMediaRelations = this.selectedMediaList.filter((item) => {
        const incidentCode = item.incidentCode || item.incidentRecordCode
        return incidentCode !== this.currentIncidentRecord.code
      })

      // 计算已关联其他警情的媒体数量
      const alreadyLinkedCount =
        this.selectedMediaList.length - selectedMediaRelations.length

      // 如果有媒体已关联其他警情,给出提示
      if (alreadyLinkedCount > 0) {
        this.$message({
          type: 'warning',
          message: `已过滤 ${alreadyLinkedCount} 个已关联当前警情的媒体`,
          duration: 3000
        })
      }

      // 检查过滤后是否还有媒体需要关联
      if (!selectedMediaRelations || selectedMediaRelations.length === 0) {
        this.msgError('所选媒体均已关联当前警情,请重新选择')
        return
      }

      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'

      const loadingInstance = this.$loading({
        lock: true,
        text: '正在关联媒体...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })

      try {
        // 调用关联媒体的API
        const data = {
          incidentRecordId: this.currentIncidentRecord.id,
          mediaIds: selectedMediaRelations.map((item) => item.mediaId)
        }

        const response = await addIncidentRecordMediaRelations(data)

        if (response.code === 200) {
          // 关闭第二层抽屉
          this.mediaSelectorDrawerOpen = false

          // 延迟2秒后刷新第一层抽屉的媒体列表
          await this.delay(2000)
          this.loadIncidentRecordMediaRelations(this.currentIncidentRecord.id)
          this.getList() // 刷新警情列表以更新关联状态

          // 显示成功消息,包含实际关联的媒体数量
          this.msgSuccess(
            response.msg || `成功关联 ${selectedMediaRelations.length} 个媒体`
          )
        } else {
          this.msgError(response.msg || '关联失败')
        }
      } catch (error) {
        this.msgError('关联失败：' + (error.message || '未知错误'))
      } finally {
        // 恢复鼠标状态
        document.body.style.cursor = previousCursor
        loadingInstance.close()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

/* 本页面使用的样式类已全部在全局样式中定义：
   - .search-section → src/styles/components/search.scss:6-8
   - .main-action-bar → src/styles/components/dialogs.scss:132-150
   - .action-buttons → src/styles/components/forms.scss:149-172 和 table.scss:77-108
   - .action-btn.* → src/styles/components/buttons.scss
   - .status-cell → src/styles/components/table.scss:120-157
   - .timeline-preview → src/styles/components/dialogs.scss:77-128
   - .time-inputs → src/styles/components/dialogs.scss:362-366
   - .form-collapse, .form-section, .detail-section → src/styles/components/forms.scss:349-423
   - .section-header → src/styles/components/dialogs.scss:35-75
   - .section-descriptions, .nowrap-text → src/styles/components/dialogs.scss:5-31
   - .detail-dialog, .edit-dialog → src/styles/components/dialogs.scss:497-540
   - .drawer-content, .media-drawer, .media-selector-drawer → src/styles/components/dialogs.scss:368-469
   - .column-settings → src/styles/components/dialogs.scss:169-285 和 forms.scss:176-202
   - .full-width → src/styles/components/utilities.scss:7-9
   - .horizontal-container → src/styles/components/utilities.scss:12-16
   - .empty-data → src/styles/components/utilities.scss:19-24
   - .media-relations-section → src/styles/components/utilities.scss:27-34
   - .mb8 → src/styles/components/utilities.scss (间距工具类)
*/
</style>
