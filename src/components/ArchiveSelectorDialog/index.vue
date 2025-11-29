<template>
  <!-- 这里的visible是el-dialog的prop -->
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ArchiveSelector
      ref="archiveSelector"
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
import ArchiveSelector from "@/components/ArchiveSelector";

export default {
  name: "ArchiveSelectorDialog",
  components: {
    ArchiveSelector,
  },
  props: {
    // 对话框标题
    title: {
      type: String,
      default: "选择档案",
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
    // 自定义档案列表API函数
    customListApi: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      selectedArchives: [],
    };
  },
  computed: {
    dialogVisible: {
      // dialogVisible是el-dialog的visible与本组件的visible之间的代理，负责在二者之间传递值
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val); // 如果dialogVisible被设置为false，并向父组件发送事件，则子组件的visible也会被设置为false，从而el-dialog的visible也被设置为false，即对话框关闭
      },
    },
  },
  watch: {
    // 监听对话框打开,清空选中状态
    visible(newVal) {
      if (newVal) {
        this.selectedArchives = [];
        this.$nextTick(() => {
          if (this.$refs.archiveSelector) {
            this.$refs.archiveSelector.clearSelection();
          }
        });
      }
    },
  },
  methods: {
    /** 选中数据变化 */
    handleSelectionChange(selection) {
      this.selectedArchives = selection;
    },

    /** 单个选择事件 */
    handleSelect(row) {
      // 可以在这里添加选择档案后的逻辑
    },

    /** 确认选择 */
    handleConfirm() {
      this.$emit("confirm", this.selectedArchives);
    },

    /** 取消选择 */
    handleCancel() {
      this.$emit("cancel");
    },

    /** 对话框关闭 */
    handleClose() {
      this.selectedArchives = [];
      this.$emit("close");
    },

    /** 刷新档案列表 */
    refresh() {
      if (this.$refs.archiveSelector) {
        this.$refs.archiveSelector.refresh();
      }
    },
  },
};
</script>
