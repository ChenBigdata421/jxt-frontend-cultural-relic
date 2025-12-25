<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="采集站编号" prop="collectSiteNo">
            <el-input
              v-model="queryParams.collectSiteNo"
              placeholder="请输入采集站编号"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="采集站名称" prop="collectSiteName">
            <el-input
              v-model="queryParams.collectSiteName"
              placeholder="请输入采集站名称"
              clearable
              style="width: 170px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="管理组织" prop="managerOrgId">
            <treeselect
              v-model="queryParams.managerOrgId"
              :options="orgOptions"
              placeholder="请选择管理组织"
              style="width: 170px"
            />
          </el-form-item>
          <el-form-item prop="managerId" label="管理人员">
            <el-select
              v-model="queryParams.managerId"
              placeholder="请选择管理人员"
              style="width: 170px"
              @change="$forceUpdate()"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.userId"
                :label="item.userName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="brandId" label="品牌">
            <el-select
              v-model="queryParams.brandId"
              placeholder="请选择品牌"
              style="width: 170px"
              clearable
            >
              <el-option
                v-for="item in brandOptions"
                :key="item.id"
                :label="item.brandName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="启用状态" prop="openStatus">
            <el-select
              v-model="queryParams.openStatus"
              placeholder="启用状态"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in openStatusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
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
                v-for="dict in stateOptions"
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
                  v-permisaction="['equipment:site:create']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                  >新增</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:site:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="selectedSiteRecords.length !== 1"
                  @click="handleUpdate"
                  >修改</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:site:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="selectedSiteRecords.length === 0"
                  @click="handleDelete"
                  >删除</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['equipment:site:export']"
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
            <el-popover placement="bottom-end" width="280" trigger="click">
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
          ref="siteTable"
          v-loading="loading"
          :data="SiteList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="180"
            fixed="left"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['equipment:site:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
                >浏览</el-button
              >
              <el-button
                v-permisaction="['equipment:site:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-permisaction="['equipment:site:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('collectSiteName')"
            prop="collectSiteName"
            label="名称"
            min-width="140"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteNo')"
            prop="collectSiteNo"
            label="编号"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('brandName')"
            prop="brandName"
            label="品牌"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteIp')"
            prop="collectSiteIp"
            label="IP地址"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('address')"
            prop="address"
            label="地址"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('collectSiteUrl')"
            prop="collectSiteUrl"
            label="播放地址"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('managerName')"
            prop="managerName"
            label="管理人员"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('managerOrgFullName')"
            prop="managerOrgFullName"
            label="管理组织"
            min-width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('status')"
            prop="status"
            label="状态"
            width="110"
          >
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                disable-transitions
                >{{ stateFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('openStatus')"
            prop="openStatus"
            label="启用状态"
            width="110"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.openStatus === 1 ? 'success' : 'danger'"
                disable-transitions
                >{{ openStatusFormat(scope.row) }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('cpu')"
            prop="cpu"
            label="CPU"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('memory')"
            prop="memory"
            label="内存(G)"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('disk')"
            prop="disk"
            label="存储(G)"
            width="140"
          />
          <el-table-column
            v-if="isColumnVisible('usbNum')"
            prop="usbNum"
            label="USB数量"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('system')"
            prop="system"
            label="操作系统"
            min-width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="isColumnVisible('version')"
            prop="version"
            label="版本"
            width="120"
          />
          <el-table-column
            v-if="isColumnVisible('purchaseDate')"
            prop="purchaseDate"
            label="购买时间"
            width="180"
          >
            <template slot-scope="{ row }">
              {{ parseTime(row.purchaseDate) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="isColumnVisible('remark')"
            prop="remark"
            label="备注"
            min-width="160"
            :show-overflow-tooltip="true"
          />
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
        <!-- 添加或修改执法仪对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="700px"
          :close-on-click-modal="false"
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="100px">
            <!-- 管理信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="管理组织" prop="managerOrgId">
                  <treeselect
                    v-model="form.managerOrgId"
                    :options="orgOptions"
                    placeholder="请选择管理组织"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="管理人员">
                  <el-select
                    v-model="form.managerId"
                    placeholder="请选择"
                    @change="$forceUpdate()"
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

            <!-- 基础信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" prop="collectSiteName">
                  <el-input
                    v-model="form.collectSiteName"
                    placeholder="请输入名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编号" prop="collectSiteNo">
                  <el-input
                    v-model="form.collectSiteNo"
                    placeholder="请输入编号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌">
                  <el-select v-model="form.brandId" placeholder="请选择">
                    <el-option
                      v-for="item in brandOptions"
                      :key="item.id"
                      :label="item.brandName"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 网络信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="IP" prop="collectSiteIp">
                  <el-input
                    v-model="form.collectSiteIp"
                    placeholder="请输入IP"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址" prop="address">
                  <el-input
                    v-model="form.address"
                    placeholder="请输入物理地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="播放地址" prop="collectSiteUrl">
                  <el-input
                    v-model="form.collectSiteUrl"
                    placeholder="请输入播放地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密钥" prop="authKey">
                  <el-input v-model="form.authKey" placeholder="请输入密钥" />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 硬件配置 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="CPU">
                  <el-input v-model="form.cpu" placeholder="请输入CPU" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="内存(G)">
                  <el-input-number
                    v-model="form.memory"
                    placeholder="请输入内存大小"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="存储(G)">
                  <el-input-number
                    v-model="form.disk"
                    placeholder="请输入磁盘大小"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="USB数量">
                  <el-input-number v-model="form.usbNum" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购置时间">
                  <el-date-picker
                    v-model="form.purchaseDate"
                    type="datetime"
                    placeholder="请输入购置时间"
                    format="yyyy-MM-ddTHH:mm:ssZ"
                    value-format="yyyy-MM-ddTHH:mm:ssZ"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 系统信息 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="操作系统">
                  <el-input
                    v-model="form.system"
                    placeholder="操作系统"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版本">
                  <el-input
                    v-model="form.version"
                    placeholder="版本"
                    maxlength="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 状态与备注 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="启用状态">
                  <el-radio-group v-model="form.openStatus">
                    <el-radio
                      v-for="dict in openStatusOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.status">
                    <el-radio
                      v-for="dict in stateOptions"
                      :key="dict.value"
                      :label="dict.value"
                      >{{ dict.label }}</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="form.remark" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 浏览采集站对话框 -->
        <el-dialog
          title="浏览采集站"
          :visible.sync="viewOpen"
          width="800px"
          append-to-body
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="采集站编号">{{
              viewData.collectSiteNo || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="采集站名称">{{
              viewData.collectSiteName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{
              viewData.brandName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="管理组织">{{
              viewData.managerOrgFullName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="管理人员">{{
              viewData.managerName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="启用状态">{{
              selectDictLabel(openStatusOptions, viewData.openStatus) || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{
              selectDictLabel(stateOptions, viewData.status) || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="IP 地址">{{
              viewData.collectSiteIp || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="播放地址">{{
              viewData.collectSiteUrl || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="密钥">{{
              viewData.authKey || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="物理地址" :span="2">{{
              viewData.address || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="CPU">{{
              viewData.cpu || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="内存(G)">{{
              viewData.memory || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="存储(G)">{{
              viewData.disk || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="USB 数量">{{
              viewData.usbNum || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{
              viewData.system || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="版本">{{
              viewData.version || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="购置时间">{{
              viewData.purchaseDate ? parseTime(viewData.purchaseDate) : "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{
              viewData.remark || "无"
            }}</el-descriptions-item>
          </el-descriptions>
          <div slot="footer" class="dialog-footer">
            <el-button @click="viewOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listEquipmentSite,
  delEquipmentSite,
  getEquipmentSite,
  getEquipmentSiteConfig,
  addEquipmentSite,
  updateEquipmentSite,
  listEquipmentBrand,
} from "@/api/admin/equipment_manage_api";
import { formatJson } from "@/utils";
import { orgTreeSelect } from "@/api/admin/sys-org";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { listUser } from "@/api/admin/sys-user";
export default {
  name: "Site",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      firstLoad: null,
      // 选中数组
      SiteIds: [],
      selectedSiteRecords: [],
      // 使用 Map 存储所有选中的项（跨分页）
      selectedSiteMap: {},
      // 防止恢复选中时触发事件循环
      isRestoringSelection: false,
      // 总条数
      total: 0,
      // 执法仪数据
      SiteList: [],
      // 状态数据字典
      stateOptions: [],
      // 启用状态数据字典
      openStatusOptions: [],
      // 列配置
      columnOptions: [
        { prop: "collectSiteName", label: "名称", defaultVisible: true },
        { prop: "collectSiteNo", label: "编号", defaultVisible: true },
        { prop: "collectSiteIp", label: "IP地址", defaultVisible: true },
        { prop: "address", label: "地址", defaultVisible: true },
        { prop: "collectSiteUrl", label: "播放地址", defaultVisible: false },
        { prop: "managerName", label: "管理人员", defaultVisible: true },
        {
          prop: "managerOrgFullName",
          label: "管理组织",
          defaultVisible: true,
        },
        { prop: "openStatus", label: "启用状态", defaultVisible: true },
        { prop: "brandName", label: "品牌", defaultVisible: true },
        { prop: "status", label: "状态", defaultVisible: true },
        { prop: "cpu", label: "CPU", defaultVisible: false },
        { prop: "memory", label: "内存(G)", defaultVisible: false },
        { prop: "disk", label: "存储(G)", defaultVisible: false },
        { prop: "usbNum", label: "USB数量", defaultVisible: false },
        { prop: "system", label: "操作系统", defaultVisible: false },
        { prop: "version", label: "版本", defaultVisible: false },
        { prop: "purchaseDate", label: "购买时间", defaultVisible: false },
        { prop: "remark", label: "备注", defaultVisible: false },
      ],
      // 可见列
      visibleColumns: [],
      // 弹出层标题
      title: "",
      isEdit: false,
      // 是否显示增加采集站对话框
      open: false,
      // 是否显示查看采集站详情对话框
      viewOpen: false,
      // 浏览数据
      viewData: {},
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      ActiveLab: "first",
      SelectedRow: undefined,
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        managerOrgId: undefined,
        managerId: undefined,
        collectSiteNo: undefined,
        collectSiteName: undefined,
        status: undefined,
        brandName: undefined,
        openStatus: undefined,
      },
      AttributeValueList: [],
      AttributeValueConfigList: [],
      // 表单参数
      form: {
        status: "1",
      },
      ColumnNameConfigConvert: new Map([
        ["Id", "主键ID"],
        ["Name", "采集站名称"],
        ["HeartBeatTimeSpace", "采集站心跳包间隔时间"],
        ["FileRootPath", "采集站文件保存路径"],
        ["StorageName", "存储服务器"],
        ["UploadSpeed", "采集站上传文件速率"],
        ["UploadTime", "采集站上传文件时间"],
      ]),
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [{ required: true, message: "编号不能为空", trigger: "blur" }],
      },
    };
  },
  watch: {
    "form.managerOrgId": function (newVal) {
      // 当 form.managerOrgId 更新时，调用 getFormUser
      if (newVal) {
        if (this.firstLoad !== true) {
          // 首次打开对话框，不需要清空管理人员
          this.form.managerId = null; // 清空管理人员选择
        }
        this.firstLoad = false;
        this.getFormUser();
      }
    },
    "queryParams.managerOrgId": function (newVal) {
      // 当 queryParams.managerOrgId 更新时，调用 getQueryUser
      if (newVal) {
        this.queryParams.managerId = null; // 清空管理人员选择
        this.getQueryUser();
      }
    },
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getFormBrand();
    this.getDicts("site_status").then((response) => {
      this.stateOptions = response.data;
    });
    this.getDicts("open_status").then((response) => {
      this.openStatusOptions = response.data;
    });
    this.initVisibleColumns();
  },
  methods: {
    getDefaultVisibleColumns() {
      return this.columnOptions
        .filter((item) => item.defaultVisible !== false)
        .map((item) => item.prop);
    },
    initVisibleColumns() {
      const saved = localStorage.getItem("site_manage_visible_columns");
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved);
          return;
        } catch (error) {
          console.warn("解析列配置失败，使用默认列", error);
        }
      }
      this.visibleColumns = this.getDefaultVisibleColumns();
    },
    isColumnVisible(prop) {
      return this.visibleColumns.includes(prop);
    },
    handleColumnChange(value) {
      this.visibleColumns = value;
      localStorage.setItem(
        "site_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
    },
    resetColumns() {
      this.visibleColumns = this.getDefaultVisibleColumns();
      localStorage.setItem(
        "site_manage_visible_columns",
        JSON.stringify(this.visibleColumns)
      );
      this.$message.success("已重置为默认显示");
    },
    /** 查询采集站列表 */
    getList() {
      this.loading = true;
      const query = this.normalizeQueryParams(this.queryParams);
      listEquipmentSite(query)
        .then((response) => {
          if (response.code === 200 && response.data) {
            this.SiteList = response.data.list;
            this.total = response.data.count;
            // 分页/查询后回显跨分页选择
            this.restoreSelection();
          } else {
            this.SiteList = [];
            this.total = 0;
            this.msgError(response.msg || "获取采集站列表失败");
          }
        })
        .catch((error) => {
          this.SiteList = [];
          this.total = 0;
          this.msgError("查询采集站列表失败：" + (error.message || "未知错误"));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 字典状态字典翻译
    stateFormat(row) {
      return this.selectDictLabel(this.stateOptions, row.status);
    },

    // 字典状态字典翻译
    openStatusFormat(row) {
      return this.selectDictLabel(this.openStatusOptions, row.openStatus);
    },
    getFormBrand() {
      listEquipmentBrand().then((response) => {
        this.brandOptions = response.data.list;
      });
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data; // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      });
    },

    getFormUser() {
      listUser({ orgId: "/" + this.form.managerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list;
        }
      );
    },

    getQueryUser() {
      listUser({ orgId: "/" + this.queryParams.managerOrgId + "/" }).then(
        (response) => {
          this.userOptions = response.data.list;
        }
      );
    },

    // 表单重置
    reset() {
      this.form = {
        managerOrgId: undefined,
        managerId: undefined,
        collectSiteName: undefined,
        collectSiteNo: undefined,
        brandName: undefined,
        collectSiteIp: undefined,
        address: undefined,
        collectSiteUrl: undefined,
        authKey: undefined,
        status: undefined,
        openStatus: undefined,
        cpu: undefined,
        memory: undefined,
        disk: undefined,
        purchaseDate: undefined,
        usbNum: undefined,
        system: undefined,
        version: undefined,
        remark: undefined,
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
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

      (this.SiteList || []).forEach((row) => {
        const id = row && row.id;
        if (!id) return;
        if (selectedIdSet.has(id)) {
          this.selectedSiteMap[id] = row;
        } else {
          delete this.selectedSiteMap[id];
        }
      });
      this.selectedSiteRecords = Object.values(this.selectedSiteMap).filter(
        Boolean
      );
    },

    restoreSelection() {
      if (this.isRestoringSelection) return;
      if (!this.$refs.siteTable) return;
      if (!this.SiteList || !this.SiteList.length) return;

      this.isRestoringSelection = true;
      this.$nextTick(() => {
        try {
          this.SiteList.forEach((row) => {
            const id = row && row.id;
            if (!id) return;
            if (this.selectedSiteMap[id]) {
              this.$refs.siteTable.toggleRowSelection(row, true);
            }
          });
        } finally {
          this.isRestoringSelection = false;
        }
      });
    },

    /** 新增按钮操作*/
    handleAdd(row) {
      this.reset();
      this.open = true;
      this.title = "添加采集站";
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
        this.form = this.selectedSiteRecords[0]
          ? { ...this.selectedSiteRecords[0] }
          : {};
      }
      this.title = "修改采集站";
      this.isEdit = true;
      this.open = true;
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.viewData = row;
      this.viewOpen = true;
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            // 鼠标切换为等待状态
            const previousCursor = document.body.style.cursor;
            document.body.style.cursor = "wait";
            const loadingInstance = this.$loading({
              lock: true,
              text: "正在修改采集站...",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.3)",
            });
            updateEquipmentSite(this.form, this.form.id)
              .then(async (response) => {
                if (response.code === 200) {
                  await this.delay(1000);
                  this.selectedSiteMap = {};
                  this.selectedSiteRecords = [];
                  this.getList();
                  this.msgSuccess(response.msg);
                  this.open = false;
                } else {
                  this.msgError(response.msg);
                }
              })
              .catch((error) => {
                this.msgError(
                  "修改采集站失败：" + (error.message || "未知错误")
                );
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
              text: "正在创建采集站...",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.3)",
            });
            addEquipmentSite(this.form)
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
                this.msgError(
                  "新增采集站失败：" + (error.message || "未知错误")
                );
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
        var siteIds = [];
        var siteNos = [];
        if (row && row.id !== undefined) {
          siteIds = append(bwcIds, row.id);
          siteNos = append(bwcCodes, row.collectSiteNo);
        } else {
          siteIds = this.selectedSiteRecords.map((item) => item.id);
          siteNos = this.selectedSiteRecords.map((item) => item.collectSiteNo);
        }
        await this.$confirm(
          '是否确认删除采集站编号为"' + siteNos + '"的数据项?',
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
          text: "正在删除采集站...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.3)",
        });
        const response = await delEquipmentSite({ ids: siteIds });
        if (response.code === 200) {
          await this.delay(1000);
          this.selectedSiteMap = {};
          this.selectedSiteRecords = [];
          this.getList();
          this.msgSuccess(response.msg || "删除采集站成功");
        } else {
          this.msgError(response.msg || "删除采集站失败");
        }
        // 恢复鼠标状态
        document.body.style.cursor = previousCursor;
        loadingInstance.close();
      } catch (error) {
        if (error !== "cancel") {
          this.msgError("删除采集站失败：" + (error.message || "未知错误"));
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
    handleExport() {
      const hasSelection =
        Array.isArray(this.selectedSiteRecords) &&
        this.selectedSiteRecords.length > 0;

      const confirmText = hasSelection
        ? `是否确认导出已勾选的 ${this.selectedSiteRecords.length} 条采集站数据？`
        : "是否确认导出所有采集站数据项？";

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
            const filterVal = exportColumns.map((c) => c.field || c.prop);

            let list = [];
            if (hasSelection) {
              list = this.selectedSiteRecords;
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
                const resp = await listEquipmentSite(query);
                if (!resp || resp.code !== 200) {
                  throw new Error((resp && resp.msg) || "查询采集站列表失败");
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
              const option = (this.stateOptions || []).find(
                (item) => String(item.value) === String(value)
              );
              return option ? option.label : value;
            };

            const formatOpenStatus = (value) => {
              const option = (this.openStatusOptions || []).find(
                (item) => String(item.value) === String(value)
              );
              return option ? option.label : value;
            };

            const normalizeList = (Array.isArray(list) ? list : []).map(
              (row) => {
                const output = { ...row };
                output.status = formatStatus(row.status);
                output.openStatus = formatOpenStatus(row.openStatus);
                output.purchaseDate = formatDateTime(row.purchaseDate);
                return output;
              }
            );

            const data = formatJson(filterVal, normalizeList);

            const excel = await import("@/vendor/Export2Excel");
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: "采集站列表",
              autoWidth: true,
              bookType: "xlsx",
            });
          } catch (error) {
            console.error("[SiteManage] 导出失败:", error);
            this.msgError(error.message || "导出失败");
          } finally {
            loadingInstance.close();
          }
        })
        .catch(() => {});
    },

    /** 延迟函数 */
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>

<style scoped>
.column-settings-trigger {
  text-align: right;
}

.column-settings {
  max-height: 320px;
  overflow-y: auto;
}

.column-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: bold;
}

.column-item {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-item:last-child {
  border-bottom: none;
}

.column-item .el-checkbox {
  width: 100%;
}
</style>
