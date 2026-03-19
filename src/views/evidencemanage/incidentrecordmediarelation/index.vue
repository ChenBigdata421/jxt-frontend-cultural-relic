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
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:bwc:create']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:bwc:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              >导出</el-button
            >
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
          ref="incidentTable"
          v-loading="loading"
          :data="incidentRecordList"
          :key="'incident-table-' + incidentRecordList.length"
          border
          @select="handleSelect"
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
            width="150"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['incidentrecord:bwc:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['incidentrecord:bwc:link']"
                size="mini"
                type="text"
                icon="el-icon-link"
                @click="handleLinkMedia(scope.row)"
                >已关联媒体</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="code" label="警情号" width="80" />
          <el-table-column prop="name" label="报警人姓名" width="100" />
          <el-table-column prop="title" label="警情标题" width="80" />
          <el-table-column prop="tel" label="报警电话" width="150" />
          <el-table-column prop="address" label="警情地址" width="150" />
          <el-table-column
            prop="processPoliceNames"
            label="处警人"
            width="100"
          />
          <el-table-column prop="orgPaths" label="处警组织" width="100" />
          <el-table-column prop="result" label="处警结果" width="100" />
          <el-table-column
            prop="superviseType"
            label="警情监督类型"
            width="100"
          />
          <el-table-column prop="status" label="状态" width="100">
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
          <el-table-column prop="isRelation" label="是否关联" width="100">
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
                >关联新媒体</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnlinkMedia"
                >批量取消关联</el-button
              >
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
                  >取消关联</el-button
                >
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
          <el-button @click="handleCloseSelectorDrawer">取 消</el-button>
          <el-button type="primary" @click="confirmLinkMedia">确 定</el-button>
        </div>
      </el-drawer>

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
          <el-form ref="form" :model="form" :rules="rules" label-width="100px">
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
                    <el-input v-model="form.tel" placeholder="请输入报警电话" />
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
          <el-table-column prop="Value" label="值" width="450" align="center" />
        </el-table>
      </el-dialog>
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
  batchDelIncidentRecordMediaRelations,
} from "@/api/evidence/evidence_manage_command_api";
import {
  getIncidentRecordList,
  getIncidentRecordMediaRelationsByIncidentRecordId,
  getUnassociatedMediaByIncidentRecordId,
} from "@/api/evidence/evidence_manage_query_api";
import { getEnforceTypeTree } from "@/api/admin/enforcetype";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import MediaSelector from "@/components/MediaSelector";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "LawCarema",
  components: {
    MediaSelector,
    Treeselect,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      IncidentRecordIds: [],
      // 非单个禁用
      single: true,
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
      // 是否显示增加警情对话框
      open: false,
      ViewOpen: false,
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      // 当前选中的警情记录
      currentIncidentRecord: null,
      relationTotal: 0,
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
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
      // 警情媒体关联列表
      mediaRelationsList: [],
      // 媒体关联列表加载状态
      relationsLoading: false,
      // 媒体类型选项
      mediaCateOptions: [],
      // 存储类型选项
      storageTypeOptions: [],
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
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10,
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
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: "编号不能为空", trigger: "blur" }],
      },
    };
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentIncidentRecord || !this.currentIncidentRecord.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 } });
        };
      }
      return (query) => {
        return getUnassociatedMediaByIncidentRecordId(
          this.currentIncidentRecord.id,
          query
        );
      };
    },
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
    this.getTreeselect();
    this.getEnforceTypeTreeselect();

    // 使用Promise.all等待所有字典加载完成后再加载列表
    Promise.all([
      this.getDicts("incidentrecord_status"),
      this.getDicts("relation_status"),
      this.getDicts("evidence_media_type"),
      this.getDicts("evidence_storage_type"),
    ])
      .then(([statusRes, relationStatusRes, mediaCateRes, storageTypeRes]) => {
        this.statusOptions = statusRes.data;
        this.incidentRelationStatusOptions = relationStatusRes.data;
        this.mediaCateOptions = mediaCateRes.data;
        this.storageTypeOptions = storageTypeRes.data;

        // 字典加载完成后再加载列表
        this.getList();
      })
      .catch((error) => {
        console.error("[IncidentRecordMediaRelation] 字典加载失败:", error);
        // 即使字典加载失败,也要加载列表
        this.getList();
      });
  },
  methods: {
    /** ----------------主界面--------------- */
    handleOrgSelect(node) {
      listUser({ orgId: "/" + node.id + "/" }).then((response) => {
        this.userOptions = response.data.list;
      });
    },

    /** 查询警情列表 */
    getList() {
      this.loading = true;
      const query = { ...this.queryParams };
      Object.keys(query).forEach((key) => {
        if (query[key] === "" || query[key] === null) {
          delete query[key];
        }
      });
      getIncidentRecordList(query).then((response) => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.incidentRecordList = response.data.list;
        this.total = response.data.count;
        this.loading = false;

        // 默认选中第一条警情
        this.$nextTick(() => {
          if (this.incidentRecordList.length > 0) {
            const firstIncident = this.incidentRecordList[0];
            if (this.$refs.incidentTable) {
              this.$refs.incidentTable.clearSelection();
              this.$refs.incidentTable.toggleRowSelection(firstIncident, true);
            }
            this.currentSelectedIncident = firstIncident;
          } else {
            this.currentSelectedIncident = null;
            this.mediaRelationsList = [];
          }
        });
      });
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data; // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
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
    // 单个选择框点击事件,selection表示所有被选中的行，row表示当前点击的行
    handleSelect(selection, row) {
      this.currentSelectedIncident = row;
      this.loadIncidentRecordMediaRelations(row.id);
      this.$nextTick(() => {
        if (this.$refs.incidentTable) {
          this.$refs.incidentTable.clearSelection();
          this.$refs.incidentTable.toggleRowSelection(row, true);
        }
      });
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
          if (this.form.id === undefined) {
            addIncidentRecord(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                setTimeout(() => {
                  this.getList();
                }, 1000);
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$confirm("是否确认导出所有警情数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.downloadLoading = true;
        import("@/vendor/Export2Excel").then((excel) => {
          const tHeader = [
            "工程ID",
            "编号",
            "名称",
            "CPU",
            "内存",
            "存储",
            "网卡",
            "USB数量",
            "操作系统",
            "购置时间",
            "版本",
            "备注",
          ];
          const filterVal = [
            "FactoryId",
            "No",
            "Name",
            "Cpu",
            "Memory",
            "Disk",
            "NetworkCard",
            "UsbNum",
            "System",
            "BuyTime",
            "Version",
            "Remark",
          ];
          const list = this.incidentRecordList;
          const data = formatJson(filterVal, list);
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: "警情列表",
            autoWidth: true, // Optional
            bookType: "xlsx", // Optional
          });
          this.downloadLoading = false;
        });
      });
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

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**--------第一层抽屉----------------- */

    /** 关联媒体按钮操作 - 打开第一层抽屉 */
    handleLinkMedia(row) {
      this.currentIncidentRecord = row;
      this.showMediaDrawer = true;
      this.loadIncidentRecordMediaRelations(row.id);
    },

    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false;
      this.currentIncidentRecord = null;
      this.mediaRelationsList = [];
      if (done) {
        done();
      }
    },

    /** 加载警情媒体关联列表 */
    loadIncidentRecordMediaRelations() {
      this.relationsLoading = true;
      getIncidentRecordMediaRelationsByIncidentRecordId(
        this.currentIncidentRecord.id,
        this.relationQueryParams
      )
        .then((response) => {
          // 必须检查response.code是否为200
          if (response.code === 200) {
            this.mediaRelationsList = response.data.list || [];
            this.relationTotal = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreMediaRelationSelection();
          } else {
            console.error("加载媒体关联列表失败:", response.msg);
            this.msgError(response.msg || "加载媒体关联列表失败");
            this.mediaRelationsList = [];
            this.relationTotal = 0;
          }
        })
        .catch((error) => {
          console.error("加载媒体关联列表失败:", error);
          this.msgError(
            "加载媒体关联列表失败：" + (error.message || "未知错误")
          );
          this.mediaRelationsList = [];
          this.relationTotal = 0;
        })
        .finally(() => {
          this.relationsLoading = false;
        });
    },

    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm("确认取消关联该媒体吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = "wait";

        const loadingInstance = this.$loading({
          lock: true,
          text: "正在取消关联...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });

        try {
          const response = await delIncidentRecordMediaRelations(row.id);

          if (response.code === 200) {
            // 延迟2秒后刷新媒体关联列表
            await this.delay(2000);
            this.loadIncidentRecordMediaRelations(
              this.currentIncidentRecord.id
            );
            this.getList(); // 刷新警情列表以更新关联状态

            this.msgSuccess(response.msg || "取消关联成功");
          } else {
            this.msgError(response.msg || "取消关联失败");
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor;
          loadingInstance.close();
        }
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("取消关联失败：" + (error.message || "未知错误"));
        }
      }
    },

    /** 已关联媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      if (this.isRestoringMediaRelationSelection) {
        return;
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.mediaRelationsList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedMediaRelationMap[id] = row;
        } else {
          delete this.selectedMediaRelationMap[id];
        }
      });
      this.selectedMediaRelations = Object.values(
        this.selectedMediaRelationMap
      ).filter(Boolean);
    },

    /**恢复已关联媒体的选中状态 */
    restoreMediaRelationSelection() {
      if (this.isRestoringMediaRelationSelection) return;
      if (!this.$refs.mediaRelationsTable) return;
      if (!this.mediaRelationsList || !this.mediaRelationsList.length) return;

      this.isRestoringMediaRelationSelection = true;
      this.$nextTick(() => {
        try {
          this.mediaRelationsList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedMediaRelationMap[id]) {
              this.$refs.mediaRelationsTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringMediaRelationSelection = false;
        }
      });
    },

    /** 批量取消关联媒体 */
    async handleBatchUnlinkMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError("请选择要取消关联的媒体");
        return;
      }

      try {
        await this.$confirm(
          `确认取消关联选中的 ${this.selectedMediaRelations.length} 个媒体吗？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        // 鼠标切换为等待状态
        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = "wait";

        const loadingInstance = this.$loading({
          lock: true,
          text: "正在批量取消关联...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });

        try {
          // 提取选中的关联ID列表
          const relationIds = this.selectedMediaRelations.map(
            (item) => item.id
          );

          const response = await batchDelIncidentRecordMediaRelations({
            relationIds: relationIds,
          });

          if (response.code === 200) {
            // 延迟2秒后刷新媒体关联列表
            await this.delay(2000);
            this.selectedMediaRelationMap = {};
            this.selectedMediaRelations = [];
            this.loadIncidentRecordMediaRelations(
              this.currentIncidentRecord.id
            );
            this.getList(); // 刷新警情列表以更新关联状态

            this.msgSuccess(
              response.msg ||
                `成功取消关联 ${
                  response.data?.deletedCount || relationIds.length
                } 个媒体`
            );
          } else {
            this.msgError(response.msg || "批量取消关联失败");
          }
        } finally {
          // 恢复鼠标状态
          document.body.style.cursor = previousCursor;
          loadingInstance.close();
        }
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("批量取消关联失败：" + (error.message || "未知错误"));
        }
      }
    },

    /** 打开第二层抽屉 - 关联新媒体 */
    handleOpenMediaSelector() {
      this.selectedMediaList = [];
      this.mediaSelectorDrawerOpen = true;
      // 等待抽屉打开后刷新媒体选择器
      this.$nextTick(() => {
        if (this.$refs.mediaSelector) {
          this.$refs.mediaSelector.clearSelection();
          this.$refs.mediaSelector.refreshList();
        }
      });
    },

    /** 关闭第二层抽屉 */
    handleCloseSelectorDrawer(done) {
      this.mediaSelectorDrawerOpen = false;
      this.selectedMediaList = [];
      if (done) {
        done();
      }
    },

    /** 检查媒体关联状态(单选时触发) */
    handleMediaSelect(row) {
      console.log(
        "[IncidentRecordMediaRelation] handleMediaSelect 触发, row:",
        JSON.stringify(row, null, 2)
      );
      // 检查媒体是否已经关联了警情（后端字段名是 incidentCode）
      const incidentCode = row.incidentCode || row.incidentRecordCode;
      console.log("[IncidentRecordMediaRelation] incidentCode:", incidentCode);
      if (incidentCode) {
        // 如果关联的是当前警情
        if (
          this.currentIncidentRecord &&
          incidentCode === this.currentIncidentRecord.code
        ) {
          this.$confirm(
            `媒体"${row.mediaName}"已与当前警情"${incidentCode}"关联`,
            "提示",
            {
              confirmButtonText: "确定",
              showCancelButton: false,
              type: "information",
            }
          );
        } else {
          // 如果关联的是其他警情
          this.$confirm(
            `本次关联之前，媒体"${row.mediaName}"将自动先与警情"${incidentCode}"解除关联`,
            "提示",
            {
              confirmButtonText: "确定",
              showCancelButton: false,
              type: "warning",
            }
          );
        }
      }
    },

    /** 媒体选择变化 */
    handleMediaSelectionChange(selection) {
      this.selectedMediaList = selection;
    },

    /** 确认关联媒体 */
    async confirmLinkMedia() {
      // 使用selectedMediaList而不是参数
      if (!this.selectedMediaList || this.selectedMediaList.length === 0) {
        this.msgError("请选择要关联的媒体");
        return;
      }

      // 过滤掉已经与该警情关联的媒体（后端字段名是 incidentCode）
      const selectedMediaRelations = this.selectedMediaList.filter((item) => {
        const incidentCode = item.incidentCode || item.incidentRecordCode;
        return incidentCode !== this.currentIncidentRecord.code;
      });

      // 计算已关联其他警情的媒体数量
      const alreadyLinkedCount =
        this.selectedMediaList.length - selectedMediaRelations.length;

      // 如果有媒体已关联其他警情,给出提示
      if (alreadyLinkedCount > 0) {
        this.$message({
          type: "warning",
          message: `已过滤 ${alreadyLinkedCount} 个已关联当前警情的媒体`,
          duration: 3000,
        });
      }

      // 检查过滤后是否还有媒体需要关联
      if (!selectedMediaRelations || selectedMediaRelations.length === 0) {
        this.msgError("所选媒体均已关联当前警情,请重新选择");
        return;
      }

      // 鼠标切换为等待状态
      const previousCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";

      const loadingInstance = this.$loading({
        lock: true,
        text: "正在关联媒体...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.3)",
      });

      try {
        // 调用关联媒体的API
        const data = {
          incidentRecordId: this.currentIncidentRecord.id,
          mediaIds: selectedMediaRelations.map((item) => item.mediaId),
        };

        const response = await addIncidentRecordMediaRelations(data);

        if (response.code === 200) {
          // 关闭第二层抽屉
          this.mediaSelectorDrawerOpen = false;

          // 延迟2秒后刷新第一层抽屉的媒体列表
          await this.delay(2000);
          this.loadIncidentRecordMediaRelations(this.currentIncidentRecord.id);
          this.getList(); // 刷新警情列表以更新关联状态

          // 显示成功消息,包含实际关联的媒体数量
          this.msgSuccess(
            response.msg || `成功关联 ${selectedMediaRelations.length} 个媒体`
          );
        } else {
          this.msgError(response.msg || "关联失败");
        }
      } catch (error) {
        this.msgError("关联失败：" + (error.message || "未知错误"));
      } finally {
        // 恢复鼠标状态
        document.body.style.cursor = previousCursor;
        loadingInstance.close();
      }
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

/* 媒体关联列表样式 - 页面特有样式 */
.media-relations-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

/* 其他样式已移至全局样式：
   - .horizontal-container → src/styles/components/utilities.scss
   - .empty-data → src/styles/components/utilities.scss
   - 抽屉样式 (.drawer-content, .drawer-footer, .media-drawer, .media-selector-drawer) → src/styles/components/dialogs.scss
*/
</style>
