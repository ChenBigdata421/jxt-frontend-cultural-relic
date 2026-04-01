<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">存储编号</label>
          <el-input
            v-model="searchForm.storageSiteNo"
            placeholder="请输入存储编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">存储名称</label>
          <el-input
            v-model="searchForm.storageSiteName"
            placeholder="请输入存储名称"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">管理组织</label>
          <treeselect
            v-model="searchForm.managerOrgId"
            :options="orgOptions"
            placeholder="请选择管理组织"
            @input="handleOrgChange"
          />
        </div>
        <div class="search-item">
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
        <div class="search-item">
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
        <div class="search-item">
          <label class="search-label">启用状态</label>
          <el-select
            v-model="searchForm.openStatus"
            placeholder="请选择启用状态"
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
        <div class="search-item">
          <label class="search-label">状态</label>
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
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
      </div>
    </div>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'StorageSearchInput',
  components: {
    Treeselect
  },
  props: {
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
    openStatusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        storageSiteNo: undefined,
        storageSiteName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        openStatus: undefined,
        status: undefined
      }
    }
  },
  methods: {
    getSearchParams() {
      // 获取过滤空值后的搜索参数
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
        storageSiteNo: undefined,
        storageSiteName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        brandId: undefined,
        openStatus: undefined,
        status: undefined
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
