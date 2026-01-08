<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="brandName">
            <el-input
              v-model="queryParams.brandName"
              placeholder="请输入品牌名称"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="硬件设备" prop="hardware">
            <el-input
              v-model="queryParams.hardware"
              placeholder="请输入硬件设备"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select
              v-model="queryParams.state"
              placeholder="角色状态"
              clearable
              size="small"
              style="width: 160px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item> -->
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
              v-permisaction="['equipment:brand:create']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:brand:edit']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="selectedBrandRecords.length !== 1"
              @click="handleUpdate"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:brand:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="selectedBrandRecords.length === 0"
              @click="handleDelete"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['equipment:brand:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              >导出</el-button
            >
          </el-col>
        </el-row>

        <el-table
          ref="brandTable"
          v-loading="loading"
          :data="equipmentBrandList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="150"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:brand:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['equipment:brand:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            label="名称"
            prop="brandName"
            min-width="140"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="硬件设备"
            prop="hardware"
            min-width="140"
            sortable="custom"
            :show-overflow-tooltip="true"
          />
          <el-table-column prop="state" label="状态" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.state === 1 ? 'success' : 'danger'"
                disable-transitions
                title="状态"
                >{{ stateFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
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
        <!--v-show和v-if都是Vue的指令，用于控制元素的显示与隐藏。主要区别在于v-show是简单地控制元素的display样式
  属性来显示或隐藏元素，元素始终会被渲染到DOM中；而v-if是根据条件动态地添加或移除元素，如果条件为假，
  则元素不会被渲染到DOM中。
page.sync和v-model都用于实现双向绑定，但是page.sync是一种自定义的props传递方式，通常用于子组件向
父组件传递数据，而v-model是Vue提供的指令，用于在表单元素和组件上创建双向数据绑定。v-model更适用于
表单元素的双向绑定，而page.sync通常用于自定义组件间的数据传递。-->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog
          v-if="open"
          :title="title"
          :visible.sync="open"
          width="500px"
          :close-on-click-modal="false"
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="名称" prop="brandName">
              <el-input v-model="form.brandName" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="硬件设备" prop="hardware">
              <el-input v-model="form.hardware" placeholder="请输入硬件设备" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.state">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listEquipmentBrand,
  getEquipmentBrand,
  delEquipmentBrand,
  addEquipmentBrand,
  updateEquipmentBrand,
} from "@/api/admin/equipment_manage_api";
import { formatJson } from "@/utils";

export default {
  name: "Brand",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      BrandIds: [],
      selectedBrandRecords: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedBrandMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 总条数
      total: 0,
      // 角色表格数据
      equipmentBrandList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        brandName: undefined,
        hardware: undefined,
        state: undefined,
      },
      // 表单参数
      form: {
        state: undefined,
      },
      // 表单校验
      rules: {},
      processingInstance: null, //Element UI全局加载动画的实例
      previousCursor: null, //记录鼠标状态
    };
  },
  created() {
    this.getList();
    this.getDicts("brand_status").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询品牌列表 */
    getList() {
      this.loading = true;
      const query = this.normalizeQueryParams(this.queryParams);
      listEquipmentBrand(query)
        .then((response) => {
          if (response.code == 200 && response.data) {
            this.equipmentBrandList = response.data.list;
            this.total = response.data.count;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.equipmentBrandList = [];
            this.total = 0;
            this.msgError(response.msg || "获取品牌列表失败");
          }
        })
        .catch((error) => {
          this.equipmentBrandList = [];
          this.total = 0;
          this.msgError("获取品牌列表失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        brandName: undefined,
        hardware: undefined,
        state: undefined,
      };
      this.resetForm("form");
    },
    // 字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.state);
    },

    /**
     * 需要清空记录选中状态的场景如下：
     * 1. 点击搜索按钮时，需要清空记录选中状态
     * 2. 重置按钮操作时，需要清空记录选中状态
     * 3. 执行删除、修改、导出时，需要清空记录选中状态
     * 其他场景下，不需要清空记录选中状态
     */
    resetSelected() {
      this.selectedBrandMap = {};
      this.selectedBrandRecords = [];
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

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
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

    // 多选框选中数据
    handleSelectionChange(selection) {
      if (this.isRestoringSelection) {
        return;
      }
      // 以当前页为准增删选中项（实现跨分页记忆）
      const selectedIdSet = new Set(
        (selection || []).map((item) => item && item.id).filter(Boolean)
      );

      (this.equipmentBrandList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedBrandMap[id] = row;
        } else {
          delete this.selectedBrandMap[id];
        }
      });
      this.selectedBrandRecords = Object.values(this.selectedBrandMap).filter(
        Boolean
      );
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.brandTable) return;
      if (!this.equipmentBrandList || !this.equipmentBrandList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.equipmentBrandList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedBrandMap[id]) {
              this.$refs.brandTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // this.getMenuTreeselect(0)
      this.open = true;
      this.title = "添加品牌";
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
      this.reset();
      this.firstLoad = true;
      // 使用对象展开运算符创建新对象
      if (row && row.id !== undefined) {
        this.form = { ...row };
      } else {
        this.form = this.selectedBrandRecords[0]
          ? { ...this.selectedBrandRecords[0] }
          : {};
      }
      this.title = "修改品牌";
      this.isEdit = true;
      this.open = true;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            this.startProcessing("正在修改品牌...");
            updateEquipmentBrand(this.form, this.form.id)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(1000);
                  this.resetSelected();
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("修改品牌失败：" + (error.message || "未知错误"));
              })
              .finally(() => {
                this.stopProcessing();
              });
          } else {
            this.startProcessing("正在创建品牌...");
            addEquipmentBrand(this.form)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(1000);
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError("新增品牌失败：" + (error.message || "未知错误"));
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
        var brandIds = [];
        var brandNames = [];
        if (row && row.id !== undefined) {
          brandIds = [row.id];
          brandNames = [row.brandName];
        } else {
          brandIds = this.selectedBrandRecords.map((item) => item.id);
          brandNames = this.selectedBrandRecords.map((item) => item.brandName);
        }
        await this.$confirm(
          '是否确认删除品牌"' + brandNames + '"的数据项?',
          "信息",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info",
          }
        );
        this.startProcessing("正在删除品牌...");
        const response = await delEquipmentBrand({ ids: brandIds });
        if (response.code === 200) {
          await this.delay(1000);
          this.resetQuery();
          this.resetSelected();
          this.getList();
          this.msgSuccess(response.msg || "删除品牌成功");
        } else {
          this.msgError(response.msg || "删除品牌失败");
        }
        this.stopProcessing();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除品牌失败：" + (error.message || "未知错误"));
        }
      }
    },
    normalizeQueryParams(params = {}) {
      const query = { ...params };
      Object.keys(query).forEach((key) => {
        const value = query[key];
        if (value === "" || value === null || value === undefined) {
          delete query[key];
        }
      });
      return query;
    },
    /** 导出按钮操作 */
    async handleExport() {
      try {
        const hasSelection =
          Array.isArray(this.selectedBrandRecords) &&
          this.selectedBrandRecords.length > 0;

        const confirmText = hasSelection
          ? `是否确认导出已勾选的 ${this.selectedBrandRecords.length} 条品牌数据？`
          : "是否确认导出所有品牌数据项？";

        await this.$confirm(confirmText, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        });

        const tHeader = ["名称", "硬件设备", "状态", "创建时间", "更新时间"];
        const filterVal = [
          "brandName",
          "hardware",
          "state",
          "createdAt",
          "updatedAt",
        ];

        let list = [];
        if (hasSelection) {
          list = this.selectedBrandRecords;
        } else {
          const baseQueryParams = this.normalizeQueryParams(
            this.queryParams || {}
          );
          const pageSize = 1000;
          let pageIndex = 1;
          let total = Infinity;

          while (list.length < total) {
            const query = {
              ...baseQueryParams,
              pageIndex,
              pageSize,
            };
            const resp = await listEquipmentBrand(query);
            if (!resp || resp.code !== 200) {
              throw new Error((resp && resp.msg) || "查询品牌列表失败");
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
          output.state = this.stateFormat(row);
          output.createdAt = this.parseTime(row.createdAt);
          output.updatedAt = this.parseTime(row.updatedAt);
          return output;
        });

        const data = formatJson(filterVal, normalizeList);

        // 触发导出（会弹出另存为对话框）
        const excel = await import("@/vendor/Export2Excel");
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "品牌列表",
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

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>
