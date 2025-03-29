<template>
  <BasicLayout>
  <template #wrapper>
    <el-card class="box-card">
    <!-- 查询条件 -->
    <el-form :inline="true" ref="queryForm" :model="queryParams" class="demo-form-inline" size="small">
      <el-form-item label="拍摄时间">
        <el-date-picker
          v-model="queryParams.shotTimeStart"
          type="datetime"
          placeholder="请选择时间">
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.shotTimeEnd"
          type="datetime"
          placeholder="请选择时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="单位组织">
        <div class="horizontal-container">
        <el-input v-model="queryParams.orgId" placeholder="请选择"></el-input>
        <el-checkbox v-model="queryParams.includeSubUnits">包含下级</el-checkbox>
        </div>
      </el-form-item>

      <el-form-item label="拍摄警员">
        <el-input v-model="queryParams.policeId" placeholder="请选择"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="default" icon="el-icon-more" size="mini" @click="toggleMore">更多</el-button>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
        <el-button type="default" icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>

      </el-form-item>
      <!-- 更多查询条件 -->
      <!-- <el-form-item v-if="showMore" label="媒体类型">
        <el-select v-model="queryParams.mediaCate" placeholder="请选择">
          <el-option label="音频" value="1"></el-option>
          <el-option label="视频" value="2"></el-option>
          <el-option label="照片" value="0"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="媒体类型" prop="mediaCate">
        <el-select
          v-model="queryParams.mediaCate"
          placeholder="媒体类型"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in mediaCateOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showMore" label="导入时间">
        <el-date-picker
          v-model="queryParams.importTimeStart"
          type="datetime"
          placeholder="请选择时间">
        </el-date-picker>
        <span>至</span>
        <el-date-picker
          v-model="queryParams.importTimeEnd"
          type="datetime"
          placeholder="请选择时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="showMore" label="执法仪编号">
        <el-input v-model="queryParams.recordNo" placeholder="请输入执法仪编号"></el-input>
      </el-form-item>
      <el-form-item v-if="showMore" label="数据来源">
        <el-select v-model="queryParams.dataSource" placeholder="请选择">
          <el-option label="采集站" value="0"></el-option>
          <el-option label="采集客户端" value="1"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-if="showMore" label="存储方式">
        <el-select v-model="queryParams.storageType" placeholder="请选择">
          <el-option label="采集站" value="0"></el-option>
          <el-option label="存储服务器" value="1"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item v-if="showMore" label="存储方式" prop="storageType">
        <el-select
          v-model="queryParams.storageType"
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
      <el-form-item v-if="showMore" label="执法类型">
        <el-select v-model="queryParams.enforType" placeholder="请选择">
          <!-- Options由动态数据填充 -->
        </el-select>
      </el-form-item>
      <el-form-item v-if="showMore" label="媒体名称">
        <el-input v-model="queryParams.mediaName" placeholder="请输入媒体名称"></el-input>
      </el-form-item>
    </el-form>

    <!-- 功能菜单 -->
    <el-row :gutter="10" class="mb8">
      <el-button icon="el-icon-edit" type="primary" size="mini" @click="onSmartMark">智能标注</el-button>
      <el-button icon="el-icon-document" type="success" size="mini" @click="onManualMark">手动标注</el-button>
      <el-button icon="el-icon-close" type="danger" size="mini" @click="onNoMark">标注不是执法视频</el-button>
      <el-button icon="el-icon-setting" size="mini" @click="onLog">日志管理</el-button>
      <el-button icon="el-icon-download" type="warning" size="mini" @click="onDownload" v-show="showDownload">下载</el-button>
      <el-button icon="el-icon-s-custom" size="mini" @click="onTransfer" v-show="showTransfer">移交</el-button>
      <el-button icon="el-icon-save" size="mini" @click="onSaveCols">保存列头</el-button>
    </el-row>

<el-table
    v-loading="loading"
    :data="mediaList"
    border
    @selection-change="handleSelectionChange"
    @sort-change="handleSortChange"
  >
    <el-table-column type="selection" width="55" align="center" />
    <el-table-column prop="shotTimeStart" label="拍摄开始时间" width="170" align="center" sortable="custom" />
    <el-table-column prop="shotTime" label="拍摄结束时间" width="170" align="center" sortable="custom" />
    <!-- <el-table-column label="视频时长" width="100" align="center" sortable="custom">
      <template slot-scope="{ row }">
        {{ formatMediaDuration(row.videoDuration) }}
      </template>
    </el-table-column> -->
    <el-table-column prop="policeId" label="警员编号" align="center" v-show="false"/>
    <!-- <el-table-column prop="policeName" label="拍摄警员" align="center"/> -->
    <el-table-column prop="orgId" label="单位组织编号" align="center" sortable="custom" v-show="false" />
    <!-- <el-table-column prop="organizationName" label="单位组织名称" align="center"/> -->
    <!-- <el-table-column label="执法类型" align="center">
      <template slot-scope="{ row }">
        {{ formatEnforType(row) }}
      </template>
    </el-table-column> -->
    <el-table-column prop="mediaSuffix" label="媒体后缀" align="center" sortable="custom" v-show="false" />
    <el-table-column prop="mediaName" label="媒体名称" align="center" sortable="custom" v-show="false" />
    <el-table-column prop="createdAt" label="导入时间" width="170" align="center" sortable="custom" v-show="false" />
    <!-- <el-table-column prop="zipNo" label="身份证号" align="center" v-show="false" />
    <el-table-column prop="siteNo" label="站点编号" align="center" v-show="false" />
    <el-table-column prop="siteName" label="站点名称" align="center" v-show="false" />
    <el-table-column prop="recordNo" label="执法仪编号" align="center" v-show="false" />
    <el-table-column prop="storageWay" label="存储方式" align="center" v-show="false" />
    <el-table-column label="缩略图" width="90" align="center" >
      <template slot-scope="{ row }">
        <img v-if="row.thumbnailUri" @click="handlePlayImg(row)" :src="row.thumbnailUri" style="width: 45px; height: 45px; cursor: pointer;" />
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column label="媒体类型" width="100" align="center" sortable="custom">
      <template slot-scope="{ row }">
        <i
          :class="getMediaCateIcon(row)"
          @click="handlePlay(row)"
          title="点击播放"
          style="cursor: pointer;"
        ></i>
      </template>
    </el-table-column> -->
    <el-table-column  label="操作"  width="60"  align="center">
      <template slot-scope="scope">
        <el-button @click="handleOperation(scope.row)">操作</el-button>
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
        <el-button type="primary" @click="onSubmitDownload">确 定</el-button>
      </div>
    </el-dialog>
    </el-card>
  </template>
  </BasicLayout>
</template>

<script>
import { listMedia, getMedia, delMedia, addMedia, updateMedia } from '@/api/evidence/media'
import { formatJson } from '@/utils'

export default {
  data() {
    return {
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        orderBy: '',
        isDesc: true,
        shotTimeStart: '',
        shotTimeEnd: '',
        orgId: '',
        includeSubUnits: true,
        policeId: '',
        mediaCate: -1,
        importTimeStart: '',
        importTimeEnd: '',
        recordNo: '',
        dataSource: '',
        storageType: '',
        enforType: '',
        mediaName: ''
      },
      showMore: false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 媒体表格数据
      mediaList: [],
      // 媒体类型数据字典
      mediaCateOptions: [],
      // 存储类型数据字典
      storageTypeOptions: [],
      // 是否显示下载文件类型选择对话框
      downloadDialogVisible: false,
      downloadForm: {
        fileType: ''
      },
      showDownload: false,
      showTransfer: false
    }
  },
  created() {
    // this.getList()
    // this.getTreeselect()
    this.getDicts('evidence_media_type').then(response => {
      this.mediaCateOptions = response.data
    })
    this.getDicts('evidence_storage_type').then(response => {
      this.storageTypeOptions = response.data
    })
    // this.getConfigKey('sys_user_initPassword').then(response => {
    //   this.initPassword = response.data.configValue
    // })
  },
  methods: {
    /** 查询媒体列表 */
    getList() {
      this.loading = true
      listMedia(this.queryParams).then(response => {
        this.mediaList = response.data.list
        this.total = response.data.count
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10,
        orderBy: '',
        isDesc: true,
        shotTimeStart: '',
        shotTimeEnd: '',
        orgId: '',
        includeSubUnits: true,
        policeId: '',
        mediaCate: -1,
        importTimeStart: '',
        importTimeEnd: '',
        recordNo: '',
        dataSource: '',
        storageType: '',
        enforType: '',
        mediaName: ''
      }
      this.resetForm('queryForm')
    },
    toggleMore() {
      this.showMore = !this.showMore
    },
    /** 排序回调函数 */
    handleSortChange(column, prop, order) {
      prop = column.prop
      order = column.order
      if (this.order !== '' && this.order !== prop + 'Order') {
        this.queryParams[this.order] = undefined
      }
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
        this.order = prop + 'Order'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
        this.order = prop + 'Order'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }
      this.getList()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    onSmartMark() {
      // 智能标注逻辑
    },
    onManualMark() {
      // 手动标注逻辑
    },
    onNoMark() {
      // 标注不是执法视频逻辑
    },
    onLog() {
      // 日志管理逻辑
    },
    onDownload() {
      this.downloadDialogVisible = true
    },
    onTransfer() {
      // 移交逻辑
    },
    onSaveCols() {
      // 保存列头逻辑
    },
    onSubmitDownload() {
      // 提交下载逻辑
      this.downloadDialogVisible = false
    }
  }
}
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
</style>
