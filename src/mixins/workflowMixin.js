/**
 * 工作流处理 Mixin
 * 提供工作流启动、任务处理等通用功能
 */
import { listWorkflows, getWorkflow } from '@/api/process/workflow'
import { startInstance, getInstanceTasks } from '@/api/process/instance'
import { getTask, approveTask, rejectTask } from '@/api/process/task'

export default {
  data() {
    return {
      // 工作流相关
      currentWorkflowId: null,
      currentInstanceId: null,
      currentTaskId: null,
      currentTask: null,
      isFirstTask: false,

      // 任务处理表单
      processForm: {
        task_name: '',
        workflow_name: '',
        priority: 'medium',
        task_data: {},
        previous_tasks_history: [],
        form_fields: [],
        formData: {},
        comment: '',
        output: '',
        rejection_info: null
      },

      // 表单验证规则
      processRules: {}
    }
  },

  methods: {
    /**
     * 启动工作流实例
     * @param {String} workflowName - 工作流名称
     * @param {Object} inputData - 输入数据
     * @param {Function} onSuccess - 成功回调 (taskId) => {}
     * @param {Function} onError - 失败回调 (error) => {}
     */
    async startWorkflowInstance(workflowName, inputData, onSuccess, onError) {
      try {
        // 1. 查询工作流列表
        const workflowsResponse = await listWorkflows({ limit: 100, offset: 0 })

        if (workflowsResponse.code !== 200) {
          throw new Error(workflowsResponse.msg || '查询工作流失败')
        }

        const workflows = workflowsResponse.data.items || workflowsResponse.data || []
        const workflow = workflows.find(wf => wf.name === workflowName)

        if (!workflow) {
          throw new Error(`未找到"${workflowName}"工作流，请先创建该工作流`)
        }

        this.currentWorkflowId = workflow.id

        // 2. 创建工作流实例（后端会自动创建第一个任务）
        const instanceResponse = await startInstance({
          workflow_id: workflow.id,
          input: inputData
        })

        if (instanceResponse.code !== 200) {
          throw new Error(instanceResponse.msg || '创建工作流实例失败')
        }

        const instanceId = instanceResponse.data.id || instanceResponse.data
        this.currentInstanceId = instanceId
        //this.msgSuccess('工作流实例创建成功，正在查询任务...')

        // 3. 等待500ms确保后端任务创建完成
        await new Promise(resolve => setTimeout(resolve, 500))

        // 4. 查询该实例的任务列表
        const tasksResponse = await getInstanceTasks(instanceId, { limit: 10, offset: 0 })

        if (tasksResponse.code !== 200) {
          throw new Error(tasksResponse.msg || '查询任务失败')
        }

        const tasks = tasksResponse.data.items || tasksResponse.data || []
        const pendingTask = tasks.find(t => t.status === 'pending')

        if (pendingTask) {
          //this.msgSuccess('任务已创建')
          if (onSuccess) {
            onSuccess(pendingTask.id)
          }
        } else {
          throw new Error('未找到待办任务，请到"我的待办"中查看')
        }
      } catch (error) {
        console.error('启动工作流失败:', error)
        this.msgError(error.message || '启动工作流失败')
        if (onError) {
          onError(error)
        }
      }
    },

    /**
     * 加载任务详情并准备处理表单
     * @param {String} taskId - 任务ID
     * @param {Function} onReady - 准备完成回调 (processForm) => {}
     */
    async loadTaskForProcessing(taskId, onReady) {
      try {
        this.currentTaskId = taskId

        // 1. 获取任务详情
        const taskResponse = await getTask(taskId)

        if (taskResponse.code !== 200) {
          throw new Error(taskResponse.msg || '获取任务详情失败')
        }

        const task = taskResponse.data
        this.currentTask = task
        this.currentInstanceId = task.instance_id

        // 2. 获取工作流定义
        const workflowResponse = await getWorkflow(task.workflow_id)

        if (workflowResponse.code !== 200) {
          throw new Error(workflowResponse.msg || '获取工作流定义失败')
        }

        const workflow = workflowResponse.data

        // 3. 解析工作流定义
        let definition = {}
        try {
          definition = typeof workflow.definition === 'string'
            ? JSON.parse(workflow.definition)
            : workflow.definition
        } catch (e) {
          console.error('解析工作流定义失败:', e)
        }

        // 4. 判断是否是第一个任务
        if (definition.steps && definition.steps.length > 0) {
          const firstStepId = definition.steps[0].id
          this.isFirstTask = task.task_key === firstStepId
        } else {
          this.isFirstTask = false
        }

        // 5. 解析任务数据（先解析，因为表单数据需要用到）
        const { taskData, rejectionInfo, previousTasksHistory } = this.parseTaskData(task)

        // 6. 解析表单数据（传入 taskData 以获取初始值）
        const { formFields, formData } = this.parseTaskFormData(task, taskData)

        // 7. 构建处理表单
        this.processForm = {
          task_name: task.task_name,
          workflow_name: task.workflow_name,
          priority: task.priority || 'medium',
          task_data: taskData,
          previous_tasks_history: previousTasksHistory,
          form_fields: formFields,
          formData: formData,
          comment: '',
          output: '',
          rejection_info: rejectionInfo
        }

        // 8. 动态生成表单验证规则
        this.generateFormRules(formFields)

        if (onReady) {
          onReady(this.processForm)
        }
      } catch (error) {
        console.error('加载任务失败:', error)
        this.msgError(error.message || '加载任务失败')
      }
    },

    /**
     * 解析任务表单数据
     */
    parseTaskFormData(task, taskData = {}) {
      // 解析 form_data
      let formDataObj = {}
      if (task.form_data) {
        try {
          if (typeof task.form_data === 'string') {
            formDataObj = JSON.parse(task.form_data)
          } else if (typeof task.form_data === 'object') {
            formDataObj = task.form_data
          }
        } catch (e) {
          console.error('解析 form_data 失败:', e)
        }
      }

      // 解析 form_fields
      let formFields = []
      if (formDataObj && formDataObj.form_fields) {
        formFields = formDataObj.form_fields
      }

      // 初始化表单数据对象
      const formData = {}

      try {
        formFields.forEach(field => {
          // 特殊处理：approved 字段默认为 true，除非 taskData 中明确设置了值
          if (field === 'approved') {
            // 如果 taskData 中没有 approved 或值为 null/undefined，默认为 true
            if (taskData[field] === undefined || taskData[field] === null) {
              formData[field] = true
            } else {
              formData[field] = taskData[field]
            }
          }
          // 优先从 taskData 中获取字段值，如果没有则使用默认值
          else if (taskData && taskData[field] !== undefined && taskData[field] !== null) {
            formData[field] = taskData[field]
          } else {
            const fieldType = this.getFieldTypeForInit(field)
            if (fieldType === 'boolean') {
              formData[field] = false
            } else if (fieldType === 'number') {
              formData[field] = null
            } else {
              formData[field] = ''
            }
          }
        })
      } catch (error) {
        console.error('❌ 初始化表单数据时出错:', error)
      }
      return { formFields, formData }
    },

    /**
     * 解析任务数据
     */
    parseTaskData(task) {
      let taskData = {}
      let rejectionInfo = null
      let previousTasksHistory = []

      if (task.task_data) {
        try {
          if (typeof task.task_data === 'string') {
            taskData = JSON.parse(task.task_data)
            if (typeof taskData === 'string') {
              taskData = JSON.parse(taskData)
            }
          } else if (typeof task.task_data === 'object' && task.task_data !== null) {
            taskData = task.task_data
          }

          if (taskData.rejected_by) {
            rejectionInfo = {
              rejected_by: taskData.rejected_by,
              rejected_at: taskData.rejected_at,
              rejection_reason: taskData.rejection_reason,
              rejected_task_id: taskData.rejected_task_id
            }
          }

          if (taskData.previous_tasks_history && Array.isArray(taskData.previous_tasks_history)) {
            previousTasksHistory = taskData.previous_tasks_history
          }
        } catch (e) {
          console.error('解析任务数据失败:', e)
          taskData = {}
        }
      }

      const finalTaskData = taskData && typeof taskData === 'object' ? taskData : {}

      return { taskData: finalTaskData, rejectionInfo, previousTasksHistory }
    },

    /**
     * 提交任务审批通过
     * @param {String} formRef - 表单引用名称
     * @param {Function} onSuccess - 成功回调
     */
    async submitTaskApproval(formRef = 'taskProcessForm', onSuccess) {
      this.$refs[formRef].validate(async valid => {
        if (valid) {
          try {
            // 构建输出数据
            let outputData = ''
            if (this.processForm.form_fields && this.processForm.form_fields.length > 0) {
              outputData = JSON.stringify(this.processForm.formData)
            } else {
              outputData = this.processForm.output || '{}'
            }

            const data = {
              comment: this.processForm.comment || '审批通过',
              output: outputData
            }

            const response = await approveTask(this.currentTaskId, data)

            if (response.code === 200) {
              this.msgSuccess('申请提交成功')
              if (onSuccess) {
                onSuccess()
              }
            } else {
              this.msgError(response.msg || '申请提交失败')
            }
          } catch (error) {
            this.msgError('申请提交失败：' + (error.message || '未知错误'))
          }
        }
      })
    },

    /**
     * 提交任务驳回
     * @param {String} formRef - 表单引用名称
     * @param {Function} onSuccess - 成功回调
     */
    async submitTaskRejection(formRef = 'taskProcessForm', onSuccess) {
      this.$refs[formRef].validate(async valid => {
        if (valid) {
          try {
            await this.$confirm('确认驳回该任务吗？', '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })

            const data = {
              comment: this.processForm.comment,
              reason: this.processForm.comment
            }

            const response = await rejectTask(this.currentTaskId, data)

            if (response.code === 200) {
              this.msgSuccess('已驳回')
              if (onSuccess) {
                onSuccess()
              }
            } else {
              this.msgError(response.msg || '驳回失败')
            }
          } catch (error) {
            if (error !== 'cancel') {
              this.msgError('驳回失败：' + (error.message || '未知错误'))
            }
          }
        }
      })
    },

    /**
     * 动态生成表单验证规则
     */
    generateFormRules(formFields) {
      const rules = {}

      // 为每个表单字段添加验证规则
      formFields.forEach(field => {
        const ruleKey = `formData.${field}`
        rules[ruleKey] = [
          { required: true, message: `${this.getFieldLabel(field)}不能为空`, trigger: 'blur' }
        ]
      })

      this.processRules = rules
    },

    /**
     * 获取字段标签
     */
    getFieldLabel(field) {
      const labelMap = {
        // 通用字段
        'applicant': '申请人',
        'description': '描述',
        'comment': '备注',
        'reason': '原因',
        'remark': '备注',
        'note': '说明',
        'priority': '优先级',
        'status': '状态',

        // 文档相关
        'document_id': '文档编号',
        'document_name': '文档名称',
        'document_type': '文档类型',
        'document_number': '文档编号',
        'file_name': '文件名称',
        'file_path': '文件路径',
        'file_size': '文件大小',
        'attachment': '附件',

        // 物证相关
        'evidence_id': '物证编号',
        'evidence_name': '物证名称',
        'evidence_type': '物证类型',
        'evidence_number': '物证编号',
        'storage_location': '存储位置',
        'storage_place': '存放地点',
        'handler': '经手人',
        'keeper': '保管人',
        'receiver': '接收人',

        // 审批相关
        'approver': '审批人',
        'approval_date': '审批日期',
        'approval_time': '审批时间',
        'approval_result': '审批结果',
        'approval_opinion': '审批意见',
        'approved': '是否批准',
        'reject_reason': '驳回原因',

        // 用户相关
        'user_id': '用户ID',
        'user_name': '用户名',
        'username': '用户名',
        'assignee': '处理人',
        'operator': '操作人',
        'creator': '创建人',
        'updater': '更新人',

        // 组织相关
        'department': '部门',
        'department_id': '部门ID',
        'department_name': '部门名称',
        'organization': '组织',
        'team': '团队',

        // 时间相关
        'date': '日期',
        'time': '时间',
        'datetime': '日期时间',
        'start_date': '开始日期',
        'end_date': '结束日期',
        'start_time': '开始时间',
        'end_time': '结束时间',
        'deadline': '截止日期',
        'due_date': '到期日期',
        'created_at': '创建时间',
        'updated_at': '更新时间',
        'deleted_at': '删除时间',
        'completed_at': '完成时间',

        // 联系方式
        'phone': '电话',
        'mobile': '手机',
        'telephone': '电话',
        'email': '邮箱',
        'address': '地址',
        'url': '网址',
        'website': '网站',

        // 数量金额
        'amount': '金额',
        'quantity': '数量',
        'count': '数量',
        'number': '编号',
        'code': '编码',
        'price': '价格',
        'total': '总计',

        // 状态标识
        'deleted': '是否删除',
        'submitted': '是否提交',
        'completed': '是否完成',
        'enabled': '是否启用',
        'active': '是否激活',
        'verified': '是否验证',
        'confirmed': '是否确认',

        // 其他
        'result': '结果',
        'title': '标题',
        'content': '内容',
        'category': '分类',
        'tag': '标签',
        'level': '级别',
        'grade': '等级',
        'score': '分数',
        'version': '版本'
      }
      return labelMap[field] || field
    },

    /**
     * 获取字段类型
     */
    getFieldType(field) {
      // 日期相关
      if (field.includes('date') || field.includes('time')) {
        if (field.includes('datetime')) {
          return 'datetime'
        } else if (field.includes('time')) {
          return 'time'
        } else {
          return 'date'
        }
      }

      // 数字相关
      if (field.includes('amount') || field.includes('price') || field.includes('count') || field.includes('number')) {
        return 'number'
      }

      // 布尔相关
      if (field.includes('is_') || field.includes('has_') || field.includes('enable') || field === 'approved') {
        return 'boolean'
      }

      // 文本域
      if (field.includes('reason') || field.includes('opinion') || field.includes('description') || field.includes('remark') || field.includes('content')) {
        return 'textarea'
      }

      // 邮箱
      if (field.includes('email')) {
        return 'email'
      }

      // 电话
      if (field.includes('phone') || field.includes('tel') || field.includes('mobile')) {
        return 'tel'
      }

      // URL
      if (field.includes('url') || field.includes('link')) {
        return 'url'
      }

      // 默认文本
      return 'text'
    },

    /**
     * 获取字段占位符
     */
    getFieldPlaceholder(field) {
      const label = this.getFieldLabel(field)
      const type = this.getFieldType(field)

      if (type === 'date') {
        return '请选择日期'
      } else if (type === 'datetime') {
        return '请选择日期时间'
      } else if (type === 'time') {
        return '请选择时间'
      } else if (type === 'number') {
        return `请输入${label}`
      } else if (type === 'textarea') {
        return `请输入${label}`
      } else {
        return `请输入${label}`
      }
    },

    /**
     * 获取字段初始化类型
     */
    getFieldTypeForInit(field) {
      const type = this.getFieldType(field)
      if (type === 'number') {
        return 'number'
      } else if (type === 'boolean') {
        return 'boolean'
      } else {
        return 'string'
      }
    }
  }
}


