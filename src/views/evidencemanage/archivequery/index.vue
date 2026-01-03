<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用档案选择器组件 -->
        <ArchiveSelector
          ref="archiveSelector"
          :selection-mode="false"
          @add="handleAdd"
          @update="handleUpdate"
          @delete="handleDelete"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 自定义操作列插槽 -->
          <template #operation="{ row }">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-link"
              @click="handleShowMedia(row)"
              >已归档媒体</el-button
            >
          </template>
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:create']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
                >新增</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:edit']"
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="selectedArchiveRecords.length !== 1"
                @click="handleUpdate"
                >修改</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:remove']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedArchiveRecords.length === 0"
                @click="handleDelete"
                >删除</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['archive:export']"
                type="warning"
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
                >导出</el-button
              >
            </el-col>
          </template>
        </ArchiveSelector>
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="800px"
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="档案标题" prop="archiveTitle">
                <el-input
                  v-model="form.archiveTitle"
                  placeholder="请输入档案标题"
                  maxlength="255"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="档案类型" prop="archiveType">
                <el-select
                  v-model="form.archiveType"
                  placeholder="请选择档案类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in archiveTypeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="保存期限(月)" prop="storageDuration">
                <el-input-number
                  v-model="form.storageDuration"
                  :min="1"
                  :max="9999"
                  placeholder="请输入保存期限"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="form.status"
                  placeholder="请选择状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="档案描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入档案描述"
                  maxlength="1024"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注信息" prop="remarks">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                  maxlength="512"
                  show-word-limit
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

      <!-- 详情对话框 -->
      <el-dialog
        title="档案详情"
        :visible.sync="viewOpen"
        width="800px"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="档案编号">{{
            viewData.archiveCode
          }}</el-descriptions-item>
          <el-descriptions-item label="档案标题">{{
            viewData.archiveTitle
          }}</el-descriptions-item>
          <el-descriptions-item label="档案类型">{{
            archiveTypeFormatter(viewData)
          }}</el-descriptions-item>
          <el-descriptions-item label="管理部门">{{
            viewData.orgName
          }}</el-descriptions-item>
          <el-descriptions-item label="保存期限"
            >{{ viewData.storageDuration }} 月</el-descriptions-item
          >
          <el-descriptions-item label="过期时间">{{
            dateFormatter(viewData, null, viewData.expirationTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(viewData.status)">{{
              statusFormatter(viewData)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="录入人员">{{
            viewData.createUserName
          }}</el-descriptions-item>
          <el-descriptions-item label="录入时间">{{
            dateFormatter(viewData, null, viewData.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新人员">{{
            viewData.updateUserName
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            dateFormatter(viewData, null, viewData.updatedAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="档案描述" :span="2">{{
            viewData.description
          }}</el-descriptions-item>
          <el-descriptions-item label="备注信息" :span="2">{{
            viewData.remarks
          }}</el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </el-dialog>

      <!-- 已归档媒体抽屉 -->
      <el-drawer
        :title="`档案【${currentArchive.archiveTitle}】的已归档媒体`"
        :visible.sync="showMediaDrawer"
        direction="rtl"
        size="60%"
        :before-close="handleCloseMediaDrawer"
        :append-to-body="true"
        :destroy-on-close="false"
        custom-class="media-drawer"
      >
        <div class="drawer-content">
          <!-- 操作按钮 -->
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="selectedMediaRelations.length === 0"
                @click="handleBatchUnarchiveMedia"
                >批量解除归档</el-button
              >
            </el-col>
          </el-row>

          <!-- 已归档媒体列表 -->
          <el-table
            ref="mediaRelationsTable"
            v-loading="relationLoading"
            :data="mediaRelationsList"
            border
            @selection-change="handleMediaRelationsSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              label="档案编号"
              align="center"
              prop="archiveCode"
            />
            <el-table-column label="媒体名称" align="center" prop="mediaName" />
            <el-table-column label="媒体类型" align="center" prop="mediaCate">
              <template slot-scope="scope">
                {{ selectDictLabel(mediaCateOptions, scope.row.mediaCate) }}
              </template>
            </el-table-column>
            <el-table-column label="归档人" align="center" prop="policeName" />
            <el-table-column
              label="归档人组织"
              align="center"
              prop="orgFullName"
            />
            <el-table-column label="归档时间" align="center" prop="createdAt">
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
                  @click="handleUnarchiveMedia(scope.row)"
                  >解除归档</el-button
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
            v-show="mediaTotal > 0"
            :total="mediaTotal"
            :page.sync="relationQueryParams.pageIndex"
            :limit.sync="relationQueryParams.pageSize"
            @pagination="loadArchiveMediaRelations"
          />
        </div>
      </el-drawer>
    </template>
  </BasicLayout>
</template>

<script>
import {
  getArchive,
  addArchive,
  updateArchive,
  delArchive,
  batchDelArchives,
  getArchiveMediaRelationsByArchiveId,
  delArchiveMediaRelationById,
  batchDelArchiveMediaRelations,
} from "@/api/evidence/archive_api";
import { listArchives } from "@/api/evidence/archive_api";
import BasicLayout from "@/layout/BasicLayout";
import ArchiveSelector from "@/components/ArchiveSelector";
import Pagination from "@/components/Pagination";
import { formatJson } from "@/utils";

export default {
  name: "Archive",
  components: {
    BasicLayout,
    ArchiveSelector,
    Pagination,
  },
  data() {
    return {
      // 选中的档案
      selectedArchiveRecords: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示详情弹出层
      viewOpen: false,
      // 详情数据
      viewData: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        archiveTitle: [
          { required: true, message: "档案标题不能为空", trigger: "blur" },
        ],
        archiveType: [
          { required: true, message: "档案类型不能为空", trigger: "change" },
        ],
      },
      // 档案类型选项
      archiveTypeOptions: [
        { label: "案件档案", value: 1 },
        { label: "证据档案", value: 2 },
        { label: "执法档案", value: 3 },
        { label: "其他档案", value: 4 },
      ],
      // 状态选项
      statusOptions: [
        { label: "正常", value: 0 },
        { label: "异常", value: 1 },
        { label: "其他", value: 2 },
      ],
      // 媒体类型字典
      mediaCateOptions: [],
      // 是否显示媒体抽屉
      showMediaDrawer: false,
      // 当前档案
      currentArchive: {},
      // 关联查询参数
      relationQueryParams: {
        pageIndex: 1,
        pageSize: 10,
      },
      // 媒体关联列表
      mediaRelationsList: [],
      // 媒体列表加载状态
      relationLoading: false,
      // 媒体总数
      mediaTotal: 0,
      // 媒体查询参数
      mediaQueryParams: {
        page: 1,
        pageSize: 10,
      },
      // 选中的已归档媒体列表（用于批量解除归档）
      selectedMediaRelations: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedMediaRelationMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringMediaRelationSelection: false,
      exporting: false,
      blurWhileExport: false, //标记页面失去焦点的状态
      processingInstance: null, //Element UI全局加载动画的实例
      focusListener: null, //页面获焦点事件的 (focus）的监听器
      previousCursor: null, //记录鼠标状态
    };
  },
  created() {
    // 组件初始化时不需要调用getList，由ArchiveSelector组件自己处理
    // 加载媒体类型字典
    this.getDicts("evidence_media_type").then((response) => {
      this.mediaCateOptions = response.data;
    });
  },
  methods: {
    /** 档案类型格式化 */
    archiveTypeFormatter(row) {
      const type = this.archiveTypeOptions.find(
        (item) => item.value === row.archiveType
      );
      return type ? type.label : row.archiveType;
    },
    /** 状态格式化 */
    statusFormatter(row) {
      const status = this.statusOptions.find(
        (item) => item.value === row.status
      );
      return status ? status.label : row.status;
    },
    /** 获取状态标签类型 */
    getStatusType(status) {
      const typeMap = {
        0: "success",
        1: "danger",
        2: "info",
      };
      return typeMap[status] || "info";
    },
    /** 日期格式化 */
    dateFormatter(row, column, cellValue) {
      if (!cellValue) return "-";
      const date = new Date(cellValue);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.selectedArchiveRecords = selection;
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加档案";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      // 使用对象展开运算符创建新对象
      if (row && row.archiveId !== undefined) {
        this.form = { ...row };
      } else {
        this.form = this.selectedArchiveRecords[0]
          ? { ...this.selectedArchiveRecords[0] }
          : {};
      }
      this.title = "修改档案";
      this.open = true;
    },
    /** 查看详情 */
    handleView(row) {
      const archiveId = row.archiveId;
      getArchive(archiveId).then((response) => {
        if (response.code === 200) {
          this.viewData = response.data;
          this.viewOpen = true;
        }
      });
    },
    /** 操作按钮处理 */
    handleOperation(row, action) {
      switch (action) {
        case "edit":
          this.handleUpdate(row);
          break;
        case "delete":
          this.handleDelete(row);
          break;
        case "view":
          this.handleView(row);
          break;
        default:
          break;
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.archiveId) {
            this.startProcessing("正在修改档案...");
            updateArchive(this.form, this.form.archiveId)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(2000);
                  this.$refs.archiveSelector.resetSelected();
                  this.$refs.archiveSelector.refreshList();
                  this.msgSuccess("修改档案成功");
                  this.open = false;
                }
              })
              .catch((error) => {
                this.msgError("修改档案失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建档案...");
            addArchive(this.form)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(2000);
                  this.$refs.archiveSelector.refreshList();
                  this.msgSuccess("创建档案成功");
                  this.open = false;
                }
              })
              .catch((error) => {
                this.msgError("创建档案失败：" + (error.message || "未知错误"));
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
        var archiveIds;
        var archiveCodes;
        if (row && row.archiveId !== undefined) {
          archiveIds = row.archiveId;
          archiveCodes = row.archiveCode;
        } else {
          archiveIds = this.selectedArchiveRecords.map(
            (item) => item.archiveId
          );
          archiveCodes = this.selectedArchiveRecords.map(
            (item) => item.archiveCode
          );
        }

        await this.$confirm(
          "确认是否删除编号为" + archiveCodes + "的档案",
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );
        this.startProcessing("正在删除档案...");
        var response = null;
        if (Array.isArray(archiveIds)) {
          response = await batchDelArchives({ ids: archiveIds });
        } else {
          response = await delArchive(archiveIds);
        }
        if (response.code === 200) {
          await this.delay(2000);
          this.$refs.archiveSelector.resetSelected();
          this.$refs.archiveSelector.resetPage();
          this.$refs.archiveSelector.refreshList();
          this.msgSuccess(response.msg || "删除档案成功");
        } else {
          this.msgError(response.msg || "删除档案失败");
        }

        this.stopProcessing();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除档案失败：" + (error.message || "未知错误"));
        }
      }
    },
    /** 导出按钮操作 */
    async handleExport() {
      try {
        const archiveSelector = this.$refs.archiveSelector;
        if (!archiveSelector) {
          this.msgError("档案列表组件未就绪，无法导出");
          return;
        }

        const hasSelection = this.selectedArchiveRecords.length;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedArchiveRecords.length} 条档案数据？`
          : "是否确认导出所有档案数据项？";

        await this.$confirm(confirmText, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        });
        // 仅导出用户当前列设置中“可见”的列
        const columnOptions = Array.isArray(archiveSelector.columnOptions)
          ? archiveSelector.columnOptions
          : [];
        const visibleColumns = Array.isArray(archiveSelector.visibleColumns)
          ? archiveSelector.visibleColumns
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

        // 获取要导出的数据：有勾选则导出勾选，否则导出全部（按当前查询条件拉取）
        let list = [];
        if (hasSelection) {
          list = this.selectedArchiveRecords;
        } else {
          const baseQueryParams = archiveSelector.queryParams || {};
          const pageSize = 1000;
          let pageIndex = 1;
          let total = Infinity;

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize,
            };
            const resp = await listArchives(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询档案列表失败");
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

        // 对导出字段做必要的格式化（与页面展示保持一致）
        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const out = { ...row };
          out.archiveType = this.archiveTypeFormatter(row);
          out.status = this.statusFormatter(row);
          out.createdAt = this.dateFormatter(row, null, row.createdAt);
          out.updatedAt = this.dateFormatter(row, null, row.updatedAt);
          out.expirationTime = this.dateFormatter(
            row,
            null,
            row.expirationTime
          );
          return out;
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
          filename: "档案列表",
          autoWidth: true,
          bookType: "xlsx",
        });
        // 等待用户从“另存为”对话框返回
        while (this.blurWhileExport) {
          await this.delay(100);
        }
        this.startProcessing("正在导出...");
        await this.delay(3000);
        this.$refs.archiveSelector.resetSelected();
        this.$refs.archiveSelector.refreshList();
        this.msgSuccess("导出档案成功");
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("导出失败：" + (error.message || "未知错误"));
        }
      } finally {
        this.stopProcessing();
        this.exporting = false;
        this.cleanupExportListeners();
      }
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        archiveId: undefined,
        archiveTitle: undefined,
        archiveType: undefined,
        description: undefined,
        storageDuration: 120,
        status: 0,
        remarks: undefined,
      };
      this.resetForm("form");
    },
    /** 显示已归档媒体 */
    handleShowMedia(row) {
      this.currentArchive = row;
      this.showMediaDrawer = true;
      this.mediaQueryParams.page = 1;
      this.loadArchiveMediaRelations();
    },
    /** 获取已归档媒体列表 */
    loadArchiveMediaRelations() {
      this.relationLoading = true;
      getArchiveMediaRelationsByArchiveId(
        this.currentArchive.archiveId,
        this.relationQueryParams
      )
        .then((response) => {
          if (response.code === 200) {
            this.mediaRelationsList = response.data.list || [];
            this.mediaTotal = response.data.count || 0;
            // 分页/查询后回显跨分页选择
            this.restoreMediaRelationSelection();
          } else {
            this.msgError(response.msg || "获取已归档媒体列表失败");
            this.mediaRelationsList = [];
            this.mediaTotal = 0;
          }
        })
        .catch((error) => {
          console.error("[loadArchiveMediaRelations] API调用异常:", error);
          this.msgError(
            "获取已归档媒体列表失败：" + (error.message || "未知错误")
          );
          this.mediaRelationsList = [];
          this.mediaTotal = 0;
        })
        .finally(() => {
          this.relationLoading = false;
        });
    },
    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /** 解除归档 */
    async handleUnarchiveMedia(row) {
      try {
        await this.$confirm(
          `是否确认解除媒体"${row.mediaName}"的归档关系？`,
          "警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        this.startProcessing("正在解除归档...");

        try {
          const response = await delArchiveMediaRelationById(row.id);

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000);
            this.loadArchiveMediaRelations();

            this.msgSuccess(response.msg || "解除归档成功");
          } else {
            this.msgError(response.msg || "解除归档失败");
          }
        } finally {
          this.stopProcessing();
        }
      } catch (error) {
        // 用户取消操作或发生错误
        if (error !== "cancel") {
          this.msgError("解除归档失败：" + (error.message || "未知错误"));
        }
      }
    },
    /** 关闭媒体抽屉 */
    handleCloseMediaDrawer(done) {
      this.showMediaDrawer = false;
      this.currentArchive = {};
      this.mediaRelationsList = [];
      this.mediaTotal = 0;
      this.mediaQueryParams.page = 1;
      this.selectedMediaRelations = [];
      if (done) {
        done();
      }
    },

    /** 已归档媒体选择变化 */
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

    /** 批量解除归档 */
    async handleBatchUnarchiveMedia() {
      if (this.selectedMediaRelations.length === 0) {
        this.msgError("请选择要解除归档的媒体");
        return;
      }

      try {
        await this.$confirm(
          `确认解除选中的 ${this.selectedMediaRelations.length} 个媒体的归档关系吗？`,
          "警告",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        this.startProcessing("正在批量解除归档...");

        try {
          // 提取选中的关联ID列表
          const ids = this.selectedMediaRelations.map((item) => item.id);

          const response = await batchDelArchiveMediaRelations({ ids: ids });

          if (response.code === 200) {
            // 延迟2秒后刷新媒体列表
            await this.delay(2000);
            this.selectedMediaRelationMap = {};
            this.selectedMediaRelations = [];
            this.loadArchiveMediaRelations();

            this.msgSuccess(
              response.msg || `成功解除 ${ids.length} 个媒体的归档关系`
            );
          } else {
            this.msgError(response.msg || "批量解除归档失败");
          }
        } finally {
          this.stopProcessing();
        }
      } catch (error) {
        // 用户取消操作或发生错误
        if (error !== "cancel") {
          this.msgError("批量解除归档失败：" + (error.message || "未知错误"));
        }
      }
    },
    /** 字典标签格式化 */
    selectDictLabel(options, value) {
      const item = options.find((opt) => opt.value === value);
      return item ? item.label : value;
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

.drawer-content {
  padding: 20px;
}

.media-drawer >>> .el-drawer__header {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}
</style>
