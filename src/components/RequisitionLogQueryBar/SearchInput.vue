<template>
  <div class="search-input-wrapper">
    <div class="quick-search-form">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">领用人组织</label>
          <treeselect
            v-model="searchForm.requisitionerOrgId"
            :options="orgOptions"
            placeholder="请选择领用人组织"
          />
        </div>
        <div class="search-item">
          <label class="search-label">领用人</label>
          <el-select
            v-model="searchForm.requisitionerId"
            placeholder="请选择领用人"
            clearable
            filterable
          >
            <el-option
              v-for="user in userOptions"
              :key="user.userId"
              :label="user.userName"
              :value="user.userId"
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
  name: 'RequisitionLogSearchInput',
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
    }
  },
  data() {
    return {
      searchForm: {
        requisitionerOrgId: undefined,
        requisitionerId: undefined
      }
    }
  },
  watch: {
    'searchForm.requisitionerOrgId': function(newVal) {
      if (newVal) {
        this.searchForm.requisitionerId = undefined
      }
      this.$emit('org-change', newVal)
    }
  },
  methods: {
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
        requisitionerOrgId: undefined,
        requisitionerId: undefined
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
