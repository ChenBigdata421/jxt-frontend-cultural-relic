<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询表单 -->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="案件编号" prop="caseCode">
            <el-input
              v-model="queryParams.caseCode"
              placeholder="请输入案件编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件名称" prop="caseName">
            <el-input
              v-model="queryParams.caseName"
              placeholder="请输入案件名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="案件类型" prop="caseType">
            <el-select
              v-model="queryParams.caseType"
              placeholder="案件类型"
              clearable
              style="width: 170px"
              @change="handleQueryCaseTypeChange"
            >
              <el-option
                v-for="dict in caseTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="办案单位" prop="caseOrgId">
            <treeselect
              v-model="queryParams.caseOrgId"
              :options="orgOptions"
              placeholder="请选择办案单位"
              style="width: 170px"
              clearable
            />
          </el-form-item>
          <el-form-item label="案件流程" prop="caseFlow">
            <el-select
              v-model="queryParams.caseFlow"
              placeholder="案件流程"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in caseFlowOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="案发时间">
            <el-date-picker
              v-model="caseTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-ddTHH:mm:ssZ"
              style="width: 340px"
            />
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

        <!-- 操作按钮 -->
        <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
          <el-col :span="18">
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['case:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['case:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="handleDelete"
                  >删除</el-button
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

        <!-- 案件列表 -->
        <el-table
          v-loading="loading"
          :data="caseList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="操作"
            align="center"
            width="200"
            class-name="small-padding fixed-width"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['case:view']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['case:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['case:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <el-button
                v-permisaction="['case:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleAnnotate(scope.row)"
                >标注</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('caseCode')"
            label="案件编号"
            align="center"
            prop="caseCode"
            width="150"
          />
          <el-table-column
            v-if="isColumnVisible('caseName')"
            label="案件名称"
            align="center"
            prop="caseName"
            width="200"
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
              {{ selectDictLabel(caseTypeOptions, scope.row.caseType) }}
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
              {{ getCaseFlowLabel(scope.row.caseFlow, scope.row.caseType) }}
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
            v-if="isColumnVisible('processPoliceNames')"
            label="处警人员"
            align="center"
            prop="processPoliceNames"
            width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('isRelation')"
            label="是否关联"
            align="center"
            prop="isRelation"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag
                :type="row.isRelation === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ selectDictLabel(caseRelationStatusOptions, row.isRelation) }}
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
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="140px">
          <el-row>
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
                  style="width: 100%"
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
          <el-row>
            <el-col :span="12">
              <el-form-item label="案件流程" prop="caseFlow">
                <el-select
                  v-model="form.caseFlow"
                  placeholder="请选择案件流程"
                  style="width: 100%"
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
              <el-form-item label="案发时间" prop="caseTime">
                <el-date-picker
                  v-model="form.caseTime"
                  type="datetime"
                  placeholder="选择案发时间"
                  value-format="yyyy-MM-ddTHH:mm:ssZ"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="办案单位" prop="caseOrgId">
                <treeselect
                  v-model="form.caseOrgId"
                  :options="orgOptions"
                  placeholder="请选择办案单位"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处警单位" prop="procOrgId">
                <treeselect
                  v-model="form.procOrgId"
                  :options="orgOptions"
                  placeholder="请选择处警单位"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
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
          <el-row>
            <el-col :span="24">
              <el-form-item label="案发地址" prop="caseAddress">
                <el-input
                  v-model="form.caseAddress"
                  placeholder="请输入案发地址"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="处警时间" prop="procTime">
                <el-date-picker
                  v-model="form.procTime"
                  type="datetime"
                  placeholder="选择处警时间"
                  value-format="yyyy-MM-ddTHH:mm:ssZ"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处警人员" prop="processPoliceIds">
                <el-select
                  v-model="form.processPoliceIds"
                  placeholder="请选择处警人员"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  style="width: 100%"
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
          <el-row>
            <el-col :span="24">
              <el-form-item label="接警内容" prop="incidentRecordContext">
                <el-input
                  v-model="form.incidentRecordContext"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入接警内容"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="处警过程描述" prop="procResult">
                <el-input
                  v-model="form.procResult"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入处警过程描述"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 案件标注对话框 -->
      <el-dialog
        title="案件标注"
        :visible.sync="annotateOpen"
        width="500px"
        append-to-body
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
              style="width: 100%"
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
          <el-button type="primary" @click="submitAnnotate">确 定</el-button>
          <el-button @click="cancelAnnotate">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 详情对话框 -->
      <el-dialog
        title="案件详情"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="案件编号">{{
            viewData.caseCode
          }}</el-descriptions-item>
          <el-descriptions-item label="案件名称">{{
            viewData.caseName
          }}</el-descriptions-item>
          <el-descriptions-item label="案件类型">{{
            selectDictLabel(caseTypeOptions, viewData.caseType)
          }}</el-descriptions-item>
          <el-descriptions-item label="案件流程">{{
            getCaseFlowLabel(viewData.caseFlow, viewData.caseType)
          }}</el-descriptions-item>
          <el-descriptions-item label="案发时间">{{
            parseTime(viewData.caseTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="案发地址">{{
            viewData.caseAddress
          }}</el-descriptions-item>
          <el-descriptions-item label="办案单位">{{
            viewData.caseOrgName
          }}</el-descriptions-item>
          <el-descriptions-item label="处警单位">{{
            viewData.procOrgName
          }}</el-descriptions-item>
          <el-descriptions-item label="处警时间">{{
            parseTime(viewData.procTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="处警人员">{{
            viewData.processPoliceNames
          }}</el-descriptions-item>
          <el-descriptions-item label="接警编号">{{
            viewData.receiptIncidentRecordNum
          }}</el-descriptions-item>
          <el-descriptions-item label="处警编号">{{
            viewData.disposalIncidentRecordNum
          }}</el-descriptions-item>
          <el-descriptions-item label="接警内容" :span="2">{{
            viewData.incidentRecordContext
          }}</el-descriptions-item>
          <el-descriptions-item label="处警过程描述" :span="2">{{
            viewData.procResult
          }}</el-descriptions-item>
          <el-descriptions-item label="是否关联">
            <el-tag v-if="viewData.isRelation === 1" type="success"
              >已关联</el-tag
            >
            <el-tag v-else type="info">未关联</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            parseTime(viewData.createdAt)
          }}</el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listCases,
  getCase,
  addCase,
  updateCase,
  delCase,
  batchDelCases,
  updateCaseFlow,
} from "@/api/evidence/case_api";
import { orgTreeselect } from "@/api/admin/sys-organization";
import { listUser } from "@/api/admin/sys-user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import BasicLayout from "@/layout/BasicLayout";
import Pagination from "@/components/Pagination";

export default {
  name: "CaseManage",
  components: {
    BasicLayout,
    Treeselect,
    Pagination,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 案件表格数据
      caseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示标注对话框
      annotateOpen: false,
      // 是否显示详情对话框
      viewOpen: false,
      // 案发时间范围
      caseTimeRange: [],
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
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        caseCode: undefined,
        caseName: undefined,
        caseType: undefined,
        caseOrgId: undefined,
        caseFlow: undefined,
        caseTimeStart: undefined,
        caseTimeEnd: undefined,
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
          { required: true, message: "案件名称不能为空", trigger: "blur" },
        ],
        caseType: [
          { required: true, message: "案件类型不能为空", trigger: "change" },
        ],
        caseOrgId: [
          { required: true, message: "办案单位不能为空", trigger: "change" },
        ],
        caseTime: [
          { required: true, message: "案发时间不能为空", trigger: "change" },
        ],
      },
      // 标注表单校验
      annotateRules: {
        caseFlow: [
          { required: true, message: "案件流程不能为空", trigger: "change" },
        ],
      },
      // 列配置选项
      columnOptions: [
        { prop: "caseCode", label: "案件编号", fixed: true },
        { prop: "caseName", label: "案件名称", fixed: false },
        { prop: "caseType", label: "案件类型", fixed: false },
        { prop: "caseFlow", label: "案件流程", fixed: false },
        { prop: "caseTime", label: "案发时间", fixed: false },
        { prop: "caseAddress", label: "案发地址", fixed: false },
        { prop: "caseOrgName", label: "办案单位", fixed: false },
        { prop: "processPoliceNames", label: "处警人员", fixed: false },
        { prop: "isRelation", label: "是否关联", fixed: false },
        { prop: "createdAt", label: "创建时间", fixed: false },
      ],
      // 可见列
      visibleColumns: [],
    };
  },
  watch: {
    "form.procOrgId": function (newVal) {
      // 当处警单位更新时，加载该单位的用户
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空处警人员
          this.form.processPoliceIds = [];
        }
        this.firstLoad = false;
        this.getFormUser();
      }
    },
  },
  created() {
    this.initVisibleColumns();
    this.getOrgTree();
    this.getUserList();
    Promise.all([
      this.getDicts("case_type"),
      this.getDicts("admin_case_process"),
      this.getDicts("criminal_case_process"),
      this.getDicts("relation_status"),
    ])
      .then(
        ([
          caseTypeRes,
          adminCaseProcessRes,
          criminalCaseProcessRes,
          relationStatusRes,
        ]) => {
          this.caseTypeOptions = caseTypeRes.data;
          this.adminCaseProcessOptions = adminCaseProcessRes.data;
          this.criminalCaseProcessOptions = criminalCaseProcessRes.data;
          this.caseRelationStatusOptions = relationStatusRes.data;
          this.getList();
        }
      )
      .catch((error) => {
        console.error("[CaseQuery] 字典加载失败:", error);
        this.getList();
      });
  },
  methods: {
    /** 查询案件列表 */
    getList() {
      this.loading = true;
      // 处理时间范围
      if (this.caseTimeRange && this.caseTimeRange.length === 2) {
        this.queryParams.caseTimeStart = this.caseTimeRange[0];
        this.queryParams.caseTimeEnd = this.caseTimeRange[1];
      } else {
        this.queryParams.caseTimeStart = undefined;
        this.queryParams.caseTimeEnd = undefined;
      }

      listCases(this.queryParams).then((response) => {
        this.caseList = response.data.list || [];
        this.total = response.data.count || 0;
        this.loading = false;
      });
    },
    /** 获取组织树 */
    getOrgTree() {
      orgTreeselect().then((response) => {
        this.orgOptions = response.data;
      });
    },
    /** 获取用户列表 */
    getUserList() {
      listUser({ pageIndex: 1, pageSize: 1000 }).then((response) => {
        this.userOptions = response.data.list || [];
      });
    },
    /** 获取表单中处警单位的用户列表 */
    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: "/" + this.form.procOrgId + "/" })
          .then((response) => {
            this.formUserOptions = response.data.list || [];
            resolve("true");
          })
          .catch((error) => {
            console.error("获取用户失败:", error);
            this.formUserOptions = [];
            reject(error);
          });
      });
    },

    /** 获取案件流程标签 - 用于详情显示 */
    getCaseFlowLabel(value, caseType) {
      // 根据案件类型确定字典类型
      if (this.caseTypeOptions && this.caseTypeOptions.length > 0) {
        const caseTypeDict = this.caseTypeOptions.find(
          (item) => item.value === caseType || item.value === String(caseType)
        );
        if (caseTypeDict) {
          if (caseTypeDict.label.includes("行政")) {
            return this.selectDictLabel(this.adminCaseProcessOptions, value);
          } else if (caseTypeDict.label.includes("刑事")) {
            return this.selectDictLabel(this.criminalCaseProcessOptions, value);
          }
        }
      }
      return value;
    },
    /** 查询表单案件类型变更时，加载对应的流程字典 */
    handleQueryCaseTypeChange(value) {
      // 清空案件流程
      this.queryParams.caseFlow = undefined;
      // 根据案件类型加载对应的流程字典
      this.loadCaseFlowDict(value, "query");
    },
    /** 添加/修改表单案件类型变更时，加载对应的流程字典 */
    handleCaseTypeChange(value) {
      // 清空案件流程
      this.form.caseFlow = undefined;
      // 根据案件类型加载对应的流程字典
      this.loadCaseFlowDict(value, "form");
    },
    /** 加载案件流程字典 */
    loadCaseFlowDict(caseTypeValue, target) {
      // 根据案件类型加载对应的流程字典
      // 行政案件 -> admin_case_process
      // 刑事案件 -> criminal_case_process
      let dictType = "";
      const caseTypeDict = this.caseTypeOptions.find(
        (item) =>
          item.value === caseTypeValue || item.value === String(caseTypeValue)
      );
      if (caseTypeDict) {
        if (caseTypeDict.label.includes("行政")) {
          if (target === "query") {
            this.caseFlowOptions = this.adminCaseProcessOptions;
          } else if (target === "form") {
            this.formCaseFlowOptions = this.adminCaseProcessOptions;
          } else if (target === "annotate") {
            this.annotateCaseFlowOptions = this.adminCaseProcessOptions;
          }
        } else if (caseTypeDict.label.includes("刑事")) {
          if (target === "query") {
            this.caseFlowOptions = this.criminalCaseProcessOptions;
          } else if (target === "form") {
            this.formCaseFlowOptions = this.criminalCaseProcessOptions;
          } else if (target === "annotate") {
            this.annotateCaseFlowOptions = this.criminalCaseProcessOptions;
          }
        }
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.caseTimeRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.firstLoad = true;
      this.formUserOptions = [];
      this.formCaseFlowOptions = [];
      this.open = true;
      this.title = "添加案件";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.firstLoad = true;
      const id = row.id || this.ids[0];
      getCase(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改案件";
        // 加载对应的流程字典
        if (this.form.caseType) {
          this.loadCaseFlowDict(this.form.caseType, "form");
        }
        // 加载对应的用户列表
        if (this.form.procOrgId) {
          this.getFormUser();
        }
      });
    },
    /** 浏览按钮操作 */
    handleView(row) {
      const id = row.id;
      getCase(id).then((response) => {
        this.viewData = response.data;
        this.viewOpen = true;
      });
    },
    /** 标注按钮操作 */
    handleAnnotate(row) {
      this.annotateForm = {
        id: row.id,
        caseType: row.caseType,
        caseFlow: row.caseFlow,
      };
      // 加载对应的流程字典
      if (row.caseType) {
        this.loadCaseFlowDict(row.caseType, "annotate");
      }
      this.annotateOpen = true;
    },
    /** 提交标注 */
    submitAnnotate() {
      this.$refs["annotateForm"].validate((valid) => {
        if (valid) {
          updateCaseFlow(this.annotateForm.id, {
            caseFlow: this.annotateForm.caseFlow,
          }).then((response) => {
            if (response.code === 200) {
              this.msgSuccess("标注成功");
              this.annotateOpen = false;
              this.getList();
            }
          });
        }
      });
    },
    /** 取消标注 */
    cancelAnnotate() {
      this.annotateOpen = false;
      this.annotateForm = {};
    },
    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem("case_query_visible_columns");
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
    /** 判断列是否显示 */
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },
    /** 列显示变更 */
    handleColumnChange(value) {
      localStorage.setItem("case_query_visible_columns", JSON.stringify(value));
    },
    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop);
      localStorage.setItem(
        "case_query_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateCase(this.form, this.form.id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCase(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        } else {
          this.$message.warning("请完善必填项后再提交");
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids;
      this.$confirm("是否确认删除选中的案件?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (ids.length === 1) {
            return delCase(ids[0]);
          } else {
            return batchDelCases({ ids: ids });
          }
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
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
        procResult: undefined,
      };
      this.resetForm("form");
    },
  },
};
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
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

