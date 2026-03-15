<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 新的查询栏组件 -->
        <div class="query-section">
          <IncidentQueryBar
            ref="queryBar"
            :status-options="statusOptions"
            @search="handleSearch"
            @filter-change="handleFilterChange"
            @filter-reset="handleFilterReset"
          />
        </div>
        <!-- 批量操作栏 -->
        <BatchActionBar
          :selected-count="selectedIncidentRecords.length"
          :is-indeterminate="isSelectionIndeterminate"
          :all-selected="isAllSelected"
          @select-all-change="handleSelectAll"
          @batch-delete="handleBatchDelete"
          @batch-export="handleBatchExport"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['incidentrecord:bwc:create']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >
              新增警情
            </el-button>
            <el-button
              icon="el-icon-refresh"
              size="mini"
              @click="handleRefresh"
            >
              刷新
            </el-button>
          </div>
          <div class="right-actions">
            <el-popover placement="bottom-end" width="300" trigger="click">
              <div class="column-settings">
                <div class="column-settings-header">
                  <span>列显示设置</span>
                  <el-button type="text" size="mini" @click="resetColumns"
                    >重置</el-button
                  >
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
                    <el-checkbox :label="col.prop" :disabled="col.fixed">
                      {{ col.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              <el-button slot="reference" size="mini" icon="el-icon-setting"
                >列设置</el-button
              >
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
          v-loading="loading"
          :data="incidentRecordList"
          :key="'incident-table-' + incidentRecordList.length"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为"v-bind"或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="200"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['incidentrecord:bwc:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                class="action-btn view-btn"
                @click="handleView(scope.row)"
              >
                浏览
              </el-button>
              <el-button
                v-permisaction="['incidentrecord:bwc:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                class="action-btn edit-btn"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-button>
              <el-button
                v-permisaction="['incidentrecord:bwc:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                class="action-btn delete-btn"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
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
            v-if="isColumnVisible('context')"
            prop="context"
            label="报警内容"
            min-width="200"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            prop="address"
            label="警情地址"
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
            v-if="isColumnVisible('result')"
            prop="result"
            label="处警结果"
            min-width="200"
            :show-overflow-tooltip="true"
          />
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
                ></span>
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

        <!-- 添加或修改警情对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="750px"
          :close-on-click-modal="false"
        >
          <div class="form-container">
            <el-form
              ref="form"
              :model="form"
              :rules="rules"
              label-width="100px"
            >
              <!-- 基础信息 -->
              <div class="form-section">
                <div class="form-section-title">基础信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="报警人姓名：" prop="name">
                      <el-input
                        v-model="form.name"
                        placeholder="请输入报警人姓名"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="报警电话：" prop="tel">
                      <el-input
                        v-model="form.tel"
                        placeholder="请输入报警电话"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="警情标题：" prop="title">
                      <el-input
                        v-model="form.title"
                        placeholder="请输入警情标题"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="报警内容：" prop="context">
                      <el-input
                        v-model="form.context"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入报警内容"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="报警地址：" prop="address">
                      <el-input
                        v-model="form.address"
                        placeholder="请输入报警地址"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="处警组织：" prop="orgId">
                      <treeselect
                        v-model="form.orgId"
                        :options="orgOptions"
                        placeholder="请选择处警组织"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="处警人员：">
                      <el-select
                        v-model="form.processPoliceIds"
                        placeholder="请选择处警人员"
                        multiple
                        collapse-tags
                        collapse-tags-tooltip
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
              </div>

              <!-- 时间信息 -->
              <div class="form-section">
                <div class="form-section-title">时间信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="创建时间：">
                      <el-date-picker
                        v-model="form.createTime"
                        type="datetime"
                        placeholder="选择创建时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="报警时间：">
                      <el-date-picker
                        v-model="form.reportTime"
                        type="datetime"
                        placeholder="选择报警时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="接警时间：">
                      <el-date-picker
                        v-model="form.receiveTime"
                        type="datetime"
                        placeholder="选择接警时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="处警时间：">
                      <el-date-picker
                        v-model="form.processTime"
                        type="datetime"
                        placeholder="选择处警时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="结束时间：">
                      <el-date-picker
                        v-model="form.endTime"
                        type="datetime"
                        placeholder="选择结束时间"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 处警信息 -->
              <div class="form-section">
                <div class="form-section-title">处警信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="警情监督类型：" prop="superviseType">
                      <el-select
                        v-model="form.superviseType"
                        placeholder="请选择"
                        class="full-width"
                      >
                        <el-option label="类型一" value="1" />
                        <el-option label="类型二" value="2" />
                        <el-option label="类型三" value="3" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="处警结果：" prop="result">
                      <el-input
                        v-model="form.result"
                        placeholder="请输入处警结果"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="状态：">
                      <el-radio-group v-model="form.status">
                        <el-radio
                          v-for="dict in statusOptions"
                          :key="dict.value"
                          :label="dict.value"
                          >{{ dict.label }}</el-radio
                        >
                      </el-radio-group>
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

        <!--显示详情-->
        <el-dialog
          title="警情详情"
          :visible.sync="ViewOpen"
          width="800px"
          append-to-body
          :close-on-click-modal="false"
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="警情编号">
              {{ viewData.code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="警情标题">
              {{ viewData.title || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="报警人姓名">
              {{ viewData.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="报警电话">
              {{ viewData.tel || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处警单编号">
              {{ viewData.processCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="接警单编号">
              {{ viewData.receiveCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="反馈单编号">
              {{ viewData.feedbackCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="警情监督类型">
              {{ viewData.superviseType || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="案件编号">
              {{ viewData.caseId || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="归档编号">
              {{ viewData.archiveCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处警组织路径" :span="2">
              {{ viewData.orgPaths || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处警组织名称">
              {{ viewData.orgName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="组织编码">
              {{ viewData.orgCode || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="组织简称">
              {{ viewData.orgJc || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处警人员">
              {{ viewData.processPoliceNames || "-" }}
            </el-descriptions-item>
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
                {{
                  selectDictLabel(
                    incidentRelationStatusOptions,
                    viewData.isRelation
                  ) || "-"
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="报警地址" :span="2">
              {{ viewData.address || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="报警内容" :span="2">
              {{ viewData.context || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处警结果" :span="2">
              {{ viewData.result || "-" }}
            </el-descriptions-item>
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
            <el-descriptions-item label="创建时间">
              {{ parseTime(viewData.createTime) || "-" }}
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
          <div slot="footer" class="dialog-footer">
            <el-button @click="ViewOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>
<script>
import {
  delIncidentRecordById,
  addIncidentRecord,
  updateIncidentRecord,
  batchDelIncidentRecord,
  addIncidentRecordMediaRelations,
  delIncidentRecordMediaRelations,
} from "@/api/evidence/evidence_manage_command_api";
import {
  getIncidentRecordList,
  getIncidentRecordMediaRelationsByIncidentRecord,
} from "@/api/evidence/evidence_manage_query_api";
import { getEnforceTypeTree } from "@/api/admin/enforcetype";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IncidentQueryBar from "@/components/IncidentQueryBar/index.vue";
import BatchActionBar from "@/components/BatchActionBar/index.vue";

export default {
  name: "LawCarema",
  components: {
    Treeselect,
    IncidentQueryBar,
    BatchActionBar
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 总条数
      total: 0,
      // 警情数据
      incidentRecordList: [],
      selectedPoliceIds: [], // 多选的处警人
      // 状态数据字典
      statusOptions: [],
      // 关联状态数据字典
      incidentRelationStatusOptions: [],
      // 弹出层标题
      title: "",
      isEdit: false,
      // 使用 Map 存储所有选中的项（跨分页）
      selectedIncidentRecordMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      //所有选中的警情记录
      selectedIncidentRecords: [],
      // 全选状态
      isAllSelected: false,
      isSelectionIndeterminate: false,
      // 是否显示增加警情对话框
      open: false,
      ViewOpen: false,
      // 当前选中的警情记录
      currentIncidentRecord: null,
      // 详情数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      // 选中的媒体数据
      selectedMediaData: [],
      // 警情媒体关联列表
      mediaRelationsList: [],
      // 媒体关联列表加载状态
      mediaRelationsLoading: false,
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
        isRelation: undefined,
      },
      AttributeValueList: [],
      // 表单参数
      form: {
        code: undefined,
        name: undefined,
        title: undefined,
        tel: undefined,
        context: undefined,
        address: undefined,
        orgId: undefined,
        processPoliceIds: [],
        createTime: undefined,
        reportTime: undefined,
        receiveTime: undefined,
        processTime: undefined,
        endTime: undefined,
        result: undefined,
        feedbackCode: undefined,
        processCode: undefined,
        receiveCode: undefined,
        caseId: undefined,
        archiveCode: undefined,
        superviseType: undefined,
        status: undefined,
        isRelation: undefined,
      },
      // 列配置选项
      columnOptions: [
        { prop: "code", label: "警情号", fixed: true, defaultVisible: true },
        { prop: "name", label: "报警人姓名", defaultVisible: true },
        { prop: "title", label: "警情标题", defaultVisible: true },
        { prop: "tel", label: "报警电话", defaultVisible: true },
        { prop: "context", label: "报警内容", defaultVisible: false },
        { prop: "address", label: "警情地址", defaultVisible: true },
        { prop: "processCode", label: "处警单编号", defaultVisible: false },
        { prop: "receiveCode", label: "接警单编号", defaultVisible: false },
        { prop: "feedbackCode", label: "反馈单编号", defaultVisible: false },
        {
          prop: "processPoliceNames",
          label: "处警人",
          defaultVisible: true,
        },
        { prop: "orgPaths", label: "处警组织", defaultVisible: true },
        { prop: "orgName", label: "组织名称", defaultVisible: false },
        { prop: "orgCode", label: "组织编码", defaultVisible: false },
        { prop: "orgJc", label: "组织简称", defaultVisible: false },
        { prop: "createUserName", label: "创建用户", defaultVisible: false },
        { prop: "createUserNo", label: "创建用户警号", defaultVisible: false },
        { prop: "updateUserName", label: "更新用户", defaultVisible: false },
        { prop: "updateUserNo", label: "更新用户警号", defaultVisible: false },
        { prop: "createTime", label: "创建时间", defaultVisible: false },
        { prop: "reportTime", label: "报警时间", defaultVisible: true },
        { prop: "receiveTime", label: "接警时间", defaultVisible: true },
        { prop: "processTime", label: "处警时间", defaultVisible: true },
        { prop: "endTime", label: "结束时间", defaultVisible: false },
        { prop: "result", label: "处警结果", defaultVisible: true },
        { prop: "caseId", label: "案件编号", defaultVisible: false },
        { prop: "archiveCode", label: "归档编号", defaultVisible: false },
        { prop: "superviseType", label: "警情监督类型", defaultVisible: true },
        { prop: "status", label: "状态", defaultVisible: true },
        { prop: "isRelation", label: "是否关联", defaultVisible: true },
      ],
      // 可见列
      visibleColumns: [],
      processingInstance: null, //Element UI全局加载动画的实例
      previousCursor: null, //记录鼠标状态
    };
  },
  watch: {
    "form.orgId": function (newVal) {
      // 当 form.orgId 更新时，调用 getUser
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空管理人员
          this.form.processPoliceIds = [];
        }
        this.firstLoad = false;
        this.getFormUser();
      }
    },
  },
  created() {
    this.initVisibleColumns();
    this.getTreeselect();
    this.getEnforceTypeTreeselect();

    // 使用Promise.all等待所有字典加载完成后再加载列表
    Promise.all([
      this.getDicts("incidentrecord_status"),
      this.getDicts("relation_status"),
    ])
      .then(([statusRes, relationStatusRes]) => {
        this.statusOptions = statusRes.data;
        this.incidentRelationStatusOptions = relationStatusRes.data;

        // 字典加载完成后再加载列表
        this.getList();
      })
      .catch((error) => {
        console.error("[IncidentRecordQuery] 字典加载失败:", error);
        // 即使字典加载失败,也要加载列表
        this.getList();
      });
  },
  methods: {
    handleOrgSelect(node) {
      listUser({ orgId: "/" + node.id + "/" }).then((response) => {
        this.userOptions = response.data.list;
      });
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        } else if (
          (key === "reportTimeStart" ||
            key === "reportTimeEnd" ||
            key === "receiveTimeStart" ||
            key === "receiveTimeEnd" ||
            key === "processTimeStart" ||
            key === "processTimeEnd" ||
            key === "endTimeStart" ||
            key === "endTimeEnd") &&
          typeof value === "string"
        ) {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            query[key] = date.toISOString();
          }
        }
      });
      return query;
    },
    incidentRelationStatusFormat(row) {
      return this.selectDictLabel(
        this.incidentRelationStatusOptions,
        row.isRelation
      );
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    /** 查询警情列表 */
    getList() {
      this.loading = true;
      const query = this.normalizeQueryParams(this.queryParams);
      getIncidentRecordList(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            // 注意：response.data是数组类型，数组的元素是对象
            this.incidentRecordList = response.data.list;
            this.total = response.data.count;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.incidentRecordList = [];
            this.total = 0;
            this.msgError(response.msg || "获取警情列表失败");
          }
        })
        .catch((error) => {
          this.incidentRecordList = [];
          this.total = 0;
          this.msgError("查询警情列表失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data; // 返回数组类型；[id:    label(组织名称):  children []]），
      });
    },

    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: "/" + this.form.orgId + "/" })
          .then((response) => {
            this.userOptions = response.data.list;
            resolve("true");
          })
          .catch((error) => {
            console.error("获取用户失败:", error);
            this.userOptions = [];
            reject(error);
          });
      });
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.incidentRecordTable) return;
      if (!this.incidentRecordList || !this.incidentRecordList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.incidentRecordList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedIncidentRecordMap[id]) {
              this.$refs.incidentRecordTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
    },

    // 表单重置
    reset() {
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      // 将queryForm中每项元素所绑定的变量置于初始值
      this.resetForm("queryForm");
      this.userOptions = [];
      this.handleQuery();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 搜索按钮操作
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedIncidentRecordMap = {};
      this.selectedIncidentRecords = [];
    },

    //pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    //每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1;
    },

    handleQuery() {
      this.resetPage();
      this.resetSelected();
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return;
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.incidentRecordList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedIncidentRecordMap[id] = row;
        } else {
          delete this.selectedIncidentRecordMap[id];
        }
      });
      this.selectedIncidentRecords = Object.values(
        this.selectedIncidentRecordMap
      ).filter(Boolean);

      // 更新全选状态
      const totalCount = this.incidentRecordList.length;
      const selectedCount = this.selectedIncidentRecords.length;
      this.isAllSelected = selectedCount === totalCount && totalCount > 0;
      this.isSelectionIndeterminate = selectedCount > 0 && selectedCount < totalCount;
    },
    /** 新增按钮操作*/
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加警情";
      this.isEdit = false;
    },

    handleSortChang(column, prop, order) {
      prop = column.prop;
      order = column.order;
      if (order === "descending") {
        this.queryParams[prop + "Order"] = "desc";
      } else if (order === "ascending") {
        this.queryParams[prop + "Order"] = "asc";
      } else {
        this.queryParams[prop + "Order"] = undefined;
      }

      this.getList();
    },

    /** 新增查询栏相关方法 */
    handleSearch(searchData) {
      // 处理搜索
      if (searchData.keyword) {
        this.queryParams.keyword = searchData.keyword;
      } else {
        delete this.queryParams.keyword;
      }
      this.handleQuery();
    },

    handleFilterChange(filterData) {
      // 处理快捷筛选和高级筛选
      if (filterData.filterType === 'today') {
        // 今日警情
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.queryParams.reportTimeStart = today.toISOString();
        delete this.queryParams.reportTimeEnd;
      } else if (filterData.filterType === 'mine') {
        // 我的警情 - 需要从 store 获取当前用户
        const currentUser = this.$store.state.user && this.$store.state.user.user;
        if (currentUser && currentUser.userId) {
          this.queryParams.createUserId = currentUser.userId;
        }
      } else if (filterData.filterType === 'pending') {
        // 待处理
        this.queryParams.status = 0;
      } else if (filterData.filterType === 'archived') {
        // 已归档
        this.queryParams.status = 3;
      } else if (filterData.filterType === 'advanced') {
        // 高级筛选 - 合并筛选参数
        Object.assign(this.queryParams, filterData);
      } else if (filterData.filterType === 'all') {
        // 全部 - 清除特定筛选条件
        delete this.queryParams.reportTimeStart;
        delete this.queryParams.reportTimeEnd;
        delete this.queryParams.createUserId;
        delete this.queryParams.status;
      }
      this.handleQuery();
    },

    handleFilterReset() {
      this.resetQuery();
    },

    handleSelectAll(val) {
      this.isAllSelected = val;
      this.isSelectionIndeterminate = false;
      this.$refs.incidentRecordTable.toggleAllSelection();
    },

    handleBatchDelete() {
      // 复用原有的 handleDelete 方法
      this.handleDelete();
    },

    handleBatchExport() {
      // 复用原有的 handleExport 方法
      this.handleExport();
    },

    handleRefresh() {
      this.getList();
    },

    // 获取状态对应的样式类名
    getStatusClass(status) {
      const statusMap = {
        0: 'pending',
        1: 'processing',
        2: 'completed',
        3: 'archived'
      };
      return statusMap[status] || 'pending';
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.firstLoad = true;
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row };
      } else {
        this.form = this.selectedIncidentRecords[0]
          ? { ...this.selectedIncidentRecords[0] }
          : {};
      }
      this.title = "修改警情";
      this.isEdit = true;
      this.open = true;
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });
      // 鼠标切换为等待状态
      this.previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close();
        this.processingInstance = null;
      }
      // 恢复鼠标状态
      document.body.style.cursor = this.previousCursor;
    },

    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = { ...(row || {}) };
      this.ViewOpen = true;
      this.title = "警情信息";
    },
    /** 将 form 对象中的时间字段转换为国际标准格式 */
    convertFormTimeToISO(formData = {}) {
      const form = { ...formData };
      const timeFields = [
        "reportTime",
        "receiveTime",
        "processTime",
        "endTime",
        "createTime",
      ];

      timeFields.forEach((key) => {
        const value = form[key];
        if (value && typeof value === "string") {
          // 将本地时间字符串转换为 ISO 8601 格式（UTC 时间）
          // 例如: "2024-01-04 08:30:00" -> "2024-01-04T00:30:00.000Z"
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            form[key] = date.toISOString();
          }
        }
      });

      return form;
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing("正在修改警情...");
            const formData = this.convertFormTimeToISO(this.form);
            updateIncidentRecord(formData, formData.id)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(2000);
                  this.resetSelected();
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("修改警情失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建警情...");
            const formData = this.convertFormTimeToISO(this.form);
            addIncidentRecord(formData)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(2000);
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("新增警情失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          }
        }
      });
    },

    async handleDelete(row) {
      try {
        var incidentRecordIds;
        var incidentRecordCodes;
        if (row && row.id !== undefined) {
          incidentRecordIds = row.id;
          incidentRecordCodes = row.code;
        } else {
          incidentRecordIds = this.selectedIncidentRecords.map(
            (item) => item.id
          );
          incidentRecordCodes = this.selectedIncidentRecords.map(
            (item) => item.code
          );
        }
        await this.$confirm(
          '是否确认删除警情编号为"' + incidentRecordCodes + '"的数据项?',
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );
        this.startProcessing("正在删除警情...");
        var response = null;
        if (Array.isArray(incidentRecordIds)) {
          response = await batchDelIncidentRecord({ ids: incidentRecordIds });
        } else {
          response = await delIncidentRecordById(incidentRecordIds);
        }
        if (response.code === 200) {
          await this.delay(2000);
          this.resetSelected();
          this.resetPage();
          this.getList();
          this.msgSuccess(response.msg || "删除警情成功");
        } else {
          this.msgError(response.msg || "删除警情失败");
        }
      } catch (error) {
        if (error.message !== "cancel") {
          this.msgError("删除警情失败：" + (error.message || "未知错误"));
        }
      } finally {
        this.stopProcessing();
      }
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedIncidentRecords) &&
          this.selectedIncidentRecords.length > 0;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedIncidentRecords.length} 条警情数据？`
          : "是否确认导出所有警情数据项？";

        await this.$confirm(confirmText, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        });

        const columnOptions = Array.isArray(this.columnOptions)
          ? this.columnOptions
          : [];
        const visibleColumns = Array.isArray(this.visibleColumns)
          ? this.visibleColumns
          : [];
        const exportColumns = columnOptions.filter((c) =>
          visibleColumns.includes(c.prop)
        );

        if (!exportColumns.length) {
          this.msgError("当前未选择任何可导出的列");
          return;
        }

        const tHeader = exportColumns.map((c) => c.label);
        const filterVal = exportColumns.map((c) => c.prop);

        let list = [];
        if (hasSelection) {
          list = this.selectedIncidentRecords;
        } else {
          const baseQueryParams = { ...(this.queryParams || {}) };
          const pageSize = 1000;
          let pageIndex = 1;
          let total = Infinity;

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize,
            };
            const resp = await getIncidentRecordList(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询警情列表失败");
            }

            const pageList = (resp.data && resp.data.list) || [];
            total = (resp.data && resp.data.count) || 0;
            list = list.concat(pageList);

            if (!pageList.length) {
              break;
            }
            pageIndex += 1;
          }
        }

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row };
          output.status = this.statusFormat(row);
          output.isRelation = this.incidentRelationStatusFormat(row);
          output.createTime = this.parseTime(row.createTime);
          output.reportTime = this.parseTime(row.reportTime);
          output.receiveTime = this.parseTime(row.receiveTime);
          output.processTime = this.parseTime(row.processTime);
          output.endTime = this.parseTime(row.endTime);
          return output;
        });

        const data = formatJson(filterVal, normalizeList);

        // 触发导出（会弹出另存为对话框）
        const excel = await import("@/vendor/Export2Excel");
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "警情列表",
          autoWidth: true,
          bookType: "xlsx",
        });
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("导出失败：" + (error.message || "未知错误"));
        }
      } finally {
      }
    },

    /** 获取执法类型树形数据 */
    getEnforceTypeTreeselect() {
      getEnforceTypeTree()
        .then((response) => {
          this.enforceTypeOptions = response.data.list || response.data || [];
        })
        .catch(() => {
          this.enforceTypeOptions = [];
        });
    },

    /** 执法类型数据结构转换 */
    normalizeEnforceType(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || "未知",
        children: node.children,
      };
    },

    initVisibleColumns() {
      const saved = localStorage.getItem("incident_query_visible_columns");
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved);
        } catch (error) {
          this.visibleColumns = this.columnOptions.map((item) => item.prop);
        }
      } else {
        this.visibleColumns = this.columnOptions.map((item) => item.prop);
      }
    },

    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },

    handleColumnChange(val) {
      localStorage.setItem(
        "incident_query_visible_columns",
        JSON.stringify(val)
      );
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop);
      localStorage.setItem(
        "incident_query_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
  },
};
</script>
<style lang="scss" scoped>
@import './styles/index.scss';
</style>
.form-container {
  padding: 10px 20px;
}
.form-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}
.form-section-title {
  font-size: 16px;
  color: #409eff;
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
.horizontal-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 媒体关联列表样式 */
.media-relations-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.empty-data {
  text-align: center;
  padding: 20px;
  color: #909399;
}
.column-settings-trigger {
  text-align: right;
}

.column-settings {
  max-height: 400px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.column-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-item .el-checkbox {
  width: 100%;
}
</style>
