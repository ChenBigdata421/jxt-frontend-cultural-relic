<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <SiteQueryBar
          ref="queryBar"
          :org-options="orgOptions"
          :user-options="userOptions"
          :brand-options="brandOptions"
          :status-options="stateOptions"
          :open-status-options="openStatusOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @org-change="handleOrgChange"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedSiteRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['equipment:site:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增采集站
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
              v-permisaction="['equipment:site:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['equipment:site:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedSiteRecords.length === 0"
              @click="handleDelete"
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

        <!-- 采集站列表 -->
        <el-table
          ref="siteTable"
          v-loading="loading"
          :data="SiteList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            v-if="isColumnVisible('collectSiteNo')"
            label="编号"
            align="center"
            prop="collectSiteNo"
            sortable="custom"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteName')"
            label="名称"
            align="center"
            prop="collectSiteName"
            sortable="custom"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            label="品牌"
            align="center"
            prop="brandName"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteIp')"
            label="IP地址"
            align="center"
            prop="collectSiteIp"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            label="地址"
            align="center"
            prop="address"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteUrl')"
            label="播放地址"
            align="center"
            prop="collectSiteUrl"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('managerName')"
            label="管理人员"
            align="center"
            prop="managerName"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('managerOrgFullName')"
            label="管理组织"
            align="center"
            prop="managerOrgFullName"
            min-width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            label="状态"
            align="center"
            prop="status"
            width="110"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ stateFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('openStatus')"
            label="启用状态"
            align="center"
            prop="openStatus"
            width="110"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.openStatus === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ openStatusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('cpu')"
            label="CPU"
            align="center"
            prop="cpu"
            min-width="120"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            label="内存(G)"
            align="center"
            prop="memory"
            width="100"
          />
          <el-table-column
            v-if="isColumnVisible('disk')"
            label="存储(G)"
            align="center"
            prop="disk"
            width="100"
          />
          <el-table-column
            v-if="isColumnVisible('usbNum')"
            label="USB数量"
            align="center"
            prop="usbNum"
            width="100"
          />
          <el-table-column
            v-if="isColumnVisible('system')"
            label="操作系统"
            align="center"
            prop="system"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            label="版本"
            align="center"
            prop="version"
            min-width="100"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            label="购买时间"
            align="center"
            prop="purchaseDate"
            width="180"
            sortable="custom"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('remark')"
            label="备注"
            align="center"
            prop="remark"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="260"
            :fixed="actionFixed ? 'right' : false"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['equipment:site:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['equipment:site:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['equipment:site:remove']"
                  size="small"
                  type="text"
                  icon="el-icon-delete"
                  class="action-btn tertiary-danger"
                  @click="handleDelete(scope.row)"
                >
                  删除
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

            <!-- 管理信息 -->
            <el-collapse-item name="manage" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-user section-icon" />
                  <span class="section-title">管理信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="管理组织" prop="managerOrgId">
                    <treeselect
                      v-model="form.managerOrgId"
                      :options="orgOptions"
                      placeholder="请选择管理组织"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="管理人员">
                    <el-select
                      v-model="form.managerId"
                      placeholder="请选择"
                      @change="$forceUpdate()"
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
            </el-collapse-item>

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">4项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="名称" prop="collectSiteName">
                    <el-input
                      v-model="form.collectSiteName"
                      placeholder="请输入名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="编号" prop="collectSiteNo">
                    <el-input
                      v-model="form.collectSiteNo"
                      placeholder="请输入编号"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="品牌">
                    <el-select v-model="form.brandId" placeholder="请选择">
                      <el-option
                        v-for="item in brandOptions"
                        :key="item.id"
                        :label="item.brandName"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="购置时间">
                    <el-date-picker
                      v-model="form.purchaseDate"
                      type="datetime"
                      placeholder="请输入购置时间"
                      format="yyyy-MM-dd HH:mm:ss"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      class="full-width"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 网络信息 -->
            <el-collapse-item name="network" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-link section-icon" />
                  <span class="section-title">网络信息</span>
                  <span class="section-badge">4项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="IP" prop="collectSiteIp">
                    <el-input
                      v-model="form.collectSiteIp"
                      placeholder="请输入IP"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="地址" prop="address">
                    <el-input
                      v-model="form.address"
                      placeholder="请输入物理地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="播放地址" prop="collectSiteUrl">
                    <el-input
                      v-model="form.collectSiteUrl"
                      placeholder="请输入播放地址"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密钥" prop="authKey">
                    <el-input v-model="form.authKey" placeholder="请输入密钥" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 硬件配置 -->
            <el-collapse-item name="hardware" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-setting section-icon" />
                  <span class="section-title">硬件配置</span>
                  <span class="section-badge">5项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="CPU">
                    <el-input v-model="form.cpu" placeholder="请输入CPU" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="内存(G)">
                    <el-input-number
                      v-model="form.memory"
                      placeholder="请输入内存大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="存储(G)">
                    <el-input-number
                      v-model="form.disk"
                      placeholder="请输入磁盘大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="USB数量">
                    <el-input-number v-model="form.usbNum" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 系统信息 -->
            <el-collapse-item name="system" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-monitor section-icon" />
                  <span class="section-title">系统信息</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="操作系统">
                    <el-input
                      v-model="form.system"
                      placeholder="操作系统"
                      maxlength="20"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本">
                    <el-input
                      v-model="form.version"
                      placeholder="版本"
                      maxlength="20"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 状态与备注 -->
            <el-collapse-item name="status" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-info section-icon" />
                  <span class="section-title">状态与备注</span>
                  <span class="section-badge">3项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="启用状态">
                    <el-radio-group v-model="form.openStatus">
                      <el-radio
                        v-for="dict in openStatusOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                      <el-radio
                        v-for="dict in stateOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="备注">
                    <el-input v-model="form.remark" type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="cancel">取 消</el-button>
          <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 浏览采集站对话框 -->
      <el-dialog
        title="浏览采集站"
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
              <el-descriptions-item label="采集站编号">{{
                viewData.collectSiteNo || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="采集站名称">{{
                viewData.collectSiteName || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{
                viewData.brandName || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="管理组织">{{
                viewData.managerOrgFullName || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="管理人员">{{
                viewData.managerName || "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 状态信息 -->
          <el-collapse-item name="status" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-star-on section-icon" />
                <span class="section-title">状态信息</span>
                <span class="section-badge">2项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="启用状态">{{
                selectDictLabel(openStatusOptions, viewData.openStatus) || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{
                selectDictLabel(stateOptions, viewData.status) || "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 网络信息 -->
          <el-collapse-item name="network" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-link section-icon" />
                <span class="section-title">网络信息</span>
                <span class="section-badge">4项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="IP 地址">{{
                viewData.collectSiteIp || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="播放地址">{{
                viewData.collectSiteUrl || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="密钥">{{
                viewData.authKey || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="物理地址" :span="2">{{
                viewData.address || "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 硬件配置 -->
          <el-collapse-item name="hardware" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-setting section-icon" />
                <span class="section-title">硬件配置</span>
                <span class="section-badge">5项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="CPU">{{
                viewData.cpu || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="内存(G)">{{
                viewData.memory || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="存储(G)">{{
                viewData.disk || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="USB 数量">{{
                viewData.usbNum || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="购置时间" :span="2">{{
                viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 系统信息 -->
          <el-collapse-item name="system" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-monitor section-icon" />
                <span class="section-title">系统信息</span>
                <span class="section-badge">2项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="操作系统">{{
                viewData.system || "-"
              }}</el-descriptions-item>
              <el-descriptions-item label="版本">{{
                viewData.version || "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

          <!-- 其他信息 -->
          <el-collapse-item name="other" class="detail-section">
            <template slot="title">
              <div class="section-header">
                <i class="el-icon-info section-icon" />
                <span class="section-title">其他信息</span>
                <span class="section-badge">1项</span>
              </div>
            </template>
            <el-descriptions :column="2" border class="section-descriptions">
              <el-descriptions-item label="备注" :span="2">{{
                viewData.remark || "无"
              }}</el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>

        </el-collapse>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import SiteQueryBar from '@/components/SiteQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listEquipmentSite,
  delEquipmentSite,
  addEquipmentSite,
  updateEquipmentSite,
  listEquipmentBrand
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'
import actionColumnMixin from '@/mixins/actionColumnMixin'

export default {
  name: 'Site',
  mixins: [actionColumnMixin],
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    SiteQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      SiteIds: [],
      selectedSiteRecords: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedSiteMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 总条数
      total: 0,
      // 采集站数据
      SiteList: [],
      // 状态数据字典
      stateOptions: [],
      // 启用状态数据字典
      openStatusOptions: [],
      // 列配置
      columnOptions: [
        { prop: 'collectSiteName', label: '名称', fixed: true, defaultVisible: true },
        { prop: 'collectSiteNo', label: '编号', fixed: true, defaultVisible: true },
        { prop: 'collectSiteIp', label: 'IP地址', fixed: false, defaultVisible: true },
        { prop: 'address', label: '地址', fixed: false, defaultVisible: true },
        { prop: 'collectSiteUrl', label: '播放地址', fixed: false, defaultVisible: false },
        { prop: 'managerName', label: '管理人员', fixed: false, defaultVisible: true },
        {
          prop: 'managerOrgFullName',
          label: '管理组织',
          fixed: false,
          defaultVisible: true
        },
        { prop: 'openStatus', label: '启用状态', fixed: false, defaultVisible: true },
        { prop: 'brandName', label: '品牌', fixed: false, defaultVisible: true },
        { prop: 'status', label: '状态', fixed: false, defaultVisible: true },
        { prop: 'cpu', label: 'CPU', fixed: false, defaultVisible: false },
        { prop: 'memory', label: '内存(G)', fixed: false, defaultVisible: false },
        { prop: 'disk', label: '存储(G)', fixed: false, defaultVisible: false },
        { prop: 'usbNum', label: 'USB数量', fixed: false, defaultVisible: false },
        { prop: 'system', label: '操作系统', fixed: false, defaultVisible: false },
        { prop: 'version', label: '版本', fixed: false, defaultVisible: false },
        { prop: 'purchaseDate', label: '购买时间', fixed: false, defaultVisible: false },
        { prop: 'remark', label: '备注', fixed: false, defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加采集站对话框
      open: false,
      // 是否显示查看采集站详情对话框
      viewOpen: false,
      // 表单折叠状态
      activeFormSections: ['manage', 'basic', 'network'],
      // 详情对话框折叠状态
      activeDetailSections: ['basic', 'status'],
      // 浏览数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      brandOptions: undefined,
      ActiveLab: 'first',
      SelectedRow: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        managerOrgId: undefined,
        managerId: undefined,
        collectSiteNo: undefined,
        collectSiteName: undefined,
        status: undefined,
        brandId: undefined,
        openStatus: undefined
      },
      AttributeValueList: [],
      AttributeValueConfigList: [],
      // 表单参数
      form: {
        status: '1'
      },
      ColumnNameConfigConvert: new Map([
        ['Id', '主键ID'],
        ['Name', '采集站名称'],
        ['HeartBeatTimeSpace', '采集站心跳包间隔时间'],
        ['FileRootPath', '采集站文件保存路径'],
        ['StorageName', '存储服务器'],
        ['UploadSpeed', '采集站上传文件速率'],
        ['UploadTime', '采集站上传文件时间']
      ]),
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: '编号不能为空', trigger: 'blur' }]
      },
      blurWhileExport: false, // 标记页面失去焦点的状态
      processingInstance: null, // Element UI全局加载动画的实例
      previousCursor: null, // 记录鼠标状态
      tableRef: 'siteTable'
    }
  },
  watch: {
    'form.managerOrgId': function(newVal) {
      // 当 form.managerOrgId 更新时，调用 getFormUser
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空管理人员
          this.form.managerId = null // 清空管理人员选择
        }
        this.firstLoad = false
        this.getFormUser()
      }
    },
    'queryParams.managerOrgId': function(newVal) {
      // 当 queryParams.managerOrgId 更新时，调用 getQueryUser
      if (newVal) {
        this.queryParams.managerId = null // 清空管理人员选择
        this.getQueryUser()
      }
    }
  },
  created() {
    this.initVisibleColumns()
    this.getList()
    this.getTreeselect()
    this.getFormBrand()
    this.getDicts('site_status').then((response) => {
      this.stateOptions = response.data
    })
    this.getDicts('open_status').then((response) => {
      this.openStatusOptions = response.data
    })
  },
  methods: {
    /** 查询采集站列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listEquipmentSite(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.SiteList = response.data.list
            this.total = response.data.count
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.SiteList = []
            this.total = 0
            this.msgError(response.msg || '获取采集站列表失败')
          }
        })
        .catch((error) => {
          this.SiteList = []
          this.total = 0
          this.msgError('查询采集站列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
          this.scheduleCheckActionFixed()
        })
    },

    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, row.status)
    },

    // 字典状态字典翻译
    openStatusFormat(row) {
      return this.selectDictLabel(this.openStatusOptions, row.openStatus)
    },
    getFormBrand() {
      listEquipmentBrand().then((response) => {
        this.brandOptions = response.data.list
      })
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },

    getFormUser() {
      listUser({ orgId: '/' + this.form.managerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list
        }
      )
    },

    getQueryUser() {
      listUser({ orgId: '/' + this.queryParams.managerOrgId + '/' }).then(
        (response) => {
          this.userOptions = response.data.list
        }
      )
    },

    // 表单重置
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
        collectSiteName: undefined,
        collectSiteNo: undefined,
        brandName: undefined,
        collectSiteIp: undefined,
        address: undefined,
        collectSiteUrl: undefined,
        authKey: undefined,
        status: undefined,
        openStatus: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        purchaseDate: undefined,
        usbNum: undefined,
        system: undefined,
        version: undefined,
        remark: undefined
      }
      this.resetForm('form')
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },

    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    /** 搜索按钮操作 */
    handleSearch(searchData) {
      // 合并搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 清空被删除的搜索字段
      const searchFields = ['collectSiteNo', 'collectSiteName', 'managerOrgId', 'managerId', 'brandId', 'status', 'openStatus']
      searchFields.forEach(field => {
        if (!(field in searchData)) {
          this.queryParams[field] = undefined
        }
      })

      this.queryParams.pageIndex = 1
      this.resetSelected()
      this.getList()
    },

    /** 快速搜索重置 */
    handleQuickSearchReset() {
      // 重置查询参数
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        managerOrgId: undefined,
        managerId: undefined,
        collectSiteNo: undefined,
        collectSiteName: undefined,
        status: undefined,
        brandId: undefined,
        openStatus: undefined
      }
      this.userOptions = []
      this.$nextTick(() => {
        this.handleQuery()
      })
    },

    /** 管理组织变更 */
    handleOrgChange(orgId) {
      // 组织变化时，可以在这里处理相关逻辑
    },

    /** 搜索按钮操作（保留用于重置后的查询） */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.resetSelected()
      this.getList()
    },

    /** 搜索按钮操作
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedSiteMap = {}
      this.selectedSiteRecords = []
    },

    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
    },

    /** 刷新列表 */
    handleRefresh() {
      this.getList()
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

    // 多选框选中数据
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.SiteList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedSiteMap[id] = row
        } else {
          delete this.selectedSiteMap[id]
        }
      })
      this.selectedSiteRecords = Object.values(this.selectedSiteMap).filter(
        Boolean
      )

      // 更新全选状态
      const totalCount = this.SiteList.length
      const selectedCount = this.selectedSiteRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.siteTable.toggleAllSelection()
    },

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.siteTable) return
      if (!this.SiteList || !this.SiteList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.SiteList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedSiteMap[id]) {
              this.$refs.siteTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          setTimeout(() => {
            this.isRestoringSelection = false
          }, 0)
        }
      })
    },

    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加采集站'
      this.isEdit = false
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.firstLoad = true
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row }
      } else {
        this.form = this.selectedSiteRecords[0]
          ? { ...this.selectedSiteRecords[0] }
          : {}
      }
      this.title = '修改采集站'
      this.isEdit = true
      this.open = true
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row
      this.viewOpen = true
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing('正在修改采集站...')
            updateEquipmentSite(this.form, this.form.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError(
                  '修改采集站失败：' + (error.message || '未知错误')
                )
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建采集站...')
            addEquipmentSite(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError(
                  '新增采集站失败：' + (error.message || '未知错误')
                )
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },

    async handleDelete(row) {
      try {
        var siteIds = []
        var siteNos = []
        if (row && row.id !== undefined) {
          siteIds = [row.id]
          siteNos = [row.collectSiteNo]
        } else {
          siteIds = this.selectedSiteRecords.map((item) => item.id)
          siteNos = this.selectedSiteRecords.map((item) => item.collectSiteNo)
        }
        const count = Array.isArray(siteIds) ? siteIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条采集站记录？此操作不可恢复。`
          : `是否确认删除采集站编号为"${siteNos}"？此操作不可恢复。`
        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.startProcessing('正在删除采集站...')
        const response = await delEquipmentSite({ ids: siteIds })
        if (response.code === 200) {
          await this.delay(2000)
          this.resetSelected()
          this.resetPage()
          this.getList()
          this.msgSuccess(response.msg || '删除采集站成功')
        } else {
          this.msgError(response.msg || '删除采集站失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除采集站失败：' + (error.message || '未知错误'))
        }
      }
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params }
      Object.keys(query).forEach((key) => {
        const value = query[key]
        if (value === '' || value === null || value === undefined) {
          delete query[key]
        }
      })
      return query
    },
    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedSiteRecords) &&
          this.selectedSiteRecords.length > 0

        const count = hasSelection ? this.selectedSiteRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条采集站数据？`
          : '是否确认导出所有采集站数据项？'

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
        const filterVal = exportColumns.map((c) => c.field || c.prop)

        let list = []
        if (hasSelection) {
          list = this.selectedSiteRecords
        } else {
          const baseQueryParams = this.normalizeQueryParams(
            this.queryParams || {}
          )
          const pageSize = 1000
          let pageIndex = 1
          let total = Infinity

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize
            }
            const resp = await listEquipmentSite(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询采集站列表失败')
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
          output.status = this.stateFormat(row)
          output.openStatus = this.openStatusFormat(row)
          output.purchaseDate = this.parseTime(row.purchaseDate)
          return output
        })

        const data = formatJson(filterVal, normalizeList)

        // 触发导出（会弹出另存为对话框）
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '采集站列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem('site_manage_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (error) {
          this.visibleColumns = this.getDefaultVisibleColumns()
        }
      } else {
        this.visibleColumns = this.getDefaultVisibleColumns()
      }
    },

    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
    },

    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },

    /** 列显示变更 */
    handleColumnChange(value) {
      this.visibleColumns = value
      localStorage.setItem('site_manage_visible_columns', JSON.stringify(this.visibleColumns))
      this.refreshTableLayout()
    },

    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      localStorage.setItem('site_manage_visible_columns', JSON.stringify(this.visibleColumns))
      this.$message.success('已重置为默认显示')
      this.refreshTableLayout()
    },

    /** 列设置对话框打开后的焦点管理 */
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

    /** 列设置对话框关闭后的焦点管理 */
    handleColumnSettingsClose() {
      // 焦点自动返回触发按钮
    }
  }
}
</script>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .detail-dialog, .form-collapse
  - src/styles/components/forms.scss: .section-header, .section-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
