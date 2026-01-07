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
            <el-form-item prop="writTimeStart">
              <el-date-picker
                v-model="queryParams.writTimeStart"
                type="datetime"
                placeholder="请选择开始时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              >
              </el-date-picker>
            </el-form-item>
            <span>至</span>
            <el-form-item prop="writTimeEnd">
              <el-date-picker
                v-model="queryParams.writTimeEnd"
                type="datetime"
                placeholder="请选择结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              >
              </el-date-picker>
            </el-form-item>
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
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['writ:bwc:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="selectedWritRecords.length !== 1"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['writ:bwc:remove']"
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
                  v-permisaction="['writ:bwc:export']"
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

        <!-- 文书列表 -->
        <el-table
          ref="writTable"
          v-loading="loading"
          :data="writList"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
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
              {{ selectDictLabel(writTypeOptions, scope.row.writType) }}
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
          <el-form-item label="警员" prop="writPoliceIds">
            <el-select
              v-model="form.writPoliceIds"
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
            :data="mediaRelationsList"
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
  delWritById,
  batchDelWrit,
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
import { formatJson } from "@/utils";

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
      //所有选中的文书记录
      selectedWritRecords: [],
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
        writPoliceIds: [
          { required: true, message: "至少选择一名警员", trigger: "change" },
        ],
      },
      // 评分表单校验
      scoreRules: {
        writScore: [
          { required: true, message: "评分不能为空", trigger: "blur" },
        ],
      },
      exporting: false,
      blurWhileExport: false, //标记页面失去焦点的状态
      processingInstance: null, //Element UI全局加载动画的实例
      focusListener: null, //页面获焦点事件的 (focus）的监听器
      previousCursor: null, //记录鼠标状态
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
          this.form.writPoliceIds = [];
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
    /** -----------主界面 --------------*/
    /** 查询文书列表 */
    getList() {
      this.loading = true;
      const query = this.normalizeQueryParams(this.queryParams);
      listWrits(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.writList = response.data.list || [];
            this.total = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.writList = [];
            this.total = 0;
            this.msgError(response.msg || "获取文书列表失败");
          }
        })
        .catch((error) => {
          this.msgError("查询文书列表失败：" + (error.message || "未知错误"));
          this.writList = [];
          this.total = 0;
        })
        .finally(() => {
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
        this.form.writPoliceIds = [];
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
      this.selectedWritMap = {};
      this.selectedWritRecords = [];
    },

    //pageIndex/pageSize 并不在查询表单里，因此 resetForm 并不会重置它们为初始值,所以需要单独重置
    //每次执行搜索、重置、删除时，都将分页置为默认值1，尤其如果批量删除后，再次查询后，当前分页可能已经无数据
    resetPage() {
      this.queryParams.pageIndex = 1;
      this.queryParams.pageSize = 10;
    },

    handleQuery() {
      this.resetPage();
      this.resetSelected();
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        } else if (
          (key === "writTimeStart" || key === "writTimeEnd") &&
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

    /** 恢复选中状态 */
    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.writTable) return;
      if (!this.writList || !this.writList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.writList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedWritMap[id]) {
              this.$refs.writTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
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

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return;
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.writList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedWritMap[id] = row;
        } else {
          delete this.selectedWritMap[id];
        }
      });
      this.selectedWritRecords = Object.values(this.selectedWritMap).filter(
        Boolean
      );
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
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row };
      } else {
        this.form = this.selectedWritRecords[0]
          ? { ...this.selectedWritRecords[0] }
          : {};
      }
      // 加载对应的用户列表
      if (this.form.orgId) {
        this.getFormUser();
      }
      this.title = "修改文书";
      this.open = true;
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row;
      this.viewOpen = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            this.startProcessing("正在修改文书...");
            updateWrit(this.form.id, this.form)
              .then(async (response) => {
                if (response.code === 200) {
                  // 延迟2秒后刷新媒体列表
                  await this.delay(2000);
                  this.resetSelected();
                  this.getList();
                  this.msgSuccess(response.msg || "修改文书成功");
                  this.open = false;
                } else {
                  this.msgError(response.msg || "修改文书失败");
                }
              })
              .catch((error) => {
                this.msgError("修改文书失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建文书...");
            addWrit(this.form)
              .then(async (response) => {
                if (response.code === 200) {
                  // 延迟2秒后刷新媒体列表
                  await this.delay(2000);
                  this.getList();
                  this.msgSuccess(response.msg || "新增文书成功");
                  this.open = false;
                } else {
                  this.msgError(response.msg || "新增文书失败");
                }
              })
              .catch((error) => {
                this.msgError("新增文书失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          }
        }
      });
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        var writIds;
        var writCodes;
        if (row && row.id !== undefined) {
          writIds = row.id;
          writCodes = row.writCode;
        } else {
          writIds = this.selectedWritRecords.map((item) => item.id);
          writCodes = this.selectedWritRecords.map((item) => item.writCode);
        }

        await this.$confirm(
          '是否确认删除文书编号为"' + writCodes + '"的数据项?',
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );
        this.startProcessing("正在删除文书...");
        var response = null;
        if (Array.isArray(writIds)) {
          response = await batchDelWrit({ ids: writIds });
        } else {
          response = await delWritById(writIds);
        }
        if (response.code === 200) {
          // 延迟2秒后刷新媒体列表
          await this.delay(2000);
          this.resetPage();
          this.resetSelected();
          this.getList();
          this.msgSuccess(response.msg || "删除成功");
        } else {
          this.msgError(response.msg || "删除失败");
        }
        this.stopProcessing();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除失败：" + (error.message || "未知错误"));
        }
      }
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
    /** 表单重置 */
    reset() {
      this.form = {
        id: null,
        writName: null,
        writType: null,
        orgId: null,
        writPoliceIds: [],
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

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedWritRecords) &&
          this.selectedWritRecords.length > 0;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedWritRecords.length} 条文书数据？`
          : "是否确认导出所有文书数据项？";

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
          list = this.selectedWritRecords;
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
            const resp = await listWrits(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询文书列表失败");
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

        const formatWritType = (value) => {
          return (
            this.selectDictLabel(this.writTypeOptions || [], value) || value
          );
        };

        const formatRelation = (value) => {
          return (
            this.selectDictLabel(this.relationStatusOptions || [], value) ||
            value
          );
        };

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row };
          output.writType = formatWritType(row.writType);
          output.isRelation = formatRelation(row.isRelation);
          output.writTime = formatDateTime(row.writTime);
          output.createdAt = formatDateTime(row.createdAt);
          output.updatedAt = formatDateTime(row.updatedAt);
          return output;
        });

        const data = formatJson(filterVal, normalizeList);
        // 标记导出开始
        this.exporting = true;
        this.blurWhileExport = true; //弹出“另存为”对话框时，页面将失焦
        // 注册 focus 事件：当用户从“另存为”对话框返回时
        this.focusListener = () => {
          if (this.exporting && this.blurWhileExport) {
            this.blurWhileExport = false;
            console.log(
              "[导出] 页面获焦，用户已从另存为对话框返回，启动 loading"
            );
          }
        };
        window.addEventListener("focus", this.focusListener);
        // 触发导出（会弹出另存为对话框）
        const excel = await import("@/vendor/Export2Excel");
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "文书列表",
          autoWidth: true,
          bookType: "xlsx",
        });
        // 等待用户从“另存为”对话框返回
        while (this.blurWhileExport) {
          await this.delay(100);
        }
        this.startProcessing("正在导出...");
        await this.delay(3000);
        this.resetSelected();
        this.getList();
        this.msgSuccess("导出文书成功");
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("导出失败：" + (error.message || "未知错误"));
        }
      } finally {
        this.exporting = false;
        this.stopProcessing();
        this.cleanupExportListeners();
      }
    },

    /** ------------第一层抽屉 -----------------*/
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
      this.mediaRelationsList = [];
      this.relationTotal = 0;
      this.selectedMediaRelationMap = {};
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
            this.mediaRelationsList = response.data.list || [];
            this.relationTotal = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreMediaRelationSelection();
          } else {
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
          this.relationLoading = false;
        });
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
    /** 取消关联媒体 */
    async handleUnlinkMedia(row) {
      try {
        await this.$confirm("是否确认取消关联该媒体?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        });

        this.startProcessing("正在取消关联...");

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
          this.stopProcessing();
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
            type: "info",
          }
        );

        this.startProcessing("正在批量取消关联...");

        try {
          // 提取选中的关联ID列表
          const ids = this.selectedMediaRelations.map((item) => item.id);

          const response = await batchDeleteWritMediaRelation({ ids: ids });

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000);
            this.selectedMediaRelationMap = {};
            this.selectedMediaRelations = [];
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
          this.stopProcessing();
        }
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("批量取消关联失败：" + (error.message || "未知错误"));
        }
      }
    },

    /** ------------第二层抽屉 -----------------*/
    /** 关联新媒体 - 打开第二层抽屉 */
    handleLinkMedia() {
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

      this.startProcessing("正在关联媒体...");

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
        this.stopProcessing();
      }
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
