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
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="报警人姓名" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入报警人姓名"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="警情标题" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入警情标题"
              clearable
              style="width: 170px;"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="处警组织" prop="orgId">
            <treeselect
              v-model="queryParams.orgId"
              :options="orgOptions"
              placeholder="请选择处警组织"
              style="width: 170px;"
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
              style="width: 170px;"
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
            <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 170px;">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px;"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:lawcamera:create']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:lawcamera:edit']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:lawcamera:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['incidentrecord:lawcamera:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出</el-button>
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
          v-loading="loading"
          :data="incidentRecordList"
          border
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChang"
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为"v-bind"或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column prop="code" label="警情号" width="80" />
          <el-table-column prop="name" label="报警人姓名" width="100" />
          <el-table-column prop="title" label="警情标题" width="80" />
          <el-table-column prop="tel" label="报警电话" width="150" />
          <el-table-column prop="address" label="警情地址" width="150" />
          <el-table-column prop="processPoliceNames" label="处警人" width="100" />
          <el-table-column prop="orgPaths" label="处警组织" width="100" />
          <el-table-column prop="result" label="处警结果" width="100" />
          <el-table-column prop="superviseType" label="警情监督类型" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isRelation" label="是否关联" width="100">
            <!--作用域插槽实际上就是被使用的插槽向使用者传递信息，scope是一个对象，封装了来自el-table-column组件返回的信息-->
            <template slot-scope="scope">
              <!--这是一个条件表达式，用于动态设置 <el-tag> 的类型。如果 status 等于 1，则标签的类型为 'danger'（通常显示为红色），
                否则为 'success'（通常显示为绿色）。-->
              <el-tag
                disable-transitions
              >{{ relationStatusFormat(scope.row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="220"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['incidentrecord:lawcamera:browse']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row)"
              >浏览</el-button>
              <el-button
                v-permisaction="['incidentrecord:lawcamera:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-permisaction="['incidentrecord:lawcamera:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
              <el-button
                v-permisaction="['incidentrecord:lawcamera:link']"
                size="mini"
                type="text"
                icon="el-icon-link"
                @click="handleLinkMedia(scope.row)"
              >关联媒体</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
        <!-- 添加或修改警情对话框 -->
        <!--:close-on-click-modal="false"：这是 Element UI el-dialog 组件的一个属性，
          用于控制点击遮罩层时是否关闭对话框。当设置为 false 时，点击遮罩层不会关闭对话框。-->
        <!--:show-count="true"：这个 prop 指示 treeselect 组件在节点旁边显示其子节点的数量。-->
        <el-dialog :title="title" :visible.sync="open" width="750px" :close-on-click-modal="false">
          <div class="form-container">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
              <!-- 基础信息 -->
              <div class="form-section">
                <div class="form-section-title">基础信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="报警人姓名：" prop="name">
                      <el-input v-model="form.name" placeholder="请输入报警人姓名" />
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
                      <el-input v-model="form.title" placeholder="请输入警情标题" />
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
                      <el-input v-model="form.address" placeholder="请输入报警地址" />
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
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
                      <el-select v-model="form.superviseType" placeholder="请选择" class="full-width">
                        <el-option label="类型一" value="1" />
                        <el-option label="类型二" value="2" />
                        <el-option label="类型三" value="3" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="处警结果：" prop="result">
                      <el-input v-model="form.result" placeholder="请输入处警结果" />
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
                        >{{ dict.label }}</el-radio>
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
        <el-dialog :title="title" :visible.sync="ViewOpen" width="593px" :close-on-click-modal="false">
          <el-table
            v-loading="loading"
            :data="AttributeValueList"
            border
          >
            <el-table-column prop="AttributeName" label="属性" width="100" align="center" />
            <el-table-column prop="Value" label="值" width="450" align="center" />
          </el-table>
        </el-dialog>

        <!--关联媒体对话框-->
        <el-dialog title="关联媒体" :visible.sync="linkMediaOpen" width="1400px" :close-on-click-modal="false">
          <!-- 查询条件 -->
          <el-form :inline="true" ref="mediaQueryForm" :model="mediaQueryParams" class="demo-form-inline" size="small">
            <el-form-item label="拍摄时间">
              <el-date-picker
                v-model="mediaQueryParams.shotTimeStart"
                type="datetime"
                placeholder="请选择时间">
              </el-date-picker>
              <span>至</span>
              <el-date-picker
                v-model="mediaQueryParams.shotTimeEnd"
                type="datetime"
                placeholder="请选择时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="单位组织">
              <div class="horizontal-container">
                <treeselect
                  v-model="mediaQueryParams.orgId"
                  :options="orgOptions"
                  placeholder="请选择单位组织"
                  style="width: 200px;"
                  clearable
                  @select="handleMediaOrgSelect"
                />
                <el-checkbox v-model="mediaQueryParams.includeSubUnits">包含下级</el-checkbox>
              </div>
            </el-form-item>
            <el-form-item label="拍摄警员">
              <el-select
                v-model="mediaQueryParams.policeId"
                placeholder="请选择拍摄警员"
                clearable
                style="width: 200px;"
                @change="handleMediaPoliceSelect"
              >
                <el-option
                  v-for="item in mediaUserOptions"
                  :key="item.userId"
                  :label="item.userName"
                  :value="item.userId"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="default" icon="el-icon-more" size="mini" @click="toggleMediaMore">更多</el-button>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleMediaQuery">查询</el-button>
              <el-button type="default" icon="el-icon-refresh" size="mini" @click="resetMediaQuery">重置</el-button>
            </el-form-item>
            <!-- 更多查询条件 -->
            <el-form-item label="媒体类型" prop="mediaCate">
              <el-select
                v-model="mediaQueryParams.mediaCate"
                placeholder="媒体类型"
                clearable
                size="small"
                style="width: 160px"
              >
                <el-option
                  v-for="dict in mediaCateOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="parseInt(dict.value)"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="导入时间">
              <el-date-picker
                v-model="mediaQueryParams.importTimeStart"
                type="datetime"
                placeholder="请选择时间">
              </el-date-picker>
              <span>至</span>
              <el-date-picker
                v-model="mediaQueryParams.importTimeEnd"
                type="datetime"
                placeholder="请选择时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="执法仪编号">
              <el-input v-model="mediaQueryParams.recorderId" placeholder="请输入执法仪编号" />
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="数据来源">
              <el-select v-model="mediaQueryParams.dataSource" placeholder="请选择">
                <el-option label="采集站" value="0" />
                <el-option label="采集客户端" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="存储方式" prop="storageType">
              <el-select
                v-model="mediaQueryParams.storageType"
                placeholder="存储方式"
                clearable
                size="small"
                style="width: 160px"
              >
                <el-option
                  v-for="dict in storageTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="执法类型">
              <treeselect
                v-model="mediaQueryParams.enforType"
                :options="enforcementTypeOptions"
                :normalizer="normalizeEnforcementType"
                placeholder="请选择执法类型"
                style="width: 200px;"
                clearable
              />
            </el-form-item>
            <el-form-item v-if="mediaShowMore" label="媒体名称">
              <el-input v-model="mediaQueryParams.mediaName" placeholder="请输入媒体名称" />
            </el-form-item>
          </el-form>

          <!-- 媒体列表 -->
          <el-table
            v-loading="mediaLoading"
            :data="mediaList"
            border
            @selection-change="handleMediaSelectionChange"
            @sort-change="handleMediaSortChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="shotTimeStart" label="拍摄开始时间" width="170" align="center" sortable="custom" />
            <el-table-column prop="shotTime" label="拍摄结束时间" width="170" align="center" sortable="custom" />
            <el-table-column label="警员" align="center" width="100">
              <template slot-scope="{ row }">
                {{ formatMediaPoliceName(row) }}
              </template>
            </el-table-column>
            <el-table-column label="单位组织" align="center" width="150">
              <template slot-scope="{ row }">
                {{ formatMediaOrgName(row) }}
              </template>
            </el-table-column>
            <el-table-column v-show="false" prop="mediaSuffix" label="媒体后缀" align="center" sortable="custom" />
            <el-table-column v-show="false" prop="mediaName" label="媒体名称" align="center" sortable="custom" />
            <el-table-column v-show="false" prop="createdAt" label="导入时间" width="170" align="center" sortable="custom" />
          </el-table>

          <!-- 分页 -->
          <pagination
            v-show="mediaTotal > 0"
            :total="mediaTotal"
            :page.sync="mediaQueryParams.pageIndex"
            :limit.sync="mediaQueryParams.pageSize"
            @pagination="getMediaList"
          />

          <div slot="footer" class="dialog-footer">
            <el-button @click="cancelLinkMedia">取 消</el-button>
            <el-button type="primary" @click="confirmLinkMedia">确 定</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>
<script>
import { delIncidentRecordById, addIncidentRecord, updateIncidentRecord, batchDelIncidentRecord } from '@/api/evidence/evidence_manage_command_api'
import { getIncidentRecordList, listMedia, getEnforcementTypeTree } from '@/api/evidence/evidence_manage_query_api'
import { formatJson } from '@/utils'
import { orgTreeSelect } from '@/api/admin/sys-org'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listUser } from '@/api/admin/sys-user'
export default {
  name: 'LawCarema',
  components: { Treeselect },
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
      title: '',
      isEdit: false,
      // 是否显示增加警情对话框
      open: false,
      ViewOpen: false,
      // 是否显示关联媒体对话框
      linkMediaOpen: false,
      // 当前选中的警情记录
      currentIncidentRecord: null,
      // 组织树选项
      orgOptions: undefined,
      userOptions: undefined,
      // 媒体相关数据
      mediaLoading: false,
      mediaList: [],
      mediaTotal: 0,
      mediaUserOptions: [],
      mediaCateOptions: [],
      storageTypeOptions: [],
      enforcementTypeOptions: [],
      selectedMediaIds: [],
      mediaShowMore: false,
      mediaOrder: '',
      mediaQueryParams: {
        pageIndex: 1,
        pageSize: 10,
        orderBy: '',
        isDesc: true,
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforType: undefined,
        mediaName: undefined
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        title: undefined,
        orgId: undefined,
        processPoliceIds: undefined,
        status: undefined
      },
      AttributeValueList: [],
      ColumnNameConvert: new Map([
        ['code', '警情号'],
        ['name', '报警人姓名'],
        ['title', '警情标题'],
        ['tel', '报警电话'],
        ['context', '报警内容'],
        ['address', '警情发生地址'],
        ['processPoliceNames', '处警人'],
        ['orgPaths', '处警组织'],
        ['createTime', '创建时间'],
        ['reportTime', '报警时间'],
        ['receiveTime', '接警时间'],
        ['processTime', '处警时间'],
        ['endTime', '处警结束时间'],
        ['result', '处警结果'],
        ['superviseType', '警情监督情况类型'],
        ['status', '警情状态'],
        ['isRelation', '是否已关联']
      ]),
      // 表单参数
      form: {
      },
      // 表单校验,触发时机（trigger: 'blur'）：当输入框失去焦点（blur 事件）时触发验证。
      rules: {
        no: [
          { required: true, message: '编号不能为空', trigger: 'blur' }
        ]
      }

    }
  },
  watch: {
    'form.orgId': function(newVal) {
      // 当 form.orgId 更新时，调用 getUser
      if (newVal) {
        if (this.firstLoad !== true) { // 首次打开对话框，不需要清空管理人员
          this.form.processPoliceIds = []
        }
        this.firstLoad = false
        this.getFormUser()
      }
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
    this.getDicts('incident_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('incident_relation_status').then(response => {
      this.incidentRelationStatusOptions = response.data
    })
    this.getDicts('evidence_media_type').then(response => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('evidence_storage_type').then(response => {
      this.storageTypeOptions = response.data
    })
    this.getEnforcementTypeTreeselect()
  },
  methods: {
    handleOrgSelect(node) {
      listUser({ orgId: '/' + node.id + '/' }).then(response => {
        this.userOptions = response.data.list
      })
    },

    /** 查询警情列表 */
    getList() {
      this.loading = true
      getIncidentRecordList(this.queryParams).then(response => {
        // 注意：response.data是数组类型，数组的元素是对象
        this.incidentRecordList = response.data.list
        console.log(this.incidentRecordList)
        this.total = response.data.count
        this.loading = false
      })
    },

    // 字典状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, parseInt(row.status))
    },
    // 字典状态字典翻译
    relationStatusFormat(row) {
      return this.selectDictLabel(this.incidentRelationStatusOptions, parseInt(row.isRelation))
    },
    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then(response => {
        this.orgOptions = response.data // 返回数组类型；[id:    label(组织名称):  children []]})，这里将返回所有组织
      })
    },

    getFormUser() {
      return new Promise((resolve, reject) => {
        listUser({ orgId: '/' + this.form.orgId + '/' }).then(response => {
          this.userOptions = response.data.list
          resolve('true')
        }).catch(error => {
          console.error('获取用户失败:', error)
          this.userOptions = []
          reject(error)
        })
      })
    },

    // 表单重置
    reset() {
      this.form = {
      }
      this.resetForm('form')
    },
    /** 重置按钮操作 */
    resetQuery() {
      // 将queryForm中每项元素所绑定的变量置于初始值
      this.resetForm('queryForm')
      this.userOptions = []
      this.handleQuery()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.IncidentRecordIds = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作*/
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加警情'
      this.isEdit = false
    },

    handleSortChang(column, prop, order) {
      prop = column.prop
      order = column.order
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }
      this.getList()
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.firstLoad = true
      // 使用对象展开运算符创建新对象
      this.form = { ...row }
      this.title = '修改警情'
      this.isEdit = true
      this.open = true
      this.getFormUser()
    },
    /** 浏览按钮操作 */
    handleView(row) {
      this.AttributeValueList = []
      Object.keys(row).forEach(key => {
        var attributeName = this.ColumnNameConvert.get(key)
        var value = row[key]
        if (key === 'status') {
          value = this.statusFormat(row)
        }
        if (key === 'isRelation') {
          value = this.relationStatusFormat(row)
        }
        const attributeValue = {
          AttributeName: attributeName,
          Value: value
        }
        if (attributeValue.AttributeName !== undefined) {
          this.AttributeValueList.push(attributeValue)
        }
      })
      this.ViewOpen = true
      this.title = '警情信息'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.state = parseInt(this.form.state)
          this.form.enableUse = parseInt(this.form.enableUse)
          if (this.form.id !== undefined) {
            updateIncidentRecord(this.form, this.form.id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                setTimeout(() => {
                  this.getList()
                }, 1000)
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addIncidentRecord(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                setTimeout(() => {
                  this.getList()
                }, 1000)
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },

    handleDelete(row) {
      // const IncidentRecordId = (row.id && [row.id]) || this.IncidentRecordIds
      var IncidentRecordId
      if (this.IncidentRecordIds.length > 1) {
        IncidentRecordId = this.IncidentRecordIds
      } else {
        IncidentRecordId = row.id || this.IncidentRecordIds[0]
      }
      this.$confirm('是否确认删除警情编号为"' + IncidentRecordId + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        if (Array.isArray(IncidentRecordId)) {
          return batchDelIncidentRecord({ 'ids': IncidentRecordId })
        } else {
          return delIncidentRecordById(IncidentRecordId)
        }
      }).then((response) => {
        setTimeout(() => {
          this.getList()
        }, 1000)
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有警情数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['工程ID', '编号', '名称', 'CPU', '内存', '存储', '网卡', 'USB数量', '操作系统', '购置时间', '版本', '备注']
          const filterVal = ['FactoryId', 'No', 'Name', 'Cpu', 'Memory', 'Disk', 'NetworkCard', 'UsbNum', 'System', 'BuyTime', 'Version', 'Remark']
          const list = this.incidentRecordList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '警情列表',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    },

    /** 获取执法类型树形数据 */
    getEnforcementTypeTreeselect() {
      getEnforcementTypeTree().then(response => {
        this.enforcementTypeOptions = response.data.list || response.data || []
      }).catch(() => {
        this.enforcementTypeOptions = []
      })
    },

    /** 执法类型数据结构转换 */
    normalizeEnforcementType(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.enforcementTypeName || node.label || '未知',
        children: node.children
      }
    },

    /** 关联媒体按钮操作 */
    handleLinkMedia(row) {
      this.currentIncidentRecord = row
      this.linkMediaOpen = true
      this.resetMediaQuery()
      this.getMediaList()
    },

    /** 查询媒体列表 */
    getMediaList() {
      this.mediaLoading = true
      listMedia(this.mediaQueryParams).then(response => {
        this.mediaList = response.data.list || []
        this.mediaTotal = response.data.count || 0
        this.mediaLoading = false
      }).catch(() => {
        this.mediaLoading = false
      })
    },

    /** 媒体查询按钮操作 */
    handleMediaQuery() {
      this.mediaQueryParams.pageIndex = 1
      this.getMediaList()
    },

    /** 媒体重置按钮操作 */
    resetMediaQuery() {
      this.mediaQueryParams = {
        pageIndex: 1,
        pageSize: 10,
        orderBy: '',
        isDesc: true,
        shotTimeStart: undefined,
        shotTimeEnd: undefined,
        orgId: undefined,
        includeSubUnits: true,
        policeId: undefined,
        mediaCate: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined,
        recorderId: undefined,
        dataSource: undefined,
        storageType: undefined,
        enforType: undefined,
        mediaName: undefined
      }
      this.mediaUserOptions = []
      this.selectedMediaIds = []
      this.mediaShowMore = false
      if (this.$refs.mediaQueryForm) {
        this.$refs.mediaQueryForm.resetFields()
      }
    },

    /** 媒体更多条件切换 */
    toggleMediaMore() {
      this.mediaShowMore = !this.mediaShowMore
    },

    /** 媒体排序回调函数 */
    handleMediaSortChange(column, prop, order) {
      prop = column.prop
      order = column.order
      if (this.mediaOrder !== '' && this.mediaOrder !== prop + 'Order') {
        this.mediaQueryParams[this.mediaOrder] = undefined
      }
      if (order === 'descending') {
        this.mediaQueryParams[prop + 'Order'] = 'desc'
        this.mediaOrder = prop + 'Order'
      } else if (order === 'ascending') {
        this.mediaQueryParams[prop + 'Order'] = 'asc'
        this.mediaOrder = prop + 'Order'
      } else {
        this.mediaQueryParams[prop + 'Order'] = undefined
      }
      this.getMediaList()
    },

    /** 媒体组织选择事件 */
    handleMediaOrgSelect(node) {
      this.mediaQueryParams.orgId = node ? node.id : undefined
      if (node) {
        listUser({ orgId: '/' + node.id + '/' }).then(response => {
          this.mediaUserOptions = response.data.list
        })
      } else {
        this.mediaUserOptions = []
        this.mediaQueryParams.policeId = undefined
      }
    },

    /** 媒体警员选择事件 */
    handleMediaPoliceSelect(policeId) {
      this.mediaQueryParams.policeId = policeId
    },

    /** 媒体多选框选中数据 */
    handleMediaSelectionChange(selection) {
      this.selectedMediaIds = selection.map(item => item.mediaId || item.id)
    },

    /** 格式化媒体警员姓名 */
    formatMediaPoliceName(row) {
      if (row.policeName) {
        return row.policeName
      }
      if (row.policeNo && this.mediaUserOptions.length > 0) {
        const user = this.mediaUserOptions.find(user => user.userId === row.policeNo || user.userCode === row.policeNo)
        return user ? user.userName : row.policeNo
      }
      return row.policeNo || '-'
    },

    /** 格式化媒体组织名称 */
    formatMediaOrgName(row) {
      if (row.orgPaths) {
        return row.orgPaths
      }
      if (row.orgFullName) {
        return row.orgFullName
      }
      if (row.organizationName) {
        return row.organizationName
      }
      return row.orgId || '-'
    },

    /** 格式化媒体类型 */
    formatMediaType(row) {
      if (this.mediaCateOptions.length > 0) {
        const option = this.mediaCateOptions.find(opt => parseInt(opt.value) === parseInt(row.mediaCate))
        return option ? option.label : row.mediaCate
      }
      return row.mediaCate || '-'
    },

    /** 取消关联媒体 */
    cancelLinkMedia() {
      this.linkMediaOpen = false
      this.currentIncidentRecord = null
      this.selectedMediaIds = []
    },

    /** 确认关联媒体 */
    confirmLinkMedia() {
      if (this.selectedMediaIds.length === 0) {
        this.msgWarning('请选择要关联的媒体')
        return
      }

      // 这里可以调用关联媒体的API
      console.log('关联媒体:', {
        incidentRecordId: this.currentIncidentRecord.id,
        mediaIds: this.selectedMediaIds
      })

      this.msgSuccess(`成功关联 ${this.selectedMediaIds.length} 个媒体`)
      this.linkMediaOpen = false
      this.currentIncidentRecord = null
      this.selectedMediaIds = []
    }
  }
}
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
            border-left: 4px solid #409EFF;
        }
        .form-section-title {
            font-size: 16px;
            color: #409EFF;
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
    </style>
@/api/evidence/evidence_manage_command_api@/api/evidence/evidence_manage_query_api
