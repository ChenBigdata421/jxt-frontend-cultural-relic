<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 使用媒体选择器组件 -->
        <MediaSelector
          ref="mediaSelector"
          :selection-mode="false"
          @add="handleAdd"
          @update="handleUpdate"
          @delete="handleDelete"
          @operation="handleOperation"
          @selection-change="handleSelectionChange"
        >
          <!-- 自定义工具栏 -->
          <template #toolbar>
            <el-col :span="1.5">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
                >新增媒体</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="single"
                @click="handleUpdate"
                >修改</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
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
                icon="el-icon-edit"
                type="primary"
                size="mini"
                @click="onSmartMark"
                >智能标注</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                icon="el-icon-document"
                type="success"
                size="mini"
                @click="onManualMark"
                >手动标注</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                icon="el-icon-close"
                type="danger"
                size="mini"
                @click="onNoMark"
                >标注不是执法视频</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-setting" size="mini" @click="onLog"
                >日志管理</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-show="showDownload"
                icon="el-icon-download"
                type="warning"
                size="mini"
                @click="onDownload"
                >下载</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-show="showTransfer"
                icon="el-icon-s-custom"
                size="mini"
                @click="onTransfer"
                >移交</el-button
              >
            </el-col>
            <el-col :span="1.5">
              <el-button icon="el-icon-save" size="mini" @click="onSaveCols"
                >保存列头</el-button
              >
            </el-col>
          </template>
        </MediaSelector>

        <!-- 下载类型选择对话框 -->
        <el-dialog title="选择下载类型" :visible.sync="downloadDialogVisible">
          <el-form ref="downloadForm">
            <el-form-item label="文件类型">
              <el-radio-group v-model="downloadForm.fileType">
                <el-radio label="3">FLV文件</el-radio>
                <el-radio label="2">MP4文件</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="downloadDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmitDownload"
              >确 定</el-button
            >
          </div>
        </el-dialog>

        <!-- 标注不是执法视频确认对话框 -->
        <el-dialog
          title="标注不是执法视频"
          :visible.sync="noMarkDialogVisible"
          width="400px"
        >
          <div style="text-align: center; padding: 20px">
            <i
              class="el-icon-warning"
              style="font-size: 48px; color: #e6a23c"
            ></i>
            <p style="margin-top: 20px; font-size: 16px">
              确认将选中的媒体标注为非执法视频吗？
            </p>
            <p style="color: #909399; font-size: 14px">
              已选中 {{ ids.length }} 条媒体
            </p>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="noMarkDialogVisible = false">否</el-button>
            <el-button type="primary" @click="confirmNoMark">是</el-button>
          </div>
        </el-dialog>

        <!-- 添加或修改媒体对话框 -->
        <el-dialog
          :title="title"
          :visible.sync="open"
          width="750px"
          :close-on-click-modal="false"
        >
          <div class="form-container">
            <el-form
              ref="form"
              :model="form"
              :rules="rules"
              label-width="120px"
            >
              <!-- 基础信息 -->
              <div class="form-section">
                <div class="form-section-title">基础信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="媒体名称：" prop="mediaName">
                      <el-input
                        v-model="form.mediaName"
                        placeholder="请输入媒体名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="媒体类型：" prop="mediaCate">
                      <el-select
                        v-model="form.mediaCate"
                        placeholder="请选择媒体类型"
                        class="full-width"
                      >
                        <el-option
                          v-for="dict in mediaCateOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="parseInt(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="单位组织：" prop="orgId">
                      <treeselect
                        v-model="form.orgId"
                        :options="orgOptions"
                        placeholder="请选择单位组织"
                        @select="handleFormOrgSelect"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="拍摄警员：" prop="policeId">
                      <el-select
                        v-model="form.policeId"
                        placeholder="请选择拍摄警员"
                        clearable
                        class="full-width"
                        @change="handleFormPoliceSelect"
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

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="执法仪：" prop="recorderId">
                      <el-select
                        v-model="form.recorderId"
                        placeholder="请选择执法仪"
                        clearable
                        class="full-width"
                      >
                        <el-option
                          v-for="item in lawcameraOptions"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="存储方式：" prop="storageType">
                      <el-select
                        v-model="form.storageType"
                        placeholder="请选择存储方式"
                        class="full-width"
                      >
                        <el-option
                          v-for="dict in storageTypeOptions"
                          :key="dict.value"
                          :label="dict.label"
                          :value="parseInt(dict.value)"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="数据来源：" prop="dataSource">
                      <el-select
                        v-model="form.dataSource"
                        placeholder="请选择数据来源"
                        class="full-width"
                      >
                        <el-option label="采集站" value="0" />
                        <el-option label="采集客户端" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="执法类型：" prop="enforType">
                      <treeselect
                        v-model="form.enforType"
                        :options="enforcementTypeLabel"
                        :normalizer="normalizeEnforcementType"
                        placeholder="请选择执法类型"
                        style="width: 200px"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="认证码：" prop="authKey">
                      <el-input
                        v-model="form.authKey"
                        placeholder="请输认证码"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="媒体后缀：" prop="mediaSuffix">
                      <el-input
                        v-model="form.mediaSuffix"
                        placeholder="请输媒体后缀"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <!-- 时间信息 -->
              <div class="form-section">
                <div class="form-section-title">时间信息</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="拍摄开始时间：" prop="shotTimeStart">
                      <el-date-picker
                        v-model="form.shotTimeStart"
                        type="datetime"
                        placeholder="选择拍摄开始时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="拍摄结束时间：" prop="shotTime">
                      <el-date-picker
                        v-model="form.shotTime"
                        type="datetime"
                        placeholder="选择拍摄结束时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="导入开始时间：" prop="importTimeStart">
                      <el-date-picker
                        v-model="form.importTimeStart"
                        type="datetime"
                        placeholder="选择导入开始时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="导入结束时间：" prop="importTimeEnd">
                      <el-date-picker
                        v-model="form.importTimeEnd"
                        type="datetime"
                        placeholder="选择导入结束时间"
                        value-format="yyyy-MM-ddTHH:mm:ssZ"
                        class="full-width"
                      />
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

        <!-- 一键归档对话框 -->
        <el-dialog
          title="一键归档"
          :visible.sync="archiveDialogVisible"
          width="600px"
          :close-on-click-modal="false"
        >
          <el-form label-width="120px">
            <!-- 媒体基本信息 -->
            <div v-if="currentArchivingMedia" class="media-info-section">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="媒体名称">
                  {{ currentArchivingMedia.mediaName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="媒体类别">
                  {{ currentArchivingMedia.mediaCate || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="警员">
                  {{ currentArchivingMedia.policeName || "-" }}
                </el-descriptions-item>
                <el-descriptions-item label="单位组织">
                  {{ currentArchivingMedia.orgFullName || "-" }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <el-form-item label="归档方式">
              <el-radio-group v-model="archiveType">
                <el-radio label="existing">选择现有档案</el-radio>
                <el-radio label="new">新增档案</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 选择现有档案 -->
            <div v-if="archiveType === 'existing'">
              <el-form-item label="档案编号：">
                <el-input
                  v-model="archiveForm.archiveCode"
                  placeholder="请选择档案"
                  readonly
                  style="width: 300px"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="openArchiveSelector"
                    >选择</el-button
                  >
                </el-input>
              </el-form-item>
            </div>

            <!-- 新增档案 -->
            <div v-if="archiveType === 'new'">
              <el-form-item label="档案标题：">
                <el-input
                  v-model="archiveForm.archiveTitle"
                  placeholder="请输入档案标题"
                  maxlength="255"
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="档案类型：">
                <el-select
                  v-model="archiveForm.archiveType"
                  placeholder="请选择档案类型"
                  style="width: 400px"
                >
                  <el-option
                    v-for="dict in archiveTypeOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="cancelArchive">取 消</el-button>
            <el-button type="primary" @click="submitArchive">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 档案选择对话框 -->
        <ArchiveSelectorDialog
          ref="archiveSelector"
          title="选择档案"
          :visible.sync="archiveSelectorVisible"
          :multiple="false"
          @confirm="confirmSelectArchive"
          @cancel="cancelSelectArchive"
        />

        <!-- 视频播放对话框 -->
        <VideoPlayerDialog
          :visible.sync="videoPlayerVisible"
          :initial-url="currentVideoUrl"
          @close="handleVideoPlayerClose"
        />
        <!-- 任务处理对话框 -->
        <el-dialog
          :title="'处理任务 - ' + processForm.task_name"
          :visible.sync="taskProcessOpen"
          width="900px"
          append-to-body
        >
          <el-form
            ref="taskProcessForm"
            :model="processForm"
            :rules="processRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="任务名称">
                  <span>{{ processForm.task_name }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="流程名称">
                  <span>{{ processForm.workflow_name }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="优先级">
                  <el-tag v-if="processForm.priority === 'high'" type="danger"
                    >高</el-tag
                  >
                  <el-tag
                    v-else-if="processForm.priority === 'medium'"
                    type="warning"
                    >中</el-tag
                  >
                  <el-tag v-else-if="processForm.priority === 'low'" type="info"
                    >低</el-tag
                  >
                  <span v-else>{{ processForm.priority || "-" }}</span>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 显示驳回信息（如果有） -->
            <el-alert
              v-if="processForm.rejection_info"
              title="任务被驳回"
              type="warning"
              :closable="false"
              style="margin-bottom: 20px"
            >
              <div style="margin-top: 10px">
                <p>
                  <strong>驳回人：</strong
                  >{{ processForm.rejection_info.rejected_by }}
                </p>
                <p>
                  <strong>驳回时间：</strong
                  >{{ processForm.rejection_info.rejected_at }}
                </p>
                <p>
                  <strong>驳回原因：</strong
                  >{{ processForm.rejection_info.rejection_reason }}
                </p>
              </div>
            </el-alert>

            <!-- 显示所有前序任务的处理历史 -->
            <div
              v-if="
                processForm.previous_tasks_history &&
                processForm.previous_tasks_history.length > 0
              "
              style="margin-bottom: 20px"
            >
              <el-divider>流程处理历史</el-divider>
              <el-timeline>
                <el-timeline-item
                  v-for="(
                    taskHistory, index
                  ) in processForm.previous_tasks_history"
                  :key="index"
                  :timestamp="taskHistory.completed_at"
                  placement="top"
                >
                  <el-card shadow="hover" style="margin-bottom: 10px">
                    <div
                      slot="header"
                      style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                      "
                    >
                      <span style="font-weight: bold; font-size: 16px">
                        {{ index + 1 }}. {{ taskHistory.task_name }}
                      </span>
                      <el-tag
                        :type="
                          taskHistory.result === '通过' ||
                          taskHistory.result === '完成'
                            ? 'success'
                            : 'danger'
                        "
                        size="small"
                      >
                        {{ taskHistory.result }}
                      </el-tag>
                    </div>

                    <!-- 处理意见 -->
                    <div v-if="taskHistory.comment" style="margin-bottom: 15px">
                      <div
                        style="
                          color: #909399;
                          font-size: 12px;
                          margin-bottom: 5px;
                        "
                      >
                        处理意见：
                      </div>
                      <div
                        style="
                          padding: 10px;
                          background-color: #f5f7fa;
                          border-radius: 4px;
                          color: #606266;
                        "
                      >
                        {{ taskHistory.comment }}
                      </div>
                    </div>

                    <!-- 表单字段数据 -->
                    <div
                      v-if="
                        taskHistory.output &&
                        Object.keys(taskHistory.output).length > 0
                      "
                    >
                      <div
                        style="
                          color: #909399;
                          font-size: 12px;
                          margin-bottom: 5px;
                        "
                      >
                        提交信息：
                      </div>
                      <el-descriptions :column="2" border size="small">
                        <el-descriptions-item
                          v-for="(value, key) in taskHistory.output"
                          :key="key"
                          :label="getFieldLabel(key)"
                        >
                          <template v-if="typeof value === 'boolean'">
                            <el-tag v-if="value" type="success">是</el-tag>
                            <el-tag v-else type="info">否</el-tag>
                          </template>
                          <template v-else>
                            {{ value }}
                          </template>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>

                    <!-- 处理人信息 -->
                    <div
                      style="margin-top: 10px; color: #909399; font-size: 12px"
                    >
                      处理人：{{ taskHistory.assignee }}
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>

            <!-- 根据 form_fields 动态生成表单 -->
            <el-divider>填写信息</el-divider>

            <template
              v-if="
                processForm.form_fields && processForm.form_fields.length > 0
              "
            >
              <el-form-item
                v-for="field in processForm.form_fields"
                :key="field"
                :label="getFieldLabel(field)"
                :prop="'formData.' + field"
                :required="true"
              >
                <!-- 日期类型字段 -->
                <el-date-picker
                  v-if="getFieldType(field) === 'date'"
                  v-model="processForm.formData[field]"
                  type="date"
                  :placeholder="getFieldPlaceholder(field)"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                />
                <!-- 日期时间类型字段 -->
                <el-date-picker
                  v-else-if="getFieldType(field) === 'datetime'"
                  v-model="processForm.formData[field]"
                  type="datetime"
                  :placeholder="getFieldPlaceholder(field)"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%"
                />
                <!-- 时间类型字段 -->
                <el-time-picker
                  v-else-if="getFieldType(field) === 'time'"
                  v-model="processForm.formData[field]"
                  :placeholder="getFieldPlaceholder(field)"
                  value-format="HH:mm:ss"
                  style="width: 100%"
                />
                <!-- 文本域类型字段 -->
                <el-input
                  v-else-if="getFieldType(field) === 'textarea'"
                  v-model="processForm.formData[field]"
                  type="textarea"
                  :rows="3"
                  :placeholder="getFieldPlaceholder(field)"
                />
                <!-- 默认文本输入框 -->
                <el-input
                  v-else
                  v-model="processForm.formData[field]"
                  :placeholder="getFieldPlaceholder(field)"
                  clearable
                />
              </el-form-item>
            </template>

            <!-- 如果没有定义 form_fields，显示传统的输出数据输入框 -->
            <el-form-item v-else label="输出数据" prop="output">
              <el-input
                v-model="processForm.output"
                type="textarea"
                :rows="4"
                placeholder="请输入输出数据(JSON格式)"
              />
            </el-form-item>

            <!-- 处理意见 -->
            <el-form-item label="处理意见" prop="comment">
              <el-input
                v-model="processForm.comment"
                type="textarea"
                :rows="3"
                placeholder="请输入处理意见"
              />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="success" @click="submitTaskApprove"
              >通过</el-button
            >
            <el-button
              type="danger"
              @click="submitTaskReject"
              :disabled="isFirstTask"
            >
              驳回{{ isFirstTask ? "（第一个任务不可驳回）" : "" }}
            </el-button>
            <el-button @click="taskProcessOpen = false">取消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  delMedia,
  addMedia,
  updateMedia,
  batchDelMedia,
  batchMarkMediaNoEnforcementStatus,
} from "@/api/evidence/evidence_manage_command_api";
import {
  getMedia,
  getEnforcementTypeTree,
} from "@/api/evidence/evidence_manage_query_api";
import { orgTreeSelect } from "@/api/admin/sys-org";
import { listUser } from "@/api/admin/sys-user";
import { getEquipmentLawcameraList } from "@/api/admin/equipment_manage_api";
import {
  addArchive,
  addArchiveMediaRelation,
} from "@/api/evidence/archive_api";
import { listWorkflows, getWorkflow } from "@/api/process/workflow";
import { startInstance } from "@/api/process/instance";
import {
  listMyTodoTasks,
  getTask,
  approveTask,
  rejectTask,
} from "@/api/process/task";
import MediaSelector from "@/components/MediaSelector";
import ArchiveSelectorDialog from "@/components/ArchiveSelectorDialog";
import VideoPlayerDialog from "@/components/VideoPlayerDialog";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "MediaManage",
  components: {
    MediaSelector,
    ArchiveSelectorDialog,
    VideoPlayerDialog,
    Treeselect,
  },
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 是否显示下载文件类型选择对话框
      downloadDialogVisible: false,
      downloadForm: {
        fileType: "",
      },
      // 是否显示标注不是执法视频对话框
      noMarkDialogVisible: false,
      showDownload: false,
      showTransfer: false,
      // 一键归档相关
      archiveDialogVisible: false,
      archiveType: "existing", // 'existing' 或 'new'
      archiveForm: {
        archiveCode: "",
        archiveId: "",
        archiveTitle: "",
        archiveType: undefined,
      },
      currentArchivingMedia: null, // 当前要归档的媒体
      archiveSelectorVisible: false,
      // 档案类型选项
      archiveTypeOptions: [
        { label: "案件档案", value: 1 },
        { label: "证据档案", value: 2 },
        { label: "执法档案", value: 3 },
        { label: "其他档案", value: 4 },
      ],
      // 视频播放相关
      videoPlayerVisible: false,
      currentVideoUrl: "",
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 组织树选项
      orgOptions: undefined,
      // 用户选项
      userOptions: [],
      // 执法仪选项
      lawcameraOptions: [],
      // 媒体类型数据字典
      mediaCateOptions: [],
      // 表单校验
      rules: {
        mediaName: [
          { required: true, message: "媒体名称不能为空", trigger: "blur" },
        ],
        mediaCate: [
          { required: true, message: "媒体类型不能为空", trigger: "change" },
        ],
      },
      // 工作流相关
      deleteWorkflowId: null, // 文档删除申请流程ID
      currentDeleteMedia: null, // 当前要删除的媒体
      // 任务处理对话框
      taskProcessOpen: false,
      currentTaskId: null,
      currentTask: null,
      isFirstTask: false,
      processForm: {},
      processRules: {
        comment: [
          { required: true, message: "处理意见不能为空", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    "form.orgId": function (newVal) {
      // 当表单中的组织ID变化时，自动获取该组织的用户列表
      if (newVal) {
        this.handleFormOrgSelect({ id: newVal });
      }
    },
  },
  created() {
    this.getTreeselect();
    this.getEnforcementTypeTreeselect();
    this.getDicts("evidence_media_type").then((response) => {
      this.mediaCateOptions = response.data;
    });
    this.getDicts("evidence_storage_type").then((response) => {
      this.storageTypeOptions = response.data;
    });
    this.getDicts("relation_status").then((response) => {
      this.mediaRelationStatusOptions = response.data;
    });
  },
  methods: {
    // 字典状态字典翻译
    relationStatusFormat(row) {
      return this.selectDictLabel(
        this.mediaRelationStatusOptions,
        parseInt(row.isAssociated)
      );
    },

    /** 获取执法类型树形数据 */
    getEnforcementTypeTreeselect() {
      getEnforcementTypeTree()
        .then((response) => {
          this.enforcementTypeLabel = response.data.list || response.data || [];
        })
        .catch(() => {
          // 如果树形接口不存在，设置为空数组
          this.enforcementTypeLabel = [];
        });
    },

    /** 执法类型数据结构转换 当你的数据格式与 vue-treeselect 默认期望的格式不一致时，使用 normalizer 进行格式转换*/
    normalizeEnforcementType(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id, // 将你数据中的 node.id 映射为 vue-treeselect 的id
        label: node.enforcementTypeName || node.label || "未知", // 将你数据中的 node.enforcementTypeName 映射为 vue-treeselect 的label
        children: node.children, // 将你的数据中的 children 映射为 children
      };
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.mediaId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    onSmartMark() {
      // 智能标注逻辑
    },
    onManualMark() {
      // 手动标注逻辑
    },
    onNoMark() {
      if (this.multiple) {
        this.$message.warning("请至少选择一条媒体数据");
        return;
      }
      this.noMarkDialogVisible = true;
    },
    confirmNoMark() {
      const mediaIds = this.ids;
      batchMarkMediaNoEnforcementStatus({
        ids: mediaIds,
        isNonEnforcementMedia: 1,
      })
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("标注成功");
            this.noMarkDialogVisible = false;
            // 刷新列表
            setTimeout(() => {
              this.$refs.mediaSelector.refresh();
            }, 2000);
          } else {
            this.msgError(response.msg || "标注失败");
          }
        })
        .catch((error) => {
          this.msgError("标注失败：" + (error.message || "未知错误"));
        });
    },
    onLog() {
      // 日志管理逻辑
    },
    onDownload() {
      this.downloadDialogVisible = true;
    },
    onTransfer() {
      // 移交逻辑
    },
    onSaveCols() {
      // 保存列头逻辑
    },
    onSubmitDownload() {
      // 提交下载逻辑
      this.downloadDialogVisible = false;
    },

    // 表单重置
    reset() {
      this.form = {
        mediaName: undefined,
        mediaCate: undefined,
        policeId: undefined,
        orgId: undefined,
        recorderId: undefined,
        storageType: undefined,
        dataSource: undefined,
        enforType: undefined,
        mediaSuffix: undefined,
        shotTimeStart: undefined,
        shotTime: undefined,
        importTimeStart: undefined,
        importTimeEnd: undefined,
      };
      // 重置下拉选项
      this.userOptions = [];
      this.lawcameraOptions = [];
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加媒体";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const mediaId = row.id || this.ids[0];
      getMedia(mediaId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改媒体";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateMedia(this.form, this.form.id).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.$refs.mediaSelector.refresh();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addMedia(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess(response.msg);
                this.open = false;
                this.$refs.mediaSelector.refresh();
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
      // 只支持单个删除
      const mediaId = row.id || this.ids[0];

      if (this.ids.length > 1) {
        this.msgWarning("删除操作需要通过工作流审批，暂不支持批量删除");
        return;
      }

      // 保存当前要删除的媒体信息
      this.currentDeleteMedia = row;

      // 查询工作流列表，找到"文档删除申请流程"
      this.startDeleteWorkflow(mediaId);
    },

    handleOperation(row, action) {
      // 操作按钮逻辑
      console.log("操作", row, action);
      if (action === "edit") {
        // 一键归档
        this.handleQuickArchive(row);
      } else if (action === "play") {
        // 播放视频
        this.handlePlayVideo(row);
      }
      if (action === "delete") {
        // 删除
        this.handleDelete(row);
      }
    },

    /** 播放视频 */
    handlePlayVideo(row) {
      console.log("播放视频", row);
      // 这里可以根据row中的信息构建视频URL
      // 暂时设置为空，让用户手动输入
      this.currentVideoUrl = "";
      this.videoPlayerVisible = true;
    },

    /** 视频播放器关闭 */
    handleVideoPlayerClose() {
      this.currentVideoUrl = "";
    },

    /** 一键归档 */
    handleQuickArchive(row) {
      this.currentArchivingMedia = row;
      this.archiveType = "existing";
      this.archiveForm = {
        archiveCode: "",
        archiveId: "",
        archiveTitle: "",
        archiveType: undefined,
      };
      this.archiveDialogVisible = true;
    },

    /** 取消归档 */
    cancelArchive() {
      this.archiveDialogVisible = false;
      this.currentArchivingMedia = null;
      this.archiveForm = {
        archiveCode: "",
        archiveId: "",
        archiveTitle: "",
        archiveType: undefined,
      };
    },

    /** 打开档案选择对话框 */
    openArchiveSelector() {
      this.archiveSelectorVisible = true;
    },

    /** 确认选择档案 */
    confirmSelectArchive(selectedArchives) {
      if (selectedArchives && selectedArchives.length > 0) {
        const archive = selectedArchives[0];
        this.archiveForm.archiveCode = archive.archiveCode;
        this.archiveForm.archiveId = archive.archiveId;
      }
      this.archiveSelectorVisible = false;
    },

    /** 取消选择档案 */
    cancelSelectArchive() {
      this.archiveSelectorVisible = false;
    },

    /** 提交归档 */
    submitArchive() {
      if (!this.currentArchivingMedia) {
        this.msgError("未选择要归档的媒体");
        return;
      }

      if (this.archiveType === "existing") {
        // 选择现有档案
        if (!this.archiveForm.archiveCode) {
          this.msgError("请选择档案");
          return;
        }
        this.linkMediaToArchive();
      } else {
        // 新增档案
        if (!this.archiveForm.archiveTitle) {
          this.msgError("请输入档案标题");
          return;
        }
        if (!this.archiveForm.archiveType) {
          this.msgError("请选择档案类型");
          return;
        }
        this.createArchiveAndLink();
      }
    },

    /** 关联媒体到现有档案 */
    linkMediaToArchive() {
      const data = {
        archiveId: this.archiveForm.archiveId,
        mediaId:
          this.currentArchivingMedia.mediaId || this.currentArchivingMedia.id,
      };

      addArchiveMediaRelation(data)
        .then((response) => {
          if (response.code === 200) {
            this.msgSuccess("归档成功");
            this.archiveDialogVisible = false;
            this.$refs.mediaSelector.refresh();
          } else {
            this.msgError(response.msg || "归档失败");
          }
        })
        .catch((error) => {
          this.msgError("归档失败：" + (error.message || "未知错误"));
        });
    },

    /** 创建新档案并关联 */
    createArchiveAndLink() {
      const archiveData = {
        archiveTitle: this.archiveForm.archiveTitle,
        archiveType: this.archiveForm.archiveType,
        storageDuration: 120, // 默认保存期限120个月
      };

      // 先创建档案
      addArchive(archiveData)
        .then((response) => {
          if (response.code === 200) {
            // 档案创建成功，获取档案ID和编码
            this.archiveForm.archiveId = response.data;
            // 然后关联媒体
            return this.linkMediaToArchive();
          } else {
            this.msgError(response.msg || "创建档案失败");
            return Promise.reject(new Error(response.msg));
          }
        })
        .catch((error) => {
          this.msgError("创建档案失败：" + (error.message || "未知错误"));
        });
    },

    /** 查询组织下拉树结构 */
    getTreeselect() {
      orgTreeSelect().then((response) => {
        this.orgOptions = response.data;
      });
    },

    /** 查询条件-组织选择事件 */
    handleOrgSelect(node) {
      if (node) {
        listUser({ orgId: "/" + node.id + "/" }).then((response) => {
          this.userOptions = response.data.list;
        });
      } else {
        this.userOptions = [];
      }
    },

    /** 表单-组织选择事件 */
    handleFormOrgSelect(node) {
      if (node) {
        listUser({ orgId: "/" + node.id + "/" }).then((response) => {
          this.userOptions = response.data.list;
        });
        // 清空警员和执法仪选择
        this.form.policeId = undefined;
        this.form.recorderId = undefined;
        this.lawcameraOptions = [];
      } else {
        this.userOptions = [];
        this.form.policeId = undefined;
        this.form.recorderId = undefined;
        this.lawcameraOptions = [];
      }
    },

    /** 表单-警员选择事件 */
    handleFormPoliceSelect(policeId) {
      if (policeId) {
        // 根据警员ID获取其管理的执法仪列表
        getEquipmentLawcameraList({ managerId: policeId }).then((response) => {
          this.lawcameraOptions = response.data.list || [];
        });
        // 清空执法仪选择
        this.form.recorderId = undefined;
      } else {
        this.lawcameraOptions = [];
        this.form.recorderId = undefined;
      }
    },

    /** 启动删除工作流 */
    startDeleteWorkflow(mediaId) {
      let instanceId = null;

      // 查询工作流列表
      listWorkflows({ limit: 100, offset: 0 })
        .then((response) => {
          if (response.code === 200) {
            const workflows = response.data.items || response.data || [];
            // 查找名称为"文档删除申请流程"的工作流
            const deleteWorkflow = workflows.find(
              (wf) => wf.name === "文档删除申请流程"
            );

            if (!deleteWorkflow) {
              this.msgError('未找到"文档删除申请流程"工作流，请先创建该工作流');
              return;
            }

            this.deleteWorkflowId = deleteWorkflow.id;

            // 创建工作流实例
            const instanceData = {
              workflow_id: deleteWorkflow.id,
              input: JSON.stringify({
                media_id: mediaId,
                media_name: this.currentDeleteMedia?.mediaName || "",
                applicant: this.$store.state.user.name || "当前用户",
              }),
            };

            return startInstance(instanceData);
          } else {
            this.msgError(response.msg || "查询工作流失败");
            throw new Error(response.msg || "查询工作流失败");
          }
        })
        .then((instanceResponse) => {
          if (instanceResponse && instanceResponse.code === 200) {
            instanceId = instanceResponse.data.id || instanceResponse.data;
            this.msgSuccess("工作流实例创建成功，正在查询任务...");

            // 后端会自动创建第一个任务，查询待办任务列表
            // 稍微延迟一下，确保后端任务已创建
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(listMyTodoTasks({ limit: 100, offset: 0 }));
              }, 500);
            });
          } else {
            this.msgError(instanceResponse.msg || "创建工作流实例失败");
            throw new Error(instanceResponse.msg || "创建工作流实例失败");
          }
        })
        .then((todoResponse) => {
          if (todoResponse && todoResponse.code === 200) {
            const tasks = todoResponse.data.items || todoResponse.data || [];

            // 查找刚创建的任务（通过实例ID匹配）
            const newTask = tasks.find(
              (task) => task.instance_id === instanceId
            );

            if (!newTask) {
              this.msgError("未找到刚创建的任务，请稍后在待办任务中查看");
              throw new Error("未找到刚创建的任务");
            }

            this.msgSuccess("找到任务，正在打开处理对话框...");

            // 打开任务处理对话框
            this.handleProcessTask(newTask.id);
          } else {
            this.msgError(todoResponse.msg || "查询待办任务失败");
            throw new Error(todoResponse.msg || "查询待办任务失败");
          }
        })
        .catch((error) => {
          if (error.message) {
            console.error("启动删除工作流失败:", error);
          }
        });
    },

    /** 处理任务 */
    handleProcessTask(taskId) {
      this.currentTaskId = taskId;

      // 获取任务详情
      getTask(taskId)
        .then((response) => {
          if (response.code === 200) {
            const task = response.data;
            this.currentTask = task;

            // 获取工作流定义以判断是否是第一个任务
            return getWorkflow(task.workflow_id);
          } else {
            this.msgError(response.msg || "获取任务详情失败");
            throw new Error(response.msg || "获取任务详情失败");
          }
        })
        .then((workflowResponse) => {
          if (workflowResponse.code === 200) {
            const task = this.currentTask;
            const workflow = workflowResponse.data;

            // 解析工作流定义
            let definition = {};
            try {
              definition =
                typeof workflow.definition === "string"
                  ? JSON.parse(workflow.definition)
                  : workflow.definition;
            } catch (e) {
              console.error("解析工作流定义失败:", e);
            }

            // 判断是否是第一个任务
            if (definition.steps && definition.steps.length > 0) {
              const firstStepId = definition.steps[0].id;
              this.isFirstTask = task.task_key === firstStepId;
            } else {
              this.isFirstTask = false;
            }

            // 解析 form_data
            let formDataObj = {};
            if (task.form_data) {
              try {
                if (typeof task.form_data === "string") {
                  formDataObj = JSON.parse(task.form_data);
                } else if (typeof task.form_data === "object") {
                  formDataObj = task.form_data;
                }
              } catch (e) {
                console.error("解析 form_data 失败:", e);
              }
            }

            // 解析 form_fields
            let formFields = [];
            if (formDataObj && formDataObj.form_fields) {
              formFields = formDataObj.form_fields;
            }

            // 初始化表单数据对象
            const formData = {};
            formFields.forEach((field) => {
              const fieldType = this.getFieldTypeForInit(field);
              if (fieldType === "boolean") {
                formData[field] = false;
              } else if (fieldType === "number") {
                formData[field] = null;
              } else {
                formData[field] = "";
              }
            });

            // 解析任务数据
            let taskData = {};
            let rejectionInfo = null;
            let previousTasksHistory = [];

            if (task.task_data) {
              try {
                if (typeof task.task_data === "string") {
                  taskData = JSON.parse(task.task_data);
                  if (typeof taskData === "string") {
                    taskData = JSON.parse(taskData);
                  }
                } else if (
                  typeof task.task_data === "object" &&
                  task.task_data !== null
                ) {
                  taskData = task.task_data;
                }

                if (taskData.rejected_by) {
                  rejectionInfo = {
                    rejected_by: taskData.rejected_by,
                    rejected_at: taskData.rejected_at,
                    rejection_reason: taskData.rejection_reason,
                    rejected_task_id: taskData.rejected_task_id,
                  };
                }

                if (
                  taskData.previous_tasks_history &&
                  Array.isArray(taskData.previous_tasks_history)
                ) {
                  previousTasksHistory = taskData.previous_tasks_history;
                }
              } catch (e) {
                console.error("解析任务数据失败:", e);
                taskData = {};
              }
            }

            const finalTaskData =
              taskData && typeof taskData === "object" ? taskData : {};

            this.processForm = {
              task_name: task.task_name,
              workflow_name: task.workflow_name,
              priority: task.priority || "medium",
              task_data: finalTaskData,
              previous_tasks_history: previousTasksHistory,
              form_fields: formFields,
              formData: formData,
              comment: "",
              output: "",
              rejection_info: rejectionInfo,
            };

            // 动态生成表单验证规则
            this.generateFormRules(formFields);

            this.taskProcessOpen = true;
          } else {
            this.msgError(workflowResponse.msg || "获取工作流定义失败");
          }
        })
        .catch((error) => {
          if (error.message) {
            this.msgError("获取任务详情失败：" + error.message);
          }
        });
    },

    /** 提交审批通过 */
    submitTaskApprove() {
      this.$refs["taskProcessForm"].validate((valid) => {
        if (valid) {
          // 构建输出数据
          let outputData = "";
          if (
            this.processForm.form_fields &&
            this.processForm.form_fields.length > 0
          ) {
            outputData = JSON.stringify(this.processForm.formData);
          } else {
            outputData = this.processForm.output || "{}";
          }

          const data = {
            comment: this.processForm.comment || "审批通过",
            output: outputData,
          };

          approveTask(this.currentTaskId, data)
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("审批通过");
                this.taskProcessOpen = false;
                this.$refs.mediaSelector.refresh();
              } else {
                this.msgError(response.msg || "审批失败");
              }
            })
            .catch((error) => {
              this.msgError("审批失败：" + (error.message || "未知错误"));
            });
        }
      });
    },

    /** 提交审批驳回 */
    submitTaskReject() {
      this.$refs["taskProcessForm"].validate((valid) => {
        if (valid) {
          this.$confirm("确认驳回该任务吗？", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              const data = {
                comment: this.processForm.comment,
                reason: this.processForm.comment,
              };
              return rejectTask(this.currentTaskId, data);
            })
            .then((response) => {
              if (response.code === 200) {
                this.msgSuccess("已驳回");
                this.taskProcessOpen = false;
                this.$refs.mediaSelector.refresh();
              } else {
                this.msgError(response.msg || "驳回失败");
              }
            })
            .catch((error) => {
              if (error !== "cancel") {
                this.msgError("驳回失败：" + (error.message || "未知错误"));
              }
            });
        }
      });
    },

    /** 获取字段标签 */
    getFieldLabel(field) {
      const labelMap = {
        applicant: "申请人",
        description: "描述",
        comment: "备注",
        reason: "原因",
        media_id: "媒体编号",
        media_name: "媒体名称",
        delete_reason: "删除原因",
        approval_opinion: "审批意见",
      };

      if (labelMap[field]) {
        return labelMap[field];
      }

      // 智能转换
      const parts = field.split("_");
      const wordMap = {
        id: "ID",
        name: "名称",
        type: "类型",
        date: "日期",
        time: "时间",
        reason: "原因",
        comment: "意见",
        description: "描述",
        media: "媒体",
        delete: "删除",
        approval: "审批",
        opinion: "意见",
      };

      const translated = parts
        .map((part) => wordMap[part.toLowerCase()] || part)
        .join("");
      return translated || field;
    },

    /** 获取字段类型 */
    getFieldType(field) {
      const fieldLower = field.toLowerCase();

      if (fieldLower.includes("date") && !fieldLower.includes("time")) {
        return "date";
      }

      if (fieldLower.includes("datetime") || fieldLower.includes("_at")) {
        return "datetime";
      }

      if (fieldLower.includes("time") && !fieldLower.includes("datetime")) {
        return "time";
      }

      if (
        fieldLower.includes("description") ||
        fieldLower.includes("reason") ||
        fieldLower.includes("comment") ||
        fieldLower.includes("opinion")
      ) {
        return "textarea";
      }

      return "text";
    },

    /** 获取字段占位符 */
    getFieldPlaceholder(field) {
      const fieldType = this.getFieldType(field);
      const fieldLabel = this.getFieldLabel(field);

      const placeholderMap = {
        date: `请选择${fieldLabel}`,
        datetime: `请选择${fieldLabel}`,
        time: `请选择${fieldLabel}`,
        textarea: `请输入${fieldLabel}`,
        text: `请输入${fieldLabel}`,
      };

      return placeholderMap[fieldType] || `请输入${fieldLabel}`;
    },

    /** 获取字段类型（用于初始化） */
    getFieldTypeForInit(field) {
      return this.getFieldType(field);
    },

    /** 动态生成表单验证规则 */
    generateFormRules(formFields) {
      this.processRules = {
        comment: [
          { required: true, message: "处理意见不能为空", trigger: "blur" },
        ],
      };

      if (formFields && formFields.length > 0) {
        formFields.forEach((field) => {
          const fieldLabel = this.getFieldLabel(field);
          const fieldType = this.getFieldType(field);

          if (fieldType === "boolean") {
            return;
          }

          this.processRules[`formData.${field}`] = [
            {
              required: true,
              message: `${fieldLabel}不能为空`,
              trigger: "blur",
            },
          ];
        });
      }
    },
  },
};
</script>

<style scoped>
.video-management {
  padding: 20px;
}

.head-bars {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.horizontal-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-container {
  padding: 10px 20px;
}

.form-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.form-section-title {
  font-size: 16px;
  color: #409eff;
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

/* 媒体信息区域样式 */
.media-info-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

/* Treeselect组件样式 */
.vue-treeselect {
  width: 100%;
}

.vue-treeselect__control {
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.vue-treeselect__placeholder {
  color: #c0c4cc;
}

.vue-treeselect__single-value {
  color: #606266;
}
</style>
