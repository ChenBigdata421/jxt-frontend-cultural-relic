<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form :inline="true">
          <el-form-item label="执法类型名称">
            <el-input
              v-model="queryParams.enforceTypeName"
              placeholder="请输入执法类型名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="执法类型编码">
            <el-input
              v-model="queryParams.enforceTypeCode"
              placeholder="请输入执法类型编码"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              >搜索</el-button
            >
            <el-button
              v-permisaction="['admin:enforceType:add']"
              class="filter-item"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              >新增</el-button
            >
          </el-form-item>
        </el-form>
        <!--enforceTypeList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          v-loading="loading"
          :data="enforceTypeList"
          row-key="id"
          default-expand-all
          border
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为"v-bind"或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column
            prop="enforceTypeCode"
            label="执法类型编码"
            min-width="150"
          />
          <el-table-column
            prop="enforceTypeName"
            label="执法类型名称"
            min-width="180"
          />
          <el-table-column
            prop="enforceTypeDesc"
            label="执法类型描述"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="source" label="来源" min-width="100" />
          <el-table-column
            label="创建时间"
            align="center"
            prop="createdAt"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="180"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:enforceType:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['admin:enforceType:add']"
                size="mini"
                type="text"
                icon="el-icon-plus"
                @click="handleAdd(scope.row)"
                >新增</el-button
              >
              <el-button
                v-permisaction="['admin:enforceType:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加或修改执法类型对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="600px"
          :close-on-click-modal="false"
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="上级执法类型" prop="parentId">
                  <treeselect
                    v-model="form.parentId"
                    :options="enforceTypeLabel"
                    :normalizer="normalizer"
                    :show-count="true"
                    placeholder="选择上级执法类型"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执法类型编码" prop="enforceTypeCode">
                  <el-input
                    v-model="form.enforceTypeCode"
                    placeholder="请输入执法类型编码"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执法类型名称" prop="enforceTypeName">
                  <el-input
                    v-model="form.enforceTypeName"
                    placeholder="请输入执法类型名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="执法类型描述" prop="enforceTypeDesc">
                  <el-input
                    v-model="form.enforceTypeDesc"
                    type="textarea"
                    placeholder="请输入执法类型描述"
                    :rows="3"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示排序" prop="sort">
                  <el-input-number
                    v-model="form.sort"
                    controls-position="right"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源" prop="source">
                  <el-input v-model="form.source" placeholder="请输入来源" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <!--primary 类型通常具有一个更明显的样式，比如蓝色背景-->
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
  delEnforceType,
  addEnforceType,
  updateEnforceType,
} from "@/api/admin/enforcetype";
import {
  getEnforceTypeList,
  getEnforceType,
  getEnforceTypeTree,
} from "@/api/admin/enforcetype";

import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "EnforceTypeManage",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      enforceTypeList: [],
      // 执法类型树选项
      enforceTypeLabel: [],
      // 弹出层标题
      title: "",
      isEdit: false,
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        enforceTypeName: undefined,
        enforceTypeCode: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        parentId: [
          { required: true, message: "上级执法类型不能为空", trigger: "blur" },
        ],
        enforceTypeCode: [
          { required: true, message: "执法类型编码不能为空", trigger: "blur" },
        ],
        enforceTypeName: [
          { required: true, message: "执法类型名称不能为空", trigger: "blur" },
        ],
        sort: [{ required: true, message: "排序不能为空", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 构建树形结构 */
    buildTree(list, parentId = 0) {
      const tree = [];
      for (const item of list) {
        if (item.parentId === parentId) {
          const children = this.buildTree(list, item.id);
          if (children.length > 0) {
            item.children = children;
          }
          tree.push(item);
        }
      }
      return tree;
    },
    /** 查询执法类型列表 */
    getList() {
      this.loading = true;
      // 优先使用树形接口，如果不存在则使用普通列表接口
      getEnforceTypeList(this.queryParams).then((response) => {
        this.enforceTypeList = response.data ? response.data.list : [];
        this.loading = false;
      });
    },
    /* 在 Vue.js 应用中，当使用如 Treeselect 这样的树形选择组件时，通常需要将原始数据转换成
    组件所需的特定格式。normalizer 方法就是用来进行这种转换的。例如，后端可能返回的数据结构与
    前端组件要求的结构不完全匹配，通过这种方法可以确保数据的一致性和正确性。 */
    /* 虽然 normalizer 函数本身不包含递归逻辑，但如果它被用在一个自动处理树形数据的组件中，
    如 Treeselect，它会被组件自动多次调用，每次处理一个节点。这样的设计允许函数保持简单和专注于
    单个节点的处理，而复杂的遍历逻辑由组件内部管理。 */
    /** 转换执法类型数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.enforceTypeName || node.label || "未知",
        children: node.children,
      };
    },
    /** 查询执法类型下拉树结构 */
    getTreeselect() {
      getEnforceTypeTree().then((response) => {
        this.enforceTypeLabel = [];
        const enforceType = {
          id: 0,
          enforceTypeName: "主类目",
          children: [],
        };
        enforceType.children = response.data;
        this.enforceTypeLabel.push(enforceType);
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
        id: undefined,
        parentId: undefined,
        enforceTypeCode: undefined,
        enforceTypeName: undefined,
        enforceTypeDesc: undefined,
        sort: 10,
        source: undefined,
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row !== undefined) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = "添加执法类型";
      this.isEdit = false;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      this.form.parentId = row.id;
      getEnforceType(row.id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改执法类型";
        this.isEdit = true;
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateEnforceType(this.form, this.form.id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addEnforceType(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.enforceTypeName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return delEnforceType(row.id);
        })
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess(response.msg);
            this.getList();
          } else {
            this.msgError(response.msg);
          }
        })
        .catch(function () {});
    },
  },
};
</script>
