<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">任务名称</label>
          <el-input
            v-model="searchForm.taskName"
            placeholder="请输入任务名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">工作流</label>
          <el-select
            v-model="searchForm.workflowId"
            placeholder="请选择工作流"
            clearable
          >
            <el-option
              v-for="opt in workflowOptions"
              :key="opt.workflowId"
              :label="opt.name"
              :value="opt.workflowId"
            />
          </el-select>
        </div>
        <div class="search-item">
          <label class="search-label">任务状态</label>
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="待处理" value="pending" />
            <el-option label="已认领" value="claimed" />
            <el-option label="已完成" value="completed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </div>
        <div class="search-item">
          <label class="search-label">审批组织</label>
          <treeselect
            v-model="searchForm.assignee"
            :options="orgOptions"
            placeholder="请选择审批组织"
            clearable
            @input="handleOrgSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'TaskSearchInput',
  components: {
    Treeselect
  },
  props: {
    workflowOptions: {
      type: Array,
      default: () => []
    },
    orgOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        taskName: undefined,
        workflowId: undefined,
        status: undefined,
        assignee: undefined
      }
    }
  },
  methods: {
    async handleOrgSelect(orgId) {
      this.$emit('org-select', orgId)
    },
    getSearchParams() {
      const searchParams = {}
      Object.keys(this.searchForm).forEach(key => {
        const value = this.searchForm[key]
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value
        }
      })
      return searchParams
    },
    handleSearch() {
      const searchParams = this.getSearchParams()
      this.$emit('search', searchParams)
    },
    handleReset() {
      this.searchForm = {
        taskName: undefined,
        workflowId: undefined,
        status: undefined,
        assignee: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>
