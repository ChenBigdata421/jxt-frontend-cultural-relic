<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div v-if="fields.no" class="search-item">
          <label class="search-label">{{ noLabel }}</label>
          <el-input
            v-model="searchForm.no"
            :placeholder="`请输入${noLabel}`"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div v-if="fields.name" class="search-item">
          <label class="search-label">{{ nameLabel }}</label>
          <el-input
            v-model="searchForm.name"
            :placeholder="`请输入${nameLabel}`"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div v-if="fields.org" class="search-item">
          <label class="search-label">管理组织</label>
          <treeselect
            v-model="searchForm.managerOrgId"
            :options="orgOptions"
            placeholder="请选择管理组织"
            @input="handleOrgChange"
          />
        </div>
        <div v-if="fields.user" class="search-item">
          <label class="search-label">管理人员</label>
          <el-select
            v-model="searchForm.managerId"
            placeholder="请选择管理人员"
            clearable
            @change="$forceUpdate()"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
            />
          </el-select>
        </div>
        <div v-if="fields.brand" class="search-item">
          <label class="search-label">品牌</label>
          <el-select
            v-model="searchForm.brandId"
            placeholder="请选择品牌"
            clearable
          >
            <el-option
              v-for="item in brandOptions"
              :key="item.id"
              :label="item.brandName"
              :value="item.id"
            />
          </el-select>
        </div>
        <div v-if="fields.status" class="search-item">
          <label class="search-label">状态</label>
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            clearable
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div v-if="fields.enableUse" class="search-item">
          <label class="search-label">是否可用</label>
          <el-select
            v-model="searchForm.enableUse"
            placeholder="是否可用"
            clearable
          >
            <el-option
              v-for="dict in enableUseOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <div v-if="fields.openStatus" class="search-item">
          <label class="search-label">启用状态</label>
          <el-select
            v-model="searchForm.openStatus"
            placeholder="启用状态"
            clearable
          >
            <el-option
              v-for="dict in openStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </div>
        <!-- New BWC filter fields -->
        <div v-if="fields.keyword" class="search-item">
          <label class="search-label">{{ keywordLabel }}</label>
          <el-input
            v-model="searchForm.keyword"
            :placeholder="`请输入${keywordLabel}`"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div v-if="fields.lifecycleStatus" class="search-item">
          <label class="search-label">生命周期状态</label>
          <el-select v-model="searchForm.lifecycleStatus" placeholder="生命周期状态" clearable>
            <el-option v-for="dict in lifecycleStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div v-if="fields.operabilityStatus" class="search-item">
          <label class="search-label">可用性</label>
          <el-select v-model="searchForm.operabilityStatus" placeholder="可用性" clearable>
            <el-option v-for="dict in operabilityStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div v-if="fields.assignmentStatus" class="search-item">
          <label class="search-label">分配状态</label>
          <el-select v-model="searchForm.assignmentStatus" placeholder="分配状态" clearable>
            <el-option v-for="dict in assignmentStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div v-if="fields.runtimeStatus" class="search-item">
          <label class="search-label">运行状态</label>
          <el-select v-model="searchForm.runtimeStatus" placeholder="运行状态" clearable>
            <el-option v-for="dict in runtimeStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div v-if="fields.bwcType" class="search-item">
          <label class="search-label">执法仪类型</label>
          <el-select v-model="searchForm.bwcType" placeholder="执法仪类型" clearable>
            <el-option v-for="dict in bwcTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div v-if="fields.vendor" class="search-item">
          <label class="search-label">供应商</label>
          <el-input v-model="searchForm.vendor" placeholder="请输入供应商" clearable @keyup.enter.native="handleSearch" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'EquipmentSearchInput',
  components: {
    Treeselect
  },
  props: {
    // 字段配置
    fields: {
      type: Object,
      default: () => ({
        no: true,
        name: true,
        org: true,
        user: true,
        brand: true,
        status: true,
        enableUse: false,
        openStatus: false,
        keyword: false,
        lifecycleStatus: false,
        operabilityStatus: false,
        assignmentStatus: false,
        runtimeStatus: false,
        bwcType: false,
        vendor: false
      })
    },
    // 标签配置
    labels: {
      type: Object,
      default: () => ({
        no: '编号',
        name: '名称',
        keyword: '关键词'
      })
    },
    // 选项数据
    orgOptions: {
      type: Array,
      default: () => []
    },
    userOptions: {
      type: Array,
      default: () => []
    },
    brandOptions: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => []
    },
    enableUseOptions: {
      type: Array,
      default: () => []
    },
    openStatusOptions: {
      type: Array,
      default: () => []
    },
    lifecycleStatusOptions: {
      type: Array,
      default: () => []
    },
    operabilityStatusOptions: {
      type: Array,
      default: () => []
    },
    assignmentStatusOptions: {
      type: Array,
      default: () => []
    },
    runtimeStatusOptions: {
      type: Array,
      default: () => []
    },
    bwcTypeOptions: {
      type: Array,
      default: () => []
    },
    // 表单字段映射
    fieldMapping: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchForm: {
        no: undefined,
        name: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        status: undefined,
        enableUse: undefined,
        openStatus: undefined,
        keyword: undefined,
        lifecycleStatus: undefined,
        operabilityStatus: undefined,
        assignmentStatus: undefined,
        runtimeStatus: undefined,
        bwcType: undefined,
        vendor: undefined
      }
    }
  },
  computed: {
    noLabel() {
      return this.labels.no || '编号'
    },
    nameLabel() {
      return this.labels.name || '名称'
    },
    keywordLabel() {
      return this.labels.keyword || '关键词'
    }
  },
  methods: {
    getSearchParams() {
      // 获取过滤空值后的搜索参数
      const searchParams = {}
      Object.keys(this.searchForm).forEach(key => {
        const value = this.searchForm[key]
        if (value !== undefined && value !== null && value !== '') {
          // 使用字段映射转换参数名
          const mappedKey = this.fieldMapping[key] || key
          searchParams[mappedKey] = value
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
        no: undefined,
        name: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        status: undefined,
        enableUse: undefined,
        openStatus: undefined,
        keyword: undefined,
        lifecycleStatus: undefined,
        operabilityStatus: undefined,
        assignmentStatus: undefined,
        runtimeStatus: undefined,
        bwcType: undefined,
        vendor: undefined
      }
      this.$emit('reset')
    },
    handleOrgChange(value) {
      this.$emit('org-change', value)
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/components/search.scss: .search-row, .search-item, .search-label
-->
