<template>
  <div class="resource-tree-container">
    <div class="tree-search">
      <el-input
        v-model="searchStr"
        size="mini"
        :placeholder="searchPlaceholder"
        prefix-icon="el-icon-search"
        clearable
        @input="handleSearch"
      />
    </div>
    <div v-if="isSearchMode" class="search-results">
      <div v-loading="loading" class="search-results-list">
        <ul v-if="searchResults.length > 0" role="listbox">
          <li
            v-for="item in searchResults"
            :key="item.id"
            class="search-item"
            role="option"
            tabindex="0"
            @click="handleSearchResultClick(item)"
            @keydown.enter="handleSearchResultClick(item)"
          >
            <i v-if="item.type === 0" class="el-icon-folder" style="color: #409EFF; font-size: 18px;" aria-hidden="true" />
            <i v-else :class="item.isOnline ? 'el-icon-video-camera online' : 'el-icon-video-camera offline'" aria-hidden="true" />
            <div class="search-item-text">
              <div class="search-item-primary">{{ item.name }}</div>
              <div class="search-item-secondary">{{ item.deviceId || item.gbDeviceId }}</div>
            </div>
          </li>
        </ul>
        <div v-else class="search-empty">
          {{ searchStr ? '未找到结果' : '请输入关键字' }}
        </div>
      </div>
      <el-pagination
        v-if="searchTotal > searchPageSize"
        small
        layout="prev, pager, next"
        :current-page="searchPage"
        :page-size="searchPageSize"
        :total="searchTotal"
        @current-change="handleSearchPageChange"
      />
    </div>
    <el-tree
      v-else
      ref="tree"
      :key="apiType"
      v-loading="loading"
      :data="treeData"
      :props="treeProps"
      :load="loadNode"
      lazy
      node-key="treeId"
      :default-expanded-keys="['root']"
      @node-click="handleNodeClick"
      @node-contextmenu="(e, data, node) => $emit('node-contextmenu', e, data, node)"
    >
      <template v-slot:default="{ node, data }">
        <span class="tree-node">
          <span :class="data.type === 1 ? (data.status === 'ON' ? 'device-online' : 'device-offline') : ''">
            {{ data.name }}<template v-if="showCode && data.type === 0 && data.deviceId"> ({{ data.deviceId }})</template>
          </span>
          <i v-if="data.type === 1 && data.hasPosition" class="el-icon-coordinate" style="color: #67C23A; font-size: 12px; margin-left: 4px;" />
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script>
import { getRegionTreeList, getGroupTreeList, getList, queryRegionTree, queryGroupTree } from '@/api/wvp/channel'

const TREE_API_MAP = {
  region: { treeList: getRegionTreeList, searchTree: queryRegionTree, searchPlaceholder: '搜索区域/通道' },
  group: { treeList: getGroupTreeList, searchTree: queryGroupTree, searchPlaceholder: '搜索分组/通道' }
}

export default {
  name: 'ResourceTree',
  props: {
    apiType: {
      type: String,
      required: true,
      validator: v => ['region', 'group'].includes(v)
    },
    showPosition: { type: Boolean, default: false },
    hasChannel: { type: Boolean, default: true },
    showCode: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      searchStr: '',
      isSearchMode: false,
      searchResults: [],
      searchPage: 1,
      searchPageSize: 20,
      searchTotal: 0,
      treeData: [],
      treeProps: { label: 'name', children: 'children', isLeaf: 'isLeaf' },
      debounceTimer: null
    }
  },
  computed: {
    searchPlaceholder() {
      return TREE_API_MAP[this.apiType].searchPlaceholder
    },
    treeListApi() {
      return TREE_API_MAP[this.apiType].treeList
    }
  },
  watch: {
    showCode() { this.$forceUpdate() },
    apiType() {
      this.searchStr = ''
      this.isSearchMode = false
      this.searchResults = []
    }
  },
  created() {
    this.treeData = [{
      treeId: 'root',
      name: '根资源组',
      type: 0,
      isLeaf: false,
      deviceId: ''
    }]
  },
  beforeDestroy() { if (this.debounceTimer) clearTimeout(this.debounceTimer) },
  methods: {
    loadNode(node, resolve) {
      if (node.level === 0) {
        resolve(this.treeData)
        return
      }
      const parentDeviceId = node.data.deviceId || ''
      if (node.data.type === 1) {
        resolve([])
        return
      }
      if (this.apiType === 'region' && parentDeviceId.length > 8) {
        resolve([])
        return
      }
      this.loading = true
      const parentData = node.data || {}
      this.treeListApi({ parent: node.data.id, hasChannel: this.hasChannel }).then(res => {
        const data = res.data || res
        const list = Array.isArray(data) ? data : []
        resolve(list.map(item => {
          const bg = item.businessGroup || ''
          const did = item.deviceId || item.id
          const isBgNode = bg && did === bg
          const parentIsBg = parentData.deviceId && parentData.deviceId === parentData.businessGroup
          return {
            treeId: this.apiType + '_' + did,
            name: item.name || '未命名',
            type: item.type,
            isLeaf: item.type === 1,
            deviceId: did,
            status: item.status,
            hasPosition: !!(item.gbLongitude && item.gbLatitude),
            id: item.id || item.gbId,
            gbId: item.gbId || item.id,
            parentDeviceId: item.parentDeviceId || '',
            parentId: item.parentId || undefined,
            businessGroup: bg,
            businessGroupName: isBgNode
              ? item.name
              : (parentIsBg ? parentData.name : (parentData.businessGroupName || ''))
          }
        }))
      }).catch(() => {
        this.$message.error('加载失败')
        resolve([])
      }).finally(() => { this.loading = false })
    },
    handleNodeClick(data) {
      this.$emit('node-click', data)
      if (data.type === 1) this.$emit('clickEvent', data.gbId || data.id)
    },
    handleSearch() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      if (!this.searchStr || this.searchStr.trim() === '') {
        this.isSearchMode = false
        this.searchResults = []
        return
      }
      this.isSearchMode = true
      this.searchPage = 1
      this.debounceTimer = setTimeout(() => { this.doSearch() }, 300)
    },
    doSearch() {
      this.loading = true
      if (!this.hasChannel) {
        // Org management mode: search regions/groups
        TREE_API_MAP[this.apiType].searchTree({
          query: this.searchStr,
          page: this.searchPage,
          count: this.searchPageSize
        }).then(res => {
          const data = res.data || res
          this.searchResults = (data.list || []).map(item => ({
            name: item.name || '未命名',
            deviceId: item.deviceId || item.id || '',
            type: 0, isLeaf: false, id: item.id, gbId: item.id,
            status: '', isOnline: false, hasPosition: false
          }))
          this.searchTotal = data.total || 0
        }).catch(() => { this.searchResults = [] }).finally(() => { this.loading = false })
      } else {
        // Channel mode: search channels
        getList({ page: this.searchPage, count: this.searchPageSize, query: this.searchStr }).then(res => {
          const data = res.data || res
          this.searchResults = (data.list || []).map(item => ({
            name: item.gbName || '未命名',
            gbDeviceId: item.gbDeviceId || '',
            gbParentId: item.gbParentId || '',
            type: 1, isLeaf: true, id: item.gbId, gbId: item.gbId,
            status: item.gbStatus, isOnline: item.gbStatus === 'ON',
            hasPosition: !!(item.gbLongitude && item.gbLatitude)
          }))
          this.searchTotal = data.total || 0
        }).catch(() => { this.searchResults = [] }).finally(() => { this.loading = false })
      }
    },
    handleSearchPageChange(page) { this.searchPage = page; this.doSearch() },
    handleSearchResultClick(row) {
      if (row.type === 0) {
        // 目录节点：选中节点并退出搜索模式，让树重新可见
        this.searchStr = ''
        this.isSearchMode = false
        this.searchResults = []
        this.$emit('node-click', row)
      } else {
        this.$emit('clickEvent', row.gbId || row.id)
      }
    },
    refresh(id) {
      if (this.$refs.tree) {
        const node = this.$refs.tree.getNode(id)
        if (node) {
          node.loaded = false; node.loading = false; node.isLeaf = false; node.childNodes = []
          node.loadData(() => {})
        }
      }
    }
  }
}
</script>

<style scoped>
/* #67C23A = el-color-success  #252525 = el-text-color-primary  #727272 = el-text-color-regular */
.resource-tree-container { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.tree-search { margin-bottom: 8px; }
.search-results { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.search-results .el-pagination { padding: 8px 0; text-align: center; }
.search-results-list { flex: 1; overflow: auto; }
.search-results-list ul { list-style: none; margin: 0; padding: 10px; }
.search-empty { padding: 20px 0; text-align: center; color: #909399; font-size: 12px; }
.search-item {
  display: grid;
  grid-template-columns: 26px 1fr;
  height: 40px;
  align-items: center;
  cursor: pointer;
  margin-bottom: 6px;
  border-radius: 4px;
  padding: 0 4px;
}
.search-item:hover,
.search-item:focus { background-color: #f5f7fa; outline: none; }
.search-item:active { background-color: #e6e8eb; }
.search-item .online { color: #409EFF; font-size: 20px; }
.search-item .offline { color: #808181; font-size: 20px; }
.search-item-text { overflow: hidden; }
.search-item-primary {
  margin-left: 4px;
  margin-bottom: 3px;
  font-size: 15px;
  color: #252525;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-item-secondary {
  margin-left: 4px;
  font-size: 13px;
  color: #808181;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tree-node { font-size: 13px; display: inline-flex; align-items: center; }
.device-online { color: #252525; }
.device-offline { color: #727272; }
</style>
