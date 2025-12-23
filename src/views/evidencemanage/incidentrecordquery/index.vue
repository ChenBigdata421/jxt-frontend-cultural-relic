<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="警情编号" prop="code">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入警情编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="报警人姓名" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入报警人姓名"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="警情标题" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入警情标题"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="处警组织" prop="orgId">
            <treeselect
              v-model="queryParams.orgId"
              :options="orgOptions"
              placeholder="请选择处警组织"
              style="width: 170px"
              clearable
              @select="handleOrgSelect"
            />
          </el-form-item>
          <el-form-item label="处警人员" prop="processPoliceIds">
            <el-select
              v-model="queryParams.processPoliceIds"
              :options="userOptions"
              placeholder="请选择处警人员"
              multiple
              style="width: 170px"
              clearable
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="状态"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否关联" prop="isRelation">
            <el-select
              v-model="queryParams.isRelation"
              placeholder="是否关联"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in incidentRelationStatusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              >搜索</el-button
            >
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
          <el-col :span="18">
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['incidentrecord:lawcamera:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['incidentrecord:lawcamera:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="selectedIncidentRecords.length !== 1"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['incidentrecord:lawcamera:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="handleDelete"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['incidentrecord:lawcamera:export']"
                  type="warning"
                  icon="el-icon-download"
                  size="mini"
                  @click="handleExport"
                  >导出</el-button
                >
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="6" class="column-settings-trigger">
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
          </el-col>
        </el-row>
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
            align="left"
            class-name="small-padding fixed-width"
            width="200"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['incidentrecord:lawcamera:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['incidentrecord:lawcamera:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['incidentrecord:lawcamera:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('code')"
            prop="code"
            label="警情号"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('name')"
            prop="name"
            label="报警人姓名"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('title')"
            prop="title"
            label="警情标题"
            min-width="160"
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
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ selectDictLabel(statusOptions, row.status) }}
              </el-tag>
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                          :key="parseInt(dict.value)"
                          :label="parseInt(dict.value)"
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
          :title="title"
          :visible.sync="ViewOpen"
          width="593px"
          :close-on-click-modal="false"
        >
          <el-table v-loading="loading" :data="AttributeValueList" border>
            <el-table-column
              prop="AttributeName"
              label="属性"
              width="100"
              align="center"
            />
            <el-table-column
              prop="Value"
              label="值"
              width="450"
              align="center"
            />
          </el-table>
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
import { getEnforcementTypeTree } from "@/api/admin/enforcementtype";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "LawCarema",
  components: {
    Treeselect,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 非多个禁用
      multiple: true,
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
      // 是否显示增加警情对话框
      open: false,
      ViewOpen: false,
      // 当前选中的警情记录
      currentIncidentRecord: null,
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
      ColumnNameConvert: new Map([
        ["code", "警情号"],
        ["name", "报警人姓名"],
        ["title", "警情标题"],
        ["tel", "报警电话"],
        ["context", "报警内容"],
        ["address", "警情发生地址"],
        ["processPoliceNames", "处警人"],
        ["orgPaths", "处警组织"],
        ["createTime", "创建时间"],
        ["reportTime", "报警时间"],
        ["receiveTime", "接警时间"],
        ["processTime", "处警时间"],
        ["endTime", "处警结束时间"],
        ["result", "处警结果"],
        ["superviseType", "警情监督情况类型"],
        ["status", "警情状态"],
        ["isRelation", "是否已关联"],
      ]),
      // 表单参数
      form: {},
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
    this.getEnforcementTypeTreeselect();

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

    /** 查询警情列表 */
    getList() {
      this.loading = true;
      getIncidentRecordList(this.queryParams).then((response) => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.incidentRecordList = response.data.list;
        this.total = response.data.count;
        this.loading = false;
        // 分页/查询后回显跨分页选择
        this.restoreSelection();
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
      this.form = {};
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
    /** 搜索按钮操作 */
    handleQuery() {
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
    /** 浏览按钮操作 */
    handleView(row) {
      this.AttributeValueList = [];
      Object.keys(row).forEach((key) => {
        var attributeName = this.ColumnNameConvert.get(key);
        var value = row[key];
        if (key === "status") {
          const statusOption = this.statusOptions.find(
            (item) => item.value === String(row.status)
          );
          value = statusOption ? statusOption.label : row.status;
        }
        if (key === "isRelation") {
          const relationOption = this.incidentRelationStatusOptions.find(
            (item) => item.value === String(row.isRelation)
          );
          value = relationOption ? relationOption.label : row.isRelation;
        }
        const attributeValue = {
          AttributeName: attributeName,
          Value: value,
        };
        if (attributeValue.AttributeName !== undefined) {
          this.AttributeValueList.push(attributeValue);
        }
      });
      this.ViewOpen = true;
      this.title = "警情信息";
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.state = parseInt(this.form.state);
          this.form.enableUse = parseInt(this.form.enableUse);
          if (this.form.id !== undefined) {
            // 鼠标切换为等待状态
            const previousCursor = document.body.style.cursor;
            document.body.style.cursor = "wait";
            const loadingInstance = this.$loading({
              lock: true,
              text: "正在修改警情...",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.3)",
            });
            updateIncidentRecord(this.form, this.form.id)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(2000);
                  this.selectedIncidentRecordMap = {};
                  this.selectedIncidentRecords = [];
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
                // 恢复鼠标状态
                document.body.style.cursor = previousCursor;
                loadingInstance.close();
              });
          } else {
            // 鼠标切换为等待状态
            const previousCursor = document.body.style.cursor;
            document.body.style.cursor = "wait";
            const loadingInstance = this.$loading({
              lock: true,
              text: "正在创建警情...",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.3)",
            });
            addIncidentRecord(this.form)
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
                // 恢复鼠标状态
                document.body.style.cursor = previousCursor;
                loadingInstance.close();
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
        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = "wait";

        const loadingInstance = this.$loading({
          lock: true,
          text: "正在删除警情...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });
        var response = null;
        if (Array.isArray(incidentRecordIds)) {
          response = await batchDelIncidentRecord({ ids: incidentRecordIds });
        } else {
          response = await delIncidentRecordById(incidentRecordIds);
        }
        if (response.code === 200) {
          await this.delay(2000);
          this.selectedIncidentRecordMap = {};
          this.selectedIncidentRecords = [];
          this.getList();
          this.msgSuccess(response.msg || "删除警情成功");
        } else {
          this.msgError(response.msg || "删除警情失败");
        }
        // 恢复鼠标状态
        document.body.style.cursor = previousCursor;
        loadingInstance.close();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除警情失败：" + (error.message || "未知错误"));
        }
      }
    },

    /** 导出按钮操作 */
    handleExport() {
      const hasSelection =
        Array.isArray(this.selectedIncidentRecords) &&
        this.selectedIncidentRecords.length > 0;

      const confirmText = hasSelection
        ? `是否确认导出已勾选的 ${this.selectedIncidentRecords.length} 条警情数据？`
        : "是否确认导出所有警情数据项？";

      this.$confirm(confirmText, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(async () => {
          const loadingInstance = this.$loading({
            lock: true,
            text: "正在导出...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.3)",
          });

          try {
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

            const formatDateTime = (value) => {
              if (!value) return "-";
              try {
                return this.parseTime ? this.parseTime(value) : value;
              } catch (error) {
                return value;
              }
            };

            const formatStatus = (value) => {
              const option = (this.statusOptions || []).find(
                (item) => String(item.value) === String(value)
              );
              return option ? option.label : value;
            };

            const formatRelation = (value) => {
              const option = (this.incidentRelationStatusOptions || []).find(
                (item) => String(item.value) === String(value)
              );
              return option ? option.label : value;
            };

            const normalizeList = (Array.isArray(list) ? list : []).map(
              (row) => {
                const output = { ...row };
                output.status = formatStatus(row.status);
                output.isRelation = formatRelation(row.isRelation);
                output.createTime = formatDateTime(row.createTime);
                output.reportTime = formatDateTime(row.reportTime);
                output.receiveTime = formatDateTime(row.receiveTime);
                output.processTime = formatDateTime(row.processTime);
                output.endTime = formatDateTime(row.endTime);
                return output;
              }
            );

            const data = formatJson(filterVal, normalizeList);

            const excel = await import("@/vendor/Export2Excel");
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: "警情列表",
              autoWidth: true,
              bookType: "xlsx",
            });
          } catch (error) {
            console.error("[IncidentRecordQuery] 导出失败:", error);
            this.msgError(error.message || "导出失败");
          } finally {
            loadingInstance.close();
          }
        })
        .catch(() => {});
    },

    /** 获取执法类型树形数据 */
    getEnforcementTypeTreeselect() {
      getEnforcementTypeTree()
        .then((response) => {
          this.enforcementTypeOptions =
            response.data.list || response.data || [];
        })
        .catch(() => {
          this.enforcementTypeOptions = [];
        });
    },

    /** 执法类型数据结构转换 */
    normalizeEnforcementType(node) {
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
<style>
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
