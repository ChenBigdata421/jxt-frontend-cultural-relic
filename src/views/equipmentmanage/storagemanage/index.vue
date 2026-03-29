<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <StorageQueryBar
          ref="queryBar"
          :org-options="orgOptions"
          :user-options="userOptions"
          :brand-options="brandOptions"
          :status-options="statusOptions"
          :open-status-options="openStatusOptions"
          @search="handleSearch"
          @quick-search-reset="handleQuickSearchReset"
          @org-change="handleOrgChange"
        />

        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedStorageRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['equipment:storage:create']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增存储
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
              v-permisaction="['equipment:storage:export']"
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
            <el-button
              v-permisaction="['equipment:storage:remove']"
              icon="el-icon-delete"
              size="small"
              class="action-btn tertiary-danger"
              :disabled="selectedStorageRecords.length === 0"
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
        <!--orgList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          ref="storageTable"
          v-loading="loading"
          :data="StorageList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="220"
            fixed="left"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['equipment:storage:browse']"
                  size="small"
                  type="text"
                  icon="el-icon-view"
                  class="action-btn tertiary"
                  @click="handleView(scope.row)"
                >
                  浏览
                </el-button>
                <el-button
                  v-permisaction="['equipment:storage:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['equipment:storage:remove']"
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
          <el-table-column
            v-if="isColumnVisible('storageSiteNo')"
            label="编号"
            align="center"
            prop="storageSiteNo"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('storageSiteName')"
            label="名称"
            align="center"
            prop="storageSiteName"
            min-width="140"
            sortable="custom"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            label="品牌"
            align="center"
            prop="brandName"
          />
          <el-table-column
            v-if="isColumnVisible('managerName')"
            label="管理员"
            align="center"
            prop="managerName"
          />
          <el-table-column
            v-if="isColumnVisible('managerOrgFullName')"
            label="管理员所在组织"
            align="center"
            prop="managerOrgFullName"
            min-width="180"
          />
          <el-table-column
            v-if="isColumnVisible('storageSiteIp')"
            label="IP地址"
            align="center"
            prop="storageSiteIp"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            label="状态"
            align="center"
            prop="status"
            sortable="custom"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('openStatus')"
            label="启用状态"
            align="center"
            prop="openStatus"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.openStatus === 1 ? 'success' : 'danger'"
                disable-transitions
              >{{ openStatusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('system')"
            label="操作系统"
            align="center"
            prop="system"
            min-width="140"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            label="版本"
            align="center"
            prop="version"
          />
          <el-table-column
            v-if="isColumnVisible('storageSiteUrl')"
            label="播放地址"
            align="center"
            prop="storageSiteUrl"
            min-width="160"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            label="详细地址"
            align="center"
            prop="address"
            min-width="180"
          />
          <el-table-column
            v-if="isColumnVisible('cpu')"
            label="CPU"
            align="center"
            prop="cpu"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            label="内存(GB)"
            align="center"
            prop="memory"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            label="购置时间"
            align="center"
            prop="purchaseDate"
            width="180"
            sortable="custom"
          >
            <template slot-scope="{ row }">
              <span>{{ parseTime(row.purchaseDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('disk')"
            label="磁盘(GB)"
            align="center"
            prop="disk"
          />
          <el-table-column
            v-if="isColumnVisible('remark')"
            label="备注"
            align="center"
            prop="remark"
            min-width="160"
          />
        </el-table>
        <!-- 分页 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

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
                    <el-form-item
                      label="管理组织"
                      prop="managerOrgId"
                    >
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
                        class="full-width"
                        clearable
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
                    <span class="section-badge">3项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item
                      label="名称"
                      prop="storageSiteName"
                    >
                      <el-input
                        v-model="form.storageSiteName"
                        placeholder="请输入名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item
                      label="编号"
                      prop="storageSiteNo"
                    >
                      <el-input
                        v-model="form.storageSiteNo"
                        placeholder="请输入编号"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="品牌">
                      <el-select v-model="form.brandId" placeholder="请选择" class="full-width">
                        <el-option
                          v-for="item in brandOptions"
                          :key="item.id"
                          :label="item.brandName"
                          :value="item.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 设备信息 -->
              <el-collapse-item name="device" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-setting section-icon" />
                    <span class="section-title">设备信息</span>
                    <span class="section-badge">2项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="设备状态">
                      <el-radio-group v-model="form.status" class="radio-group">
                        <el-radio
                          v-for="dict in statusOptions"
                          :key="dict.value"
                          :label="dict.value"
                        >{{ dict.label }}</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
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
              </el-collapse-item>

              <!-- 网络配置 -->
              <el-collapse-item name="network" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-link section-icon" />
                    <span class="section-title">网络配置</span>
                    <span class="section-badge">4项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item
                      label="IP地址"
                      prop="storageSiteIp"
                    >
                      <el-input
                        v-model="form.storageSiteIp"
                        placeholder="请输入IP地址"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item
                      label="物理地址"
                      prop="address"
                    >
                      <el-input
                        v-model="form.address"
                        placeholder="请输入物理地址"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item
                      label="播放地址"
                      prop="storageSiteUrl"
                    >
                      <el-input
                        v-model="form.storageSiteUrl"
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
                    <i class="el-icon-cpu section-icon" />
                    <span class="section-title">硬件配置</span>
                    <span class="section-badge">3项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="CPU型号">
                      <el-input v-model="form.cpu" placeholder="请输入CPU型号" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="内存容量">
                      <el-input-number
                        v-model="form.memory"
                        placeholder="单位：GB"
                        :min="0"
                        controls-position="right"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="存储容量">
                      <el-input-number
                        v-model="form.disk"
                        placeholder="单位：GB"
                        :min="0"
                        controls-position="right"
                        class="full-width"
                      />
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
                        placeholder="请输入系统名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="系统版本">
                      <el-input v-model="form.version" placeholder="请输入版本号" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 其他信息 -->
              <el-collapse-item name="other" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-info section-icon" />
                    <span class="section-title">其他信息</span>
                    <span class="section-badge">2项</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="购置时间">
                      <el-date-picker
                        v-model="form.purchaseDate"
                        type="datetime"
                        placeholder="选择购置时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="备注说明">
                      <el-input
                        v-model="form.remark"
                        placeholder="请输入备注信息"
                      />
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
        <!-- 浏览存储对话框 -->
        <el-dialog
          title="浏览存储"
          :visible.sync="viewOpen"
          width="800px"
          append-to-body
          :close-on-click-modal="false"
          custom-class="detail-dialog"
        >
          <el-collapse v-model="activeViewSections" class="form-collapse">

            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">6项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="存储编号">
                  <span class="nowrap-text">{{ viewData.storageSiteNo || "-" }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="存储名称">
                  {{ viewData.storageSiteName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="品牌">
                  {{ viewData.brandName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="管理组织">
                  {{ viewData.managerOrgFullName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="管理人员">
                  {{ viewData.managerName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="启用状态">
                  <el-tag
                    v-if="viewData.openStatus !== undefined"
                    :type="viewData.openStatus === 1 ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >{{ selectDictLabel(openStatusOptions, viewData.openStatus) }}</el-tag>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag
                    v-if="viewData.status !== undefined"
                    :type="viewData.status === 1 ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >{{ selectDictLabel(statusOptions, viewData.status) }}</el-tag>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="购置时间">
                  {{ viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

            <!-- 网络配置 -->
            <el-collapse-item name="network" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-link section-icon" />
                  <span class="section-title">网络配置</span>
                  <span class="section-badge">4项</span>
                </div>
              </template>
              <el-descriptions :column="1" border class="section-descriptions">
                <el-descriptions-item label="IP 地址">
                  {{ viewData.storageSiteIp || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="播放地址">
                  {{ viewData.storageSiteUrl || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="密钥">
                  {{ viewData.authKey || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="物理地址">
                  {{ viewData.address || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

            <!-- 硬件配置 -->
            <el-collapse-item name="hardware" class="detail-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-cpu section-icon" />
                  <span class="section-title">硬件配置</span>
                  <span class="section-badge">3项</span>
                </div>
              </template>
              <el-descriptions :column="2" border class="section-descriptions">
                <el-descriptions-item label="CPU型号">
                  {{ viewData.cpu || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="内存容量">
                  {{ viewData.memory ? viewData.memory + ' GB' : "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="存储容量">
                  {{ viewData.disk ? viewData.disk + ' GB' : "-" }}
                </el-descriptions-item>
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
                <el-descriptions-item label="操作系统">
                  {{ viewData.system || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="系统版本">
                  {{ viewData.version || "-" }}
                </el-descriptions-item>
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
              <el-descriptions :column="1" border class="section-descriptions">
                <el-descriptions-item label="备注">
                  {{ viewData.remark || "无" }}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>

          </el-collapse>

          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="action-btn tertiary" size="small" @click="viewOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import StorageQueryBar from '@/components/StorageQueryBar/index.vue'
import BatchActionBar from '@/components/BatchActionBar/index.vue'
import {
  listEquipmentStorage,
  delEquipmentStorage,
  addEquipmentStorage,
  updateEquipmentStorage,
  listEquipmentBrand
} from '@/api/admin/equipment_manage_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import { listUser } from '@/api/admin/sys-user'

export default {
  name: 'Storage',
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    StorageQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      StorageIds: [],
      selectedStorageRecords: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedStorageMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 总条数
      total: 0,
      // 存储数据
      StorageList: [],
      // 状态数据字典
      statusOptions: [],
      // 启用状态数据字典
      openStatusOptions: [],
      // 品牌选项
      brandOptions: [],
      // 列配置
      columnOptions: [
        {
          prop: 'storageSiteName',
          label: '名称',
          fixed: true,
          defaultVisible: true
        },
        { prop: 'storageSiteNo', label: '编号', defaultVisible: true },
        { prop: 'brandName', label: '品牌', defaultVisible: true },
        { prop: 'managerName', label: '管理员', defaultVisible: true },
        {
          prop: 'managerOrgFullName',
          label: '管理员所在组织',
          defaultVisible: true
        },
        { prop: 'storageSiteIp', label: 'IP地址', defaultVisible: true },
        { prop: 'openStatus', label: '启用状态', defaultVisible: true },
        { prop: 'status', label: '状态', defaultVisible: true },
        { prop: 'system', label: '操作系统', defaultVisible: true },
        { prop: 'version', label: '版本', defaultVisible: false },
        { prop: 'storageSiteUrl', label: '播放地址', defaultVisible: false },
        { prop: 'address', label: '详细地址', defaultVisible: false },
        { prop: 'cpu', label: 'CPU', defaultVisible: false },
        { prop: 'memory', label: '内存(GB)', defaultVisible: false },
        { prop: 'purchaseDate', label: '购置时间', defaultVisible: false },
        { prop: 'disk', label: '磁盘(GB)', defaultVisible: false },
        { prop: 'remark', label: '备注', defaultVisible: false }
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: '',
      isEdit: false,
      // 是否显示增加存储对话框
      open: false,
      // 是否显示查看存储详情对话框
      viewOpen: false,
      // 浏览数据
      viewData: {},
      // 浏览对话框折叠状态
      activeViewSections: ['basic', 'network'],
      // 表单折叠状态
      activeFormSections: ['manage', 'basic'],
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      ActiveLab: 'first',
      SelectedRow: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        storageSiteNo: undefined,
        storageSiteName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        status: undefined,
        brandId: undefined,
        openStatus: undefined
      },
      AttributeValueList: [],
      AttributeValueConfigList: [],
      // 表单参数
      form: {
        status: '1',
        openStatus: '1'
      },
      ColumnNameConfigConvert: new Map([
        ['Id', '主键ID'],
        ['StorageName', '存储服务器名称'],
        ['FtpUsername', 'FTP用户名'],
        ['FtpPassword', 'FTP密码'],
        ['FtpPort', 'FTP端口'],
        ['HeartBeatTimeSpace', '心跳包间隔时间'],
        ['FileRootPath', '文件保存路径'],
        ['UploadSpeed', '上传文件速率'],
        ['ExpiryTime', '到期时间']
      ]),
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: '编号不能为空', trigger: 'blur' }]
      },
      processingInstance: null, // Element UI全局加载动画的实例
      previousCursor: null // 记录鼠标状态
    }
  },
  watch: {
    'form.managerOrgId': function(newVal) {
      // 当 form.managerOrgId 更新时，调用 getUser
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
    this.getList()
    this.getTreeselect()
    this.getFormBrand()
    this.getDicts('site_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('open_status').then((response) => {
      this.openStatusOptions = response.data
    })
    this.initVisibleColumns()
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop)
    },
    initVisibleColumns() {
      const saved = localStorage.getItem('storage_manage_visible_columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
          return
        } catch (error) {
          console.warn('解析列配置失败，使用默认列', error)
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns()
    },
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop)
    },
    handleColumnChange(value) {
      this.visibleColumns = value
      localStorage.setItem(
        'storage_manage_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns()
      localStorage.setItem(
        'storage_manage_visible_columns',
        JSON.stringify(this.visibleColumns)
      )
      this.$message.success('已重置为默认显示')
    },
    /** 查询存储列表 */
    getList() {
      this.loading = true
      const query = this.normalizeQueryParams(this.queryParams)
      listEquipmentStorage(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.StorageList = response.data.list
            this.total = response.data.count
            // 分页/查询后回显跨分页选择
            this.restoreSelection()
          } else {
            this.StorageList = []
            this.total = 0
            this.msgError(response.msg || '获取存储列表失败')
          }
        })
        .catch((error) => {
          this.StorageList = []
          this.total = 0
          this.msgError('查询存储列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 字典状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    // 字典启用状态字典翻译
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
        storageSiteNo: undefined,
        storageSiteName: undefined,
        storageSiteIp: undefined,
        storageSiteUrl: undefined,
        address: undefined,
        authKey: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        purchaseDate: undefined,
        system: undefined,
        version: undefined,
        remark: undefined,
        brandId: undefined,
        status: undefined,
        openStatus: undefined
      }
      this.resetForm('form')
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedStorageMap = {}
      this.selectedStorageRecords = []
      this.isAllSelected = false
      this.isSelectionIndeterminate = false
    },
    // pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    // 每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
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
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      )

      ;(this.StorageList || []).forEach((row) => {
        const id = row && row.id
        if (!id) return
        if (selectedIdSet.has(id)) {
          this.selectedStorageMap[id] = row
        } else {
          delete this.selectedStorageMap[id]
        }
      })
      this.selectedStorageRecords = Object.values(
        this.selectedStorageMap
      ).filter(Boolean)

      // 更新全选状态
      const totalCount = this.StorageList.length
      const selectedCount = this.selectedStorageRecords.length
      this.isAllSelected = selectedCount === totalCount && totalCount > 0
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount
    },

    /** 批量全选/取消全选 */
    handleSelectAll(val) {
      this.isAllSelected = val
      this.isSelectionIndeterminate = false
      this.$refs.storageTable.toggleAllSelection()
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      // 合并新的搜索条件
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })

      // 删除被清空的搜索字段
      const searchFields = ['storageSiteNo', 'storageSiteName', 'managerOrgId', 'managerId', 'brandId', 'openStatus', 'status']
      searchFields.forEach(field => {
        if (!(field in searchData)) {
          delete this.queryParams[field]
        }
      })

      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    handleQuickSearchReset() {
      this.handleFilterReset()
    },

    handleOrgChange(orgId) {
      // 当组织改变时，清空管理人员选择
      this.queryParams.managerId = null
      this.getQueryUser()
    },

    handleFilterReset() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        storageSiteNo: undefined,
        storageSiteName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        status: undefined,
        brandId: undefined,
        openStatus: undefined
      }
      this.resetPage()
      this.resetSelected()
      this.getList()
    },

    /** 刷新列表 */
    handleRefresh() {
      this.getList()
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
    },

    restoreSelection() {
      if (this.isRestoringSelection) return
      if (!this.$refs.storageTable) return
      if (!this.StorageList || !this.StorageList.length) return

      this.isRestoringSelection = true
      this.$nextTick(() => {
        try {
          this.StorageList.forEach((row) => {
            const id = row && row.id
            if (!id) return
            if (this.selectedStorageMap[id]) {
              this.$refs.storageTable.toggleRowSelection(row, true)
            }
          })
        } finally {
          this.isRestoringSelection = false
        }
      })
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加存储'
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
        this.form = this.selectedStorageRecords[0]
          ? { ...this.selectedStorageRecords[0] }
          : {}
      }
      this.title = '修改存储'
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
            this.startProcessing('正在修改存储...')
            updateEquipmentStorage(this.form, this.form.id)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(1000)
                  this.resetSelected()
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('修改存储失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建存储...')
            addEquipmentStorage(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(1000)
                  this.getList()
                  this.msgSuccess(response.msg)
                  this.open = false
                } else {
                  this.msgError(response.msg)
                }
              })
              .catch((error) => {
                this.msgError('新增存储失败：' + (error.message || '未知错误'))
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
        var storageIds = []
        var storageNames = []
        if (row && row.id !== undefined) {
          storageIds = [row.id]
          storageNames = [row.storageSiteName || row.storageSiteNo]
        } else {
          storageIds = this.selectedStorageRecords.map((item) => item.id)
          storageNames = this.selectedStorageRecords.map(
            (item) => item.storageSiteName || item.storageSiteNo
          )
        }

        const count = Array.isArray(storageIds) ? storageIds.length : 1
        const confirmMessage = count > 1
          ? `是否确认删除选中的 ${count} 条存储记录？此操作不可恢复。`
          : `是否确认删除存储"${storageNames[0]}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除存储...')
        const response = await delEquipmentStorage({ ids: storageIds })
        if (response.code === 200) {
          await this.delay(1000)
          this.resetSelected()
          this.resetPage()
          this.getList()
          this.msgSuccess(response.msg || '删除存储成功')
        } else {
          this.msgError(response.msg || '删除存储失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除存储失败：' + (error.message || '未知错误'))
        }
      }
    },
    // 在页面中清空一个字符串查询条件时，并不能置为undefined，而是空字符串，此时需要手动删除该查询条件
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
          Array.isArray(this.selectedStorageRecords) &&
          this.selectedStorageRecords.length > 0

        const count = hasSelection ? this.selectedStorageRecords.length : 0
        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${count} 条存储数据？`
          : '是否确认导出所有存储数据项？'

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
          list = this.selectedStorageRecords
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
            const resp = await listEquipmentStorage(query)
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || '查询存储列表失败')
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
          output.status = this.statusFormat(row)
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
          filename: '存储列表',
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

