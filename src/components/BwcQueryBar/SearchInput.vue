<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">执法仪编号</label>
          <el-input
            v-model="searchForm.bwcNo"
            placeholder="请输入执法仪编号"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </div>
        <div class="search-item">
          <label class="search-label">执法仪名称</label>
          <el-input
            v-model="searchForm.bwcName"
            placeholder="请输入执法仪名称"
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
          <label class="search-label">领用状态</label>
          <el-select
            v-model="searchForm.useState"
            placeholder="领用状态"
            clearable
          >
            <el-option
              v-for="dict in requisitionStatusOptions"
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
  name: 'BwcSearchInput',
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
    requisitionStatusOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchForm: {
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        useState: undefined
      }
    }
  },
  watch: {
    'searchForm.managerOrgId': function(newVal) {
      // 通知父组件管理组织变化，用于加载对应的管理人员
      this.$emit('org-change', newVal)
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
        bwcNo: undefined,
        bwcName: undefined,
        managerOrgId: undefined,
        managerId: undefined,
        useState: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>

<!--
  样式说明：本组件全部使用全局样式
  全局样式位置：
  - src/styles/components/search.scss: .search-row, .search-item, .search-label
-->
