<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <WritQueryBar
          ref="queryBar"
          :writ-type-options="writTypeOptions"
          :relation-status-options="relationStatusOptions"
          :org-options="orgOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @filter-change="handleFilterChange"
          @filter-reset="handleFilterReset"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedWritRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['writ:bwc:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增文书
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
              v-permisaction="['writ:bwc:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['writ:bwc:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedWritRecords.length === 0"
              @click="handleBatchDelete"
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

        <!-- 文书列表 -->
        <el-table
          ref="writTable"
          v-loading="loading"
          :data="writList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            v-if="isColumnVisible('writCode')"
            label="文书编号"
            align="center"
            prop="writCode"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('writName')"
            label="文书名称"
            align="center"
            prop="writName"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('writType')"
            label="文书类型"
            align="center"
            prop="writType"
          >
            <template slot-scope="scope">
              {{ writTypeFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('writTime')"
            label="开书时间"
            align="center"
            prop="writTime"
            width="180"
            sortable="custom"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.writTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('orgCode')"
            label="组织编码"
            align="center"
            prop="orgCode"
          />
          <el-table-column
            v-if="isColumnVisible('orgName')"
            label="组织名称"
            align="center"
            prop="orgName"
          />
          <el-table-column
            v-if="isColumnVisible('orgPaths')"
            label="组织全称"
            align="center"
            prop="orgPaths"
          />
          <el-table-column
            v-if="isColumnVisible('writPoliceNames')"
            label="人员"
            align="center"
            prop="writPoliceNames"
          />
          <el-table-column
            v-if="isColumnVisible('writScore')"
            label="评分"
            align="center"
            prop="writScore"
          />
          <el-table-column
            v-if="isColumnVisible('isRelation')"
            label="关联状态"
            align="center"
            prop="isRelation"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.isRelation === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ relationStatusFormat(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('writAddress')"
            label="文书地址"
            align="center"
            prop="writAddress"
          />
          <el-table-column
            v-if="isColumnVisible('writSource')"
            label="文书来源"
            align="center"
            prop="writSource"
          />
          <el-table-column
            v-if="isColumnVisible('scoreDesc')"
            label="评分说明"
            align="center"
            prop="scoreDesc"
          />
          <el-table-column
            v-if="isColumnVisible('writDesc')"
            label="文书描述"
            align="center"
            prop="writDesc"
          />
          <el-table-column
            v-if="isColumnVisible('createdAt')"
            label="创建时间"
            align="center"
            prop="createdAt"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('updatedAt')"
            label="更新时间"
            align="center"
            prop="updatedAt"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updatedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="320"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-star-on"
                  class="action-btn tertiary"
                  @click="handleScore(scope.row)"
                >
                  评分
                </el-button>
                <el-button
                  size="small"
                  type="text"
                  icon="el-icon-link"
                  class="action-btn tertiary"
                  @click="handleShowMedia(scope.row)"
                >
                  已关联媒体
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
        width="700px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">

          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">5项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="文书名称" prop="writName">
                    <el-input v-model="form.writName" placeholder="请输入文书名称" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="文书类型" prop="writType">
                    <el-select
                      v-model="form.writType"
                      placeholder="请选择文书类型"
                      class="full-width"
                    >
                      <el-option
                        v-for="dict in writTypeOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="parseInt(dict.value)"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="组织部门" prop="orgId">
                    <treeselect
                      v-model="form.orgId"
                      :options="orgOptions"
                      placeholder="请选择组织部门"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="人员" prop="writPoliceIds">
                    <el-select
                      v-model="form.writPoliceIds"
                      multiple
                      placeholder="请选择人员"
                      collapse-tags
                      collapse-tags-tooltip
                      class="full-width"
                    >
                      <el-option
                        v-for="user in userOptions"
                        :key="user.userId"
                        :label="user.userName"
                        :value="user.userId"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="文书描述" prop="writDesc">
                    <el-input
                      v-model="form.writDesc"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入文书描述"
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

      <!-- 评分对话框 -->
      <el-dialog
        title="文书评分"
        :visible.sync="scoreOpen"
        width="500px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form
          ref="scoreForm"
          :model="scoreForm"
          :rules="scoreRules"
          label-width="100px"
        >
          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeScoreSections" class="form-collapse">

            <!-- 评分信息 -->
            <el-collapse-item name="score" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-star-on section-icon" />
                  <span class="section-title">评分信息</span>
                  <span class="section-badge">5项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="文书编号">
                    <el-input v-model="scoreForm.writCode" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="开书时间">
                    <el-input v-model="scoreForm.writTime" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="文书类型">
                    <el-input v-model="scoreForm.writTypeLabel" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="评分" prop="writScore">
                    <el-input-number
                      v-model="scoreForm.writScore"
                      :min="0"
                      :max="100"
                      :precision="2"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="评分说明" prop="scoreDesc">
                    <el-input
                      v-model="scoreForm.scoreDesc"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入评分说明"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="tertiary" size="small" @click="scoreOpen = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submitScore">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 浏览文书对话框 -->
      <el-dialog
        title="浏览文书"
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
                <span class="section-badge">5项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="文书编号">
                <span class="nowrap-text">{{ viewData.writCode || "-" }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="文书名称">
                {{ viewData.writName || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="文书类型">
                {{ writTypeFormat(viewData) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="开书时间">
                {{ parseTime(viewData.writTime) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="组织部门" :span="2">
                {{ viewData.orgPaths || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="人员" :span="2">
                {{ viewData.writPoliceNames || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 关联与评分 -->
          <el-collapse-item name="relation" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-star-on section-icon" />
                <span class="section-title">关联与评分</span>
                <span class="section-badge">4项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="关联状态">
                <el-tag
                  :type="viewData.isRelation === 1 ? 'success' : 'info'"
                  size="small"
                  effect="dark"
                >
                  {{ relationStatusFormat(viewData) || "-" }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="评分">
                {{ viewData.writScore || "未评分" }}
              </el-descriptions-item>
              <el-descriptions-item label="评分说明" :span="2">
                {{ viewData.scoreDesc || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="文书描述" :span="2">
                {{ viewData.writDesc || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 系统信息 -->
          <el-collapse-item name="system" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">系统信息</span>
                <span class="section-badge">4项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="文书地址" :span="2">
                {{ viewData.writAddress || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="文书来源">
                {{ viewData.writSource || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ parseTime(viewData.createdAt) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间" :span="2">
                {{ parseTime(viewData.updatedAt) || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>

      <!-- 已关联媒体展示区域 -->
      <!-- 第一层抽屉：已关联媒体列表 -->
      <el-drawer
        :title="`文书【${currentWrit.writName}】的关联媒体`"
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
                @click="handleLinkMedia"
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
            v-loading="relationLoading"
            :data="mediaRelationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="文书编号" align="center" prop="writCode" />
            <el-table-column label="媒体名称" align="center" prop="mediaName" />
            <el-table-column label="媒体类型" align="center" prop="mediaCate">
              <template slot-scope="scope">
                {{ mediaCateFormat(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="关联人" align="center" prop="policeName" />
            <el-table-column
              label="关联人组织"
              align="center"
              prop="orgFullName"
            />
            <el-table-column label="关联时间" align="center" prop="createdAt">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createdAt) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150">
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
          <div v-if="mediaRelationsList.length === 0" class="empty-data">
            <el-empty description="暂无关联媒体" :image-size="100" />
          </div>
          <!-- 分页 -->
          <pagination
            v-show="relationTotal > 0"
            :total="relationTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadWritMediaRelations"
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
            @selection-change="handleMediaSelectionChange"
          />
        </div>

        <!-- 底部操作按钮 -->
        <div class="drawer-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="handleCloseSelectorDrawer">取消</el-button>
          <el-button type="primary" size="small" @click="confirmLinkMedia">确定</el-button>
        </div>
      </el-drawer>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import MediaSelector from '@/components/MediaSelector'
import {
  listWrits,
  getWrit,
  addWrit,
  updateWrit,
  delWritById,
  batchDelWrit,
  scoreWrit
} from '@/api/evidence/writ_api'
import {
  getUnassociatedMediaByWritId,
  batchCreateWritMediaRelation,
  deleteWritMediaRelation,
  batchDeleteWritMediaRelation,
  getWritMediaRelationListByWritId
} from '@/api/evidence/writ_media_relation_api'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import { formatJson } from '@/utils'
import WritQueryBar from '@/components/WritQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'

export default {
  name: 'WritManage',
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    MediaSelector,
    WritQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      relationLoading: false,
      firstLoad: null,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 文书表格数据
      writList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示评分对话框
      scoreOpen: false,
      // 是否显示浏览对话框
      viewOpen: false,
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 评分对话框折叠状态
      activeScoreSections: ['score'],
      // 详情对话框折叠状态
      activeDetailSections: ['basic', 'relation'],
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      // 当前文书
      currentWrit: {},
      // 浏览数据
      viewData: {},
      // 媒体列表
      mediaRelationsList: [],
      relationTotal: 0,
      // 选中的媒体列表
      selectedMediaList: [],
      // 选中的已关联媒体列表（用于批量取消关联）
      selectedMediaRelations: [],
      // 组织树选项
      orgOptions: [],
      // 用户选项
      userOptions: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedWritMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 所有选中的文书记录
      selectedWritRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 使用 Map 存储所有选中的项（跨分页）
      selectedMediaRelationMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringMediaRelationSelection: false,
      // 文书类型字典
      writTypeOptions: [],
      // 媒体类型字典
      mediaCateOptions: [],
      // 关联状态字典
      relationStatusOptions: [],
      // 列配置选项
      columnOptions: [
        { prop: 'writCode', label: '文书编号', fixed: true, defaultVisible: true },
        { prop: 'writName', label: '文书名称', fixed: false, defaultVisible: true },
        { prop: 'writType', label: '文书类型', fixed: false, defaultVisible: true },
        { prop: 'writTime', label: '开书时间', fixed: false, defaultVisible: true },
        { prop: 'orgCode', label: '组织编码', fixed: false, defaultVisible: true },
        { prop: 'orgName', label: '组织名称', fixed: false, defaultVisible: true },
        { prop: 'orgPaths', label: '组织全称', fixed: false, defaultVisible: true },
        { prop: 'writPoliceNames', label: '人员', fixed: false, defaultVisible: true },
        { prop: 'writScore', label: '评分', fixed: false, defaultVisible: false },
        { prop: 'isRelation', label: '关联状态', fixed: false, defaultVisible: true },
        { prop: 'writAddress', label: '文书地址', fixed: false, defaultVisible: false },
        { prop: 'writSource', label: '文书来源', fixed: false, defaultVisible: false },
        { prop: 'scoreDesc', label: '评分说明', fixed: false, defaultVisible: false },
        { prop: 'writDesc', label: '文书描述', fixed: false, defaultVisible: false },
        { prop: 'createdAt', label: '创建时间', fixed: false, defaultVisible: false },
        { prop: 'updatedAt', label: '更新时间', fixed: false, defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        writCode: undefined,
        writName: undefined,
        writType: undefined,
        orgId: undefined,
        writTimeStart: undefined,
        writTimeEnd: undefined
      },
      // 媒体查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 评分表单
      scoreForm: {},
      // 表单校验
      rules: {
        writName: [
          { required: true, message: '文书名称不能为空', trigger: 'blur' }
        ],
        writType: [
          { required: true, message: '文书类型不能为空', trigger: 'change' }
        ],
        orgId: [
          { required: true, message: '组织部门不能为空', trigger: 'change' }
        ],
        writPoliceIds: [
          { required: true, message: '至少选择一名人员', trigger: 'change' }
        ]
      },
      // 评分表单校验
      scoreRules: {
        writScore: [
          { required: true, message: '评分不能为空', trigger: 'blur' }
        ]
      },
      processingInstance: null, // Element UI全局加载动画的实例
      previousCursor: null // 记录鼠标状态
    }
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentWrit || !this.currentWrit.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 }})
        }
      }
      return (query) => {
        return getUnassociatedMediaByWritId(this.currentWrit.id, query)
      }
    }
  },
  watch: {
    'form.orgId': function(newVal) {
      // 当组织变化时,加载该组织的用户列表
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框,不需要清空人员选择
          this.form.writPoliceIds = []
        }
        this.firstLoad = false
        this.getFormUser()
      }
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getOrgTree()
    this.getDicts('writ_type').then((response) => {
      this.writTypeOptions = response.data
    })
    this.getDicts('evidence_media_type').then((response) => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('relation_status').then((response) => {
      this.relationStatusOptions = response.data
    })
  },
  methods: {
    writTypeFormat(row) {
      return this.selectDictLabel(this.writTypeOptions, row.writType)
    },
    relationStatusFormat(row) {
      return this.selectDictLabel(this.relationStatusOptions, row.isRelation)
    },
    mediaCateFormat(row) {
      return this.selectDictLabel(this.mediaCateOptions, row.mediaCate)
    },

    /** -----------主界面 --------------*/
    /** 查询文书列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listWrits(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.writList = response.data.list || []
            this.total = response.data.count || 0
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.writList = []
            this.total = 0
            this.msgError(response.msg || '获取文书列表失败')
          }
        })
        .catch((error) => {
          this.msgError('查询文书列表失败：' + (error.message || '未知错误'))
          this.writList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 获取组织树 */
    getOrgTree() {
      orgTreeSelect()
        .then((response) => {
          this.orgOptions = response.data
        })
        .catch((error) => {
          this.msgError('获取组织树失败：' + (error.message || '未知错误'))
          this.orgOptions = []
        })
    },
    /** 获取用户列表 */
    getUserList(orgId) {
      listUser({ orgId: '/' + orgId + '/' })
        .then((response) => {
          this.userOptions = response.data.list || []
        })
        .catch((error) => {
          this.msgError('获取用户列表失败：' + (error.message || '未知错误'))
          this.userOptions = []
        })
    },
    /** 获取表单组织的用户列表 */
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.form.orgId + '/' })
          .then((response) => {
            this.userOptions = response.data.list
            resolve('true')
          })
          .catch((error) => {
            console.error('获取用户失败:', error)
            this.userOptions = []
            reject(error)
          })
      })
    },
    /** 组织变更时加载用户 */
    handleOrgChange(value) {
      if (value) {
        this.getUserList(value)
        this.form.writPoliceIds = []
      }
    },

    /** 搜索按钮操作
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedWritMap = {}
      this.selectedWritRecords = []
    },

    /** 刷新列表 */
    handleRefresh() {
      this.getList()
    },

    /** 批量删除 */
    handleBatchDelete() {
      this.handleDelete()
    },

    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
    },

    handleQuery() {
      this.resetPage()
      this.resetSelected()
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      // 快速搜索字段列表
      const quickSearchFields = ['writCode', 'writName', 'writType', 'writRelation']

      // 高级筛选中的时间范围字段列表
      const timeRangeFields = [
        'writTimeStart', 'writTimeEnd',
        'createdAtStart', 'createdAtEnd',
        'updatedAtStart', 'updatedAtEnd'
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
        // 今日文书
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        this.queryParams.writTimeStart = today.toISOString()
        delete this.queryParams.writTimeEnd
      } else if (filterData.filterType === 'mine') {
        // 我的文书 - 需要从 store 获取当前用户
        const currentUser = this.$store.state.user && this.$store.state.user.user
        if (currentUser && currentUser.userId) {
          this.queryParams.createUserId = currentUser.userId
        }
      } else if (filterData.filterType === 'pending') {
        // 待处理 - 根据实际业务逻辑调整
        // 这里假设有一个状态字段表示处理状态
        // this.queryParams.status = 0;
      } else if (filterData.filterType === 'related') {
        // 已关联
        this.queryParams.writRelation = 1
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数（移除 filterType，只保留实际的查询条件）
        Object.keys(filterData).forEach(key => {
          if (key !== 'filterType') {
            this.queryParams[key] = filterData[key]
          }
        })

        // 删除被清空的时间范围字段
        const timeRangeFields = [
          'writTimeStart', 'writTimeEnd',
          'createdAtStart', 'createdAtEnd',
          'updatedAtStart', 'updatedAtEnd'
        ]
        timeRangeFields.forEach(field => {
          if (!(field in filterData)) {
            delete this.queryParams[field]
          }
        })
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.writTimeStart
        delete this.queryParams.writTimeEnd
        delete this.queryParams.createUserId
        delete this.queryParams.writRelation
      }
      this.handleQuery()
    },

    handleFilterReset() {
      // 重置所有筛选条件到初始值
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        writCode: undefined,
        writName: undefined,
        writType: undefined,
        orgId: undefined,
        writTimeStart: undefined,
        writTimeEnd: undefined,
        // 清空高级筛选的字段
        writAddress: undefined,
        writSource: undefined,
        writPoliceIds: undefined,
        // 清空时间范围
        createdAtStart: undefined,
        createdAtEnd: undefined,
        updatedAtStart: undefined,
        updatedAtEnd: undefined,
        // 清空快捷筛选的字段
        createUserId: undefined,
        writRelation: undefined
      }
      this.handleQuery()
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        } else if (
          (key === 'writTimeStart' || key === 'writTimeEnd' ||
           key === 'createdAtStart' || key === 'createdAtEnd' ||
           key === 'updatedAtStart' || key === 'updatedAtEnd') &&
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

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.writTable) return
      if (!this.writList || !this.writList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.writList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedWritMap[id]) {
              this.$refs.writTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
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

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.writList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedWritMap[id] = row
        } else {
          delete this.selectedWritMap[id]
        }
      })
      this.selectedWritRecords = Object.values(this.selectedWritMap).filter(
        Boolean
      )

      // 更新全选状态
      const totalCount = this.writList.length
      const selectedCount = this.selectedWritRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.writTable.toggleAllSelection()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.firstLoad = null
      this.userOptions = []
      this.open = true
      this.title = '添加文书'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedWritRecords[0]
          ? { ...this.selectedWritRecords[0] }
          : {}
      }
      // 加载对应的用户列表
      if (this.form.orgId) {
        this.getFormUser()
      }
      this.title = '修改文书'
      this.open = true
    },
    /** 浏览按钮操作 */
    handleView(row) {
      const writId = row.id
      getWrit(writId).then((response) => {
        if (response.code === 200) {
          this.viewData = response.data
          this.viewOpen = true
        }
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            this.startProcessing('正在修改文书...')
            updateWrit(this.form.id, this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  // 延迟2秒后刷新媒体列表
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg || '修改文书成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改文书失败')
                }
              })
              .catch((error) => {
                this.msgError('修改文书失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建文书...')
            addWrit(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  // 延迟2秒后刷新媒体列表
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增文书成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增文书失败')
                }
              })
              .catch((error) => {
                this.msgError('新增文书失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var writIds
        if (row && row.id !== undefined) {
          writIds = row.id
        } else {
          writIds = this.selectedWritRecords.map((item) => item.id)
        }

        // 计算删除数量，优化确认消息
        const count = Array.isArray(writIds) ? writIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条文书记录？此操作不可恢复。`
          : `是否确认删除此条文书记录？此操作不可恢复。`

        await this.$confirm(
          confirmMessage,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        this.startProcessing('正在删除文书...')
        var response = null
        if (Array.isArray(writIds)) {
          response = await batchDelWrit({ ids: writIds })
        } else {
          response = await delWritById(writIds)
        }
        if (response.code === 200) {
          // 延迟2秒后刷新媒体列表
          await this.delay(2000)
          this.resetPage()
          this.resetSelected()
          this.getList()
          this.msgSuccess(response.msg || '删除成功')
        } else {
          this.msgError(response.msg || '删除失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },
    /** 评分按钮操作 */
    handleScore(row) {
      this.scoreForm = {
        id: row.id,
        writCode: row.writCode,
        writTime: this.parseTime(row.writTime),
        writTypeLabel: this.writTypeFormat(row),
        writScore: row.writScore || 0,
        scoreDesc: row.scoreDesc || ''
      }
      this.scoreOpen = true
    },
    /** 提交评分 */
    submitScore() {
      this.$refs['scoreForm'].validate((valid) => {
        if (valid) {
          scoreWrit(this.scoreForm.id, {
            writScore: this.scoreForm.writScore,
            scoreDesc: this.scoreForm.scoreDesc
          })
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg || '评分成功')
                this.scoreOpen = false
                this.getList()
              } else {
                this.msgError(response.msg || '评分失败')
              }
            })
            .catch((error) => {
              this.msgError('评分失败：' + (error.message || '未知错误'))
            })
        }
      })
    },
    /** 表单重置 */
    reset() {
      this.form = {
        id: null,
        writName: null,
        writType: null,
        orgId: null,
        writPoliceIds: [],
        writDesc: null
      }
      this.resetForm('form')
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem('writ_manage_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.columnOptions
            .filter((item) => item.defaultVisible !== false)
            .map((item) => item.prop)
        }
      } else {
        // 根据defaultVisible属性初始化可见列
        this.visibleColumns = this.columnOptions
          .filter((item) => item.defaultVisible !== false)
          .map((item) => item.prop)
      }
    },
    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    /** 列显示变更 */
    handleColumnChange(value) {
      localStorage.setItem(
        'writ_manage_visible_columns',
        JSON.stringify(value)
      )
    },
    /** 重置列配置 */
    resetColumns() {
      // 根据defaultVisible属性重置为默认可见列
      this.visibleColumns = this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
      localStorage.setItem(
        'writ_manage_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
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
    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedWritRecords) &&
          this.selectedWritRecords.length > 0

        const count = hasSelection ? this.selectedWritRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条文书数据？`
          : '是否确认导出所有文书数据项？'

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
          list = this.selectedWritRecords
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
            const resp = await listWrits(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询文书列表失败')
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
          output.writType = this.writTypeFormat(row)
          output.isRelation = this.relationStatusFormat(row)
          output.writTime = this.parseTime(row.writTime)
          output.createdAt = this.parseTime(row.createdAt)
          output.updatedAt = this.parseTime(row.updatedAt)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出（会弹出另存为对话框）
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '文书列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** ------------第一层抽屉 -----------------*/
    /** 显示已关联媒体 - 打开第一层抽屉 */
    handleShowMedia(row) {
      this.currentWrit = row
      this.showMediaDrawer = true
      this.loadWritMediaRelations()
    },
    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false
      this.currentWrit = {}
      this.mediaRelationsList = []
      this.relationTotal = 0
      this.selectedMediaRelationMap = {}
      this.selectedMediaRelations = []
      if (done) {
        done()
      }
    },
    /** 查询关联媒体列表 */
    loadWritMediaRelations() {
      this.relationLoading = true
      getWritMediaRelationListByWritId(
        this.currentWrit.id,
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
          this.relationLoading = false
        })
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
    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm('是否确认取消关联该媒体?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        this.startProcessing('正在取消关联...')

        try {
          const response = await deleteWritMediaRelation(row.id)

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000)
            this.loadWritMediaRelations()
            this.getList() // 刷新文书列表以更新关联状态

            this.msgSuccess(response.msg || '取消关联成功')
          } else {
            this.msgError(response.msg || '取消关联失败')
          }
        } finally {
          this.stopProcessing()
        }
      } catch (error) {
        // 用户取消操作或发生错误
        if (error !== 'cancel') {
          this.msgError('取消关联失败：' + (error.message || '未知错误'))
        }
      }
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
            type: 'info'
          }
        )

        this.startProcessing('正在批量取消关联...')

        try {
          // 提取选中的关联ID列表
          const ids = this.selectedMediaRelations.map((item) => item.id)

          const response = await batchDeleteWritMediaRelation({ ids: ids })

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000)
            this.selectedMediaRelationMap = {}
            this.selectedMediaRelations = []
            this.loadWritMediaRelations()
            this.getList() // 刷新文书列表以更新关联状态

            this.msgSuccess(
              response.msg ||
                `成功取消关联 ${
                  response.data?.deletedCount || ids.length
                } 个媒体`
            )
          } else {
            this.msgError(response.msg || '批量取消关联失败')
          }
        } finally {
          this.stopProcessing()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('批量取消关联失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** ------------第二层抽屉 -----------------*/
    /** 关联新媒体 - 打开第二层抽屉 */
    handleLinkMedia() {
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

      this.startProcessing('正在关联媒体...')

      try {
        const data = {
          writId: this.currentWrit.id,
          mediaIds: this.selectedMediaList.map((item) => item.mediaId)
        }

        const response = await batchCreateWritMediaRelation(data)

        if (response.code === 200) {
          // 关闭第二层抽屉
          this.mediaSelectorDrawerOpen = false

          // 延迟2秒后刷新第一层抽屉的媒体列表
          await this.delay(2000)
          this.loadWritMediaRelations()
          this.getList() // 刷新文书列表以更新关联状态

          this.msgSuccess(response.msg || '关联成功')
        } else {
          this.msgError(response.msg || '关联失败')
        }
      } catch (error) {
        this.msgError('关联失败：' + (error.message || '未知错误'))
      } finally {
        this.stopProcessing()
      }
    }
  }
}
</script>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/components/dialogs.scss: .main-action-bar
  - src/styles/components/forms.scss: .filter-row, .section-label
  - src/styles/components/table.scss: .action-buttons
  - src/styles/components/buttons.scss: .search-action-buttons
-->
