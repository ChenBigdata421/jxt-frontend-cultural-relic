<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 查询栏组件 -->
        <MenuQueryBar
          ref="queryBar"
          :visible-options="visibleOptions"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 主操作栏 -->
        <div class="main-action-bar">
          <div class="left-actions">
            <el-button
              v-permisaction="['admin:sysMenu:add']"
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="handleAdd(null)"
            >
              新增菜单
            </el-button>
            <el-button
              icon="el-icon-refresh"
              size="small"
              type="text"
              class="action-btn tertiary"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-button
              icon="el-icon-download"
              size="small"
              class="action-btn secondary"
              @click="handleExport"
            >
              导出
            </el-button>
          </div>
        </div>

        <!-- 菜单列表 -->
        <el-table
          ref="menuTable"
          v-loading="loading"
          :data="menuList"
          border
          row-key="menuId"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <el-table-column prop="title" label="菜单名称" :show-overflow-tooltip="true" width="180px" />
          <el-table-column prop="icon" label="图标" align="center" width="100px">
            <template slot-scope="scope">
              <svg-icon :icon-class="scope.row.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="60px" />
          <el-table-column prop="permission" label="权限标识" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-popover v-if="scope.row.sysApi.length>0" trigger="hover" placement="top">
                <el-table
                  :data="scope.row.sysApi"
                  border
                  style="width: 100%"
                >
                  <el-table-column
                    prop="title"
                    label="title"
                    width="260px"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.type=='SYS' && scope.row.title!=''"><el-tag type="success">{{ '['+scope.row.type +'] '+ scope.row.title }}</el-tag></span>
                      <span v-if="scope.row.type!='SYS' && scope.row.title!=''"><el-tag type="">{{ '['+scope.row.type +'] '+scope.row.title }}</el-tag></span>
                      <span v-if="scope.row.title==''"><el-tag type="danger">暂无</el-tag></span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="path"
                    label="path"
                    width="270px"
                  >
                    <template slot-scope="scope">
                      <el-tag v-if="scope.row.action=='GET'">{{ scope.row.action }}</el-tag>
                      <el-tag v-if="scope.row.action=='POST'" type="success">{{ scope.row.action }}</el-tag>
                      <el-tag v-if="scope.row.action=='PUT'" type="warning">{{ scope.row.action }}</el-tag>
                      <el-tag v-if="scope.row.action=='DELETE'" type="danger">{{ scope.row.action }}</el-tag>
                      {{ scope.row.path }}
                    </template>
                  </el-table-column>
                </el-table>
                <div slot="reference" class="name-wrapper">
                  <span v-if="scope.row.permission==''">-</span>
                  <span v-else>{{ scope.row.permission }}</span>
                </div>
              </el-popover>
              <span v-else>
                <span v-if="scope.row.permission==''">-</span>
                <span v-else>{{ scope.row.permission }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="组件路径" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.menuType=='A'">{{ scope.row.path }}</span>
              <span v-else>{{ scope.row.component }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="visible" label="可见" :formatter="visibleFormat" width="80">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.visible === 1 ? 'danger' : 'success'"
                disable-transitions
              >{{ visibleFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="280"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-permisaction="['admin:sysMenu:edit']"
                  size="small"
                  type="text"
                  icon="el-icon-edit"
                  class="action-btn tertiary"
                  @click="handleUpdate(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  v-if="scope.row.menuType !== 'F'"
                  v-permisaction="['admin:sysMenu:add']"
                  size="small"
                  type="text"
                  icon="el-icon-plus"
                  class="action-btn tertiary"
                  @click="handleAdd(scope.row)"
                >
                  新增
                </el-button>
                <el-button
                  v-permisaction="['admin:sysMenu:remove']"
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
      </el-card>

      <!-- 新增/修改对话框 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="900px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="edit-dialog"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <!-- 使用 el-collapse 实现可折叠分组 -->
          <el-collapse v-model="activeFormSections" class="form-collapse">
            <!-- 基础信息 -->
            <el-collapse-item name="basic" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-document section-icon" />
                  <span class="section-title">基础信息</span>
                  <span class="section-badge">4项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item prop="parentId">
                    <span slot="label">
                      上级菜单
                      <el-tooltip content="指当前菜单停靠的菜单归属" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <treeselect
                      v-model="form.parentId"
                      :options="menuOptions"
                      :normalizer="normalizer"
                      :show-count="true"
                      placeholder="选择上级菜单"
                      :disabled="!isAdd"
                      @input="handleParentChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="title">
                    <span slot="label">
                      菜单标题
                      <el-tooltip content="菜单位置显示的说明信息" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.title" placeholder="请输入菜单标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="sort">
                    <span slot="label">
                      显示排序
                      <el-tooltip content="根据序号升序排列" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input-number v-model="form.sort" controls-position="right" :min="0" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item prop="menuType">
                    <span slot="label">
                      菜单类型
                      <el-tooltip content="包含目录：以及菜单或者菜单组，菜单：具体对应某一个页面，按钮：功能才做按钮；" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-if="isAdd" v-model="form.menuType">
                      <el-radio v-if="form.parentType == 'M'" label="M">目录</el-radio>
                      <el-radio v-if="form.parentType == 'M'" label="C">菜单</el-radio>
                      <el-radio v-if="form.parentType == 'C'" label="F">按钮</el-radio>
                    </el-radio-group>
                    <el-radio-group v-else v-model="form.menuType">
                      <el-radio label="M" disabled="true">目录</el-radio>
                      <el-radio label="C" disabled="true">菜单</el-radio>
                      <el-radio label="F" disabled="true">按钮</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 显示配置 -->
            <el-collapse-item name="display" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-setting section-icon" />
                  <span class="section-title">显示配置</span>
                  <span class="section-badge">2项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="菜单图标">
                    <el-popover
                      placement="bottom-start"
                      width="460"
                      trigger="click"
                      @show="$refs['iconSelect'].reset()"
                    >
                      <IconSelect ref="iconSelect" @selected="selected" />
                      <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                        <svg-icon
                          v-if="form.icon"
                          slot="prefix"
                          :icon-class="form.icon"
                          class="el-input__icon"
                          style="height: 32px;width: 16px;"
                        />
                        <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                      </el-input>
                    </el-popover>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menuType != 'F'">
                    <span slot="label">
                      菜单状态
                      <el-tooltip content="需要显示在菜单列表的菜单设置为显示，否则设置为隐藏" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-model="form.visible">
                      <el-radio
                        v-for="dict in visibleOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menuType == 'M' || form.menuType == 'C'">
                    <span slot="label">
                      是否外链
                      <el-tooltip content="可以通过iframe打开指定地址" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-model="form.isFrame">
                      <el-radio label="0">是</el-radio>
                      <el-radio label="1">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- 路由配置 -->
            <el-collapse-item name="route" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-link section-icon" />
                  <span class="section-title">路由配置</span>
                  <span class="section-badge">4项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item v-if="form.menuType == 'M' || form.menuType == 'C'" prop="menuName">
                    <span slot="label">
                      路由名称
                      <el-tooltip content="需要和页面name保持一致,对应页面即可选择缓存" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.menuName" placeholder="请输入路由名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menuType == 'M' || form.menuType == 'C'" prop="component">
                    <span slot="label">
                      组件路径
                      <el-tooltip content="菜单对应的具体vue页面文件路径views的下级路径/admin/sys-api/index;目录类型:填写Layout,如何有二级目录请参照日志目录填写；" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.component" placeholder="请输入组件路径" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menuType != 'F'" prop="path">
                    <span slot="label">
                      路由地址
                      <el-tooltip content="访问此页面自定义的url地址,建议/开头书写，例如 /app-name/menu-name" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.path" placeholder="请输入路由地址" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menuType == 'F' || form.menuType == 'C'">
                    <span slot="label">
                      权限标识
                      <el-tooltip content="前端权限控制按钮是否显示" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.permission" placeholder="请权限标识" maxlength="50" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>

            <!-- API权限配置 -->
            <el-collapse-item name="api" class="form-section">
              <template slot="title">
                <div class="section-header">
                  <i class="el-icon-connection section-icon" />
                  <span class="section-title">API权限配置</span>
                  <span class="section-badge">1项</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item v-if="form.menuType == 'F' || form.menuType == 'C'">
                    <span slot="label">
                      api权限
                      <el-tooltip content="配置在这个菜单上需要使用到的接口，否则在设置用户角色时，接口将无权访问。" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-transfer
                      v-model="form.apis"
                      style="text-align: left; display: inline-block"
                      filterable
                      :props="{
                        key: 'id',
                        label: 'title'
                      }"
                      :titles="['未授权', '已授权']"
                      :button-texts="['收回', '授权 ']"
                      :format="{
                        noChecked: '${total}',
                        hasChecked: '${checked}/${total}'
                      }"
                      class="panel"
                      :data="sysapiIdTitleList"
                    >
                      <span slot-scope="{ option }">{{ option.title }}</span>
                    </el-transfer>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="text" class="action-btn tertiary" size="small" @click="cancel">取 消</el-button>
          <el-button type="primary" size="small" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import BasicLayout from '@/layout/BasicLayout'
import MenuQueryBar from '@/components/MenuQueryBar/index.vue'
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from '@/api/admin/sys-menu'
import { listSysApiIdTitle } from '@/api/admin/sys-api'
import { getRoutes } from '@/api/admin/sys-role'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import { formatJson } from '@/utils'

export default {
  name: 'SysMenuManage',
  components: {
    BasicLayout,
    MenuQueryBar,
    Treeselect,
    IconSelect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 菜单表格树数据
      menuList: [],
      sysapiIdTitleList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否是新增
      isAdd: false,
      // 表单折叠状态
      activeFormSections: ['basic', 'display', 'route', 'api'],
      // 菜单状态数据字典
      visibleOptions: [],
      // 查询参数
      queryParams: {
        title: undefined,
        visible: undefined
      },
      // 表单参数
      form: {
        apis: [],
        sysApi: []
      },
      // 表单校验
      rules: {
        title: [{ required: true, message: '菜单标题不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }]
      },
      processingInstance: null,
      previousCursor: null
    }
  },
  created() {
    this.getList()
    this.getApiList()
    this.getDicts('sys_show_hide').then(response => {
      this.visibleOptions = response.data
    })
  },
  methods: {
    /** 查询菜单列表，而且每个菜单项携带了各自对应的API */
    getList() {
      this.loading = true
      listMenu(this.queryParams).then(response => {
        this.menuList = response.data
        this.loading = false
      })
        .catch((error) => {
          this.msgError('查询菜单列表失败：' + (error.message || '未知错误'))
          this.menuList = []
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 获取API列表 */
    getApiList() {
      this.loading = true
      listSysApiIdTitle({ 'type': 'BUS' }).then(response => {
        this.sysapiIdTitleList = response.data
      })
        .catch((error) => {
          this.msgError('获取API列表失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
    },

    /** 开始执行操作 */
    startProcessing(text) {
      this.processingInstance = this.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      this.previousCursor = document.body.style.cursor
      document.body.style.cursor = 'wait'
    },

    /** 停止执行操作 */
    stopProcessing() {
      if (this.processingInstance) {
        this.processingInstance.close()
        this.processingInstance = null
      }
      document.body.style.cursor = this.previousCursor
    },

    /** 刷新列表 */
    handleRefresh() {
      this.getList()
    },

    /** 查询栏相关方法 */
    handleSearch(searchData) {
      Object.keys(searchData).forEach(key => {
        this.queryParams[key] = searchData[key]
      })
      this.getList()
    },

    handleReset() {
      this.queryParams = {
        title: undefined,
        visible: undefined
      }
      this.getList()
    },

    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.menuId,
        label: node.title,
        children: node.children
      }
    },

    /** 菜单下拉树结构 */
    getTreeselect() {
      getRoutes().then(response => {
        this.menuOptions = []
        const menu = { menuId: 0, title: '主类目', children: [] }
        menu.children = response.data
        this.menuOptions.push(menu)
      })
    },

    /** 菜单显示状态字典翻译 */
    visibleFormat(row) {
      if (row.menuType === 'F') {
        return '-- --'
      }
      return this.selectDictLabel(this.visibleOptions, row.visible)
    },

    /** 选择图标 */
    selected(name) {
      this.form.icon = name
    },

    /** 查找菜单类型 */
    findMenuTypeById(objects, id) {
      if (id === 0) {
        return 'M'
      }
      function search(objects) {
        for (const obj of objects) {
          if (obj.menuId === id) {
            return obj.menuType
          }
          if (obj.children && obj.children.length > 0) {
            const result = search(obj.children)
            if (result !== undefined) {
              return result
            }
          }
        }
        return undefined
      }
      return search(objects)
    },

    /** 判断菜单项是否有子菜单 */
    hasChild(objects, id) {
      function search(objects) {
        for (const obj of objects) {
          if (obj.menuId === id) {
            if (obj.children !== undefined) {
              return true
            } else {
              return false
            }
          }
          if (obj.children && obj.children.length > 0) {
            const result = search(obj.children)
            if (result !== undefined) {
              return result
            }
          }
        }
        return undefined
      }
      return search(objects)
    },

    /** 处理父级菜单变化 */
    handleParentChange(id) {
      this.form.parentType = this.findMenuTypeById(this.menuOptions, id)
    },

    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null) {
        this.form.parentId = row.menuId
        this.form.parentType = row.menuType
      } else {
        this.form.parentId = 0
        this.form.parentType = 'M'
      }
      this.isAdd = true
      this.open = true
      this.title = '添加菜单'
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      getMenu(row.menuId).then(response => {
        this.form = response.data
        this.open = true
        this.isAdd = false
        this.title = '修改菜单'
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.menuId !== undefined) {
            this.startProcessing('正在修改菜单...')
            updateMenu(this.form, this.form.menuId)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '修改菜单成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '修改菜单失败')
                }
              })
              .catch((error) => {
                this.msgError('修改菜单失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          } else {
            this.startProcessing('正在创建菜单...')
            addMenu(this.form)
              .then(async(response) => {
                if (response.code === 200) {
                  await this.delay(2000)
                  this.getList()
                  this.msgSuccess(response.msg || '新增菜单成功')
                  this.open = false
                } else {
                  this.msgError(response.msg || '新增菜单失败')
                }
              })
              .catch((error) => {
                this.msgError('新增菜单失败：' + (error.message || '未知错误'))
              })
              .finally(() => {
                this.stopProcessing()
              })
          }
        }
      })
    },

    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        // 检查是否有子菜单
        if (this.hasChild(this.menuList, row.menuId) === true) {
          this.msgError('请先删除"' + row.title + '"的子菜单!')
          return
        }

        const confirmMessage = `是否确认删除菜单"${row.title}"？此操作不可恢复。`

        await this.$confirm(confirmMessage, '确认删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.startProcessing('正在删除菜单...')
        const response = await delMenu({ ids: [row.menuId] })
        if (response.code === 200) {
          await this.delay(2000)
          this.getList()
          this.msgSuccess(response.msg || '删除菜单成功')
        } else {
          this.msgError(response.msg || '删除菜单失败')
        }
        this.stopProcessing()
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('删除失败：' + (error.message || '未知错误'))
        }
      }
    },

    /** 表单重置 */
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        apis: [],
        sort: 0,
        action: '',
        isFrame: '1',
        visible: '0'
      }
      this.resetForm('form')
    },

    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },

    /** 导出按钮操作 */
    async handleExport() {
      try {
        const confirmText = '是否确认导出所有菜单数据项？'

        await this.$confirm(confirmText, '导出确认', {
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'info'
        })

        // 扁平化菜单列表
        const flattenMenuList = (list) => {
          const result = []
          list.forEach(item => {
            result.push(item)
            if (item.children && item.children.length > 0) {
              result.push(...flattenMenuList(item.children))
            }
          })
          return result
        }

        const list = flattenMenuList(this.menuList)

        const normalizeList = (Array.isArray(list) ? list : []).map((row) => {
          const output = { ...row }
          output.visible = this.visibleFormat(row)
          output.createdAt = this.parseTime(row.createdAt)
          return output
        })

        const data = formatJson(['title', 'sort', 'permission', 'component', 'visible', 'createdAt'], normalizeList)

        // 触发导出
        const excel = await import('@/vendor/Export2Excel')
        excel.export_json_to_excel({
          header: ['菜单名称', '排序', '权限标识', '组件路径', '可见', '创建时间'],
          data,
          filename: '菜单列表',
          autoWidth: true,
          bookType: 'xlsx'
        })
      } catch (error) {
        if (error !== 'cancel') {
          this.msgError('导出失败：' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel .el-transfer__buttons {
  width: 150px;
}
.panel .el-transfer__buttons .el-button + .el-button {
  margin-left: 0;
}
.panel .el-transfer-panel {
  width: 300px;
}

.el-col {
  padding: 0 5px;
}

// 操作按钮样式
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>

<!--
  样式说明：本页面全部使用全局样式
  全局样式位置：
  - src/styles/index.scss: .filter-container
  - src/styles/components/search.scss: .search-section, .quick-search-form, .search-row, .search-item
  - src/styles/components/dialogs.scss: .edit-dialog, .form-collapse
  - src/styles/components/forms.scss: .section-header, .section-descriptions
  - src/styles/components/buttons.scss: .action-btn, .search-action-buttons
-->
