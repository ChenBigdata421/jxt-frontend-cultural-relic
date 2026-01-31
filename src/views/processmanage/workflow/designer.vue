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
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'userTask')" @dragend="dragEnd">
          <i class="el-icon-user"></i> 用户任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'process')" @dragend="dragEnd">
          <i class="el-icon-s-tools"></i> 自动任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'parallel')" @dragend="dragEnd">
          <i class="el-icon-share"></i> 并行任务
        </div>
        <div class="step-item" draggable="true" @dragstart="dragStart($event, 'complete')" @dragend="dragEnd">
          <i class="el-icon-success"></i> 完成
        </div>
      </div>

      <!-- 中间：设计区域 -->
      <div class="design-area" @drop.prevent="dropStep" @dragover.prevent @dragenter.prevent @dragleave="dragLeave">
        <div class="workflow-canvas">
          <div v-if="steps.length === 0" class="empty-state">
            <i class="el-icon-picture"></i>
            <p>拖拽步骤到这里开始设计工作流</p>
          </div>
          <div v-else class="workflow-tree">
            <div v-if="rootIds.length === 0" class="empty-state">
              <i class="el-icon-warning"></i>
              <p>未找到起始节点，请检查 nextSteps 引用</p>
            </div>
            <div v-else class="roots-row">
              <workflow-node
                v-for="rid in rootIds"
                :key="rid"
                :node-id="rid"
                :get-node="getNodeById"
                :get-next-ids="getNextIds"
                :get-parallel-tasks="getParallelTasks"
                :selected-id="selectedStep ? selectedStep.id : ''"
                @select="selectStep"
                @add-next="addNextUnder"
                @add-branch="addBranchUnder"
                @add-parallel="addParallelGatewayAfter"
                @add-ptask="addParallelTaskUnder"
                @delete-node="deleteNodeById"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：配置面板 -->
      <div class="config-panel">
        <h4>步骤配置</h4>
        <div v-if="selectedStep" class="config-form">
          <el-form :model="selectedStep" label-width="80px" size="small">
            <el-form-item label="是否根任务">
              <el-checkbox v-model="selectedStep.isRoot" />
            </el-form-item>
            <el-form-item label="步骤ID">
              <el-input v-model="selectedStep.id" placeholder="输入步骤ID" @change="handleSelectedStepIdChange">
                <el-button slot="append" icon="el-icon-document-copy" @click="copyText(selectedStep.id)" />
              </el-input>
            </el-form-item>
            <el-form-item label="步骤名称">
              <el-input v-model="selectedStep.name" placeholder="输入步骤名称" />
            </el-form-item>
            <el-form-item label="步骤类型">
              <el-select v-model="selectedStep.type" placeholder="选择步骤类型">
                <el-option
                  v-for="opt in stepTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                >
                  <span><i :class="opt.icon"></i> {{ opt.desc }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="selectedStep.description" type="textarea" :rows="3" placeholder="输入步骤描述" />
            </el-form-item>
            <el-form-item label="条件">
              <el-input v-model="selectedStep.condition" type="textarea" :rows="2" placeholder='例如：${variable} == "value"' />
            </el-form-item>
            <el-form-item label="超时(秒)">
              <el-input-number v-model="selectedStep.timeout" :min="1" :max="3600" />
            </el-form-item>
            <el-form-item label="重试次数">
              <el-input-number v-model="selectedStep.retries" :min="0" :max="10" />
            </el-form-item>
            <el-form-item label="下一步">
              <el-select v-model="selectedStep.nextSteps" placeholder="选择下一步步骤" multiple clearable filterable>
                <el-option
                  v-for="opt in getNextStepOptions(selectedStep.id)"
                  :key="opt.id"
                  :label="opt.label"
                  :value="opt.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="参数(JSON)">
              <el-input
                v-model="selectedStep.params"
                type="textarea"
                :rows="4"
                placeholder='{"key": "value"}'
              />
            </el-form-item>
            <el-form-item v-if="selectedStep.type === 'parallel'" label="并行任务">
              <div class="parallel-task-list">
                <div v-for="(task, idx) in selectedStep.parallelTasks" :key="task.id" class="parallel-task-item">
                  <el-card shadow="never" class="parallel-task-card">
                    <div slot="header" class="parallel-task-card__header">
                      <span>{{ task.name || ('并行任务' + (idx + 1)) }}</span>
                      <el-button type="text" @click="removeParallelTask(idx)">删除</el-button>
                    </div>
                    <el-form label-position="top" size="mini" class="parallel-task-form">
                      <el-form-item label="ID">
                        <el-input
                          v-model="task.id"
                          placeholder="输入任务ID"
                          @focus="task._idBeforeEdit = task.id"
                          @change="handleParallelTaskIdChange(task)"
                        >
                          <el-button slot="append" icon="el-icon-document-copy" @click="copyText(task.id)" />
                        </el-input>
                      </el-form-item>
                      <el-form-item label="名称">
                        <el-input v-model="task.name" placeholder="输入任务名称" />
                      </el-form-item>
                      <el-form-item label="类型">
                        <el-select v-model="task.type" placeholder="选择任务类型">
                          <el-option label="用户任务" value="userTask" />
                          <el-option label="自动任务" value="process" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="描述">
                        <el-input v-model="task.description" type="textarea" :rows="2" placeholder="输入任务描述" />
                      </el-form-item>
                      <el-form-item label="条件">
                        <el-input v-model="task.condition" type="textarea" :rows="2" placeholder='例如：${step_id.field} == true' />
                      </el-form-item>
                      <el-form-item label="超时(秒)">
                        <el-input-number v-model="task.timeout" :min="1" :max="3600" />
                      </el-form-item>
                      <el-form-item label="重试次数">
                        <el-input-number v-model="task.retries" :min="0" :max="10" />
                      </el-form-item>
                      <el-form-item label="参数(JSON)">
                        <el-input
                          v-model="task.params"
                          type="textarea"
                          :rows="3"
                          placeholder='{"key": "value"}'
                        />
                      </el-form-item>
                    </el-form>
                  </el-card>
                </div>
              </div>
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
const WorkflowNode = {
  name: 'WorkflowNode',
  props: {
    nodeId: { type: String, required: true },
    getNode: { type: Function, required: true },
    getNextIds: { type: Function, required: true },
    getParallelTasks: { type: Function, required: true },
    selectedId: { type: String, default: '' }
  },
  computed: {
    node() {
      return this.getNode(this.nodeId)
    },
    nextIds() {
      return this.getNextIds(this.node)
    },
    parallelTasks() {
      return this.getParallelTasks(this.node)
    },
    isParallelGateway() {
      return this.node && this.node.type === 'parallel'
    },
    isActive() {
      return this.node && this.selectedId && this.node.id === this.selectedId
    }
  },
  methods: {
    onSelect() {
      if (this.node) this.$emit('select', this.node)
    },
    onAddNext() {
      if (this.node) this.$emit('add-next', this.node)
    },
    onAddBranch() {
      if (this.node) this.$emit('add-branch', this.node)
    },
    onAddParallel() {
      if (this.node) this.$emit('add-parallel', this.node)
    },
    onAddPTask() {
      if (this.node) this.$emit('add-ptask', this.node)
    },
    onDelete() {
      if (this.node) this.$emit('delete-node', this.node.id)
    },
    typeLabel(type) {
      const labels = {
        userTask: '用户任务',
        process: '自动任务',
        parallel: '并行网关',
        complete: '完成'
      }
      return labels[type] || type
    },
    showCondition(node) {
      return node && node.condition
    }
  },
  render(h) {
    if (!this.node) return null

    const emitPassthrough = {
      select: (e) => this.$emit('select', e),
      'add-next': (e) => this.$emit('add-next', e),
      'add-branch': (e) => this.$emit('add-branch', e),
      'add-parallel': (e) => this.$emit('add-parallel', e),
      'add-ptask': (e) => this.$emit('add-ptask', e),
      'delete-node': (e) => this.$emit('delete-node', e)
    }

    const NodeChild = (id) => h('workflow-node', {
      key: id,
      props: {
        nodeId: id,
        getNode: this.getNode,
        getNextIds: this.getNextIds,
        getParallelTasks: this.getParallelTasks,
        selectedId: this.selectedId
      },
      on: emitPassthrough
    })

    const head = h('div', { class: 'node-head' }, [
      h('span', { class: 'node-type' }, this.typeLabel(this.node.type)),
      h('div', { class: 'node-actions' }, [
        h('el-tooltip', { props: { content: '添加下一步', placement: 'top' } }, [
          h('el-button', { props: { type: 'text', size: 'mini', icon: 'el-icon-plus' }, on: { click: (e) => { e.stopPropagation(); this.onAddNext() } } })
        ]),
        h('el-tooltip', { props: { content: '添加分支', placement: 'top' } }, [
          h('el-button', { props: { type: 'text', size: 'mini', icon: 'el-icon-share' }, on: { click: (e) => { e.stopPropagation(); this.onAddBranch() } } })
        ]),
        h('el-tooltip', { props: { content: '添加并行', placement: 'top' } }, [
          h('el-button', { props: { type: 'text', size: 'mini', icon: 'el-icon-connection' }, on: { click: (e) => { e.stopPropagation(); this.onAddParallel() } } })
        ]),
        this.isParallelGateway
          ? h('el-tooltip', { props: { content: '添加并行任务', placement: 'top' } }, [
            h('el-button', { props: { type: 'text', size: 'mini', icon: 'el-icon-menu' }, on: { click: (e) => { e.stopPropagation(); this.onAddPTask() } } })
          ])
          : null,
        h('el-tooltip', { props: { content: '删除', placement: 'top' } }, [
          h('el-button', { props: { type: 'text', size: 'mini', icon: 'el-icon-close' }, on: { click: (e) => { e.stopPropagation(); this.onDelete() } } })
        ])
      ])
    ])

    const card = h('div', {
      class: [{ active: this.isActive }, 'node-card', 't-' + this.node.type],
      on: { click: (e) => { e.stopPropagation(); this.onSelect() } }
    }, [
      head,
      h('div', { class: 'node-title' }, this.node.name),
      this.showCondition(this.node) ? h('div', { class: 'node-sub' }, `条件：${this.node.condition}`) : null
    ])

    const parts = [card]

    if (this.isParallelGateway) {
      const taskRow = h('div', { class: 'wf-children-row' }, (this.parallelTasks || []).map(t => NodeChild(t.id)))
      const join = (this.nextIds && this.nextIds.length)
        ? h('div', { class: 'wf-join' }, [
          h('div', { class: 'wf-line-horz' }),
          h('div', { class: 'wf-line-vert' })
        ])
        : null
      parts.push(
        h('div', { class: 'wf-parallel' }, [
          h('div', { class: 'wf-line-vert' }),
          h('div', { class: 'wf-line-horz' }),
          taskRow,
          join
        ])
      )
    }

    if (!this.isParallelGateway && this.nextIds && this.nextIds.length > 1) {
      parts.push(
        h('div', { class: 'wf-branches' }, [
          h('div', { class: 'wf-line-vert' }),
          h('div', { class: 'wf-line-horz' }),
          h('div', { class: 'wf-children-row' }, (this.nextIds || []).map(id => NodeChild(id)))
        ])
      )
    } else if (!this.isParallelGateway && this.nextIds && this.nextIds.length === 1) {
      parts.push(
        h('div', { class: 'wf-next' }, [
          h('div', { class: 'wf-line-vert' }),
          NodeChild(this.nextIds[0])
        ])
      )
    } else if (this.isParallelGateway && this.nextIds && this.nextIds.length === 1) {
      parts.push(
        h('div', { class: 'wf-next' }, [
          NodeChild(this.nextIds[0])
        ])
      )
    }

    return h('div', { class: 'wf-node' }, parts)
  }
}

WorkflowNode.components = { WorkflowNode }

export default {
  name: 'WorkflowDesigner',
  components: {
    WorkflowNode
  },
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
      selectedStepIdBeforeEdit: null,
      draggedType: null,
      previewVisible: false,
      previewJSON: ''
    }
  },
  computed: {
    rootIds() {
      const allIds = (this.steps || []).map(s => s.id).filter(Boolean)
      const referenced = new Set()

      const collectRefs = (node) => {
        if (!node) return
        ;(this.getNextIds(node) || []).forEach(id => referenced.add(id))
        const pts = this.getParallelTasks(node) || []
        pts.forEach(t => {
          if (t && t.id) referenced.add(t.id)
          collectRefs(t)
        })
      }

      ;(this.steps || []).forEach(s => collectRefs(s))

      const roots = allIds.filter(id => !referenced.has(id))
      return roots.length ? roots : (allIds.length ? [allIds[0]] : [])
    },

    stepTypeOptions() {
      const base = [
        { value: 'userTask', label: '用户任务', icon: 'el-icon-user', desc: '用户任务 - 需要人工处理的任务' },
        { value: 'process', label: '自动任务', icon: 'el-icon-s-tools', desc: '自动任务 - 系统自动执行的任务' },
        { value: 'parallel', label: '并行任务', icon: 'el-icon-share', desc: '并行任务 - 多个任务同时执行' },
        { value: 'complete', label: '完成', icon: 'el-icon-success', desc: '完成 - 标记流程结束' }
      ]

      if (this.isParallelTaskNode(this.selectedStep)) {
        return base.filter(opt => ['userTask', 'process'].includes(opt.value))
      }
      return base
    }
  },
  watch: {
    // 监听工作流数据变化，用于编辑模式
    workflowData: {
      handler(val) {
        if (val && val.definition) {
          try {
            const definition = JSON.parse(val.definition)
            this.steps = (definition.steps || []).map(step => this.normalizeStep(step))
            this.$nextTick(() => this.markRootTasks())
          } catch (e) {
            console.error('解析工作流定义失败:', e)
          }
        } else {
          this.steps = []
          this.selectedStep = null
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    dragStart(event, type) {
      this.draggedType = type
      if (event && event.dataTransfer) {
        event.dataTransfer.setData('text/plain', type)
        event.dataTransfer.setData('text', type)
        event.dataTransfer.effectAllowed = 'copy'
      }
    },
    dragEnd() {
      this.draggedType = null
    },
    dropStep(event) {
      event.preventDefault()
      const dt = event && event.dataTransfer
      const dropType = this.draggedType || (dt && (dt.getData('text/plain') || dt.getData('text')))
      if (!dropType) {
        try {
          const types = dt && dt.types ? Array.from(dt.types) : []
          console.warn('[workflow-designer] drop fired but empty type', { types })
        } catch (e) {}
        this.$message.warning('拖拽未识别到步骤类型（drop 已触发）。请打开控制台查看 drop 的 dataTransfer.types')
        return
      }
      const step = this.createStep(dropType)
      this.steps.push(step)
      this.selectStep(step)
      this.draggedType = null
      this.$nextTick(() => this.markRootTasks())
    },
    dragLeave(event) {
      event.preventDefault()
    },
    addStep() {
      this.$message.info('请从左侧步骤库拖拽步骤到设计区域')
    },
    selectStep(step) {
      this.selectedStep = step
      this.selectedStepIdBeforeEdit = step ? step.id : null
    },
    removeStep(index) {
      const removed = this.steps[index]
      this.steps.splice(index, 1)
      if (removed && removed.id) {
        this.removeStepReferences(removed.id)
      }
      if (this.selectedStep && removed && this.selectedStep.id === removed.id) {
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
        const removedId = this.selectedStep.id
        this.steps.splice(index, 1)
        if (removedId) {
          this.removeStepReferences(removedId)
        }
        this.selectedStep = null
        this.$message.success('步骤已删除')
        this.$nextTick(() => this.markRootTasks())
      } else {
        this.deleteNodeById(this.selectedStep.id)
      }
    },

    deleteNodeById(id) {
      if (!id) return
      const topIndex = this.steps.findIndex(s => s.id === id)
      if (topIndex !== -1) {
        this.steps.splice(topIndex, 1)
        this.removeStepReferences(id)
        if (this.selectedStep && this.selectedStep.id === id) this.selectedStep = null
        this.$nextTick(() => this.markRootTasks())
        return
      }

      const removed = this.removeTaskById(id)
      if (removed) {
        this.removeStepReferences(id)
        if (this.selectedStep && this.selectedStep.id === id) this.selectedStep = null
        this.$nextTick(() => this.markRootTasks())
      }
    },

    removeTaskById(id) {
      let removed = false
      const walk = (tasks) => {
        if (!Array.isArray(tasks)) return
        for (let i = tasks.length - 1; i >= 0; i--) {
          const t = tasks[i]
          if (t && t.id === id) {
            tasks.splice(i, 1)
            removed = true
            continue
          }
          if (t && Array.isArray(t.parallelTasks)) {
            walk(t.parallelTasks)
          }
        }
      }

      this.steps.forEach(s => {
        if (s && Array.isArray(s.parallelTasks)) {
          walk(s.parallelTasks)
        }
      })

      return removed
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
        name: this.workflowData && this.workflowData.name,
        description: this.workflowData && this.workflowData.description,
        steps: this.steps.map(s => this.toStepDefinition(s))
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
        name: this.workflowData && this.workflowData.name,
        description: this.workflowData && this.workflowData.description,
        steps: this.steps.map(s => this.toStepDefinition(s))
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
        userTask: '用户任务',
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

    copyText(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text || ''
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.$message.success('已复制')
    },

    handleSelectedStepIdChange() {
      if (!this.selectedStep) return
      const oldId = this.selectedStepIdBeforeEdit
      const newId = (this.selectedStep.id || '').trim()

      if (!oldId) {
        this.selectedStepIdBeforeEdit = newId
        return
      }

      if (newId === oldId) return

      if (!this.isValidStepId(newId)) {
        this.$message.error('步骤ID格式不合法，仅允许字母、数字、下划线、中横线')
        this.selectedStep.id = oldId
        return
      }

      const duplicated = this.isDuplicatedId(newId)
      if (duplicated) {
        this.$message.error('步骤ID已存在，请换一个')
        this.selectedStep.id = oldId
        return
      }

      this.renameStepId(oldId, newId)
      this.selectedStepIdBeforeEdit = newId
    },

    isValidStepId(id) {
      return /^[a-zA-Z0-9_-]+$/.test(id)
    },

    isDuplicatedId(id) {
      const all = this.collectAllIds()
      const count = all.filter(existing => existing === id).length
      return count > 1
    },

    collectAllIds() {
      const ids = []
      this.steps.forEach(s => {
        if (s && s.id) ids.push(s.id)
        const tasks = Array.isArray(s.parallelTasks) ? s.parallelTasks : []
        tasks.forEach(t => this.collectTaskIds(t, ids))
      })
      return ids
    },

    collectTaskIds(task, ids) {
      if (!task) return
      if (task.id) ids.push(task.id)
      const children = Array.isArray(task.parallelTasks) ? task.parallelTasks : []
      children.forEach(t => this.collectTaskIds(t, ids))
    },

    handleParallelTaskIdChange(task) {
      if (!task) return
      const oldId = task._idBeforeEdit
      const newId = (task.id || '').trim()

      if (!oldId) {
        task._idBeforeEdit = newId
        return
      }

      if (newId === oldId) return

      if (!this.isValidStepId(newId)) {
        this.$message.error('任务ID格式不合法，仅允许字母、数字、下划线、中横线')
        task.id = oldId
        return
      }

      const duplicated = this.isDuplicatedId(newId)
      if (duplicated) {
        this.$message.error('任务ID已存在，请换一个')
        task.id = oldId
        return
      }

      this.renameStepId(oldId, newId)
      task._idBeforeEdit = newId
    },

    renameStepId(oldId, newId) {
      const step = this.steps.find(s => s.id === oldId)
      if (step) {
        step.id = newId
      }

      this.steps.forEach(s => {
        if (Array.isArray(s.nextSteps)) {
          s.nextSteps = s.nextSteps.map(id => (id === oldId ? newId : id))
        }
        if (Array.isArray(s.parallelTasks)) {
          s.parallelTasks = s.parallelTasks.map(t => this.renameStepIdInTask(t, oldId, newId))
        }
      })
    },

    renameStepIdInTask(task, oldId, newId) {
      if (!task) return task
      if (task.id === oldId) {
        task.id = newId
      }
      if (Array.isArray(task.nextSteps)) {
        task.nextSteps = task.nextSteps.map(id => (id === oldId ? newId : id))
      }
      if (Array.isArray(task.parallelTasks)) {
        task.parallelTasks = task.parallelTasks.map(t => this.renameStepIdInTask(t, oldId, newId))
      }
      return task
    },

    createStep(type) {
      const now = Date.now()
      const base = {
        id: `${type}${now}`,
        type: type,
        name: this.getStepTypeLabel(type),
        description: '',
        condition: '',
        timeout: 300,
        retries: 0,
        params: '{}',
        nextSteps: [],
        parallelTasks: [],
        isRoot: false
      }
      return base
    },

    normalizeStep(step) {
      const nextSteps = step.next_steps || step.nextSteps || []
      const parallelTasks = step.parallel_tasks || step.parallelTasks || []
      return {
        id: step.id,
        type: step.type,
        name: step.name,
        description: step.description,
        condition: step.condition || '',
        timeout: step.timeout,
        retries: step.retries,
        params: JSON.stringify(step.params || {}),
        nextSteps: Array.isArray(nextSteps) ? nextSteps : [],
        parallelTasks: (Array.isArray(parallelTasks) ? parallelTasks : []).map(t => this.normalizeStep(t)),
        isRoot: step.isRoot || false
      }
    },

    toStepDefinition(step) {
      return {
        id: step.id,
        type: step.type,
        name: step.name,
        description: step.description,
        condition: step.condition || '',
        timeout: step.timeout,
        retries: step.retries,
        params: this.parseJSON(step.params),
        nextSteps: Array.isArray(step.nextSteps) ? step.nextSteps : [],
        parallelTasks: Array.isArray(step.parallelTasks) ? step.parallelTasks.map(t => this.toStepDefinition(t)) : [],
        isRoot: step.isRoot || false
      }
    },

    getNextStepOptions(currentId) {
      return this.steps
        .filter(s => s.id !== currentId)
        .map(s => ({
          id: s.id,
          label: `${s.name} (${s.id})`
        }))
    },

    getNextIds(node) {
      const next = (node && (node.next_steps || node.nextSteps)) || []
      return Array.isArray(next) ? next : []
    },

    getParallelTasks(node) {
      const tasks = (node && (node.parallel_tasks || node.parallelTasks)) || []
      return Array.isArray(tasks) ? tasks : []
    },

    getNodeById(id) {
      if (!id) return null
      const direct = this.steps.find(s => s.id === id)
      if (direct) return direct

      const walk = (tasks) => {
        if (!Array.isArray(tasks)) return null
        for (const t of tasks) {
          if (t && t.id === id) return t
          const found = walk(t && t.parallelTasks)
          if (found) return found
        }
        return null
      }

      for (const s of this.steps) {
        const found = walk(s && s.parallelTasks)
        if (found) return found
      }

      return null
    },

    addBranchUnder(node) {
      if (!node) return
      if (!Array.isArray(node.nextSteps)) {
        this.$set(node, 'nextSteps', [])
      }
      const child = this.createStep('userTask')
      child.name = '分支任务'
      this.steps.push(child)
      node.nextSteps.push(child.id)
      this.selectStep(child)
      this.$nextTick(() => this.markRootTasks())
    },

    addNextUnder(node) {
      if (!node) return
      if (!Array.isArray(node.nextSteps)) {
        this.$set(node, 'nextSteps', [])
      }
      const oldNext = node.nextSteps.slice()
      const child = this.createStep('userTask')
      child.name = '下一步'
      this.steps.push(child)
      node.nextSteps = [child.id]
      if (oldNext.length) {
        this.$set(child, 'nextSteps', oldNext)
      }
      this.selectStep(child)
      this.$nextTick(() => this.markRootTasks())
    },

    addParallelGatewayAfter(node) {
      if (!node) return
      if (!Array.isArray(node.nextSteps)) {
        this.$set(node, 'nextSteps', [])
      }

      if (node.type === 'parallel') {
        this.addParallelTaskUnder(node)
        return
      }

      if (node.nextSteps.length === 1) {
        const nextNode = this.getNodeById(node.nextSteps[0])
        if (nextNode && nextNode.type === 'parallel') {
          this.addParallelTaskUnder(nextNode)
          return
        }
      }

      const oldNext = node.nextSteps.slice()
      const gateway = this.createStep('parallel')
      gateway.name = '并行网关'
      gateway.nextSteps = oldNext
      gateway.parallelTasks = []
      this.steps.push(gateway)
      node.nextSteps = [gateway.id]
      this.selectStep(gateway)
      this.addParallelTaskUnder(gateway)
      this.$nextTick(() => this.markRootTasks())
    },

    addParallelTaskUnder(node) {
      if (!node) return
      if (node.type !== 'parallel') {
        this.addParallelGatewayAfter(node)
        return
      }
      if (!Array.isArray(node.parallelTasks)) {
        this.$set(node, 'parallelTasks', [])
      }
      const index = node.parallelTasks.length + 1
      node.parallelTasks.push({
        id: `${node.id}_${index}`,
        type: 'userTask',
        name: '并行任务',
        description: '',
        condition: '',
        timeout: 300,
        retries: 0,
        params: '{}',
        nextSteps: [],
        parallelTasks: [],
        isRoot: false
      })
      this.$nextTick(() => this.markRootTasks())
    },

    removeStepReferences(removedId) {
      this.steps.forEach(s => {
        if (Array.isArray(s.nextSteps)) {
          s.nextSteps = s.nextSteps.filter(id => id !== removedId)
        }
        if (Array.isArray(s.parallelTasks)) {
          s.parallelTasks = s.parallelTasks.map(t => this.removeStepReferencesInTask(t, removedId))
        }
      })
    },

    removeStepReferencesInTask(task, removedId) {
      if (task && Array.isArray(task.nextSteps)) {
        task.nextSteps = task.nextSteps.filter(id => id !== removedId)
      }
      if (task && Array.isArray(task.parallelTasks)) {
        task.parallelTasks = task.parallelTasks.map(t => this.removeStepReferencesInTask(t, removedId))
      }
      return task
    },

    removeParallelTask(index) {
      if (!this.selectedStep || !Array.isArray(this.selectedStep.parallelTasks)) return
      this.selectedStep.parallelTasks.splice(index, 1)
    },

    // 自动标记根任务
    markRootTasks() {
      // 收集所有被引用的任务ID
      const referencedIds = new Set()

      const collectReferences = (tasks) => {
        if (!Array.isArray(tasks)) return
        tasks.forEach(task => {
          if (task && Array.isArray(task.nextSteps)) {
            task.nextSteps.forEach(id => referencedIds.add(id))
          }
          if (task && Array.isArray(task.parallelTasks)) {
            collectReferences(task.parallelTasks)
          }
        })
      }

      // 收集主流程中的引用
      collectReferences(this.steps)

      // 标记根任务：没有被任何任务引用的任务
      this.steps.forEach(step => {
        if (step) {
          step.isRoot = !referencedIds.has(step.id)
        }
      })
    },

    isParallelTaskNode(node) {
      if (!node) return false
      let found = false

      const walk = (tasks) => {
        if (!Array.isArray(tasks) || found) return
        tasks.forEach(t => {
          if (found || !t) return
          if (t === node) {
            found = true
            return
          }
          if (Array.isArray(t.parallelTasks)) {
            walk(t.parallelTasks)
          }
        })
      }

      this.steps.forEach(step => {
        if (found) return
        if (Array.isArray(step.parallelTasks)) {
          walk(step.parallelTasks)
        }
      })

      return found
    }

  }
}
</script>

<style lang="scss">
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
      overflow-x: auto;
      border: 2px dashed #ddd;
      min-width: 0;

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

        .workflow-tree {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 10px 0 30px;
          min-width: max-content;

          .roots-row {
            display: flex;
            gap: 32px;
            align-items: flex-start;
          }

          .wf-node {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }

          .node-card {
            width: 240px;
            background: #ffffff;
            border: 2px solid #d9d9d9;
            border-radius: 10px;
            padding: 10px 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
            transition: all 0.15s ease;
            cursor: pointer;
          }

          .node-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .node-card.active {
            border-color: #1890ff;
            box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
          }

          .node-card.t-userTask {
            border-left: 4px solid #409eff;
          }
          .node-card.t-process {
            border-left: 4px solid #67c23a;
          }
          .node-card.t-parallel {
            border-left: 4px solid #e6a23c;
          }
          .node-card.t-complete {
            border-left: 4px solid #909399;
          }

          .node-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }

          .node-type {
            font-size: 12px;
            font-weight: 700;
            color: #606266;
          }

          .node-actions {
            display: flex;
            gap: 2px;
          }

          .node-title {
            font-size: 14px;
            font-weight: 700;
            color: #1f2d3d;
            line-height: 1.3;
            word-break: break-all;
          }

          .node-sub {
            margin-top: 6px;
            font-size: 12px;
            color: #909399;
            word-break: break-all;
          }

          .wf-next {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 12px;
          }

          .wf-branches,
          .wf-parallel {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 14px;
          }

          .wf-children-row {
            display: flex;
            gap: 18px;
            align-items: flex-start;
            padding-top: 10px;
            min-width: max-content;
          }

          .wf-line-vert {
            width: 2px;
            height: 16px;
            background: #dcdfe6;
          }

          .wf-line-horz {
            height: 2px;
            width: calc(100% - 40px);
            background: #dcdfe6;
          }

          .wf-join {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
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
      width: 320px;
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

      .parallel-task-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .parallel-task-item {
        width: 100%;
      }

      .parallel-task-card {
        border: 1px solid #ebeef5;
        border-radius: 8px;

        .parallel-task-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #303133;
        }

        ::v-deep .parallel-task-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 16px;

          .el-form-item {
            margin-bottom: 8px;
          }

          .el-form-item:nth-child(n + 5) {
            grid-column: span 2;
          }
        }
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
