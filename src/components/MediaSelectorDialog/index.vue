<template>
  <!-- 这里的visible是el-dialog的prop -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- custom-list-api是MediaSelector的prop ,Vue 命名规则:模板中使用 kebab-case (短横线), JavaScript 中使用 camelCase (驼峰) ,这是 Vue 的标准做法-->
    <MediaSelector
      ref="mediaSelector"
      :selection-mode="true"
      :multiple="multiple"
      :initial-query="initialQuery"
      :custom-list-api="customListApi"
      @select="handleSelect"
      @selection-change="handleSelectionChange"
    />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import MediaSelector from "@/components/MediaSelector";
import { getUnassociatedMediaList } from "@/api/evidence/case_media_relation_api";
import { getIncidentRecordUnassociatedMediaByIncidentRecord } from "@/api/evidence/evidence_manage_query_api";
import { getUnassociatedMediaByWritId } from "@/api/evidence/writ_media_relation_api";

export default {
  name: "MediaSelectorDialog",
  components: {
    MediaSelector,
  },
  props: {
    // 对话框标题
    title: {
      type: String,
      default: "选择媒体",
    },
    // 对话框宽度
    width: {
      type: String,
      default: "1400px",
    },
    // 是否支持多选
    multiple: {
      type: Boolean,
      default: true,
    },
    // 初始查询参数
    initialQuery: {
      type: Object,
      default: () => ({}),
    },
    // visible是本子组件的prop
    visible: {
      type: Boolean,
      default: false,
    },
    // 当前警情记录（用于检查媒体关联状态）
    currentIncidentRecord: {
      type: Object,
      default: null,
    },
    // 当前案件（用于过滤已关联的媒体）
    currentCase: {
      type: Object,
      default: null,
    },
    // 当前文书（用于过滤已关联的媒体）
    currentWrit: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      selectedMedia: [],
    };
  },
  computed: {
    dialogVisible: {
      // dialogVisible是el-dialog的visible与本组件的visible之间的代理，负责在二者之间传递值
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val); //如果dialogVisible被设置为false，并向父组件发送事件，linkMediaOpen同步被设置为false，则子组件的visible也会被设置为false，从而el-dialog的visible也被设置为false，即对话框关闭。实际上也不需要这么复杂，dialogVisible为false时，el-dialog的visible也会被设置为false，即对话框关闭。
      },
    },
    // 自定义媒体列表API函数
    customListApi() {
      // 如果有当前案件,使用未关联媒体API
      if (this.currentCase && this.currentCase.id) {
        return (queryParams) => {
          return getUnassociatedMediaList(this.currentCase.id, queryParams);
        };
      }
      // 如果有当前警情,使用未关联媒体API
      if (this.currentIncidentRecord && this.currentIncidentRecord.id) {
        return (queryParams) => {
          return getIncidentRecordUnassociatedMediaByIncidentRecord(
            this.currentIncidentRecord.id,
            queryParams
          );
        };
      }
      // 如果有当前文书,使用未关联媒体API
      if (this.currentWrit && this.currentWrit.id) {
        return (queryParams) => {
          return getUnassociatedMediaByWritId(this.currentWrit.id, queryParams);
        };
      }
      // 否则返回null,使用默认API
      return null;
    },
  },
  watch: {
    // 监听对话框打开,打开时刷新数据
    visible(newVal) {
      if (newVal) {
        // 对话框打开时,使用 $nextTick 确保 prop 已经更新
        this.$nextTick(() => {
          this.refresh();
        });
      }
    },
  },
  methods: {
    /** 选中数据变化 */
    handleSelectionChange(selection) {
      this.selectedMedia = selection;
    },

    /** 检查媒体关联状态 */
    handleSelect(row) {
      // 检查媒体是否已经关联了警情
      if (row.incidentRecordCode) {
        // 如果关联的是当前警情
        if (row.incidentRecordCode === this.currentIncidentRecord.code) {
          this.$confirm(
            `媒体"${row.mediaName}"已与当前警情"${row.incidentRecordCode}"关联`,
            "提示",
            {
              confirmButtonText: "确定",
              type: "information",
            }
          );
        } else {
          // 如果关联的是其他警情
          this.$confirm(
            `本次关联之前，媒体"${row.mediaName}"将自动先与警情"${row.incidentRecordCode}"解除关联`,
            "提示",
            {
              confirmButtonText: "确定",
              type: "information",
            }
          );
        }
      }
    },

    /** 确认选择 */
    handleConfirm() {
      this.$emit("confirm", this.selectedMedia);
    },

    /** 取消选择 */
    handleCancel() {
      this.$emit("cancel");
    },

    /** 对话框关闭 */
    handleClose() {
      this.selectedMedia = [];
      this.$emit("close");
    },

    /** 刷新媒体列表 */
    refresh() {
      if (this.$refs.mediaSelector) {
        this.$refs.mediaSelector.refreshList();
      }
    },
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
