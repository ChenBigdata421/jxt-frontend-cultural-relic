<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询表单 -->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="文书编号" prop="writCode">
            <el-input
              v-model="queryParams.writCode"
              placeholder="请输入文书编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="文书名称" prop="writName">
            <el-input
              v-model="queryParams.writName"
              placeholder="请输入文书名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="文书类型" prop="writType">
            <el-select
              v-model="queryParams.writType"
              placeholder="文书类型"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in writTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="组织部门" prop="orgId">
            <treeselect
              v-model="queryParams.orgId"
              :options="orgOptions"
              placeholder="请选择组织部门"
              style="width: 170px"
              clearable
            />
          </el-form-item>
          <el-form-item label="开书时间">
            <el-date-picker
              v-model="writTimeRange"
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
        <el-row :gutter="10" class="mb8">
          <el-col :span="18">
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
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

        <!-- 文书列表 -->
        <el-table
          v-loading="loading"
          :data="writList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="350"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-star-on"
                @click="handleScore(scope.row)"
                >评分</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-link"
                @click="handleShowMedia(scope.row)"
                >已关联媒体</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('writCode')"
            label="文书编号"
            align="center"
            prop="writCode"
          />
          <el-table-column
            v-if="isColumnVisible('writName')"
            label="文书名称"
            align="center"
            prop="writName"
          />
          <el-table-column
            v-if="isColumnVisible('writType')"
            label="文书类型"
            align="center"
            prop="writType"
          >
            <template slot-scope="scope">
              {{ selectDictLabel(writTypeOptions, scope.row.writType) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('writTime')"
            label="开书时间"
            align="center"
            prop="writTime"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.writTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('orgPaths')"
            label="组织部门"
            align="center"
            prop="orgPaths"
          />
          <el-table-column
            v-if="isColumnVisible('writPoliceNames')"
            label="警员"
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
            <template slot-scope="{ row }">
              <el-tag
                :type="row.isRelation === 1 ? 'success' : 'info'"
                size="small"
                effect="dark"
              >
                {{ selectDictLabel(relationStatusOptions, row.isRelation) }}
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
        width="600px"
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="文书名称" prop="writName">
            <el-input v-model="form.writName" placeholder="请输入文书名称" />
          </el-form-item>
          <el-form-item label="文书类型" prop="writType">
            <el-select
              v-model="form.writType"
              placeholder="请选择文书类型"
              style="width: 100%"
            >
              <el-option
                v-for="dict in writTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="组织部门" prop="orgId">
            <treeselect
              v-model="form.orgId"
              :options="orgOptions"
              placeholder="请选择组织部门"
            />
          </el-form-item>
          <el-form-item label="警员" prop="policeIds">
            <el-select
              v-model="form.policeIds"
              multiple
              placeholder="请选择警员"
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.userId"
                :label="user.userName"
                :value="user.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文书描述" prop="writDesc">
            <el-input
              v-model="form.writDesc"
              type="textarea"
              :rows="4"
              placeholder="请输入文书描述"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 评分对话框 -->
      <el-dialog
        title="文书评分"
        :visible.sync="scoreOpen"
        width="500px"
        append-to-body
      >
        <el-form
          ref="scoreForm"
          :model="scoreForm"
          :rules="scoreRules"
          label-width="100px"
        >
          <el-form-item label="文书编号">
            <el-input v-model="scoreForm.writCode" disabled />
          </el-form-item>
          <el-form-item label="开书时间">
            <el-input v-model="scoreForm.writTime" disabled />
          </el-form-item>
          <el-form-item label="文书类型">
            <el-input v-model="scoreForm.writTypeLabel" disabled />
          </el-form-item>
          <el-form-item label="评分" prop="writScore">
            <el-input-number
              v-model="scoreForm.writScore"
              :min="0"
              :max="100"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="评分说明" prop="scoreDesc">
            <el-input
              v-model="scoreForm.scoreDesc"
              type="textarea"
              :rows="4"
              placeholder="请输入评分说明"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitScore">确 定</el-button>
          <el-button @click="scoreOpen = false">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 浏览文书对话框 -->
      <el-dialog
        title="浏览文书"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文书编号">{{
            viewData.writCode
          }}</el-descriptions-item>
          <el-descriptions-item label="文书名称">{{
            viewData.writName
          }}</el-descriptions-item>
          <el-descriptions-item label="文书类型">{{
            selectDictLabel(writTypeOptions, viewData.writType)
          }}</el-descriptions-item>
          <el-descriptions-item label="开书时间">{{
            parseTime(viewData.writTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="组织部门">{{
            viewData.orgPaths || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="警员">{{
            viewData.writPoliceNames || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{
            viewData.writScore || "未评分"
          }}</el-descriptions-item>
          <el-descriptions-item label="是否关联">{{
            selectDictLabel(
              relationStatusOptions,
              viewData.isRelation > 0 ? 1 : 0
            )
          }}</el-descriptions-item>
          <el-descriptions-item label="评分说明" :span="2">{{
            viewData.scoreDesc || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="文书描述" :span="2">{{
            viewData.writDesc || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            parseTime(viewData.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            parseTime(viewData.updatedAt)
          }}</el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
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
            v-loading="relationLoading"
            :data="relationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="文书编号" align="center" prop="writCode" />
            <el-table-column label="媒体名称" align="center" prop="mediaName" />
            <el-table-column label="媒体类型" align="center" prop="mediaCate">
              <template slot-scope="scope">
                {{ selectDictLabel(mediaCateOptions, scope.row.mediaCate) }}
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
                  >取消关联</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div v-if="relationsList.length === 0" class="empty-data">
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
          <el-button @click="handleCloseSelectorDrawer">取 消</el-button>
          <el-button type="primary" @click="confirmLinkMedia">确 定</el-button>
        </div>
      </el-drawer>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from "@/layout/BasicLayout";
import Pagination from "@/components/Pagination";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import MediaSelector from "@/components/MediaSelector";
import {
  listWrits,
  getWrit,
  addWrit,
  updateWrit,
  delWrit,
  scoreWrit,
} from "@/api/evidence/writ_api";
import {
  getMediaListByWritId,
  getUnassociatedMediaByWritId,
  batchCreateWritMediaRelation,
  deleteWritMediaRelation,
  batchDeleteWritMediaRelation,
  getWritMediaRelationListByWritId,
} from "@/api/evidence/writ_media_relation_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";

export default {
  name: "WritManage",
  components: {
    BasicLayout,
    Pagination,
    Treeselect,
    MediaSelector,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      relationLoading: false,
      firstLoad: null,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 文书表格数据
      writList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示评分对话框
      scoreOpen: false,
      // 是否显示浏览对话框
      viewOpen: false,
      // 是否显示第一层抽屉(已关联媒体)
      showMediaDrawer: false,
      // 是否显示第二层抽屉(未关联媒体选择器)
      mediaSelectorDrawerOpen: false,
      // 当前文书
      currentWrit: {},
      // 浏览数据
      viewData: {},
      // 媒体列表
      relationsList: [],
      relationTotal: 0,
      // 选中的媒体列表
      selectedMediaList: [],
      // 选中的已关联媒体列表（用于批量取消关联）
      selectedMediaRelations: [],
      // 开书时间范围
      writTimeRange: [],
      // 组织树选项
      orgOptions: [],
      // 用户选项
      userOptions: [],
      // 文书类型字典
      writTypeOptions: [],
      // 媒体类型字典
      mediaCateOptions: [],
      // 关联状态字典
      relationStatusOptions: [],
      // 列配置选项
      columnOptions: [
        { prop: "writCode", label: "文书编号", fixed: false },
        { prop: "writName", label: "文书名称", fixed: false },
        { prop: "writType", label: "文书类型", fixed: false },
        { prop: "writTime", label: "开书时间", fixed: false },
        { prop: "orgPaths", label: "组织部门", fixed: false },
        { prop: "writPoliceNames", label: "警员", fixed: false },
        { prop: "writScore", label: "评分", fixed: false },
        { prop: "isRelation", label: "关联状态", fixed: false },
        { prop: "writAddress", label: "文书地址", fixed: false },
        { prop: "writSource", label: "文书来源", fixed: false },
        { prop: "scoreDesc", label: "评分说明", fixed: false },
        { prop: "writDesc", label: "文书描述", fixed: false },
        { prop: "createdAt", label: "创建时间", fixed: false },
        { prop: "updatedAt", label: "更新时间", fixed: false },
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
        writTimeEnd: undefined,
      },
      // 媒体查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10,
      },
      // 表单参数
      form: {},
      // 评分表单
      scoreForm: {},
      // 表单校验
      rules: {
        writName: [
          { required: true, message: "文书名称不能为空", trigger: "blur" },
        ],
        writType: [
          { required: true, message: "文书类型不能为空", trigger: "change" },
        ],
        orgId: [
          { required: true, message: "组织部门不能为空", trigger: "change" },
        ],
        policeIds: [
          { required: true, message: "至少选择一名警员", trigger: "change" },
        ],
      },
      // 评分表单校验
      scoreRules: {
        writScore: [
          { required: true, message: "评分不能为空", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    /** 获取未关联媒体列表API(用于媒体选择器) */
    getUnassociatedMediaListApi() {
      if (!this.currentWrit || !this.currentWrit.id) {
        return (query) => {
          return Promise.resolve({ data: { list: [], count: 0 } });
        };
      }
      return (query) => {
        return getUnassociatedMediaByWritId(this.currentWrit.id, query);
      };
    },
  },
  watch: {
    "form.orgId": function (newVal) {
      // 当组织变化时,加载该组织的用户列表
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框,不需要清空警员选择
          this.form.policeIds = [];
        }
        this.firstLoad = false;
        this.getFormUser();
      }
    },
  },
  created() {
    this.initVisibleColumns();
    this.getList();
    this.getOrgTree();
    this.getDicts("writ_type").then((response) => {
      this.writTypeOptions = response.data;
    });
    this.getDicts("evidence_media_type").then((response) => {
      this.mediaCateOptions = response.data;
    });
    this.getDicts("relation_status").then((response) => {
      this.relationStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询文书列表 */
    getList() {
      this.loading = true;
      // 处理时间范围
      if (this.writTimeRange && this.writTimeRange.length === 2) {
        this.queryParams.writTimeStart = this.writTimeRange[0];
        this.queryParams.writTimeEnd = this.writTimeRange[1];
      } else {
        this.queryParams.writTimeStart = undefined;
        this.queryParams.writTimeEnd = undefined;
      }

      listWrits(this.queryParams)
        .then((response) => {
          this.writList = response.data.list || [];
          this.total = response.data.count || 0;
          this.loading = false;
        })
        .catch((error) => {
          this.msgError("查询文书列表失败：" + (error.message || "未知错误"));
          this.writList = [];
          this.total = 0;
          this.loading = false;
        });
    },
    /** 获取组织树 */
    getOrgTree() {
      orgTreeSelect()
        .then((response) => {
          this.orgOptions = response.data;
        })
        .catch((error) => {
          this.msgError("获取组织树失败：" + (error.message || "未知错误"));
          this.orgOptions = [];
        });
    },
    /** 获取用户列表 */
    getUserList(orgId) {
      listUser({ orgId: "/" + orgId + "/" })
        .then((response) => {
          this.userOptions = response.data.list || [];
        })
        .catch((error) => {
          this.msgError("获取用户列表失败：" + (error.message || "未知错误"));
          this.userOptions = [];
        });
    },
    /** 获取表单组织的用户列表 */
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
    /** 组织变更时加载用户 */
    handleOrgChange(value) {
      if (value) {
        this.getUserList(value);
        this.form.policeIds = [];
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.writTimeRange = [];
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
      this.firstLoad = null;
      this.userOptions = [];
      this.open = true;
      this.title = "添加文书";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.firstLoad = true;
      const id = row.id;
      getWrit(id)
        .then((response) => {
          // 使用展开运算符创建新对象，确保响应式
          const data = response.data;
          this.form = {
            ...data,
            // 将writPoliceIds转换为policeIds供表单使用
            policeIds:
              data.writPoliceIds && Array.isArray(data.writPoliceIds)
                ? [...data.writPoliceIds]
                : [],
          };
          this.open = true;
          this.title = "修改文书";
          if (this.form.orgId) {
            this.getFormUser();
          }
        })
        .catch((error) => {
          this.msgError("获取文书信息失败：" + (error.message || "未知错误"));
        });
    },
    /** 浏览按钮操作 */
    handleView(row) {
      const id = row.id;
      getWrit(id)
        .then((response) => {
          this.viewData = response.data;
          this.viewOpen = true;
        })
        .catch((error) => {
          this.msgError("获取文书详情失败：" + (error.message || "未知错误"));
        });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateWrit(this.form.id, this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg || "修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg || "修改失败");
                }
              })
              .catch((error) => {
                this.msgError("修改失败：" + (error.message || "未知错误"));
              });
          } else {
            addWrit(this.form)
              .then((response) => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg || "新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg || "新增失败");
                }
              })
              .catch((error) => {
                this.msgError("新增失败：" + (error.message || "未知错误"));
              });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除文书编号为"' + row.writCode + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return delWrit(row.id);
        })
        .then((response) => {
          if (response.code === 200) {
            this.getList();
            this.msgSuccess(response.msg || "删除成功");
          } else {
            this.msgError(response.msg || "删除失败");
          }
        })
        .catch((error) => {
          // 用户取消操作或发生错误
          if (error !== "cancel") {
            this.msgError("删除失败：" + (error.message || "未知错误"));
          }
        });
    },
    /** 评分按钮操作 */
    handleScore(row) {
      this.scoreForm = {
        id: row.id,
        writCode: row.writCode,
        writTime: this.parseTime(row.writTime),
        writTypeLabel: this.selectDictLabel(this.writTypeOptions, row.writType),
        writScore: row.writScore || 0,
        scoreDesc: row.scoreDesc || "",
      };
      this.scoreOpen = true;
    },
    /** 提交评分 */
    submitScore() {
      this.$refs["scoreForm"].validate((valid) => {
        if (valid) {
          scoreWrit(this.scoreForm.id, {
            writScore: this.scoreForm.writScore,
            scoreDesc: this.scoreForm.scoreDesc,
          })
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg || "评分成功");
                this.scoreOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg || "评分失败");
              }
            })
            .catch((error) => {
              this.msgError("评分失败：" + (error.message || "未知错误"));
            });
        }
      });
    },
    /** 显示已关联媒体 - 打开第一层抽屉 */
    handleShowMedia(row) {
      this.currentWrit = row;
      this.showMediaDrawer = true;
      this.loadWritMediaRelations();
    },
    /** 关闭第一层抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false;
      this.currentWrit = {};
      this.relationsList = [];
      this.relationTotal = 0;
      this.selectedMediaRelations = [];
      if (done) {
        done();
      }
    },
    /** 查询关联媒体列表 */
    loadWritMediaRelations() {
      this.relationLoading = true;
      getWritMediaRelationListByWritId(
        this.currentWrit.id,
        this.relationQueryParams
      )
        .then((response) => {
          // 必须检查response.code是否为200
          if (response.code === 200) {
            this.relationsList = response.data.list || [];
            this.relationTotal = response.data.count || 0;
          } else {
            console.error("加载媒体关联列表失败:", response.msg);
            this.msgError(response.msg || "加载媒体关联列表失败");
            this.relationsList = [];
            this.relationTotal = 0;
          }
        })
        .catch((error) => {
          console.error("加载媒体关联列表失败:", error);
          this.msgError(
            "加载媒体关联列表失败：" + (error.message || "未知错误")
          );
          this.relationsList = [];
          this.relationTotal = 0;
        })
        .finally(() => {
          this.relationLoading = false;
        });
    },
    /** 关联新媒体 - 打开第二层抽屉 */
    handleLinkMedia() {
      this.selectedMediaList = [];
      this.mediaSelectorDrawerOpen = true;
      // 等待抽屉打开后刷新媒体选择器
      this.$nextTick(() => {
        if (this.$refs.mediaSelector) {
          this.$refs.mediaSelector.clearSelection();
          this.$refs.mediaSelector.refresh();
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
        const data = {
          writId: this.currentWrit.id,
          mediaIds: this.selectedMediaList.map((item) => item.mediaId),
        };

        const response = await batchCreateWritMediaRelation(data);

        if (response.code === 200) {
          // 关闭第二层抽屉
          this.mediaSelectorDrawerOpen = false;

          // 延迟2秒后刷新第一层抽屉的媒体列表
          await this.delay(2000);
          this.loadWritMediaRelations();
          this.getList(); // 刷新文书列表以更新关联状态

          this.msgSuccess(response.msg || "关联成功");
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
    /** 已关联媒体选择变化 */
    handleMediaRelationsSelectionChange(selection) {
      this.selectedMediaRelations = selection;
    },

    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm("是否确认取消关联该媒体?", "警告", {
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
          const response = await deleteWritMediaRelation(row.id);

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000);
            this.loadWritMediaRelations();
            this.getList(); // 刷新文书列表以更新关联状态

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
        // 用户取消操作或发生错误
        if (error !== "cancel") {
          this.msgError("取消关联失败：" + (error.message || "未知错误"));
        }
      }
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
          const ids = this.selectedMediaRelations.map((item) => item.id);

          const response = await batchDeleteWritMediaRelation({ ids: ids });

          if (response.code === 200) {
            // 清空选中列表
            this.selectedMediaRelations = [];
            if (this.$refs.mediaRelationsTable) {
              this.$refs.mediaRelationsTable.clearSelection();
            }

            // 延迟2秒后刷新媒体列表
            await this.delay(2000);
            this.loadWritMediaRelations();
            this.getList(); // 刷新文书列表以更新关联状态

            this.msgSuccess(
              response.msg ||
                `成功取消关联 ${
                  response.data?.deletedCount || ids.length
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
    /** 表单重置 */
    reset() {
      this.form = {
        id: null,
        writName: null,
        writType: null,
        orgId: null,
        policeIds: [],
        writDesc: null,
      };
      this.resetForm("form");
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 初始化可见列 */
    initVisibleColumns() {
      const saved = localStorage.getItem("writ_manage_visible_columns");
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
      localStorage.setItem(
        "writ_manage_visible_columns",
        JSON.stringify(value)
      );
    },
    /** 重置列配置 */
    resetColumns() {
      this.visibleColumns = this.columnOptions.map((item) => item.prop);
      localStorage.setItem(
        "writ_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
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
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.column-item {
  padding: 5px 0;
}

/* 抽屉样式 */
.drawer-content {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
  text-align: right;
  z-index: 1;
}

/* 第一层抽屉样式 */
.media-drawer {
  z-index: 1000 !important;
}

/* 第二层抽屉样式 - 更高的z-index */
.media-selector-drawer {
  z-index: 2000 !important;
}

/* 抽屉遮罩层样式 */
::v-deep .el-drawer__wrapper {
  transition: all 0.3s ease;
}

/* 第二层抽屉的遮罩层 */
::v-deep .media-selector-drawer .el-drawer__wrapper {
  background-color: rgba(0, 0, 0, 0.3);
}

/* 抽屉滑入滑出动画 */
::v-deep .el-drawer {
  transition: transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
}

::v-deep .el-drawer.rtl {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}
</style>

