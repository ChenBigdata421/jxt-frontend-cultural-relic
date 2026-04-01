<template>
  <div class="advanced-filter-wrapper">
    <el-collapse v-model="activeNames" class="advanced-filter-panel">
      <el-collapse-item name="filters">
        <template slot="title">
          <span class="filter-title">
            <i class="el-icon-arrow-right collapse-icon" />
            高级筛选
          </span>
        </template>

        <!-- 时间范围 - 复选框 + 日期范围组合 -->
        <div class="filter-section filter-section-full">
          <div class="section-label">时间范围</div>
          <div class="time-range-group">
            <div v-for="range in timeRanges" :key="range.key" class="time-range-item">
              <el-checkbox
                v-model="range.enabled"
                @change="handleTimeRangeToggle(range)"
              >
                {{ range.label }}
              </el-checkbox>
              <el-date-picker
                v-if="range.enabled"
                v-model="timeValues[range.key]"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="time-range-picker"
                @change="handleTimeChange(range.key)"
              />
            </div>
          </div>
        </div>

        <!-- 其他筛选条件 - 两列布局 -->
        <div class="filter-row">
          <!-- 组织部门 -->
          <div class="filter-section org-section">
            <label class="section-label-inline">组织部门</label>
            <treeselect
              v-model="filterParams.orgId"
              :options="orgOptions"
              placeholder="请选择组织部门"
              :append-to-body="true"
              :open-on-focus="false"
            />
          </div>

          <!-- 角色 -->
          <div class="filter-section">
            <label class="section-label-inline">角色</label>
            <el-select
              v-model="filterParams.roleId"
              placeholder="请选择角色"
              clearable
              class="full-width"
              :popper-append-to-body="true"
            >
              <el-option
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status == 1"
              />
            </el-select>
          </div>
        </div>

        <div class="filter-row">
          <!-- 岗位 -->
          <div class="filter-section">
            <label class="section-label-inline">岗位</label>
            <el-select
              v-model="filterParams.postId"
              placeholder="请选择岗位"
              clearable
              class="full-width"
              :popper-append-to-body="true"
            >
              <el-option
                v-for="item in postOptions"
                :key="item.postId"
                :label="item.postName"
                :value="item.postId"
                :disabled="item.status == 1"
              />
            </el-select>
          </div>

          <!-- 邮箱 -->
          <div class="filter-section">
            <label class="section-label-inline">邮箱</label>
            <el-input
              v-model="filterParams.email"
              placeholder="请输入邮箱"
              clearable
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listRole } from '@/api/admin/sys-role'
import { listPost } from '@/api/admin/sys-post'

export default {
  name: 'UserAdvancedFilterPanel',
  components: {
    Treeselect
  },
  props: {
    orgOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeNames: [], // 默认折叠
      timeRanges: [
        { key: 'createdAtRange', label: '创建时间', enabled: false }
      ],
      timeValues: {},
      roleOptions: [],
      postOptions: [],
      filterParams: {
        orgId: undefined,
        roleId: undefined,
        postId: undefined,
        email: undefined
      }
    }
  },
  created() {
    // 加载角色和岗位选项
    listRole({ pageSize: 1000 }).then((response) => {
      this.roleOptions = response.data.list || []
    })
    listPost({ pageSize: 1000 }).then((response) => {
      this.postOptions = response.data.list || []
    })
  },
  methods: {
    handleTimeRangeToggle(range) {
      if (!range.enabled) {
        this.$set(this.timeValues, range.key, null)
      }
    },
    handleTimeChange(key) {
      // 等待用户点击"搜索"按钮
    },
    handleReset() {
      this.timeRanges.forEach(range => {
        range.enabled = false
      })
      this.timeValues = {}
      this.filterParams = {
        orgId: undefined,
        roleId: undefined,
        postId: undefined,
        email: undefined
      }
      this.$emit('reset')
    },
    getFilterData() {
      const data = { ...this.filterParams }

      // 处理时间范围
      this.timeRanges.forEach(range => {
        if (range.enabled && this.timeValues[range.key]) {
          const [start, end] = this.timeValues[range.key]
          const fieldKey = range.key.replace('Range', '')
          data[fieldKey + 'Start'] = start
          data[fieldKey + 'End'] = end
        }
      })

      return data
    }
  }
}
</script>
