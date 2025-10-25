<template>
  <div class="workflow-designer">
    <!-- 工具栏 -->
    <div class="designer-toolbar">
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addStep">添加步骤</el-button>
      <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteStep" :disabled="!selectedStep">删除步骤</el-button>
      <el-button icon="el-icon-refresh" size="small" @click="resetDesigner">重置</el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button type="info" icon="el-icon-view" size="small" @click="showPreview">预览</el-button>
    </div>

    <!-- 主容器 -->
    <div class="designer-container">
      <!-- 左侧：步骤库 -->
      <div class="steps-library">
        <h4>步骤库</h4>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'user_task')">
          <i class="el-icon-user"></i> 用户任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'process')">
          <i class="el-icon-s-tools"></i> 自动任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'parallel')">
          <i class="el-icon-share"></i> 并行任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'complete')">
          <i class="el-icon-success"></i> 完成
        </div>
      </div>

      <!-- 中间：设计区域 -->
      <div class="design-area" @drop="dropStep" @dragover.prevent @dragleave="dragLeave">
        <div class="workflow-canvas">
          <div v-if="steps.length === 0" class="empty-state">
            <i class="el-icon-picture"></i>
            <p>拖拽步骤到这里开始设计工作流</p>
          </div>
          <div v-else class="steps-container">
            <template v-for="(step, index) in steps">
              <div :key="step.id" class="step-box" :class="{ active: selectedStep && selectedStep.id === step.id }" @click="selectStep(step)">
                <div class="step-header">
                  <span class="step-type">{{ getStepTypeLabel(step.type) }}</span>
                  <i class="el-icon-close" @click.stop="removeStep(index)"></i>
                </div>
                <div class="step-name">{{ step.name }}</div>
              </div>
              <!-- 步骤之间的箭头 -->
              <div v-if="index < steps.length - 1" :key="`arrow-${step.id}`" class="step-connector">
                <i class="el-icon-arrow-down"></i>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 右侧：配置面板 -->
      <div class="config-panel">
        <h4>步骤配置</h4>
        <div v-if="selectedStep" class="config-form">
          <el-form :model="selectedStep" label-width="80px" size="small">
            <el-form-item label="步骤名称">
              <el-input v-model="selectedStep.name" placeholder="输入步骤名称" />
            </el-form-item>
            <el-form-item label="步骤类型">
              <el-select v-model="selectedStep.type" placeholder="选择步骤类型">
                <el-option label="用户任务" value="user_task">
                  <span><i class="el-icon-user"></i> 用户任务 - 需要人工处理的任务</span>
                </el-option>
                <el-option label="自动任务" value="process">
                  <span><i class="el-icon-s-tools"></i> 自动任务 - 系统自动执行的任务</span>
                </el-option>
                <el-option label="并行任务" value="parallel">
                  <span><i class="el-icon-share"></i> 并行任务 - 多个任务同时执行</span>
                </el-option>
                <el-option label="完成" value="complete">
                  <span><i class="el-icon-success"></i> 完成 - 标记流程结束</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="selectedStep.description" type="textarea" :rows="3" placeholder="输入步骤描述" />
            </el-form-item>
            <el-form-item label="超时(秒)">
              <el-input-number v-model="selectedStep.timeout" :min="1" :max="3600" />
            </el-form-item>
            <el-form-item label="重试次数">
              <el-input-number v-model="selectedStep.retries" :min="0" :max="10" />
            </el-form-item>
            <el-form-item label="参数(JSON)">
              <el-input
                v-model="selectedStep.params"
                type="textarea"
                :rows="4"
                placeholder='{"key": "value"}'
              />
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-config">
          <p>选择一个步骤进行配置</p>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog title="工作流定义预览" :visible.sync="previewVisible" width="70%" append-to-body>
      <div class="preview-content">
        <el-input v-model="previewJSON" type="textarea" :rows="20" readonly />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyPreview">复制</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'WorkflowDesigner',
  props: {
    // 工作流表单数据（从父组件传入）
    workflowData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      steps: [],
      selectedStep: null,
      draggedType: null,
      previewVisible: false,
      previewJSON: ''
    }
  },
  watch: {
    // 监听工作流数据变化，用于编辑模式
    workflowData: {
      handler(val) {
        if (val && val.definition) {
          try {
            const definition = JSON.parse(val.definition)
            this.steps = (definition.steps || []).map(step => ({
              ...step,
              params: JSON.stringify(step.params || {})
            }))
          } catch (e) {
            console.error('解析工作流定义失败:', e)
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    dragStart(event, type) {
      this.draggedType = type
      event.dataTransfer.effectAllowed = 'copy'
    },
    dropStep(event) {
      event.preventDefault()
      if (!this.draggedType) return
      const step = {
        id: `step_${Date.now()}`,
        type: this.draggedType,
        name: this.getStepTypeLabel(this.draggedType),
        description: '',
        timeout: 300,
        retries: 0,
        params: '{}'
      }
      this.steps.push(step)
      this.draggedType = null
    },
    dragLeave(event) {
      event.preventDefault()
    },
    addStep() {
      this.$message.info('请从左侧步骤库拖拽步骤到设计区域')
    },
    selectStep(step) {
      this.selectedStep = JSON.parse(JSON.stringify(step))
      const index = this.steps.findIndex(s => s.id === step.id)
      if (index !== -1) {
        this.steps[index] = this.selectedStep
      }
    },
    removeStep(index) {
      this.steps.splice(index, 1)
      if (this.selectedStep && this.selectedStep.id === this.steps[index]?.id) {
        this.selectedStep = null
      }
    },
    deleteStep() {
      if (!this.selectedStep) {
        this.$message.warning('请先选择一个步骤')
        return
      }
      const index = this.steps.findIndex(s => s.id === this.selectedStep.id)
      if (index !== -1) {
        this.steps.splice(index, 1)
        this.selectedStep = null
        this.$message.success('步骤已删除')
      }
    },
    resetDesigner() {
      this.$confirm('确定要重置所有步骤吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.steps = []
        this.selectedStep = null
        this.$message.success('已重置')
      }).catch(() => {})
    },
    showPreview() {
      if (this.steps.length === 0) {
        this.$message.warning('请先添加步骤')
        return
      }
      const definition = {
        steps: this.steps.map(s => ({
          id: s.id,
          type: s.type,
          name: s.name,
          description: s.description,
          timeout: s.timeout,
          retries: s.retries,
          params: this.parseJSON(s.params)
        }))
      }
      this.previewJSON = JSON.stringify(definition, null, 2)
      this.previewVisible = true
    },
    copyPreview() {
      const textarea = document.createElement('textarea')
      textarea.value = this.previewJSON
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message.success('已复制到剪贴板')
    },
    // 获取工作流定义（供父组件调用）
    getWorkflowDefinition() {
      if (this.steps.length === 0) {
        return null
      }
      const definition = {
        steps: this.steps.map(s => ({
          id: s.id,
          type: s.type,
          name: s.name,
          description: s.description,
          timeout: s.timeout,
          retries: s.retries,
          params: this.parseJSON(s.params)
        }))
      }
      return JSON.stringify(definition)
    },
    // 重置设计器（供父组件调用）
    reset() {
      this.steps = []
      this.selectedStep = null
    },
    getStepTypeLabel(type) {
      const labels = {
        user_task: '用户任务',
        process: '自动任务',
        parallel: '并行任务',
        complete: '完成'
      }
      return labels[type] || type
    },
    parseJSON(str) {
      try {
        return JSON.parse(str)
      } catch (e) {
        return {}
      }
    },

  }
}
</script>

<style scoped lang="scss">
.workflow-designer {
  background: #f5f7fa;
  height: 100%;

  .designer-toolbar {
    background: white;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .designer-container {
    display: flex;
    gap: 15px;
    height: 500px;

    .steps-library {
      width: 180px;
      background: white;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow-y: auto;

      h4 {
        margin: 0 0 15px 0;
        color: #333;
      }

      .step-item {
        padding: 10px;
        margin-bottom: 10px;
        background: #f0f9ff;
        border: 1px solid #b3d8ff;
        border-radius: 4px;
        cursor: move;
        transition: all 0.3s;
        font-size: 14px;
        font-weight: 500;

        &:hover {
          background: #e6f7ff;
          border-color: #69c0ff;
          transform: translateX(5px);
        }

        i {
          margin-right: 5px;
          font-size: 16px;
        }

        &:nth-child(2) {
          background: #e8f5e9;
          border-color: #81c784;
          &:hover {
            background: #c8e6c9;
            border-color: #66bb6a;
          }
        }

        &:nth-child(3) {
          background: #fff3e0;
          border-color: #ffb74d;
          &:hover {
            background: #ffe0b2;
            border-color: #ffa726;
          }
        }

        &:nth-child(4) {
          background: #f3e5f5;
          border-color: #ba68c8;
          &:hover {
            background: #e1bee7;
            border-color: #ab47bc;
          }
        }

        &:nth-child(5) {
          background: #e0f2f1;
          border-color: #4db6ac;
          &:hover {
            background: #b2dfdb;
            border-color: #26a69a;
          }
        }
      }
    }

    .design-area {
      flex: 1;
      background: white;
      border-radius: 4px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
      border: 2px dashed #ddd;

      .workflow-canvas {
        min-height: 100%;

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #999;

          i {
            font-size: 48px;
            margin-bottom: 10px;
          }
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;

          .step-box {
            background: #f0f9ff;
            border: 2px solid #b3d8ff;
            border-radius: 4px;
            padding: 15px 20px;
            min-width: 200px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #69c0ff;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &.active {
              background: #e6f7ff;
              border-color: #1890ff;
              box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
            }

            .step-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .step-type {
                font-weight: bold;
                color: #1890ff;
              }

              i {
                cursor: pointer;
                color: #999;

                &:hover {
                  color: #f5222d;
                }
              }
            }

            .step-name {
              color: #333;
              font-size: 14px;
            }
          }

          .step-connector {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 30px;
            color: #409eff;
            font-size: 24px;
            animation: bounce 2s infinite;

            i {
              font-weight: bold;
            }
          }
        }
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(5px);
      }
    }

    .config-panel {
      width: 280px;
      background: white;
      border-radius: 4px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow-y: auto;

      h4 {
        margin: 0 0 15px 0;
        color: #333;
      }
      .config-form {
        ::v-deep .el-form-item {
          margin-bottom: 12px;
        }
      }

      .empty-config {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #999;
      }
    }
  }

  .preview-content {
    ::v-deep .el-textarea__inner {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
  }
}
</style>
