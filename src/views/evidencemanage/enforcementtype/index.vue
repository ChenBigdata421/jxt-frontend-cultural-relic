<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 搜索区域 -->
        <div class="filter-container">
          <div class="search-section">
            <div class="quick-search-form">
              <div class="search-row">
                <div class="search-item">
                  <label class="search-label">执法类型名称</label>
                  <el-input
                    v-model="queryParams.enforcementTypeName"
                    placeholder="请输入执法类型名称"
                    clearable
                    @keyup.enter.native="handleQuery"
                  />
                </div>
                <div class="search-item">
                  <label class="search-label">执法类型编码</label>
                  <el-input
                    v-model="queryParams.enforcementTypeCode"
                    placeholder="请输入执法类型编码"
                    clearable
                    @keyup.enter.native="handleQuery"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索按钮 -->
          <div class="search-action-buttons">
            <el-button
              class="search-btn"
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="handleQuery"
            >
              搜索
            </el-button>
            <el-button
              class="reset-btn"
              icon="el-icon-refresh-left"
              size="small"
              @click="handleReset"
            >
              重置
            </el-button>
          </div>
        </div>

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:enforceType:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd"
            >
              新增
            </el-button>
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="getList"
            >
              刷新
            </el-button>
          </div>
        </div>
        <!-- 数据表格 -->
        <el-table
          v-loading="loading"
          :data="enforceTypeList"
          row-key="id"
          default-expand-all
          border
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <!-- 执法类型名称列（固定在左侧） -->
          <el-table-column
            prop="enforcementTypeName"
            label="执法类型名称"
            min-width="180"
            fixed="left"
          />
          <!-- 数据列 -->
          <el-table-column
            prop="enforcementTypeCode"
            label="执法类型编码"
            min-width="150"
          />
          <el-table-column
            prop="enforcementTypeDesc"
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
          <!-- 操作列（最后一列，固定在右侧） -->
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="240"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:enforceType:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-permisaction="['admin:enforceType:add']"
                  size="small"
                  type="text"
                  icon="el-icon-plus"
                  class="action-btn tertiary"
                  @click="handleAdd(scope.row)"
                >
                  新增
                </el-button>
                <el-button
                  v-permisaction="['admin:enforceType:remove']"
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
        </el-table>

        <!-- 添加或修改执法类型对话框 -->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="600px"
          :close-on-click-modal="false"
          append-to-body
          custom-class="edit-dialog"
        >
          <el-form ref="form" :model="form" :rules="rules">
            <!-- 使用 el-collapse 实现可折叠分组 -->
            <el-collapse v-model="activeFormSections" class="form-collapse">

              <!-- 基础信息 -->
              <el-collapse-item name="basic" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-document section-icon" />
                    <span class="section-title">基础信息</span>
                    <span class="section-badge">{{ basicFieldCount }}项</span>
                  </div>
                </template>

                <el-row :gutter="20">
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
                    <el-form-item label="执法类型编码" prop="enforcementTypeCode">
                      <el-input
                        v-model="form.enforcementTypeCode"
                        placeholder="请输入执法类型编码"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="执法类型名称" prop="enforcementTypeName">
                      <el-input
                        v-model="form.enforcementTypeName"
                        placeholder="请输入执法类型名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="执法类型描述" prop="enforcementTypeDesc">
                      <el-input
                        v-model="form.enforcementTypeDesc"
                        type="textarea"
                        placeholder="请输入执法类型描述"
                        :rows="3"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>

              <!-- 其他信息 -->
              <el-collapse-item name="other" class="form-section">
                <template slot="title">
                  <div class="section-header">
                    <i class="el-icon-setting section-icon" />
                    <span class="section-title">其他信息</span>
                    <span class="section-badge">{{ otherFieldCount }}项</span>
                  </div>
                </template>

                <el-row :gutter="20">
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
              </el-collapse-item>

            </el-collapse>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="text" class="tertiary" size="small" @click="cancel">取 消</el-button>
            <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
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
  updateEnforceType
} from '@/api/admin/enforcetype'
import {
  getEnforceTypeList,
  getEnforceType,
  getEnforceTypeTree
} from '@/api/admin/enforcetype'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'EnforceTypeManage',
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
      title: '',
      isEdit: false,
      // 是否显示弹出层
      open: false,
      // 表单折叠状态
      activeFormSections: ['basic'],
      // 查询参数
      queryParams: {
        enforcementTypeName: undefined,
        enforcementTypeCode: undefined
      },
      // 表单参数
      form: {},
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        parentId: [
          { required: true, message: '上级执法类型不能为空', trigger: 'blur' }
        ],
        enforcementTypeCode: [
          { required: true, message: '执法类型编码不能为空', trigger: 'blur' }
        ],
        enforcementTypeName: [
          { required: true, message: '执法类型名称不能为空', trigger: 'blur' }
        ],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 基础信息分组字段数量
    basicFieldCount() {
      // 上级执法类型、执法类型编码、执法类型名称、执法类型描述
      return 4
    },
    // 其他信息分组字段数量
    otherFieldCount() {
      // 显示排序、来源
      return 2
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 构建树形结构 */
    buildTree(list, parentId = 0) {
      const tree = []
      for (const item of list) {
        if (item.parentId === parentId) {
          const children = this.buildTree(list, item.id)
          if (children.length > 0) {
            item.children = children
          }
          tree.push(item)
        }
      }
      return tree
    },
    /** 查询执法类型列表 */
    getList() {
      this.loading = true
      // 优先使用树形接口，如果不存在则使用普通列表接口
      getEnforceTypeList(this.queryParams).then((response) => {
        this.enforceTypeList = response.data ? response.data.list : []
        this.loading = false
      })
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
        delete node.children
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || '未知',
        children: node.children
      }
    },
    /** 查询执法类型下拉树结构 */
    getTreeselect() {
      getEnforceTypeTree().then((response) => {
        this.enforceTypeLabel = []
        const enforceType = {
          id: 0,
          enforcementTypeName: '主类目',
          children: []
        }
        enforceType.children = response.data
        this.enforceTypeLabel.push(enforceType)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        parentId: undefined,
        enforcementTypeCode: undefined,
        enforcementTypeName: undefined,
        enforcementTypeDesc: undefined,
        sort: 10,
        source: undefined
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    handleReset() {
      this.queryParams = {
        enforcementTypeName: undefined,
        enforcementTypeCode: undefined
      }
      this.handleQuery()
    },
    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row !== undefined) {
        this.form.parentId = row.id
      }
      this.open = true
      this.title = '添加执法类型'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      this.form.parentId = row.id
      getEnforceType(row.id).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改执法类型'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateEnforceType(this.form, this.form.id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addEnforceType(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        await this.$confirm(
          `是否确认删除名称为"${row.enforcementTypeName}"的数据项？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const response = await delEnforceType(row.id)
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      } catch (error) {
        // 用户取消操作，不需要提示
        if (error !== 'cancel') {
          this.msgError('删除执法类型失败：' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>
